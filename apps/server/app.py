from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from server.config import Config
from server.resources.celery.active_tasks import CeleryActiveTasks
from server.resources.celery.reserved_tasks import CeleryReservedTasks
from server.resources.downloads.archive import DownloadDynamicArchive
from server.resources.downloads.commands import DownloadDynamicCommands
from server.resources.downloads.figures import DownloadDynamicFigures
from server.resources.downloads.log import DownloadDynamicLog
from server.resources.downloads.mdp import DownloadMDP
from server.resources.downloads.results import DownloadDynamicResults
from server.resources.generate.acpype import GenerateACPYPE
from server.resources.generate.apo import GenerateAPO
from server.resources.generate.prodrg import GeneratePRODRG
from server.resources.health import Health
from server.resources.run import RunDynamic
from server.resources.run.abort import AbortDynamic
from server.resources.user_dynamics import UserDynamics
from server.resources.mdpr import MDPR
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.config.from_object(Config)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
api = Api(app)

CORS(app)

# Command sequence generation
api.add_resource(GenerateACPYPE, "/api/v1/generate/acpype")
api.add_resource(GenerateAPO, "/api/v1/generate/apo")
api.add_resource(GeneratePRODRG, "/api/v1/generate/prodrg")

# Command sequence execution
api.add_resource(RunDynamic, "/api/v1/run")
api.add_resource(AbortDynamic, "/api/v1/run/abort")

# Downloads
api.add_resource(DownloadDynamicCommands, "/api/v1/downloads/commands")
api.add_resource(DownloadDynamicFigures, "/api/v1/downloads/figures")
api.add_resource(DownloadDynamicLog, "/api/v1/downloads/log")
api.add_resource(DownloadDynamicResults, "/api/v1/downloads/results")
api.add_resource(DownloadMDP, "/api/v1/downloads/mdp")
api.add_resource(DownloadDynamicArchive, "/api/v1/downloads/archive")

# API status
api.add_resource(Health, "/api/v1/health")

# User dynamics
api.add_resource(UserDynamics, "/api/v1/dynamics")

# Celery data
api.add_resource(CeleryReservedTasks, "/api/v1/celery/queued")
api.add_resource(CeleryActiveTasks, "/api/v1/celery/active")

# Update MDFiles
api.add_resource(MDPR, "/api/v1/mdpr")


if __name__ == "__main__":
    app.run()
