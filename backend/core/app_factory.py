from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt_identity

from core.cors import build_cors_origins
from core.env import load_environment
from core.migrations import run_startup_migrations
from core.module_loader import register_feature_modules, register_socket_handlers
from core.routes import register_core_routes
from core.scheduler import start_scheduler

load_environment()

from config.config import Config
from database.models import db, User
from extensions.socket import socketio


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        origins=build_cors_origins(),
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
    )

    db.init_app(app)
    JWTManager(app)
    socketio.init_app(app)

    with app.app_context():
        db.create_all()
        run_startup_migrations()

    register_feature_modules(app)
    register_socket_handlers()
    register_core_routes(app)
    start_scheduler(app)

    @app.before_request
    def enforce_account_status():
        if request.method == "OPTIONS":
            return
            
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                verify_jwt_in_request(optional=True)
                user_id = get_jwt_identity()
                if user_id:
                    user = User.query.get(user_id)
                    if not user:
                        return jsonify({"message": "User not found. Please log in again."}), 401
                    if getattr(user, "is_deleted", False):
                        return jsonify({"message": "Account deleted. Contact support."}), 403
                    if getattr(user, "account_status", "") == "deactivated":
                        return jsonify({"message": "Account deactivated."}), 403
                    if getattr(user, "account_status", "") == "suspended":
                        return jsonify({"message": "Account suspended. Please contact administration."}), 403
            except Exception:
                pass

    return app
