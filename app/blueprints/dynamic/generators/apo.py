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
        else:
            return "missing_gromacs_double"
    else:
        if which("gmx") is not None:
            gmx = "gmx"
        else:
            return "missing_gromacs_single"

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

    comandos = open(pasta + CompleteFileName, "w")
    os.chdir(pasta)

    # Montagem do comando gmx pdb2gmx com parametros para geracao da topologia a partir da estrutura PDB selecionada, campos de forca e modelo de agua
    comando = f"{gmx} pdb2gmx -f {arquivo} -o {arquivo_gro} -p {arquivo_top} -ff {campo_forca} -water {modelo_agua} {'-ignh -missing' if ignore else ''}"
    comandos.write('#topology\n\n')
    comandos.writelines(comando)
    comandos.write('\n\n')

    # Montagem do comando gmx editconf com parametros para geracao da caixa
    comando = f"{gmx} editconf -f {arquivo_gro} -c -d {str(distancia_caixa)} -bt {tipo_caixa} -o"
    comandos.writelines(comando)
    comandos.write("\n\n")

    # Montagem do comando gmx solvate  com parametros para solvatacao da proteina
    comando = f"{gmx} solvate -cp out.gro -cs -p {arquivo_top} -o {arquivo_box}"
    comandos.write('#solvate\n\n')
    comandos.writelines(comando)
    comandos.write('\n\n')

    # Montagem do comando gmx grompp para precompilar e ver se o sistema esta carregado
    comando = f"{gmx} grompp -f ions.mdp -c {arquivo_box}.gro -p {arquivo_top} -o {arquivo_ionizado} -maxwarn 2"
    comandos.write('#ions\n\n')
    comandos.writelines(comando)
    comandos.write('\n\n')

    if neutralizar_sistema:
        # Montagem do comando gmx genion para neutralizar o sistema
        comando = f"echo 'SOL' | {gmx} genion -s {arquivo_ionizado}.tpr -o {arquivo_ionizado} -p {arquivo_top} -neutral"
        comandos.writelines(comando)
        comandos.write("\n\n")

        # Refaz a pré-compilação caso deva neutralizar o sistema
        comando = f"{gmx} grompp -f PME_em.mdp -c {arquivo_ionizado}.gro -p {arquivo_top} -o {arquivo_ionizado} -maxwarn 2"
        comandos.write('#minimizationsteepdesc\n\n')
        comandos.writelines(comando)
        comandos.write("\n\n")

        # Montagem do comando gmx mdrun para executar a dinamica de minimizacao
        arquivo_minimizado = f"{nome_arquivo}_sd_em"
        comando = f"{gmx} mdrun -v -s {arquivo_ionizado}.tpr -deffnm {arquivo_minimizado}"
        comandos.writelines(comando)
        comandos.write("\n\n")

        # Montagem do comando energySD para criar grafico Steepest Decent
        #comandos.write('#energysd\n\n')
        comando = f"echo '10 0' | {gmx} energy -f {arquivo_minimizado}.edr -o {nome_arquivo}_potentialsd.xvg"
        comandos.writelines(comando)
        comandos.write("\n\n")

        # Montagem do comando GRACE para converter gráfico SD em Imagem
        comando = f"{grace} -nxy {nome_arquivo}_potentialsd.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_potentialsd.png"
        comandos.writelines(comando)
        comandos.write("\n\n")

    # Montagem do comando gmx grompp para precompilar a dinamica de minimizacao cg
    comando = f"{gmx} grompp -f PME_cg_em.mdp -c {nome_arquivo}_sd_em.gro -p {arquivo_top} -o {nome_arquivo}_cg_em -maxwarn 2"
    comandos.write('#minimizationconjgrad\n\n')
    comandos.writelines(comando)
    comandos.write('\n\n')

    # Montagem do comando gmx mdrun para executar a dinamica de minimizacao cg
    comando = f"{gmx} mdrun -v -s {nome_arquivo}_cg_em.tpr -deffnm {nome_arquivo}_cg_em"
    comandos.writelines(comando)
    comandos.write("\n\n")

    # Montagem do comando energyCG para criar grafico CG
    comando = f"echo '10 0' | {gmx} energy -f {nome_arquivo}_cg_em.edr -o {nome_arquivo}_potentialcg.xvg"
    comandos.write('\n\n')

    # Montagem do comando GRACE para converter gráfico CG em Imagem
    comando = f"{grace} -nxy {nome_arquivo}_potentialcg.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_potentialcg.png"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando gmx grompp para precompilar a primeira etapa do equilibrio
    comando = f"{gmx} grompp -f nvt.mdp -c {nome_arquivo}_cg_em.gro -r {nome_arquivo}_cg_em.gro -p {arquivo_top} -o {nome_arquivo}_nvt.tpr -maxwarn 2"
    comandos.write('#equilibrationnvt\n\n')
    comandos.writelines(comando)
    comandos.write("\n\n")

    # Montagem do comando gmx mdrun para executar a primeira etapa do equilibrio
    comando = f"{gmx} mdrun -v -s {nome_arquivo}_nvt.tpr -deffnm {nome_arquivo}_nvt"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando energy para criar do equilibrio nvt
    comando = f"echo '16 0' | {gmx} energy -f {nome_arquivo}_nvt.edr -o {nome_arquivo}_temperature_nvt.xvg"
    comandos.writelines(comando)
    comandos.write("\n\n")

    # Montagem do comando GRACE para converter gráfico NVT em Imagem
    comando = f"{grace} -nxy {nome_arquivo}_temperature_nvt.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_temperature_nvt.png"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando gmx grompp para precompilar a segunda etapa do equilibrio
    comando = f"{gmx} grompp -f npt.mdp -c {nome_arquivo}_nvt.gro -r {nome_arquivo}_nvt.gro -p {arquivo_top} -o {nome_arquivo}_npt.tpr -maxwarn 2"
    comandos.write('#equilibrationnpt\n\n')
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando gmx mdrun para executar a segunda etapa do equilibrio
    comando = f"{gmx} mdrun -v -s {nome_arquivo}_npt.tpr -deffnm {nome_arquivo}_npt"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando energy para criar grafico do equilibrio npt
    comando = f"echo '16 0' | {gmx} energy -f {nome_arquivo}_npt.edr -o {nome_arquivo}_temperature_npt.xvg"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando GRACE para converter gráfico NPT em Imagem
    comando = f"{grace} -nxy {nome_arquivo}_temperature_npt.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_temperature_npt.png"
    comandos.writelines(comando)
    comandos.write("\n\n")

    # Montagem do comando gmx grompp para precompilar a dinamica de position restraints VERSÃO 2
    comando = f"{gmx} grompp -f md_pr.mdp -c {nome_arquivo}_npt.gro -p {arquivo_top} -o {nome_arquivo}_pr -maxwarn 2"
    comandos.write('#productionmd\n\n')
    comandos.writelines(comando)
    comandos.write("\n\n")

    # Montagem do comando gmx mdrun para executar a dinamica de position restraints
    comando = f"{gmx} mdrun -v -s {nome_arquivo}_pr.tpr -deffnm {nome_arquivo}_pr"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando conversao de trajetoria
    comando = f"echo '1 0' | {gmx} trjconv -s {nome_arquivo}_pr.xtc -f {nome_arquivo}_pr_PBC.xtc -pbc mol -center"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando gmx rms da producao
    comando = f"echo '4 4' | {gmx} rms -s {nome_arquivo}_pr.tpr -f {nome_arquivo}_pr_PBC.xtc -o {nome_arquivo}_rmsd_prod.xvg -tu ns"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando grace
    comando = f"{grace} -nxy {nome_arquivo}_rmsd_prod.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_rmsd_prod.png"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando gmx rms da estrutura de cristal
    comando = f"echo '4 4' | {gmx} rms -s {nome_arquivo}_charged.tpr -f {nome_arquivo}_pr_PBC.xtc -o {nome_arquivo}_rmsd_cris.xvg -tu ns"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando grace cristal 
    comando = f"{grace} -nxy {nome_arquivo}_rmsd_cris.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_rmsd_cris.png"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando grace producao+cristal
    comando = f"{grace} -nxy {nome_arquivo}_rmsd_prod.xvg {nome_arquivo}_rmsd_cris xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_rmsd_prod_cris.png"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando gyrate
    comando = f"echo '1' | {gmx} gyrate -s {nome_arquivo}_pr.tpr -f {nome_arquivo}_pr_PBC.xtc -o {nome_arquivo}_gyrate.xvg"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando grace producao+cristal 
    comando = f"{grace} -nxy {nome_arquivo}_gyrate.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_gyrate.png"
    comandos.writelines(comando)
    comandos.write("\n\n")

    # Montagem do comando gyrate
    comando = f"echo '1' | {gmx} rmsf -s {nome_arquivo}_pr.tpr -f {nome_arquivo}_pr_PBC.xtc -o {nome_arquivo}_rmsf_residue.xvg -res"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando grace producao+cristal
    comando = f"{grace} -nxy {nome_arquivo}_rmsf_residue.xvg -hdevice PND -hardcopy -printfile ../graficos/{nome_arquivo}_rmsf_residue.png"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando gyrate
    comando = f"echo '1' | {gmx} sasa {nome_arquivo}_pr.tpr -f {nome_arquivo}_pr_PBC.xtc -o {nome_arquivo}_solvent_accessible_surface.xvg -or {nome_arquivo}_sas_residue.xvg"
    comandos.writelines(comando)
    comandos.write("\n\n")

    # Montagem do comando grace sas por total 
    comando = f"{grace} -nxy {nome_arquivo}_solvent_accessible_surface.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_solvent_accessible_surface.png"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    # Montagem do comando grace sas por residue
    comando = f"{grace} -nxy {nome_arquivo}_sas_residue.xvg -hdevice PNG -hardcopy -printfile ../graficos/{nome_arquivo}_sas_residue.png"
    comandos.writelines(comando)
    comandos.write("\n\n")
    
    comandos.close()
    return CompleteFileName