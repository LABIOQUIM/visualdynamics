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
        file.save(os.path.join(Config.UPLOAD_FOLDER, username, moleculename, 'run', filename))
        return True
    else:
        return False

def upload_file_ligante(file, ligitp, liggro, username):
    moleculename = file.filename.split('.')[0]
    ligantename = ligitp.filename.split('.')[0]
    pastaname = moleculename+'_'+ligantename
    if allowed_file(file.filename):
        if allowed_file(ligitp.filename):
            if allowed_file(liggro.filename):
                filemol = secure_filename(file.filename)
                fileitp = secure_filename(ligitp.filename)
                filegro = secure_filename(liggro.filename)
                file.save(os.path.join(Config.UPLOAD_FOLDER,
                    username, pastaname, 'run', filemol))
                ligitp.save(os.path.join(Config.UPLOAD_FOLDER,
                    username, pastaname, 'run', fileitp))
                liggro.save(os.path.join(Config.UPLOAD_FOLDER,
                    username, pastaname, 'run', filegro))
                return True
        else:
            return False
    else:
        return False
    