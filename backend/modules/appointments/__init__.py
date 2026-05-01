from routes.appointments import appointments_bp


def register(app):
    app.register_blueprint(appointments_bp, url_prefix="/appointments")
