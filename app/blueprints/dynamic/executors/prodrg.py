from ....config import Config
from datetime import datetime
import subprocess, os, sys, shutil
import errno


def execute(folder, LogFileName, CommandsFileName, username, filename, itpname, groname, mol):
    LogFile = create_log(LogFileName, username) #cria o arquivo log

    #salvando nome da dinamica para exibir na execução
    f = open(Config.UPLOAD_FOLDER+username+'/'+'namedynamic.txt','w')
    f.write(filename)
    f.close()


    #transferir os arquivos mdp necessarios para a execução
    RunFolder = os.path.join(folder, "run") #pasta q vai rodar
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
            print("in break")
            #cria o novo arquivo com a molecula complexada
            #pronto 
            diretorio_ltop = os.path.join(RunFolder, f"{mol}_livre.top")
            diretorio_complx_top = os.path.join(RunFolder, f"{mol}_complx.top")
            with open(diretorio_ltop, 'r') as f:
                print("in break1")
                with open(diretorio_complx_top, "w") as f1:
                    print("in break2")
                    f1.writelines(f.read())

            #cria o novo arquivo com a molecula complexada
            #pronto
            with open(diretorio_complx_top, 'r') as file:
                file_complx_top = file.readlines()

            for i, text in enumerate(file_complx_top):
                if 'system' in text:
                    file_complx_top[i-1] = file_complx_top[i-1].replace('\n', '\n; Include ligand topology\n#include "{}"\n\n'.format(itpname))
                    with open(diretorio_complx_top, 'w') as file:
                        file.writelines(file_complx_top)
            
            #acessando arquivo .itp para pegar o moleculetype
            #pronto
            diretorio_itp = os.path.join(RunFolder, itpname)
            with open(diretorio_itp, 'r') as file:
                file_itp = file.readlines()

            for i, text in enumerate(file_itp):
                if 'moleculetype' in text:
                    molecula = file_itp[i+2].split(' ')[0].rstrip()
                    molecula = '{:<20} 1\n'.format(molecula)
                    
                    with open(diretorio_complx_top, 'r') as file:
                        file_complx_top = file.readlines()
                    
                    file_complx_top.append(molecula)
                    
                    with open(diretorio_complx_top, 'w') as file:
                        file.writelines(file_complx_top)
             
            #modificando o arquivo .gro
            #pronto
            diretorio_gro = os.path.join(RunFolder, groname)

            with open(diretorio_gro, 'r') as file:
                file_gro = file.readlines()

            valor_gro = int(file_gro[1].strip())
            file_gro = file_gro[2:-1]

            diretorio_lgro = os.path.join(RunFolder, f"{mol}_livre.gro")
            diretorio_complx_gro =  os.path.join(RunFolder, f"{mol}_complx.gro")

            with open(diretorio_lgro, 'r') as file:
                file_lgro = file.readlines()

            last_line = file_lgro[-1]
            file_lgro = file_lgro[:-1]

            with open(diretorio_complx_gro, 'w') as file:
                file.write(''.join(file_lgro))
                file.write(''.join(file_gro))
                file.write(last_line)

            with open(diretorio_complx_gro, 'r') as file:
                file_complx_gro = file.readlines()

            valor_complx_gro = int(file_complx_gro[1].strip())
            total = valor_gro + valor_complx_gro

            with open(diretorio_complx_gro, 'w') as file:
                file_complx_gro[1] = ' {:>5}\n'.format(total)
                file.write(''.join(file_complx_gro))

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
                                                            '.log')
        
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