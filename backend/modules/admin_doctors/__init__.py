from routes.admin.manage_doctors_routes import admin_doctors_bp


def register(app):
    app.register_blueprint(admin_doctors_bp, url_prefix="/api/admin/doctors")
