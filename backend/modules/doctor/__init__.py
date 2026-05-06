def register(app):
    from .routes.doctor import doctor_bp
    from .routes.doctor_profile import doctor_profile_bp
    from .routes.doctor_settings_routes import doctor_settings_bp
    from .routes.prescription_routes import prescriptions_bp

    app.register_blueprint(doctor_bp, url_prefix="/api/doctor")
    app.register_blueprint(doctor_bp, url_prefix="/doctor", name="doctor_legacy")
    app.register_blueprint(doctor_profile_bp, url_prefix="/api/doctor/profile")
    app.register_blueprint(doctor_profile_bp, url_prefix="/doctor/profile", name="doctor_profile_legacy")
    app.register_blueprint(doctor_settings_bp, url_prefix="/api/doctor/settings")
    app.register_blueprint(doctor_settings_bp, url_prefix="/doctor/settings", name="doctor_settings_legacy")
    app.register_blueprint(prescriptions_bp, url_prefix="/api/doctor/prescriptions")
    app.register_blueprint(prescriptions_bp, url_prefix="/prescriptions", name="prescriptions_legacy")
