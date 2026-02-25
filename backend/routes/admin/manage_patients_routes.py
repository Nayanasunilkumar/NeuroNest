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
            (User.email.ilike(f"%{search_query}%"))
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
    
    # Audit summary
    recent_logs = PatientAuditLog.query.filter_by(patient_id=patient_id).order_by(PatientAuditLog.created_at.desc()).limit(10).all()
    
    return jsonify({
        "user_info": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "account_status": user.account_status,
            "is_email_verified": user.is_email_verified,
            "is_phone_verified": user.is_phone_verified
        },
        "profile_info": profile_dict,
        "audit_summary": [log.to_dict() for log in recent_logs]
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
