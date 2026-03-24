from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, DoctorEscalation, EscalationAction, DoctorProfile, User
from services.governance_service import GovernanceService
from functools import wraps

governance_bp = Blueprint('governance', __name__)

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role not in ['admin', 'super_admin']:
            return jsonify({"error": "Admin access required"}), 403
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
    admin_id = get_jwt_identity()
    
    action_type = data.get('action_type') # warning, suspend, restrict, resolve, dismiss
    note = data.get('note', '')
    
    if not action_type:
        return jsonify({"error": "Action type required"}), 400
        
    success, message = GovernanceService.perform_admin_action(id, admin_id, action_type, note)
    
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
    
    return jsonify({
        "telemetry": profile.to_dict().get('telemetry'),
        "history": [h.to_dict() for h in history]
    }), 200
