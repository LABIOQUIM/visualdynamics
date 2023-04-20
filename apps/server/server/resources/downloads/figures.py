import os
import shutil
import zipfile
from flask_restful import Resource
from flask import request, send_file
from server.celery import celery
from celery.contrib.abortable import AbortableAsyncResult


class DownloadDynamicFigures(Resource):
    def get(self):
        args = request.args

        task = AbortableAsyncResult(args["taskId"], app=celery)

        folder_dynamic_path = os.path.abspath(task.args[0])
        folder_run_path = os.path.abspath(os.path.join(folder_dynamic_path, "run"))
        folder_figures_path = os.path.abspath(
            os.path.join(folder_dynamic_path, "figures")
        )
        file_figures_zip = os.path.abspath(
            os.path.join(folder_figures_path, "figures.zip")
        )

        for folder, _, files in os.walk(folder_run_path):
            for file in files:
                if file.endswith(".xvg"):
                    file = os.path.join(folder_run_path, file)
                    shutil.move(file, folder_figures_path)

        zf = zipfile.ZipFile(file_figures_zip, "w")

        for folder, _, files in os.walk(folder_figures_path):
            for file in files:
                if not file.endswith(".zip"):
                    zf.write(
                        os.path.join(folder, file),
                        file,
                        compress_type=zipfile.ZIP_DEFLATED,
                    )
        zf.close()

        dynamic_data = task.args[0].split("/")

        stripped_timestamp_folder = dynamic_data[9].replace("\n", "")
        download_filename = f"{dynamic_data[7]}|{dynamic_data[8]}|{stripped_timestamp_folder}|figures.zip"

        return send_file(
            file_figures_zip, as_attachment=True, download_name=download_filename
        )
