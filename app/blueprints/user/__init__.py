from flask import Blueprint

UserBlueprint = Blueprint("UserRoutes", __name__)

from . import routes