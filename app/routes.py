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
from .checkuserdynamics import CheckUserDynamics, CheckDynamicsSteps
from .admin_required import admin_required
import ast
import errno
import zipfile

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        form_entry = request.form.get('username')
        user = User.query.filter((User.username == form_entry) | (User.email == form_entry)).first()
        if user is None or not user.check_password(request.form.get('password')):
            flash('Email ou senha inválidos', 'danger')
        else :
            login_user(user)
            return redirect(url_for('protected'))
    return render_template('login.html')

@app.route('/protected')
@login_required
def protected():
    flash('Olá {}, seja bem-vindo(a)'.format(current_user.username), 'success')
    return redirect(url_for('index'))

@app.route('/', methods=['GET', 'POST'])
@login_required
def index():
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
        if request.form.get('download') == 'Baixar Lista de Comandos':
            return redirect(url_for('commandsdownload',
                    filename={"complete" : CompleteFileName,
                    "name": file.filename.split('.')[0]}))
        if request.form.get('execute') == 'Executar':
            if upload_file(file, current_user.username):
                #checar se servidor esta em execução
                try:
                    f = open(Config.UPLOAD_FOLDER+'executing','x+')
                    f.writelines('{}\n'.format(current_user.username))
                    f.close()
                except OSError as e:
                    if e.errno == errno.EEXIST:
                        flash('O servidor está em execução', 'danger')
                        return redirect(url_for('index'))
                #preparar para executar
                MoleculeName = file.filename.split('.')[0]
                return redirect(url_for('executar', comp=CompleteFileName,
                    mol=MoleculeName, filename=file.filename)) 
            else:
                flash('Extensão do arquivo está incorreta', 'danger')
    
    if CheckUserDynamics(current_user.username) == True:
            flash('','steps')    
            steplist = CheckDynamicsSteps(current_user.username)
            archive = open(Config.UPLOAD_FOLDER+"executing", "r")
            f = archive.readlines()
            last_line = f[len(f)-1]     
            #verifica se a execução já está  em produçãomd
            if last_line == '#productionmd\n':
                #acessa o diretorio do log de execução
                archive = open(Config.UPLOAD_FOLDER+current_user.username+'/DirectoryLog', 'r')
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
                    return render_template('index.html', actindex = 'active', steplist=steplist, date_finish=date_finish)
            
            archive.close()
            return render_template('index.html', actindex = 'active', steplist=steplist) 
    
    return render_template('index.html', actindex = 'active')
    

@app.route('/executar/<comp>/<mol>/<filename>')
@login_required
def executar(comp,mol,filename):
    AbsFileName = os.path.join(Config.UPLOAD_FOLDER,
                    current_user.username, mol , 'run',
                    'logs/', filename)
    exc = execute(AbsFileName, comp, current_user.username, mol)
    flash('Ocorreu um erro no comando {} com status {}'.format(exc[1],exc[0]), 'danger')
    return redirect(url_for('index'))


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
        if request.form.get('download') == 'Baixar Lista de Comandos':
            name = file.filename.split('.')[0]+'_'+fileitp.filename.split('.')[0]
            return redirect(url_for('commandsdownload',
                    filename={"complete" : CompleteFileName,
                    "name": name}))
        
        if request.form.get('execute') == 'Executar':
            if upload_file_ligante(file, fileitp, filegro, current_user.username):    #checar se servidor esta em execução
                    try:
                        f = open(Config.UPLOAD_FOLDER+'executing','x+')
                        f.writelines('{}\n'.format(current_user.username))
                        f.close()
                    except OSError as e:
                        if e.errno == errno.EEXIST:
                            flash('O servidor está em execução', 'danger')
                            return redirect(url_for('index'))
                    #preparar para executar
                    MoleculeName = file.filename.split('.')[0]
                    liganteitpName = fileitp.filename.split('.')[0]
                    ligantegroName = filegro.filename.split('.')[0]
                    return redirect(url_for('executarlig', comp=CompleteFileName,
                        mol=MoleculeName,ligitp=liganteitpName,liggro =ligantegroName,
                        filename=file.filename, itpname=fileitp.filename, groname=filegro.filename)) 
            else:
                 flash('A extensão dos arquivos está incorreta', 'danger')
            
            

    if CheckUserDynamics(current_user.username) == True:
        flash('','steps')   
    return render_template('ligante.html', actlig = 'active')

