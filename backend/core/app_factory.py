import threading
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


_init_lock = threading.Lock()
_init_started = False

def _background_init(app_instance):
    with app_instance.app_context():
        try:
            print("[BOOT] Starting background initialization...")
            from core.migrations import run_startup_migrations
            from core.scheduler import start_scheduler
            db.create_all()
            run_startup_migrations()
            start_scheduler(app_instance)
            print("[BOOT] ✓ Background initialization complete.")
        except Exception as e:
            print(f"[BOOT] ❌ Background initialization error: {e}")

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(Config)
    app.logger.info(
        "[VITALS_CONFIG] env loaded VITALS_DEVICE_PATIENT_ID=%s "
        "VITALS_DEVICE_PATIENT_EMAIL=%s VITALS_REQUIRE_DEVICE_AUTH=%s "
        "VITALS_DEVICE_TOKEN_PRESENT=%s",
        app.config.get("VITALS_DEVICE_PATIENT_ID"),
        app.config.get("VITALS_DEVICE_PATIENT_EMAIL"),
        app.config.get("VITALS_REQUIRE_DEVICE_AUTH"),
        bool(app.config.get("VITALS_DEVICE_TOKEN")),
    )

    CORS(
        app,
        origins=build_cors_origins(),
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
    )

    db.init_app(app)
    JWTManager(app)
    socketio.init_app(app)
    app.logger.info("[VITALS_CONFIG] SocketIO initialized id=%s async_mode=%s", id(socketio), socketio.async_mode)

    register_feature_modules(app)
    register_socket_handlers()
    app.logger.info("[VITALS_CONFIG] Feature modules and socket handlers registered")
    register_core_routes(app)
    
    @app.before_request
    def trigger_lazy_init():
        global _init_started
        if not _init_started:
            with _init_lock:
                if not _init_started:
                    _init_started = True
                    threading.Thread(target=_background_init, args=(app,)).start()

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
            except Exception as e:
                # Log but don't crash the request
                app.logger.warning(f"Account status check failed: {e}")
                pass

    @app.route("/api/debug/error-log")
    def get_error_log():
        log_content = "Log Start\n"
        try:
            with open("/tmp/flask_error.log", "r") as f:
                log_content += f.read()
        except Exception as e:
            log_content += f"Error reading log: {str(e)}\n"
        
        try:
            from models.chat_models import Participant
            log_content += f"Import Participant: OK (Table: {Participant.__tablename__})\n"
        except Exception as e:
            log_content += f"Import Participant: FAILED - {str(e)}\n"

        return log_content, 200, {'Content-Type': 'text/plain'}

    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        import sys
        from datetime import datetime
        tb = traceback.format_exc()
        msg = f"\n\n--- ERROR {datetime.now()} ---\n{tb}\n"
        print(msg, file=sys.stderr)
        try:
            with open("/tmp/flask_error.log", "a") as f:
                f.write(msg)
        except:
            pass
        return jsonify({"error": str(e), "traceback": tb}), 500

    return app
