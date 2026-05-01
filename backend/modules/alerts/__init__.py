from routes.alerts_route import alerts_bp


def register(app):
    app.register_blueprint(alerts_bp)
