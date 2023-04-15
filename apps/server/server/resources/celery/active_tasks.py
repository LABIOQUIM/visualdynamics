from flask_restful import Resource, reqparse
from server.celery import celery


class CeleryActiveTasks(Resource):
    def get(self):
        return {"activeTasks": celery.control.inspect().active()}
