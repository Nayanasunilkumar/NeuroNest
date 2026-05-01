from routes.auth import auth_bp


def register(app):
    app.register_blueprint(auth_bp, url_prefix="/auth")
