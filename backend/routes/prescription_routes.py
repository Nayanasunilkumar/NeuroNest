from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.models import db, User, Appointment
from models.prescription_models import Prescription, PrescriptionItem
from datetime import datetime, timedelta

prescriptions_bp = Blueprint("prescriptions", __name__)

# =======================================================
# 1. CREATE PRESCRIPTION (Doctor Only)
# =======================================================
@prescriptions_bp.route("/", methods=["POST"])
@jwt_required()
def create_prescription():
    try:
        current_user_id = int(get_jwt_identity())
        claims = get_jwt()
        role = claims.get("role")

        if role != "doctor":
            return jsonify({"message": "Access denied. Doctors only."}), 403

        data = request.get_json()

        # Extract Data
        patient_id = data.get("patient_id")
        appointment_id = data.get("appointment_id")
        diagnosis = data.get("diagnosis")
        notes = data.get("notes")
        items = data.get("items", []) # List of medicines
        valid_until = data.get("valid_until")

        # Validation
        if not patient_id or not diagnosis:
            return jsonify({"message": "Patient ID and Diagnosis are required"}), 400

        if not items or len(items) == 0:
            return jsonify({"message": "At least one medicine is required"}), 400

        initial_status = data.get("status", "active")
        if initial_status not in ["active", "draft"]:
            initial_status = "active"

        # Create Prescription
        new_prescription = Prescription(
            doctor_id=current_user_id,
            patient_id=patient_id,
            appointment_id=appointment_id,
            diagnosis=diagnosis,
            notes=notes,
            status=initial_status,
            valid_until=datetime.strptime(valid_until, "%Y-%m-%d").date() if valid_until else (datetime.utcnow().date() + timedelta(days=30))
        )

        db.session.add(new_prescription)
        db.session.flush() # Get ID

        # Add Items
        for item in items:
            med = PrescriptionItem(
                prescription_id=new_prescription.id,
                medicine_name=item["medicine_name"],
                dosage=item["dosage"],
                frequency=item["frequency"],
                duration=item["duration"],
                instructions=item.get("instructions", "")
            )
            db.session.add(med)

        db.session.commit()

        return jsonify({
            "message": "Prescription created successfully",
            "prescription": new_prescription.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc()) # Log to terminal
        return jsonify({"message": f"Internal Server Error: {str(e)}"}), 500


# =======================================================
# 2. GET DOCTOR'S PRESCRIPTIONS
# =======================================================
@prescriptions_bp.route("/doctor", methods=["GET"])
@jwt_required()
def get_doctor_prescriptions():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    if claims.get("role") != "doctor":
        return jsonify({"message": "Access denied"}), 403

    prescriptions = Prescription.query.filter_by(doctor_id=current_user_id).order_by(Prescription.created_at.desc()).all()
    
    # Enrich with patient name?
    results = []
    for p in prescriptions:
        p_dict = p.to_dict()
        patient = User.query.get(p.patient_id)
        p_dict["patient_name"] = patient.full_name if patient else "Unknown"
        results.append(p_dict)

    return jsonify(results), 200


# =======================================================
# 2.5 GET PRESCRIPTIONS FOR SPECIFIC PATIENT (Doctor View)
# =======================================================
@prescriptions_bp.route("/doctor/patient/<int:patient_id>", methods=["GET"])
@jwt_required()
def get_patient_prescriptions_doctor_view(patient_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    if claims.get("role") != "doctor":
        return jsonify({"message": "Access denied"}), 403

    prescriptions = Prescription.query.filter_by(patient_id=patient_id).order_by(Prescription.created_at.desc()).all()
    
    results = []
    for p in prescriptions:
        p_dict = p.to_dict()
        # Add doctor name if needed (though current user is the doctor?)
        # Wait, patient might have prescriptions from OTHER doctors too?
        # A doctor should be able to see ALL prescriptions for the patient? Or only their own?
        # Usually full history.
        doctor = User.query.get(p.doctor_id)
        p_dict["doctor_name"] = doctor.full_name if doctor else "Unknown"
        results.append(p_dict)

    return jsonify(results), 200


# =======================================================
# 3. GET PATIENT'S PRESCRIPTIONS
# =======================================================
@prescriptions_bp.route("/patient", methods=["GET"])
@jwt_required()
def get_patient_prescriptions():
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "patient":
        return jsonify({"message": "Access denied"}), 403

    # Filter out drafts — patients should not see draft prescriptions
    prescriptions = Prescription.query.filter(
        Prescription.patient_id == current_user_id,
        Prescription.status != 'draft'
    ).order_by(Prescription.created_at.desc()).all()
    
    # Enrich with doctor name
    results = []
    for p in prescriptions:
        p_dict = p.to_dict()
        doctor = User.query.get(p.doctor_id)
        p_dict["doctor_name"] = doctor.full_name if doctor else "Unknown"
        results.append(p_dict)

    return jsonify(results), 200


# =======================================================
# 4. GET SINGLE PRESCRIPTION DETAILS
# =======================================================
@prescriptions_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_prescription_details(id):
    current_user_id = get_jwt_identity()
    prescription = Prescription.query.get_or_404(id)

    # Access Check: Must be Doctor (owner) or Patient (recipient)
    if str(prescription.doctor_id) != str(current_user_id) and str(prescription.patient_id) != str(current_user_id):
        return jsonify({"message": "Access denied"}), 403

    data = prescription.to_dict()
    
    # Add names
    doctor = User.query.get(prescription.doctor_id)
    patient = User.query.get(prescription.patient_id)
    
    data["doctor_name"] = doctor.full_name if doctor else "Unknown"
    data["patient_name"] = patient.full_name if patient else "Unknown"

    return jsonify(data), 200


# =======================================================
# 5. UPDATE STATUS (Doctor Only)
# =======================================================
@prescriptions_bp.route("/<int:id>/status", methods=["PUT"])
@jwt_required()
def update_status(id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "doctor":
        return jsonify({"message": "Access denied"}), 403

    prescription = Prescription.query.get_or_404(id)

    if str(prescription.doctor_id) != str(current_user_id):
        return jsonify({"message": "Access denied. Not your prescription."}), 403

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["active", "expired", "cancelled"]:
        return jsonify({"message": "Invalid status"}), 400

    prescription.status = new_status
    db.session.commit()

    return jsonify({"message": "Status updated successfully", "status": new_status}), 200


# =======================================================
# 5.5 UPDATE FULL PRESCRIPTION (Doctor Only)
# =======================================================
@prescriptions_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_prescription(id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "doctor":
        return jsonify({"message": "Access denied"}), 403

    prescription = Prescription.query.get_or_404(id)

    if str(prescription.doctor_id) != str(current_user_id):
        return jsonify({"message": "Access denied. Not your prescription."}), 403

    data = request.get_json()

    # Update Fields
    if "diagnosis" in data:
        prescription.diagnosis = data["diagnosis"]
    if "notes" in data:
        prescription.notes = data["notes"]
    if "valid_until" in data and data["valid_until"]:
        prescription.valid_until = datetime.strptime(data["valid_until"], "%Y-%m-%d").date()

    # Update Items (if provided) implementation: Replace All
    if "items" in data:
        # Delete existing
        PrescriptionItem.query.filter_by(prescription_id=id).delete()
        
        # Add new
        for item in data["items"]:
            med = PrescriptionItem(
                prescription_id=id,
                medicine_name=item["medicine_name"],
                dosage=item["dosage"],
                frequency=item["frequency"],
                duration=item["duration"],
                instructions=item.get("instructions", "")
            )
            db.session.add(med)

    db.session.commit()

    return jsonify({
        "message": "Prescription updated successfully",
        "prescription": prescription.to_dict()
    }), 200


# =======================================================
# 6. DELETE PRESCRIPTION (Doctor Only)
# =======================================================
@prescriptions_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_prescription(id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "doctor":
        return jsonify({"message": "Access denied"}), 403

    prescription = Prescription.query.get_or_404(id)

    if str(prescription.doctor_id) != str(current_user_id):
         return jsonify({"message": "Access denied. Not your prescription."}), 403

    db.session.delete(prescription)
    db.session.commit()

    return jsonify({"message": "Prescription deleted successfully"}), 200
