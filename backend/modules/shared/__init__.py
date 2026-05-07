from .routes.auth import auth_bp
from .routes.appointments import appointments_bp
from .routes.chat_routes import chat_bp
from .routes.profile import profile_bp
from .routes.config_routes import config_bp

def register(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(appointments_bp, url_prefix="/api/appointments")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(chat_bp, url_prefix="/chat", name="chat_legacy")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(config_bp, url_prefix="/api")
