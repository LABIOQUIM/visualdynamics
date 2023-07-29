import os
import zipfile
from flask_restful import Resource
from flask import send_file
from server.config import Config
from datetime import datetime


class DownloadMDP(Resource):
    def get(self):
        folder_mdp_path = os.path.abspath(Config.MDP_LOCATION_FOLDER)

        file_mdp_zip = os.path.abspath(
            os.path.join(Config.MDP_LOCATION_FOLDER, "mdpfiles.zip")
        )

        zf = zipfile.ZipFile(file_mdp_zip, "w")

        for folder, _, files in os.walk(folder_mdp_path):
            for file in files:
                if file.endswith(".mdp"):
                    zf.write(
                        os.path.join(folder, file),
                        file,
                        compress_type=zipfile.ZIP_DEFLATED,
                    )

        zf.close()

        return send_file(
            file_mdp_zip,
            as_attachment=True,
            download_name=f"visualdynamics-mdpfiles-{datetime.now().replace(microsecond=0).isoformat()}.zip",
        )
