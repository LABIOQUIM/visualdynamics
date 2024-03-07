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
                # Separate directories and non-directories
                directories = []
                non_directories = []
                for x in sorted(os.listdir(path)):
                    full_path = os.path.join(path, x)
                    if os.path.isdir(full_path):
                        directories.append(full_path)
                    else:
                        non_directories.append(full_path)

                # Sort directories and non-directories separately
                directories = sorted(directories)
                non_directories = sorted(non_directories)

                # Combine sorted lists and convert to dictionaries
                d["children"] = [path_to_dict(p) for p in directories] + [path_to_dict(p) for p in non_directories]
                d["type"] = "directory"
            else:
                d["type"] = "file"
            return d

        if not os.path.exists(folder_user_path):
            return {"status": "not-found"}

        return path_to_dict(folder_user_path)
