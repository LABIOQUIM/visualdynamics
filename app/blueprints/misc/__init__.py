from flask import Blueprint

MiscBlueprint = Blueprint("MiscRoutes", __name__)

from . import routes
