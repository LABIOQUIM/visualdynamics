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
from server.resources.generate.acpype import GenerateACPYPE
from server.resources.generate.apo import GenerateAPO
from server.resources.generate.prodrg import GeneratePRODRG
from server.resources.health import Health
from server.resources.run import RunDynamic
from server.resources.run.abort import AbortDynamic
from server.resources.simulations import UserSimulations
from server.resources.simulations.clean import CleanUserSimulations
from server.resources.simulations.tree import UserSimulationsTree
from server.resources.mdpr import MDPR
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.config.from_object(Config)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
api = Api(app)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["https://visualdynamics.fiocruz.br", "http://localhost:3001"]
        }
    },
)

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

# API status
api.add_resource(Health, "/api/v1/health")

# User simulations
api.add_resource(UserSimulations, "/api/v1/simulations")
api.add_resource(CleanUserSimulations, "/api/v1/simulations/clean")
api.add_resource(UserSimulationsTree, "/api/v1/simulations/tree")

# Celery data
api.add_resource(CeleryReservedTasks, "/api/v1/celery/queued")
api.add_resource(CeleryActiveTasks, "/api/v1/celery/active")

# Update MDFiles
api.add_resource(MDPR, "/api/v1/mdpr")


if __name__ == "__main__":
    app.run()
