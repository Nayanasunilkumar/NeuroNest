from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import (
    db, User, DoctorProfile, Appointment, ClinicalRemark,
    AppointmentSlot, DoctorScheduleSetting, InAppNotification,
    MedicalRecord, PatientProfile, EmergencyContact
)
from models.audit_models import (
    DoctorStatusLog, DoctorAuditLog, 
    PatientStatusLog, PatientAuditLog, PatientFlag
)
from models.chat_models import Participant, Message
from models.prescription_models import Prescription
from datetime import datetime
from utils.security import hash_password

admin_doctors_bp = Blueprint("admin_doctors", __name__)

def admin_required(fn):
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
# 1. GET ALL DOCTORS (Listing + Filter)
# -----------------------------------------------------------------
@admin_doctors_bp.route("/", methods=["GET"])
@admin_required
def get_doctors():
    search_query = request.args.get("search", "").strip()
    status_filter = request.args.get("status", "")
    sector_filter = request.args.get("sector", "")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    
    query = User.query.filter(User.role == "doctor")
    
    if search_query:
        query = query.filter(
            (User.full_name.ilike(f"%{search_query}%")) | 
            (User.email.ilike(f"%{search_query}%"))
        )
        
    if status_filter:
        query = query.filter(User.account_status == status_filter.lower())

    if sector_filter:
        query = query.join(DoctorProfile).filter(DoctorProfile.sector == sector_filter)
        
    # Calculate global stats (for the whole roster, not just current page)
    total_all = User.query.filter(User.role == "doctor").count()
    verified_count = User.query.filter(User.role == "doctor", User.is_verified == True).count()
    pending_count = User.query.filter(User.role == "doctor", User.is_verified == False).count()
    active_count = User.query.filter(User.role == "doctor", User.account_status == "active").count()

    paginated = query.paginate(page=page, per_page=limit)
    
    doctors_data = []
    for user in paginated.items:
        profile = user.doctor_profile
        doctors_data.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "account_status": user.account_status,
            "is_verified": user.is_verified,
            "specialization": profile.specialization if profile else "N/A",
            "license_number": profile.license_number if profile else "N/A",
            "sector": profile.sector if profile else "North Sector",
            "created_at": str(profile.created_at) if profile else str(datetime.utcnow())
        })
        
    return jsonify({
        "doctors": doctors_data,
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page,
        "stats": {
            "total": total_all,
            "verified": verified_count,
            "pending": pending_count,
            "active": active_count
        }
    }), 200

