from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.models import (
    db, PatientProfile, User, EmergencyContact, 
    PatientMedication, PatientCondition, PatientAllergy, Appointment
)
from datetime import datetime
from utils.cloudinary_upload import upload_file as cld_upload

profile_bp = Blueprint("profile", __name__, url_prefix="/profile")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ============================
# GET PROFILE
# ============================
@profile_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_profile():
    claims = get_jwt()
    if claims.get("role") != "patient":
        return jsonify({"message": "Patient access required"}), 403

    user_id = int(get_jwt_identity())

    profile = PatientProfile.query.filter_by(user_id=user_id).first()

    # 🔥 Create profile if not exists
    if not profile:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        profile = PatientProfile(
            user_id=user_id,
            full_name=user.full_name
        )

        db.session.add(profile)
        db.session.commit()

    return jsonify(profile.to_dict()), 200


# ============================
# UPDATE PROFILE (JSON + IMAGE)
# ============================
@profile_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_my_profile():
    claims = get_jwt()
    if claims.get("role") != "patient":
        return jsonify({"message": "Patient access required"}), 403

    user_id = int(get_jwt_identity())

    profile = PatientProfile.query.filter_by(user_id=user_id).first()

    if not profile:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        profile = PatientProfile(
            user_id=user_id,
            full_name=user.full_name
        )

        db.session.add(profile)

    data = request.form if request.form else request.get_json()

    if not data:
        data = {}

    try:
        if "full_name" in data:
            profile.full_name = data.get("full_name")
            if profile.user:
                profile.user.full_name = data.get("full_name")

        if "phone" in data:
            profile.phone = data.get("phone")

        if "date_of_birth" in data:
            dob = data.get("date_of_birth")
            if dob:
                try:
                    profile.date_of_birth = datetime.strptime(dob, "%Y-%m-%d").date()
                except ValueError:
                    return jsonify({"message": "Invalid date_of_birth format. Use YYYY-MM-DD"}), 400
            else:
                profile.date_of_birth = None

        if "gender" in data:
            profile.gender = data.get("gender")

        if "blood_group" in data:
            profile.blood_group = data.get("blood_group")

        if "height_cm" in data:
            value = data.get("height_cm")
            profile.height_cm = int(value) if value not in (None, "", "null") else None

        if "weight_kg" in data:
            value = data.get("weight_kg")
            profile.weight_kg = int(value) if value not in (None, "", "null") else None

        if "address" in data:
            profile.address = data.get("address")

        if "city" in data:
            profile.city = data.get("city")

        if "state" in data:
            profile.state = data.get("state")

        if "country" in data:
            profile.country = data.get("country")

        if "pincode" in data:
            profile.pincode = data.get("pincode")

        if "allergies" in data:
            profile.allergies = data.get("allergies")

        if "chronic_conditions" in data:
            profile.chronic_conditions = data.get("chronic_conditions")

        if "profile_image" in request.files:
            file = request.files["profile_image"]
            if file and file.filename != "" and allowed_file(file.filename):
                public_id = f"neuronest/profiles/patient_{user_id}"
                try:
                    result = cld_upload(file.stream, public_id=public_id, folder="neuronest/profiles", resource_type="image")
                    profile.profile_image = result["secure_url"]
                except Exception as e:
                    return jsonify({"message": f"Image upload failed: {str(e)}"}), 500

        db.session.commit()
        return jsonify(profile.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Profile update failed: {str(e)}"}), 500


# ============================
# GET EMERGENCY CONTACTS (LIST)
# ============================
@profile_bp.route("/emergency-contact/me", methods=["GET"])
@jwt_required()
def get_my_emergency_contacts():
    claims = get_jwt()
    if claims.get("role") != "patient":
        return jsonify({"message": "Patient access required"}), 403

    user_id = int(get_jwt_identity())
    profile = PatientProfile.query.filter_by(user_id=user_id).first()

    if not profile:
        return jsonify([]), 200  # Return empty list if no profile

    contacts = EmergencyContact.query.filter_by(patient_id=profile.id).all()
    return jsonify([c.to_dict() for c in contacts]), 200


# ============================
# UPDATE EMERGENCY CONTACTS (Replaces list)
# ============================
@profile_bp.route("/emergency-contact/me", methods=["PUT"])
@jwt_required()
def update_my_emergency_contacts():
    claims = get_jwt()
    if claims.get("role") != "patient":
        return jsonify({"message": "Patient access required"}), 403

    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not isinstance(data, list):
        return jsonify({"message": "Expected a list of contacts"}), 400

    profile = PatientProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"message": "Profile not found"}), 404

    try:
        # strategy: delete old contacts, add new ones (simple sync)
        db.session.query(EmergencyContact).filter(EmergencyContact.patient_id == profile.id).delete(synchronize_session=False)

        new_contacts = []
        primary_set = False # Track if a primary contact is already set

        for index, contact_data in enumerate(data):
            # Basic validation
            if not contact_data.get("contact_name"):
                 return jsonify({"message": f"Contact {index + 1} name is required"}), 400
            
            if not contact_data.get("phone"):
                 return jsonify({"message": f"Contact {index + 1} phone is required"}), 400

            is_primary = contact_data.get("is_primary", False)
            
            # Enforce single primary contact
            if is_primary:
                if primary_set:
                    is_primary = False # Demote subsequent primary contacts
                else:
                    primary_set = True

            new_contact = EmergencyContact(
                patient_id=profile.id,
                contact_name=contact_data.get("contact_name"),
                relationship=contact_data.get("relationship"),
                phone=contact_data.get("phone"),
                alternate_phone=contact_data.get("alternate_phone"),
                email=contact_data.get("email"),
                is_primary=is_primary
            )
            db.session.add(new_contact)
            new_contacts.append(new_contact)

        db.session.commit()

        return jsonify([c.to_dict() for c in new_contacts]), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Emergency contact save failed: {str(e)}"}), 500

