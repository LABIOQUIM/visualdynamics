import os
import json
from flask_restful import Resource, request
from server.config import Config


class UserSimulationsTree(Resource):
    def get(self):
        args = request.args

        folder_user_path = os.path.abspath(
            os.path.join(Config.UPLOAD_FOLDER, args["username"])
        )

        def path_to_dict(path):
            d = {"name": os.path.basename(path)}
            if os.path.isdir(path):
                d["type"] = "directory"
                d["children"] = [
                    path_to_dict(os.path.join(path, x)) for x in os.listdir(path)
                ]
            else:
                d["type"] = "file"
            return d

        if not os.path.exists(folder_user_path):
            return {"status": "not-found"}

        return path_to_dict(folder_user_path)
