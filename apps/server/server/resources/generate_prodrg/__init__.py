from flask_restful import Resource


class GenerateProdrgCommands(Resource):
    def get(self):
        return {"hello": "world"}
