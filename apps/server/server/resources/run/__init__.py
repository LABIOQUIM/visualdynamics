import os
import shutil
from flask import request
from flask_restful import Resource, reqparse
from server.celery_tasks import run_commands
from server.config import Config


class RunDynamic(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("folder", required=True, type=str, location="form")

        args = parser.parse_args()

        # Get absolute path to run folder
        folder = os.path.abspath(args["folder"])

        run_commands.delay(folder)

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
