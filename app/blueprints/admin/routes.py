from email.mime.text import MIMEText
import dateutil.parser
import os
import shutil
import smtplib
from app.config import Config
from app.models import User
from . import AdminBlueprint
from flask import render_template, request, flash, url_for, redirect
from flask_babel import _
from app import db
from app.admin_required import admin_required
from ...utils.send_email import (
    send_account_activated_email,
    send_account_not_activated_email,
)


@AdminBlueprint.route("/admin", methods=["GET", "POST"], endpoint="admin")
@admin_required
def admin():
    UserData = User.query.filter(User.register == "True")
    return render_template(
        "admin/index.html",
        actadmin="active",
        UserData=UserData,
        title=_("Área do Administrador"),
    )


@AdminBlueprint.route(
    "/admin/cadastros", methods=["GET", "POST"], endpoint="admin_cadastro"
)
@admin_required
def admin_cadastros():
    NewUserData = User.query.filter(User.register == "False")
    count = User.query.filter(User.register == "False").count()
    return render_template(
        "admin/requests.html",
        NewUserData=NewUserData,
        count=count,
        title=_("Solicitações de Cadastro"),
    )


############# new user ################
@AdminBlueprint.route("/admin/accept_newUser/<int:id>", methods=["GET", "POST"])
@admin_required
def accept_newUser(id):
    # ativa o cadastro do usuário.
    UserData = User.query.get(int(id))
    UserData.register = "True"
    name = UserData.name
    email = UserData.email
    db.session.add(UserData)
    db.session.commit()

    send_account_activated_email(name=name, email=email)

    flash(
        f"Solicitação de cadastro do(a) usuário(a) {UserData.name} aceita com sucesso.",
        "primary",
    )
    return redirect(url_for("AdminRoutes.admin_cadastro"))


####### admin_remove_br #########
@AdminBlueprint.route("/admin/remove_newUser/<int:id>")
@admin_required
def remove_newUser(id):
    UserData = User.query.get(int(id))
    name = UserData.name
    email = UserData.email
    db.session.delete(UserData)
    db.session.commit()

    send_account_not_activated_email(name=name, email=email)

    flash(
        "Solicitação de cadastro do(a) usuário(a) {} removida com sucesso.".format(
            UserData.username
        ),
        "primary",
    )
    return redirect(url_for("AdminRoutes.admin_cadastro"))


