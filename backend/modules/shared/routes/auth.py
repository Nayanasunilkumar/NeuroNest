import os
from flask import Blueprint, current_app, jsonify, request
from database.models import db, User, PatientProfile, DoctorProfile, SecurityActivity
from utils.security import hash_password, verify_password
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required

from extensions.socket import socketio
from modules.shared.services.notification_service import NotificationService

auth_bp = Blueprint("auth", __name__)


def _require_diagnostic_access():
    if not current_app.config.get("ENABLE_DIAGNOSTIC_ROUTES", False):
        return jsonify({"message": "Not found"}), 404

    role = (get_jwt().get("role") or "").strip().lower()
    if role not in ("admin", "super_admin"):
        return jsonify({"message": "Admin access required"}), 403

    return None


@auth_bp.route("/test-email")
@jwt_required()
def test_email_v1():
    access_error = _require_diagnostic_access()
    if access_error:
        return access_error

    version = "V_REQUESTS_2026"  # marker
    try:
        import requests as req_lib
        resend_api_key = os.getenv("RESEND_API_KEY")

        if not resend_api_key:
            return jsonify({"status": "error", "reason": "RESEND_API_KEY missing"}), 500

        resp = req_lib.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
                "User-Agent": "python-httpx/0.23.0",
                "Accept": "application/json",
            },
            json={
                "from": "NeuroNest <onboarding@resend.dev>",
                "to": ["neuronest4@gmail.com"],
                "subject": "NeuroNest Test",
                "text": "Email system working!",
            },
            timeout=15
        )
        if resp.status_code == 200:
            data = resp.json()
            return jsonify({"status": "SUCCESS", "id": data.get("id"), "version": version}), 200
        current_app.logger.warning("Diagnostic resend test failed with status %s", resp.status_code)
        return jsonify({"status": "error", "version": version}), 500
    except Exception as error:
        current_app.logger.exception("Diagnostic resend test failed")
        return jsonify({"status": "error", "version": version, "type": type(error).__name__}), 500

@auth_bp.route("/debug/test-email", methods=["GET"])
@jwt_required()
def test_email_diagnostics():
    access_error = _require_diagnostic_access()
    if access_error:
        return access_error

    target = request.args.get("email")
    if not target:
        return jsonify({"error": "email param required"}), 400

    current_app.logger.info("Running manual diagnostic email test for admin user %s", get_jwt_identity())
    try:
        success = NotificationService.send_email(target, "NeuroNest Test Email", "This is a diagnostic test of the notification system.")
        return jsonify({"success": success}), 200
    except Exception:
        current_app.logger.exception("Manual diagnostic email test failed for %s", target)
        return jsonify({"success": False}), 500

def parse_user_agent(ua_string):
    if not ua_string: return "Unknown Device"
    ua_string = ua_string.lower()
    
    # Simple OS detection
    os_name = "Unknown OS"
    if "macintosh" in ua_string or "mac os" in ua_string: os_name = "MacOS"
    elif "windows" in ua_string: os_name = "Windows"
    elif "android" in ua_string: os_name = "Android"
    elif "iphone" in ua_string or "ipad" in ua_string: os_name = "iOS"
    elif "linux" in ua_string: os_name = "Linux"

    # Simple Browser detection
    browser = "Browser"
    if "chrome" in ua_string and "edg" not in ua_string: browser = "Chrome"
    elif "safari" in ua_string and "chrome" not in ua_string: browser = "Safari"
    elif "firefox" in ua_string: browser = "Firefox"
    elif "edg" in ua_string: browser = "Edge"
    elif "opera" in ua_string or "opr" in ua_string: browser = "Opera"
    
    return f"{browser} on {os_name}"

def log_security_event(user_id, event_type, description, commit=True):
    ua = request.headers.get('User-Agent', '')
    try:
        activity = SecurityActivity(
            user_id=user_id,
            event_type=event_type,
            description=description,
            ip_address=request.remote_addr,
            user_agent=ua
        )
        db.session.add(activity)
        if commit:
            db.session.commit()
            
        # 🛡️ Admin Security Alert for specific high-risk events
        if event_type in ["login_failed", "unauthorized_access", "password_reset_requested"]:
            from modules.shared.services.notification_service import NotificationService
            NotificationService.send_admin_notification(
                title="Security Anomaly Detected",
                message=f"A security event of type '{event_type.replace('_', ' ')}' was recorded for User ID {user_id}. Source IP: {request.remote_addr}.",
                notif_type="system",
                severity="warning",
                payload={"user_id": user_id, "event_type": event_type, "ip": request.remote_addr}
            )
    except Exception:
        current_app.logger.exception("Error logging security event for user %s", user_id)
        db.session.rollback()


