import os, errno
from datetime import datetime
from ....config import Config
from ....utils.check_binaries import check_grace, check_gromacs


def create_folders(folder):
    for subfolder in ["graficos", "run/logs"]:
        path = os.path.join(folder, subfolder)
        try:
            os.makedirs(path)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise


def generate(
    folder,
    file_orig,
    force_field,
    water_model,
    box_type,
    box_distance,
    neutralize,
    double,
    ignore,
    current_user,
):
    grace = check_grace()
    gmx = check_gromacs(double=double)

    timestamp = datetime.now().replace(microsecond=0).isoformat()
    filename, ext = os.path.splitext(os.path.basename(file_orig))

    # Criando pastas necessárias
    create_folders(folder=folder)

    # Preparando nome do file que guardará os comandos usados
    complete_filename = "commands.txt"

    os.chdir(folder)

    commands = [
        "#topology\n",
        f"grep 'ATOM  ' {filename}{ext} > Protein.pdb\n",
        f"{gmx} pdb2gmx -f \"Protein.pdb\" -o \"{filename}.gro\" -p \"{filename}.top\" -ff {force_field} -water {water_model} {'-ignh -missing' if ignore else ''}\n",
        f'{gmx} editconf -f "{filename}.gro" -c -d {str(box_distance)} -bt {box_type} -o\n\n',
        "#solvate\n",
        f'{gmx} solvate -cp out.gro -cs -p "{filename}.top" -o "{filename}_box"\n\n',
        "#ions\n",
        f'{gmx} grompp -f ions.mdp -c "{filename}_box.gro" -p "{filename}.top" -o "{filename}_charged" -maxwarn 2\n',
    ]

    if neutralize:
        commands.extend(
            [
                f'echo \'SOL\' | {gmx} genion -s "{filename}_charged.tpr" -o "{filename}_charged" -p "{filename}.top" -neutral\n\n',
                "#minimizationsteepdesc\n",
                f'{gmx} grompp -f PME_em.mdp -c "{filename}_charged.gro" -p "{filename}.top" -o "{filename}_charged" -maxwarn 2\n',
                f'{gmx} mdrun -nt 8 -v -s "{filename}_charged.tpr" -deffnm "{filename}_sd_em"\n',
                f'echo \'10 0\' | {gmx} energy -f "{filename}_sd_em.edr" -o "{filename}_potentialsd.xvg"\n',
                f'{grace} -nxy "{filename}_potentialsd.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_potentialsd.png"\n\n',
            ]
        )

    commands.extend(
        [
            "#minimizationconjgrad\n",
            f'{gmx} grompp -f PME_cg_em.mdp -c "{filename}_sd_em.gro" -p "{filename}.top" -o "{filename}_cg_em" -maxwarn 2\n',
            f'{gmx} mdrun -nt 8 -v -s "{filename}_cg_em.tpr" -deffnm "{filename}_cg_em"\n',
            f'echo \'10 0\' | {gmx} energy -f "{filename}_cg_em.edr" -o "{filename}_potentialcg.xvg"\n',
            f'{grace} -nxy "{filename}_potentialcg.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_potentialcg.png"\n\n',
            "#equilibrationnvt\n",
            f'{gmx} grompp -f nvt.mdp -c "{filename}_cg_em.gro" -r "{filename}_cg_em.gro" -p "{filename}.top" -o "{filename}_nvt.tpr" -maxwarn 2\n',
            f'{gmx} mdrun -nt 8 -v -s "{filename}_nvt.tpr" -deffnm "{filename}_nvt"\n',
            f'echo \'16 0\' | {gmx} energy -f "{filename}_nvt.edr" -o "{filename}_temperature_nvt.xvg"\n',
            f'{grace} -nxy "{filename}_temperature_nvt.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_temperature_nvt.png"\n\n',
            "#equilibrationnpt\n",
            f'{gmx} grompp -f npt.mdp -c "{filename}_nvt.gro" -r "{filename}_nvt.gro" -p "{filename}.top" -o "{filename}_npt.tpr" -maxwarn 2\n',
            f'{gmx} mdrun -nt 8 -v -s "{filename}_npt.tpr" -deffnm "{filename}_npt"\n',
            f'echo \'16 0\' | {gmx} energy -f "{filename}_npt.edr" -o "{filename}_temperature_npt.xvg"\n',
            f'{grace} -nxy "{filename}_temperature_npt.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_temperature_npt.png"\n\n',
            "#productionmd\n",
            f'{gmx} grompp -f md_pr.mdp -c "{filename}_npt.gro" -p "{filename}.top" -o "{filename}_pr" -maxwarn 2\n',
            f'{gmx} mdrun -nt 8 -v -s "{filename}_pr.tpr" -deffnm "{filename}_pr"\n\n',
            "#analyzemd\n",
            f'echo \'1 1\' | {gmx} trjconv -s "{filename}_pr.tpr" -f "{filename}_pr.xtc" -o "{filename}_pr_PBC.xtc" -pbc mol -center\n',
            f'echo \'4 4\' | {gmx} rms -s "{filename}_pr.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_rmsd_prod.xvg" -tu ns\n',
            f'{grace} -nxy "{filename}_rmsd_prod.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_rmsd_prod.png"\n',
            f'echo \'4 4\' | {gmx} rms -s "{filename}_charged.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_rmsd_cris.xvg" -tu ns\n',
            f'{grace} -nxy "{filename}_rmsd_cris.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_rmsd_cris.png"\n',
            f'{grace} -nxy "{filename}_rmsd_prod.xvg" "{filename}_rmsd_cris.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_rmsd_prod_cris.png"\n',
            f'echo \'1\' | {gmx} gyrate -s "{filename}_pr.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_gyrate.xvg"\n',
            f'{grace} -nxy "{filename}_gyrate.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_gyrate.png"\n',
            f'echo \'1\' | {gmx} rmsf -s "{filename}_pr.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_rmsf_residue.xvg" -res\n',
            f'{grace} -nxy "{filename}_rmsf_residue.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_rmsf_residue.png"\n',
            f'echo \'1\' | {gmx} sasa -s "{filename}_pr.tpr" -f "{filename}_pr_PBC.xtc" -o "{filename}_solvent_accessible_surface.xvg" -or "{filename}_sas_residue.xvg"\n',
            f'{grace} -nxy "{filename}_solvent_accessible_surface.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_solvent_accessible_surface.png"\n',
            f'{grace} -nxy "{filename}_sas_residue.xvg" -hdevice PNG -hardcopy -printfile "../graficos/{filename}_sas_residue.png"\n',
        ]
    )

    with open(os.path.join(folder, complete_filename), "w") as f:
        f.writelines(commands)

    return complete_filename
