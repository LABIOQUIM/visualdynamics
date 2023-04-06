import os
from flask import render_template
from app import mail
from flask_mail import Message
from flask_babel import _
from flask_login import current_user


def send_dynamic_success_email(name: str, filename: str, mode: str):
    try:
        html = render_template(
            "emails/mail-template.html",
            show_link=True,
            header=_("Olá, %(username)s", username=name),
            content=_(
                "Sua dinâmica %(mode)s da molécula %(molecule)s terminou.",
                mode=mode,
                molecule=filename,
            ),
        )

        subject = _("A dinâmica que você deixou executando acabou.")

        message = Message(
            html=html,
            subject=subject,
            recipients=[current_user.get_email()],
            sender=(
                "Visual Dynamics",
                os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL"),
            ),
        )

        mail.send(message)
    except:
        print("Couldn't send dynamic success mail")


def send_new_account_created_email(name: str, email: str):
    try:
        html = render_template(
            "emails/mail-template.html",
            show_link=True,
            header=_("Olá, Administrador"),
            content=_(
                "Há uma nova solicitação de cadastro.\nNome de Usuário: %(username)s\nEmail: %(email)s.",
                username=name,
                email=email,
            ),
        )

        subject = _("Nova solicitação de cadastro.")

        message = Message(
            html=html,
            subject=subject,
            recipients=[os.environ["VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL"]],
            sender=(
                "Visual Dynamics",
                os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL"),
            ),
        )

        mail.send(message)
    except:
        print("Couldn't send new account created mail")


def send_account_activated_email(name: str, email: str):
    try:
        html = render_template(
            "emails/mail-template.html",
            show_link=True,
            header=_("Olá, %(username)s", username=name),
            content=_("Sua conta foi validada e seu acesso a plataforma foi liberado."),
        )

        subject = _("Comece uma dinâmica ainda hoje.")

        message = Message(
            html=html,
            subject=subject,
            recipients=[email],
            sender=(
                "Visual Dynamics",
                os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL"),
            ),
        )

        mail.send(message)
    except:
        print("Couldn't send account activated mail")


def send_account_not_activated_email(name: str, email: str):
    try:
        html = render_template(
            "emails/mail-template.html",
            header=_("Olá, %(username)s", username=name),
            content=_(
                "Neste momento não foi possível realizar a ativação da sua conta. Se você acredita que foi um erro de nossa parte, por favor, entre em contato."
            ),
        )

        subject = _("Não foi possível validar sua conta.")

        message = Message(
            html=html,
            subject=subject,
            recipients=[email],
            sender=(
                "Visual Dynamics",
                os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL"),
            ),
        )

        mail.send(message)
    except:
        print("Couldn't send account not activated mail")
