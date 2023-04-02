import threading
import json
import os
import shutil
from flask_restful import Resource, reqparse
from server.config import Config
from server.utils.run_command import run_command


class RunDynamic(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("folder_run", required=True, type=str, location="form")

        args = parser.parse_args()

        # Get absolute path to run folder
        folder_run = os.path.abspath(args["folder_run"])

        # Get absolute path to the folder where our default MDP files are stored
        folder_mdp = os.path.abspath(Config.MDP_LOCATION_FOLDER)

        # Get a list of the files in the MDP folder
        list_files_mdp = os.listdir(folder_mdp)

        # Copy each file to our run folder
        for file in list_files_mdp:
            file_path = os.path.join(folder_mdp, file)
            if os.path.isfile(file_path):
                shutil.copy(file_path, folder_run)

        file_log_path = os.path.join(folder_run, "logs", "gmx.log")
        file_step_path = os.path.join(folder_run, "..", "steps.txt")

        # UPDATE STATUS ON DB THAT `dynamic_id` is now running

        # Load commands file contents to  a variable
        file_commands_path = os.path.join(folder_run, "..", "commands.txt")
        with open(file_commands_path, "r") as f:
            commands_file_content = f.readlines()

        # Make each line of the file as a item in the excution array
        commands = [line.rstrip("\n") for line in commands_file_content if line != "\n"]

        # Prepare a file to house our current PID
        file_pid_path = os.path.join(folder_run, "pid_file")

        def run_commands():
            # Make our shell go to the run folder
            os.chdir(folder_run)

            # Iterate in our command list
            for command in commands:
                if command[0] == "#":
                    with open(file_step_path, "w+") as f:
                        f.write(f"{command}\n")
                else:
                    (pid, rcode) = run_command(command, file_log_path)

                    with open(file_pid_path, "w") as f:
                        f.write(f"{pid}\n")

                    if rcode != 0 and rcode != None:
                        # UPDATE ON DB THAT EXECUTION FAILED

                        # SEND MAIL NOTIFYING DYNAMIC ERRORED
                        return {"status": "errored"}
                        # ws.close(reason="errored", message=command)

            # UPDATE ON DB THAT EXECUTION ENDED WITH SUCCESS

            # SEND EMAIL NOTIFYING DYNAMIC ENDED
            # ws.close(reason="success")
            return {
                "status": "success",
            }

        # Start the command execution in a new thread
        thread = threading.Thread(target=run_commands)
        thread.start()

        # Return a response indicating that the command has started
        return {"status": "started"}
