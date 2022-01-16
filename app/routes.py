import datetime
from os import path, remove
from app import app, login_manager, db
from flask import render_template, make_response, request, redirect, url_for, flash, send_file, current_app
from .models import User
from flask_login import logout_user, login_required, login_user, current_user
from .config import os, Config
from .generate import generate
from .generateLig import generateLig
from .generateLigACPYPE import generateLigACPYPE
from .execute import execute
from .executeLig import executelig
from .executeLigACPYPE import executeLigACPYPE
from .upload_file import upload_file, upload_file_ligante
from .checkuserdynamics import CheckUserDynamics, CheckUserDynamicsLig, CheckDynamicsSteps, CheckDynamicsStepsLig
from .admin_required import admin_required
import ast
import errno
import zipfile
import glob
import smtplib
import shutil
from email.mime.text import MIMEText
from flask_babel import _

# INFO Alterar Idioma
# Altera o cookie preferred-lang (apenas 'en' e 'pt' possuem suporte)
@app.route('/set-lang/<lang>')
def setPreferredLang(lang):
    resp = make_response()
    resp.set_cookie("preferred-lang", value=lang)

    # redireciona pra página que usuário estava quando clicou em alguma das bandeiras
    resp.headers['location'] = request.referrer

    return resp, 302

# INFO Sobre
@app.route('/about', methods=['GET'], endpoint='about')
def about():
    return render_template('about.html', actabout='active')

# INFO Cadastro
@app.route('/register', methods=['GET', 'POST'], endpoint='register')
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        user = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        passwordconfirm = request.form.get('passwordconfirm')

        if name == "":
            flash(_('O campo Nome Completo é obrigatório'), 'warning')

        if user == "":
            flash(_('O campo Nome de Usuário é obrigatório'), 'warning')

        if email == "":
            flash(_('O campo Email deve ser válido e é obrigatório'), 'warning')

        if password == "":
            flash(_('O campo Senha é obrigatório'), 'warning')

        if passwordconfirm == "":
            flash(_('O campo Confirmar Senha é obrigatório'), 'warning')

        if name == "" or user == "" or email == "" or password == "" or passwordconfirm == "":
            return redirect(url_for('register'))

        if password != passwordconfirm:
            flash(_('ATENÇÃO. Os campos de senha e confirmar senha devem ser iguais.'), 'warning')
            return redirect(url_for('register'))

        # Verifica se usuário ou email já são utilizados
        check_email = User.query.filter(User.email == email).first()
        check_user = User.query.filter(User.username == user).first()
        if check_email is None and check_user is None:
            new = User(name=name, username=user, email=email, register='False')
            new.set_password(password)
            db.session.add(new)
            db.session.commit()
            flash(_('Solicitação de cadastro do(a) Usuário(a) %(username)s realizada com sucesso. Em breve responderemos por Email se a solicitação foi aceita.', username=user), 'primary')
            return redirect(url_for('login'))
        else:
            flash(_('Erro, email ou usuário já estão sendo utilizados.'), 'danger')
            return redirect(url_for('register'))

    flash(_('Por favor, preencha os dados corretamente. Em caso de dados incorretos seu cadastro poderá ser negado.'), 'info')
    return render_template('cadastro.html', actregister='active')

# INFO Login
@app.route('/login', methods=['GET', 'POST'], endpoint='login')
def login():
    if request.method == 'POST':
        usernameOrEmail = request.form.get('username')
        password = request.form.get('password')

        if usernameOrEmail == "":
            flash(_('O campo Nome Completo é obrigatório'), 'warning')

        if password == "":
            flash(_('O campo Senha é obrigatório'), 'warning')

        if usernameOrEmail == "" or password == "":
            return redirect(url_for('login'))

        user = User.query.filter((User.username == usernameOrEmail) | (User.email == usernameOrEmail)).first()

        # Verifica se o usuário não existe ou se a senha está incorreta
        if user is None or not user.check_password(password):
            flash(_('Usuário ou senha inválidos'), 'danger')
            return render_template('login.html', actlogin='active')

        # Verifica se o usuário está ativo
        if user.register == 'False':
            flash(_('Seu cadastro ainda não foi aceito, aguarde o Email de confirmação.'), 'warning')     
        else:
            login_user(user)
            return redirect(url_for('index'))
    return render_template('login.html', actlogin='active')

