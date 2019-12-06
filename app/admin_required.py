from .routes import current_app, current_user
from functools import wraps

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if current_user.username != 'admin':
            return current_app.login_manager.unauthorized()
        else:
            return fn(*args, **kwargs)
    return wrapper    