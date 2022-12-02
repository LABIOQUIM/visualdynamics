import ast
import glob
import os
import shutil
import zipfile

from flask_login import current_user

from app.config import Config
from . import DownloadBlueprint
from flask import render_template, make_response, request, send_file
from flask_babel import _
from app import login_manager, login_required

@DownloadBlueprint.route('/imgfiles/<filename>')
@login_required
def imgsdownload(filename):
    filename = filename.split('|')[1]
    current_location = os.path.join(Config.UPLOAD_FOLDER, current_user.username, filename, 'graficos')
    ziplocation = os.path.join(current_location, filename+'-graficos.zip')
    zf = zipfile.ZipFile(ziplocation,'w')

    #move os arquivos .xvg para a pasta graficos.
    directory_xvg = os.path.join(Config.UPLOAD_FOLDER, current_user.username, filename,'run')
    for folder, subfolders, files in os.walk(directory_xvg):
        for file in files:
            if file.endswith('.xvg'):
                file = directory_xvg +'/'+file 
                shutil.move(file, current_location)

    for folder, subfolders, files in os.walk(current_location):
        for file in files:
            if not file.endswith('.zip'):
                zf.write(os.path.join(folder, file), file, compress_type = zipfile.ZIP_DEFLATED)
    zf.close()

    return send_file(ziplocation, as_attachment=True)

@DownloadBlueprint.route('/downloadmdpfiles')
@login_required
def downloadmdpfiles():
    ziplocation = os.path.join(Config.MDP_LOCATION_FOLDER, 'mdpfiles.zip')
    
    return send_file(ziplocation, as_attachment=True)

@DownloadBlueprint.route('/dynamiccomandsdownload/<filename>')
@login_required
def dynamiccomandsdownload(filename):
    filename = filename.split('|')[1]
    os.chdir(Config.UPLOAD_FOLDER+'/'+current_user.username+'/'+filename)
    files = glob.glob("*.txt")
    files.sort(key=os.path.getmtime)
    file_comands = files[len(files)-1]
    directory = Config.UPLOAD_FOLDER+'/'+current_user.username+'/'+filename+'/'+file_comands
    return (send_file(directory, as_attachment=True))

@DownloadBlueprint.route('/download/<filename>')
@login_required
def commandsdownload(filename):
    filename = ast.literal_eval(filename)
    return send_file('{}{}/{}/{}'.format(Config.UPLOAD_FOLDER,
            current_user.username,filename["name"],filename["complete"]), as_attachment=True)

@DownloadBlueprint.route('/downloadlogs/<filename>')
@login_required
def downloalogs(filename):
    filename = filename.split('|')[1]
    current_location = os.path.join(Config.UPLOAD_FOLDER, current_user.username, filename,'run','logs')
    ziplocation = os.path.join(Config.UPLOAD_FOLDER, current_user.username, filename,'run','logs',filename+'-logs.zip')
    zf = zipfile.ZipFile(ziplocation,'w')

    for folder, subfolders, files in os.walk(current_location):
        for file in files:
            if not file.endswith('.zip'):
                zf.write(os.path.join(folder, file), file, compress_type = zipfile.ZIP_DEFLATED)

    zf.close()
    return (send_file(ziplocation, as_attachment=True))
