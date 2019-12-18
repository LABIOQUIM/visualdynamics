from .config import Config
from datetime import datetime
import subprocess, os, sys, shutil


def executelig(LogFileName, CommandsFileName, username, filename, ligitp,liggro):
    LogFile = create_log(filename,ligitp, username) #cria o arquivo log

    #transferir os arquivos mdp necessarios para a execução
    RunFolder = Config.UPLOAD_FOLDER + username + '/' + filename+'_'+ligitp + '/run/' #pasta q vai rodar
    SecureMdpFolder = os.path.join(os.path.expanduser('~'),Config.MDP_LOCATION_FOLDER)
    MDPList = os.listdir(SecureMdpFolder)

    for mdpfile in MDPList:
        #armazenar o nome completo do arquivo, seu caminho dentro sistema operacional
        fullmdpname = os.path.join(SecureMdpFolder, mdpfile)
        if (os.path.isfile(fullmdpname)):
            shutil.copy(fullmdpname, RunFolder)
    
    #abrir arquivo
    with open(CommandsFileName) as f: #CODIGO PARA A PRODUÇÃO
        content = f.readlines()
    lines = [line.rstrip('\n') for line in content if line is not '\n'] #cancela as linhas em branco do arquivo

    for l in lines:
        if l[0] == '#':
            WriteUserDynamics(l)
        
        else:
            #estabelecer o diretorio de trabalho
            os.chdir(RunFolder)

            process = subprocess.run(l, shell=True, stdin=LogFile, stdout=LogFile, stderr=LogFile)
            
            try:
                process.check_returncode()
            except subprocess.CalledProcessError as e:
                    LogFile.close()
                    os.remove(Config.UPLOAD_FOLDER+'executing')
                    os.remove(Config.UPLOAD_FOLDER+username+'/DirectoryLog')
                    return (e.args)

    LogFile.close()
    os.remove(Config.UPLOAD_FOLDER+'executing')
    os.remove(Config.UPLOAD_FOLDER+username+'/DirectoryLog')


def create_log(filename,filenameLig, username):
    #formatando nome do arquivo log
    filename = filename.split('.')
    filename.pop()
    filenameLig = filenameLig.split('.')
    filenameLig.pop()
    LogFileName = filename+'_'+filenameLig
    LogFileName = ".".join(LogFileName)+\
            "-{}-{}-{}[{}:{}:{}]{}".format(
            datetime.now().year, datetime.now().month,
            datetime.now().day, datetime.now().hour,
            datetime.now().minute, datetime.now().second,
            '.log.txt'
            )
    
    LogFile = open(LogFileName, "w+")
    f = open(Config.UPLOAD_FOLDER+username+'/DirectoryLog', 'w')
    f.write(LogFileName)
    return LogFile


def WriteUserDynamics(line):
    filename = Config.UPLOAD_FOLDER + 'executing'
    try:
        f = open(filename,'a')
        f.write(line + '\n')
        f.close()
    except OSError:
        print('erro ao adicionar linha no arquivo de dinamica-usuario')
        raise