@app.route('/', methods=['GET'], endpoint='index')
@login_required
def index():
    try:
        directory = Config.UPLOAD_FOLDER + '/' + current_user.username + '/info_dynamics'
        info_dynamics = open(directory, 'r')
        list_dynamics = info_dynamics.readlines()

        dynamics = []

        for d in list_dynamics:
            obj = {
                "date": datetime.datetime.fromisoformat(d.strip().split("|")[0]).strftime("%b %d %Y %H:%M:%S"),
                "protein": d.strip().split("|")[1],
                "original": d
            }
            dynamics.insert(0, obj)

        return render_template('index.html', actindex='active', no_dynamics='False', list_dynamics=dynamics)
    except:
        return render_template('index.html', actindex='active', no_dynamics='True')

# INFO APO Enzima
@app.route('/apo', methods=['GET', 'POST'], endpoint='apo')
@login_required
def apo():
    if request.method == 'POST':
        file = request.files.get('file')
        CompleteFileName = generate(file.filename, request.form.get('campoforca'), request.form.get('modeloagua'), request.form.get('tipocaixa'), request.form.get('distanciacaixa'), request.form.get('neutralize'), request.form.get('double'), request.form.get('ignore'), current_user)  
        if request.form.get('download') == 'Download':
            return redirect(url_for('commandsdownload', filename={"complete" : CompleteFileName, "name": file.filename.split('.')[0]}))
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
                    return redirect(url_for('apo'))    
                
                executingLig = Config.UPLOAD_FOLDER + current_user.username + '/executingLig'
                if not os.path.exists(executingLig):
                    f = open(executingLig, 'w')
                    f.close()
                else:
                    flash(_('Desculpe, não é possível realizar duas dinâmicas ao mesmo tempo.'), 'danger')
                    return redirect(url_for('apo'))
            
                #preparar para executar
                MoleculeName = file.filename.split('.')[0]
                filename = file.filename
                AbsFileName = os.path.join(Config.UPLOAD_FOLDER,
                    current_user.username, MoleculeName , 'run',
                    'logs/', filename)

                exc = execute(AbsFileName, CompleteFileName, current_user.username, MoleculeName)
                flash(_('Houve um erro ao executar o comando {}. Verifique os logs para mais detalhes', command=exc[1]), 'danger')
            else:
                flash(_('Extensão do arquivo está incorreta'), 'danger')
    
    if CheckUserDynamics(current_user.username) == True:
            flash('', 'steps')
            steplist = CheckDynamicsSteps(current_user.username)

            if '#productionmd' in steplist:
                progress = "width: 95%"
            elif '#equilibrationnpt' in steplist:
                progress = "width: 87%"
            elif '#equilibrationnvt' in steplist:
                progress = "width: 75%"
            elif '#minimizationconjgrad' in steplist:
                progress = "width: 62%"
            elif '#minimizationsteepdesc' in steplist:
                progress = "width: 50%"
            elif '#ions' in steplist:
                progress = "width: 37%"
            elif '#solvate' in steplist:
                progress = "width: 25%"
            elif '#topology' in steplist:
                progress = "width: 12%"
            else:
                progress = "width: 5%"

            archive = open(Config.UPLOAD_FOLDER + current_user.username + '/executing', "r")
            lines = archive.readlines()
            archive.close()
            last_line = lines[len(lines)-1]     
            #verifica se a execução já está  em produçãomd
            if last_line == '#productionmd\n':
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
                    return render_template('apo.html', actapo='active', progress=progress, steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
            
            archive.close()
            archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
            name_dynamic = archive.readline()
            archive.close()        
            return render_template('apo.html', actapo='active', progress=progress, steplist=steplist, name_dynamic=name_dynamic) 
    
    return render_template('apo.html', actapo='active')

##### ligante br #####
@app.route('/prodrg', methods=['GET','POST'], endpoint='prodrg')
@login_required
def prodrg():
    if request.method == 'POST':
        file = request.files.get('file')
        fileitp = request.files.get('fileitp')
        filegro = request.files.get('filegro')
        CompleteFileName = generateLig(file.filename, fileitp.filename, filegro.filename, request.form.get('campoforca'), request.form.get('modeloagua'), request.form.get('tipocaixa'), request.form.get('distanciacaixa'), request.form.get('neutralize'), request.form.get('double'), request.form.get('ignore'), current_user)  
        if request.form.get('download') == 'Download':
            name = file.filename.split('.')[0]+'_'+fileitp.filename.split('.')[0]
            return redirect(url_for('commandsdownload', filename={"complete": CompleteFileName, "name": name}))
        
        if request.form.get('execute') == 'Executar':
            if upload_file_ligante(file, fileitp, filegro, current_user.username):    #dando upload no arquivo, salvando e checando
                executingLig = Config.UPLOAD_FOLDER + current_user.username + '/executingLig'
                if not os.path.exists(executingLig):
                    f = open(executingLig,'w')
                    f.writelines('{}\n'.format(current_user.username))
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('ligante'))    
                
                executing = Config.UPLOAD_FOLDER + current_user.username + '/executing'
                if not os.path.exists(executing):
                    f = open(executing, 'w')
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('ligante'))
            
                #preparar para executar
                MoleculeName = file.filename.split('.')[0]
                liganteitpName = fileitp.filename.split('.')[0]
                ligantegroName = filegro.filename.split('.')[0]
                moleculaLig = MoleculeName+'_'+liganteitpName
                AbsFileName = os.path.join(Config.UPLOAD_FOLDER,
                                    current_user.username,moleculaLig, 'run',
                                    'logs/', moleculaLig)
                
                exc = executelig(AbsFileName, CompleteFileName, current_user.username, moleculaLig, fileitp.filename, filegro.filename, MoleculeName)
                flash('Ocorreu um erro no comando {} com status {}'.format(exc[1],exc[0]), 'danger')
                return redirect(url_for('ligante'))
            
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
        if last_line == '#productionmd\n':
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
                return render_template('ligante.html', actlig = 'active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
        
        archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
        name_dynamic = archive.readline()
        archive.close()                    
        return render_template('prodrg.html', actprodrg='active', steplist=steplist, name_dynamic=name_dynamic) 
        
    return render_template('prodrg.html', actprodrg='active')

###### ligante ACPYPE BR ######
@app.route('/acpype', methods=['GET','POST'], endpoint='acpype')
@login_required
def acpype():
    if request.method == 'POST':
        file = request.files.get('file')
        fileitp = request.files.get('fileitp')
        filegro = request.files.get('filegro')
        CompleteFileName = generateLigACPYPE(file.filename, fileitp.filename, filegro.filename, request.form.get('campoforca'), request.form.get('modeloagua'), request.form.get('tipocaixa'), request.form.get('distanciacaixa'), request.form.get('neutralize'), request.form.get('double'), request.form.get('ignore'), current_user)  
        if request.form.get('download') == 'Download':
            name = file.filename.split('.')[0]+'_'+fileitp.filename.split('.')[0]
            return redirect(url_for('commandsdownload', filename={"complete": CompleteFileName, "name": name}))
        
        if request.form.get('execute') == 'Executar':
            if upload_file_ligante(file, fileitp, filegro, current_user.username):    #dando upload no arquivo, salvando e checando
                executingLig = Config.UPLOAD_FOLDER + current_user.username + '/executingLig'
                if not os.path.exists(executingLig):
                    f = open(executingLig,'w')
                    f.writelines('{}\n'.format(current_user.username))
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('liganteACPYPE'))    
                
                executing = Config.UPLOAD_FOLDER + current_user.username + '/executing'
                if not os.path.exists(executing):
                    f = open(executing, 'w')
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('liganteACPYPE'))
            
                #preparar para executar
                MoleculeName = file.filename.split('.')[0]
                liganteitpName = fileitp.filename.split('.')[0]
                ligantegroName = filegro.filename.split('.')[0]
                moleculaLig = MoleculeName+'_'+liganteitpName
                AbsFileName = os.path.join(Config.UPLOAD_FOLDER, current_user.username,moleculaLig, 'run', 'logs/', moleculaLig)
                
                exc = executeLigACPYPE(AbsFileName, CompleteFileName, current_user.username, moleculaLig, fileitp.filename, ligantegroName, MoleculeName)
                flash('Ocorreu um erro no comando {} com status {}'.format(exc[1],exc[0]), 'danger')
                return redirect(url_for('liganteACPYPE'))
            
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
        if last_line == '#productionmd\n':
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
                return render_template('liganteACPYPE.html', actligACPYPE = 'active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
        
        archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
        name_dynamic = archive.readline()
        archive.close()                    
        return render_template('liganteACPYPE.html', actacpype='active', steplist=steplist, name_dynamic=name_dynamic) 
        
    return render_template('acpype.html', actacpype='active')

##### liganteATB br #####
@app.route('/atb', methods=['GET','POST'], endpoint='atb')
@login_required
def atb():
    flash('Esta funcionalidade está em desenvolvimento', 'danger')
    return render_template('atb.html', actatb='active')

@app.route('/imgfiles/<filename>')
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

    return (send_file(ziplocation, as_attachment=True))

@app.route('/downloadmdpfiles')
@login_required
def downloadmdpfiles():
    ziplocation = os.path.join(Config.UPLOAD_FOLDER, current_user.username,'mdpfiles.zip')
    mdplist = os.listdir(os.chdir(Config.MDP_LOCATION_FOLDER))
    
    zf = zipfile.ZipFile(ziplocation,'w')

    for file in mdplist:
        if file.endswith('.mdp'):
            zf.write(file, compress_type = zipfile.ZIP_DEFLATED)
    
    zf.close()
    return (send_file(ziplocation, as_attachment=True))

@app.route('/dynamiccomandsdownload/<filename>')
@login_required
def dynamiccomandsdownload(filename):
    filename = filename.split('|')[1]
    os.chdir(Config.UPLOAD_FOLDER+'/'+current_user.username+'/'+filename)
    files = glob.glob("*.txt")
    files.sort(key=os.path.getmtime)
    file_comands = files[len(files)-1]
    directory = Config.UPLOAD_FOLDER+'/'+current_user.username+'/'+filename+'/'+file_comands
    return (send_file(directory, as_attachment=True))

@app.route('/download/<filename>')
@login_required
def commandsdownload(filename):
    filename = ast.literal_eval(filename)
    return send_file('{}{}/{}/{}'.format(Config.UPLOAD_FOLDER,
            current_user.username,filename["name"],filename["complete"]), as_attachment=True)

@app.route('/downloadlogs/<filename>')
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

@login_manager.unauthorized_handler
def unauthorized_handler():
    return redirect(url_for('logout'))

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))


