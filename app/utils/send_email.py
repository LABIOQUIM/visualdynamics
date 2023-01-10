from email.mime.text import MIMEText
import os
import smtplib


def send_dynamic_success_email(name: str, email: str):
  msg = MIMEText(
    f'<h2>Hey there, {name}</h2><br/>\
    The dynamic you left running just ended.<br/>\
    <h5>Automated Email, don\'t reply.</h5>',
    'html',
    'utf-8'
  )

  #Criar email da oficial para o sistema
  msg['From'] = 'Visual Dynamics - LABIOQUIM FIOCRUZ - RO'
  msg['To'] = email
  msg['Subject'] = 'Dynamic Ended - Visual Dynamics'
  message = msg.as_string()
  server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
  server.login(os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL"], os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD"])
  server.sendmail(os.environ["VISUAL_DYNAMICS_NO_REPLY_EMAIL"], os.environ["VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL"], message)
  server.quit()