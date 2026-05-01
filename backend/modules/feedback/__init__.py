from .routes import feedback_bp


def register(app):
    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
