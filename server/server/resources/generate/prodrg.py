import os
from flask_restful import Resource, reqparse
from server.config import Config
from server.utils.create_folders import create_folders
from server.utils.find_binaries import check_grace, check_gromacs
from datetime import datetime
from werkzeug.datastructures import FileStorage


class GeneratePRODRG(Resource):
    def post(self):
        timestamp = datetime.now().replace(microsecond=0).isoformat()

        parser = reqparse.RequestParser()
        parser.add_argument(
            "file_pdb", required=True, type=FileStorage, location="files"
        )
        parser.add_argument(
            "file_itp", required=True, type=FileStorage, location="files"
        )
        parser.add_argument(
            "file_gro", required=True, type=FileStorage, location="files"
        )
        parser.add_argument("force_field", required=True, type=str, location="form")
        parser.add_argument("water_model", required=True, type=str, location="form")
        parser.add_argument("box_type", required=True, type=str, location="form")
        parser.add_argument("box_distance", required=True, type=str, location="form")
        parser.add_argument("neutralize", required=True, type=bool, location="form")
        parser.add_argument("double", required=True, type=bool, location="form")
        parser.add_argument("ignore", required=True, type=bool, location="form")
        parser.add_argument("username", required=True, type=str, location="form")
        parser.add_argument("bootstrap", required=True, type=str, location="form")

        args = parser.parse_args()

        filename, ext = os.path.splitext(os.path.basename(args["file_pdb"].filename))
        filename_itp, ext_itp = os.path.splitext(
            os.path.basename(args["file_itp"].filename)
        )
        filename_gro, ext_gro = os.path.splitext(
            os.path.basename(args["file_gro"].filename)
        )

        if args["bootstrap"] == "true":
            gmx = check_gromacs()
            grace = check_grace()

            dynamic_folder = os.path.abspath(
                os.path.join(
                    Config.UPLOAD_FOLDER,
                    args["username"],
                    "PRODRG",
                    filename,
                    timestamp,
                )
            )

            create_folders(dynamic_folder)

            args["file_pdb"].save(
                os.path.join(dynamic_folder, "run", args["file_pdb"].filename)
            )
            args["file_itp"].save(
                os.path.join(dynamic_folder, "run", args["file_itp"].filename)
            )
            args["file_gro"].save(
                os.path.join(dynamic_folder, "run", args["file_gro"].filename)
            )

            file_user_dynamics_list = os.path.abspath(
                os.path.join(Config.UPLOAD_FOLDER, args["username"], "dynamics.list")
            )

            with open(file_user_dynamics_list, "a+") as f:
                f.write(f"{dynamic_folder}\n")
        else:
            gmx = "gmx"
            grace = "grace"

        commands = [
            "#topology\n",
            f"grep 'ATOM  ' \"{filename}{ext}\" > Protein.pdb\n",
            f'{gmx} pdb2gmx -f "Protein.pdb" -o "{filename}_livre.gro" -p "{filename}_livre.top" -ff {args["force_field"]} -water {args["water_model"]} {"-ignh -missing" if args["ignore"] else ""}\n\n',
            "#break\n",
            # Make a copy of _livre.top to _complx.top
            f'cp "{filename}_livre.top" "{filename}_complx.top"\n',
            # Include the itp in the _complx.top
            f'sed -i -e \'/system/{{x;p;x;s/.*/; Include ligand topology\n#include "pol647.ITP"\n\n&/}}\' "{filename}_complx.top"'.encode(
                "unicode_escape"
            ).decode(
                "utf-8"
            ),
            # Adding the moleculetype on _complx.top
            f'\nIFS="" file_itp=$(cat {filename_itp}{ext_itp}); molecule=$(echo ${{file_itp}} | grep -A 2 "moleculetype" | tail -n 1 | awk \'{{print $1}}\'); molecule=$(printf "\\n%-20s 1\\n" "${{molecule}}"); IFS="" file_complx_top=$(cat "{filename}_complx.top"); echo "${{file_complx_top}}${{molecule}}" > "{filename}_complx.top"\n',
            # Doing .gro needed modifications
            f'IFS="" file_gro=$(cat "{filename_gro}{ext_gro}"); value_gro=$(echo ${{file_gro}} | awk \'NR==2{{print $1}}\'); file_gro=$(echo "${{file_gro}}" | awk \'NR>=3{{print}}\'); dir_lgro=$(echo {filename}_livre.gro); dir_complx_gro=$(echo {filename}_complx.gro); IFS="" file_lgro=$(cat ${{dir_lgro}}); last_line=$(echo "${{file_lgro}}" | tail -1); file_lgro=$(echo "${{file_lgro}}" | head -n -1); echo -n "" > $dir_complx_gro; echo "${{file_lgro}}" >> ${{dir_complx_gro}}; echo "${{file_gro}}" >> ${{dir_complx_gro}}; echo "${{last_line}}" >> ${{dir_complx_gro}}; file_complx_gro=$(cat ${{dir_complx_gro}}); value_complx_gro=$(echo ${{file_complx_gro}} | awk \'NR==2{{print $1}}\'); total=$(expr ${{value_gro}} + ${{value_complx_gro}}); echo "${{file_complx_gro}}" | awk -v var=${{total}} \'NR==2 {{$1=sprintf("%5d", var)}} {{print}}\' > ${{dir_complx_gro}}\n',
            # Proceed with the GMX commands
            f'{gmx} editconf -f "{filename}_complx.gro" -c -d {args["box_distance"]} -bt {args["box_type"]} -o "{filename}_complx.gro"\n',
            "#solvate\n",
            f'{gmx} solvate -cp "{filename}_complx.gro" -cs spc216.gro -p "{filename}_complx.top" -o "{filename}_complx_box.gro"\n\n',
            "#ions\n",
            f'{gmx} grompp -f ions.mdp -c "{filename}_complx_box.gro" -p "{filename}_complx.top" -o "{filename}_complx_charged.tpr" -maxwarn 2\n',
            f'echo "SOL" | {gmx} genion -s "{filename}_complx_charged.tpr" -p "{filename}_complx.top" -o "{filename}_complx_neutral.gro" -neutral\n\n',
            "#minimizationsteepdesc\n",
            f'{gmx} grompp -f PME_em.mdp -c "{filename}_complx_neutral.gro" -p "{filename}_complx.top" -o "{filename}_complx_em.tpr" -maxwarn 2\n'
            f'{gmx} mdrun -v -s "{filename}_complx_em.tpr" -deffnm "{filename}_complx_sd_em"\n',
            f'echo "10 0" | {gmx} energy -f "{filename}_complx_sd_em.edr" -o "{filename}_complx_potentialsd.xvg"\n',
            f'{grace} -nxy "{filename}_complx_potentialsd.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_potentialsd.png"\n\n',
            "#minimizationconjgrad\n",
            f'{gmx} grompp -f PME_cg_em.mdp -c "{filename}_complx_sd_em.gro" -p "{filename}_complx.top" -o "{filename}_complx_cg_em.tpr" -maxwarn 2\n',
            f'{gmx} mdrun -v -s "{filename}_complx_cg_em.tpr" -deffnm "{filename}_complx_cg_em"\n',
            f'echo "10 0" | {gmx} energy -f "{filename}_complx_cg_em.edr" -o "{filename}_complx_potentialcg.xvg"\n',
            f'{grace} -nxy "{filename}_complx_potentialcg.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_potentialcg.png"\n\n',
            "#equilibrationnvt\n",
            f'{gmx} grompp -f nvt.mdp -c "{filename}_complx_cg_em.gro" -r "{filename}_complx_cg_em.gro" -p "{filename}_complx.top" -o "{filename}_complx_nvt.tpr" -maxwarn 2\n',
            f'{gmx} mdrun -v -s "{filename}_complx_nvt.tpr" -deffnm "{filename}_complx_nvt"\n',
            f'echo "16 0" | {gmx} energy -f "{filename}_complx_nvt.edr" -o "{filename}_complx_temperature_nvt.xvg"\n',
            f'{grace} -nxy "{filename}_complx_temperature_nvt.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_temperature_nvt.png"\n\n',
            "#equilibrationnpt\n",
            f'{gmx} grompp -f npt.mdp -c "{filename}_complx_nvt.gro" -r "{filename}_complx_nvt.gro" -p "{filename}_complx.top" -o "{filename}_complx_npt.tpr" -maxwarn 2\n',
            f'{gmx} mdrun -v -s "{filename}_complx_npt.tpr" -deffnm "{filename}_complx_npt"\n',
            f'echo "16 0" | {gmx} energy -f "{filename}_complx_npt.edr" -o "{filename}_temperature_npt.xvg"\n',
            f'{grace} -nxy "{filename}_temperature_npt.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_temperature_npt.png"\n\n',
            "#productionmd\n",
            f'{gmx} grompp -f md_pr.mdp -c "{filename}_complx_npt.gro" -p "{filename}_complx.top" -o "{filename}_complx_pr.tpr" -maxwarn 2\n',
            f'{gmx} mdrun -v -s "{filename}_complx_pr.tpr" -deffnm "{filename}_complx_pr"\n\n',
            "#analyzemd\n",
            f'echo "1 0" | {gmx} trjconv -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr.xtc" -o "{filename}_complx_pr_PBC.xtc" -pbc mol -center\n',
            f'echo "4 4" | {gmx} rms -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr_PBC.xtc" -o "{filename}_complx_rmsd_prod.xvg" -tu ns\n',
            f'{grace} -nxy "{filename}_complx_rmsd_prod.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_rmsd_prod.png"\n',
            f'echo "4 4" | {gmx} rms -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr_PBC.xtc" -o "{filename}_complx_rmsd_cris.xvg"\n',
            f'{grace} -nxy "{filename}_complx_rmsd_cris.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_rmsd_cris.png"\n',
            f'{grace} -nxy "{filename}_complx_rmsd_prod.xvg" "{filename}_complx_rmsd_cris.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_rmsd_prod_cris.png"\n',
            f'echo "1" | {gmx} gyrate -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr_PBC.xtc" -o "{filename}_complx_gyrate.xvg"\n',
            f'{grace} -nxy "{filename}_complx_gyrate.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_gyrate.png"\n',
            f'echo "1" | {gmx} rmsf -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr_PBC.xtc" -o "{filename}_complx_rmsf_residue.xvg" -res\n',
            f'{grace} -nxy "{filename}_complx_rmsf_residue.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_rmsf_residue.png"\n',
            f'echo "1" | {gmx} sasa -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr.xtc" -o "{filename}_complx_solvent_accessible_surface.xvg" -or "{filename}_complx_sas_residue.xvg"\n',
            f'{grace} -nxy "{filename}_complx_solvent_accessible_surface.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_solvent_accessible_surface.png"\n',
            f'{grace} -nxy "{filename}_complx_sas_residue.xvg" -hdevice PNG -hardcopy -printfile "../figures/{filename}_complx_sas_residue.png"\n',
        ]

        if args["bootstrap"] == "true":
            with open(os.path.join(dynamic_folder, "commands.txt"), "w") as f:
                f.writelines(commands)

            return {
                "status": "generated",
                "folder": dynamic_folder,
            }

        return {"status": "commands", "commands": commands}
