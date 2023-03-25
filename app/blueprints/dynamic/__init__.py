from flask import Blueprint

DynamicBlueprint = Blueprint("DynamicRoutes", __name__)

from . import routes
