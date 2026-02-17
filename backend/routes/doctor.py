from flask import Blueprint, request, jsonify
from sqlalchemy import func
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, date
from sqlalchemy import and_, or_, desc
from database.models import db, Appointment, User, ClinicalRemark, MedicalRecord

doctor_bp = Blueprint("doctor", __name__)

def check_doctor_role():
    claims = get_jwt()
    if claims.get("role") != "doctor":
        return False
    return True

@doctor_bp.route("/appointment-requests", methods=["GET"])
@jwt_required()
def get_appointment_requests():
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    # Get pending appointments for this doctor
    requests = Appointment.query.filter_by(
        doctor_id=current_user_id,
        status="Pending"
    ).order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc()).all()
    
    return jsonify([req.to_dict() for req in requests]), 200

@doctor_bp.route("/appointments/<int:appointment_id>/approve", methods=["PATCH"])
@jwt_required()
def approve_appointment(appointment_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=current_user_id).first()
    
    if not appointment:
        return jsonify({"message": "Appointment not found"}), 404
    
    appointment.status = "Approved"
    db.session.commit()
    
    return jsonify({
        "message": "Appointment approved successfully",
        "appointment": appointment.to_dict()
    }), 200

@doctor_bp.route("/appointments/<int:appointment_id>/reject", methods=["PATCH"])
@jwt_required()
def reject_appointment(appointment_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=current_user_id).first()
    
    if not appointment:
        return jsonify({"message": "Appointment not found"}), 404
    
    appointment.status = "Rejected"
    db.session.commit()
    
    return jsonify({
        "message": "Appointment rejected successfully",
        "appointment": appointment.to_dict()
    }), 200

@doctor_bp.route("/schedule", methods=["GET"])
@jwt_required()
def get_doctor_schedule():
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    date_str = request.args.get('date')
    status_filter = request.args.get('status')
    
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
    else:
        target_date = date.today()
    
    query = Appointment.query.filter(
        Appointment.doctor_id == current_user_id,
        Appointment.appointment_date == target_date
    )
    
    if status_filter and status_filter.lower() != 'all':
        query = query.filter(Appointment.status == status_filter.capitalize())
    else:
        # Default: Show everything except 'Pending' which should be in Requests
        query = query.filter(Appointment.status != "Pending")
        
    schedule = query.order_by(Appointment.appointment_time.asc()).all()
    
    return jsonify([appt.to_dict() for appt in schedule]), 200

@doctor_bp.route("/appointments/<int:appointment_id>/complete", methods=["PATCH"])
@jwt_required()
def complete_appointment(appointment_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=current_user_id).first()
    
    if not appointment:
        return jsonify({"message": "Appointment not found"}), 404
        
    appointment.status = "Completed"
    db.session.commit()
    
    return jsonify({"message": "Appointment marked as completed"}), 200

@doctor_bp.route("/appointments/<int:appointment_id>/cancel", methods=["PATCH"])
@jwt_required()
def cancel_appointment(appointment_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=current_user_id).first()
    
    if not appointment:
        return jsonify({"message": "Appointment not found"}), 404
        
    appointment.status = "Cancelled"
    db.session.commit()
    
    return jsonify({"message": "Appointment cancelled"}), 200

@doctor_bp.route("/appointments/history", methods=["GET"])
@jwt_required()
def get_appointment_history():
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    
    appointments = Appointment.query.filter(
        Appointment.doctor_id == current_user_id,
        Appointment.status != "Pending"
    ).order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()
    
    return jsonify([appt.to_dict() for appt in appointments]), 200

@doctor_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_doctor_stats():
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    today = date.today()
    
    # 1. Total Patients (Unique)
    total_patients = db.session.query(func.count(func.distinct(Appointment.patient_id)))\
        .filter(Appointment.doctor_id == current_user_id).scalar()
        
    # 2. Today's Appointments
    today_count = Appointment.query.filter_by(
        doctor_id=current_user_id,
        status="Approved",
        appointment_date=today
    ).count()
    
    # 3. Pending Requests
    pending_requests = Appointment.query.filter_by(
        doctor_id=current_user_id,
        status="Pending"
    ).count()
    
    return jsonify({
        "total_patients": total_patients or 0,
        "today_appointments": today_count,
        "pending_requests": pending_requests,
        "active_assessments": 0 # Placeholder for now
    }), 200

