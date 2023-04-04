from flask import Flask
from flask_cors import CORS
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

CORS(app)


# Command sequence generation
api.add_resource(GenerateAcpypeCommands, "/api/v1/acpype")
api.add_resource(GenerateApoCommands, "/api/v1/apo")
api.add_resource(GenerateProdrgCommands, "/api/v1/prodrg")

# Command sequence execution
api.add_resource(RunDynamic, "/api/v1/run")

# Generated Assets Serving
api.add_resource(DownloadDynamicAssets, "/api/v1/download")

# API Status
api.add_resource(Health, "/api/v1/health")


@sock.route("/api/v1/run-status")
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
