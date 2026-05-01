from routes.admin.reports_routes import admin_reports_bp


def register(app):
    app.register_blueprint(admin_reports_bp, url_prefix="/api/admin/reports")
