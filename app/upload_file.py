import pathlib
from .config import Config
from werkzeug.utils import secure_filename
import os


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    )


def upload_file(folder, file):
    if allowed_file(file.filename):
        file.save(os.path.join(folder, "run", file.filename))
        return True
    else:
        return False


def upload_file_ligante(folder, file, fileitp, filegro):
    if allowed_file(file.filename):
        if allowed_file(fileitp.filename):
            if allowed_file(filegro.filename):
                pathlib.Path(os.path.join(folder, "run", "logs")).mkdir(
                    parents=True, exist_ok=True
                )
                file.save(os.path.join(folder, "run", file.filename))
                fileitp.save(os.path.join(folder, "run", fileitp.filename))
                filegro.save(os.path.join(folder, "run", filegro.filename))
                return True
        else:
            return False
    else:
        return False
