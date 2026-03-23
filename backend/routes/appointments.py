from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from database.models import (
    Appointment,
    AppointmentSlot,
    DoctorProfile,
    User,
    db,
)
from utils.slot_engine import (
    find_slot_for_legacy_time,
    generate_slots_for_doctor,
    get_or_create_schedule_setting,
    rolling_window_bounds,
    release_expired_holds,
)
from services.slot_lifecycle_service import (
    apply_cancellation_policy,
    mark_slot_available,
    mark_slot_booked,
    mark_slot_held,
)
from services.notification_service import NotificationService
from services.appointment_call_service import (
    ensure_join_windows,
    evaluate_call_state,
    send_system_chat_message,
    sync_call_status,
)

appointments_bp = Blueprint("appointments", __name__)

@appointments_bp.route("/test-email", methods=["GET"])
def test_email_appointments():
    from services.notification_service import NotificationService
    recipient = "nayanasunilkumar8@gmail.com"
    subject = "NeuroNest Diagnostic (Appt Route)"
    body = "If you are reading this, your Render SMTP configuration is working perfectly via Appointments route!"
    
    success = NotificationService.send_email(recipient, subject, body)
    if success:
        return {"status": "success", "message": f"Test email sent to {recipient}."}, 200
    else:
        return {"status": "error", "message": "Failed to send email. Check Render logs."}, 500


def _is_patient():
    return get_jwt().get("role") == "patient"


def _utc_now():
    return datetime.now(timezone.utc)


def _appointment_status_for_mode(mode: str) -> str:
    return "approved" if mode == "auto_confirm" else "pending"


def _reset_call_lifecycle(appointment: Appointment):
    appointment.patient_joined_at = None
    appointment.doctor_joined_at = None
    appointment.call_started_at = None
    appointment.call_status = "scheduled"
    appointment.reminder_30_sent_at = None
    appointment.reminder_10_sent_at = None
    appointment.popup_shown_at = None
    appointment.missed_notified_at = None
    ensure_join_windows(appointment)


def _lock_slot(slot_id: int):
    return (
        AppointmentSlot.query.filter_by(id=slot_id)
        .with_for_update()
        .first()
    )


def _book_slot_atomic(*, current_user_id: int, doctor_id: int, slot_id: int, reason: str, notes: str, priority_level: str = "routine", consultation_type: str = "in_person"):
    now_utc = _utc_now()
    setting = get_or_create_schedule_setting(doctor_id)
    if not setting.accepting_new_bookings:
        return None, "Doctor is not accepting new appointments currently", 409
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

    booking_mode = setting.approval_mode

    slot_start_utc = slot.slot_start_utc
    if slot_start_utc.tzinfo is None:
        slot_start_utc = slot_start_utc.replace(tzinfo=timezone.utc)
    slot_local_dt = slot_start_utc.astimezone(ZoneInfo(setting.timezone or "Asia/Kolkata"))

    appointment = Appointment(
        patient_id=current_user_id,
        doctor_id=doctor_id,
        appointment_date=slot_local_dt.date(),
        appointment_time=slot_local_dt.time().replace(microsecond=0),
        slot_id=slot.id,
        reason=reason,
        notes=notes,
        priority_level=priority_level,
        consultation_type=consultation_type,
        status=_appointment_status_for_mode(booking_mode),
        booking_mode=booking_mode,
    )
    _reset_call_lifecycle(appointment)
    db.session.add(appointment)
    db.session.flush()

    if booking_mode == "doctor_approval":
        mark_slot_held(
            slot=slot,
            patient_id=current_user_id,
            hold_minutes=5,
            actor_user_id=current_user_id,
            source="patient_booking",
            reason="Patient selected slot; temporary soft-lock",
        )
        slot.booked_appointment_id = appointment.id
    else:
        mark_slot_booked(
            slot=slot,
            appointment_id=appointment.id,
            actor_user_id=current_user_id,
            source="patient_booking",
            reason="Auto-confirm booking",
        )

    # NOTE: notification is fired by the caller AFTER db.session.commit()
    return appointment, None, None


