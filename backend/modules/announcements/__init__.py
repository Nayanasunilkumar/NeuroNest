from routes.announcements import announcements_bp


def register(app):
    app.register_blueprint(announcements_bp, url_prefix="/api/announcements")
