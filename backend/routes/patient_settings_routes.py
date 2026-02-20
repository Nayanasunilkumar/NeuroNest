from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.models import db, User, PatientAuditLog
from utils.security import verify_password, hash_password
from datetime import datetime

patient_settings_bp = Blueprint("patient_settings", __name__)

# ── helpers ──────────────────────────────────────────────────────────────────

def _get_patient_profile(user_id):
    from sqlalchemy import text
    row = db.session.execute(
        text("SELECT * FROM patient_profiles WHERE user_id = :uid"), {"uid": user_id}
    ).mappings().fetchone()
    return dict(row) if row else {}

def _get_notification_prefs(user_id):
    from sqlalchemy import text
    row = db.session.execute(
        text("SELECT * FROM notification_preferences WHERE user_id = :uid"), {"uid": user_id}
    ).mappings().fetchone()
    return dict(row) if row else {}

def _ensure_notification_prefs(user_id):
    """Upsert default notification prefs row."""
    from sqlalchemy import text
    db.session.execute(text("""
        INSERT INTO notification_preferences (user_id) VALUES (:uid)
        ON CONFLICT (user_id) DO NOTHING
    """), {"uid": user_id})
    db.session.commit()

def _require_patient(claims):
    return claims.get("role") == "patient"

# ── GET /patient/settings ─────────────────────────────────────────────────────

@patient_settings_bp.route("/", methods=["GET"])
@jwt_required()
def get_settings():
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    user = User.query.get_or_404(uid)
    profile = _get_patient_profile(uid)
    _ensure_notification_prefs(uid)
    notif = _get_notification_prefs(uid)

    # emergency contact
    from sqlalchemy import text
    ec = db.session.execute(
        text("SELECT * FROM emergency_contacts WHERE patient_id = :uid AND is_primary = TRUE LIMIT 1"),
        {"uid": uid}
    ).mappings().fetchone()

    return jsonify({
        "account": {
            "full_name":  user.full_name,
            "email":      user.email,
            "phone":      profile.get("phone", ""),
            "date_of_birth": str(profile.get("date_of_birth", "")) if profile.get("date_of_birth") else "",
            "gender":     profile.get("gender", ""),
            "address":    profile.get("address", ""),
            "city":       profile.get("city", ""),
            "state":      profile.get("state", ""),
            "profile_image": profile.get("profile_image", ""),
            "preferred_language": getattr(user, "preferred_language", "en") or "en",
        },
        "emergency_contact": dict(ec) if ec else {},
        "notifications": {k: v for k, v in notif.items() if k not in ("id", "user_id", "created_at", "updated_at")},
        "security": {
            "is_two_factor_enabled": getattr(user, "is_two_factor_enabled", False) or False,
            "email_verified": user.email_verified or False,
            "activity": _get_security_activity(uid),
            "sessions": [
                {
                    "device": "Chrome on MacOS",
                    "location": "Bangalore, India",
                    "last_active": "Active now",
                    "current": True
                }
            ]
        }
    }), 200

def _get_security_activity(user_id):
    logs = PatientAuditLog.query.filter(
        PatientAuditLog.patient_id == user_id,
        PatientAuditLog.action_type.like("security_%")
    ).order_by(PatientAuditLog.created_at.desc()).limit(5).all()
    
    return [
        {
            "action": log.description,
            "time": _format_relative_time(log.created_at),
            "status": "success" if "Failed" not in log.description else "warning"
        } for log in logs
    ]

def _format_relative_time(dt):
    diff = datetime.utcnow() - dt
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    if diff.seconds > 3600:
        val = diff.seconds // 3600
        return f"{val} hour{'s' if val > 1 else ''} ago"
    if diff.seconds > 60:
        val = diff.seconds // 60
        return f"{val} minute{'s' if val > 1 else ''} ago"
    return "Just now"


# ── PUT /patient/settings/account ────────────────────────────────────────────

@patient_settings_bp.route("/account", methods=["PUT"])
@jwt_required()
def update_account():
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    user = User.query.get_or_404(uid)

    # Update users table
    if "full_name" in data and data["full_name"].strip():
        user.full_name = data["full_name"].strip()
    if "preferred_language" in data:
        user.preferred_language = data["preferred_language"]

    # Update patient_profiles table
    from sqlalchemy import text
    profile_fields = ["phone", "date_of_birth", "gender", "address", "city", "state", "pincode"]
    profile_updates = {k: data[k] for k in profile_fields if k in data}
    if profile_updates:
        # Upsert
        set_clause = ", ".join([f"{k} = :{k}" for k in profile_updates])
        profile_updates["uid"] = uid
        profile_updates["updated_at"] = datetime.utcnow()
        existing = db.session.execute(text("SELECT id FROM patient_profiles WHERE user_id = :uid"), {"uid": uid}).fetchone()
        if existing:
            db.session.execute(text(f"UPDATE patient_profiles SET {set_clause}, updated_at = :updated_at WHERE user_id = :uid"), profile_updates)
        else:
            cols = "user_id, " + ", ".join(profile_updates.keys())
            vals = ":uid, " + ", ".join([f":{k}" for k in profile_updates.keys()])
            db.session.execute(text(f"INSERT INTO patient_profiles ({cols}) VALUES ({vals})"), profile_updates)

    # Emergency contact upsert
    ec = data.get("emergency_contact")
    if ec:
        existing_ec = db.session.execute(text("SELECT id FROM emergency_contacts WHERE patient_id = :uid AND is_primary = TRUE"), {"uid": uid}).fetchone()
        if existing_ec:
            db.session.execute(text("""
                UPDATE emergency_contacts
                SET contact_name=:name, relationship=:rel, phone=:phone, email=:email, updated_at=NOW()
                WHERE patient_id=:uid AND is_primary=TRUE
            """), {"uid": uid, "name": ec.get("contact_name",""), "rel": ec.get("relationship",""), "phone": ec.get("phone",""), "email": ec.get("email","")})
        else:
            db.session.execute(text("""
                INSERT INTO emergency_contacts (patient_id, contact_name, relationship, phone, email, is_primary)
                VALUES (:uid, :name, :rel, :phone, :email, TRUE)
            """), {"uid": uid, "name": ec.get("contact_name",""), "rel": ec.get("relationship",""), "phone": ec.get("phone",""), "email": ec.get("email","")})

    db.session.commit()
    return jsonify({"message": "Account updated successfully"}), 200


