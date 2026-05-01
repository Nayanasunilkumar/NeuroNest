from routes.rtc import rtc_bp


def register(app):
    app.register_blueprint(rtc_bp, url_prefix="/api/rtc")
