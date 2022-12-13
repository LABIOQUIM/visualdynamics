from .config import Config, os

def CheckUserDynamics(username):
	'''
	Return True if the executing dynamic belongs to the logged user
	'''
	fname = Config.UPLOAD_FOLDER + username + '/executing'
	if os.path.exists(fname):
		with open(fname,'r') as f:
			if f.readline().rstrip() == username:
				return True
	
	return False

def CheckUserDynamicsLig(username):
	#Verifica se a dinamica  executada é com ligante
	fnamelig = Config.UPLOAD_FOLDER + username + '/executingLig'
	if os.path.exists(fnamelig):
		with open(fnamelig,'r') as f:
			if f.readline().rstrip() == username:
				return True 

	return False

def CheckDynamicsSteps(username):
	'''
	Return a list with all the steps till now
	'''
	fname = Config.UPLOAD_FOLDER + username + '/executing'
	if os.path.exists(fname):
		with open(fname, 'r') as f:
			lines = f.readlines()
			return [line.rstrip() for line in lines if line.rstrip() != username]
    
    
def CheckDynamicsStepsLig(username):
	fnamelig = Config.UPLOAD_FOLDER + username + '/executingLig'
	if os.path.exists(fnamelig):
		with open(fnamelig, 'r') as f:
			lines = f.readlines()
			return [line.rstrip() for line in lines if line.rstrip() != username]