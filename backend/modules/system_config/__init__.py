from routes.system_config_routes import system_config_bp


def register(app):
    app.register_blueprint(system_config_bp, url_prefix="/api/system-config")
