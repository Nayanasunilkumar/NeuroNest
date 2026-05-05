from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, User, Appointment, DoctorProfile, ClinicalStructure
from datetime import datetime
from sqlalchemy import or_
from modules.doctor.services.slot_lifecycle_service import apply_cancellation_policy, mark_slot_booked

admin_appointments_bp = Blueprint("admin_appointments", __name__)

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

@admin_appointments_bp.route("/sectors", methods=["GET"])
@admin_required
def get_sectors():
    sectors = db.session.query(ClinicalStructure.sector).distinct().all()
    return jsonify([s[0] for s in sectors if s[0]]), 200

@admin_appointments_bp.route("/departments", methods=["GET"])
@admin_required
def get_departments():
    sector = request.args.get("sector")
    query = db.session.query(ClinicalStructure.specialty).distinct()
    if sector:
        query = query.filter(ClinicalStructure.sector == sector)
    departments = query.all()
    return jsonify([d[0] for d in departments if d[0]]), 200

@admin_appointments_bp.route("/doctors", methods=["GET"])
@admin_required
def get_doctors():
    sector = request.args.get("sector")
    department = request.args.get("department")
    
    query = db.session.query(User.id, User.full_name)\
        .join(DoctorProfile, User.id == DoctorProfile.user_id)\
        .filter(User.role == "doctor")
        
    if sector:
        query = query.filter(DoctorProfile.sector == sector)
    if department:
        query = query.filter(DoctorProfile.department == department)
        
    doctors = query.all()
    return jsonify([{"id": d.id, "full_name": d.full_name} for d in doctors]), 200

@admin_appointments_bp.route("/", methods=["GET"])
@admin_required
def get_all_appointments():
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "")
    sector = request.args.get("sector", "")
    department = request.args.get("department", "")
    doctor_id = request.args.get("doctor_id", "").strip()
    
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    
    # Sector + department define the clinical stream. Doctor is an optional narrowing filter.
    if not (sector and department):
        return jsonify({
            "appointments": [],
            "total": 0,
            "pages": 0,
            "current_page": page,
            "stats": {
                "total_today": 0,
                "upcoming": 0,
                "completed_today": 0,
                "cancelled_today": 0
            },
            "message": "Selection of Sector and Department is mandatory for clinical oversight."
        }), 200

    doc_id_int = None
    if doctor_id:
        try:
            doc_id_int = int(doctor_id)
        except (ValueError, TypeError):
            return jsonify({
                "appointments": [],
                "stats": None,
                "message": "Invalid Specialist Identity Signature."
            }), 400

    def scoped_query():
        query = Appointment.query.join(
            DoctorProfile, Appointment.doctor_id == DoctorProfile.user_id
        ).filter(
            DoctorProfile.sector == sector,
            DoctorProfile.department == department
        )
        if doc_id_int is not None:
            query = query.filter(Appointment.doctor_id == doc_id_int)
        return query

    query = scoped_query()
    
    # 🏷️ Filter by Status (Institutional Mapping)
    if status and status != 'all':
        internal_status = status.lower()
        if internal_status == 'cancelled':
            # Handle multi-state cancellations
            query = query.filter(Appointment.status.in_(['cancelled_by_patient', 'cancelled_by_doctor']))
        else:
            query = query.filter(Appointment.status == internal_status)
        
    # 🔍 Advanced Institutional Search (Patient + Doctor + ID Axis)
    if search:
        from sqlalchemy.orm import aliased
        PatientUser = aliased(User)
        DoctorUser = aliased(User)
        
        query = query.join(PatientUser, Appointment.patient_id == PatientUser.id) \
                     .join(DoctorUser, Appointment.doctor_id == DoctorUser.id) \
                     .filter(
            or_(
                # Patient Axis
                PatientUser.full_name.ilike(f"%{search}%"),
                PatientUser.email.ilike(f"%{search}%"),
                Appointment.patient_id.cast(db.String).ilike(f"%{search}%"),
                # Specialist Axis
                DoctorUser.full_name.ilike(f"%{search}%"),
                Appointment.doctor_id.cast(db.String).ilike(f"%{search}%"),
                # Record Axis
                Appointment.id.cast(db.String).ilike(f"%{search}%")
            )
        )
        
    # Temporal Ordering
    query = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
    
    paginated = query.paginate(page=page, per_page=limit)
    
    # 📊 Real-time Clinical Telemetry (Scoped to Filtered Doctor)
    today = datetime.utcnow().date()
    stats_base = scoped_query()
    
    total_today = stats_base.filter(Appointment.appointment_date == today).count()
    upcoming = stats_base.filter(
        Appointment.appointment_date >= today, 
        Appointment.status.in_(["pending", "approved"])
    ).count()
    completed_today = stats_base.filter(Appointment.appointment_date == today, Appointment.status == "completed").count()
    cancelled_today = stats_base.filter(
        Appointment.appointment_date == today, 
        Appointment.status.in_(["cancelled_by_patient", "cancelled_by_doctor"])
    ).count()
    
    # 📈 Performance Quick-View
    total_history = stats_base.count()
    completed_total = stats_base.filter(Appointment.status == "completed").count()
    cancelled_total = stats_base.filter(Appointment.status.in_(["cancelled_by_patient", "cancelled_by_doctor"])).count()
    
    completion_rate = round((completed_total / total_history * 100), 1) if total_history > 0 else 0
    cancellation_rate = round((cancelled_total / total_history * 100), 1) if total_history > 0 else 0
    
    appointments_data = []
    for app in paginated.items:
        d = app.to_dict()
        # Add a bit more context for admin
        d['patient_email'] = app.patient.email if app.patient else 'N/A'
        d['doctor_specialization'] = app.doctor.doctor_profile.specialization if app.doctor and app.doctor.doctor_profile else 'General'
        appointments_data.append(d)
        
    return jsonify({
        "appointments": appointments_data,
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page,
        "stats": {
            "total_today": total_today,
            "upcoming": upcoming,
            "completed_today": completed_today,
            "cancelled_today": cancelled_today,
            "completion_rate": completion_rate,
            "cancellation_rate": cancellation_rate
        }
    }), 200

