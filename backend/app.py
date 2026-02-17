from pathlib import Path

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Always load backend/.env regardless of run directory.
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

from config.config import Config
from database.models import db
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.appointments import appointments_bp
from routes.medical_records import medical_records_bp
from routes.prescription_routes import prescriptions_bp
from routes.doctor_profile import doctor_profile_bp


from extensions.socket import socketio

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ================= Extensions =================
    CORS(app)
    db.init_app(app)
    jwt = JWTManager(app)
    socketio.init_app(app)

    # ================= Blueprints =================
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(profile_bp, url_prefix="/profile")
    app.register_blueprint(appointments_bp, url_prefix="/appointments")
    app.register_blueprint(medical_records_bp)
    app.register_blueprint(prescriptions_bp, url_prefix="/prescriptions")
    
    # New Doctor Profile Route
    app.register_blueprint(doctor_profile_bp, url_prefix="/api/doctor/profile")
    
    from modules.chat.routes import chat_bp
    app.register_blueprint(chat_bp, url_prefix="/api/chat")

    from routes.doctor import doctor_bp
    app.register_blueprint(doctor_bp, url_prefix="/doctor")

    # Import socket events to register handlers
    import modules.chat.socket_events

    # ================= Home Route =================
    @app.route("/")
    def home():
        return {"status": "Backend running"}

    # ================= Serve Uploaded Images =================
    @app.route("/uploads/<filename>")
    def uploaded_file(filename):
        return send_from_directory("uploads", filename)

    return app


app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True)