###### admin br ######
@app.route('/admin', methods=['GET', 'POST'], endpoint='admin')
@admin_required
def admin():
    UserData = User.query.filter(User.register == 'True')
    return render_template('admin.html', actadmin='active', UserData=UserData)
#####################

##### admin cadastro br #####
@app.route('/admin/cadastros', methods=['GET', 'POST'], endpoint='admin_cadastro')
@admin_required
def admin_cadastros():
    NewUserData = User.query.filter(User.register == 'False')
    return render_template('admin_cadastros.html', NewUserData=NewUserData)

############# new user ################
@app.route('/admin/accept_newUser/<int:id>', methods=['GET', 'POST'])
@admin_required
def accept_newUser(id):
    #ativa o cadastro do usuário.
    UserData = User.query.get(int(id))
    UserData.register = 'True'
    name = UserData.name
    email = UserData.email
    db.session.add(UserData)
    db.session.commit()
    
    msg = MIMEText('<h3>Olá '+ name +', seu cadastro no Visual Dynamics foi aprovado.</h3>\
    Acesse http://157.86.248.13:8080 para utilizar o sistema.\
    <h5>E-mail gerado automáticamente, por favor não responder.</h5>','html', 'utf-8')

    #Criar email da oficial para o sistema
    msg['From'] = 'LABIOQUIM FIOCRUZ - RO'
    msg['To'] = email
    msg['Subject'] = 'Cadastro Visual Dynamics'
    message = msg.as_string()
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login("labioquim.rondonia.fiocruz@gmail.com", "ietcbybgbiiyfrko")
    server.sendmail("labioquim.rondonia.fiocruz@gmail.com", email, message)
    server.quit()
    flash('Solicitação de cadastro do(a) usuário(a) {} aceita com sucesso.'.format(UserData.username), 'primary')
    return redirect(url_for('admin_cadastros'))

