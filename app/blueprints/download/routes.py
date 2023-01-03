import ast
import glob
import os
import shutil
import zipfile

from flask_login import current_user

from app.config import Config
from . import DownloadBlueprint
from flask import send_file
from flask_babel import _
from app import login_required

@DownloadBlueprint.route('/downloads/graphics/<mode>/<protein>/<folder>')
@login_required
def imgsdownload(mode, protein, folder):
    folder_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, mode, protein, folder)
    folder_graphics_path = os.path.join(folder_path, 'graficos')

    ziplocation = os.path.join(folder_graphics_path, f"{mode}-{protein}-{folder}-graphics.zip")
    zf = zipfile.ZipFile(ziplocation,'w')

    #move os arquivos .xvg para a pasta graficos.
    directory_xvg = os.path.join(folder_path, 'run')
    for folder, subfolders, files in os.walk(directory_xvg):
        for file in files:
            if file.endswith('.xvg'):
                file = os.path.join(directory_xvg, file) 
                shutil.move(file, folder_graphics_path)

    for folder, subfolders, files in os.walk(folder_graphics_path):
        for file in files:
            if not file.endswith('.zip'):
                zf.write(os.path.join(folder, file), file, compress_type = zipfile.ZIP_DEFLATED)
    zf.close()

    return send_file(ziplocation, as_attachment=True)

@DownloadBlueprint.route('/downloads/mdp')
@login_required
def downloadmdpfiles():
    folder_path = os.path.join(Config.MDP_LOCATION_FOLDER)

    ziplocation = os.path.join(folder_path, f"mdpfiles.zip")
    zf = zipfile.ZipFile(ziplocation, 'w')

    #move os arquivos .xvg para a pasta graficos.
    for folder, subfolders, files in os.walk(folder_path):
        for file in files:
            if file.endswith('.mdp'):
                zf.write(os.path.join(folder, file), file, compress_type=zipfile.ZIP_DEFLATED)

    zf.close()

    return send_file(ziplocation, as_attachment=True)

@DownloadBlueprint.route('/downloads/commands/<mode>/<protein>/<folder>')
@login_required
def dynamiccomandsdownload(mode, protein, folder):
    folder_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, mode, protein, folder)
    os.chdir(folder_path)
    files = glob.glob("*.txt")
    files.sort(key=os.path.getmtime)
    commands = files[len(files) - 1]
    directory = os.path.join(folder_path, commands)
    return send_file(directory, as_attachment=True)

@DownloadBlueprint.route('/downloads/xtc/<mode>/<protein>/<folder>')
@login_required
def commandsdownload(mode, protein, folder):
    folder_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, mode, protein, folder)
    folder_run_path = os.path.join(folder_path, 'run')

    ziplocation = os.path.join(folder_run_path, f"{mode}-{protein}-{folder}-xtc.zip")
    zf = zipfile.ZipFile(ziplocation, 'w')

    #move os arquivos .xvg para a pasta graficos.
    for folder, subfolders, files in os.walk(folder_run_path):
        for file in files:
            if file.endswith('_PBC.xtc') or file.endswith('_pr.tpr'):
                zf.write(os.path.join(folder, file), file, compress_type=zipfile.ZIP_DEFLATED)

    zf.close()

    return send_file(ziplocation, as_attachment=True)

@DownloadBlueprint.route('/downloads/logs/<mode>/<protein>/<folder>')
@login_required
def downloalogs(mode, protein, folder):
    folder_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, mode, protein, folder)
    log_path = os.path.join(folder_path, 'run', 'logs')
    ziplocation = os.path.join(log_path, f"{mode}-{protein}-{folder}-logs.zip")
    zf = zipfile.ZipFile(ziplocation,'w')

    for folder, subfolders, files in os.walk(log_path):
        for file in files:
            if file.endswith('.log'):
                zf.write(os.path.join(folder, file), file, compress_type=zipfile.ZIP_DEFLATED)

    zf.close()
    return send_file(ziplocation, as_attachment=True)
