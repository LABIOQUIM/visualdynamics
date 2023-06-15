import os
import shutil
from flask_restful import Resource, reqparse
from server.config import Config


class CleanUserSimulations(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("username", required=True, type=str, location="form")

        args = parser.parse_args()

        folder_user_path = os.path.abspath(
            os.path.join(Config.UPLOAD_FOLDER, args["username"])
        )

        try:
            shutil.rmtree(folder_user_path)
        except:
            return {"status": "failed"}

        return {"status": "success"}
