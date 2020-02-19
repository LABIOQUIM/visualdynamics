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
    '''
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
                     
'''
    with open(CommandsFileName) as f:
        lines = f.readlines()
    command = lines[0]
        
    os.chdir(RunFolder)
    resultado_process = subprocess.run('/usr/local/gromacs/bin/gmx_d pdb2gmx -f BATROXRHAGIN.pdb -o BATROXRHAGIN_livre.gro -p BATROXRHAGIN_livre.top -ff gromos53a6 -water spc -ignh -missing \
', shell=True, stdin=LogFile, stdout=LogFile, stderr=LogFile)
    try:
        resultado_process.check_returncode()
    except subprocess.CalledProcessError as e:
        LogFile.close()
        return (e.args)
    '''
    directory_commands = Config.UPLOAD_FOLDER + username + '/' + filename
    os.chdir(directory_commands)
    with open(CommandsFileName) as f: #CODIGO PARA A PRODUÇÃO
        content = f.readlines()
    lines = [line.rstrip('\n') for line in content if line is not '\n'] #cancela as linhas em branco do arquivo
    lines.pop(0)
    for l in lines:
        os.chdir(RunFolder)
        process = subprocess.run(l, shell=True, stdin=LogFile, stdout=LogFile, stderr=LogFile)

        try:
            process.check_returncode()
        except subprocess.CalledProcessError as e:
            LogFile.close()
            return (e.args)
    '''

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

'''
def WriteUserDynamics(line,username):
    filename = Config.UPLOAD_FOLDER + username +'/executingLig'
    try:
        f = open(filename,'a')
        f.write(line + '\n')
        f.close()
    except OSError:
        print('erro ao adicionar linha no arquivo de dinamica-usuario')
        raise
'''