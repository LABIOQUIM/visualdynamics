import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    GMX_NT = 10
    SECRET_KEY = os.environ.get("VISUAL_DYNAMICS_SECRET_KEY")
    UPLOAD_FOLDER = os.path.abspath("/var/www/VDfiles")
    STATIC_FOLDER = os.path.abspath(os.path.join(basedir, "static"))
    MDP_LOCATION_FOLDER = (
        os.path.abspath(os.path.join(STATIC_FOLDER, "mdpdev"))
        if os.environ.get("FLASK_DEBUG")
        else os.path.abspath(os.path.join(STATIC_FOLDER, "mdp"))
    )
    SOCK_SERVER_OPTIONS = {"ping_interval": 25}
