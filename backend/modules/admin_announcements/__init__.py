from routes.admin.announcement_routes import admin_announcements_bp


def register(app):
    app.register_blueprint(admin_announcements_bp, url_prefix="/api/admin/announcements")
