from app import app, login_manager, db
from flask import render_template, request, redirect, url_for, flash, send_file, current_app
from .models import User
from flask_login import logout_user, login_required, login_user, current_user
from .config import os, Config
from .generate import generate
from .generateLig import generateLig
from .execute import execute
from .executeLig import executelig
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


@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
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
            new = User(name=name,username=user,email=email,register='False')
            new.set_password(password)
            db.session.add(new)
            db.session.commit()
            flash('Solicitação de cadastro do(a) Usuário(a) {} realizada com sucesso. Em breve responderemos por Email se a solicitação foi aceita.'.format(user), 'primary')
            return redirect(url_for('login'))
        else:
            flash('Erro, email  ou usuário já estão sendo utilizados.', 'danger')
            return redirect(url_for('cadastro'))

    flash('Por favor, preencha os dados corretamente. Em caso de dados incorretos a solicitação de cadastro será cancelada.', 'danger')
    return render_template('cadastro.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        form_entry = request.form.get('username')
        user = User.query.filter((User.username == form_entry) | (User.email == form_entry)).first()
        #verifica se o usuário existe
        if user is None or not user.check_password(request.form.get('password')):
            flash('Usuário ou senha inválidos', 'danger')
            return render_template('login.html')
        #verifica se o cadastro do usuário é aceito.
        if user.register == 'False':
            flash('Seu cadastro ainda não foi aceito, aguarde o Email de confirmação.', 'danger')     
        else :
            login_user(user)
            return redirect(url_for('protected'))
    return render_template('login.html')

@app.route('/protected')
@login_required
def protected():
    flash('Olá {}, seja bem-vindo(a)'.format(current_user.username), 'primary')
    return redirect(url_for('index'))

@app.route('/', methods=['GET', 'POST'])
@login_required
def index():
    try:
        directory = Config.UPLOAD_FOLDER + '/' + current_user.username +'/info_dynamics'
        info_dynamics = open(directory,'r')
        list_dynamics = info_dynamics.readlines()
        return render_template('index.html', actindex = 'active', list_dynamics = list_dynamics)
    except:
        flash('Você ainda não realizou nenhuma dinâmica', 'danger')
        return render_template('index.html', actindex = 'active')

@app.route('/livre', methods=['GET', 'POST'])
@login_required
def livre():
    if request.method == 'POST':
        file = request.files.get('file')
        CompleteFileName = generate(file.filename,
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
            return redirect(url_for('commandsdownload',
                    filename={"complete" : CompleteFileName,
                    "name": file.filename.split('.')[0]}))
        if request.form.get('execute') == 'Executar':
            if upload_file(file, current_user.username):
                #checar se servidor esta em execução
                executing = Config.UPLOAD_FOLDER + current_user.username + '/executing'
                if not os.path.exists(executing):
                    f = open(executing,'w')
                    f.writelines('{}\n'.format(current_user.username))
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('livre'))    
                
                executingLig = Config.UPLOAD_FOLDER + current_user.username + '/executingLig'
                if not os.path.exists(executingLig):
                    f = open(executingLig, 'w')
                    f.close()
                else:
                    flash('Não é permitido que o mesmo usuário realize duas dinâmicas simultâneas.', 'danger')
                    return redirect(url_for('livre'))
            
                #preparar para executar
                MoleculeName = file.filename.split('.')[0]
                filename = file.filename
                AbsFileName = os.path.join(Config.UPLOAD_FOLDER,
                    current_user.username, MoleculeName , 'run',
                    'logs/', filename)

                exc = execute(AbsFileName, CompleteFileName, current_user.username, MoleculeName)
                flash('Ocorreu um erro no comando {} com status {}'.format(exc[1],exc[0]), 'danger')

            else:
                flash('Extensão do arquivo está incorreta', 'danger')
    
    if CheckUserDynamics(current_user.username) == True:
            flash('','steps')    
            steplist = CheckDynamicsSteps(current_user.username)
            archive = open(Config.UPLOAD_FOLDER + current_user.username + '/executing', "r")
            f = archive.readlines()
            last_line = f[len(f)-1]     
            #verifica se a execução já está  em produçãomd
            if last_line == '#productionmd\n':
                #acessa o diretorio do log de execução
                archive = open(Config.UPLOAD_FOLDER + current_user.username+ '/DirectoryLog', 'r')
                directory = archive.readline()
                #acessa o log de execução
                archive = open(directory,'r')
                lines = archive.readlines()
                #busca a ultima linha do log
                last_line = lines[len(lines)-1]
                if last_line.find('step ') > -1:
                    #recebe a quantidade de step e a data de termino.
                    date_finish = last_line        
                    archive.close()
                    archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
                    name_dynamic = archive.readline()
                    archive.close()
                    return render_template('livre.html', actlivre = 'active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
            
            archive.close()
            archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
            name_dynamic = archive.readline()
            archive.close()        
            return render_template('livre.html', actlivre = 'active', steplist=steplist, name_dynamic=name_dynamic) 
    
    return render_template('livre.html', actlivre = 'active')

@app.route('/ligante', methods=['GET','POST'])
@login_required
def ligante():
    if request.method == 'POST':
        file = request.files.get('file')
        fileitp = request.files.get('fileitp')
        filegro = request.files.get('filegro')
        CompleteFileName = generateLig(file.filename,
                                    fileitp.filename,
                                    filegro.filename,
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
            name = file.filename.split('.')[0]+'_'+fileitp.filename.split('.')[0]
            return redirect(url_for('commandsdownload',
                    filename={"complete" : CompleteFileName,
                    "name": name}))
        
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
        f = archive.readlines()
        last_line = f[len(f)-1]     
        #verifica se a execução já está  em produçãomd
        if last_line == '#productionmd\n':
            #acessa o diretorio do log de execução
            archive = open(Config.UPLOAD_FOLDER + current_user.username + '/DirectoryLog', 'r')
            directory = archive.readline()
            #acessa o log de execução
            archive = open(directory,'r')
            lines = archive.readlines()
            #busca a ultima linha do log
            last_line = lines[len(lines)-1]
            if last_line.find('step ') > -1:
                #recebe a quantidade de step e a data de termino.
                date_finish = last_line        
                archive.close()
                archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
                name_dynamic = archive.readline()
                archive.close()    
                return render_template('ligante.html', actlig = 'active', steplist=steplist, name_dynamic=name_dynamic, date_finish=date_finish)
        
        archive.close()
        archive = open(Config.UPLOAD_FOLDER+current_user.username+'/'+'namedynamic.txt','r')
        name_dynamic = archive.readline()
        archive.close()                    
        return render_template('ligante.html', actlig = 'active', steplist=steplist, name_dynamic=name_dynamic) 
        
    return render_template('ligante.html', actlig = 'active')

@app.route('/liganteATB', methods=['GET','POST'])
@login_required
def liganteATB():
    flash('Esta funcionalidade está em desenvolvimento', 'danger')
    return render_template('liganteATB.html', actligATB = 'active')

@app.route('/imgfiles/<filename>')
@login_required
def imgsdownload(filename):
    filename = filename.split(' ')[1]
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
    filename = filename.split(' ')[1]
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

@login_manager.unauthorized_handler
def unauthorized_handler():
    return redirect(url_for('logout'))

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/admin', methods=['GET', 'POST'])
@admin_required
def admin():
    UserData = User.query.filter(User.register == 'True')
    return render_template('admin.html', actadmin = 'active', UserData=UserData)

@app.route('/admin/cadastros', methods=['GET', 'POST'])
@admin_required
def admin_cadastros():
    NewUserData = User.query.filter(User.register == 'False')
    return render_template('admin_cadastros.html', NewUserData=NewUserData)


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


@app.route('/admin/newUser', methods=['GET', 'POST'])
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