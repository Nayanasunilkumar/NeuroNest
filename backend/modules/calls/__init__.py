from routes.calls_route import calls_bp


def register(app):
    app.register_blueprint(calls_bp)
