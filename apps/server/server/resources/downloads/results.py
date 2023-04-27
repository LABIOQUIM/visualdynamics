import os
import zipfile
from flask_restful import Resource
from flask import request, send_file
from server.celery import celery
from celery.contrib.abortable import AbortableAsyncResult


class DownloadDynamicResults(Resource):
    def get(self):
        args = request.args

        task = AbortableAsyncResult(args["taskId"], app=celery)

        folder_dynamic_path = os.path.abspath(task.args[0])
        folder_run_path = os.path.abspath(os.path.join(folder_dynamic_path, "run"))
        file_results_zip = os.path.abspath(
            os.path.join(folder_dynamic_path, "results.zip")
        )

        with zipfile.ZipFile(file_results_zip, "w") as z:
            for folder, _, files in os.walk(folder_run_path):
                for file in files:
                    if file.endswith("_PBC.xtc") or file.endswith("_pr.tpr"):
                        z.write(
                            os.path.join(folder, file),
                            file,
                            compress_type=zipfile.ZIP_DEFLATED,
                        )

        dynamic_data = task.args[0].split("/")

        stripped_timestamp_folder = dynamic_data[9].replace("\n", "")
        download_filename = f"{dynamic_data[7]}|{dynamic_data[8]}|{stripped_timestamp_folder}|results.zip"

        return send_file(
            file_results_zip, as_attachment=True, download_name=download_filename
        )
