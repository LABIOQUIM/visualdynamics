import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SECRET_KEY = 'gvon475gvqn5q5AISWDU'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(basedir, '../userfiles/')
    STATIC_FOLDER = os.path.join(basedir, '/app')
    ALLOWED_EXTENSIONS = {'pdb', 'itp', 'gro'}
    SOURCE_COMMAND = '/bin/bash -c source /usr/local/gromacs/bin/GMXRC'
    MDP_LOCATION_FOLDER = os.path.join(basedir, '../mdpfiles')
    LANGUAGES = ['en', 'pt']