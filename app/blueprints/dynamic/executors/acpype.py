from app.utils.run_dynamics_command import run_dynamics_command
from ....config import Config
import subprocess, os, shutil
from ....utils.send_email import send_dynamic_success_email

def execute(folder, CommandsFileName, username, filename, itpname, groname, mol, email):
    #salvando nome da dinamica para exibir na execução
    with open(os.path.join(Config.UPLOAD_FOLDER, username, 'running_protein_name'), 'w') as f:
        protein_name, _ = os.path.splitext(os.path.basename(filename))
        f.write(protein_name)

    #

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
    lines = [line.rstrip('\n') for line in content if line is not '\n']
    linux_log_file_path = os.path.join(folder, "run", "logs", f"linux-commands.log")

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
            
            #procura e adiciona em um novo arquivo 
            comando_junta_atom = 'grep -h ATOM {}_livre.pdb {} >| {}_complx.pdb'.format(mol, groname, mol)
            with open(linux_log_file_path, "a") as f:
                subprocess.call(comando_junta_atom, shell=True, stdin=f, stdout=f, stderr=f)

            ## 
            atomtypes = []
            diretorio_itp = os.path.join(RunFolder, itpname)
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
            with open(os.path.join(folder, "run", "logs", f"linux-commands.log"), 'a') as f:
                subprocess.call(comando_gerar_molecula_complexada, shell=True, stdin=f, stdout=f, stderr=f)

            with open(os.path.join(RunFolder, f"{mol}1_complx.top"), "r") as f:
                with open(os.path.join(RunFolder, f"{mol}_complx.top"), "w") as f1:
                    for line in f:
                        f1.write(line)
                        if 'forcefield.itp' in line:
                            f1.write("\n")
                            f1.writelines(atomtypes)

            #acessando arquivo .itp para pegar o moleculetype
            #pronto
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
            with open(os.path.join(folder, "run", "logs", f"linux-commands.log"), 'a') as f:
                subprocess.call(comando_moleculetype, shell=True, stdin=f, stdout=f, stderr=f)

    with open(os.path.join(folder, 'status'), 'w') as f:
        f.write(f"success\n")

    send_dynamic_success_email(username, email)

    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'executing'))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'running_protein_name'))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, 'log_dir'))



def WriteUserDynamics(line, username):
    filename = os.path.join(Config.UPLOAD_FOLDER, username, 'executing')
    try:
        f = open(filename, 'a')
        f.write(line + '\n')
        f.close()
    except OSError:
        print('erro ao adicionar linha no arquivo de dinamica-usuario')
        raise