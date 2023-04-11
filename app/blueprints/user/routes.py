import dateutil.parser
from app.config import Config
from . import UserBlueprint
from flask import render_template
from flask_babel import _
from flask_login import current_user, login_required
import os


@UserBlueprint.route("/", methods=["GET"], endpoint="index")
@login_required
def index():
    title = _("Minha Área")
    try:
        directory = os.path.join(
            Config.UPLOAD_FOLDER, current_user.username, "info_dynamics"
        )
        with open(directory, "r") as f:
            list_dynamics = f.readlines()
        dynamics = []

        for d in list_dynamics:
            dsplit = d.strip().split("/")
            date = dsplit[len(dsplit) - 1].replace("/", "")
            protein = dsplit[len(dsplit) - 2].replace("/", "")
            mode = dsplit[len(dsplit) - 3].replace("/", "")

            status_path = os.path.join(d.replace("\n", ""), "status")

            status = "generated_only"
            if os.path.exists(status_path):
                with open(status_path, "r") as f:
                    line = f.readline()

                if "error" in line:
                    status = line.replace("error: ", "").replace("\n", "")
                else:
                    status = line.replace("\n", "")

            canceled_path = os.path.join(d.replace("\n", ""), "canceled")

            obj = {
                "folder": date,
                "date": dateutil.parser.isoparse(date),
                "protein": protein,
                "mode": mode,
                "status": status,
                "is_running": True if "running" in status else False,
                "is_canceled": True if os.path.isfile(canceled_path) else False,
            }
            dynamics.insert(0, obj)

        return render_template(
            "index.html",
            actindex="active",
            no_dynamics="False",
            list_dynamics=dynamics,
            title=title,
            username=current_user.username,
        )
    except:
        return render_template(
            "index.html",
            actindex="active",
            no_dynamics="True",
            title=title,
            username=current_user.username,
        )