####### admin_remove_br #########
@app.route('/admin/remove_newUser/<int:id>')
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
    msg['From'] = 'labioquim.rondonia.fiocruz@gmail.com'
    msg['To'] = email
    msg['Subject'] = 'Cadastro Visual Dynamics'
    message = msg.as_string()
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login("labioquim.rondonia.fiocruz@gmail.com", "ietcbybgbiiyfrko")
    server.sendmail("labioquim.rondonia.fiocruz@gmail.com", email, message)
    server.quit()
   
    flash('Solicitação de cadastro do(a) usuário(a) {} removida com sucesso.'.format(UserData.username), 'primary')
    return redirect(url_for('admin_cadastros'))

########## admin edit br ###########
@app.route('/admin/edit/<int:id>', methods=['GET', 'POST'])
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
                return redirect(url_for('admin'))
            except:
                flash('Erro, email  ou usuário já estão sendo utilizados.', 'danger')
                return redirect(url_for('edit_user', id=id))

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
                return redirect(url_for('admin'))
            except:
                flash('Erro, email  ou usuário já estão sendo utilizados.', 'danger')
                return redirect(url_for('edit_user', id=id))

        flash('Erro ao editar usuário(a) {}.'.format(user), 'danger')
        return redirect(url_for('admin'))
    UserData = User.query.get(int(id))
    return render_template('edit_user.html', UserData=UserData)

