import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SECRET_KEY = os.environ.get("VISUAL_DYNAMICS_SECRET_KEY")
    UPLOAD_FOLDER = (
        os.path.abspath(os.path.join(basedir, "../../..", "VDfiles"))
        if os.environ.get("FLASK_DEBUG")
        else os.path.abspath(os.path.join(os.path.expanduser("~"), "VDfiles"))
    )
    STATIC_FOLDER = os.path.abspath(os.path.join(basedir, "static"))
    MDP_LOCATION_FOLDER = os.path.abspath(os.path.join(STATIC_FOLDER, "mdp"))
    SOCK_SERVER_OPTIONS = {"ping_interval": 25}
