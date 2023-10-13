from flask_restful import Resource
from server.worker import celery


class CeleryActiveTasks(Resource):
    def get(self):
        return celery.control.inspect().active()
