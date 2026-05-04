from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, DoctorEscalation, EscalationAction, DoctorProfile, User
from modules.admin.services.governance_service import GovernanceService
from functools import wraps
from datetime import datetime

governance_bp = Blueprint('governance', __name__)

def _resolve_current_user():
    identity = get_jwt_identity()
    if isinstance(identity, int):
        return User.query.get(identity)
    if isinstance(identity, str):
        if identity.isdigit():
            return User.query.get(int(identity))
        return User.query.filter_by(email=identity.strip().lower()).first()
    return None

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = _resolve_current_user()
        if not user or user.role not in ['admin', 'super_admin']:
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

def super_admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = _resolve_current_user()
        if not user or user.role != 'super_admin':
            return jsonify({"error": "Super admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

@governance_bp.route('/escalations', methods=['GET'])
@admin_required
def list_escalations():
    status = request.args.get('status', 'open')
    escalations = DoctorEscalation.query.filter_by(status=status).order_by(DoctorEscalation.created_at.desc()).all()
    return jsonify([e.to_dict() for e in escalations]), 200

@governance_bp.route('/escalations/<int:id>', methods=['GET'])
@admin_required
def get_escalation(id):
    escalation = DoctorEscalation.query.get(id)
    if not escalation:
        return jsonify({"error": "Escalation not found"}), 404
    
    # Get doctor context
    profile = DoctorProfile.query.filter_by(user_id=escalation.doctor_id).first()
    
    return jsonify({
        "escalation": escalation.to_dict(),
        "doctor_profile": profile.to_dict() if profile else None
    }), 200

@governance_bp.route('/escalations/<int:id>/action', methods=['POST'])
@admin_required
def take_action(id):
    data = request.json
    user = _resolve_current_user()
    admin_id = user.id if user else None
    
    action_type = data.get('action_type') # warning, suspend, restrict, resolve, dismiss
    note = data.get('note', '')
    
    if not action_type:
        return jsonify({"error": "Action type required"}), 400
        
    success, message = GovernanceService.perform_admin_action(id, admin_id, action_type, note)
    
    if not success:
        return jsonify({"error": message}), 400
        
    return jsonify({"message": message}), 200

@governance_bp.route('/escalations/<int:id>/close', methods=['POST'])
@super_admin_required
def close_escalation(id):
    escalation = DoctorEscalation.query.get(id)
    if not escalation:
        return jsonify({"error": "Escalation not found"}), 404

    data = request.json or {}
    final_status = (data.get("status") or "resolved").strip().lower()
    note = (data.get("note") or "").strip()
    if final_status not in {"resolved", "dismissed"}:
        return jsonify({"error": "Invalid close status"}), 400

    escalation.status = final_status
    escalation.resolved_at = datetime.utcnow()

    user = _resolve_current_user()
    db.session.add(EscalationAction(
        escalation_id=escalation.id,
        admin_id=user.id,
        action_type=f"close_{final_status}",
        note=note or f"Escalation closed as {final_status}",
    ))
    db.session.commit()
    return jsonify({"message": f"Escalation {id} closed as {final_status}"}), 200

@governance_bp.route('/doctor/<int:doctor_id>/action', methods=['POST'])
@admin_required
def take_doctor_action(doctor_id):
    data = request.json
    user = _resolve_current_user()
    admin_id = user.id if user else None
    
    action_type = data.get('action_type')
    note = data.get('note', '')
    
    if not action_type:
        return jsonify({"error": "Action type required"}), 400

    # Ensure profile exists
    profile = DoctorProfile.query.filter_by(user_id=doctor_id).first()
    if not profile:
        return jsonify({"error": "Doctor not found"}), 404

    # If an open escalation exists, use that. Otherwise create a manual one.
    escalation = DoctorEscalation.query.filter_by(doctor_id=doctor_id, status='open').first()
    if not escalation:
        escalation = DoctorEscalation(
            doctor_id=doctor_id,
            reason="Manual Administrative Intervention",
            risk_level=profile.risk_level or "low",
            status="open",
            admin_notes=f"Action taken directly by Admin {user.full_name if user else 'ID '+str(admin_id)}"
        )
        db.session.add(escalation)
        db.session.flush() # Get ID

    success, message = GovernanceService.perform_admin_action(escalation.id, admin_id, action_type, note)
    
    if not success:
        return jsonify({"error": message}), 400
        
    return jsonify({"message": message}), 200

@governance_bp.route('/doctor/<int:doctor_id>/governance', methods=['GET'])
@admin_required
def get_doctor_governance(doctor_id):
    profile = DoctorProfile.query.filter_by(user_id=doctor_id).first()
    if not profile:
        return jsonify({"error": "Doctor not found"}), 404
        
    # Get history of escalations
    history = DoctorEscalation.query.filter_by(doctor_id=doctor_id).order_by(DoctorEscalation.created_at.desc()).all()
    
    profile_data = profile.to_dict()
    # Ensure status is synced with User account_status
    if profile.user and profile.user.account_status == 'active' and profile.doctor_status == 'suspended':
        # Auto-fix mismatch
        profile.doctor_status = 'active'
        db.session.commit()
        profile_data['telemetry']['doctor_status'] = 'active'

    return jsonify({
        "doctor_details": {
            "full_name": profile_data.get('full_name'),
            "specialization": profile_data.get('specialization'),
            "department": profile_data.get('department'),
            "license_number": profile_data.get('license_number'),
            "phone": profile_data.get('phone'),
            "profile_image": profile_data.get('profile_image'),
            "experience_years": profile_data.get('experience_years')
        },
        "telemetry": profile_data.get('telemetry'),
        "history": [h.to_dict() for h in history]
    }), 200
