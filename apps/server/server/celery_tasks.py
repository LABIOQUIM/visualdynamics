import os
import shutil
import time
from server.config import Config
from server.utils.run_command import run_command
from server.celery import celery
from celery.contrib.abortable import AbortableTask


@celery.task(bind=True, name="Run Dynamic", base=AbortableTask)
def run_commands(self, folder):
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

    # Copy each file to our run folder
    for file in list_files_mdp:
        file_path = os.path.join(folder_mdp, file)
        if os.path.isfile(file_path):
            shutil.copy(file_path, folder_run)

    # UPDATE STATUS ON DB THAT `dynamic_id` is now running

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
            (_, rcode) = run_command(command, file_log_path, file_pid_path)

            if rcode != 0 and rcode != None:
                # UPDATE ON DB THAT EXECUTION FAILED

                # SEND MAIL NOTIFYING DYNAMIC ERRORED
                with open(file_status_path, "w") as f:
                    f.write(f"error: {command}")
                return

    # UPDATE ON DB THAT EXECUTION ENDED WITH SUCCESS

    # SEND EMAIL NOTIFYING DYNAMIC ENDED

    with open(file_status_path, "w") as f:
        f.write("finished")

    if os.path.exists(file_is_running):
        os.remove(file_is_running)
