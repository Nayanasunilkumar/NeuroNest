from routes.admin.manage_appointments_routes import admin_appointments_bp


def register(app):
    app.register_blueprint(admin_appointments_bp, url_prefix="/api/admin/appointments")