@app.route('/executarlig/<comp>/<mol>/<ligitp>/<liggro>/<filename>/<itpname>/<groname>')
@login_required
def executarlig(comp,mol,ligitp,liggro,filename,itpname,groname):
    moleculaLig = mol+'_'+ligitp
    AbsFileName = os.path.join(Config.UPLOAD_FOLDER,
                    current_user.username,moleculaLig, 'run',
                    'logs/', moleculaLig)
    exc = executelig(AbsFileName, comp, current_user.username, moleculaLig, itpname, mol)
    flash('Ocorreu um erro no comando {} com status {}'.format(exc[1],exc[0]), 'danger')
    return redirect(url_for('ligante'))


@app.route('/imgfiles')
@login_required
def imgsdownload():
    current_location = os.path.join(Config.UPLOAD_FOLDER, current_user.username)
    ziplocation = os.path.join(current_location, 'imagens.zip')
    
    zf = zipfile.ZipFile(ziplocation,'w')

    for folder, subfolders, files in os.walk(current_location):
 
        for file in files:
            if file.endswith('.PNG'):
                zf.write(os.path.join(folder, file), file, compress_type = zipfile.ZIP_DEFLATED)
    zf.close()

    return (send_file(ziplocation, as_attachment=True))

@app.route('/download/<filename>')
@login_required
def commandsdownload(filename):
    filename = ast.literal_eval(filename)
    return send_file('{}{}/{}/{}'.format(Config.UPLOAD_FOLDER,
            current_user.username,filename["name"],filename["complete"]), as_attachment=True)

@login_manager.unauthorized_handler
def unauthorized_handler():
    flash('Por favor, faça Login', 'warning')
    return redirect(url_for('login'))

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/admin', methods=['GET', 'POST'])
@admin_required
def admin():
    UserData = User.query.all()
    return render_template('admin.html', actadmin = 'active', UserData=UserData)

@app.route('/admin/edit/<int:id>', methods=['GET', 'POST'])
@admin_required
def edit_user(id):
    if request.method == 'POST':
        user = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        passconfirm = request.form.get('passwordconfirm')
        if password == '' and passconfirm == '':
            UserData = User.query.get(int(id))
            UserData.username = user
            UserData.email = email
            db.session.add(UserData)
            db.session.commit()
            flash('Nome de Usuário e E-mail alterados com sucesso', 'success')
            return redirect(url_for('index'))
        elif password == passconfirm:
            UserData = User.query.get(int(id))
            UserData.username = user
            UserData.email = email
            UserData.set_password(password)
            db.session.add(UserData)
            db.session.commit()
            flash('Senha alterada com sucesso', 'success')
            return redirect(url_for('index'))
        flash('Erro ao criar usuário', 'danger')
        return redirect(url_for('index'))
    UserData = User.query.get(int(id))
    return render_template('edit_user.html', UserData=UserData)

@app.route('/admin/new', methods=['GET', 'POST'])
@admin_required
def newuser():
    if request.method == 'POST':
        user = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        passconfirm = request.form.get('passwordconfirm')
        if password == passconfirm:
            new = User(username=user,email=email)
            new.set_password(password)
            db.session.add(new)
            db.session.commit()
            flash('Usuário criado com sucesso!', 'success')
            return redirect(url_for('index'))
        flash('Erro ao criar usuário', 'danger')
        return redirect(url_for('index'))
    return render_template('new_user.html')

@app.route('/admin/remove/<int:id>')
@admin_required
def removeuser(id):
    UserData = User.query.get(int(id))
    if UserData.username != 'admin':
        db.session.delete(UserData)
        db.session.commit()
        flash('Usuário removido com sucesso', 'success')
        return redirect(url_for('admin'))
    flash('Não é possível remover o admin', 'danger')
    return redirect(url_for('index'))

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

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


        flash('atualização realizada com sucesso.', 'success')
        return redirect(url_for('edit_md'))
        
    #busca o valor do nsteps no arquivo ions.mdp para exibir para o usuario
    # i é o indice (posição)
    try:
        archive = open("md_pr.mdp","r")
    except:
        flash('Arquivo md_pr.mdp não Localizado.', 'danger')
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


