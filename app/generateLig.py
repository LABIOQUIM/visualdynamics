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
    try:
        os.makedirs(pasta + '/run/logs/') #criando todas as pastas
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise

    arquivo_livre_gro = nome_arquivo + '_livre.gro'
    arquivo_livre_top = nome_arquivo + '_livre.top'
    arquivo_complx_gro = nome_arquivo + '_complx.gro'
    arquivo_complx_top = nome_arquivo + '_complx.top'
    arquivo_complx_box_gro = nome_arquivo + '_complx_box.gro'  
    arquivo_complx_charged_tpr = nome_arquivo + '_complx_charged.tpr'
    arquivo_complx_neutral_gro = nome_arquivo + '_complx_neutral.gro'
    arquivo_complx_em_tpr = nome_arquivo + '_complx_em.tpr'
    arquivo_complx_sd_em_edr = nome_arquivo+'_complx_sd_em.edr'

    CompleteFileName = "{} - {}-{}-{} [{}:{}:{}].txt".format(
            nome_arquivo+'_'+nome_ligante, datetime.now().year, datetime.now().month,
            datetime.now().day, datetime.now().hour,
            datetime.now().minute, datetime.now().second
            )
    
    # trabalhando parametros
    comandos = open(pasta + CompleteFileName, "w")
    os.chdir(pasta)          

    gmx = '/usr/local/gromacs/bin/gmx_d' if double else '/usr/local/gromacs/bin/gmx'
    comando = 'pdb2gmx' 
    parametro1 = '-f'
    parametro2 = arquivo
    parametro3 = '-o'
    parametro4 = arquivo_livre_gro
    parametro5 = '-p'
    parametro6 = arquivo_livre_top
    parametro7 = '-ff'
    parametro8 = 'gromos53a6'
    parametro9 = '-water spc'
    parametro10 = '-ignh'
    parametro11 = '-missing'

    comandos.write('#topology\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 \
    + ' ' + parametro9 + ' ' + parametro10 + ' ' + parametro11)
    comandos.write('\n\n#break')
    comandos.write('\n\n')
    
    #comando editconf
    comando = 'editconf'
    parametro1 = '-f'
    parametro2 = arquivo_complx_gro
    parametro3 = '-c -d 1' 
    parametro4 = '-bt'
    parametro5 = 'cubic -o'
    parametro6 = arquivo_complx_gro

    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6)
    comandos.write('\n\n')

    #comando solvate
    comando = 'solvate'
    parametro1 = '-cp' 
    parametro2 = arquivo_complx_gro 
    parametro3 = '-cs'
    parametro4 = 'spc216.gro'
    parametro5 = '-p'
    parametro6 = arquivo_complx_top
    parametro7 = '-o' 
    parametro8 = arquivo_complx_box_gro    

    comandos.write('#solvate\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6+ ' ' + parametro7 + ' ' + parametro8)
    comandos.write('\n\n')
    
    #comando grompp
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'ions.mdp'
    parametro3 = '-c'
    parametro4 = arquivo_complx_box_gro
    parametro5 = '-p'
    parametro6 = arquivo_complx_top
    parametro7 = '-o'
    parametro8 =  arquivo_complx_charged_tpr
    parametro9 = '-maxwarn 2'

    comandos.write('#ions\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 + ' ' + parametro9)
    comandos.write('\n\n')

    
    #comando genion
    resposta = 'echo "SOL"'
    pipe = '|'
    comando = 'genion'
    parametro1 = '-s'
    parametro2 = arquivo_complx_charged_tpr
    parametro3 = '-p'
    parametro4 = arquivo_complx_top
    parametro5 = '-o'
    parametro6 = arquivo_complx_neutral_gro
    parametro7 = '-neutral'
    
    comandos.writelines(resposta + ' ' + pipe + ' ' + gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7)
    comandos.write('\n\n')


    #comando grompp minimização
    comando = 'grompp'
    parametro1 = '-f'
    parametro2 = 'PME_em.mdp'
    parametro3 = '-c' 
    parametro4 = arquivo_complx_neutral_gro
    parametro5 = '-p'
    parametro6 = arquivo_complx_top
    parametro7 = '-o'
    parametro8 = arquivo_complx_em_tpr 
    parametro9 = '-maxwarn 2'

    comandos.write('##minimization\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 + ' ' + parametro9)
    comandos.write('\n\n')

    comando = 'mdrun' 
    parametro1 = '-v'
    parametro2 = '-s'
    parametro3 = arquivo_complx_em_tpr 
    parametro4 = '-deffnm'
    parametro5 =  arquivo_complx_sd_em_edr
    #parei aqui


    return CompleteFileName