@admin_appointments_bp.route("/<int:id>/status", methods=["PATCH"])
@admin_required
def update_appointment_status(id):
    data = request.json or {}
    new_status = data.get("status")
    notes = data.get("notes")
    
    # Map display status to institutional ENUM
    status_map = {
        "Pending": "pending",
        "Approved": "approved", 
        "Cancelled": "cancelled_by_doctor",
        "Completed": "completed",
        "No-show": "no_show"
    }
    
    internal_status = status_map.get(new_status)
    if not internal_status:
        return jsonify({"error": "Invalid status mapping Axis"}), 400
        
    appointment = Appointment.query.get_or_404(id)
    old_status = appointment.status
    
    # 🛡️ Governance: Log the change in notes if provided
    admin_id = get_jwt_identity()
    admin_user = User.query.get(admin_id)
    
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"\n[Governance Log {timestamp}] - {admin_user.full_name} (Admin) changed status from {old_status} to {new_status}."
    if notes:
        log_entry += f" Reason: {notes}"
        
    appointment.status = internal_status
    appointment.notes = (appointment.notes or "") + log_entry

    if internal_status == "approved" and appointment.slot_id:
        slot = appointment.slot
        if slot:
            mark_slot_booked(
                slot=slot,
                appointment_id=appointment.id,
                actor_user_id=admin_id,
                source="admin_status_update",
                reason="Admin approved appointment",
            )

    # 🏥 Slot Management: central lifecycle policy
    if internal_status in ["cancelled_by_doctor", "no_show"] and appointment.slot_id:
        cancelled_by = "doctor" if internal_status == "cancelled_by_doctor" else "no_show"
        apply_cancellation_policy(
            appointment=appointment,
            cancelled_by=cancelled_by,
            actor_user_id=admin_id,
            source="admin_status_update",
            reason=f"Admin transitioned appointment to {internal_status}",
        )
            
    db.session.commit()
    return jsonify({
        "message": f"Clinical oversight: Appointment status updated to {new_status}",
        "appointment_id": id
    }), 200
