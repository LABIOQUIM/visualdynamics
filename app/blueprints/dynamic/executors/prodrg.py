from app.utils.run_dynamics_command import run_dynamics_command
from ....config import Config
import os, shutil
from ....utils.send_email import send_dynamic_success_email


def execute(folder, CommandsFileName, username, filename, itpname, groname, mol, email):
    #salvando nome da dinamica para exibir na execução
    with open(os.path.join(Config.UPLOAD_FOLDER, username, 'running_protein_name'), 'w') as f:
        protein_name, _ = os.path.splitext(os.path.basename(filename))
        f.write(protein_name)

    #transferir os arquivos mdp necessarios para a execução
    RunFolder = os.path.join(folder, "run") #pasta q vai rodar
    SecureMdpFolder = os.path.join(os.path.expanduser('~'),Config.MDP_LOCATION_FOLDER)
    MDPList = os.listdir(SecureMdpFolder)

    for mdpfile in MDPList:
        #armazenar o nome completo do arquivo, seu caminho dentro sistema operacional
        fullmdpname = os.path.join(SecureMdpFolder, mdpfile)
        if (os.path.isfile(fullmdpname)):
            shutil.copy(fullmdpname, RunFolder)
    
    # Use the `with` statement to open the file in 'x+' mode
    with open(os.path.join(Config.UPLOAD_FOLDER, username, 'info_dynamics'), 'a+') as f:
        f.write(f"{folder}\n")

    with open(os.path.join(Config.UPLOAD_FOLDER, username, "log_dir"), "w") as f:
        f.write(os.path.join(folder, "run", "logs", f"gmx-commands.log"))

    #abrir arquivo
    with open(CommandsFileName) as f: #CODIGO PARA A PRODUÇÃO
        content = f.readlines()
    lines = [line.rstrip('\n') for line in content if line is not '\n'] #cancela as linhas em branco do arquivo
    
    with open(os.path.join(folder, 'status'), 'w') as f:
        f.write(f"running\n")

    for l in lines:
        if l[0] == '#':
            WriteUserDynamics(l, username)
        else:
            os.chdir(RunFolder)
            (pid, rcode) = run_dynamics_command(l, os.path.join(folder, "run", "logs", f"gmx-commands.log"))
            with open(os.path.join(folder, 'status'), 'w') as f:
                f.writelines([
                    "running\n",
                    f"{pid}\n"
                ])
            if rcode != 0 and rcode != None:
                with open(os.path.join(folder, 'status'), 'w') as f:
                    f.write(f"error: {l}\n")
                os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'executing'))
                os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'running_protein_name'))
                os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'log_dir'))
                return f"{l}"
        
        #breakpoint adicionado para possibilitar a interação com os arquivos em tempo de execução
        if l == '#break':
            #cria o novo arquivo com a molecula complexada
            #pronto 
            diretorio_ltop = os.path.join(RunFolder, f"{mol}_livre.top")
            diretorio_complx_top = os.path.join(RunFolder, f"{mol}_complx.top")
            with open(diretorio_ltop, 'r') as f:
                with open(diretorio_complx_top, "w") as f1:
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

    with open(os.path.join(folder, 'status'), 'w') as f:
        f.write(f"success\n")
    
    send_dynamic_success_email(username, email)
    
    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'executing'))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'running_protein_name'))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'log_dir'))


def WriteUserDynamics(line,username):
    filename = os.path.join(Config.UPLOAD_FOLDER, username, 'executing')
    try:
        f = open(filename,'a')
        f.write(line + '\n')
        f.close()
    except OSError:
        print('erro ao adicionar linha no arquivo de dinamica-usuario')
        raise