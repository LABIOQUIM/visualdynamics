#!/usr/bin/python
# -*- coding: UTF-8 -*-
from app import app, db
from app.models import User
import random
import os
import sqlite3

basedir = os.path.abspath(os.path.dirname(__file__))

#TRUCATE na tabela
directoryDB = 'app/app.db'
conexao = sqlite3.connect(directoryDB)
cursor = conexao.cursor()
cursor.execute('DELETE FROM user;')
conexao.commit()
cursor.close()
conexao.close()

#numero aleatório para senha.
num = str(random.randrange(10000)*10000)
#novo admin.
name = "Administrador"
user = 'admin'
email = 'your.email@a.com'
password = 'vs'+num+'dynamics'

#anota o usuario e senha gerado automaticamente
directory = basedir+'/login.txt'
info = open(directory,'w')
usuario = 'username: '+user+'\n'
senha = 'password: '+password
info.write(usuario)
info.write(senha)
info.close()

#cria usuario no banco
new = User(name=name,username=user,email=email,register='True')
new.set_password(password)
db.session.add(new)
db.session.commit()