##### admin newUser br ########
@app.route('/admin/newUser', methods=['GET', 'POST'], endpoint='newUser')
@admin_required
def newuser():
    if request.method == 'POST':
        name = request.form.get('name')
        user = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        passconfirm = request.form.get('passwordconfirm')
        #faz checagem para verificar se usuário ou senha já são utilizados    
        check_email = User.query.filter(User.email == email).first()
        check_user = User.query.filter(User.username == user).first()
        if check_email is None and check_user is None:
            new = User(name=name,username=user,email=email,register='True')
            new.set_password(password)
            db.session.add(new)
            db.session.commit()
            flash('Cadastro do(a) Usuário(a) {} realizado com sucesso.'.format(user), 'primary')
            return redirect(url_for('admin'))
        else:
            flash('Erro, email  ou usuário já estão sendo utilizados.', 'danger')
            return redirect(url_for('newuser'))
  
    return render_template('new_user.html')

##############admin limpar pasta##########
@app.route('/admin/limpar/<int:id>')
@admin_required
def cleanfolder(id):
    UserData = User.query.get(int(id))
    user = UserData.username
    path = Config.UPLOAD_FOLDER + user
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
    return redirect(url_for('admin'))
##############################################

##### admin remove br ######
@app.route('/admin/remove/<int:id>')
@admin_required
def removeuser(id):
    UserData = User.query.get(int(id))
    if UserData.username != 'admin':
        db.session.delete(UserData)
        db.session.commit()
        flash('Usuário(a) {} removido(a) com sucesso.'.format(UserData.username), 'primary')
        return redirect(url_for('admin'))
    flash('Não é possível remover o admin', 'danger')
    return redirect(url_for('admin'))
############################

#### admin edit-md br ####
@app.route('/admin/edit-md', methods = ['GET', 'POST'])
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
        return redirect(url_for('admin'))

    #busca o valor do nsteps no arquivo ions.mdp para exibir para o usuario
    # i é o indice (posição)
    try:
        archive = open("md_pr.mdp","r")
    except:
        flash('Ocorreu um erro ao localizar arquivo, tente novamente mais tarde.', 'danger')
        return redirect(url_for('admin'))

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
    
    return render_template('edit_md.html', nsteps = nsteps, dt = dt)

##### admin current dynamics br ########
@app.route('/admin/current-dynamics', methods=['GET', 'POST'])
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
                #verifica se a execução é de enzima livre.
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
                    
                    #verifica se a execução é de enzima + ligante.
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

        return render_template('current_dynamics.html', currentDynamics=list_dynamics)
    
    except:
        flash('No momento nenhuma dinâmica está em execução.', 'danger')
        return render_template('current_dynamics.html')