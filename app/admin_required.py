from flask import current_app
from flask_login import current_user
from functools import wraps

#atualização para evitar que a pagina quebre
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            user = current_user.username
        except:
            user = ""
        if user != 'admin':
            return current_app.login_manager.unauthorized()
        else:
            return fn(*args, **kwargs)
    return wrapper    