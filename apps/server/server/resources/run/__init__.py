import os
from flask import request
from flask_restful import Resource, reqparse
from celery import uuid
from server.celery_tasks import run_commands
from server.config import Config


class RunDynamic(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("folder", required=True, type=str, location="form")

        args = parser.parse_args()

        # Get absolute path to run folder
        folder = os.path.abspath(args["folder"])

        task_id = uuid()

        run_commands.apply_async((folder,), task_id=task_id)

        file_status_path = os.path.abspath(os.path.join(args["folder"], "status"))
        file_celery_id = os.path.abspath(os.path.join(args["folder"], "celery_id"))

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
            }

            log_lines = log_lines[-30:]

            return {
                "info": data,
                "steps": step,
                "log": log_lines[::-1],
                "status": "running",
            }

        return {"status": "not-running"}
