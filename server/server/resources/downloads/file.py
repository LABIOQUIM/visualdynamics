import os
from flask_restful import Resource
from flask import request, send_file
from server.config import Config


class DownloadSimulationFile(Resource):
    def get(self):
        args = request.args

        file_path = args["fullPath"]

        file_abs_path = os.path.abspath(os.path.join(Config.UPLOAD_FOLDER, file_path))

        dynamic_data = file_path.split("/")[::-1]

        stripped_timestamp_folder = dynamic_data[1].replace("\n", "")
        download_filename = f"{dynamic_data[3]}|{dynamic_data[2]}|{stripped_timestamp_folder}|{dynamic_data[0]}"

        return send_file(
            file_abs_path, as_attachment=True, download_name=download_filename
        )
