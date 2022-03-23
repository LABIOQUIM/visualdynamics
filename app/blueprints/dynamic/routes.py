import os
from app.checkuserdynamics import CheckDynamicsSteps, CheckDynamicsStepsLig, CheckUserDynamics, CheckUserDynamicsLig
from app.config import Config
from . import DynamicBlueprint
from flask import render_template, make_response, request, redirect, url_for, flash
from flask_babel import _
from flask_login import current_user, login_required
from  app import login_manager
from ...upload_file import upload_file, upload_file_ligante
from .generators import apo as apoGenerator, prodrg as prodrgGenerator, acpype as acpypeGenerator
from .executors import apo as apoExecutor, prodrg as prodrgExecutor, acpype as acpypeExecutor

# INFO APO Enzima
@DynamicBlueprint.route('/apo', methods=['GET', 'POST'], endpoint='apo')
@login_required
def apo():
    if request.method == 'POST':
        file = request.files.get('file')
        if file is None:
            flash("No file part")
            return redirect(request.url)
        CompleteFileName = apoGenerator.generate(file.filename, request.form.get('campoforca'), request.form.get('modeloagua'), request.form.get('tipocaixa'), request.form.get('distanciacaixa'), request.form.get('neutralize'), request.form.get('double'), request.form.get('ignore'), current_user)  
        if request.form.get('download') == 'Download':
            return redirect(url_for('DownloadRoutes.commandsdownload', filename={"complete" : CompleteFileName, "name": file.filename.split('.')[0]}))
        if request.form.get('execute') == 'Executar':
            if upload_file(file, current_user.username):
                # checar se servidor esta em execução
                executing = Config.UPLOAD_FOLDER + current_user.username + '/executing'
                if not os.path.exists(executing):
                    f = open(executing, 'w')
                    f.writelines('{}\n'.format(current_user.username))
                    f.close()
                else:
                    flash(_('Desculpe, não é possível realizar duas dinâmicas ao mesmo tempo.'), 'danger')
                    return redirect(url_for('DynamicRoutes.apo'))    
                
                executingLig = Config.UPLOAD_FOLDER + current_user.username + '/executingLig'
                if not os.path.exists(executingLig):
                    f = open(executingLig, 'w')
                    f.close()
                else:
                    flash(_('Desculpe, não é possível realizar duas dinâmicas ao mesmo tempo.'), 'danger')
                    return redirect(url_for('DynamicRoutes.apo'))
            
                #preparar para executar
                MoleculeName = file.filename.split('.')[0]
                filename = file.filename
                AbsFileName = os.path.join(Config.UPLOAD_FOLDER,
                    current_user.username, MoleculeName , 'run',
                    'logs', filename)

                exc = apoExecutor.execute(AbsFileName, CompleteFileName, current_user.username, MoleculeName)
                flash(_('Houve um erro ao executar o comando {}. Verifique os logs para mais detalhes', command=exc[1]), 'danger')
            else:
                flash(_('Extensão do arquivo está incorreta'), 'danger')
    
    if CheckUserDynamics(current_user.username) == True:
            flash('', 'steps')
            steplist = CheckDynamicsSteps(current_user.username)

            archive = open(Config.UPLOAD_FOLDER + current_user.username + '/executing', "r")
            lines = archive.readlines()
            archive.close()
            last_line = lines[len(lines)-1]
            #verifica se a execução já está  em produçãomd
            if last_line == '#productionmd\n' or last_line == '#analyzemd\n':
                # acessa o diretorio do log de execução
                archive = open(Config.UPLOAD_FOLDER + current_user.username+ '/DirectoryLog', 'r')
                directory = archive.readline()
                archive.close()
                # acessa o log de execução
                archive = open(directory,'r')
                lines = archive.readlines()
                archive.close()
                # busca a ultima linha do log
                last_line = lines[len(lines)-1]
                if last_line.find('step ') > -1:
                    # recebe a quantidade de step e a data de termino.
                    date_finish = last_line        
                    archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
                    name_dynamic = archive.readline()
                    archive.close()
                    return render_template('apo.html', actapo='active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
            
            archive.close()
            archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
            name_dynamic = archive.readline()
            archive.close()        
            return render_template('apo.html', actapo='active', steplist=steplist, name_dynamic=name_dynamic) 
    
    return render_template('apo.html', actapo='active')

##### ligante br #####
@DynamicBlueprint.route('/prodrg', methods=['GET','POST'], endpoint='prodrg')
@login_required
def prodrg():
    if request.method == 'POST':
        file = request.files.get('file')
        fileitp = request.files.get('fileitp')
        filegro = request.files.get('filegro')
        CompleteFileName = prodrgGenerator.generate(file.filename, fileitp.filename, filegro.filename, request.form.get('campoforca'), request.form.get('modeloagua'), request.form.get('tipocaixa'), request.form.get('distanciacaixa'), request.form.get('neutralize'), request.form.get('double'), request.form.get('ignore'), current_user)  
        if request.form.get('download') == 'Download':
            name = file.filename.split('.')[0]+'_'+fileitp.filename.split('.')[0]
            return redirect(url_for('DownloadRoutes.commandsdownload', filename={"complete": CompleteFileName, "name": name}))
        
        if request.form.get('execute') == 'Executar':
            if upload_file_ligante(file, fileitp, filegro, current_user.username):    #dando upload no arquivo, salvando e checando
                executingLig = Config.UPLOAD_FOLDER + current_user.username + '/executingLig'
                if not os.path.exists(executingLig):
                    f = open(executingLig,'w')
                    f.writelines('{}\n'.format(current_user.username))
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('DynamicRoutes.prodrg'))    
                
                executing = Config.UPLOAD_FOLDER + current_user.username + '/executing'
                if not os.path.exists(executing):
                    f = open(executing, 'w')
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('DynamicRoutes.prodrg'))
            
                #preparar para executar
                MoleculeName = file.filename.split('.')[0]
                liganteitpName = fileitp.filename.split('.')[0]
                ligantegroName = filegro.filename.split('.')[0]
                moleculaLig = MoleculeName+'_'+liganteitpName
                AbsFileName = os.path.join(Config.UPLOAD_FOLDER,
                                    current_user.username,moleculaLig, 'run',
                                    'logs', moleculaLig)
                
                exc = prodrgExecutor.execute(AbsFileName, CompleteFileName, current_user.username, moleculaLig, fileitp.filename, filegro.filename, MoleculeName)
                flash('Ocorreu um erro no comando {} com status {}'.format(exc[1],exc[0]), 'danger')
                return redirect(url_for('DynamicRoutes.prodrg'))
            
            else:
                flash('A extensão dos arquivos está incorreta', 'danger')
            
    if CheckUserDynamicsLig(current_user.username) == True:
        flash('','steps')
        steplist = CheckDynamicsStepsLig(current_user.username)

        archive = open(Config.UPLOAD_FOLDER + current_user.username + '/executingLig','r')
        lines = archive.readlines()
        archive.close()
        last_line = lines[len(lines)-1]     
        #verifica se a execução já está  em produçãomd
        if last_line == '#productionmd\n' or last_line == '#analyzemd\n':
            #acessa o diretorio do log de execução
            archive = open(Config.UPLOAD_FOLDER + current_user.username + '/DirectoryLog', 'r')
            directory = archive.readline()
            archive.close()
            #acessa o log de execução
            archive = open(directory,'r')
            lines = archive.readlines()
            archive.close()
            #busca a ultima linha do log
            last_line = lines[len(lines)-1]
            if last_line.find('step ') > -1:
                #recebe a quantidade de step e a data de termino.
                date_finish = last_line        
                archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
                name_dynamic = archive.readline()
                archive.close()    
                return render_template('prodrg.html', actprodrg='active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
        
        archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
        name_dynamic = archive.readline()
        archive.close()
        return render_template('prodrg.html', actprodrg='active', steplist=steplist, name_dynamic=name_dynamic) 
        
    return render_template('prodrg.html', actprodrg='active')

# INFO ACPYPE
@DynamicBlueprint.route('/acpype', methods=['GET','POST'], endpoint='acpype')
@login_required
def acpype():
    if request.method == 'POST':
        file = request.files.get('file')
        fileitp = request.files.get('fileitp')
        filegro = request.files.get('filegro')
        CompleteFileName = acpypeGenerator.generate(file.filename, fileitp.filename, filegro.filename, request.form.get('campoforca'), request.form.get('modeloagua'), request.form.get('tipocaixa'), request.form.get('distanciacaixa'), request.form.get('neutralize'), request.form.get('double'), request.form.get('ignore'), current_user)  
        if request.form.get('download') == 'Download':
            name = file.filename.split('.')[0]+'_'+fileitp.filename.split('.')[0]
            return redirect(url_for('DownloadRoutes.commandsdownload', filename={"complete": CompleteFileName, "name": name}))
        
        if request.form.get('execute') == 'Executar':
            if upload_file_ligante(file, fileitp, filegro, current_user.username):    #dando upload no arquivo, salvando e checando
                executingLig = Config.UPLOAD_FOLDER + current_user.username + '/executingLig'
                if not os.path.exists(executingLig):
                    f = open(executingLig,'w')
                    f.writelines('{}\n'.format(current_user.username))
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('DynamicRoutes.acpype'))    
                
                executing = Config.UPLOAD_FOLDER + current_user.username + '/executing'
                if not os.path.exists(executing):
                    f = open(executing, 'w')
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('DynamicRoutes.acpype'))
            
                #preparar para executar
                MoleculeName = file.filename.split('.')[0]
                liganteitpName = fileitp.filename.split('.')[0]
                ligantegroName = filegro.filename.split('.')[0]
                moleculaLig = MoleculeName+'_'+liganteitpName
                AbsFileName = os.path.join(Config.UPLOAD_FOLDER, current_user.username,moleculaLig, 'run', 'logs', moleculaLig)
                
                exc = acpypeExecutor.execute(AbsFileName, CompleteFileName, current_user.username, moleculaLig, fileitp.filename, ligantegroName, MoleculeName)
                flash('Ocorreu um erro no comando {} com status {}'.format(exc[1],exc[0]), 'danger')
                return redirect(url_for('DynamicRoutes.acpype'))
            
            else:
                flash('A extensão dos arquivos está incorreta', 'danger')
            
    if CheckUserDynamicsLig(current_user.username) == True:
        flash('','steps')
        steplist = CheckDynamicsStepsLig(current_user.username)

        archive = open(Config.UPLOAD_FOLDER + current_user.username + '/executingLig','r')
        lines = archive.readlines()
        archive.close()
        last_line = lines[len(lines)-1]     
        #verifica se a execução já está  em produçãomd
        if last_line == '#productionmd\n' or last_line == '#analyzemd\n':
            #acessa o diretorio do log de execução
            archive = open(Config.UPLOAD_FOLDER + current_user.username + '/DirectoryLog', 'r')
            directory = archive.readline()
            archive.close()
            #acessa o log de execução
            archive = open(directory,'r')
            lines = archive.readlines()
            archive.close()
            #busca a ultima linha do log
            last_line = lines[len(lines)-1]
            if last_line.find('step ') > -1:
                #recebe a quantidade de step e a data de termino.
                date_finish = last_line        
                archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
                name_dynamic = archive.readline()
                archive.close()    
                return render_template('acpype.html', actacpype='active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
        
        archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
        name_dynamic = archive.readline()
        archive.close()                    
        return render_template('acpype.html', actacpype='active', steplist=steplist, name_dynamic=name_dynamic) 
        
    return render_template('acpype.html', actacpype='active')

##### liganteATB br #####
@DynamicBlueprint.route('/atb', methods=['GET','POST'], endpoint='atb')
@login_required
def atb():
    return render_template('atb.html', actatb='active')