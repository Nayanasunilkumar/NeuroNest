from routes.doctor_settings_routes import doctor_settings_bp


def register(app):
    app.register_blueprint(doctor_settings_bp, url_prefix="/api/doctor/settings")
