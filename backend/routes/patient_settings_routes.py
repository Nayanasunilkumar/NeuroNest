from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.models import db, User, SecurityActivity
from utils.security import verify_password, hash_password
from datetime import datetime, date, time

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
def _ensure_patient_profile(user_id):
    """Upsert default patient profile row."""
    from sqlalchemy import text
    db.session.execute(text("""
        INSERT INTO patient_profiles (user_id, full_name)
        SELECT id, full_name FROM users WHERE id = :uid
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

    try:
        user = User.query.get_or_404(uid)
        _ensure_patient_profile(uid)
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
            "security": {
                "is_two_factor_enabled": getattr(user, "is_two_factor_enabled", False) or False,
                "email_verified": user.is_email_verified or False,
                "is_email_verified": user.is_email_verified or False,
                "is_phone_verified": user.is_phone_verified or False,
            },
            "notifications": {k: v for k, v in notif.items() if k not in ("id", "user_id", "created_at", "updated_at")},
        }), 200
    except Exception as e:
        print(f"Error in get_settings: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# ── PUT /patient/settings/account ────────────────────────────────────────────

@patient_settings_bp.route("/account", methods=["PUT"])
@jwt_required()
def update_account():
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    user = User.query.get_or_404(uid)
    _ensure_patient_profile(uid)

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
                SET contact_name=:name, relationship=:rel, phone=:phone, email=:email, updated_at=CURRENT_TIMESTAMP
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
        "sms_appointments",
        "inapp_appointments","inapp_prescriptions","inapp_messages","inapp_announcements","inapp_feedback","inapp_alerts",
        "allow_anonymous_feedback",
        "share_history_with_doctors","allow_analytics",
        "email_alerts",
    ]
    updates = {k: v for k, v in data.items() if k in allowed and isinstance(v, bool)}
    if updates:
        set_clause = ", ".join([f"{k} = :{k}" for k in updates])
        updates["uid"] = uid
        updates["updated_at"] = datetime.utcnow()
        db.session.execute(text(f"UPDATE notification_preferences SET {set_clause}, updated_at = :updated_at WHERE user_id = :uid"), updates)
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
        updates["updated_at"] = datetime.utcnow()
        db.session.execute(text(f"UPDATE notification_preferences SET {set_clause}, updated_at = :updated_at WHERE user_id = :uid"), updates)
        db.session.commit()

    return jsonify({"message": "Privacy settings updated"}), 200


# ── POST /patient/settings/change-password ───────────────────────────────────

@patient_settings_bp.route("/security-activity", methods=["GET"])
@jwt_required()
def get_security_activity():
    try:
        uid = int(get_jwt_identity())
        activities = SecurityActivity.query.filter_by(user_id=uid).order_by(SecurityActivity.created_at.desc()).limit(10).all()
        return jsonify([a.to_dict() for a in activities]), 200
    except Exception as e:
        print(f"Error in get_security_activity: {e}")
        return jsonify({"error": str(e)}), 500

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
    
    # Log password change
    try:
        activity = SecurityActivity(
            user_id=uid,
            event_type="password_change",
            description="Password changed successfully",
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(activity)
    except Exception as e:
        print(f"Error logging password change: {e}")

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Password change commit error: {e}")
        return jsonify({"error": "Failed to update security credentials"}), 500
    
    return jsonify({"message": "Password changed successfully"}), 200


# ── PUT /patient/settings/email ─────────────────────────────────────────────

@patient_settings_bp.route("/email", methods=["PUT"])
@jwt_required()
def update_email():
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    new_email = (data.get("email") or "").strip().lower()
    password = data.get("password", "")

    if not new_email or not password:
        return jsonify({"error": "Email and password confirmation are required"}), 400

    user = User.query.get(uid)
    if not user:
        return jsonify({"error": "User session expired or invalid"}), 401
    
    # 1. Verify password
    if not verify_password(password, user.password_hash):
        return jsonify({"error": "Identity verification failed: Incorrect password"}), 400

    # 2. Check if new email is exactly the same
    if new_email == user.email:
        return jsonify({"message": "Email is already set to this address"}), 200

    # 3. Check for duplicates
    existing = User.query.filter_by(email=new_email).first()
    if existing and existing.id != uid:
        return jsonify({"error": "This email address is already linked to another NeuroNest account"}), 400

    # 4. Perform Update
    old_email = user.email
    try:
        user.email = new_email
        
        # Log activity
        activity = SecurityActivity(
            user_id=uid,
            event_type="email_change",
            description=f"Email updated from {old_email} to {new_email}",
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(activity)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Email update failed for UID {uid}: {e}")
        return jsonify({"error": "Database error: Could not save new email address"}), 500

    return jsonify({"message": "Email address updated successfully"}), 200


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
        text("SELECT a.*, u.full_name as doctor_name FROM appointments a JOIN users u ON u.id = a.doctor_id WHERE a.patient_id = :uid ORDER BY a.appointment_date DESC"),
        {"uid": uid}
    ).mappings().fetchall()
    prescriptions = db.session.execute(
        text("SELECT p.*, array_agg(COALESCE(pi.medicine_name, 'Unknown') || ' (' || COALESCE(pi.frequency, 'N/A') || ')') AS medicines FROM prescriptions p LEFT JOIN prescription_items pi ON pi.prescription_id = p.id WHERE p.patient_id = :uid GROUP BY p.id"),
        {"uid": uid}
    ).mappings().fetchall()

    def _serial(obj):
        if isinstance(obj, (datetime, date, time)):
            return str(obj)
        return obj

    export = {
        "export_generated_at": datetime.utcnow().isoformat(),
        "account": {"email": user.email, "full_name": user.full_name, "created_at": str(user.created_at)},
        "profile": {k: str(v) for k, v in profile.items() if v is not None},
        "appointments": [{k: str(v) if isinstance(v, (date, time, datetime)) else v for k, v in dict(a).items()} for a in appointments],
        "prescriptions": [{k: str(v) if isinstance(v, (date, time, datetime)) else v for k, v in dict(p).items()} for p in prescriptions],
        "notice": "This export contains your personal health data. Keep it secure."
    }
    return jsonify(export), 200

@patient_settings_bp.route("/export-report", methods=["POST"])
@jwt_required()
def download_report():
    """Generates and returns a PDF medical report."""
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    from sqlalchemy import text
    from utils.pdf_generator import generate_patient_report
    from flask import send_file
    from .vitals_route import get_vitals_for_report

    user = User.query.get_or_404(uid)
    profile = _get_patient_profile(uid)
    
    # Emergency Contact
    ec_row = db.session.execute(
        text("SELECT * FROM emergency_contacts WHERE patient_id = :uid AND is_primary = TRUE LIMIT 1"),
        {"uid": uid}
    ).mappings().fetchone()

    # Appointments + Doctor Name
    appointments = db.session.execute(
        text("SELECT a.*, u.full_name as doctor_name FROM appointments a JOIN users u ON u.id = a.doctor_id WHERE a.patient_id = :uid ORDER BY a.appointment_date DESC LIMIT 20"),
        {"uid": uid}
    ).mappings().fetchall()

    # Prescriptions
    prescriptions = db.session.execute(
        text("SELECT p.*, array_agg(COALESCE(pi.medicine_name, 'Unknown') || ' (' || COALESCE(pi.frequency, 'N/A') || ')') AS medicines FROM prescriptions p LEFT JOIN prescription_items pi ON pi.prescription_id = p.id WHERE p.patient_id = :uid GROUP BY p.id ORDER BY p.created_at DESC LIMIT 10"),
        {"uid": uid}
    ).mappings().fetchall()

    vitals = get_vitals_for_report(uid)

    data = {
        "account": {"email": user.email, "full_name": user.full_name},
        "profile": {k: str(v) for k, v in profile.items() if v is not None},
        "emergency_contact": dict(ec_row) if ec_row else {},
        "appointments": [dict(a) for a in appointments],
        "prescriptions": [dict(p) for p in prescriptions],
        "vitals": vitals
    }

    pdf_buffer = generate_patient_report(data)
    
    filename = f"NeuroNest_Report_{user.full_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=filename
    )

@patient_settings_bp.route("/export-appointments", methods=["POST"])
@jwt_required()
def export_appointments():
    """Generates PDF of appointments only."""
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    from sqlalchemy import text
    from utils.pdf_generator import generate_patient_report
    from flask import send_file

    user = User.query.get_or_404(uid)
    profile = _get_patient_profile(uid)
    appointments = db.session.execute(
        text("SELECT a.*, u.full_name as doctor_name FROM appointments a JOIN users u ON u.id = a.doctor_id WHERE a.patient_id = :uid ORDER BY a.appointment_date DESC"),
        {"uid": uid}
    ).mappings().fetchall()

    data = {
        "account": {"email": user.email, "full_name": user.full_name},
        "profile": {k: str(v) for k, v in profile.items() if v is not None},
        "appointments": [dict(a) for a in appointments]
    }

    pdf_buffer = generate_patient_report(data)
    return send_file(pdf_buffer, mimetype='application/pdf', as_attachment=True, download_name=f"NeuroNest_Appointments_{datetime.now().strftime('%Y%m%d')}.pdf")

@patient_settings_bp.route("/export-prescriptions", methods=["POST"])
@jwt_required()
def export_prescriptions():
    """Generates PDF of prescriptions only."""
    uid = int(get_jwt_identity())
    if not _require_patient(get_jwt()):
        return jsonify({"error": "Access denied"}), 403

    from sqlalchemy import text
    from utils.pdf_generator import generate_patient_report
    from flask import send_file

    user = User.query.get_or_404(uid)
    profile = _get_patient_profile(uid)
    prescriptions = db.session.execute(
        text("SELECT p.*, array_agg(COALESCE(pi.medicine_name, 'Unknown') || ' (' || COALESCE(pi.frequency, 'N/A') || ')') AS medicines FROM prescriptions p LEFT JOIN prescription_items pi ON pi.prescription_id = p.id WHERE p.patient_id = :uid GROUP BY p.id ORDER BY p.created_at DESC"),
        {"uid": uid}
    ).mappings().fetchall()

    data = {
        "account": {"email": user.email, "full_name": user.full_name},
        "profile": {k: str(v) for k, v in profile.items() if v is not None},
        "prescriptions": [dict(p) for p in prescriptions]
    }

    pdf_buffer = generate_patient_report(data)
    return send_file(pdf_buffer, mimetype='application/pdf', as_attachment=True, download_name=f"NeuroNest_Prescriptions_{datetime.now().strftime('%Y%m%d')}.pdf")


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
