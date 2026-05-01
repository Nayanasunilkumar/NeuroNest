from routes.admin.dashboard_routes import admin_dashboard_bp


def register(app):
    app.register_blueprint(admin_dashboard_bp, url_prefix="/api/admin/dashboard")
