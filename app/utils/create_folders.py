import errno
import os

def create_folders(folder):
    for subfolder in ['graficos', 'run/logs']:
        path = folder + subfolder
        try:
            os.makedirs(path)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise