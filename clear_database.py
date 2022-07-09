#!/usr/bin/python
# -*- coding: UTF-8 -*-
from app import app, db
from app.models import User
import random
import os
import sqlite3
import hashlib

basedir = os.path.abspath(os.path.dirname(__file__))

directoryDB = 'app/app.db'
conexao = sqlite3.connect(directoryDB)
cursor = conexao.cursor()
cursor.execute('DELETE FROM user;')
conexao.commit()
cursor.close()
conexao.close()

num = str(random.randrange(10000)*10000)
name = 'Administrator'
user = 'admin'
email = os.environ["VISUAL_DYNAMICS_ADMINISTRATOR_EMAIL"]
password = user + num
hash = hashlib.sha1(password.encode())
password = hash.hexdigest()

#anota o usuario e senha gerado automaticamente
directory = basedir + '/login.txt'
info = open(directory,'w')
usuario = f'username: {user}\n'
senha = f'password: {password}'
info.write(usuario)
info.write(senha)
info.close()

#cria usuario no banco
new = User(name=name,username=user,email=email,register='True')
new.set_password(password)
db.session.add(new)
db.session.commit()