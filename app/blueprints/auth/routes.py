from app.models import User
from . import AuthBlueprint
from flask import render_template, make_response, request, redirect, url_for, flash
from flask_babel import _
from flask_login import login_user, logout_user
from  app import login_manager, db


# INFO Cadastro
@AuthBlueprint.route('/register', methods=['GET', 'POST'], endpoint='register')
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
            return redirect(url_for('AuthRoutes.register'))

        if password != passwordconfirm:
            flash(_('ATENÇÃO. Os campos de senha e confirmar senha devem ser iguais.'), 'warning')
            return redirect(url_for('AuthRoutes.register'))

        # Verifica se usuário ou email já são utilizados
        check_email = User.query.filter(User.email == email).first()
        check_user = User.query.filter(User.username == user).first()
        if check_email is None and check_user is None:
            new = User(name=name, username=user, email=email, register='False')
            new.set_password(password)
            db.session.add(new)
            db.session.commit()
            flash(_('Solicitação de cadastro do(a) Usuário(a) %(username)s realizada com sucesso. Em breve responderemos por Email se a solicitação foi aceita.', username=user), 'primary')
            return redirect(url_for('AuthRoutes.login'))
        else:
            flash(_('Erro, email ou usuário já estão sendo utilizados.'), 'danger')
            return redirect(url_for('AuthRoutes.register'))

    flash(_('Por favor, preencha os dados corretamente. Em caso de dados incorretos seu cadastro poderá ser negado.'), 'info')
    return render_template('register.html', actregister='active')

# INFO Login
@AuthBlueprint.route('/login', methods=['GET', 'POST'], endpoint='login')
def login():
    if request.method == 'POST':
        usernameOrEmail = request.form.get('username')
        password = request.form.get('password')

        if usernameOrEmail == "":
            flash(_('O campo Nome Completo é obrigatório'), 'warning')

        if password == "":
            flash(_('O campo Senha é obrigatório'), 'warning')

        if usernameOrEmail == "" or password == "":
            return redirect(url_for('AuthRoutes.login'))

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
            return redirect(url_for('UserRoutes.index'))
    return render_template('login.html', actlogin='active')


@login_manager.unauthorized_handler
def unauthorized_handler():
    return redirect(url_for('AuthRoutes.logout'))

@AuthBlueprint.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('AuthRoutes.login'))
