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

    CompleteFileName = "{} - {}-{}-{} [{}:{}:{}].txt".format(
            nome_arquivo+'_'+nome_ligante, datetime.now().year, datetime.now().month,
            datetime.now().day, datetime.now().hour,
            datetime.now().minute, datetime.now().second
            )
    
    # trabalhando parametros
    comandos = open(pasta + CompleteFileName, "w")
    os.chdir(pasta)          

    #executando o comando inicial
    gmx = '/usr/local/gromacs/bin/gmx_d' if double else '/usr/local/gromacs/bin/gmx'
    comando = 'pdb2gmx' 
    parametro1 = '-f'
    parametro2 = arquivo
    parametro3 = '-o'
    parametro4 = arquivo_livre_gro
    parametro5 = '-p'
    parametro6 = arquivo_livre_top
    parametro7 = '-ff'
    parametro8 = 'gromos54a7'
    parametro9 = '-water spc'
    parametro10 = '-ignh'
    parametro11 = '-missing'

    comandos.write('#topology\n\n')
    comandos.writelines(gmx + ' ' + comando + ' ' + parametro1 + ' ' + parametro2 + ' ' + parametro3 \
    + ' ' + parametro4 + ' ' + parametro5 + ' ' + parametro6 + ' ' + parametro7 + ' ' + parametro8 \
    + ' ' + parametro9 + ' ' + parametro10 + ' ' + parametro11)
    comandos.write('\n\n#break')
    


    return CompleteFileName