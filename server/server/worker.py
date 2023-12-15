# Create a Celery instance
import datetime

from celery import Celery
import os

from celery.contrib.abortable import AbortableTask
import requests

from pony.orm import db_session, desc

import shutil
from server.config import Config
from server.utils.run_command import run_command
from server.db import Simulation, User

celery = Celery(
    "visualdynamics",
    broker=os.environ.get("CELERY_BROKER_URL"),
    backend=os.environ.get("CELERY_RESULT_BACKEND"),
)

celery.conf.update(result_extended=True)
celery.conf.broker_transport_options = {"visibility_timeout": 604800}
celery.conf.broker_connection_retry_on_startup = True


@celery.task(bind=True, name="Simulate", base=AbortableTask)
def run_commands(self, folder, dynamics_mailer_api_url, email):
    # Get absolute path to the folder where our default MDP files are stored
    folder_mdp = os.path.abspath(Config.MDP_LOCATION_FOLDER)

    # Get a list of the files in the MDP folder
    list_files_mdp = os.listdir(folder_mdp)

    folder_run = os.path.abspath(os.path.join(folder, "run"))
    file_molecule_name = os.path.abspath(os.path.join(folder, "molecule.name"))
    file_log_path = os.path.abspath(os.path.join(folder_run, "logs", "gmx.log"))
    file_status_path = os.path.abspath(os.path.join(folder, "status"))
    file_step_path = os.path.abspath(os.path.join(folder, "steps.txt"))
    file_is_running = os.path.abspath(
        os.path.join(folder, "..", "is-running")
    )
    file_pid_path = os.path.join(folder_run, "pid_file")

    with db_session:
        user_on_db = User.get(email=email)

        simulation_on_db = list(
            Simulation.select(
                lambda s: s.user_id == user_on_db.id
            ).order_by(
                desc(Simulation.created_at)
            )
        )

        simulation_on_db = simulation_on_db[0]

        simulation_on_db.status = "RUNNING"
        simulation_on_db.started_at = datetime.datetime.now()

    with open(file_molecule_name, "r") as f:
        mname = f.readline()
        file_molecule = os.path.abspath(
            os.path.join(folder_run, mname.replace("\n", "")))

    dynamic_data = folder.split("/")[::-1]

    with open(file_molecule, "r") as f:
        atom_count = sum(1 for line in f if "ATOM" in line)

    email_data_failed = {
        "to": email,
        "from": f'"⚛️ Visual Dynamics" visualdynamics@fiocruz.br',
        "subject": "Your simulation has failed.",
        "template": "main.hbs",
        "context": {
            "base_url": os.environ.get("APP_URL"),
            "preheader": "An error has occurred during the execution of your "
                         "simulation.",
            "content": f"Your {dynamic_data[0]} simulation has "
                       f"failed.<br><br>The simulation that you submitted has "
                       f"failed.<br><br>Please access VD and check the logs "
                       f"provided, if you're sure it's a bug in our software, "
                       f"please contact us.",
            "showButton": True,
            "buttonLink": os.environ.get("APP_URL"),
            "buttonText": "Go to Visual Dynamics",
            "showPostButtonText": False,
            "email": email
        }
    }

    email_data_success = {
        "to": email,
        "from": f'"⚛️ Visual Dynamics" visualdynamics@fiocruz.br',
        "subject": "The simulation you left running has ended.",
        "template": "main.hbs",
        "context": {
            "base_url": os.environ.get("APP_URL"),
            "preheader": "The simulation you left running has ended.",
            "content": f"Your {dynamic_data[0]} simulation has "
                       f"ended.<br><br>The simulation that you submitted has "
                       f"ended.<br><br>Please access VD to download the "
                       f"figure graphics, raw data and more.",
            "showButton": True,
            "buttonLink": os.environ.get("APP_URL"),
            "buttonText": "Go to Visual Dynamics",
            "showPostButtonText": False,
            "email": email
        }
    }

    if int(atom_count) > 10000:
        # SEND MAIL NOTIFYING DYNAMIC ERRORED
        requests.post("http://mailer:3000/send-email", json=email_data_failed)

        with open(file_status_path, "w") as f:
            f.write(f"error: hm5ka")

        with db_session:
            user_on_db = User.get(email=email)

            simulation_on_db = list(
                Simulation.select(
                    lambda s: s.user_id == user_on_db.id
                ).order_by(
                    desc(Simulation.created_at)
                )
            )

            simulation_on_db = simulation_on_db[0]

            simulation_on_db.status = "ERRORED"
            simulation_on_db.ended_at = datetime.datetime.now()
            simulation_on_db.errored_on_command = "hm5ka"

        if os.path.exists(file_is_running):
            os.remove(file_is_running)
        raise Exception("Too Much ATOMS")

    # Copy each file to our run folder
    for file in list_files_mdp:
        file_path = os.path.join(folder_mdp, file)
        if os.path.isfile(file_path):
            shutil.copy(file_path, folder_run)

    # Load commands file contents to  a variable
    file_commands_path = os.path.join(folder, "commands.txt")
    with open(file_commands_path, "r") as f:
        commands_file_content = f.readlines()

    # Make each line of the file as a item in the excution array
    commands = [line.rstrip("\n") for line in commands_file_content if
                line != "\n"]

    # Make our shell go to the run folder
    os.chdir(folder_run)

    with open(file_is_running, "w") as f:
        f.write(folder)

    with open(file_status_path, "w") as f:
        f.write("running")

    # Iterate in our command list
    for command in commands:
        if command[0] == "#":
            with open(file_step_path, "a+") as f:
                f.write(f"{command}\n")
        else:
            try:
                (_, returncode) = run_command(command, file_log_path,
                                              file_pid_path)

                if returncode > 0:
                    raise Exception
            except:
                # SEND MAIL NOTIFYING DYNAMIC ERRORED
                requests.post("http://mailer:3000/send-email",
                              json=email_data_failed)

                with db_session:
                    user_on_db = User.get(email=email)

                    simulation_on_db = list(
                        Simulation.select(
                            lambda s: s.user_id == user_on_db.id
                        ).order_by(
                            desc(Simulation.created_at)
                        )
                    )

                    simulation_on_db = simulation_on_db[0]

                    simulation_on_db.status = "ERRORED"
                    simulation_on_db.ended_at = datetime.datetime.now()
                    simulation_on_db.errored_on_command = command

                with open(file_status_path, "w") as f:
                    f.write(f"error: {command}")

                if os.path.exists(file_is_running):
                    os.remove(file_is_running)
                raise Exception(f"Command {command} failed to run")

    # SEND EMAIL NOTIFYING DYNAMIC ENDED
    requests.post("http://mailer:3000/send-email", json=email_data_success)

    with db_session:
        user_on_db = User.get(email=email)

        simulation_on_db = list(
            Simulation.select(
                lambda s: s.user_id == user_on_db.id
            ).order_by(
                desc(Simulation.created_at)
            )
        )

        simulation_on_db = simulation_on_db[0]

        simulation_on_db.status = "COMPLETED"
        simulation_on_db.ended_at = datetime.datetime.now()

    with open(file_status_path, "w") as f:
        f.write("finished")

    if os.path.exists(file_is_running):
        os.remove(file_is_running)
