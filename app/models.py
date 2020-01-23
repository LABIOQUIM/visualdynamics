from app import db, login_manager
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

#usuários já cadastrados no sistema
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), unique=True, index=True) 
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return '<User %r' % self.username

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


#usuários que solicitaram cadastrado no sistema
class NewUser(UserMixin, db.Model):
    __tablename__ = 'new_user'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(240), index=True, unique=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), unique=True, index=True) 
    password = db.Column(db.String(128))

    def __repr__(self):
        return '<NewUser %r' % self.username
