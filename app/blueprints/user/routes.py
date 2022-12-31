import dateutil.parser
from app.config import Config
from . import UserBlueprint
from flask import render_template, make_response, request
from flask_babel import _
from flask_login import current_user, login_required
from app import login_manager
import os
@UserBlueprint.route('/', methods=['GET'], endpoint='index')
@login_required
def index():
    try:
        directory = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'info_dynamics')
        with open(directory, 'r') as f:
            list_dynamics = f.readlines()
        dynamics = []

        for d in list_dynamics:
            dsplit = d.strip().split('/')
            date = dsplit[len(dsplit) - 1].replace('/', '')
            protein = dsplit[len(dsplit) - 2].replace('/', '')
            mode = dsplit[len(dsplit) - 3].replace('/', '')

            status_path = os.path.join(d.replace('\n', ''), 'status')
            
            with open(status_path, 'r') as f:
                line = f.readline()

            if 'error' in line:
                status = line.replace('error: ', '').replace('\n', '')
            else:
                status = line.replace('\n', '')

            obj = {
                "folder": date,
                "date": dateutil.parser.isoparse(date),
                "protein": protein,
                "mode": mode,
                "status": status
            }
            dynamics.insert(0, obj)

        return render_template('index.html', actindex='active', no_dynamics='False', list_dynamics=dynamics)
    except:
        return render_template('index.html', actindex='active', no_dynamics='True')
