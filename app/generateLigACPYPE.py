import os, errno
from datetime import datetime
from shutil import which
from .config import Config

def generateLigACPYPE(
    selecao_arquivo, arquivo_itp, arquivo_gro, campo_forca, modelo_agua, tipo_caixa,
    distancia_caixa, neutralizar_sistema, double, ignore, current_user
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
    (nome_ligante, extensao) = arquivo_itp.split('.')

    pasta = Config.UPLOAD_FOLDER + current_user.username + '/' + nome_arquivo+'_'+nome_ligante + '/'
    try: #criando todas as pastas
        os.makedirs(pasta + 'graficos/')
        os.makedirs(pasta + 'run/logs/')
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise

    #arquivos gerados pelos comandos
    arquivo_livre_gro = nome_arquivo + '_livre.pdb'
    arquivo_livre_top = nome_arquivo + '_livre.top'
    arquivo_complx_gro = nome_arquivo + '_complx.pdb'
    arquivo_complx_top = nome_arquivo + '_complx.top'
    arquivo_complx_box_gro = nome_arquivo + '_complx_box.pdb'  
    arquivo_complx_charged_tpr = nome_arquivo + '_complx_charged.tpr'
    arquivo_complx_neutral_gro = nome_arquivo + '_complx_neutral.pdb'
    arquivo_complx_em_tpr = nome_arquivo + '_complx_em.tpr'
    arquivo_complx_sd_em = nome_arquivo + '_complx_sd_em'
    arquivo_complx_potentialsd = nome_arquivo + '_complx_potentialsd'
    arquivo_complx_cg_em = nome_arquivo + '_complx_cg_em'
    arquivo_complx_potentialcg = nome_arquivo + '_complx_potentialcg'
    arquivo_complx_nvt = nome_arquivo + '_complx_nvt'
    arquivo_complx_temperature_nvt = nome_arquivo + '_complx_temperature_nvt'
    arquivo_complx_npt = nome_arquivo + '_complx_npt'
    arquivo_complx_temperature_npt = nome_arquivo + '_temperature_npt'
    arquivo_complx_pr = nome_arquivo + '_complx_pr'
    arquivo_complx_rmsd_prod = nome_arquivo + '_complx_rmsd_prod'
    arquivo_complx_rmsd_cris = nome_arquivo + '_complx_rmsd_cris'
    arquivo_complx_gyrate = nome_arquivo + '_complx_gyrate'
    arquivo_complx_rmsf_residue = nome_arquivo + '_complx_rmsf_residue'
    arquivo__complx_solvent_accessible_surface = nome_arquivo + '_complx_solvent_accessible_surface'
    arquivo__complx_sas_residue = nome_arquivo + '_complx_sas_residue'

    #nome completo do arquivo
    CompleteFileName = "{}|{}.txt".format(
        datetime.now().replace(microsecond=0).isoformat(), nome_arquivo + "_" + nome_ligante
    )
    
    #Gravando os comandos e os parametros
    comandos = open(pasta + CompleteFileName, "w")
    os.chdir(pasta)

    comandos.write('#topology\n\n')
    comando = f"{gmx} pdb2gmx -f {arquivo} -o {arquivo_livre_gro} -p {arquivo_livre_top} -ff amber94 -water {modelo_agua} -ignh -missing"
    comandos.writelines(comando)
    comandos.write('\n\n#break')
    comandos.write('\n\n')
    
    #comando editconf
    comando = f"{gmx} editconf -f {arquivo_complx_gro} -c -d 1 -bt {tipo_caixa} -o {arquivo_complx_gro}"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando solvate
    comandos.write('#solvate\n\n')
    comando = f"{gmx} solvate -cp {arquivo_complx_gro} -cs spc216.gro -p {arquivo_complx_gro} -o {arquivo_complx_box_gro}"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando grompp
    comando = f"{gmx} grompp -f ions.mdp -c {arquivo_complx_box_gro} -p {arquivo_complx_top} -o {arquivo_complx_charged_tpr} -maxwarn 2"
    comandos.write('#ions\n\n')
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando genion
    comando = f"echo \"SOL\" | {gmx} genion -s {arquivo_complx_charged_tpr} -p {arquivo_complx_top} -o {arquivo_complx_neutral_gro} -neutral"
    comandos.writelines(comando)
    comandos.write('\n\n')


    #comando grompp minimização
    comandos.write('#minimizationsteepdesc\n\n')
    comando = f"{gmx} grompp -f PME_em.mdp -c {arquivo_complx_neutral_gro} -p {arquivo_complx_top} -o {arquivo_complx_em_tpr} -maxwarn 2"
    comandos.writelines(comando)
    comandos.write('\n\n')


    #comando mdrun
    comando = f"{gmx} mdrun -v -s {arquivo_complx_em_tpr} -deffnm {arquivo_complx_sd_em}"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando energy
    resposta = 'echo "10 0"'
    pipe = '|'
    comando = 'energy'
    parametro1 = '-f ' + arquivo_complx_sd_em + '.edr'
    parametro2 = '-o ' + arquivo_complx_potentialsd + '.xvg'
    
    comando = f"echo \"10 0\" | {gmx} energy -f {arquivo_complx_sd_em}.edr -o {arquivo_complx_potentialsd}.xvg"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando grace
    comando = f"{grace} -nxy {arquivo_complx_potentialsd}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_potentialsd}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando grompp
    comandos.write('#minimizationconjgrad\n\n')
    comando = f"{gmx} grompp -f PME_cg_em.mdp -c {arquivo_complx_sd_em}.gro -p {arquivo_complx_top} -o {arquivo_complx_cg_em}.tpr -maxwarn 2"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando mdrun
    comando = f"{gmx} mdrun -v -s {arquivo_complx_cg_em}.tpr -deffnm {arquivo_complx_cg_em}"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando energy
    comando = f"echo \"10 0\" | {gmx} energy -f {arquivo_complx_cg_em}.edr -o {arquivo_complx_potentialcg}.xvg"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando grace
    comando = f"{grace} -nxy {arquivo_complx_potentialcg}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_potentialcg}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando grompp
    comandos.write('#equilibrationnvt\n\n')
    comando = f"{gmx} grompp -f nvt.mdp -c {arquivo_complx_cg_em}.gro -r {arquivo_complx_cg_em}.gro -p {arquivo_complx_top} -o {arquivo_complx_nvt}.tpr -maxwarn 2"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando mdrun
    comando = f"{gmx} mdrun -v -s {arquivo_complx_nvt}.tpr -deffnm {arquivo_complx_nvt}"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando energy
    comando = f"echo \"16 0\" | {gmx} energy -f {arquivo_complx_nvt}.edr -o {arquivo_complx_temperature_nvt}.xvg"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grace   
    comando = f"{grace} -nxy {arquivo_complx_temperature_nvt}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_temperature_nvt}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grompp
    comandos.write('#equilibrationnpt\n\n')
    comando = f"{gmx} grompp -f npt.mdp -c {arquivo_complx_nvt}.gro -r {arquivo_complx_nvt}.gro -p {arquivo_complx_top} -o {arquivo_complx_npt}.tpr -maxwarn 2"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando mdrun
    comando = f"{gmx} mdrun -v -s {arquivo_complx_npt}.tpr -deffnm {arquivo_complx_npt}"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando energy
    comando = f"echo \"16 0\" | {gmx} energy -f {arquivo_complx_npt}.edr -o {arquivo_complx_temperature_npt}.xvg"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando grace
    comando = f"{grace} -nxy {arquivo_complx_temperature_npt}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_temperature_npt}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grompp
    comandos.write('#productionmd\n\n')
    comando = f"{gmx} grompp md_pr.mdp -c {arquivo_complx_npt}.gro -p {arquivo_complx_top} -o {arquivo_complx_pr}.tpr -maxwarn 2"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando mdrun
    comando = f"{gmx} mdrun -v -s {arquivo_complx_pr}.tpr -deffnm {arquivo_complx_pr}"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando trjconv
    comando = f"echo \"1 0\" | {gmx} trjconv -s {arquivo_complx_pr}.tpr -f {arquivo_complx_pr}.xtc -o {arquivo_complx_pr}_PBC.xtc -pbc mol -center"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando rms
    comando = f"echo \"4 4\" | {gmx} rms -s {arquivo_complx_pr}.tpr -f {arquivo_complx_pr}_PBC.xtc -o {arquivo_complx_rmsd_prod}.xvg -tu ns"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando grace
    comando = f"{grace} -nxy {arquivo_complx_rmsd_prod}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_rmsd_prod}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')
    
    #comando rms
    comando = f"echo \"4 4\" | {gmx} rms -s {arquivo_complx_pr}.tpr -f {arquivo_complx_pr}_PBC.xtc -o {arquivo_complx_rmsd_cris}.xvg -tu ns"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grace
    comando = f"{grace} -nxy {arquivo_complx_rmsd_cris}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_rmsd_cris}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grace
    comando = f"{grace} -nxy {arquivo_complx_rmsd_prod}.xvg {arquivo_complx_rmsd_cris}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_rmsd_prod}_cris.png"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando gyrate
    comando = f"echo \"1\" | {gmx} gyrate -s {arquivo_complx_pr}.tpr -f {arquivo_complx_pr}_PBC.xtc -o {arquivo_complx_gyrate}.xvg"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grace
    comando = f"{grace} -nxy {arquivo_complx_gyrate}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_gyrate}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando rmsf 
    comando = f"echo \"1\" | {gmx} rmsf -s {arquivo_complx_pr}.tpr -f {arquivo_complx_pr}_PBC.xtc -o {arquivo_complx_rmsf_residue}.xvg -res"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grace
    comando = f"{grace} -nxy {arquivo_complx_rmsf_residue}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo_complx_rmsf_residue}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando sasa
    comando = f"echo \"1\" | {gmx} sasa -s {arquivo_complx_pr}.tpr -f {arquivo_complx_pr}.xtc -o {arquivo__complx_solvent_accessible_surface}.xvg -or {arquivo__complx_sas_residue}.xvg"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grace
    comando = f"{grace} -nxy {arquivo__complx_solvent_accessible_surface}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo__complx_solvent_accessible_surface}.png"
    comandos.writelines(comando)
    comandos.write('\n\n')

    #comando grace
    comando = f"{grace} -nxy {arquivo__complx_sas_residue}.xvg -hdevice PNG -hardcopy -printfile ../graficos/{arquivo__complx_sas_residue}.png"
    comandos.writelines(comando)
    comandos.write('\n\n') 

    comandos.close()
        
    return CompleteFileName