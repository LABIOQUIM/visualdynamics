import os
from flask import request
from flask_restful import Resource, reqparse
from server.config import Config


class UserDynamics(Resource):
    def get(self):
        args = request.args

        folder_user = os.path.abspath(
            os.path.join(Config.UPLOAD_FOLDER, args["username"])
        )

        file_dynamics_list = os.path.abspath(os.path.join(folder_user, "dynamics.list"))

        file_is_running = os.path.abspath(os.path.join(folder_user, "is-running"))

        running_dynamic = ""

        if os.path.isfile(file_is_running):
            with open(file_is_running, "r") as f:
                running_dynamic = f.readline()

        if not os.path.exists(file_dynamics_list):
            return {"status": "no-dynamics"}

        with open(file_dynamics_list, "r") as f:
            dynamics_list = f.readlines()

        dynamics_list = dynamics_list[-10:]

        returnable_dynamics_list = []

        for dynamic in dynamics_list:
            extractable_data = dynamic.split("/")

            file_celery_id = os.path.abspath(
                os.path.join(dynamic.replace("\n", ""), "celery_id")
            )

            if os.path.exists(file_celery_id):
                with open(file_celery_id, "r") as f:
                    celery_id = f.readline()
            else:
                celery_id = "unknown"

            file_status_path = os.path.abspath(
                os.path.join(dynamic.replace("\n", ""), "status")
            )

            if os.path.exists(file_status_path):
                with open(file_status_path, "r") as f:
                    status = f.readline()
                    if status.startswith("error"):
                        status = status.split(":")
                        errored_command = status[1].strip()
                        status = status[0]
            else:
                status = "canceled"

            extractable_data = extractable_data[::-1]

            dynamic_data = {
                "timestamp": extractable_data[0].replace("\n", ""),
                "type": extractable_data[2],
                "molecule": extractable_data[1],
                "celeryId": celery_id,
                "isRunning": dynamic.replace("\n", "") == running_dynamic,
                "status": status,
                "errored_command": errored_command if status == "error" else None,
            }

            returnable_dynamics_list.append(dynamic_data)

        return {"status": "listed", "dynamics": returnable_dynamics_list[::-1]}
