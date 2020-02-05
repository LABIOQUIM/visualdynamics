from app import app, db
from app.models import User
import random
import os
basedir = os.path.abspath(os.path.dirname(__file__))

UserData = User.query.all()
db.session.delete(UserData)
db.session.commit()

#numero aleatório para senha.
num = str(random.randrange(10000)*10000)
#novo admin.
user = 'admin'
email = 'your.email@a.com'
password = 'vs'+num+'dynamics
dir = os.path.expanduser('~') + '/Visualdynamics/login.txt'
info = open(dir,"w")
usuario = 'username: '+user+'\n'
senha = 'password: '+password
info.write(usuario)
info.write(senha)
new = User(username=user,email=email)
new.set_password(password)
db.session.add(new)
db.session.commit()

