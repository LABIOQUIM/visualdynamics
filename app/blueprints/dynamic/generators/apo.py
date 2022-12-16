import os, errno
from datetime import datetime
from ....config import Config
from shutil import which

def generate(
    selecao_arquivo, campo_forca, modelo_agua, tipo_caixa, distancia_caixa,
    neutralizar_sistema, double, ignore, current_user
):
    if which("gracebat") is not None:
        grace = "gracebat"
    elif which("grace") is not None:
        grace = "grace"
    else:
        return "missing_grace"
    
    if double:
        if which("gmx_d") is not None:
            gmx = "gmx_d"
        elif which("gmx") is not None:
            gmx = "gmx"
        else: 
            return "missing_gromacs"
    else:
        if which("gmx") is not None:
            gmx = "gmx"
        else:
            return "missing_gromacs"

    arquivo = os.path.basename(selecao_arquivo)
    (nome_arquivo, extensao) = arquivo.split('.')

    # Criando pastas necessárias
    pasta = Config.UPLOAD_FOLDER + current_user.username + '/' + nome_arquivo + '/'
    try:
        os.makedirs(pasta + 'graficos')
        os.makedirs(pasta + 'run/logs/')
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise
    
    # Preparando Nome dos arquivos que serão criados
    arquivo_gro = nome_arquivo + '.gro'
    arquivo_top = nome_arquivo + '.top'
    arquivo_box = nome_arquivo + '_box'
    arquivo_ionizado = nome_arquivo + '_charged'

    # Preparando nome do arquivo que guardará os comandos usados
    CompleteFileName = "{}|{}.txt".format(datetime.now().replace(microsecond=0).isoformat(), nome_arquivo)

    fileToWrite = open(pasta + CompleteFileName, "w")
    os.chdir(pasta)

    # Montagem do comando gmx pdb2gmx com parametros para geracao da topologia a partir da estrutura PDB selecionada, campos de forca e modelo de agua
    comando1 = f"{gmx} pdb2gmx -f \"{arquivo}\" -o \"{arquivo_gro}\" -p \"{arquivo_top}\" -ff {campo_forca} -water {modelo_agua} {'-ignh -missing' if ignore else ''}"
    
    # Montagem do comando gmx editconf com parametros para geracao da caixa
    comando2 = f"{gmx} editconf -f \"{arquivo_gro}\" -c -d {str(distancia_caixa)} -bt {tipo_caixa} -o"
    
    # Montagem do comando gmx solvate  com parametros para solvatacao da proteina
    comando3 = f"{gmx} solvate -cp out.gro -cs -p \"{arquivo_top}\" -o \"{arquivo_box}\""
    
    # Montagem do comando gmx grompp para precompilar e ver se o sistema esta carregado
    comando4 = f"{gmx} grompp -f ions.mdp -c \"{arquivo_box}.gro\" -p \"{arquivo_top}\" -o \"{arquivo_ionizado}\" -maxwarn 2"

    if neutralizar_sistema:
        # Montagem do comando gmx genion para neutralizar o sistema
        comando5 = f"echo 'SOL' | {gmx} genion -s \"{arquivo_ionizado}.tpr\" -o \"{arquivo_ionizado}\" -p \"{arquivo_top}\" -neutral"

        # Refaz a pré-compilação caso deva neutralizar o sistema
        comando6 = f"{gmx} grompp -f PME_em.mdp -c \"{arquivo_ionizado}.gro\" -p \"{arquivo_top}\" -o \"{arquivo_ionizado}\" -maxwarn 2"

        # Montagem do comando gmx mdrun para executar a dinamica de minimizacao
        arquivo_minimizado = f"{nome_arquivo}_sd_em"
        comando7 = f"{gmx} mdrun -v -s \"{arquivo_ionizado}.tpr\" -deffnm \"{arquivo_minimizado}\""

        # Montagem do comando energySD para criar grafico Steepest Decent
        #comandos.write('#energysd\n\n')
        comando8 = f"echo '10 0' | {gmx} energy -f \"{arquivo_minimizado}.edr\" -o \"{nome_arquivo}_potentialsd.xvg\""

        # Montagem do comando GRACE para converter gráfico SD em Imagem
        comando9 = f"{grace} -nxy \"{nome_arquivo}_potentialsd.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_potentialsd.png\""

    # Montagem do comando gmx grompp para precompilar a dinamica de minimizacao cg
    comando10 = f"{gmx} grompp -f PME_cg_em.mdp -c \"{nome_arquivo}_sd_em.gro\" -p \"{arquivo_top}\" -o \"{nome_arquivo}_cg_em\" -maxwarn 2"

    # Montagem do comando gmx mdrun para executar a dinamica de minimizacao cg
    comando11 = f"{gmx} mdrun -v -s \"{nome_arquivo}_cg_em.tpr\" -deffnm \"{nome_arquivo}_cg_em\""

    # Montagem do comando energyCG para criar grafico CG
    comando12 = f"echo '10 0' | {gmx} energy -f \"{nome_arquivo}_cg_em.edr\" -o \"{nome_arquivo}_potentialcg.xvg\""

    # Montagem do comando GRACE para converter gráfico CG em Imagem
    comando13 = f"{grace} -nxy \"{nome_arquivo}_potentialcg.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_potentialcg.png\""
    
    # Montagem do comando gmx grompp para precompilar a primeira etapa do equilibrio
    comando14 = f"{gmx} grompp -f nvt.mdp -c \"{nome_arquivo}_cg_em.gro\" -r \"{nome_arquivo}_cg_em.gro\" -p \"{arquivo_top}\" -o \"{nome_arquivo}_nvt.tpr\" -maxwarn 2"

    # Montagem do comando gmx mdrun para executar a primeira etapa do equilibrio
    comando15 = f"{gmx} mdrun -v -s \"{nome_arquivo}_nvt.tpr\" -deffnm \"{nome_arquivo}_nvt\""
    
    # Montagem do comando energy para criar do equilibrio nvt
    comando16 = f"echo '16 0' | {gmx} energy -f \"{nome_arquivo}_nvt.edr\" -o \"{nome_arquivo}_temperature_nvt.xvg\""

    # Montagem do comando GRACE para converter gráfico NVT em Imagem
    comando17 = f"{grace} -nxy \"{nome_arquivo}_temperature_nvt.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_temperature_nvt.png\""
    
    # Montagem do comando gmx grompp para precompilar a segunda etapa do equilibrio
    comando18 = f"{gmx} grompp -f npt.mdp -c \"{nome_arquivo}_nvt.gro\" -r \"{nome_arquivo}_nvt.gro\" -p \"{arquivo_top}\" -o \"{nome_arquivo}_npt.tpr\" -maxwarn 2"
    
    # Montagem do comando gmx mdrun para executar a segunda etapa do equilibrio
    comando19 = f"{gmx} mdrun -v -s \"{nome_arquivo}_npt.tpr\" -deffnm \"{nome_arquivo}_npt\""
    
    # Montagem do comando energy para criar grafico do equilibrio npt
    comando20 = f"echo '16 0' | {gmx} energy -f \"{nome_arquivo}_npt.edr\" -o \"{nome_arquivo}_temperature_npt.xvg\""
    
    # Montagem do comando GRACE para converter gráfico NPT em Imagem
    comando21 = f"{grace} -nxy \"{nome_arquivo}_temperature_npt.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_temperature_npt.png\""

    # Montagem do comando gmx grompp para precompilar a dinamica de position restraints VERSÃO 2
    comando22 = f"{gmx} grompp -f md_pr.mdp -c \"{nome_arquivo}_npt.gro\" -p \"{arquivo_top}\" -o \"{nome_arquivo}_pr\" -maxwarn 2"

    # Montagem do comando gmx mdrun para executar a dinamica de position restraints
    comando23 = f"{gmx} mdrun -v -s \"{nome_arquivo}_pr.tpr\" -deffnm \"{nome_arquivo}_pr\""
    
    # Montagem do comando conversao de trajetoria
    comando24 = f"echo '1 0' | {gmx} trjconv -s \"{nome_arquivo}_pr.tpr\" -f \"{nome_arquivo}_pr.xtc\" -o \"{nome_arquivo}_pr_PBC.xtc\" -pbc mol -center"
    
    # Montagem do comando gmx rms da producao
    comando25 = f"echo '4 4' | {gmx} rms -s \"{nome_arquivo}_pr.tpr\" -f \"{nome_arquivo}_pr_PBC.xtc\" -o \"{nome_arquivo}_rmsd_prod.xvg\" -tu ns"
    
    # Montagem do comando grace
    comando26 = f"{grace} -nxy \"{nome_arquivo}_rmsd_prod.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_rmsd_prod.png\""
    
    # Montagem do comando gmx rms da estrutura de cristal
    comando27 = f"echo '4 4' | {gmx} rms -s \"{nome_arquivo}_charged.tpr\" -f \"{nome_arquivo}_pr_PBC.xtc\" -o \"{nome_arquivo}_rmsd_cris.xvg\" -tu ns"
    
    # Montagem do comando grace cristal 
    comando28 = f"{grace} -nxy \"{nome_arquivo}_rmsd_cris.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_rmsd_cris.png\""
    
    # Montagem do comando grace producao+cristal
    comando29 = f"{grace} -nxy \"{nome_arquivo}_rmsd_prod.xvg\" \"{nome_arquivo}_rmsd_cris.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_rmsd_prod_cris.png\""
    
    # Montagem do comando gyrate
    comando30 = f"echo '1' | {gmx} gyrate -s \"{nome_arquivo}_pr.tpr\" -f \"{nome_arquivo}_pr_PBC.xtc\" -o \"{nome_arquivo}_gyrate.xvg\""
    
    # Montagem do comando grace producao+cristal 
    comando31 = f"{grace} -nxy \"{nome_arquivo}_gyrate.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_gyrate.png\""

    # Montagem do comando gyrate
    comando32 = f"echo '1' | {gmx} rmsf -s \"{nome_arquivo}_pr.tpr\" -f \"{nome_arquivo}_pr_PBC.xtc\" -o \"{nome_arquivo}_rmsf_residue.xvg\" -res"
    
    # Montagem do comando grace producao+cristal
    comando33 = f"{grace} -nxy \"{nome_arquivo}_rmsf_residue.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_rmsf_residue.png\""
    
    # Montagem do comando gyrate
    comando34 = f"echo '1' | {gmx} sasa -s \"{nome_arquivo}_pr.tpr\" -f \"{nome_arquivo}_pr_PBC.xtc\" -o \"{nome_arquivo}_solvent_accessible_surface.xvg\" -or \"{nome_arquivo}_sas_residue.xvg\""

    # Montagem do comando grace sas por total 
    comando35 = f"{grace} -nxy \"{nome_arquivo}_solvent_accessible_surface.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_solvent_accessible_surface.png\""
    
    # Montagem do comando grace sas por residue
    comando36 = f"{grace} -nxy \"{nome_arquivo}_sas_residue.xvg\" -hdevice PNG -hardcopy -printfile \"../graficos/{nome_arquivo}_sas_residue.png\""
    
    fileToWrite.writelines([
        "#topology\n",
        f"{comando1}\n",
        f"{comando2}\n\n",
        "#solvate\n",
        f"{comando3}\n\n",
        "#ions\n",
        f"{comando4}\n",
        f"{comando5}\n\n",
        f"#minimizationsteepdesc\n",
        f"{comando6}\n",
        f"{comando7}\n",
        f"{comando8}\n",
        f"{comando9}\n\n",
        f"#minimizationconjgrad\n",
        f"{comando10}\n",
        f"{comando11}\n",
        f"{comando12}\n",
        f"{comando13}\n\n",
        f"#equilibrationnvt\n"
        f"{comando14}\n",
        f"{comando15}\n",
        f"{comando16}\n",
        f"{comando17}\n\n",
        f"#equilibrationnpt\n"
        f"{comando18}\n",
        f"{comando19}\n",
        f"{comando20}\n",
        f"{comando21}\n\n",
        f"#productionmd\n",
        f"{comando22}\n",
        f"{comando23}\n\n",
        f"#analyzemd\n"
        f"{comando24}\n",
        f"{comando25}\n",
        f"{comando26}\n",
        f"{comando27}\n",
        f"{comando28}\n",
        f"{comando29}\n",
        f"{comando30}\n",
        f"{comando31}\n",
        f"{comando32}\n",
        f"{comando33}\n",
        f"{comando34}\n",
        f"{comando35}\n",
        f"{comando36}\n",
    ])

    fileToWrite.close()
    return CompleteFileName