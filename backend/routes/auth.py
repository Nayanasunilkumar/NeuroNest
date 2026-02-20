import os
from flask import Blueprint, request, jsonify
from database.models import db, User, PatientProfile, DoctorProfile, SecurityActivity
from utils.security import hash_password, verify_password
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

def log_security_event(user_id, event_type, description):
    try:
        activity = SecurityActivity(
            user_id=user_id,
            event_type=event_type,
            description=description,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(activity)
        db.session.commit()
    except Exception as e:
        print(f"Error logging security event: {e}")
        db.session.rollback()


def _maybe_bootstrap_doctor_for_dev(email: str):
    """
    Dev-only fallback:
    If enabled, auto-creates the default doctor account when missing.
    """
    allow_bootstrap = os.getenv("ALLOW_DEV_DOCTOR_BOOTSTRAP", "false").lower() == "true"
    default_email = os.getenv("DEFAULT_DOCTOR_EMAIL", "doctor@neuronest.com").strip().lower()
    default_password = os.getenv("DEFAULT_DOCTOR_PASSWORD", "123456")

    if not allow_bootstrap:
        return None
    if email.strip().lower() != default_email:
        return None

    existing = User.query.filter_by(email=default_email).first()
    if existing:
        return existing

    doctor_user = User(
        email=default_email,
        password_hash=hash_password(default_password),
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

    email = data.get("email")
    password = data.get("password")
    requested_role = data.get("role", "patient")
    full_name = data.get("full_name")

    if not email or not password or not full_name:
        return jsonify({"message": "Full name, email and password required"}), 400

    # Public registration is patient-only; doctor accounts must be provisioned by admins/scripts.
    role = "patient"
    if requested_role and requested_role != "patient":
        return jsonify({"message": "Only patient self-registration is allowed"}), 403

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 409

    user = User(
        email=email,
        password_hash=hash_password(password),
        role=role,
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

    if not verify_password(password, user.password_hash):
        log_security_event(user.id, "login_failed", "Failed login attempt detected")
        return jsonify({"message": "Invalid email or password"}), 401

    # ✅ CRITICAL FIX: identity MUST be string
    token = create_access_token(
        identity=str(user.id),   # 🔥 THIS FIXES "Subject must be a string"
        additional_claims={
            "role": user.role
        }
    )

    log_security_event(user.id, "login_success", f"New login from {request.headers.get('User-Agent', 'Unknown Device')}")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        }
    }), 200
