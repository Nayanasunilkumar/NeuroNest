from flask import Blueprint, request, jsonify
from database.models import db, User, PatientProfile
from utils.security import hash_password, verify_password
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


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
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if not verify_password(password, user.password_hash):
        return jsonify({"message": "Invalid email or password"}), 401

    # ✅ CRITICAL FIX: identity MUST be string
    token = create_access_token(
        identity=str(user.id),   # 🔥 THIS FIXES "Subject must be a string"
        additional_claims={
            "role": user.role
        }
    )

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
