from .config import Config
from werkzeug.utils import secure_filename
import os

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def upload_file(file, username):
    moleculename = file.filename.split('.')[0]
    if allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(Config.UPLOAD_FOLDER,
            username, moleculename, 'run', filename))
        return True
    else:
        return False