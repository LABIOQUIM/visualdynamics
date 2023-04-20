from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from server.config import Config
from server.resources.celery.active_tasks import CeleryActiveTasks
from server.resources.celery.reserved_tasks import CeleryReservedTasks
from server.resources.downloads.commands import DownloadDynamicCommands
from server.resources.downloads.figures import DownloadDynamicFigures
from server.resources.downloads.log import DownloadDynamicLog
from server.resources.downloads.mdp import DownloadMDP
from server.resources.downloads.results import DownloadDynamicResults
from server.resources.generate_acpype import GenerateAcpypeCommands
from server.resources.generate_apo import GenerateApoCommands
from server.resources.health import Health
from server.resources.run import RunDynamic
from server.resources.run.abort import AbortDynamic
from server.resources.user_dynamics import UserDynamics

app = Flask(__name__)
app.config.from_object(Config)
api = Api(app)

CORS(app)

# Command sequence generation
api.add_resource(GenerateAcpypeCommands, "/api/v1/acpype")
api.add_resource(GenerateApoCommands, "/api/v1/apo")

# Command sequence execution
api.add_resource(RunDynamic, "/api/v1/run")
api.add_resource(AbortDynamic, "/api/v1/run/abort")

# Downloads
api.add_resource(DownloadDynamicCommands, "/api/v1/downloads/commands")
api.add_resource(DownloadDynamicFigures, "/api/v1/downloads/figures")
api.add_resource(DownloadDynamicLog, "/api/v1/downloads/log")
api.add_resource(DownloadDynamicResults, "/api/v1/downloads/results")
api.add_resource(DownloadMDP, "/api/v1/downloads/mdp")

# API status
api.add_resource(Health, "/api/v1/health")

# User dynamics
api.add_resource(UserDynamics, "/api/v1/dynamics")

# Celery data
api.add_resource(CeleryReservedTasks, "/api/v1/celery/reserved")
api.add_resource(CeleryActiveTasks, "/api/v1/celery/active")

if __name__ == "__main__":
    app.run(debug=True)
