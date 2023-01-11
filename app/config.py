import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
	SECRET_KEY = os.environ.get('VISUAL_DYNAMICS_SECRET_KEY')
	SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	UPLOAD_FOLDER = os.path.join(basedir, '..', 'VDfiles') if os.environ.get("FLASK_ENV") == "development" else os.path.join(basedir, '../..', 'VDfiles')
	STATIC_FOLDER = os.path.join(basedir, 'app')
	ALLOWED_EXTENSIONS = {'pdb', 'itp', 'gro'}
	SOURCE_COMMAND = '/bin/bash -c source /usr/local/gromacs/bin/GMXRC'
	MDP_LOCATION_FOLDER = os.path.join(basedir, 'static', 'mdpfiles')
	LANGUAGES = ['en', 'pt']
	VERSION = "1.3.0"
	MAIL_SERVER = "smtp.gmail.com"
	MAIL_PORT = 465
	MAIL_USE_SSL = True
	MAIL_USERNAME = os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL")
	MAIL_PASSWORD = os.environ.get("VISUAL_DYNAMICS_NO_REPLY_EMAIL_PASSWORD")