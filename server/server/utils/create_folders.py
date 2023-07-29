import os, errno


def create_folders(folder):
    for subfolder in ["figures", "run/logs"]:
        path = os.path.abspath(os.path.join(folder, subfolder))
        try:
            os.makedirs(path)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise
