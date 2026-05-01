def register_core_routes(app):
    @app.route("/")
    def home():
        return {"status": "NeuroNest-V17-STABLE-LIVE"}

    @app.after_request
    def add_ngrok_header(response):
        response.headers["ngrok-skip-browser-warning"] = "true"
        return response
