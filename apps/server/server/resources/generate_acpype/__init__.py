from flask_restful import Resource, reqparse
from server.utils.find_binaries import check_grace, check_gromacs


class GenerateAcpypeCommands(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("folder", type=str)
        parser.add_argument("file_pdb", type=str)
        parser.add_argument("file_itp", type=str)
        parser.add_argument("file_gro", type=str)
        parser.add_argument("force_field", type=str)
        parser.add_argument("water_model", type=str)
        parser.add_argument("box_type", type=str)
        parser.add_argument("box_distance", type=str)
        parser.add_argument("neutralize", type=bool)
        parser.add_argument("double", type=bool)
        parser.add_argument("ignore", type=bool)
        parser.add_argument("user_id", type=str)

        args = parser.parse_args()

        filename, _ = args["file_pdb"].split(".")
        filename1, _ = args["file_itp"].split(".")

        if args["folder"]:
            gmx = check_gromacs()
            grace = check_grace()
        else:
            gmx = "gmx"
            grace = "grace"

        commands = [
            "#topology\n",
            f"grep 'ATOM  ' {args['file_pdb']} > Protein.pdb\n",
            f'{gmx} pdb2gmx -f "Protein.pdb" -o "{filename}_livre.pdb" -p "{filename}_livre.top" -ff {args["force_field"]} -water {args["water_model"]} -ignh -missing\n\n',
            "#break\n",
            f"grep -h ATOM \"{filename}_livre.pdb\" \"{args['file_gro']}\" | tee \"{filename}_complx.pdb\" > /dev/null\n",
            f"cat {args['file_itp']} | sed -n '/atomtypes/,/^ *$/{{/\n\n/d;p}}' > ligand_atomtypes.txt".encode(
                "unicode_escape"
            ).decode(
                "utf-8"
            ),
            f"\ncat {filename}_livre.top | sed '/forcefield\.itp\"/a\#include \"{args['file_itp']}\"' > {filename}1_complx.top\n",
            f"cat {filename}1_complx.top | sed '/forcefield\.itp/r ligand_atomtypes.txt' > {filename}_complx.top\n",
            f'echo "{filename1}         1" >> {filename}_complx.top\n\n',
            f'{gmx} editconf -f "{filename}_complx.pdb" -c -d 1 -bt {args["box_type"]} -o "{filename}_complx.pdb"\n\n',
            "#solvate\n",
            f'{gmx} solvate -cp "{filename}_complx.pdb" -cs spc216.gro -p "{filename}_complx.top" -o "{filename}_complx_box.pdb"\n\n',
            "#ions\n",
            f'{gmx} grompp -f ions.mdp -c "{filename}_complx_box.pdb" -p "{filename}_complx.top" -o "{filename}_complx_charged.tpr" -maxwarn 20\n',
            f'echo "SOL" | {gmx} genion -s "{filename}_complx_charged.tpr" -p "{filename}_complx.top" -o "{filename}_complx_neutral.pdb" -neutral\n\n',
            "#minimizationsteepdesc\n",
            f'{gmx} grompp -f PME_em.mdp -c "{filename}_complx_neutral.pdb" -p "{filename}_complx.top" -o "{filename}_complx_em.tpr" -maxwarn 20\n',
            f'{gmx} mdrun -v -s "{filename}_complx_em.tpr" -deffnm "{filename}_complx_sd_em"\n',
            f'echo "10 0" | {gmx} energy -f "{filename}_complx_sd_em.edr" -o "{filename}_complx_potentialsd.xvg"\n',
            f'{grace} -nxy "{filename}_complx_potentialsd.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_potentialsd.png"\n\n',
            "#minimizationconjgrad\n",
            f'{gmx} grompp -f PME_cg_em.mdp -c "{filename}_complx_sd_em.gro" -p "{filename}_complx.top" -o "{filename}_complx_cg_em.tpr" -maxwarn 20\n',
            f'{gmx} mdrun -v -s "{filename}_complx_cg_em.tpr" -deffnm "{filename}_complx_cg_em"\n',
            f'echo "10 0" | {gmx} energy -f "{filename}_complx_cg_em.edr" -o "{filename}_complx_potentialcg.xvg"\n',
            f'{grace} -nxy "{filename}_complx_potentialcg.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_potentialcg.png"\n\n',
            "#equilibrationnvt\n",
            f'{gmx} grompp -f nvt.mdp -c "{filename}_complx_cg_em.gro" -r "{filename}_complx_cg_em.gro" -p "{filename}_complx.top" -o "{filename}_complx_nvt.tpr" -maxwarn 20\n',
            f'{gmx} mdrun -v -s "{filename}_complx_nvt.tpr" -deffnm "{filename}_complx_nvt"\n',
            f'echo "16 0" | {gmx} energy -f "{filename}_complx_nvt.edr" -o "{filename}_complx_temperature_nvt.xvg"\n',
            f'{grace} -nxy "{filename}_complx_temperature_nvt.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_temperature_nvt.png"\n\n',
            "#equilibrationnpt\n",
            f'{gmx} grompp -f npt.mdp -c "{filename}_complx_nvt.gro" -r "{filename}_complx_nvt.gro" -p "{filename}_complx.top" -o "{filename}_complx_npt.tpr" -maxwarn 20\n',
            f'{gmx} mdrun -v -s "{filename}_complx_npt.tpr" -deffnm "{filename}_complx_npt"\n',
            f'echo "16 0" | {gmx} energy -f "{filename}_complx_npt.edr" -o "{filename}_temperature_npt.xvg"\n',
            f'{grace} -nxy "{filename}_temperature_npt.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_temperature_npt.png"\n',
            "#productionmd\n",
            f'{gmx} grompp -f md_pr.mdp -c "{filename}_complx_npt.gro" -p "{filename}_complx.top" -o "{filename}_complx_pr.tpr" -maxwarn 20\n',
            f'{gmx} mdrun -v -s "{filename}_complx_pr.tpr" -deffnm "{filename}_complx_pr"\n\n',
            "#analyzemd\n",
            f'echo "1 0" | {gmx} trjconv -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr.xtc" -o "{filename}_complx_pr_PBC.xtc" -pbc mol -center\n',
            f'echo "4 4" | {gmx} rms -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr_PBC.xtc" -o "{filename}_complx_rmsd_prod.xvg" -tu ns\n',
            f'{grace} -nxy "{filename}_complx_rmsd_prod".xvg -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_rmsd_prod.png"\n',
            f'echo "4 4" | {gmx} rms -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr_PBC.xtc" -o "{filename}_complx_rmsd_cris.xvg" -tu ns\n',
            f'{grace} -nxy "{filename}_complx_rmsd_cris.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_rmsd_cris.png"\n',
            f'{grace} -nxy "{filename}_complx_rmsd_prod.xvg" "{filename}_complx_rmsd_cris.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_rmsd_prod_cris.png"\n',
            f'echo "1" | {gmx} gyrate -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr_PBC.xtc" -o "{filename}_complx_gyrate.xvg"\n',
            f'{grace} -nxy "{filename}_complx_gyrate.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_gyrate.png"\n',
            f'echo "1" | {gmx} rmsf -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr_PBC.xtc" -o "{filename}_complx_rmsf_residue.xvg" -res\n',
            f'{grace} -nxy "{filename}_complx_rmsf_residue.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_rmsf_residue.png"\n',
            f'echo "1" | {gmx} sasa -s "{filename}_complx_pr.tpr" -f "{filename}_complx_pr.xtc" -o "{filename}_complx_solvent_accessible_surface.xvg" -or "{filename}_complx_sas_residue.xvg"\n',
            f'{grace} -nxy "{filename}_complx_solvent_accessible_surface.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_solvent_accessible_surface.png"\n',
            f'{grace} -nxy "{filename}_complx_sas_residue.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_complx_sas_residue.png"\n',
        ]

        return {"commands": commands}
