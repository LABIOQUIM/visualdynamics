import os, errno
from datetime import datetime
from .config import Config

def generateLig(
    selecao_arquivo, arquivo_itp, arquivo_gro, campo_forca, modelo_agua, tipo_caixa,
    distancia_caixa, neutralizar_sistema, double, ignore,
    current_user):

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
    arquivo_livre_gro = nome_arquivo + '_livre.gro'
    arquivo_livre_top = nome_arquivo + '_livre.top'
    arquivo_complx_gro = nome_arquivo + '_complx.gro'
    arquivo_complx_top = nome_arquivo + '_complx.top'
    arquivo_complx_box_gro = nome_arquivo + '_complx_box.gro'  
    arquivo_complx_charged_tpr = nome_arquivo + '_complx_charged.tpr'
    arquivo_complx_neutral_gro = nome_arquivo + '_complx_neutral.gro'
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
    CompleteFileName = "{}-{}-{}-{}[{}:{}:{}].txt".format(
            nome_arquivo+'_'+nome_ligante, datetime.now().year, datetime.now().month,
            datetime.now().day, datetime.now().hour,
            datetime.now().minute, datetime.now().second
            )
    
    #Gravando os comandos e os parametros
    comandos = open(pasta + CompleteFileName, "w")
    os.chdir(pasta)

    gmx = '/usr/local/gromacs/bin/gmx_d' if double else '/usr/local/gromacs/bin/gmx'
    comando = 'pdb2gmx' 
    parametro1 = '-f ' + arquivo
    parametro2 = '-o ' + arquivo_livre_gro
    parametro3 = '-p ' + arquivo_livre_top
    parametro4 = '-ff'
    parametro5 = 'gromos53a6'
    parametro6 = '-water ' + modelo_agua
    parametro7 = '-ignh'
    parametro8 = '-missing'

    #comandos.write('#topology\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8)
    comandos.write('\n\n#break')
    comandos.write('\n\n')
    
    #comando editconf
    comando = 'editconf'
    parametro1 = '-f ' + arquivo_complx_gro
    parametro2 = '-c -d 1' 
    parametro3 = '-bt'
    parametro4 = tipo_caixa + ' -o ' + arquivo_complx_gro

    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4)
    comandos.write('\n\n')

    #comando solvate
    comando = 'solvate'
    parametro1 = '-cp ' + arquivo_complx_gro 
    parametro2 = '-cs'
    parametro3 = 'spc216.gro'
    parametro4 = '-p ' + arquivo_complx_top
    parametro5 = '-o ' + arquivo_complx_box_gro    

    #comandos.write('#solvate\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')
    
    #comando grompp
    comando = 'grompp'
    parametro1 = '-f '
    parametro2 = 'ions.mdp'
    parametro3 = '-c ' + arquivo_complx_box_gro
    parametro4 = '-p ' + arquivo_complx_top
    parametro5 = '-o ' + arquivo_complx_charged_tpr
    parametro6 = '-maxwarn 2'

    #comandos.write('#ions\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6)
    comandos.write('\n\n')

    #comando genion
    resposta = 'echo "SOL"'
    pipe = '|'
    comando = 'genion'
    parametro1 = '-s ' + arquivo_complx_charged_tpr
    parametro2 = '-p ' + arquivo_complx_top
    parametro3 = '-o ' + arquivo_complx_neutral_gro
    parametro4 = '-neutral'
    
    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4)
    comandos.write('\n\n')
    
    #comando grompp minimização
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'PME_em.mdp'
    parametro3 = '-c ' + arquivo_complx_neutral_gro
    parametro4 = '-p ' + arquivo_complx_top
    parametro5 = '-o ' + arquivo_complx_em_tpr 
    parametro6 = '-maxwarn 2'

    #comandos.write('#minimizationsteepdesc\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6)
    comandos.write('\n\n')

    #comando mdrun
    comando = 'mdrun' 
    parametro1 = '-v'
    parametro2 = '-s ' + arquivo_complx_em_tpr 
    parametro3 = '-deffnm'
    parametro4 =  arquivo_complx_sd_em
    
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4)
    comandos.write('\n\n')

    #comando energy
    resposta = 'echo "10 0"'
    pipe = '|'
    comando = 'energy'
    parametro1 = '-f ' + arquivo_complx_sd_em + '.edr'
    parametro2 = '-o ' + arquivo_complx_potentialsd + '.xvg'
    
    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2)
    comandos.write('\n\n')
    
    #comando grace
    comando = 'grace'
    parametro1 = '-nxy ' + arquivo_complx_potentialsd + '.xvg' 
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo_complx_potentialsd + '.PNG'
    
    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')
    
    #comando grompp
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'PME_cg_em.mdp'
    parametro3 = '-c ' + arquivo_complx_sd_em + '.gro' 
    parametro4 = '-p ' + arquivo_complx_top
    parametro5 = '-o ' + arquivo_complx_cg_em + '.tpr'
    parametro6 = '-maxwarn 2'

    #comandos.write('#minimizationconjgrad\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' '+ parametro6)
    comandos.write('\n\n')

    #comando mdrun
    comando = 'mdrun'
    parametro1 = '-v'
    parametro2 = '-s ' + arquivo_complx_cg_em + '.tpr'
    parametro3 = '-deffnm'
    parametro4 = arquivo_complx_cg_em

    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4)
    comandos.write('\n\n')

    #comando energy
    resposta = 'echo "10 0"'
    pipe = '|'
    comando = 'energy'
    parametro1 = '-f ' + arquivo_complx_cg_em + '.edr'
    parametro2 = '-o ' + arquivo_complx_potentialcg + '.xvg'

    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2)
    comandos.write('\n\n')
    
    #comando grace
    comando = 'grace'
    parametro1 = '-nxy ' + arquivo_complx_potentialcg + '.xvg'
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy' 
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo_complx_potentialcg + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')
    
    #comando grompp
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'nvt.mdp'
    parametro3 = '-c ' + arquivo_complx_cg_em + '.gro'
    parametro4 = '-r ' + arquivo_complx_cg_em + '.gro'
    parametro5 = '-p ' + arquivo_complx_top 
    parametro6 = '-o ' + arquivo_complx_nvt + '.tpr'
    parametro7 = '-maxwarn 2'

    #comandos.write('#equilibrationnvt\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' '+ parametro6 + ' '+ parametro7)
    comandos.write('\n\n')

    #comando mdrun
    comando = 'mdrun'
    parametro1 = '-v'
    parametro2 = '-s ' + arquivo_complx_nvt + '.tpr' 
    parametro3 = '-deffnm'
    parametro4 = arquivo_complx_nvt

    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4)
    comandos.write('\n\n')

    #comando energy
    resposta = 'echo "16 0"'
    pipe = '|'
    comando = 'energy'
    parametro1 = '-f ' + arquivo_complx_nvt + '.edr'
    parametro2 = '-o ' + arquivo_complx_temperature_nvt + '.xvg'
    
    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2)
    comandos.write('\n\n')

    #comando grace   
    comando = 'grace'
    parametro1 = '-nxy ' + arquivo_complx_temperature_nvt + '.xvg'
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo_complx_temperature_nvt + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    #comando grompp
    comando = 'grompp' 
    parametro1 = '-f'
    parametro2 = 'npt.mdp'
    parametro3 = '-c ' + arquivo_complx_nvt + '.gro' 
    parametro4 = '-r ' + arquivo_complx_nvt + '.gro'
    parametro5 = '-p ' + arquivo_complx_top 
    parametro6 = '-o ' + arquivo_complx_npt + '.tpr' 
    parametro7 = '-maxwarn 2'

    #comandos.write('#equilibrationnpt\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' '+ parametro6 + ' '+ parametro7)
    comandos.write('\n\n')

    #comando mdrun
    comando = 'mdrun'
    parametro1 = '-v' 
    parametro2 = '-s ' + arquivo_complx_npt + '.tpr' 
    parametro3 = '-deffnm'
    parametro4 = arquivo_complx_npt

    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4)
    comandos.write('\n\n')

    #comando energy
    resposta = 'echo "16 0"'
    pipe = '|'
    comando = 'energy'
    parametro1 = '-f ' + arquivo_complx_npt + '.edr'
    parametro2 = '-o ' + arquivo_complx_temperature_npt + '.xvg'
    
    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2)
    comandos.write('\n\n')
    
    #comando grace
    comando = 'grace'
    parametro1 = '-nxy ' + arquivo_complx_temperature_npt + '.xvg'
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo_complx_temperature_npt + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    #comando grompp
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'md_pr.mdp'
    parametro3 = '-c ' + arquivo_complx_npt + '.gro'
    parametro4 = '-p ' + arquivo_complx_top 
    parametro5 = '-o ' + arquivo_complx_pr + '.tpr'
    parametro6 = '-maxwarn 2'

    #comandos.write('#productionmd\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' '+ parametro6)
    comandos.write('\n\n')
    
    #comando mdrun
    comando = 'mdrun'
    parametro1 = '-v'
    parametro2 = '-s ' + arquivo_complx_pr + '.tpr' 
    parametro3 = '-deffnm'
    parametro4 = arquivo_complx_pr

    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4)
    comandos.write('\n\n')

    #comando trjconv
    resposta = 'echo "1 0"'
    pipe = '|'
    comando = 'trjconv'
    parametro1 = '-s ' + arquivo_complx_pr + '.tpr'
    parametro2 = '-f ' + arquivo_complx_pr + '.xtc' 
    parametro3 = '-o ' + arquivo_complx_pr + '_PBC.xtc'
    parametro4 = '-pbc mol'
    parametro5 = '-center'
        
    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 \
    + ' ' + parametro3 + ' ' + parametro4 + ' '+ parametro5)
    comandos.write('\n\n')

    #comando rms
    resposta = 'echo "4 4"'
    pipe = '|' 
    comando = 'rms'
    parametro1 = '-s ' + arquivo_complx_pr + '.tpr'
    parametro2 = '-f ' + arquivo_complx_pr + '_PBC.xtc'
    parametro3 = '-o ' + arquivo_complx_rmsd_prod + '.xvg' 
    parametro4 = '-tu ns'

    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 \
    + ' ' + parametro3 + ' ' + parametro4)
    comandos.write('\n\n')
    
    #comando grace
    comando = 'grace'
    parametro1 = '-nxy ' + arquivo_complx_rmsd_prod + '.xvg'
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo_complx_rmsd_prod + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')
    
    #comando rms
    resposta = 'echo "4 4"'
    pipe = '|'
    comando = 'rms'
    parametro1 = '-s ' + arquivo_complx_pr + '.tpr' 
    parametro2 = '-f ' + arquivo_complx_pr + '_PBC.xtc'
    parametro3 = '-o ' + arquivo_complx_rmsd_cris + '.xvg'
    parametro4 = '-tu ns'

    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 \
    + ' ' + parametro3 + ' ' + parametro4)
    comandos.write('\n\n')

    #comando grace
    comando = 'grace' 
    parametro1 = '-nxy ' + arquivo_complx_rmsd_cris + '.xvg'
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo_complx_rmsd_cris + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    #comando grace
    comando = 'grace' 
    parametro1 = '-nxy ' + arquivo_complx_rmsd_prod + '.xvg' 
    parametro2 = arquivo_complx_rmsd_cris + '.xvg'
    parametro3 = '-hdevice'
    parametro4 = 'PNG -hardcopy'
    parametro5 = '-printfile'
    parametro6 = '../graficos/' + arquivo_complx_rmsd_prod + '_cris.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6)
    comandos.write('\n\n')

    #comando gyrate
    resposta = 'echo "1"'
    pipe = '|'
    comando = 'gyrate'
    parametro1 = '-s ' + arquivo_complx_pr + '.tpr' 
    parametro2 = '-f ' + arquivo_complx_pr + '_PBC.xtc'
    parametro3 = '-o ' + arquivo_complx_gyrate + '.xvg'

    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 \
    + ' ' + parametro3)
    comandos.write('\n\n')

    #comando grace
    comando = 'grace' 
    parametro1 = '-nxy ' + arquivo_complx_gyrate + '.xvg' 
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo_complx_gyrate + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    #comando rmsf 
    resposta = 'echo "1"'
    pipe = '|'
    comando = 'rmsf'
    parametro1 = '-s ' + arquivo_complx_pr + '.tpr'
    parametro2 = '-f ' + arquivo_complx_pr + '_PBC.xtc'
    parametro3 = '-o ' + arquivo_complx_rmsf_residue + '.xvg'
    parametro4 = '-res'

    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 \
    + ' ' + parametro3 + ' ' + parametro4)
    comandos.write('\n\n')

    #comando grace
    comando = 'grace' 
    parametro1 = '-nxy ' + arquivo_complx_rmsf_residue + '.xvg' 
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo_complx_rmsf_residue + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    #comando sasa
    resposta = 'echo "1"'
    pipe = '|' 
    comando = 'sasa'
    parametro1 = '-s ' + arquivo_complx_pr + '.tpr'
    parametro2 = '-f ' + arquivo_complx_pr + '.xtc'
    parametro3 = '-o ' + arquivo__complx_solvent_accessible_surface + '.xvg' 
    parametro4 = '-or ' + arquivo__complx_sas_residue + '.xvg'

    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 \
    + ' ' + parametro3 + ' ' + parametro4)
    comandos.write('\n\n')

    #comando grace
    comando = 'grace' 
    parametro1 = '-nxy ' + arquivo__complx_solvent_accessible_surface + '.xvg' 
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo__complx_solvent_accessible_surface + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    #comando grace
    comando = 'grace' 
    parametro1 = '-nxy ' + arquivo__complx_sas_residue + '.xvg' 
    parametro2 = '-hdevice'
    parametro3 = 'PNG -hardcopy'
    parametro4 = '-printfile'
    parametro5 = '../graficos/' + arquivo__complx_sas_residue + '.PNG'

    comandos.writelines(comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5)
    comandos.write('\n\n')

    comandos.close()
        
    return CompleteFileName