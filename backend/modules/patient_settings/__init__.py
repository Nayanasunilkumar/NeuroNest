from routes.patient_settings_routes import patient_settings_bp


def register(app):
    app.register_blueprint(patient_settings_bp, url_prefix="/api/patient/settings")
