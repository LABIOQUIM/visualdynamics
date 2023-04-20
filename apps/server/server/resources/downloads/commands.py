import os
from flask_restful import Resource
from flask import request, send_file
from server.celery import celery
from celery.contrib.abortable import AbortableAsyncResult


class DownloadDynamicCommands(Resource):
    def get(self):
        args = request.args

        task = AbortableAsyncResult(args["taskId"], app=celery)

        if task.ready():
            folder_dynamic_path = os.path.abspath(task.args[0])
            file_commands_path = os.path.abspath(
                os.path.join(folder_dynamic_path, "commands.txt")
            )

            dynamic_data = task.args[0].split("/")
        else:
            active_tasks = celery.control.inspect(["worker@visualdynamics"]).active()[
                "worker@visualdynamics"
            ]
            task = [
                active_task
                for active_task in active_tasks
                if active_task["id"] == args["taskId"]
            ][0]

            if task == None:
                reserved_tasks = celery.control.inspect(
                    ["worker@visualdynamics"]
                ).reserved()["worker@visualdynamics"]
                task = [
                    reserved_task
                    for reserved_task in reserved_tasks
                    if reserved_task["id"] == args["taskId"]
                ][0]

            folder_dynamic_path = os.path.abspath(task["args"][0])
            file_commands_path = os.path.abspath(
                os.path.join(folder_dynamic_path, "commands.txt")
            )
            dynamic_data = task["args"][0].split("/")

        stripped_timestamp_folder = dynamic_data[9].replace("\n", "")
        download_filename = (
            f"{dynamic_data[7]}|{dynamic_data[8]}|{stripped_timestamp_folder}.txt"
        )

        return send_file(
            file_commands_path, as_attachment=True, download_name=download_filename
        )
