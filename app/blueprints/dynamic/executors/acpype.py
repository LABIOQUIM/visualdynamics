from ....config import Config
from datetime import datetime
import subprocess, os, sys, shutil
import errno


def execute(LogFileName, CommandsFileName, username, filename, itpname, groname, mol):
    LogFile = create_log(LogFileName, username) #cria o arquivo log

    #salvando nome da dinamica para exibir na execução
    f = open(Config.UPLOAD_FOLDER+username+'/'+'namedynamic.txt','w')
    f.write(filename)
    f.close()


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
        data = '{}'.format(datetime.now().replace(microsecond=0).isoformat())
        info = data + '|' + filename + '\n'
        f.write(info)
        f.close()
        
    except OSError as e:
        if e.errno == errno.EEXIST:
            f = open(diretorio,'a')
            data = '{}'.format(datetime.now().replace(microsecond=0).isoformat())
            info = data + '|' + filename + '\n'
            f.write(info)
            f.close()
                     

    #abrir arquivo
    with open(CommandsFileName) as f: #CODIGO PARA A PRODUÇÃO
        content = f.readlines()
    lines = [line.rstrip('\n') for line in content if line is not '\n'] #cancela as linhas em branco do arquivo
    
    for l in lines:
        if l[0] == '#':
            WriteUserDynamics(l, username)

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
            
            #procura e adiciona em um novo arquivo 
            comando_junta_atom = 'grep -h ATOM {}_livre.pdb {}.pdb >| {}_complx.pdb'.format(mol, groname, mol)
            subprocess.call(comando_junta_atom, shell=True, stdin=LogFile, stdout=LogFile, stderr=LogFile)

            ## 
            atomtypes = []
            diretorio_itp = RunFolder + itpname
            with open(diretorio_itp, 'r') as f:
                found = False
                for line in f:
                    if found:
                        if line is "\n":
                            break
                        atomtypes.append(line)
                    if 'atomtypes' in line:
                        found = True
                        atomtypes.append(line)

            ## comando 1
            comando_gerar_molecula_complexada = 'cat {}_livre.top | sed \'/forcefield\.itp\"/a\#include "{}"\' >| {}1_complx.top'.format(mol,itpname,mol)
            subprocess.call(comando_gerar_molecula_complexada, shell=True, stdin=LogFile, stdout=LogFile, stderr=LogFile)

            with open(f"{RunFolder}{mol}1_complx.top", "r") as f:
                with open(f"{RunFolder}{mol}_complx.top", "w") as f1:
                    for line in f:
                        f1.write(line)
                        if 'forcefield.itp' in line:
                            f1.write("\n")
                            f1.writelines(atomtypes)

            #acessando arquivo .itp para pegar o moleculetype
            #pronto
            diretorio_itp = RunFolder + itpname
            file = open(diretorio_itp,'r')
            file_itp = file.readlines()
            file.close()
            for i, text in enumerate(file_itp):
                if text.find('moleculetype') > -1:
                    molecula = file_itp[i + 2]
                    molecula = molecula.split()[0]
                    molecula = molecula + '                 1'
                    break
            
            #aqui vai o echo ligand 1
            comando_moleculetype = 'echo "{}" >> {}_complx.top'.format(molecula,mol)
            subprocess.call(comando_moleculetype, shell=True, stdin=LogFile, stdout=LogFile, stderr=LogFile)

            
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


def WriteUserDynamics(line, username):
    filename = Config.UPLOAD_FOLDER + username + '/executingLig'
    try:
        f = open(filename, 'a')
        f.write(line + '\n')
        f.close()
    except OSError:
        print('erro ao adicionar linha no arquivo de dinamica-usuario')
        raise