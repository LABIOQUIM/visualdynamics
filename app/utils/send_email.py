import os
from flask import render_template
from app import mail
from flask_mail import Message
from flask_babel import _
from flask_login import current_user

def send_dynamic_success_email(name: str, filename: str, mode: str):
    try:
        html = render_template('emails/dynamic-ended.html', username=name, filename=filename, mode=mode)
        
        subject = _("Sua Dinâmica Acabou")

        message = Message(html=html, subject=subject, recipients=[current_user.get_email()], sender=("Visual Dynamics", os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL")))
        
        mail.send(message)
    except:
        print("Couldn't send dynamic success mail")


def send_new_account_created_email(name: str, email: str):
    try:
        html = render_template('emails/new-account-created.html', username=name, email=email)
    
        subject = _("Nova Conta Criada")

        message = Message(html=html, subject=subject, recipients=[os.environ["VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL"]], sender=("Visual Dynamics", os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL")))
        
        mail.send(message)
    except:
        print("Couldn't send new account created mail")

def send_account_activated_email(name: str, email: str):
    try:
        html = render_template('emails/account-activated.html', username=name)
    
        subject = _("Sua Conta foi Ativada")

        message = Message(html=html, subject=subject, recipients=[email], sender=("Visual Dynamics", os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL")))
        
        mail.send(message)
    except:
        print("Couldn't send account activated mail")
  
def send_account_not_activated_email(name: str, email: str):
    try:
        html = render_template('emails/account-not-activated.html', username=name)
    
        subject = _("Sua Conta não pôde Ativada")

        message = Message(html=html, subject=subject, recipients=[email], sender=("Visual Dynamics", os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL")))
        
        mail.send(message)
    except:
        print("Couldn't send account not activated mail")