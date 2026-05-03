from .routes.auth import auth_bp
from .routes.appointments import appointments_bp
from .routes.profile import profile_bp

def register(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(appointments_bp, url_prefix="/api/appointments")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