########## admin edit br ###########
@AdminBlueprint.route("/admin/edit/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_user(id):
    if request.method == "POST":
        name = request.form.get("name")
        user = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        passconfirm = request.form.get("passwordconfirm")
        if password == "" and passconfirm == "":
            UserData = User.query.get(int(id))
            UserData.name = name
            UserData.username = user
            UserData.email = email
            try:
                db.session.add(UserData)
                db.session.commit()
                flash(
                    "Dados do(a) usuário(a) {} alterados com sucesso.".format(user),
                    "primary",
                )
                return redirect(url_for("AdminRoutes.admin"))
            except:
                flash("Erro, email  ou usuário já estão sendo utilizados.", "danger")
                return redirect(url_for("AdminRoutes.edit_user", id=id))

        elif password == passconfirm:
            UserData = User.query.get(int(id))
            UserData.name = name
            UserData.username = user
            UserData.email = email
            try:
                UserData.set_password(password)
                db.session.add(UserData)
                db.session.commit()
                flash(
                    "Dados do(a) usuário(a) {} alterados com sucesso.".format(user),
                    "primary",
                )
                return redirect(url_for("AdminRoutes.admin"))
            except:
                flash("Erro, email  ou usuário já estão sendo utilizados.", "danger")
                return redirect(url_for("AdminRoutes.edit_user", id=id))

        flash("Erro ao editar usuário(a) {}.".format(user), "danger")
        return redirect(url_for("AdminRoutes.admin"))
    UserData = User.query.get(int(id))
    return render_template(
        "admin/edit/user.html",
        UserData=UserData,
        title=_("Modificando Usuário %(username)s", username=UserData.username),
    )


##############admin limpar pasta##########
@AdminBlueprint.route("/admin/limpar/<int:id>")
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
            flash("Pasta {path} já existe.")
        flash(
            "Os Arquivos na pasta {} foram apagados com sucesso.".format(user),
            "primary",
        )
    return redirect(url_for("AdminRoutes.admin"))


##############################################

##### admin remove br ######
@AdminBlueprint.route("/admin/remove/<int:id>")
@admin_required
def removeuser(id):
    UserData = User.query.get(int(id))
    if UserData.username != "admin":
        db.session.delete(UserData)
        db.session.commit()
        flash(
            "Usuário(a) {} removido(a) com sucesso.".format(UserData.username),
            "primary",
        )
        return redirect(url_for("AdminRoutes.admin"))
    flash("Não é possível remover o admin", "danger")
    return redirect(url_for("AdminRoutes.admin"))


############################

#### admin edit-md br ####
@AdminBlueprint.route("/admin/edit-md", methods=["GET", "POST"])
@admin_required
def edit_md():
    file_path = os.path.join(Config.MDP_LOCATION_FOLDER, "md_pr.mdp")
    # modifica o valor do nsteps no arquivo ions.mdp
    if request.method == "POST":
        new_nsteps = request.form.get("editnstep")
        new_dt = request.form.get("editDt")
        archive = open(file_path, "r")
        file = archive.readlines()

        # altera o valor do nsteps
        for i, text in enumerate(file):
            if text.find("nsteps") > -1:
                archive = open(file_path, "w")
                # altera a linha inteira do nsteps
                file[i] = (
                    "nsteps      = "
                    + new_nsteps
                    + "    ; 2 * 50000 = 1000 ps (1 ns) \n"
                )
                archive.writelines(file)

        # altera o valor do emstep
        for i, text in enumerate(file):
            if text.find("dt") > -1:
                archive = open(file_path, "w")
                # altera a linha inteira do nsteps
                file[i] = "dt          = " + new_dt + "     ; 2 fs \n"
                archive.writelines(file)

        flash("atualização realizada com sucesso.", "primary")
        return redirect(url_for("AdminRoutes.admin"))

    # busca o valor do nsteps no arquivo ions.mdp para exibir para o usuario
    # i é o indice (posição)
    try:
        archive = open(file_path, "r")
    except:
        flash(
            "Ocorreu um erro ao localizar arquivo, tente novamente mais tarde.",
            "danger",
        )
        return redirect(url_for("AdminRoutes.admin"))

    file = archive.readlines()
    # le o valor atual do nsteps
    for text in file:
        if text.find("nsteps") > -1:
            i = text.find("= ")
            i += 2
            text = text[i:].split(";")
            nsteps = text[0]
            nsteps = int(nsteps)

    # le o valor atual do emstep
    for text in file:
        if text.find("dt") > -1:
            i = text.find("= ")
            i += 2
            text = text[i:].split(";")
            dt = text[0]
            dt = float(dt)

    archive.close()

    return render_template(
        "admin/edit/md.html", nsteps=nsteps, dt=dt, title=_("Modificar md_pr.mdp")
    )


##### admin current dynamics br ########
@AdminBlueprint.route("/admin/current-dynamics", methods=["GET", "POST"])
@admin_required
def current_dynamics():
    # lista de dinâmicas em andamento.
    running_dynamics = []
    try:
        # lista as pastas dos usuários.
        directories = os.listdir(Config.UPLOAD_FOLDER)
        # ordena a lista de diretórios em ordem alfabética.
        directories.sort()

        for username in directories:
            user_folder_path = os.path.join(Config.UPLOAD_FOLDER, username)
            executing_file_path = os.path.join(user_folder_path, "executing")
            if os.path.exists(executing_file_path):
                log_file_path = os.path.join(user_folder_path, "log_dir")
                with open(log_file_path, "r") as f:
                    dynamic_data = f.readline()
                    dynamic_data = dynamic_data.replace(
                        "/run/logs/gmx-commands.log", ""
                    )
                    dynamic_data = dynamic_data.split("/")
                    dynamic_data_len = len(dynamic_data)

                with open(executing_file_path, "r") as f:
                    step = (
                        f.readlines()[len(f.readlines()) - 1]
                        .replace("#", "")
                        .replace("\n", "")
                    )

                canceled_path = os.path.join(str.join("/", dynamic_data), "canceled")
                status_path = os.path.join(str.join("/", dynamic_data), "status")

                with open(status_path, "r") as f:
                    line = f.readline()

                status = line.replace("\n", "")

                dynamic = {
                    "username": username,
                    "protein": dynamic_data[dynamic_data_len - 2],
                    "timestamp": dynamic_data[dynamic_data_len - 1],
                    "timestamp_format": dateutil.parser.isoparse(
                        dynamic_data[dynamic_data_len - 1]
                    ),
                    "mode": dynamic_data[dynamic_data_len - 3],
                    "step": step,
                    "folder": str.join("/", dynamic_data),
                    "is_canceled": True if os.path.isfile(canceled_path) else False,
                    "status": status,
                }

                running_dynamics.append(dynamic)

        return render_template(
            "admin/executing.html",
            running_dynamics=running_dynamics,
            title=_("Dinâmicas em Execução"),
        )

    except Exception:
        flash("No momento nenhuma dinâmica está em execução.", "danger")
        return render_template(
            "admin/executing.html",
            title=_("Dinâmicas em Execução"),
        )
