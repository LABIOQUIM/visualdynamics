from app.utils.run_dynamics_command import run_dynamics_command
from ....config import Config
import subprocess, os, shutil
from ....utils.send_email import send_dynamic_success_email


def execute(folder, CommandsFileName, username, filename, itpname, groname, mol):
    # salvando nome da dinamica para exibir na execução
    with open(
        os.path.join(Config.UPLOAD_FOLDER, username, "running_protein_name"), "w"
    ) as f:
        protein_name, _ = os.path.splitext(os.path.basename(filename))
        f.write(protein_name)

    # transferir os arquivos mdp necessarios para a execução
    RunFolder = os.path.join(folder, "run")  # pasta q vai rodar
    SecureMdpFolder = os.path.join(os.path.expanduser("~"), Config.MDP_LOCATION_FOLDER)
    MDPList = os.listdir(SecureMdpFolder)

    for mdpfile in MDPList:
        # armazenar o nome completo do arquivo, seu caminho dentro sistema operacional
        fullmdpname = os.path.join(SecureMdpFolder, mdpfile)
        if os.path.isfile(fullmdpname):
            shutil.copy(fullmdpname, RunFolder)

    # Use the `with` statement to open the file in 'x+' mode
    with open(os.path.join(Config.UPLOAD_FOLDER, username, "info_dynamics"), "a+") as f:
        f.write(f"{folder}\n")

    with open(os.path.join(Config.UPLOAD_FOLDER, username, "log_dir"), "w") as f:
        f.write(os.path.join(folder, "run", "logs", f"gmx-commands.log"))

    # abrir arquivo
    with open(CommandsFileName) as f:  # CODIGO PARA A PRODUÇÃO
        content = f.readlines()
    lines = [line.rstrip("\n") for line in content if line is not "\n"]
    linux_log_file_path = os.path.join(folder, "run", "logs", f"linux-commands.log")

    with open(os.path.join(folder, "status"), "w") as f:
        f.write(f"running\n")

    for l in lines:
        if l[0] == "#":
            WriteUserDynamics(l, username)
        else:
            os.chdir(RunFolder)
            try:
                (pid, rcode) = run_dynamics_command(
                    l, os.path.join(folder, "run", "logs", f"gmx-commands.log")
                )
                with open(os.path.join(folder, "status"), "w") as f:
                    f.writelines(["running\n", f"{pid}\n"])

            except:
                with open(os.path.join(folder, "status"), "w") as f:
                    f.write(f"error: {l}\n")
                os.remove(os.path.join(Config.UPLOAD_FOLDER, username, "executing"))
                os.remove(
                    os.path.join(Config.UPLOAD_FOLDER, username, "running_protein_name")
                )
                os.remove(os.path.join(Config.UPLOAD_FOLDER, username, "log_dir"))
                os.remove(os.path.join(Config.UPLOAD_FOLDER, username, "pid"))
                return f"{l}"

    with open(os.path.join(folder, "status"), "w") as f:
        f.write(f"success\n")

    send_dynamic_success_email(username, filename, "ACPYPE")

    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, "executing"))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, "running_protein_name"))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, "log_dir"))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, username, "pid"))


def WriteUserDynamics(line, username):
    filename = os.path.join(Config.UPLOAD_FOLDER, username, "executing")
    try:
        f = open(filename, "a")
        f.write(line + "\n")
        f.close()
    except OSError:
        print("erro ao adicionar linha no arquivo de dinamica-usuario")
        raise
