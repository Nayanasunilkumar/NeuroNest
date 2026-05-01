from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from core.cors import build_cors_origins
from core.env import load_environment
from core.migrations import run_startup_migrations
from core.module_loader import register_feature_modules, register_socket_handlers
from core.routes import register_core_routes
from core.scheduler import start_scheduler

load_environment()

from config.config import Config
from database.models import db
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

    return app