@doctor_bp.route("/patients", methods=["GET"])
@jwt_required()
def get_doctor_patients():
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    
    # A patient belongs to a doctor if they have an Approved or Completed appointment
    patient_ids = db.session.query(Appointment.patient_id).filter(
        Appointment.doctor_id == current_user_id,
        Appointment.status.in_(['Approved', 'Completed'])
    ).distinct().all()
    
    patient_ids = [pid[0] for pid in patient_ids]
    
    if not patient_ids:
        return jsonify([]), 200

    patients_data = []
    now = datetime.now()

    for pid in patient_ids:
        patient_user = User.query.get(pid)
        if not patient_user:
            continue
        
        # Fetch Last Visit (Completed or past Approved)
        last_visit = Appointment.query.filter(
            Appointment.patient_id == pid,
            Appointment.doctor_id == current_user_id,
            Appointment.status.in_(['Completed', 'Approved']),
            or_(
                Appointment.appointment_date < now.date(),
                and_(Appointment.appointment_date == now.date(), Appointment.appointment_time <= now.time())
            )
        ).order_by(desc(Appointment.appointment_date), desc(Appointment.appointment_time)).first()

        # Fetch Next Visit (Upcoming Approved)
        next_visit = Appointment.query.filter(
            Appointment.patient_id == pid,
            Appointment.doctor_id == current_user_id,
            Appointment.status == 'Approved',
            or_(
                Appointment.appointment_date > now.date(),
                and_(Appointment.appointment_date == now.date(), Appointment.appointment_time > now.time())
            )
        ).order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc()).first()

        patients_data.append({
            "id": pid,
            "full_name": patient_user.full_name,
            "email": patient_user.email,
            "patient_image": patient_user.patient_profile.profile_image if patient_user.patient_profile else None,
            "last_visit": str(last_visit.appointment_date) if last_visit else None,
            "next_appointment": str(next_visit.appointment_date) if next_visit else None,
            "status": "Active" if next_visit else "Inactive"
        })

    return jsonify(patients_data), 200

@doctor_bp.route("/patients/<int:patient_id>/records", methods=["GET"])
@jwt_required()
def get_patient_records(patient_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    # Check if the doctor has (or had) an appointment with this patient
    current_user_id = int(get_jwt_identity())
    exists = Appointment.query.filter_by(doctor_id=current_user_id, patient_id=patient_id).first()
    
    if not exists:
        return jsonify({"message": "Access denied. No clinical relationship found."}), 403
        
    records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
    return jsonify([r.to_dict() for r in records]), 200

@doctor_bp.route("/appointments/<int:appointment_id>/no-show", methods=["PATCH"])
@jwt_required()
def mark_no_show(appointment_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=current_user_id).first()
    
    if not appointment:
        return jsonify({"message": "Appointment not found"}), 404
        
    appointment.status = "No-Show"
    db.session.commit()
    
    return jsonify({"message": "Appointment marked as No-Show"}), 200

@doctor_bp.route("/patients/<int:patient_id>/dossier", methods=["GET"])
@jwt_required()
def get_patient_clinical_dossier(patient_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    
    # 1. Fetch Patient Identity
    patient_user = User.query.get(patient_id)
    if not patient_user:
        return jsonify({"message": "Patient not found"}), 404
    
    # Check for clinical relationship (at least one appointment)
    exists = Appointment.query.filter_by(doctor_id=current_user_id, patient_id=patient_id).first()
    if not exists:
        return jsonify({"message": "Access denied. No clinical relationship found."}), 403

    # 2. Fetch Clinical Timeline (All except Pending)
    history = Appointment.query.filter(
        Appointment.doctor_id == current_user_id,
        Appointment.patient_id == patient_id,
        Appointment.status != "Pending"
    ).order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()

    profile = patient_user.patient_profile
    
    dossier = {
        "identity": {
            "id": patient_user.id,
            "full_name": patient_user.full_name,
            "email": patient_user.email,
            "phone": profile.phone if profile else "N/A",
            "gender": profile.gender if profile else "Not Specified",
            "dob": str(profile.date_of_birth) if profile and profile.date_of_birth else "N/A",
            "profile_image": profile.profile_image if profile else None,
            "blood_group": profile.blood_group if profile else "N/A",
            "allergies": profile.allergies if profile else "None",
            "chronic_conditions": profile.chronic_conditions if profile else "None"
        },
        "timeline": [appt.to_dict() for appt in history]
    }
    
    return jsonify(dossier), 200

@doctor_bp.route("/patients/<int:patient_id>/remarks", methods=["POST"])
@jwt_required()
def save_clinical_remark(patient_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    data = request.json
    
    if not data or 'content' not in data:
        return jsonify({"message": "Remark content is required"}), 400
        
    remark = ClinicalRemark(
        patient_id=patient_id,
        doctor_id=current_user_id,
        content=data['content']
    )
    
    db.session.add(remark)
    db.session.commit()
    
    return jsonify({"message": "Clinical remark saved successfully", "remark": remark.to_dict()}), 201

@doctor_bp.route("/patients/<int:patient_id>/remarks", methods=["GET"])
@jwt_required()
def get_clinical_remarks(patient_id):
    if not check_doctor_role():
        return jsonify({"message": "Doctor access required"}), 403
    
    current_user_id = int(get_jwt_identity())
    
    # Verify clinical relationship (or just fetch remarks specifically from this doctor for this patient)
    remarks = ClinicalRemark.query.filter_by(
        patient_id=patient_id, 
        doctor_id=current_user_id
    ).order_by(ClinicalRemark.created_at.desc()).all()
    
    return jsonify([r.to_dict() for r in remarks]), 200