def _maybe_bootstrap_doctor_for_dev(email: str):
    """
    Dev-only fallback:
    If enabled, auto-creates the default doctor account when missing.
    """
    if not current_app.config.get("ALLOW_DEV_DOCTOR_BOOTSTRAP", False):
        return None

    default_doctor_email = (current_app.config.get("DEFAULT_DOCTOR_EMAIL") or "").strip().lower()
    default_doctor_password = current_app.config.get("DEFAULT_DOCTOR_PASSWORD") or ""

    if not default_doctor_email or not default_doctor_password:
        current_app.logger.warning("Doctor bootstrap is enabled but default credentials are not fully configured")
        return None

    email_clean = email.strip().lower()
    if email_clean != default_doctor_email:
        return None

    # Redundant query avoided: if we are here, 'User.query.filter_by(email=email).first()' 
    # already returned None in the main login flow for this specific email.

    doctor_user = User(
        email=default_doctor_email,
        password_hash=hash_password(default_doctor_password),
        role="doctor",
        full_name="Dr. Nayana",
    )
    db.session.add(doctor_user)
    db.session.flush()

    profile = DoctorProfile(
        user_id=doctor_user.id,
        specialization="Neurologist",
        qualification="MBBS, MD (Neurology)",
        experience_years=10,
    )
    db.session.add(profile)
    db.session.commit()
    return doctor_user


# --------------------------------------------------
# REGISTER API
# --------------------------------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    requested_role = data.get("role", "patient")
    full_name = data.get("full_name")

    if not email or not password or not full_name:
        return jsonify({"message": "Full name, email and password required"}), 400

    if requested_role and requested_role != "patient":
        return jsonify({"message": "Only patient self-registration is allowed"}), 403

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 409

    user = User(
        email=email,
        password_hash=hash_password(password),
        role="patient",
        full_name=full_name
    )

    db.session.add(user)
    db.session.flush() # Ensure ID is generated

    # Auto-create patient profile for self-registered users
    patient_profile = PatientProfile(user_id=user.id, full_name=full_name)
    db.session.add(patient_profile)
    
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        }
    }), 201


# --------------------------------------------------
# LOGIN API
# --------------------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}

        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            user = _maybe_bootstrap_doctor_for_dev(email)

        if not user:
            return jsonify({"message": "Invalid email or password"}), 401

        if user.is_deleted:
            return jsonify({"message": "Account deleted. Contact support."}), 403
        if user.account_status == "deactivated":
            return jsonify({"message": "Account deactivated."}), 403
        if user.account_status == "suspended":
            return jsonify({"message": "Account suspended. Please contact administration."}), 403

        is_verified = verify_password(password, user.password_hash)

        if not is_verified:
            log_security_event(user.id, "login_failed", "Failed login attempt detected")
            return jsonify({"message": "Invalid email or password"}), 401

        # ✅ CRITICAL FIX: identity MUST be string
        token = create_access_token(
            identity=str(user.id),   # 🔥 THIS FIXES "Subject must be a string"
            additional_claims={
                "role": user.role
            }
        )

        ua = request.headers.get('User-Agent', '')
        device_info = parse_user_agent(ua)
        log_security_event(user.id, "login_success", f"New login from {device_info}", commit=False)
        db.session.commit()

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "full_name": user.full_name,
                "must_change_password": bool(getattr(user, "must_change_password", False))
            }
        }), 200
    except Exception:
        current_app.logger.exception("Login crash")
        return jsonify({"message": "Login failed due to a server error"}), 500


# --------------------------------------------------
# FORGOT PASSWORD API
# --------------------------------------------------
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"message": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Security best practice: don't reveal if user exists
        return jsonify({"message": "If an account exists with this email, you will receive reset instructions."}), 200

    # Simulate token generation
    import secrets
    reset_token = secrets.token_urlsafe(32)
    current_app.logger.info(f"Password reset requested for {email}. Mock Token: {reset_token}")
    
    try:
        # Note: In production, the URL should point to the frontend reset page
        reset_url = f"https://neuro-nest-two.vercel.app/reset-password?token={reset_token}&email={email}"
        NotificationService.send_email(
            email, 
            "Reset Your NeuroNest Password",
            f"Hello {user.full_name},\n\nYou requested a password reset. Please click the link below to set a new password:\n\n{reset_url}\n\nIf you did not request this, please ignore this email."
        )
    except Exception:
        current_app.logger.exception("Failed to send reset email")

    return jsonify({"message": "If an account exists with this email, you will receive reset instructions."}), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    email = data.get("email")
    new_password = data.get("password")

    if not token or not new_password or not email:
        return jsonify({"message": "Email, Token and new password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Invalid request"}), 400

    user.password_hash = hash_password(new_password)
    user.must_change_password = False
    db.session.commit()

    log_security_event(user.id, "password_reset_success", "User successfully reset their password")
    
    return jsonify({"message": "Password reset successfully. You can now log in."}), 200