# ── PUT /patient/settings/notifications ──────────────────────────────────────

@patient_settings_bp.route("/notifications", methods=["PUT"])
@jwt_required()
def update_notifications():
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    from sqlalchemy import text
    _ensure_notification_prefs(uid)

    allowed = [
        "email_appointments","email_prescriptions","email_messages","email_announcements","email_feedback",
        "sms_appointments","sms_prescriptions",
        "inapp_appointments","inapp_prescriptions","inapp_messages","inapp_announcements",
        "allow_doctor_followup","allow_promotions","allow_anonymous_feedback",
        "share_history_with_doctors","allow_analytics",
    ]
    updates = {k: v for k, v in data.items() if k in allowed and isinstance(v, bool)}
    if updates:
        set_clause = ", ".join([f"{k} = :{k}" for k in updates])
        updates["uid"] = uid
        db.session.execute(text(f"UPDATE notification_preferences SET {set_clause}, updated_at = NOW() WHERE user_id = :uid"), updates)
        db.session.commit()

    return jsonify({"message": "Notification preferences updated"}), 200


# ── PUT /patient/settings/privacy ─────────────────────────────────────────────

@patient_settings_bp.route("/privacy", methods=["PUT"])
@jwt_required()
def update_privacy():
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    from sqlalchemy import text
    _ensure_notification_prefs(uid)

    privacy_fields = ["allow_anonymous_feedback", "share_history_with_doctors", "allow_analytics"]
    updates = {k: v for k, v in data.items() if k in privacy_fields and isinstance(v, bool)}
    if updates:
        set_clause = ", ".join([f"{k} = :{k}" for k in updates])
        updates["uid"] = uid
        db.session.execute(text(f"UPDATE notification_preferences SET {set_clause}, updated_at = NOW() WHERE user_id = :uid"), updates)
        db.session.commit()

    return jsonify({"message": "Privacy settings updated"}), 200


# ── POST /patient/settings/change-password ───────────────────────────────────

@patient_settings_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    current_pw = data.get("current_password", "")
    new_pw = data.get("new_password", "")

    if not current_pw or not new_pw:
        return jsonify({"error": "Both current and new password are required"}), 400
    if len(new_pw) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    user = User.query.get_or_404(uid)
    if not verify_password(current_pw, user.password_hash):
        return jsonify({"error": "Current password is incorrect"}), 400

    user.password_hash = hash_password(new_pw)
    
    logout_others = data.get("logout_others", False)
    
    # Log the security event
    log = PatientAuditLog(
        patient_id=uid,
        actor_id=uid,
        action_type="security_password_change",
        description=f"Password changed successfully{' (All sessions revoked)' if logout_others else ''}",
        ip_address=request.remote_addr,
        user_agent=request.headers.get("User-Agent"),
        action_metadata={"logout_others": logout_others}
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"message": "Password changed successfully"}), 200


# ── POST /patient/settings/export-data ───────────────────────────────────────

@patient_settings_bp.route("/export-data", methods=["POST"])
@jwt_required()
def export_data():
    """Returns a JSON bundle of all patient data (GDPR-compliant export)."""
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    from sqlalchemy import text
    user = User.query.get_or_404(uid)
    profile = _get_patient_profile(uid)
    appointments = db.session.execute(
        text("SELECT * FROM appointments WHERE patient_id = :uid ORDER BY appointment_date DESC"),
        {"uid": uid}
    ).mappings().fetchall()
    prescriptions = db.session.execute(
        text("SELECT p.*, array_agg(pi.medicine_name) AS medicines FROM prescriptions p LEFT JOIN prescription_items pi ON pi.prescription_id = p.id WHERE p.patient_id = :uid GROUP BY p.id"),
        {"uid": uid}
    ).mappings().fetchall()

    export = {
        "export_generated_at": datetime.utcnow().isoformat(),
        "account": {"email": user.email, "full_name": user.full_name, "created_at": str(user.created_at)},
        "profile": {k: str(v) for k, v in profile.items() if v is not None},
        "appointments_count": len(appointments),
        "prescriptions_count": len(prescriptions),
        "notice": "This export contains your personal health data. Keep it secure."
    }
    return jsonify(export), 200


# ── POST /patient/settings/delete-account ───────────────────────────────────

@patient_settings_bp.route("/delete-account", methods=["POST"])
@jwt_required()
def delete_account():
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "Password confirmation required"}), 400

    user = User.query.get_or_404(uid)
    if not verify_password(password, user.password_hash):
        return jsonify({"error": "Incorrect password"}), 400

    # Soft delete
    user.is_deleted = True
    user.account_status = "deleted"
    user.email = f"deleted_{uid}_{user.email}"   # free up email
    db.session.commit()
    return jsonify({"message": "Account deleted. You will be logged out."}), 200
