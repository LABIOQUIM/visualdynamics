import os
from flask_restful import Resource, reqparse
from server.config import Config
from server.utils.create_folders import create_folders
from server.utils.find_binaries import check_grace, check_gromacs
from werkzeug.datastructures import FileStorage


class GenerateAPO(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "file_pdb", required=True, type=FileStorage, location="files"
        )
        parser.add_argument("force_field", required=True, type=str, location="form")
        parser.add_argument("water_model", required=True, type=str, location="form")
        parser.add_argument("box_type", required=True, type=str, location="form")
        parser.add_argument("box_distance", required=True, type=str, location="form")
        parser.add_argument("neutralize", required=True, type=bool, location="form")
        parser.add_argument("double", required=True, type=bool, location="form")
        parser.add_argument("ignore", required=True, type=bool, location="form")
        parser.add_argument("bootstrap", required=True, type=str, location="form")
        parser.add_argument("username", required=True, type=str, location="form")

        args = parser.parse_args()

        filename, ext = os.path.splitext(os.path.basename(args["file_pdb"].filename))

        if args["bootstrap"] == "true":
            gmx = check_gromacs()
            grace = check_grace()

            simulation_folder = os.path.abspath(
                os.path.join(
                    Config.UPLOAD_FOLDER,
                    args["username"],
                    "APO"
                )
            )

            if create_folders(simulation_folder) is "running-or-enqueued":
                return {"status": "roe"}

            args["file_pdb"].save(
                os.path.join(simulation_folder, "run", args["file_pdb"].filename)
            )

            file_molecule_name = os.path.abspath(
                os.path.join(simulation_folder, "molecule.name")
            )

            with open(file_molecule_name, "w") as f:
                f.write(f'{args["file_pdb"].filename}\n')
        else:
            gmx = "gmx"
            grace = "grace"

        commands = [
            "#topology\n",
            f"{gmx} pdb2gmx -f \"{filename}{ext}\" -o \"{filename}.gro\" -p \"{filename}.top\" -ff {args['force_field']} -water {args['water_model']} {'-ignh -missing' if args['ignore'] else ''}\n",
            f"{gmx} editconf -f \"{filename}.gro\" -c -d {args['box_distance']} -bt {args['box_type']} -o\n\n",
            "#solvate\n",
            f'{gmx} solvate -cp out.gro -cs -p "{filename}.top" -o "{filename}_box"\n\n',
            "#ions\n",
            f'{gmx} grompp -f ions.mdp -c "{filename}_box.gro" -p "{filename}.top" -o "{filename}_charged" -maxwarn 2\n',
        ]

        if args["neutralize"]:
            commands.extend(
                [
                    f'echo \'SOL\' | {gmx} genion -s "{filename}_charged.tpr" -o "{filename}_charged" -p "{filename}.top" -neutral\n\n',
                    "#minimizationsteepdesc\n",
                    f'{gmx} grompp -f PME_em.mdp -c "{filename}_charged.gro" -p "{filename}.top" -o "{filename}_charged" -maxwarn 2\n',
                    f'{gmx} mdrun -nt 3 -v -s "{filename}_charged.tpr" -deffnm "{filename}_sd_em"\n',
                    f'echo \'10 0\' | {gmx} energy -f "{filename}_sd_em.edr" -o "{filename}_potentialsd.xvg"\n',
                    f'{grace} -nxy "{filename}_potentialsd.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_potentialsd.png"\n\n',
                ]
            )

        commands.extend(
            [
                "#minimizationconjgrad\n",
                f'{gmx} grompp -f PME_cg_em.mdp -c "{filename}_sd_em.gro" -p "{filename}.top" -o "{filename}_cg_em" -maxwarn 2\n',
                f'{gmx} mdrun -nt 3 -v -s "{filename}_cg_em.tpr" -deffnm "{filename}_cg_em"\n',
                f'echo \'10 0\' | {gmx} energy -f "{filename}_cg_em.edr" -o "{filename}_potentialcg.xvg"\n',
                f'{grace} -nxy "{filename}_potentialcg.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_potentialcg.png"\n\n',
                "#equilibrationnvt\n",
                f'{gmx} grompp -f nvt.mdp -c "{filename}_cg_em.gro" -r "{filename}_cg_em.gro" -p "{filename}.top" -o "{filename}_nvt.tpr" -maxwarn 2\n',
                f'{gmx} mdrun -nt 3 -v -s "{filename}_nvt.tpr" -deffnm "{filename}_nvt"\n',
                f'echo \'16 0\' | {gmx} energy -f "{filename}_nvt.edr" -o "{filename}_temperature_nvt.xvg"\n',
                f'{grace} -nxy "{filename}_temperature_nvt.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_temperature_nvt.png"\n\n',
                "#equilibrationnpt\n",
                f'{gmx} grompp -f npt.mdp -c "{filename}_nvt.gro" -r "{filename}_nvt.gro" -p "{filename}.top" -o "{filename}_npt.tpr" -maxwarn 2\n',
                f'{gmx} mdrun -nt 3 -v -s "{filename}_npt.tpr" -deffnm "{filename}_npt"\n',
                f'echo \'16 0\' | {gmx} energy -f "{filename}_npt.edr" -o "{filename}_temperature_npt.xvg"\n',
                f'{grace} -nxy "{filename}_temperature_npt.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_temperature_npt.png"\n\n',
                "#productionmd\n",
                f'{gmx} grompp -f md_pr.mdp -c "{filename}_npt.gro" -p "{filename}.top" -o "{filename}_pr" -maxwarn 2\n',
                f'{gmx} mdrun -nt 3 -v -s "{filename}_pr.tpr" -deffnm "{filename}_pr"\n\n',
                "#analyzemd\n",
                f'echo \'1 1\' | {gmx} trjconv -s "{filename}_pr.tpr" -f "{filename}_pr.xtc" -o "{filename}_pr_PBC.xtc" -pbc mol -center\n',
                f'echo \'1 1\' | {gmx} trjconv -s "{filename}_pr.tpr" -f "{filename}_pr.xtc" -o "{filename}_pr_PBC.gro" -pbc mol -center -dump 1\n',
                f'echo \'4 4\' | {gmx} rms -s "{filename}_pr.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_rmsd_prod.xvg" -tu ns\n',
                f'{grace} -nxy "{filename}_rmsd_prod.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_rmsd_prod.png"\n',
                f'echo \'4 4\' | {gmx} rms -s "{filename}_charged.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_rmsd_cris.xvg" -tu ns\n',
                f'{grace} -nxy "{filename}_rmsd_cris.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_rmsd_cris.png"\n',
                f'{grace} -nxy "{filename}_rmsd_prod.xvg" "{filename}_rmsd_cris.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_rmsd_prod_cris.png"\n',
                f'echo \'1\' | {gmx} gyrate -s "{filename}_pr.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_gyrate.xvg"\n',
                f'{grace} -nxy "{filename}_gyrate.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_gyrate.png"\n',
                f'echo \'1\' | {gmx} rmsf -s "{filename}_pr.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_rmsf_residue.xvg" -res\n',
                f'{grace} -nxy "{filename}_rmsf_residue.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_rmsf_residue.png"\n',
                f'echo \'1\' | {gmx} sasa -s "{filename}_pr.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_solvent_accessible_surface.xvg" -or "{filename}_sas_residue.xvg"\n',
                f'{grace} -nxy "{filename}_solvent_accessible_surface.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_solvent_accessible_surface.png"\n',
                f'{grace} -nxy "{filename}_sas_residue.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_sas_residue.png"\n',
            ]
        )

        if args["bootstrap"] == "true":
            with open(os.path.join(simulation_folder, "commands.txt"), "w") as f:
                f.writelines(commands)

            return {
                "status": "generated",
                "folder": simulation_folder,
            }

        return {"status": "commands", "commands": commands}
