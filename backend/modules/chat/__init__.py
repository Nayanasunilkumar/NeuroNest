def register(app):
    return None


def register_socket_handlers():
    import modules.chat.socket_events  # noqa: F401
