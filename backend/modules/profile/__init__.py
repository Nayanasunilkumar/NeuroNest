from routes.profile import profile_bp


def register(app):
    app.register_blueprint(profile_bp, url_prefix="/profile")
