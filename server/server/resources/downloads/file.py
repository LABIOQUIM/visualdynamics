import os
from flask_restful import Resource
from flask import request, send_file
from server.config import Config


class DownloadSimulationFile(Resource):
    def get(self):
        args = request.args

        file_path = args["fullPath"]

        file_abs_path = os.path.abspath(os.path.join(Config.UPLOAD_FOLDER, file_path))

        download_filename = f'{file_path.replace("/", "-")}'

        return send_file(
            file_abs_path, as_attachment=True, download_name=download_filename
        )
