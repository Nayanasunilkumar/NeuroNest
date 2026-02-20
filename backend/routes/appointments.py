from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from database.models import (
    Appointment,
    AppointmentSlot,
    DoctorProfile,
    DoctorScheduleSetting,
    InAppNotification,
    User,
    db,
)
from utils.slot_engine import (
    find_slot_for_legacy_time,
    generate_slots_for_doctor,
    get_or_create_schedule_setting,
    release_expired_holds,
)

appointments_bp = Blueprint("appointments", __name__)


def _is_patient():
    return get_jwt().get("role") == "patient"


def _utc_now():
    return datetime.now(timezone.utc)


def _appointment_status_for_mode(mode: str) -> str:
    return "Approved" if mode == "auto_confirm" else "Pending"


def _lock_slot(slot_id: int):
    return (
        AppointmentSlot.query.filter_by(id=slot_id)
        .with_for_update()
        .first()
    )


def _book_slot_atomic(*, current_user_id: int, doctor_id: int, slot_id: int, reason: str, notes: str):
    now_utc = _utc_now()
    release_expired_holds(doctor_id)

    slot = _lock_slot(slot_id)
    if not slot:
        return None, "Slot not found", 404

    if slot.doctor_user_id != doctor_id:
        return None, "Slot does not belong to selected doctor", 400

    if slot.slot_start_utc <= now_utc:
        return None, "Cannot book past slot", 400

    if slot.status != "available":
        return None, "Slot already booked", 409

    setting = get_or_create_schedule_setting(doctor_id)
    booking_mode = setting.approval_mode

    appointment = Appointment(
        patient_id=current_user_id,
        doctor_id=doctor_id,
        appointment_date=slot.slot_date_local,
        appointment_time=slot.slot_start_utc.time(),
        slot_id=slot.id,
        reason=reason,
        notes=notes,
        status=_appointment_status_for_mode(booking_mode),
        booking_mode=booking_mode,
    )
    db.session.add(appointment)
    db.session.flush()

    if booking_mode == "doctor_approval":
        slot.status = "held"
        slot.held_by_patient_id = current_user_id
        slot.held_until_utc = now_utc + timedelta(minutes=15)
    else:
        slot.status = "booked"

    slot.booked_appointment_id = appointment.id

    return appointment, None, None