@appointments_bp.route("/debug-doctors", methods=["GET"])
def debug_doctors():
    from database.models import User, DoctorProfile, DoctorPrivacySetting
    data = db.session.query(User, DoctorPrivacySetting).join(DoctorPrivacySetting, User.id == DoctorPrivacySetting.doctor_user_id, isouter=True).filter(User.role == "doctor").all()
    res = []
    for u, p in data:
        res.append({
            "id": u.id,
            "name": u.full_name,
            "privacy_exists": p is not None,
            "show_profile_publicly": p.show_profile_publicly if p else "N/A"
        })
    return jsonify(res)

@appointments_bp.route("/ping-v10-test", methods=["GET"])
def ping_v10_test():
    return jsonify({"status": "V10 LIVE", "msg": "I AM RUNNING THE LATEST CODE"}), 200

@appointments_bp.route("/doctors", methods=["GET"])
@jwt_required()
def get_all_doctors():
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        from database.models import User, DoctorProfile, DoctorPrivacySetting, DoctorConsultationSetting

        # Use and outer join to get everything in one query. This is more efficient and reliable.
        doctors_data = (
            db.session.query(User, DoctorProfile, DoctorPrivacySetting, DoctorConsultationSetting)
            .join(DoctorProfile, User.id == DoctorProfile.user_id)
            .outerjoin(DoctorPrivacySetting, User.id == DoctorPrivacySetting.doctor_user_id)
            .outerjoin(DoctorConsultationSetting, User.id == DoctorConsultationSetting.doctor_user_id)
            .filter(User.role == "doctor")
            .all()
        )

        result = []
        for user, profile, privacy, consultation in doctors_data:
            # ENFORCE PRIVACY: Hide doctor if show_profile_publicly is False.
            # Default to visible (True) if no privacy setting record exists or is None.
            raw_visibility = getattr(privacy, 'show_profile_publicly', True)
            is_visible = True if raw_visibility is None else bool(raw_visibility)
            
            # DEBUG: Print to logs to see what's happening
            print(f"[DEBUG_SCAN] Found Doctor: {user.full_name}, ID: {user.id}, Email: {user.email}, Visibility: {is_visible}")
            
            if not is_visible:
                print(f"[PRIVACY ENFORCED] Hiding doctor {user.id} ({user.full_name}) from patient search")
                continue
            
            # Enforce Consultation Setting details (Fee)
            actual_fee = (consultation.consultation_fee if (consultation and consultation.consultation_fee is not None) 
                         else (profile.consultation_fee or 500.0))
            
            # If the doctor wants to hide the fee, we set it to None
            if privacy and privacy.show_consultation_fee is False:
                actual_fee = None
            
            result.append(
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "specialization": profile.specialization or "General Physician",
                    "consultation_mode": (consultation.consultation_mode if consultation and consultation.consultation_mode 
                                         else (profile.consultation_mode or "Both")),
                    "consultation_fee": actual_fee,
                    "debug_visibility": is_visible,
                    "debug_raw_privacy": raw_visibility
                }
            )

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/doctors/<int:doctor_id>/profile", methods=["GET"])
@jwt_required()
def get_doctor_public_profile(doctor_id):
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        from database.models import (
            User,
            DoctorProfile,
            DoctorPrivacySetting,
            DoctorConsultationSetting,
        )

        doctor_data = (
            db.session.query(User, DoctorProfile, DoctorPrivacySetting, DoctorConsultationSetting)
            .join(DoctorProfile, User.id == DoctorProfile.user_id)
            .outerjoin(DoctorPrivacySetting, User.id == DoctorPrivacySetting.doctor_user_id)
            .outerjoin(DoctorConsultationSetting, User.id == DoctorConsultationSetting.doctor_user_id)
            .filter(User.role == "doctor", User.id == doctor_id)
            .first()
        )

        if not doctor_data:
            return jsonify({"error": "Doctor not found"}), 404

        user, profile, privacy, consultation = doctor_data
        raw_visibility = getattr(privacy, "show_profile_publicly", True)
        is_visible = True if raw_visibility is None else bool(raw_visibility)
        if not is_visible:
            return jsonify({"error": "Doctor profile is not publicly available"}), 404

        consultation_fee = (
            consultation.consultation_fee
            if consultation and consultation.consultation_fee is not None
            else (profile.consultation_fee or 500.0)
        )
        if privacy and privacy.show_consultation_fee is False:
            consultation_fee = None

        return jsonify(
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "specialization": profile.specialization or "General Physician",
                "qualification": profile.qualification,
                "experience_years": profile.experience_years,
                "department": profile.department,
                "sector": profile.sector,
                "bio": profile.bio,
                "hospital_name": profile.hospital_name,
                "consultation_mode": (
                    consultation.consultation_mode
                    if consultation and consultation.consultation_mode
                    else (profile.consultation_mode or "Both")
                ),
                "consultation_fee": consultation_fee,
                "profile_image": profile.profile_image,
                "expertise_tags": [t.to_dict() for t in profile.expertise_tags],
                "experience": [e.to_dict() for e in profile.experience],
                "availability": [a.to_dict() for a in profile.availability],
            }
        ), 200
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
        window_start, window_end = rolling_window_bounds()
        if target_date < window_start or target_date > window_end:
            return jsonify({
                "slots": [],
                "accepting_new_bookings": True,
                "message": None,
            }), 200

        setting = get_or_create_schedule_setting(doctor_id)
        # Opportunistically ensure rolling-window slots exist.
        generate_slots_for_doctor(doctor_id, window_start, window_end)
        release_expired_holds(doctor_id)
        db.session.commit()

        if not setting.accepting_new_bookings:
            return jsonify({
                "slots": [],
                "accepting_new_bookings": False,
                "message": "Doctor is not accepting new appointments currently.",
            }), 200

        slots = (
            AppointmentSlot.query.filter(
                AppointmentSlot.doctor_user_id == doctor_id,
                AppointmentSlot.slot_date_local == target_date,
                AppointmentSlot.status == "available",
            )
            .order_by(AppointmentSlot.slot_start_utc.asc())
            .all()
        )

        return jsonify({
            "slots": [s.to_dict() for s in slots],
            "accepting_new_bookings": True,
            "message": None,
        }), 200
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

        # Extract core fields for slot booking (fix: doctor_id defined here to avoid NameError)
        doctor_id = data.get("doctor_id")
        slot_id = data.get("slot_id")
        reason = data.get("reason")
        notes = data.get("notes", "")
        priority_level = data.get("priority_level", "routine")
        consultation_type = data.get("consultation_type", "in_person")

        if not doctor_id or not slot_id or not reason:
            return jsonify({"error": "doctor_id, slot_id and reason are required"}), 400

        appointment, err_msg, err_code = _book_slot_atomic(
            current_user_id=current_user_id,
            doctor_id=int(doctor_id),
            slot_id=int(slot_id),
            reason=reason,
            notes=notes,
            priority_level=priority_level,
            consultation_type=consultation_type,
        )
        if err_msg:
            db.session.rollback()
            return jsonify({"error": err_msg}), err_code

        db.session.commit()
        # ── Trigger notifications (email + in-app) to doctor and patient ──
        try:
            NotificationService.notify_appointment_event(appointment.id, "new_booking")
        except Exception as notif_err:
            print(f"[NOTIFICATION] Warning: could not send notification: {notif_err}")
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
                priority_level=data.get("priority_level", "routine"),
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
            Appointment.status.in_(["pending", "approved", "completed", "no_show"]),
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
            priority_level=data.get("priority_level", "routine"),
            status="pending",
            booking_mode="doctor_approval",
        )
        _reset_call_lifecycle(new_appointment)

        db.session.add(new_appointment)
        db.session.flush() # ensure ID is generated
        NotificationService.notify_appointment_event(new_appointment.id, "new_booking")
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

        if appointment.status == "cancelled_by_patient":
            return jsonify({"message": "Appointment already cancelled"}), 200

        # Enforce the doctor's specific cancellation policy before proceeding
        from database.models import DoctorConsultationSetting
        consultation_setting = DoctorConsultationSetting.query.filter_by(doctor_user_id=appointment.doctor_id).first()
        policy_hours = consultation_setting.cancellation_policy_hours if consultation_setting and consultation_setting.cancellation_policy_hours is not None else 24

        if policy_hours > 0:
            from datetime import datetime, timedelta
            appt_datetime = datetime.combine(appointment.appointment_date, appointment.appointment_time)
            # Use naive now because appointment_date/time are naive
            now = datetime.now()
            time_difference = appt_datetime - now
            
            # If the appointment is in the past, or the time left is less than the policy cutoff
            if time_difference.total_seconds() < (policy_hours * 3600):
                return jsonify({"error": f"You cannot cancel this appointment. The doctor requires at least {policy_hours} hours' notice."}), 400

        appointment.status = "cancelled_by_patient"
        appointment.call_status = "completed"

        if appointment.slot_id:
            apply_cancellation_policy(
                appointment=appointment,
                cancelled_by="patient",
                actor_user_id=current_user_id,
                source="patient_cancel",
                reason="Patient cancelled appointment",
            )

        NotificationService.notify_appointment_event(appointment.id, "cancelled")
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

        # Save old date and time
        from datetime import datetime
        old_dt = datetime.combine(appointment.appointment_date, appointment.appointment_time)

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
                    mark_slot_available(
                        slot=old_slot,
                        actor_user_id=current_user_id,
                        source="patient_reschedule",
                        reason="Patient moved to a new slot",
                    )

            setting = get_or_create_schedule_setting(doctor_id)
            mode = setting.approval_mode
            slot_start_utc = slot.slot_start_utc
            if slot_start_utc.tzinfo is None:
                slot_start_utc = slot_start_utc.replace(tzinfo=timezone.utc)
            slot_local_dt = slot_start_utc.astimezone(ZoneInfo(setting.timezone or "Asia/Kolkata"))
            appointment.slot_id = slot.id
            appointment.appointment_date = slot_local_dt.date()
            appointment.appointment_time = slot_local_dt.time().replace(microsecond=0)
            appointment.status = _appointment_status_for_mode(mode)
            appointment.booking_mode = mode
            
            # Populate reschedule fields
            appointment.rescheduled_by = "patient"
            appointment.old_date_time = old_dt
            appointment.new_date_time = datetime.combine(slot_local_dt.date(), slot_local_dt.time().replace(microsecond=0))
            appointment.reschedule_reason = data.get("reason", "")
            appointment.reschedule_status = "Pending"
            _reset_call_lifecycle(appointment)

            if mode == "doctor_approval":
                mark_slot_held(
                    slot=slot,
                    patient_id=current_user_id,
                    hold_minutes=5,
                    actor_user_id=current_user_id,
                    source="patient_reschedule",
                    reason="Rescheduled slot soft-lock",
                )
                slot.booked_appointment_id = appointment.id
            else:
                mark_slot_booked(
                    slot=slot,
                    appointment_id=appointment.id,
                    actor_user_id=current_user_id,
                    source="patient_reschedule",
                    reason="Rescheduled slot confirmed",
                )
            NotificationService.notify_appointment_reschedule(appointment.id)
            db.session.commit()
            return jsonify({"message": "Appointment rescheduled successfully", "appointment": appointment.to_dict()}), 200

        # legacy fallback
        if "date" in data:
            appointment.appointment_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        if "time" in data:
            appointment.appointment_time = datetime.strptime(data["time"], "%H:%M").time()

        # Populate reschedule fields for legacy path
        appointment.rescheduled_by = "patient"
        appointment.old_date_time = old_dt
        if "date" in data and "time" in data:
            appointment.new_date_time = datetime.strptime(f"{data['date']} {data['time']}", "%Y-%m-%d %H:%M")
        appointment.reschedule_reason = data.get("reason", "")
        appointment.reschedule_status = "Pending"
        _reset_call_lifecycle(appointment)

        appointment.status = "pending"
        appointment.booking_mode = "doctor_approval"
        
        NotificationService.notify_appointment_reschedule(appointment.id)
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

