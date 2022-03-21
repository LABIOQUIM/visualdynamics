from flask import Blueprint

DownloadBlueprint = Blueprint("DownloadRoutes", __name__)

from . import routes