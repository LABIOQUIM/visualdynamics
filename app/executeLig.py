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
        
        #breakpoint adicionado para possibilitar a interação com os arquivos em tempo de execução
        if l == '#break':
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
        
            diretorio_ltop = RunFolder + mol +'_livre.top'
            diretorio_itp = RunFolder + itpname
            file = open(diretorio_itp,'r')
            file_itp = file.readlines()         
            for i, text in enumerate(file_itp):
                if text.find('atoms') > -1:
                    #Adaptando os dados da linha que sera inserida no arquivo _livre.top
                    valor = file_itp[i-1]
                    valor = valor.split(' ')
                    id = valor[0]
                    i = len(valor) - 1 
                    valor = valor.pop(i)
                    #deixando no padrão de espaçamento 
                    valor = id+'                '+valor
                    file.close()
                    #acessando o arquivo _livre.top para incluir os dados
                    file_top = open(diretorio_ltop,'r')
                    file_top = file_top.readlines()
                    file_top.append(valor)
                    #acessa para salvar a alteração
                    file = open(diretorio_ltop,'w')
                    file.writelines(file_top)
                    file.close()

            #cria o novo arquivo com a molecula complexada 
            file_top = open(diretorio_ltop,'r')
            file = file_top.read()
            Newdiretorio = RunFolder + mol +'_complx.top'
            file_complx = open(Newdiretorio,'w')
            file_complx.writelines(file)
            file_top.close()
            file_complx.close()
                           
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