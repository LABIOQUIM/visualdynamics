from io import BytesIO
import os
from flask_restful import Resource
from flask import request, send_file
from server.config import Config


class DownloadDynamicArchive(Resource):
    def get(self):
        args = request.args

        username = args["username"]

        folder_vdfiles = os.path.abspath(Config.UPLOAD_FOLDER)
        file_archive = os.path.abspath(
            os.path.join(folder_vdfiles, username, "archive.zip")
        )

        download_filename = f"{username}-archive.zip"

        if not os.path.exists(file_archive):
            buffer = BytesIO()
            file_text = (
                f"The user {username} doesn't have any dynamics on the old system."
            )
            buffer.write(file_text.encode("utf-8"))
            buffer.seek(0)
            return send_file(
                buffer,
                as_attachment=True,
                download_name=f"{username}-no-archive.txt",
                mimetype="text/txt",
            )

        return send_file(
            file_archive, as_attachment=True, download_name=download_filename
        )
