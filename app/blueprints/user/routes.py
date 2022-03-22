import datetime
import dateutil.parser
from app.config import Config
from . import UserBlueprint
from flask import render_template, make_response, request
from flask_babel import _
from flask_login import current_user, login_required
from  app import login_manager

@UserBlueprint.route('/', methods=['GET'], endpoint='index')
@login_required
def index():
    try:
        directory = Config.UPLOAD_FOLDER + '/' + current_user.username + '/info_dynamics'
        info_dynamics = open(directory, 'r')
        list_dynamics = info_dynamics.readlines()
        info_dynamics.close()
        dynamics = []

        for d in list_dynamics:
            obj = {
                "date": dateutil.parser.isoparse(d.strip().split("|")[0]),
                "protein": d.strip().split("|")[1],
                "original": d
            }
            dynamics.insert(0, obj)

        return render_template('index.html', actindex='active', no_dynamics='False', list_dynamics=dynamics)
    except:
        print("error")
        return render_template('index.html', actindex='active', no_dynamics='True')
