def register(app):
    from .routes.patient_medical_records import patient_medical_bp
    from .routes.patient_settings_routes import patient_settings_bp

    app.register_blueprint(patient_medical_bp)
    app.register_blueprint(patient_settings_bp, url_prefix="/api/patient/settings")
