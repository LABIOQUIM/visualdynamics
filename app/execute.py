from .config import Config
from datetime import datetime
import subprocess, os, sys, shutil

def execute(LogFileName, CommandsFileName, username, filename):
    LogFile = create_log(LogFileName, username) #cria o arquivo log

    #transferir os arquivos mdp necessarios para a execução
    RunFolder = Config.UPLOAD_FOLDER + username + '/' + filename + '/run/' #pasta q vai rodar
    SecureMdpFolder = os.path.join(os.path.expanduser('~'),Config.MDP_LOCATION_FOLDER)
    MDPList = os.listdir(SecureMdpFolder)

    for mdpfile in MDPList:
        #armazenar o nome completo do arquivo, seu caminho dentro sistema operacional
        fullmdpname = os.path.join(SecureMdpFolder, mdpfile)
        if (os.path.isfile(fullmdpname)):
            shutil.copy(fullmdpname, RunFolder)

    #abrir arquivo
    with open(CommandsFileName) as f: #CODIGO PARA A PRODUÇÃO
    #with open('{}{}/{}/teste.txt'.format(Config.UPLOAD_FOLDER, username, filename)) as f: #Código para TESTE
        content = f.readlines()
    lines = [line.rstrip('\n') for line in content if line is not '\n'] #cancela as linhas em branco do arquivo
    
    #try:
    # lendo cada linha do arquivo texto
    for l in lines:
        if l[0] == '#':
            WriteUserDynamics(l)
        else:
            #estabelecer o diretorio de trabalho
            os.chdir(RunFolder)

            #parametro stdin=PIPE e shell=True pego de um ex. do stackoverflow para poder usar o genion com pipe
            #parametro stout=LogFile pra escrever log
            process = subprocess.run(l, shell=True, stdin=LogFile, stdout=LogFile, stderr=LogFile)
            
            try:
                process.check_returncode()
            except subprocess.CalledProcessError as e:
                    LogFile.close()
                    os.remove(Config.UPLOAD_FOLDER+'executing')
                    os.remove(Config.UPLOAD_FOLDER+username+'/DirectoryLog')
                    return (e.args)
        
        #except subprocess.CalledProcessError as e:
    #raise RuntimeError("command '{}' return with error (code {}): {}".format(e.cmd, e.returncode, e.output))
    
    LogFile.close()
    os.remove(Config.UPLOAD_FOLDER+'executing')
    os.remove(Config.UPLOAD_FOLDER+username+'/DirectoryLog')


def create_log(LogFileName, username):
    #formatando nome do arquivo log
    LogFileName = LogFileName.split('.')
    LogFileName.pop()
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