@appointments_bp.route("/<int:id>/confirm-reschedule", methods=["POST"])
@jwt_required()
def confirm_reschedule(id):
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        appointment = Appointment.query.filter_by(id=id, patient_id=current_user_id).first()

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        if appointment.status != "rescheduled":
            return jsonify({"error": "Appointment is not in rescheduled state"}), 400

        # If doctor suggested it, we can auto-approve it once patient confirms
        appointment.status = "approved"
        NotificationService.notify_appointment_event(appointment.id, "approved")
        
        db.session.commit()
        return jsonify({"message": "Appointment confirmed successfully", "appointment": appointment.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/<int:id>/call-state", methods=["GET"])
@jwt_required()
def get_call_state(id):
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        appointment = Appointment.query.filter_by(id=id, patient_id=current_user_id).first()
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        if (appointment.consultation_type or "in_person") != "online":
            return jsonify({"error": "Call state is only available for online appointments"}), 400

        state, changed = sync_call_status(appointment)
        if changed:
            db.session.commit()

        payload = appointment.to_dict()
        payload["room_id"] = f"appointment-{appointment.id}"
        payload["join_available_at"] = (
            state["patient_join_time"].isoformat() + "Z" if state["patient_join_time"] else None
        )
        payload["patient_join_allowed"] = state["patient_can_join_now"]
        return jsonify(payload), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@appointments_bp.route("/<int:id>/join-call", methods=["POST"])
@jwt_required()
def patient_join_call(id):
    try:
        if not _is_patient():
            return jsonify({"error": "Patient access required"}), 403

        current_user_id = int(get_jwt_identity())
        appointment = Appointment.query.filter_by(id=id, patient_id=current_user_id).first()
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        if (appointment.consultation_type or "in_person") != "online":
            return jsonify({"error": "Only online appointments can be joined"}), 400

        if str(appointment.status).lower() not in {"approved", "rescheduled", "pending"}:
            return jsonify({"error": f"Cannot join a {appointment.status} appointment"}), 400

        now = datetime.now()
        ensure_join_windows(appointment)
        pre_state = evaluate_call_state(appointment, now=now)
        if not pre_state["patient_can_join_now"]:
            return jsonify(
                {
                    "error": "Join is not available yet",
                    "join_available_at": pre_state["patient_join_time"].isoformat() + "Z"
                    if pre_state["patient_join_time"]
                    else None,
                }
            ), 403

        joined_now = appointment.patient_joined_at is None
        if joined_now:
            appointment.patient_joined_at = now

        previous_status = (appointment.call_status or "scheduled").lower()
        state, changed = sync_call_status(appointment, now=now)
        started_now = state["status"] == "ongoing" and previous_status != "ongoing"

        if changed or joined_now:
            db.session.commit()

        if joined_now and not state["doctor_joined"]:
            send_system_chat_message(
                appointment,
                "System: Patient has joined the call and is waiting for you.",
                sender_id=appointment.patient_id,
            )
            NotificationService.send_in_app(
                user_id=appointment.doctor_id,
                title="Patient joined video appointment",
                message=f"{appointment.patient.full_name if appointment.patient else 'Patient'} has joined and is waiting.",
                notif_type="appointment",
                payload={"appointment_id": appointment.id, "event_type": "patient_joined"},
            )
            db.session.commit()

        if started_now:
            send_system_chat_message(
                appointment,
                "System: Video call started.",
                sender_id=appointment.doctor_id,
            )
            NotificationService.send_in_app(
                user_id=appointment.patient_id,
                title="Video call started",
                message=f"Your appointment with Dr. {appointment.doctor.full_name if appointment.doctor else 'Doctor'} is now live.",
                notif_type="appointment",
                payload={"appointment_id": appointment.id, "event_type": "call_started"},
            )
            NotificationService.send_in_app(
                user_id=appointment.doctor_id,
                title="Video call started",
                message=f"Your appointment with {appointment.patient.full_name if appointment.patient else 'patient'} is now live.",
                notif_type="appointment",
                payload={"appointment_id": appointment.id, "event_type": "call_started"},
            )
            db.session.commit()

        payload = appointment.to_dict()
        payload["room_id"] = f"appointment-{appointment.id}"
        payload["open_call"] = bool(state["both_joined"])
        payload["waiting_for"] = state["waiting_for"]
        return jsonify(payload), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
