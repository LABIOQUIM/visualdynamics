import os
import signal
import time
import datetime
from flask_restful import Resource, reqparse
from celery.contrib.abortable import AbortableAsyncResult
from server.worker import celery
import requests

class AbortDynamic(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("taskId", required=True, type=str, location="form")
        parser.add_argument("folder", required=True, type=str, location="form")

        args = parser.parse_args()

        task = AbortableAsyncResult(args["taskId"], app=celery)

        task.revoke(terminate=True)

        folder = os.path.abspath(args["folder"])

        folder_run = os.path.abspath(os.path.join(folder, "run"))
        file_status_path = os.path.abspath(os.path.join(folder, "status"))
        file_is_running = os.path.abspath(
            os.path.join(folder, "..", "is-running")
        )
        file_user = os.path.abspath(
            os.path.join(folder, "..")
        )
        file_pid_path = os.path.join(folder_run, "pid_file")

        if os.path.exists(file_is_running):
            os.remove(file_is_running)

        killed = False
        killRetries = 0
        while not killed and killRetries < 5:
            with open(file_pid_path, "r") as f:
                pid = int(f.readline())
                try:
                    os.killpg(os.getpgid(pid), signal.SIGTERM)
                except:
                    pass
            killRetries += 1
            time.sleep(1)

        time.sleep(1)
        with open(file_status_path, "w") as f:
            f.write("canceled")

        requests.put("http://client:3000/api/simulations", json={
            "username": file_user.split("/")[::-1][0],
            "status": "CANCELED",
            "startedAt": datetime.datetime.now().isoformat()
        })
        
        return {"status": "aborted"}
