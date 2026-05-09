from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import (
    db, User, PatientProfile, PatientMedication, 
    PatientCondition, PatientAllergy, Appointment, 
    EmergencyContact, InAppNotification
)
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta, timezone

patient_dashboard_bp = Blueprint("patient_dashboard_bp", __name__, url_prefix="/api/patient/dashboard")

@patient_dashboard_bp.route("/consolidated", methods=["GET"])
@jwt_required()
def get_consolidated_dashboard():
    user_id = int(get_jwt_identity())
    
    # 1. Fetch User and Profile in one go
    user = User.query.options(joinedload(User.patient_profile)).get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    profile = user.patient_profile
    
    # 2. Identity mapping
    identity = {
        "id": user.id,
        "full_name": user.full_name or "Patient",
        "email": user.email,
        "role": user.role,
        "profile_image": profile.profile_image if profile else None,
        "phone": profile.phone if profile else "",
        "date_of_birth": str(profile.date_of_birth) if profile and profile.date_of_birth else "",
        "gender": profile.gender if profile else "",
        "blood_group": profile.blood_group if profile else "",
        "height_cm": profile.height_cm if profile else None,
        "weight_kg": profile.weight_kg if profile else None,
    }

    # 3. Manual medications
    manual_medications = PatientMedication.query.filter_by(patient_id=user_id, status='active').all()
    all_medications = [m.to_dict() for m in manual_medications]

    # ── Doctor-issued prescription items (NEW) ──
    # Merge active prescription medications so they appear in the Prescription Reminder widget.
    try:
        from models.prescription_models import Prescription
        today = datetime.utcnow().date()
        active_prescriptions = Prescription.query.filter(
            Prescription.patient_id == user_id,
            Prescription.is_deleted.is_(False),
            Prescription.status == "active",
            db.or_(
                Prescription.valid_until.is_(None),
                Prescription.valid_until >= today
            )
        ).all()

        for rx in active_prescriptions:
            for item in rx.items:
                all_medications.append({
                    "id": f"rx-{rx.id}-{item.id}",
                    "patient_id": user_id,
                    "drug_name": item.medicine_name,
                    "dosage": item.dosage or "As directed",
                    "frequency": item.frequency or "",
                    "instructions": item.instructions or "",
                    "status": "active",
                    "created_by_role": "doctor",
                    "start_date": str(rx.created_at.date()) if rx.created_at else None,
                    "end_date": str(rx.valid_until) if rx.valid_until else None,
                })
    except Exception as e:
        current_app.logger.warning(f"Could not load prescription meds for dashboard: {e}")

    # Conditions
    conditions = PatientCondition.query.filter_by(patient_id=user_id, status='active').all()
    
    # Allergies
    allergies = PatientAllergy.query.filter_by(patient_id=user_id, status='active').all()
    
    # Emergency Contacts
    contacts = []
    if profile:
        contacts = EmergencyContact.query.filter_by(patient_id=profile.id).all()

    # Upcoming Appointments — today onwards with 1-hour look-back for ongoing sessions
    now_utc = datetime.now(timezone.utc)
    cutoff_date = (now_utc - timedelta(hours=1)).date()

    appointments = Appointment.query.filter(
        Appointment.patient_id == user_id,
        Appointment.appointment_date >= cutoff_date,
        Appointment.status.in_(["pending", "approved", "rescheduled"])
    ).order_by(
        Appointment.appointment_date.asc(),
        Appointment.appointment_time.asc()
    ).limit(5).all()

    # Recent Notifications (Top 5 unread)
    notifications = InAppNotification.query.filter_by(
        user_id=user_id, 
        is_read=False
    ).order_by(InAppNotification.created_at.desc()).limit(5).all()

    # 4. Vitals (Try to get from memory cache if available)
    vitals_data = {"latest": None, "history": []}
    try:
        from routes.vitals_route import _latest_by_patient, _history_by_patient, _vitals_lock
        with _vitals_lock:
            latest = _latest_by_patient.get(user_id)
            if latest:
                vitals_data["latest"] = dict(latest)
            history = list(_history_by_patient.get(user_id, []))
            vitals_data["history"] = history

        if not vitals_data["latest"]:
            vitals_data["latest"] = {"signal": "no_device"}
                
    except Exception as e:
        current_app.logger.error(f"Failed to fetch vitals for consolidated dashboard: {str(e)}")

    # 5. Build Response
    response = {
        "identity": identity,
        "clinical": {
            "medications": all_medications,
            "conditions": [c.to_dict() for c in conditions],
            "allergies": [a.to_dict() for a in allergies],
        },
        "appointments": [appt.to_dict() for appt in appointments],
        "notifications": [n.to_dict() for n in notifications],
        "emergency_contacts": [c.to_dict() for c in contacts],
        "vitals": vitals_data
    }
    
    return jsonify(response), 200
