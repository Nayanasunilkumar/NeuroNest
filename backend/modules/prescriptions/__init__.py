from routes.prescription_routes import prescriptions_bp


def register(app):
    app.register_blueprint(prescriptions_bp, url_prefix="/prescriptions")
