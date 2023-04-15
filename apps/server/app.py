from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from server.config import Config
from server.resources.celery.active_tasks import CeleryActiveTasks
from server.resources.celery.reserved_tasks import CeleryReservedTasks
from server.resources.downloads import DownloadDynamicAssets
from server.resources.generate_acpype import GenerateAcpypeCommands
from server.resources.generate_apo import GenerateApoCommands
from server.resources.health import Health
from server.resources.run import RunDynamic

app = Flask(__name__)
app.config.from_object(Config)
api = Api(app)

CORS(app)

# Command sequence generation
api.add_resource(GenerateAcpypeCommands, "/api/v1/acpype")
api.add_resource(GenerateApoCommands, "/api/v1/apo")

# Command sequence execution
api.add_resource(RunDynamic, "/api/v1/run")

# Generated Assets Serving
api.add_resource(DownloadDynamicAssets, "/api/v1/download")

# API Status
api.add_resource(Health, "/api/v1/health")

# Celery data
api.add_resource(CeleryReservedTasks, "/api/v1/celery/reserved")
api.add_resource(CeleryActiveTasks, "/api/v1/celery/active")

if __name__ == "__main__":
    app.run(debug=True)
