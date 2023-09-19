import io
import os
from flask_restful import Resource
from flask import request, send_file
from server.config import Config

class DownloadDynamicCommands(Resource):
    def get(self):
        args = request.args

        username = args["username"]
        simtype = args["type"]

        SIMULATION_FOLDER_PATH = os.path.join(Config.UPLOAD_FOLDER, username, simtype)

        if os.path.exists(SIMULATION_FOLDER_PATH):
            SIMULATION_COMMANDS_TXT_PATH = os.path.join(SIMULATION_FOLDER_PATH, "commands.txt")

            download_filename = (
                f"{simtype}-commands.txt"
            )

            return send_file(
                SIMULATION_COMMANDS_TXT_PATH, as_attachment=True, download_name=download_filename
            )
        
        # Use BytesIO instead of StringIO here.
        buffer = io.BytesIO()
        buffer.write(b'The simulation you\'re trying to retrieve was not found')
        # Or you can encode it to bytes.
        # buffer.write('Just some letters.'.encode('utf-8'))
        buffer.seek(0)
        return send_file(
            buffer,
            as_attachment=True,
            download_name='simulation-not-found.txt',
            mimetype='text/txt'
        )
