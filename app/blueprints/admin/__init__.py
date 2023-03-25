from flask import Blueprint

AdminBlueprint = Blueprint("AdminRoutes", __name__)

from . import routes
