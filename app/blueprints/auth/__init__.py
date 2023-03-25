from flask import Blueprint

AuthBlueprint = Blueprint("AuthRoutes", __name__)

from . import routes
