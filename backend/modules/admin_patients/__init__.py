from routes.admin.manage_patients_routes import admin_patients_bp


def register(app):
    app.register_blueprint(admin_patients_bp, url_prefix="/api/admin/patients")
