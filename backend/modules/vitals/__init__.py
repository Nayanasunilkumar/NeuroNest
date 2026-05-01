from routes.vitals_route import vitals_bp


def register(app):
    app.register_blueprint(vitals_bp)
