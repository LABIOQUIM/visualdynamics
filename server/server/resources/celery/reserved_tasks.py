from flask_restful import Resource
from server.worker import celery


class CeleryReservedTasks(Resource):
    def get(self):
        return celery.control.inspect().reserved()
