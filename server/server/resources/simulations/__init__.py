import os
from flask import request
from flask_restful import Resource
from server.config import Config


class UserSimulations(Resource):
    def get(self):
        args = request.args

        folder_user = os.path.abspath(
            os.path.join(Config.UPLOAD_FOLDER, args["username"])
        )

        file_simulations_list = os.path.abspath(
            os.path.join(folder_user, "dynamics.list")
        )

        file_is_running = os.path.abspath(os.path.join(folder_user, "is-running"))

        running_simulation = ""

        if os.path.isfile(file_is_running):
            with open(file_is_running, "r") as f:
                running_simulation = f.readline()

        if not os.path.exists(file_simulations_list):
            return {"status": "no-simulations"}

        with open(file_simulations_list, "r") as f:
            simulations_list = f.readlines()

        simulations_list = simulations_list[-10:]

        returnable_simulations_list = []

        for simulation in simulations_list:
            extractable_data = simulation.split("/")

            file_celery_id = os.path.abspath(
                os.path.join(simulation.replace("\n", ""), "celery_id")
            )

            if os.path.exists(file_celery_id):
                with open(file_celery_id, "r") as f:
                    celery_id = f.readline()
            else:
                celery_id = "unknown"

            file_status_path = os.path.abspath(
                os.path.join(simulation.replace("\n", ""), "status")
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

            simulation_data = {
                "timestamp": extractable_data[0].replace("\n", ""),
                "type": extractable_data[2],
                "molecule": extractable_data[1],
                "celeryId": celery_id,
                "isRunning": simulation.replace("\n", "") == running_simulation,
                "status": status,
                "errored_command": errored_command if status == "error" else None,
            }

            returnable_simulations_list.append(simulation_data)

        return {
            "status": "has-simulations",
            "simulations": returnable_simulations_list[::-1],
        }