@profile_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_my_notifications():
    user_id = int(get_jwt_identity())
    unread_only = request.args.get("unread_only") == "true"
    
    from database.models import InAppNotification
    
    query = InAppNotification.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)
        
    notifications = query.order_by(InAppNotification.created_at.desc()).limit(20).all()
    
    return jsonify([n.to_dict() for n in notifications]), 200

@profile_bp.route("/notifications/<int:id>/read", methods=["PATCH"])
@jwt_required()
def mark_notification_read(id):
    user_id = int(get_jwt_identity())
    from database.models import InAppNotification
    
    notification = InAppNotification.query.filter_by(id=id, user_id=user_id).first()
    if not notification:
        return jsonify({"message": "Notification not found"}), 404
        
    notification.is_read = True
    db.session.commit()
    
    return jsonify({"message": "Notification marked as read"}), 200
    
@profile_bp.route("/notifications/<int:id>/resolve", methods=["PATCH"])
@jwt_required()
def mark_notification_resolved(id):
    user_id = int(get_jwt_identity())
    from database.models import InAppNotification, DoctorEscalation, DoctorProfile
    
    notification = InAppNotification.query.filter_by(id=id, user_id=user_id).first()
    if not notification:
        return jsonify({"message": "Notification not found"}), 404
        
    notification.is_resolved = True
    notification.is_read = True # Resolving implies reading
    
    # If it's an escalation, try to resolve the underlying escalation too
    payload = notification.payload or {}
    doctor_id = payload.get("doctor_id")
    if doctor_id:
        escalation = DoctorEscalation.query.filter_by(doctor_id=doctor_id, status="open").first()
        if escalation:
            from modules.admin.services.governance_service import GovernanceService
            GovernanceService.perform_admin_action(escalation.id, user_id, "resolve", "Resolved via administrative notification center")
            
    db.session.commit()
    return jsonify({"message": "Notification and associated issues marked as resolved"}), 200

@profile_bp.route("/notifications/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_notifications_read():
    user_id = int(get_jwt_identity())
    from database.models import InAppNotification
    
    InAppNotification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    
    return jsonify({"message": "All notifications marked as read"}), 200

@profile_bp.route("/notifications/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_notification(id):
    user_id = int(get_jwt_identity())
    from database.models import InAppNotification
    
    notification = InAppNotification.query.filter_by(id=id, user_id=user_id).first()
    if not notification:
        return jsonify({"message": "Notification not found"}), 404
        
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({"message": "Notification deleted"}), 200
@profile_bp.route("/clinical-summary", methods=["GET"])
@jwt_required()
def get_my_clinical_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    profile = PatientProfile.query.filter_by(user_id=user_id).first()
    
    # Construct robust identity following PROFILE_KEYS
    identity = {
        "id": user.id,
        "full_name": user.full_name or "Patient",
        "email": user.email,
        "role": user.role,
        "phone": "",
        "date_of_birth": "",
        "gender": "",
        "blood_group": "",
        "height_cm": "",
        "weight_kg": "",
        "address": "",
        "city": "",
        "state": "",
        "country": "",
        "pincode": "",
        "allergies": "",
        "chronic_conditions": "",
        "profile_image": ""
    }
    
    if profile:
        p_dict = profile.to_dict()
        # Map date_of_birth specifically for frontend compatibility
        if p_dict.get("date_of_birth"):
            identity["date_of_birth"] = p_dict["date_of_birth"]
        
        # Merge other fields
        for k in identity.keys():
            if k in p_dict and p_dict[k] is not None:
                identity[k] = p_dict[k]

    # Fetch Clinical History (Optimized Queries)
    # medications = PatientMedication.query.filter_by(patient_id=user_id, status='active').all()
    # conditions = PatientCondition.query.filter_by(patient_id=user_id, status='active').all()
    # allergies = PatientAllergy.query.filter_by(patient_id=user_id, status='active').all()
    
    # Using simple queries for now but could be further optimized with a single UNION if needed.
    # The main bottleneck was the number of parallel requests from the frontend.
    medications = PatientMedication.query.filter_by(patient_id=user_id, status='active').all()
    conditions = PatientCondition.query.filter_by(patient_id=user_id, status='active').all()
    allergies = PatientAllergy.query.filter_by(patient_id=user_id, status='active').all()
    appointments_list = Appointment.query.filter_by(patient_id=user_id).order_by(Appointment.appointment_date.desc()).limit(10).all()

    summary = {
        "identity": identity,
        "medications": [m.to_dict() for m in medications],
        "conditions": [c.to_dict() for c in conditions],
        "allergies": [a.to_dict() for a in allergies],
        "timeline": [appt.to_dict() for appt in appointments_list]
    }

    return jsonify(summary), 200
