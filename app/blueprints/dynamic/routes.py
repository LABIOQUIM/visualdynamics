from datetime import datetime
import os
import signal
from app.checkuserdynamics import CheckDynamicsSteps, CheckUserDynamics
from app.config import Config
from . import DynamicBlueprint
from flask import render_template, request, redirect, url_for, flash
from flask_babel import _
from flask_login import current_user, login_required
from app.upload_file import upload_file, upload_file_ligante
from .generators import apo as apoGenerator, prodrg as prodrgGenerator, acpype as acpypeGenerator
from .executors import apo as apoExecutor, prodrg as prodrgExecutor, acpype as acpypeExecutor
import shutil
from pathlib import Path

# INFO Free Protein
@DynamicBlueprint.route('/apo', methods=['GET', 'POST'], endpoint='apo')
@login_required
def apo():
    if request.method == 'POST':
        timestamp = datetime.now().replace(microsecond=0).isoformat()
        filename, ext = os.path.splitext(os.path.basename(request.files.get('file').filename))
        folder = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'apo', filename, timestamp)
        
        CompleteFileName = apoGenerator.generate(
            folder,
            request.files.get('file').filename,
            request.form.get('campoforca'),
            request.form.get('modeloagua'),
            request.form.get('tipocaixa'),
            request.form.get('distanciacaixa'),
            request.form.get('neutralize'),
            request.form.get('double'),
            request.form.get('ignore'),
            current_user
        )

        if request.form.get('download') == 'Download':
            return redirect(
                url_for(
                    'DownloadRoutes.dynamiccomandsdownload',
                    folder=f"{timestamp}",
                    mode="apo",
                    protein=filename
                )
            )

        if request.form.get('execute') == 'Executar':
            if upload_file(folder, request.files.get('file')):
                # checar se servidor esta em execução
                executing_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'executing')
                if not os.path.exists(executing_path):
                    with open(executing_path, 'w') as f:
                        f.writelines(f'{current_user.username}\n')
                else:
                    flash(_('Desculpe, não é possível realizar duas dinâmicas ao mesmo tempo.'), 'danger')
                    return redirect(url_for('DynamicRoutes.apo'))    
            
                exc = apoExecutor.execute(folder, CompleteFileName, current_user.username, filename + ext, current_user.email)
                flash(_('Houve um erro ao executar o comando <b>%(command)s</b>.</br>Verifique os logs para mais detalhes', command=exc), 'danger')
                return redirect(url_for('DynamicRoutes.apo')) 
            else:
                flash(_('Extensão do arquivo está incorreta'), 'danger')
    
    if CheckUserDynamics(current_user.username) == True:
        steplist = CheckDynamicsSteps(current_user.username)
        
        dynamicinfo = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'running_protein_name')
        
        with open(dynamicinfo, 'r') as f:
            name_dynamic = f.readline()

        log_dir_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'log_dir')
        with open(log_dir_path, 'r') as f:
            log_path = f.readline()
            dynamic_type = log_path.split("/")[len(log_path.split("/")) - 6]
        with open(log_path, 'r') as f:
            log_last_line = f.readlines()[len(f.readlines()) - 1]
        if 'step' in log_last_line:
            date_finish = log_last_line

            return render_template('running.html', dynamic_type=dynamic_type, actapo='active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)

        return render_template('running.html', dynamic_type=dynamic_type, actapo='active', steplist=steplist, name_dynamic=name_dynamic) 
    
    return render_template('apo.html', actapo='active')

# INFO Protein + Ligand (PRODRG)
@DynamicBlueprint.route('/prodrg', methods=['GET','POST'], endpoint='prodrg')
@login_required
def prodrg():
    if request.method == 'POST':
        timestamp = datetime.now().replace(microsecond=0).isoformat()
        filename, ext = os.path.splitext(os.path.basename(request.files.get('file').filename))
        fileitpname, ext1 = os.path.splitext(os.path.basename(request.files.get('fileitp').filename))
        filegroname, ext2 = os.path.splitext(os.path.basename(request.files.get('filegro').filename))
        folder = os.path.join(Config.UPLOAD_FOLDER,current_user.username, 'prodrg', f"{filename}_{fileitpname}", timestamp)
        
        CompleteFileName = prodrgGenerator.generate(
            folder,
            request.files.get('file').filename,
            request.files.get('fileitp').filename,
            request.files.get('filegro').filename,
            request.form.get('campoforca'),
            request.form.get('modeloagua'),
            request.form.get('tipocaixa'),
            request.form.get('distanciacaixa'),
            request.form.get('neutralize'),
            request.form.get('double'),
            request.form.get('ignore'),
            current_user
        )

        name = f"{filename}_{fileitpname}"
        if request.form.get('download') == 'Download':
            return redirect(
                url_for(
                    'DownloadRoutes.dynamiccomandsdownload',
                    folder=f"{timestamp}",
                    mode="prodrg",
                    protein=f"{filename}_{fileitpname}"
                )
            )
        
        if request.form.get('execute') == 'Executar':
            if upload_file_ligante(folder, request.files.get('file'), request.files.get('fileitp'), request.files.get('filegro')):    #dando upload no arquivo, salvando e checando
                executing_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'executing')
                if not os.path.exists(executing_path):
                    with open(executing_path, 'w') as f:
                        f.writelines(f'{current_user.username}\n')
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('DynamicRoutes.prodrg'))
            
                exc = prodrgExecutor.execute(folder, CompleteFileName, current_user.username, name, fileitpname+ext1, filegroname+ext2, filename, current_user.email)
                flash(_('Houve um erro ao executar o comando <b>%(command)s</b>.</br>Verifique os logs para mais detalhes', command=exc[1]), 'danger')
            else:
                flash('A extensão dos arquivos está incorreta', 'danger')
            
    if CheckUserDynamics(current_user.username) == True:
        steplist = CheckDynamicsSteps(current_user.username)

        dynamicinfo = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'running_protein_name')
        
        with open(dynamicinfo, 'r') as f:
            name_dynamic = f.readline()

        log_dir_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'log_dir')
        with open(log_dir_path, 'r') as f:
            log_path = f.readline()
            dynamic_type = log_path.split("/")[len(log_path.split("/")) - 6]
        with open(log_path, 'r') as f:
            log_last_line = f.readlines()[len(f.readlines()) - 1]
        if 'step' in log_last_line:
            date_finish = log_last_line

            return render_template('running.html', dynamic_type=dynamic_type, actprodrg='active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
        
        return render_template('running.html', dynamic_type=dynamic_type, actprodrg='active', steplist=steplist, name_dynamic=name_dynamic) 
        
    return render_template('prodrg.html', actprodrg='active')

# INFO Protein + Ligand (ACPYPE)
@DynamicBlueprint.route('/acpype', methods=['GET','POST'], endpoint='acpype')
@login_required
def acpype():
    if request.method == 'POST':
        timestamp = datetime.now().replace(microsecond=0).isoformat()
        filename, ext = os.path.splitext(os.path.basename(request.files.get('file').filename))
        fileitpname, ext1 = os.path.splitext(os.path.basename(request.files.get('fileitp').filename))
        filegroname, ext2 = os.path.splitext(os.path.basename(request.files.get('filegro').filename))
        folder = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'acpype', f"{filename}_{fileitpname}", timestamp)
        

        CompleteFileName = acpypeGenerator.generate(
            folder,
            request.files.get('file').filename,
            request.files.get('fileitp').filename,
            request.files.get('filegro').filename,
            request.form.get('campoforca'),
            request.form.get('modeloagua'),
            request.form.get('tipocaixa'),
            request.form.get('distanciacaixa'),
            request.form.get('neutralize'),
            request.form.get('double'),
            request.form.get('ignore'),
            current_user
        )  
        name = f"{filename}_{fileitpname}"
        if request.form.get('download') == 'Download':
            return redirect(
                url_for(
                    'DownloadRoutes.dynamiccomandsdownload',
                    folder=f"{timestamp}",
                    mode="acpype",
                    protein=f"{filename}_{fileitpname}"
                )
            )
        
        if request.form.get('execute') == 'Executar':
            if upload_file_ligante(folder, request.files.get('file'), request.files.get('fileitp'), request.files.get('filegro')):    #dando upload no arquivo, salvando e checando                
                executing_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'executing')
                if not os.path.exists(executing_path):
                    with open(executing_path, 'w') as f:
                        f.writelines(f'{current_user.username}\n')
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('DynamicRoutes.acpype'))
            
                exc = acpypeExecutor.execute(folder, CompleteFileName, current_user.username, name, fileitpname+ext1, filegroname+ext2, filename, current_user.email)
                flash(_('Houve um erro ao executar o comando <b>%(command)s</b>.</br>Verifique os logs para mais detalhes', command=exc), 'danger')
                return redirect(url_for('DynamicRoutes.acpype'))
            else:
                flash('A extensão dos arquivos está incorreta', 'danger')
            
    if CheckUserDynamics(current_user.username) == True:
        steplist = CheckDynamicsSteps(current_user.username)

        dynamicinfo = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'running_protein_name')
        
        with open(dynamicinfo, 'r') as f:
            name_dynamic = f.readline()

        log_dir_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'log_dir')
        with open(log_dir_path, 'r') as f:
            log_path = f.readline()
            dynamic_type = log_path.split("/")[len(log_path.split("/")) - 6]
        with open(log_path, 'r') as f:
            log_last_line = f.readlines()[len(f.readlines()) - 1]
        if 'step' in log_last_line:
            date_finish = log_last_line

            return render_template('running.html', dynamic_type=dynamic_type, actacpype='active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
                       
        return render_template('running.html', dynamic_type=dynamic_type, actacpype='active', steplist=steplist, name_dynamic=name_dynamic) 
        
    return render_template('acpype.html', actacpype='active')

# INFO Protein + Ligand (ATB)
@DynamicBlueprint.route('/atb', methods=['GET','POST'], endpoint='atb')
@login_required
def atb():
    return render_template('atb.html', actatb='active')


@DynamicBlueprint.route('/cancel/<mode>/<protein>/<folder>', methods=['POST'], endpoint='cancel_dynamic')
@login_required
def cancel_dynamic(mode, protein, folder):
    user_path = os.path.join(Config.UPLOAD_FOLDER, current_user.username)
    dynamic_path = os.path.join(user_path, mode, protein, folder)

    with open(os.path.join(user_path, "pid"), "r") as f:
        pid = int(f.readline())
    
    os.killpg(os.getpgid(pid), signal.SIGTERM)
    os.remove(os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'executing'))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'running_protein_name'))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'log_dir'))
    os.remove(os.path.join(Config.UPLOAD_FOLDER, current_user.username, 'pid'))
    shutil.rmtree(os.path.join(dynamic_path, "graficos"), ignore_errors=True)
    for path in Path(dynamic_path, "run").glob("*"):
        if path.is_file():
            path.unlink()
    
    with open(os.path.join(dynamic_path, "canceled"), "w") as f:
        f.write("canceled\n")
    
    if current_user.username == "admin":
        return redirect(url_for("AdminRoutes.current_dynamics"))
    return redirect(url_for("UserRoutes.index"))
