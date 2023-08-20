import os
from flask import request
from flask_restful import Resource, reqparse
from celery import uuid
from server.celery import run_commands
from server.config import Config


class RunDynamic(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("folder", required=True, type=str, location="form")
        parser.add_argument("email", required=True, type=str, location="form")

        args = parser.parse_args()

        url = os.environ.get("MAILER_URL")

        # Get absolute path to run folder
        folder = os.path.abspath(args["folder"])

        username = folder.split("/")[::-1][3]
        file_is_running_path = os.path.abspath(
            os.path.join(Config.UPLOAD_FOLDER, username, "is-running")
        )

        if os.path.exists(file_is_running_path):
            return {"status": "running-or-queued"}

        task_id = uuid()

        run_commands.apply_async(
            (folder, url, args["email"]), task_id=task_id, retry=False
        )

        file_status_path = os.path.abspath(os.path.join(args["folder"], "status"))
        file_celery_id = os.path.abspath(os.path.join(args["folder"], "celery_id"))

        with open(file_is_running_path, "w") as f:
            f.write("queued")

        with open(file_celery_id, "w") as f:
            f.write(task_id)

        with open(file_status_path, "w") as f:
            f.write("queued")

        # Return a response indicating that the command has started
        return {"status": "queued"}

    def get(self):
        args = request.args

        username = args["username"]

        folder_user = os.path.abspath(os.path.join(Config.UPLOAD_FOLDER, username))

        file_is_running = os.path.abspath(os.path.join(folder_user, "is-running"))

        if os.path.exists(file_is_running):
            with open(file_is_running, "r") as f:
                folder = f.readline()
                if "queued" in folder:
                    return {"status": "queued"}

                extractable_data = folder.split("/")

            file_steps = os.path.abspath(os.path.join(folder, "steps.txt"))
            step = []
            if os.path.isfile(file_steps):
                with open(file_steps, "r") as f:
                    step = [l.strip().replace("#", "") for l in f.readlines()]

            file_gmx_log = os.path.abspath(
                os.path.join(folder, "run", "logs", "gmx.log")
            )

            log_lines = []
            if os.path.isfile(file_gmx_log):
                with open(file_gmx_log, "r") as f:
                    log_lines = [l.strip() for l in f.readlines()]

            file_celery_id = os.path.abspath(os.path.join(folder, "celery_id"))

            with open(file_celery_id, "r") as f:
                celery_id = f.readline()

            extractable_data = extractable_data[::-1]

            data = {
                "timestamp": extractable_data[0],
                "type": extractable_data[2],
                "molecule": extractable_data[1],
                "celeryId": celery_id,
                "folder": folder,
            }

            log_lines = log_lines[-30:]

            return {
                "info": data,
                "steps": step,
                "log": log_lines[::-1],
                "status": "running",
            }

        return {"status": "not-running"}
