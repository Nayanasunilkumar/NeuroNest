from extensions.socket import socketio
from modules.registry import register_feature_modules as register_backend_feature_modules


def register_feature_modules(app):
    register_backend_feature_modules(app)


def register_socket_handlers():
    from modules.chat import register_socket_handlers as register_chat_socket_handlers
    from sockets.video_socket import register_video_events

    register_chat_socket_handlers()

    # Importing the module registers its event handlers.
    import routes.vitals_socket_events  # noqa: F401

    register_video_events(socketio)
