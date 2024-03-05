import os, errno, shutil


def create_folders(folder):
    if os.path.exists(folder):
        folder_status_file = os.path.join(folder, "status")
        if os.path.exists(folder_status_file):
            with open(folder_status_file, "r") as f:
                line = f.readline()
                if line is "running":
                    return "running-or-enqueued"

        try:
            shutil.rmtree(folder)
        except Exception:
            raise

    for subfolder in ["figures", "run/logs"]:
        path = os.path.abspath(os.path.join(folder, subfolder))
        try:
            os.makedirs(path)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise
