import os
from flask_restful import Resource
from flask import request, send_file
from server.celery import celery
from celery.contrib.abortable import AbortableAsyncResult


class DownloadDynamicLog(Resource):
    def get(self):
        args = request.args

        task = AbortableAsyncResult(args["taskId"], app=celery)

        folder_dynamic_path = os.path.abspath(task.args[0])
        file_log_path = os.path.abspath(
            os.path.join(folder_dynamic_path, "run", "logs", "gmx.log")
        )

        dynamic_data = task.args[0].split("/")

        stripped_timestamp_folder = dynamic_data[9].replace("\n", "")
        download_filename = (
            f"{dynamic_data[7]}|{dynamic_data[8]}|{stripped_timestamp_folder}.log"
        )

        return send_file(
            file_log_path, as_attachment=True, download_name=download_filename
        )
