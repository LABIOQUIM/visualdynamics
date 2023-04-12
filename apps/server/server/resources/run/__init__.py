import os
import shutil
from flask import request
from flask_restful import Resource, reqparse
from server.celery_tasks import run_commands
from server.config import Config


class RunDynamic(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("folder_run", required=True, type=str, location="form")

        args = parser.parse_args()

        # Get absolute path to run folder
        folder_run = os.path.abspath(args["folder_run"])

        # Get absolute path to dynamic folder
        folder = os.path.abspath(os.path.join(folder_run, ".."))

        # Get absolute path to the folder where our default MDP files are stored
        folder_mdp = os.path.abspath(Config.MDP_LOCATION_FOLDER)

        # Get a list of the files in the MDP folder
        list_files_mdp = os.listdir(folder_mdp)

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

        run_commands.delay(folder, commands)

        # Return a response indicating that the command has started
        return {"status": "started"}

    def get(self):
        args = request.args

        user_id = args["user_id"]

        folder_user = os.path.abspath(os.path.join(Config.UPLOAD_FOLDER, user_id))

        file_is_running = os.path.abspath(os.path.join(folder_user, "is-running"))

        if os.path.exists(file_is_running):
            with open(file_is_running, "r") as f:
                folder = f.readline()

            file_gmx_log = os.path.abspath(
                os.path.join(folder, "run", "logs", "gmx.log")
            )

            with open(file_gmx_log, "r") as f:
                log_lines = f.readlines()

            return {"status": "running", "log": log_lines[-30:]}

        return {"status": "running", "folder": args["folder"]}
