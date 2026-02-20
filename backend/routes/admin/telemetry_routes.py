from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import User, PatientProfile, Appointment, db
from sqlalchemy import func

telemetry_bp = Blueprint("telemetry", __name__)

@telemetry_bp.route("/", methods=["GET"])
@jwt_required()
def get_telemetry():
    # Only allow admins to see telemetry
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    specialist_count = User.query.filter(User.role == 'doctor').count()
    patient_count = PatientProfile.query.count()
    appointment_count = Appointment.query.count()
    
    # Simulate "nodes" as a combination of active entities + some institutional base
    # In a real system, this might be connected hardware or active sessions
    # For now, we'll make it reflect total clinical records
    node_base = specialist_count + patient_count + appointment_count
    
    return jsonify({
        "nodes": node_base,
        "specialists": specialist_count,
        "patients": patient_count,
        "appointments": appointment_count,
        "timestamp": func.now()
    }), 200
