from .config import Config, os

def CheckUserDynamics(username):
    '''
    Return True if the executing dynamic belongs to the logged user
    '''
    fname = Config.UPLOAD_FOLDER + 'executing'
    if os.path.exists(fname):
        with open(fname,'r') as f:
            if f.readline().rstrip() == username:
                return True
    return False

def CheckDynamicsSteps(username):
    '''
    Return a list with all the steps till now
    '''
    fname = Config.UPLOAD_FOLDER + 'executing'
    if os.path.exists(fname):
        with open(fname, 'r') as f:
            lines = f.readlines()
            return [line.rstrip() for line in lines if line.rstrip() != username]