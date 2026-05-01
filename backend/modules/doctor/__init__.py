from routes.doctor import doctor_bp


def register(app):
    app.register_blueprint(doctor_bp, url_prefix="/doctor")
