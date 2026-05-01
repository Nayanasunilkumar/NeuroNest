from routes.admin.settings_routes import admin_settings_bp


def register(app):
    app.register_blueprint(admin_settings_bp, url_prefix="/api/admin/settings")
