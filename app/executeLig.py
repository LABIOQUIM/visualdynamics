from .config import Config
from datetime import datetime
import subprocess, os, sys, shutil


def executelig(LogFileName, CommandsFileName, username, filename, itpname, mol):
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
        
        if l.find('pdb2gmx') > -1:
            diretorio = RunFolder + mol +'_livre.top'
            file_top =  open(diretorio,'r')
            file_top = file_top.readlines()
            #abrindo arquivo _livre.top e incluindo o ligant topology
            for i, text in enumerate(file_top):
                if text.find('system') > -1:
                    file = open(diretorio,'w')
                    file_top[i-5] = "\n; Include ligand topology\n"+"#include"+' '+itpname+"\n"
                    file.writelines(file_top)
                    file.close()
            
            '''
            diretorio_itp = RunFolder + itpname
            diretorio_top = RunFolder + mol +'_livre.top'

            with open (diretorio_itp, 'r') as file_itp, open(diretorio_top, 'w') as file:     
                file_itp = file_itp.readlines()         
                for i, text in enumerate(file_itp):
                    if text.find('atoms') > -1:
                        valor = file_itp[i-1]
                
                file_top = file.readlines() 
                for i, text in enumerate(file_top):
                    if text.find('molecules') > -1:
                        file_top[i+2].append(valor)
                        file.writelines(file_top)

            #acessando arquivo .itp para pegar dados 
            diretorio = RunFolder + itpname
            file_itp = open(diretorio,'r')
            file_itp = file_itp.readlines()         
            for i, text in enumerate(file_itp):
                if text.find('atoms') > -1:
                    valor = file_itp[i-1] 
                    diretorio = RunFolder + mol +'_livre.top'
                    file = open(diretorio,'w+')
                    file_top = file.readlines()
                    for j, text in enumerate(file_top):
                        if text.find('molecules') > -1:
                            file = open(diretorio,'w')
                            file_top[j+2] = valor
                            file.writelines(file_top)
                            file.close()'''
    LogFile.close()
    os.remove(Config.UPLOAD_FOLDER+'executing')
    os.remove(Config.UPLOAD_FOLDER+username+'/DirectoryLog')


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