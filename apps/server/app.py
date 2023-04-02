import os
import shutil
from flask import Flask
from flask_restful import Api
from flask_sock import Sock
from server.config import Config
from server.resources.downloads import DownloadDynamicAssets
from server.resources.generate_acpype import GenerateAcpypeCommands
from server.resources.generate_apo import GenerateApoCommands
from server.resources.generate_prodrg import GenerateProdrgCommands
from server.resources.health import Health
from server.resources.run import RunDynamic
from server.utils.run_command import run_command

app = Flask(__name__)
app.config.from_object(Config)
api = Api(app)
sock = Sock(app)


# Command sequence generation
api.add_resource(GenerateAcpypeCommands, "/acpype")
api.add_resource(GenerateApoCommands, "/apo")
api.add_resource(GenerateProdrgCommands, "/prodrg")

# Command sequence execution
api.add_resource(RunDynamic, "/run")

# Generated Assets Serving
api.add_resource(DownloadDynamicAssets, "/download")

# API Status
api.add_resource(Health, "/health")


@sock.route("/")
# @requires_connection
def run(ws):
    """
    Format expected:
    data: {
        dynamic_id: str
    }
    """
    data = ws.receive()

    ws.close(reason="success")


if __name__ == "__main__":
    app.run(debug=True)
