from flask_restful import Resource


class DownloadDynamicAssets(Resource):
    def get(self):
        return {"hello": "world"}
