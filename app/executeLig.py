from .config import Config
from datetime import datetime
import subprocess, os, sys, shutil
import errno


def executelig(LogFileName, CommandsFileName, username, filename, itpname, groname, mol):
    LogFile = create_log(LogFileName, username) #cria o arquivo log

    #salvando nome da dinamica para exibir na execução
    f = open(Config.UPLOAD_FOLDER+username+'/'+'namedynamic.txt','w')
    f.write(filename)


    #transferir os arquivos mdp necessarios para a execução
    RunFolder = Config.UPLOAD_FOLDER + username + '/' + filename + '/run/' #pasta q vai rodar
    SecureMdpFolder = os.path.join(os.path.expanduser('~'),Config.MDP_LOCATION_FOLDER)
    MDPList = os.listdir(SecureMdpFolder)

    for mdpfile in MDPList:
        #armazenar o nome completo do arquivo, seu caminho dentro sistema operacional
        fullmdpname = os.path.join(SecureMdpFolder, mdpfile)
        if (os.path.isfile(fullmdpname)):
            shutil.copy(fullmdpname, RunFolder)
    
    diretorio = Config.UPLOAD_FOLDER + username + '/info_dynamics'
    try:
        f = open(diretorio,'x+')
        data = '{}-{}-{}-[{}:{}:{}]'.format(datetime.now().day, datetime.now().month, datetime.now().year,
                                            datetime.now().hour, datetime.now().minute, datetime.now().second)
        info = data + ' ' + filename+'\n'
        f.write(info)
        f.close()
        
    except OSError as e:
        if e.errno == errno.EEXIST:
            f = open(diretorio,'a')
            data = '{}-{}-{}-[{}:{}:{}]'.format(datetime.now().day, datetime.now().month, datetime.now().year,
                                            datetime.now().hour, datetime.now().minute, datetime.now().second)
            info = data + ' ' + filename+'\n'
            f.write(info)
                     

    #abrir arquivo
    with open(CommandsFileName) as f: #CODIGO PARA A PRODUÇÃO
        content = f.readlines()
    lines = [line.rstrip('\n') for line in content if line is not '\n'] #cancela as linhas em branco do arquivo
    
    for l in lines:
        if l[0] == '#':
            WriteUserDynamics(l,username)

        else:
            #estabelecer o diretorio de trabalho
            os.chdir(RunFolder)

            process = subprocess.run(l, shell=True, stdin=LogFile, stdout=LogFile, stderr=LogFile)

            try:
                process.check_returncode()
            except subprocess.CalledProcessError as e:
                    LogFile.close()
                    os.remove(Config.UPLOAD_FOLDER + username +'/executingLig')
                    os.remove(Config.UPLOAD_FOLDER + username + '/executing')
                    os.remove(Config.UPLOAD_FOLDER + username +'/DirectoryLog')
                    return (e.args)
        
        #breakpoint adicionado para possibilitar a interação com os arquivos em tempo de execução
        if l == '#break': 
            #cria o novo arquivo com a molecula complexada
            #pronto 
            diretorio_ltop = RunFolder + mol +'_livre.top'
            diretorio_complx_top = RunFolder + mol +'_complx.top'
            file =  open(diretorio_ltop,'r')
            file_ltop = file.read()
            file_complx_top = open(diretorio_complx_top,'w')
            file_complx_top.writelines(file_ltop)
            file.close()
            file_complx_top.close()

            #cria o novo arquivo com a molecula complexada
            #pronto
            file = open(diretorio_complx_top,'r')
            file_complx_top = file.readlines()
            file.close()
            for i, text in enumerate(file_complx_top):
                if text.find('system') > -1:
                    file = open(diretorio_complx_top,'w')
                    file_complx_top[i-1] = '\n; Include ligand topology\n'+'#include'+' '+'"'+itpname+'"'+"\n\n"
                    file.writelines(file_complx_top)
                    file.close()
            
            #acessando arquivo .itp para pegar o moleculetype
            #pronto
            diretorio_itp = RunFolder + itpname
            file = open(diretorio_itp,'r')
            file_itp = file.readlines()
            file.close()         
            for i, text in enumerate(file_itp):
                if text.find('moleculetype') > -1:
                    molecula = file_itp[i+2]
                    molecula = molecula.split(' ')[0]
                    molecula = molecula+'                 '+'1\n'
                    #acessando o arquivo _complx.top para incluir os dados
                    file = open(diretorio_complx_top,'r')
                    file_complx_top = file.readlines()
                    file.close()
                    file_complx_top.append(molecula)
                    #acessa para salvar a alteração
                    file = open(diretorio_complx_top,'w')
                    file.writelines(file_complx_top)
                    file.close()
             
            #modificando o arquivo .gro
            #pronto
            diretorio_gro = RunFolder + groname
            file = open(diretorio_gro,'r')
            file_gro = file.readlines()
            file.close()
            valor_gro = file_gro[1]
            valor_gro = int(valor_gro)
            file_gro.pop()
            file_gro.pop(0)

            #copiando as coordenadas dos atomos
            diretorio_lgro = RunFolder + mol +'_livre.gro'
            diretorio_complx_gro =  RunFolder + mol +'_complx.gro'
            file_complx_gro = open(diretorio_complx_gro,'w')
            file = open(diretorio_lgro,'r')
            file_lgro = file.readlines()
            file.close()
            i = len(file_lgro)-1
            last_line = file_lgro[i]
            file_lgro.pop()
            file_complx_gro.writelines(file_lgro)
            file_gro.pop(0)
            file_gro.append(last_line)
            file_complx_gro.writelines(file_gro)
            file_complx_gro.close()            
            
            #somando a quantidade de atomos da enzima
            #pronto
            file = open(diretorio_complx_gro,'r')
            file_complx_gro = file.readlines()
            file.close()
            valor_complx_gro = file_complx_gro[1]
            valor_complx_gro = int(valor_complx_gro)
            total = valor_gro + valor_complx_gro
            total = str(total)
            file_complx_gro[1] = ' '+total+'\n'
            file = open(diretorio_complx_gro,'w')
            file.writelines(file_complx_gro)
            file.close()


    LogFile.close()
    os.remove(Config.UPLOAD_FOLDER + username +'/executingLig')
    os.remove(Config.UPLOAD_FOLDER + username + '/executing')
    os.remove(Config.UPLOAD_FOLDER + username + '/DirectoryLog')


def create_log(LogFileName, username):
    #formatando nome do arquivo log
    LogFileName = LogFileName+"-{}-{}-{}[{}:{}:{}]{}".format(datetime.now().year,
                                                            datetime.now().month,
                                                            datetime.now().day,
                                                            datetime.now().hour,
                                                            datetime.now().minute,
                                                            datetime.now().second,
                                                            '.log.txt')
        
    LogFile = open(LogFileName, "w+")
    f = open(Config.UPLOAD_FOLDER+username +'/DirectoryLog', 'w')
    f.write(LogFileName)
    f.close()
    return LogFile


def WriteUserDynamics(line,username):
    filename = Config.UPLOAD_FOLDER + username +'/executingLig'
    try:
        f = open(filename,'a')
        f.write(line + '\n')
        f.close()
    except OSError:
        print('erro ao adicionar linha no arquivo de dinamica-usuario')
        raise