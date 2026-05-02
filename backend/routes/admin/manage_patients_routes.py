from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, User, PatientProfile, Appointment
from database.models import PatientStatusLog, PatientFlag, PatientAuditLog
from datetime import datetime

admin_patients_bp = Blueprint("admin_patients", __name__)

def admin_required(fn):
    # Basic role check wrapper
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_id = get_jwt_identity()
        user = User.query.get(current_id)
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

# -----------------------------------------------------------------
# 1. GET ALL PATIENTS (Listing + Filter)
# -----------------------------------------------------------------
@admin_patients_bp.route("/", methods=["GET"])
@admin_required
def get_patients():
    search_query = request.args.get("search", "").strip()
    status_filter = request.args.get("status", "")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    
    query = User.query.filter(User.role == "patient")
    
    if search_query:
        query = query.filter(
            (User.full_name.ilike(f"%{search_query}%")) | 
            (User.email.ilike(f"%{search_query}%")) |
            (User.id.cast(db.String).ilike(f"%{search_query}%"))
        )
        
    if status_filter:
        query = query.filter(User.account_status == status_filter.lower())
        
    # Order by newest first
    query = query.order_by(User.id.desc())
    
    paginated = query.paginate(page=page, per_page=limit)
    
    patients_data = []
    for user in paginated.items:
        # Get extra count stats
        flags_count = PatientFlag.query.filter_by(patient_id=user.id, is_resolved=False).count()
        app_count = Appointment.query.filter_by(patient_id=user.id).count()
        
        patients_data.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "account_status": user.account_status,
            "is_email_verified": user.is_email_verified,
            "is_phone_verified": user.is_phone_verified,
            "is_verified": user.is_verified,
            "flags_count": flags_count,
            "appointments_total": app_count,
            "created_at": str(user.patient_profile.created_at) if user.patient_profile else None
        })
        
    return jsonify({
        "patients": patients_data,
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    }), 200

