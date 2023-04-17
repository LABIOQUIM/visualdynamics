from flask_restful import Resource, reqparse
from server.celery import celery


class CeleryReservedTasks(Resource):
    def get(self):
        return {
            "reservedTasks": celery.control.inspect(
                ["worker@visualdynamics"]
            ).reserved()
        }
