from routes.modules_config import modules_config_bp


def register(app):
    app.register_blueprint(modules_config_bp, url_prefix="/api/modules")