# -----------------------------------------------------------------
# 2. GET SINGLE PATIENT DETAILS
# -----------------------------------------------------------------
@admin_patients_bp.route("/<int:patient_id>", methods=["GET"])
@admin_required
def get_patient_detail(patient_id):
    user = User.query.get_or_404(patient_id)
    if user.role != "patient":
        return jsonify({"error": "User is not a patient"}), 400
        
    profile = user.patient_profile
    profile_dict = profile.to_dict() if profile else {}
    
    appointments = Appointment.query.filter_by(patient_id=patient_id).order_by(
        Appointment.appointment_date.desc(),
        Appointment.appointment_time.desc()
    ).all()
    recent_appointments = appointments[:6]
    recent_flags = PatientFlag.query.filter_by(patient_id=patient_id).order_by(
        PatientFlag.created_at.desc()
    ).limit(6).all()
    status_logs = PatientStatusLog.query.filter_by(patient_id=patient_id).order_by(
        PatientStatusLog.created_at.desc()
    ).limit(6).all()
    recent_logs = PatientAuditLog.query.filter_by(patient_id=patient_id).order_by(PatientAuditLog.created_at.desc()).limit(10).all()
    completed_statuses = {"completed"}
    pending_statuses = {"pending", "approved", "rescheduled"}
    cancelled_statuses = {"cancelled", "cancelled_by_patient", "cancelled_by_doctor", "rejected", "no_show"}
    appointment_summary = {
        "completed": sum(1 for appt in appointments if (appt.status or "").lower() in completed_statuses),
        "upcoming": sum(1 for appt in appointments if (appt.status or "").lower() in pending_statuses),
        "cancelled": sum(1 for appt in appointments if (appt.status or "").lower() in cancelled_statuses),
        "online": sum(1 for appt in appointments if (appt.consultation_type or "").lower() == "online"),
        "in_person": sum(1 for appt in appointments if (appt.consultation_type or "").lower() != "online")
    }
    profile_fields = [
        profile_dict.get("phone"),
        profile_dict.get("date_of_birth"),
        profile_dict.get("gender"),
        profile_dict.get("blood_group"),
        profile_dict.get("height_cm"),
        profile_dict.get("weight_kg"),
        profile_dict.get("address"),
        profile_dict.get("city"),
        profile_dict.get("allergies"),
        profile_dict.get("chronic_conditions")
    ]
    completed_profile_fields = sum(1 for field in profile_fields if field not in [None, ""])
    profile_completion = round((completed_profile_fields / len(profile_fields)) * 100) if profile_fields else 0
    
    return jsonify({
        "user_info": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "account_status": user.account_status,
            "is_email_verified": user.is_email_verified,
            "is_phone_verified": user.is_phone_verified,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() + "Z" if user.created_at else None,
            "updated_at": user.updated_at.isoformat() + "Z" if user.updated_at else None
        },
        "profile_info": profile_dict,
        "metrics": {
            "appointments_total": Appointment.query.filter_by(patient_id=patient_id).count(),
            "flags_open": PatientFlag.query.filter_by(patient_id=patient_id, is_resolved=False).count(),
            "flags_total": PatientFlag.query.filter_by(patient_id=patient_id).count(),
            "audit_events": PatientAuditLog.query.filter_by(patient_id=patient_id).count(),
            "is_verified": user.is_verified,
            "profile_completion": profile_completion,
            "appointment_summary": appointment_summary
        },
        "recent_appointments": [appt.to_dict() for appt in recent_appointments],
        "recent_flags": [{
            "id": flag.id,
            "category": flag.category,
            "reason": flag.reason,
            "severity": flag.severity,
            "is_resolved": flag.is_resolved,
            "resolved_at": flag.resolved_at.isoformat() + "Z" if flag.resolved_at else None,
            "resolution_note": flag.resolution_note,
            "created_at": flag.created_at.isoformat() + "Z" if flag.created_at else None
        } for flag in recent_flags],
        "status_history": [{
            "id": log.id,
            "previous_status": log.previous_status,
            "new_status": log.new_status,
            "reason": log.reason,
            "created_at": log.created_at.isoformat() + "Z" if log.created_at else None
        } for log in status_logs],
        "audit_summary": [{
            "id": log.id,
            "action_type": log.action_type,
            "description": log.description,
            "created_at": log.created_at.isoformat() + "Z" if log.created_at else None,
            "ip_address": log.ip_address
        } for log in recent_logs]
    }), 200

# -----------------------------------------------------------------
# 3. UPDATE PATIENT STATUS (Suspend / Reactivate)
# -----------------------------------------------------------------
@admin_patients_bp.route("/<int:patient_id>/status", methods=["PATCH"])
@admin_required
def update_patient_status(patient_id):
    data = request.json or {}
    new_status = data.get("status") # suspended / active
    reason = data.get("reason", "No reason provided")
    
    if new_status not in ["active", "suspended", "deleted"]:
        return jsonify({"error": "Invalid status"}), 400
        
    user = User.query.get_or_404(patient_id)
    admin_id = get_jwt_identity()
    
    prev_status = user.account_status
    user.account_status = new_status
    
    # Sync is_deleted canonical flag
    if new_status == "deleted":
        user.is_deleted = True
    else:
        user.is_deleted = False
    
    # Log status change
    log = PatientStatusLog(
        patient_id=patient_id,
        admin_id=admin_id,
        previous_status=prev_status,
        new_status=new_status,
        reason=reason
    )
    db.session.add(log)
    
    # Universal Audit
    audit = PatientAuditLog(
        patient_id=patient_id,
        actor_id=admin_id,
        action_type="status_change",
        description=f"Status changed from {prev_status} to {new_status}. Reason: {reason}",
        ip_address=request.remote_addr,
        user_agent=str(request.user_agent)
    )
    db.session.add(audit)
    
    db.session.commit()
    
    return jsonify({"message": f"Patient status updated to {new_status}"}), 200
