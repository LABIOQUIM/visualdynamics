import os
import shutil
from server.config import Config
from server.utils.run_command import run_command
from server.celery import celery
from celery.contrib.abortable import AbortableTask
import requests


@celery.task(bind=True, name="Run Dynamic", base=AbortableTask)
def run_commands(self, folder, dynamics_mailer_api_url, email):
    # Get absolute path to the folder where our default MDP files are stored
    folder_mdp = os.path.abspath(Config.MDP_LOCATION_FOLDER)

    # Get a list of the files in the MDP folder
    list_files_mdp = os.listdir(folder_mdp)

    folder_run = os.path.abspath(os.path.join(folder, "run"))
    file_log_path = os.path.abspath(os.path.join(folder_run, "logs", "gmx.log"))
    file_status_path = os.path.abspath(os.path.join(folder, "status"))
    file_step_path = os.path.abspath(os.path.join(folder, "steps.txt"))
    file_is_running = os.path.abspath(
        os.path.join(folder, "..", "..", "..", "is-running")
    )
    file_pid_path = os.path.join(folder_run, "pid_file")

    file_molecule = folder.split("/")[::-1][1]
    file_molecule = os.path.abspath(os.path.join(folder_run, f"{file_molecule}.pdb"))

    dynamic_data = folder.split("/")[::-1]

    with open(file_molecule, "r") as f:
        atom_count = sum(1 for line in f if "ATOM" in line)

    if int(atom_count) > 10000:
        # SEND MAIL NOTIFYING DYNAMIC ERRORED
        requests.get(
            f"http://{dynamics_mailer_api_url}/api/mailer/dynamics/failed?to={email}&dynamicType={dynamic_data[2]}&dynamicMolecule={dynamic_data[1]}"
        )

        with open(file_status_path, "w") as f:
            f.write(f"error: hm5ka")

        if os.path.exists(file_is_running):
            os.remove(file_is_running)
        raise Exception("Too Much ATOMS")

    # Copy each file to our run folder
    for file in list_files_mdp:
        file_path = os.path.join(folder_mdp, file)
        if os.path.isfile(file_path):
            shutil.copy(file_path, folder_run)

    # Load commands file contents to  a variable
    file_commands_path = os.path.join(folder, "commands.txt")
    with open(file_commands_path, "r") as f:
        commands_file_content = f.readlines()

    # Make each line of the file as a item in the excution array
    commands = [line.rstrip("\n") for line in commands_file_content if line != "\n"]

    # Make our shell go to the run folder
    os.chdir(folder_run)

    with open(file_is_running, "w") as f:
        f.write(folder)

    with open(file_status_path, "w") as f:
        f.write("running")

    # Iterate in our command list
    for command in commands:
        if command[0] == "#":
            with open(file_step_path, "a+") as f:
                f.write(f"{command}\n")
        else:
            try:
                run_command(command, file_log_path, file_pid_path)
            except:
                # SEND MAIL NOTIFYING DYNAMIC ERRORED
                requests.get(
                    f"http://{dynamics_mailer_api_url}/api/mailer/dynamics/failed?to={email}&dynamicType={dynamic_data[2]}&dynamicMolecule={dynamic_data[1]}"
                )

                with open(file_status_path, "w") as f:
                    f.write(f"error: {command}")

                if os.path.exists(file_is_running):
                    os.remove(file_is_running)
                raise Exception(f"Command {command} failed to run")

    # SEND EMAIL NOTIFYING DYNAMIC ENDED
    requests.get(
        f"http://{dynamics_mailer_api_url}/api/mailer/dynamics/success?to={email}&dynamicType={dynamic_data[2]}&dynamicMolecule={dynamic_data[1]}"
    )

    with open(file_status_path, "w") as f:
        f.write("finished")

    if os.path.exists(file_is_running):
        os.remove(file_is_running)
