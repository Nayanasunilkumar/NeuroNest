from routes.doctor_profile import doctor_profile_bp


def register(app):
    app.register_blueprint(doctor_profile_bp, url_prefix="/api/doctor/profile")
