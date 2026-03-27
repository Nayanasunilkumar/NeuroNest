from pathlib import Path
import os
import sys

# Standard synchronous mode for guaranteed deployment stability on Render.

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Always load backend/.env regardless of run directory, overriding inherited.
BASE_DIR = Path(__file__).resolve().parent
# Prioritize system environment variables (like Render's DATABASE_URL) over .env file.
load_dotenv(BASE_DIR / ".env", override=False)

from config.config import Config
from database.models import db, ClinicalPin
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.appointments import appointments_bp
from routes.medical_records import medical_records_bp
from routes.prescription_routes import prescriptions_bp
from routes.doctor_profile import doctor_profile_bp
from routes.patient_settings_routes import patient_settings_bp
from routes.announcements import announcements_bp
from routes.patient_medical_records import patient_medical_bp
from routes.modules_config import modules_config_bp
from routes.vitals_route import vitals_bp
from routes.system_config_routes import system_config_bp

from extensions.socket import socketio
from routes.vitals_socket_events import *
from routes.alerts_route import alerts_bp
from routes.calls_route import calls_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ========== CORS ========== 
    # In production, set CORS_ORIGINS to your Vercel frontend URL (comma-separated)
    # e.g. CORS_ORIGINS=https://neuronest.vercel.app
    import re
    _raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    _allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    # Dynamically allow all Vercel preview deployments
    _allowed_origins.append(re.compile(r"^https://.*\.vercel\.app$"))
    
    CORS(app, origins=_allowed_origins, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
    db.init_app(app)
    jwt = JWTManager(app)
    socketio.init_app(app)

    with app.app_context():
        db.create_all()
        # ── Safe column migrations — DDL must run in AUTOCOMMIT mode ──
        try:
            with db.engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
                conn.execute(db.text(
                    "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "
                    "consultation_type VARCHAR(20) DEFAULT 'in_person', "
                    "ADD COLUMN IF NOT EXISTS rescheduled_by VARCHAR(20), "
                    "ADD COLUMN IF NOT EXISTS old_date_time TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS new_date_time TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS reschedule_reason TEXT, "
                    "ADD COLUMN IF NOT EXISTS reschedule_status VARCHAR(20), "
                    "ADD COLUMN IF NOT EXISTS join_enabled_patient_time TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS join_enabled_doctor_time TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS doctor_joined_at TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS patient_joined_at TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS call_started_at TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS call_status VARCHAR(20) DEFAULT 'scheduled', "
                    "ADD COLUMN IF NOT EXISTS reminder_30_sent_at TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS reminder_10_sent_at TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS popup_shown_at TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS missed_notified_at TIMESTAMP, "
                    "ADD COLUMN IF NOT EXISTS video_room_id VARCHAR(100)"
                ))
                # --- Notification Preferences Missing Columns ---
                conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_alerts BOOLEAN DEFAULT TRUE"))
                conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS inapp_alerts BOOLEAN DEFAULT TRUE"))
                conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS inapp_messages BOOLEAN DEFAULT TRUE"))
                conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS inapp_announcements BOOLEAN DEFAULT TRUE"))
                # --- Doctor Preferences Missing Columns ---
                conn.execute(db.text("ALTER TABLE doctor_notification_settings ADD COLUMN IF NOT EXISTS email_on_alerts BOOLEAN DEFAULT TRUE"))
                # --- Auth Security Missing Columns ---
                conn.execute(db.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE"))
                
                # --- Governance & Oversight (Reviews) ---
                for col, d_type in [("status", "VARCHAR(20) DEFAULT 'Pending'"), ("escalation_severity", "VARCHAR(50)"), ("audit_category", "VARCHAR(50)"), ("admin_note", "TEXT"), ("escalated_at", "TIMESTAMP")]:
                    try:
                        conn.execute(db.text(f"ALTER TABLE reviews ADD COLUMN IF NOT EXISTS {col} {d_type}"))
                    except Exception as col_err:
                        print(f"[MIGRATION] Reviews.{col} failed: {col_err}")

                # --- Governance & Oversight (Escalations) ---
                for col, d_type in [("severity_level", "VARCHAR(20) DEFAULT 'Standard'"), ("category", "VARCHAR(50) DEFAULT 'Quality of Care'"), ("resolved_at", "TIMESTAMP")]:
                    try:
                        conn.execute(db.text(f"ALTER TABLE review_escalations ADD COLUMN IF NOT EXISTS {col} {d_type}"))
                    except Exception as col_err:
                        print(f"[MIGRATION] ReviewEscalations.{col} failed: {col_err}")

                # --- Governance & Oversight (Logs) ---
                for col, d_type in [("doctor_id", "INTEGER"), ("patient_id", "INTEGER")]:
                    try:
                        conn.execute(db.text(f"ALTER TABLE review_moderation_logs ADD COLUMN IF NOT EXISTS {col} {d_type}"))
                    except Exception as col_err:
                        print(f"[MIGRATION] ModerationLogs.{col} failed: {col_err}")
                
            print("[MIGRATION] ✓ Governance synchronization cycle complete")
        except Exception as e:
            print(f"[MIGRATION] Warning: {e}")

    # ================= Blueprints =================
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(profile_bp, url_prefix="/profile")
    app.register_blueprint(appointments_bp, url_prefix="/appointments")
    app.register_blueprint(medical_records_bp)
    app.register_blueprint(patient_medical_bp)
    app.register_blueprint(prescriptions_bp, url_prefix="/prescriptions")
    app.register_blueprint(announcements_bp, url_prefix="/api/announcements")
    app.register_blueprint(modules_config_bp, url_prefix="/api/modules")
    app.register_blueprint(vitals_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(calls_bp)
    
    # New Doctor Profile Route
    app.register_blueprint(doctor_profile_bp, url_prefix="/api/doctor/profile")
    
    # Admin Management Routes
    from routes.admin.manage_patients_routes import admin_patients_bp
    app.register_blueprint(admin_patients_bp, url_prefix="/api/admin/patients")

    from routes.admin.manage_doctors_routes import admin_doctors_bp
    app.register_blueprint(admin_doctors_bp, url_prefix="/api/admin/doctors")
    
    from routes.admin.manage_appointments_routes import admin_appointments_bp
    app.register_blueprint(admin_appointments_bp, url_prefix="/api/admin/appointments")
    
    from modules.chat.routes import chat_bp
    app.register_blueprint(chat_bp, url_prefix="/api/chat")

    from routes.doctor import doctor_bp
    app.register_blueprint(doctor_bp, url_prefix="/doctor")

    from modules.feedback.routes import feedback_bp
    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
    app.register_blueprint(patient_settings_bp, url_prefix="/api/patient/settings")

    from routes.doctor_settings_routes import doctor_settings_bp
    app.register_blueprint(doctor_settings_bp, url_prefix="/api/doctor/settings")

    from routes.admin.reports_routes import admin_reports_bp
    app.register_blueprint(admin_reports_bp, url_prefix="/api/admin/reports")

    from routes.admin.settings_routes import admin_settings_bp
    app.register_blueprint(admin_settings_bp, url_prefix="/api/admin/settings")
    app.register_blueprint(system_config_bp, url_prefix="/api/system-config")

    from routes.admin.dashboard_routes import admin_dashboard_bp
    app.register_blueprint(admin_dashboard_bp, url_prefix="/api/admin/dashboard")
    
    from routes.admin.announcement_routes import admin_announcements_bp
    app.register_blueprint(admin_announcements_bp, url_prefix="/api/admin/announcements")
    
    from routes.admin.governance_routes import governance_bp
    app.register_blueprint(governance_bp, url_prefix="/api/admin/governance")

    from routes.rtc import rtc_bp
    app.register_blueprint(rtc_bp, url_prefix="/api/rtc")

    # Import socket events to register handlers
    import modules.chat.socket_events
    import routes.vitals_socket_events
    
    from sockets.video_socket import register_video_events
    register_video_events(socketio)

    # ================= Home Route =================
    @app.route("/")
    def home():
        return {"status": "NeuroNest-V17-STABLE-LIVE"}
    
    @app.after_request
    def add_ngrok_header(response):
        response.headers['ngrok-skip-browser-warning'] = 'true'
        return response

    from apscheduler.schedulers.background import BackgroundScheduler
    from services.scheduler_service import check_upcoming_consultations
    
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=check_upcoming_consultations, trigger="interval", minutes=1, args=[app])
    scheduler.start()

    return app

app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
