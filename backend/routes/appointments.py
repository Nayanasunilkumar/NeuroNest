from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from database.models import db, Appointment, User, DoctorProfile

appointments_bp = Blueprint("appointments", __name__)

@appointments_bp.route("/doctors", methods=["GET"])
@jwt_required()
def get_all_doctors():
    try:
        if get_jwt().get("role") != "patient":
            return jsonify({"error": "Patient access required"}), 403

        # Join User and DoctorProfile to get name and specialization
        doctors_query = db.session.query(User, DoctorProfile).join(
            DoctorProfile, User.id == DoctorProfile.user_id
        ).filter(User.role == "doctor").all()
        
        result = []
        for user, profile in doctors_query:
            result.append({
                "id": user.id,
                "full_name": user.full_name,
                "specialization": profile.specialization or "General Physician"
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@appointments_bp.route("/", methods=["POST"])
@jwt_required()
def book_appointment():
    try:
        if get_jwt().get("role") != "patient":
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        data = request.get_json()

        required_fields = ["doctor_id", "date", "time", "reason"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        appointment_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        appointment_time = datetime.strptime(data["time"], "%H:%M").time()

        new_appointment = Appointment(
            patient_id=current_user_id,
            doctor_id=int(data["doctor_id"]),
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            reason=data["reason"],
            notes=data.get("notes", "")
        )

        db.session.add(new_appointment)
        db.session.commit()

        return jsonify(new_appointment.to_dict()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@appointments_bp.route("/", methods=["GET"])
@jwt_required()
def get_appointments():
    try:
        if get_jwt().get("role") != "patient":
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        appointments = Appointment.query.filter_by(patient_id=current_user_id).order_by(Appointment.appointment_date.desc()).all()
        return jsonify([appt.to_dict() for appt in appointments]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@appointments_bp.route("/<int:id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_appointment(id):
    try:
        if get_jwt().get("role") != "patient":
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        appointment = Appointment.query.filter_by(id=id, patient_id=current_user_id).first()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        
        if appointment.status == "Cancelled":
             return jsonify({"message": "Appointment already cancelled"}), 200

        appointment.status = "Cancelled"
        db.session.commit()

        return jsonify({"message": "Appointment cancelled successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@appointments_bp.route("/<int:id>/reschedule", methods=["PUT"])
@jwt_required()
def reschedule_appointment(id):
    try:
        if get_jwt().get("role") != "patient":
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        appointment = Appointment.query.filter_by(id=id, patient_id=current_user_id).first()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        
        if "date" in data:
            appointment.appointment_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        if "time" in data:
            appointment.appointment_time = datetime.strptime(data["time"], "%H:%M").time()
            
        appointment.status = "Pending" # Reset to pending on reschedule
        db.session.commit()

        return jsonify({"message": "Appointment rescheduled successfully", "appointment": appointment.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
