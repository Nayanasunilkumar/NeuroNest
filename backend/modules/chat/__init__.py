from .routes import chat_bp


def register(app):
    app.register_blueprint(chat_bp, url_prefix="/api/chat")


def register_socket_handlers():
    import modules.chat.socket_events  # noqa: F401
