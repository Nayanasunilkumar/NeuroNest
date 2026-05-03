import os


def register_core_routes(app):
    @app.route("/")
    def home():
        return {
            "status": "NeuroNest-V17-STABLE-LIVE",
            "commit": os.getenv("RENDER_GIT_COMMIT") or os.getenv("GIT_COMMIT") or "local",
            "feedback_routes_registered": any(
                str(rule).startswith("/api/feedback") for rule in app.url_map.iter_rules()
            ),
        }

    @app.after_request
    def add_ngrok_header(response):
        response.headers["ngrok-skip-browser-warning"] = "true"
        return response