@appointments_bp.route("/doctors", methods=["GET"])
@jwt_required()
def get_all_doctors():
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        doctors_query = (
            db.session.query(User, DoctorProfile)
            .join(DoctorProfile, User.id == DoctorProfile.user_id)
            .filter(User.role == "doctor")
            .all()
        )

        result = []
        for user, profile in doctors_query:
            result.append(
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "specialization": profile.specialization or "General Physician",
                }
            )

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/doctors/<int:doctor_id>/available-slots", methods=["GET"])
@jwt_required()
def get_available_slots(doctor_id):
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        date_str = request.args.get("date")
        if not date_str:
            return jsonify({"error": "date is required (YYYY-MM-DD)"}), 400

        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        # Opportunistically ensure slots exist for requested day.
        generate_slots_for_doctor(doctor_id, target_date, target_date)
        release_expired_holds(doctor_id)
        db.session.commit()

        slots = (
            AppointmentSlot.query.filter(
                AppointmentSlot.doctor_user_id == doctor_id,
                AppointmentSlot.slot_date_local == target_date,
                AppointmentSlot.status == "available",
            )
            .order_by(AppointmentSlot.slot_start_utc.asc())
            .all()
        )

        return jsonify([s.to_dict() for s in slots]), 200
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/book-by-slot", methods=["POST"])
@jwt_required()
def book_by_slot():
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        doctor_id = data.get("doctor_id")
        slot_id = data.get("slot_id")
        reason = data.get("reason")
        notes = data.get("notes", "")

        if not doctor_id or not slot_id or not reason:
            return jsonify({"error": "doctor_id, slot_id and reason are required"}), 400

        appointment, err_msg, err_code = _book_slot_atomic(
            current_user_id=current_user_id,
            doctor_id=int(doctor_id),
            slot_id=int(slot_id),
            reason=reason,
            notes=notes,
        )
        if err_msg:
            db.session.rollback()
            return jsonify({"error": err_msg}), err_code

        db.session.commit()
        return jsonify(appointment.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/", methods=["POST"])
@jwt_required()
def book_appointment():
    """
    Backward-compatible endpoint.
    If slot exists for date+time it uses slot booking atomically.
    Otherwise falls back to legacy appointment create (with conflict guard).
    """
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        required_fields = ["doctor_id", "date", "time", "reason"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        doctor_id = int(data["doctor_id"])
        appointment_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        appointment_time = datetime.strptime(data["time"], "%H:%M").time()

        slot = find_slot_for_legacy_time(doctor_id, appointment_date, appointment_time)
        if slot:
            appointment, err_msg, err_code = _book_slot_atomic(
                current_user_id=current_user_id,
                doctor_id=doctor_id,
                slot_id=slot.id,
                reason=data["reason"],
                notes=data.get("notes", ""),
            )
            if err_msg:
                db.session.rollback()
                return jsonify({"error": err_msg}), err_code

            db.session.commit()
            payload = appointment.to_dict()
            payload["deprecated"] = True
            payload["message"] = "Legacy endpoint used; slot-aware booking applied"
            return jsonify(payload), 201

        # legacy fallback with duplicate guard
        existing = Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == appointment_date,
            Appointment.appointment_time == appointment_time,
            Appointment.status.in_(["Pending", "Approved", "Completed", "No-Show"]),
        ).first()

        if existing:
            return jsonify({"error": "Slot already booked"}), 409

        new_appointment = Appointment(
            patient_id=current_user_id,
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            reason=data["reason"],
            notes=data.get("notes", ""),
            status="Pending",
            booking_mode="doctor_approval",
        )

        db.session.add(new_appointment)
        db.session.commit()

        payload = new_appointment.to_dict()
        payload["deprecated"] = True
        payload["message"] = "Legacy date/time booking path; migrate to /appointments/book-by-slot"
        return jsonify(payload), 201

    except ValueError:
        db.session.rollback()
        return jsonify({"error": "Invalid date/time format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/", methods=["GET"])
@jwt_required()
def get_appointments():
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        appointments = (
            Appointment.query.filter_by(patient_id=current_user_id)
            .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
            .all()
        )
        return jsonify([appt.to_dict() for appt in appointments]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/<int:id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_appointment(id):
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        appointment = Appointment.query.filter_by(id=id, patient_id=current_user_id).first()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        if appointment.status == "Cancelled":
            return jsonify({"message": "Appointment already cancelled"}), 200

        appointment.status = "Cancelled"

        if appointment.slot_id:
            slot = _lock_slot(appointment.slot_id)
            if slot and slot.booked_appointment_id == appointment.id:
                slot.status = "available"
                slot.held_by_patient_id = None
                slot.held_until_utc = None
                slot.booked_appointment_id = None

        db.session.commit()
        return jsonify({"message": "Appointment cancelled successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/<int:id>/reschedule", methods=["PUT"])
@jwt_required()
def reschedule_appointment(id):
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        appointment = Appointment.query.filter_by(id=id, patient_id=current_user_id).first()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        doctor_id = appointment.doctor_id

        target_slot = None
        if data.get("slot_id"):
            target_slot = AppointmentSlot.query.filter_by(
                id=int(data["slot_id"]),
                doctor_user_id=doctor_id,
            ).first()
        elif data.get("date") and data.get("time"):
            target_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            target_time = datetime.strptime(data["time"], "%H:%M").time()
            target_slot = find_slot_for_legacy_time(doctor_id, target_date, target_time)

        if target_slot:
            release_expired_holds(doctor_id)
            slot = _lock_slot(target_slot.id)
            if not slot or slot.status != "available":
                db.session.rollback()
                return jsonify({"error": "Slot already booked"}), 409

            if appointment.slot_id:
                old_slot = _lock_slot(appointment.slot_id)
                if old_slot and old_slot.booked_appointment_id == appointment.id:
                    old_slot.status = "available"
                    old_slot.held_by_patient_id = None
                    old_slot.held_until_utc = None
                    old_slot.booked_appointment_id = None

            setting = get_or_create_schedule_setting(doctor_id)
            mode = setting.approval_mode
            appointment.slot_id = slot.id
            appointment.appointment_date = slot.slot_date_local
            appointment.appointment_time = slot.slot_start_utc.time()
            appointment.status = _appointment_status_for_mode(mode)
            appointment.booking_mode = mode

            if mode == "doctor_approval":
                slot.status = "held"
                slot.held_by_patient_id = current_user_id
                slot.held_until_utc = _utc_now() + timedelta(minutes=15)
            else:
                slot.status = "booked"
                slot.held_by_patient_id = None
                slot.held_until_utc = None

            slot.booked_appointment_id = appointment.id
            db.session.commit()
            return jsonify({"message": "Appointment rescheduled successfully", "appointment": appointment.to_dict()}), 200

        # legacy fallback
        if "date" in data:
            appointment.appointment_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        if "time" in data:
            appointment.appointment_time = datetime.strptime(data["time"], "%H:%M").time()

        appointment.status = "Pending"
        appointment.booking_mode = "doctor_approval"
        db.session.commit()

        payload = {
            "message": "Appointment rescheduled via legacy path",
            "appointment": appointment.to_dict(),
            "deprecated": True,
        }
        return jsonify(payload), 200

    except ValueError:
        db.session.rollback()
        return jsonify({"error": "Invalid date/time format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
