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
    user = User.query.options(joinedload("patient_profile")).get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    profile = user.patient_profile
    
    # 2. Identify and Profile Mapping (Robust)
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

    # 3. Parallel-ish fetching using SQLAlchemy (sequentially but optimized)
    # We use user_id directly as patient_id for clinical tables as per models.py
    
    # Medications
    medications = PatientMedication.query.filter_by(patient_id=user_id, status='active').all()
    
    # Conditions
    conditions = PatientCondition.query.filter_by(patient_id=user_id, status='active').all()
    
    # Allergies
    allergies = PatientAllergy.query.filter_by(patient_id=user_id, status='active').all()
    
    # Emergency Contacts (Links to profile.id)
    contacts = []
    if profile:
        contacts = EmergencyContact.query.filter_by(patient_id=profile.id).all()

    # Upcoming Appointments (Top 3)
    now = datetime.utcnow()
    # Fetch appointments from 1 hour ago onwards to catch ongoing ones
    one_hour_ago = (now - timedelta(hours=1)).date()
    
    appointments = Appointment.query.filter(
        Appointment.patient_id == user_id,
        Appointment.appointment_date >= one_hour_ago,
        Appointment.status.in_(["pending", "approved", "confirmed", "rescheduled"])
    ).order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc()).limit(5).all()

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
    except Exception as e:
        current_app.logger.error(f"Failed to fetch vitals for consolidated dashboard: {str(e)}")

    # 5. Build Response
    response = {
        "identity": identity,
        "clinical": {
            "medications": [m.to_dict() for m in medications],
            "conditions": [c.to_dict() for c in conditions],
            "allergies": [a.to_dict() for a in allergies],
        },
        "appointments": [appt.to_dict() for appt in appointments],
        "notifications": [n.to_dict() for n in notifications],
        "emergency_contacts": [c.to_dict() for c in contacts],
        "vitals": vitals_data
    }
    
    return jsonify(response), 200
