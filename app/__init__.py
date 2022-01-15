from flask import Flask
from flask_login import LoginManager, login_user, login_required, current_user, logout_user, UserMixin
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_babel import Babel
from app.config import Config
from flask import request

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.init_app(app)

babel = Babel(app)

@babel.localeselector
def get_locale():
    if request.cookies.get('preferred-lang'):
      return request.cookies.get('preferred-lang')
    else: 
      return 'pt'

from app import routes, models, cli