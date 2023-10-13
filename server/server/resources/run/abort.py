import os
import signal
import time
from flask_restful import Resource, reqparse
from celery.contrib.abortable import AbortableAsyncResult
from server.worker import celery


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
            os.path.join(folder, "..", "..", "..", "is-running")
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

        return {"status": "aborted"}
