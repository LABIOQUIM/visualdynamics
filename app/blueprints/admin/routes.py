from email.mime.text import MIMEText
import os
import shutil
import smtplib
from app.config import Config
from app.models import User
from . import AdminBlueprint
from flask import render_template, make_response, request, flash, url_for, redirect
from flask_babel import _
from  app import login_manager, db
from app.admin_required import admin_required

@AdminBlueprint.route('/admin', methods=['GET', 'POST'], endpoint='admin')
@admin_required
def admin():
    UserData = User.query.filter(User.register == 'True')
    return render_template('admin/index.html', actadmin='active', UserData=UserData)

@AdminBlueprint.route('/admin/cadastros', methods=['GET', 'POST'], endpoint='admin_cadastro')
@admin_required
def admin_cadastros():
    NewUserData = User.query.filter(User.register == 'False')
    count = User.query.filter(User.register == 'False').count()
    return render_template('admin/requests.html', NewUserData=NewUserData, count=count)

############# new user ################
@AdminBlueprint.route('/admin/accept_newUser/<int:id>', methods=['GET', 'POST'])
@admin_required
def accept_newUser(id):
    #ativa o cadastro do usuário.
    UserData = User.query.get(int(id))
    UserData.register = 'True'
    name = UserData.name
    email = UserData.email
    db.session.add(UserData)
    db.session.commit()
    
    msg = MIMEText('<h3>Hey, '+ name +', your Visual Dynamics account has been activated.</h3>\
    Visit http://visualdynamics.fiocruz.br/, login to your account and start your dynamics. Just remember that you can only execute one (1) dynamic at a time.\
    <h5>Automated Email, don\'t reply.</h5>','html', 'utf-8')

    #Criar email da oficial para o sistema
    msg['From'] = 'LABIOQUIM FIOCRUZ - RO'
    msg['To'] = email
    msg['Subject'] = 'Account Activated - Visual Dynamics'
    message = msg.as_string()
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login(os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL"], os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD"])
    server.sendmail(os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL"], email, message)
    server.quit()
    flash(f'Solicitação de cadastro do(a) usuário(a) {UserData.name} aceita com sucesso.', 'primary')
    return redirect(url_for('AdminRoutes.admin_cadastro'))

####### admin_remove_br #########
@AdminBlueprint.route('/admin/remove_newUser/<int:id>')
@admin_required
def remove_newUser(id):
    UserData = User.query.get(int(id))
    name = UserData.name
    email = UserData.email
    db.session.delete(UserData)
    db.session.commit()

    msg = MIMEText('<h3>Olá '+ name +', seu cadastro no Visual Dynamics não foi aprovado.</h3>\
    Acesse http://157.86.248.13:8080 para tentar novamente.\
    <h5>E-mail gerado automáticamente, por favor não responder.</h5>','html', 'utf-8')

    #Criar email da oficial para o sistema
    msg['From'] = os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL"]
    msg['To'] = email
    msg['Subject'] = 'Cadastro Visual Dynamics'
    message = msg.as_string()
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login(os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL"], os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD"])
    server.sendmail(os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL"], email, message)
    server.quit()
   
    flash('Solicitação de cadastro do(a) usuário(a) {} removida com sucesso.'.format(UserData.username), 'primary')
    return redirect(url_for('AdminRoutes.admin_cadastros'))

########## admin edit br ###########
@AdminBlueprint.route('/admin/edit/<int:id>', methods=['GET', 'POST'])
@admin_required
def edit_user(id):
    if request.method == 'POST':
        name = request.form.get('name')
        user = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        passconfirm = request.form.get('passwordconfirm')
        if password == '' and passconfirm == '':
            UserData = User.query.get(int(id))
            UserData.name = name
            UserData.username = user
            UserData.email = email
            try:
                db.session.add(UserData)
                db.session.commit()
                flash('Dados do(a) usuário(a) {} alterados com sucesso.'.format(user), 'primary')
                return redirect(url_for('AdminRoutes.admin'))
            except:
                flash('Erro, email  ou usuário já estão sendo utilizados.', 'danger')
                return redirect(url_for('AdminRoutes.edit_user', id=id))

        elif password == passconfirm:
            UserData = User.query.get(int(id))
            UserData.name = name
            UserData.username = user
            UserData.email = email
            try:
                UserData.set_password(password)
                db.session.add(UserData)
                db.session.commit()
                flash('Dados do(a) usuário(a) {} alterados com sucesso.'.format(user), 'primary')
                return redirect(url_for('AdminRoutes.admin'))
            except:
                flash('Erro, email  ou usuário já estão sendo utilizados.', 'danger')
                return redirect(url_for('AdminRoutes.edit_user', id=id))

        flash('Erro ao editar usuário(a) {}.'.format(user), 'danger')
        return redirect(url_for('AdminRoutes.admin'))
    UserData = User.query.get(int(id))
    return render_template('admin/edit/user.html', UserData=UserData)

##############admin limpar pasta##########
@AdminBlueprint.route('/admin/limpar/<int:id>')
@admin_required
def cleanfolder(id):
    UserData = User.query.get(int(id))
    user = UserData.username
    path = os.path.join(Config.UPLOAD_FOLDER, user)
    if os.path.exists(path):
        try:
            shutil.rmtree(path)
        except OSError as e:
            flash("Error: %s - %s " % (e.filename, e.strerror))
        try:
            os.mkdir(path)
        except FileExistsError as e:
            flash('Pasta {path} já existe.')
        flash('Os Arquivos na pasta {} foram apagados com sucesso.'.format(user), 'primary')
    return redirect(url_for('AdminRoutes.admin'))
##############################################

##### admin remove br ######
@AdminBlueprint.route('/admin/remove/<int:id>')
@admin_required
def removeuser(id):
    UserData = User.query.get(int(id))
    if UserData.username != 'admin':
        db.session.delete(UserData)
        db.session.commit()
        flash('Usuário(a) {} removido(a) com sucesso.'.format(UserData.username), 'primary')
        return redirect(url_for('AdminRoutes.admin'))
    flash('Não é possível remover o admin', 'danger')
    return redirect(url_for('AdminRoutes.admin'))
############################

#### admin edit-md br ####
@AdminBlueprint.route('/admin/edit-md', methods = ['GET', 'POST'])
@admin_required
def edit_md():
    os.chdir(Config.MDP_LOCATION_FOLDER)
    #modifica o valor do nsteps no arquivo ions.mdp
    if request.method == 'POST':   
        new_nsteps = request.form.get('editnstep')
        new_dt = request.form.get('editDt')
        archive = open("md_pr.mdp","r") 
        file = archive.readlines()
        
        #altera o valor do nsteps
        for i, text in enumerate(file):
            if text.find('nsteps') > -1:
                archive = open("md_pr.mdp","w")       
                # altera a linha inteira do nsteps        
                file[i] = "nsteps      = "+ new_nsteps +"    ; 2 * 50000 = 1000 ps (1 ns) \n"
                archive.writelines(file) 

        #altera o valor do emstep
        for i, text in enumerate(file):
            if text.find('dt') > -1:
                archive = open("md_pr.mdp","w")
                # altera a linha inteira do nsteps
                file[i] = "dt          = "+ new_dt +"     ; 2 fs \n"
                archive.writelines(file) 

        flash('atualização realizada com sucesso.', 'primary')
        return redirect(url_for('AdminRoutes.admin'))

    #busca o valor do nsteps no arquivo ions.mdp para exibir para o usuario
    # i é o indice (posição)
    try:
        archive = open("md_pr.mdp","r")
    except:
        flash('Ocorreu um erro ao localizar arquivo, tente novamente mais tarde.', 'danger')
        return redirect(url_for('AdminRoutes.admin'))

    file = archive.readlines()
    #le o valor atual do nsteps
    for text in file:
        if text.find('nsteps') > -1:
            i = text.find('= ')        
            i+=2
            text = text[i:].split(';')
            nsteps = text[0]
            nsteps = int(nsteps)

    #le o valor atual do emstep
    for text in file:
        if text.find('dt') > -1:
            i = text.find('= ')
            i+=2
            text = text[i:].split(';')
            dt = text[0]
            dt = float(dt)
    
    archive.close()
    
    return render_template('admin/edit/md.html', nsteps = nsteps, dt = dt)

##### admin current dynamics br ########
@AdminBlueprint.route('/admin/current-dynamics', methods=['GET', 'POST'])
@admin_required
def current_dynamics():
    #lista de dinâmicas em andamento.
    list_dynamics = list()
    try:
        #lista as pastas dos usuários.
        list_directory = os.listdir(Config.UPLOAD_FOLDER)
        #ordena a lista de diretórios em ordem alfabética.
        list_directory.sort()
        
        for pasta in list_directory:
            try:
                directory = Config.UPLOAD_FOLDER + pasta
                #lendo os usuários e verificando se eles estão com alguma dinâmica em andamento.
                #verifica se a execução é de proteína livre.
                if os.stat(directory + '/executing').st_size != 0:
                    archive = open(directory + '/executing', 'r')
                    #captura o nome do usuário.
                    username = archive.readline()
                    archive.close()
                    #captura o nome da dinâmica.
                    archive = open(directory + '/namedynamic.txt','r')
                    name_dynamic = archive.readline()
                    archive.close()
                    #captura a data final da dinâmica.
                    archive = open(directory + '/executing','r')
                    lines = archive.readlines()
                    archive.close()
                    last_line = lines[len(lines)-1]     
                    #verifica se a execução já está em productionmd.
                    if last_line == '#productionmd\n':
                        #acessa o diretorio do log de execução.
                        archive = open(directory + '/DirectoryLog', 'r')
                        directorylog = archive.readline()
                        archive.close()
                        #acessa o log de execução.
                        archive = open(directorylog,'r')
                        lines = archive.readlines()
                        archive.close()
                        #busca a ultima linha do log.
                        last_line = lines[len(lines)-1]
                        if last_line.find('step ') > -1:
                            #recebe a quantidade de step e a data de termino.
                            date_finish = last_line
                            #criando objeto com informações da dinâmica para exibir no front-end.   
                            currentDynamics = {"username": username, "name_dynamic": name_dynamic, "date_finish":date_finish}
                            #adicionando objeto a lista de dinamicas.
                            list_dynamics.append(currentDynamics) 
                    else:
                        #caso não esteja em productionmd, é enviado o nome da etapa que a dinâmica esta.     
                        #criando objeto com informações da dinâmica para exibir no front-end. 
                        currentDynamics = {"username": username, "name_dynamic": name_dynamic, "date_finish":last_line}
                        #adicionando objeto a lista de dinamicas.
                        list_dynamics.append(currentDynamics)
                    
                    #verifica se a execução é de proteína + ligante.
                elif os.stat(directory + '/executingLig').st_size != 0:
                    archive = open(directory + '/executingLig', 'r')
                    #captura o nome do usuário.
                    username = archive.readline()
                    archive.close()
                    #captura o nome da dinâmica.
                    archive = open(directory + '/namedynamic.txt','r')
                    name_dynamic = archive.readline()
                    archive.close()
                    #captura a data final da dinâmica.
                    archive = open(directory + '/executingLig','r')
                    lines = archive.readlines()
                    archive.close()
                    last_line = lines[len(lines)-1]     
                    #verifica se a execução já está  em productionmd.
                    if last_line == '#productionmd\n':
                        #acessa o diretorio do log de execução.
                        archive = open(directory + '/DirectoryLog', 'r')
                        directorylog = archive.readline()
                        archive.close()
                        #acessa o log de execução.
                        archive = open(directorylog,'r')
                        lines = archive.readlines()
                        archive.close()
                        #busca a ultima linha do log.
                        last_line = lines[len(lines)-1]
                        if last_line.find('step ') > -1:
                            #recebe a quantidade de step e a data de termino.
                            date_finish = last_line
                            #criando objeto com informações da dinâmica para exibir no front-end. 
                            currentDynamics = {"username": username, "name_dynamic": name_dynamic, "date_finish":date_finish}   
                            #adicionando objeto a lista de dinamicas.
                            list_dynamics.append(currentDynamics)
                    else:
                        #caso não esteja em productionmd, é enviado o nome da etapa que a dinâmica esta.     
                        #criando objeto com informações da dinâmica para exibir no front-end.
                        currentDynamics = {"username": username, "name_dynamic": name_dynamic, "date_finish":last_line}
                        #adicionando objeto a lista de dinamicas.
                        list_dynamics.append(currentDynamics)

            except:
                #caso os arquivos estejam todos vazios, apenas renova a lista e vai para a proxima pasta.
                list_directory += list() 

        return render_template('admin/executing.html', currentDynamics=list_dynamics)
    
    except:
        flash('No momento nenhuma dinâmica está em execução.', 'danger')
        return render_template('admin/executing.html')