# -----------------------------------------------------------------
# 2. CREATE NEW DOCTOR (Onboarding)
# -----------------------------------------------------------------
@admin_doctors_bp.route("/", methods=["POST"])
@admin_required
def add_doctor():
    data = request.json or {}
    email = data.get("email")
    full_name = data.get("full_name")
    password = data.get("password", "Doctor@123")
    specialization = data.get("specialization")
    license_number = data.get("license_number")
    sector = data.get("sector", "North Sector")
    
    if not email or not full_name or not specialization or not license_number:
        return jsonify({"error": "Missing required fields"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User with this email already exists"}), 409
        
    # Create User
    new_user = User(
        email=email.lower(),
        password_hash=hash_password(password),
        role="doctor",
        full_name=full_name,
        account_status="active"
    )
    db.session.add(new_user)
    db.session.flush()
    
    # Create Profile
    new_profile = DoctorProfile(
        user_id=new_user.id,
        specialization=specialization,
        license_number=license_number,
        sector=sector,
        consultation_fee=500 # Default fee
    )
    db.session.add(new_profile)
    
    # Log Audit
    admin_id = get_jwt_identity()
    audit = DoctorAuditLog(
        doctor_id=new_user.id,
        actor_id=admin_id,
        action_type="onboarding",
        description=f"Initial onboarding by Admin. Specialty: {specialization}",
        ip_address=request.remote_addr,
        user_agent=str(request.user_agent)
    )
    db.session.add(audit)
    
    db.session.commit()
    
    return jsonify({"message": "Doctor provisioned successfully", "doctor_id": new_user.id}), 201

# -----------------------------------------------------------------
# 3. GET SINGLE DOCTOR (Detail Profile)
# -----------------------------------------------------------------
@admin_doctors_bp.route("/<int:doctor_id>", methods=["GET"])
@admin_required
def get_doctor_detail(doctor_id):
    user = User.query.get_or_404(doctor_id)
    if user.role != "doctor":
        return jsonify({"error": "Unauthorized profile access"}), 403
    
    profile = user.doctor_profile
    
    # Get audit history for this doctor
    audit_logs = DoctorAuditLog.query.filter_by(doctor_id=doctor_id).order_by(DoctorAuditLog.created_at.desc()).limit(10).all()
    logs_data = []
    for log in audit_logs:
        logs_data.append({
            "id": log.id,
            "action": log.action_type,
            "description": log.description,
            "timestamp": str(log.created_at)
        })

    return jsonify({
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "account_status": user.account_status,
        "is_verified": user.is_verified,
        "specialization": profile.specialization if profile else "N/A",
        "license_number": profile.license_number if profile else "N/A",
        "bio": profile.bio if profile else "",
        "consultation_fee": profile.consultation_fee if profile else 0,
        "created_at": str(profile.created_at) if profile else str(user.created_at),
        "audit_logs": logs_data
    }), 200

# -----------------------------------------------------------------
# 3. VERIFY DOCTOR LICENSE
# -----------------------------------------------------------------
@admin_doctors_bp.route("/<int:doctor_id>/verify", methods=["PATCH"])
@admin_required
def verify_doctor(doctor_id):
    user = User.query.get_or_404(doctor_id)
    if user.role != "doctor":
        return jsonify({"error": "User is not a doctor"}), 400
        
    # Toggle verification based on query param or just set it
    # For now, let's support a boolean toggle or default to True
    status = request.args.get("status", "true").lower() == "true"
    user.is_verified = status
    
    # Audit
    admin_id = get_jwt_identity()
    audit = DoctorAuditLog(
        doctor_id=doctor_id,
        actor_id=admin_id,
        action_type="license_verified" if status else "license_revoked",
        description="Medical license successfully verified." if status else "Clinical credentials revoked by Senior Admin.",
        ip_address=request.remote_addr,
        user_agent=str(request.user_agent)
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({"message": f"Doctor verification status: {status}"}), 200

# -----------------------------------------------------------------
# 4. UPDATE STATUS
# -----------------------------------------------------------------
@admin_doctors_bp.route("/<int:doctor_id>/status", methods=["PATCH"])
@admin_required
def update_doctor_status(doctor_id):
    data = request.json or {}
    new_status = data.get("status")
    reason = data.get("reason", "No reason provided")
    
    user = User.query.get_or_404(doctor_id)
    admin_id = get_jwt_identity()
    
    prev_status = user.account_status
    user.account_status = new_status
    
    # Log status change
    log = DoctorStatusLog(
        doctor_id=doctor_id,
        admin_id=admin_id,
        previous_status=prev_status,
        new_status=new_status,
        reason=reason
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"message": f"Doctor status changed to {new_status}"}), 200

# -----------------------------------------------------------------
# 5. TERMINATE RECORD (Delete)
# -----------------------------------------------------------------
@admin_doctors_bp.route("/<int:doctor_id>", methods=["DELETE"])
@admin_required
def delete_doctor(doctor_id):
    user = User.query.get_or_404(doctor_id)
    if user.role != "doctor":
        return jsonify({"error": "Unauthorized record deletion"}), 400
    
    # To facilitate terminal deletion, we must clear all dependent governance logs
    # and clinical metadata that reference this specialist's ID.
    try:
        # 1. Clear Specialist-Specific Governance Intelligence
        DoctorStatusLog.query.filter_by(doctor_id=doctor_id).delete()
        DoctorAuditLog.query.filter_by(doctor_id=doctor_id).delete()
        ClinicalRemark.query.filter_by(doctor_id=doctor_id).delete()
        ClinicalRemark.query.filter_by(patient_id=doctor_id).delete()
        
        # 2. Clear Patient-Side Governance (if doctor has a patient profile)
        PatientStatusLog.query.filter_by(patient_id=doctor_id).delete()
        PatientAuditLog.query.filter_by(patient_id=doctor_id).delete()
        PatientFlag.query.filter_by(patient_id=doctor_id).delete()
        PatientFlag.query.filter_by(reporter_id=doctor_id).delete()
        PatientFlag.query.filter_by(resolved_by=doctor_id).delete()

        # 3. Clear Communication & Alerts
        Message.query.filter_by(sender_id=doctor_id).delete()
        Participant.query.filter_by(user_id=doctor_id).delete()
        InAppNotification.query.filter_by(user_id=doctor_id).delete()

        # 4. Clear Scheduling & Prescription Artifacts
        AppointmentSlot.query.filter_by(doctor_user_id=doctor_id).delete()
        AppointmentSlot.query.filter_by(held_by_patient_id=doctor_id).delete()
        DoctorScheduleSetting.query.filter_by(doctor_user_id=doctor_id).delete()
        Prescription.query.filter_by(doctor_id=doctor_id).delete()
        Prescription.query.filter_by(patient_id=doctor_id).delete()

        # 5. Clear Medical Records & Appointments
        # We find appointments first to clear associated medical records
        doc_appointments = Appointment.query.filter((Appointment.doctor_id == doctor_id) | (Appointment.patient_id == doctor_id)).all()
        doc_appointment_ids = [a.id for a in doc_appointments]
        
        if doc_appointment_ids:
            MedicalRecord.query.filter(MedicalRecord.appointment_id.in_(doc_appointment_ids)).delete(synchronize_session=False)
        
        MedicalRecord.query.filter_by(patient_id=doctor_id).delete()
        Appointment.query.filter((Appointment.doctor_id == doctor_id) | (Appointment.patient_id == doctor_id)).delete(synchronize_session=False)

        # 6. Clear Regional Patient Metadata (Emergency Contacts, etc.)
        if user.patient_profile:
            EmergencyContact.query.filter_by(patient_id=user.patient_profile.id).delete()
            db.session.delete(user.patient_profile)

        # 7. Final Specialist Profile & Core Identity Decommissioning
        if user.doctor_profile:
            db.session.delete(user.doctor_profile)
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"message": "Provider record decommissioned and all clinical/governance states purged."}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database constraint violation or execution error: {str(e)}"}), 500

# -----------------------------------------------------------------
# 5. GET SPECIALTIES LIST
# -----------------------------------------------------------------
@admin_doctors_bp.route("/specialties", methods=["GET"])
@jwt_required()
def get_specialties():
    # Fetch unique specialities from existing profiles
    existing_specialties = db.session.query(DoctorProfile.specialization).distinct().all()
    specialties_list = [s[0] for s in existing_specialties if s[0]]
    
    # Comprehensive list of medical specialties
    defaults = [
        "Neurologist", "Neurosurgeon", "Psychiatrist", "Neuropsychologist",
        "Neuroradiologist", "Pediatric Neurologist", "Clinical Neurophysiologist",
        "Pain Management Specialist", "Physical Medicine & Rehab",
        "Neuro-Oncologist", "Neuro-Ophthalmologist", "Cognitive Scientist",
        "Clinical Researcher", "Anesthesiologist", "Cardiologist",
        "Dermatologist", "Emergency Physician", "Endocrinologist",
        "Family Physician", "Gastroenterologist", "General Surgeon",
        "Hematologist", "Infectious Disease Specialist", "Internal Medicine",
        "Medical Geneticist", "Nephrologist", "Obstetrician", "Gynecologist",
        "Oncologist", "Ophthalmologist", "Orthopedic Surgeon",
        "Otolaryngologist (ENT)", "Pathologist", "Pediatrician",
        "Plastic Surgeon", "Preventive Medicine", "Pulmonologist",
        "Radiologist", "Rheumatologist", "Urologist"
    ]
    
    unique_specialties = sorted(list(set(specialties_list + defaults)))
    
    return jsonify({"specialties": unique_specialties}), 200
