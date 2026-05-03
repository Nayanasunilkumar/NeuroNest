from datetime import datetime, timedelta

from database.models import Appointment, db
from models.chat_models import Conversation, Message, Participant
from services.notification_service import NotificationService


VALID_CALL_STATUSES = {"scheduled", "waiting", "ongoing", "completed", "missed"}


from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

def appointment_datetime(appointment: Appointment):
    """Returns a timezone-aware UTC datetime for the appointment."""
    if not appointment:
        return None
        
    # Priority 1: Use the Slot's precise UTC start time if available
    if appointment.slot and appointment.slot.slot_start_utc:
        dt = appointment.slot.slot_start_utc
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    # Priority 2: Use the naive date/time fields (now strictly treated as UTC)
    if not appointment.appointment_date or not appointment.appointment_time:
        return None
        
    dt = datetime.combine(appointment.appointment_date, appointment.appointment_time)
    # Treat as UTC by default
    return dt.replace(tzinfo=timezone.utc)


def ensure_join_windows(appointment: Appointment):
    if not appointment:
        return False

    changed = False
    appt_dt = appointment_datetime(appointment)
    if not appt_dt:
        return False

    if appointment.join_enabled_patient_time is None:
        appointment.join_enabled_patient_time = appt_dt - timedelta(minutes=10)
        changed = True
    if appointment.join_enabled_doctor_time is None:
        appointment.join_enabled_doctor_time = appt_dt - timedelta(minutes=5)
        changed = True

    if (appointment.call_status or "").lower() not in VALID_CALL_STATUSES:
        appointment.call_status = "scheduled"
        changed = True

    return changed


def evaluate_call_state(appointment: Appointment, now=None):
    # Standardize on UTC for all internal logic
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    appt_dt = appointment_datetime(appointment)
    
    # Use UTC for join windows
    patient_join_time = appointment.join_enabled_patient_time
    if patient_join_time and patient_join_time.tzinfo is None:
        patient_join_time = patient_join_time.replace(tzinfo=timezone.utc)
        
    doctor_join_time = appointment.join_enabled_doctor_time
    if doctor_join_time and doctor_join_time.tzinfo is None:
        doctor_join_time = doctor_join_time.replace(tzinfo=timezone.utc)

    # Fallback to calculated windows if not set
    if not patient_join_time and appt_dt:
        patient_join_time = appt_dt - timedelta(minutes=10)
    if not doctor_join_time and appt_dt:
        doctor_join_time = appt_dt - timedelta(minutes=5)

    patient_joined = bool(appointment.patient_joined_at)
    doctor_joined = bool(appointment.doctor_joined_at)
    both_joined = patient_joined and doctor_joined
    status = (appointment.call_status or "scheduled").lower()
    if status not in VALID_CALL_STATUSES:
        status = "scheduled"

    if both_joined and status in {"scheduled", "waiting"}:
        status = "ongoing"
    elif (patient_joined or doctor_joined) and status == "scheduled":
        status = "waiting"

    if status in {"scheduled", "waiting"} and appt_dt and now >= (appt_dt + timedelta(minutes=10)) and not both_joined:
        status = "missed"

    waiting_for = None
    if patient_joined and not doctor_joined:
        waiting_for = "doctor"
    elif doctor_joined and not patient_joined:
        waiting_for = "patient"

    join_allowed_status = status in {"scheduled", "waiting", "ongoing"}

    # 🔒 Governance Enforcement: Check doctor account status
    from database.models import DoctorProfile
    doctor_profile = DoctorProfile.query.filter_by(user_id=appointment.doctor_id).first()
    doctor_status = doctor_profile.doctor_status if doctor_profile else "active"
    
    doctor_can_join = bool(doctor_join_time and now >= doctor_join_time and join_allowed_status)
    patient_can_join = bool(patient_join_time and now >= patient_join_time and join_allowed_status)

    if doctor_status in ["restricted", "suspended", "blocked"]:
        doctor_can_join = False
        if doctor_status in ["suspended", "blocked"]:
            patient_can_join = False # Session void if doctor suspended

    return {
        "status": status,
        "appointment_time": appt_dt,
        "patient_join_time": patient_join_time,
        "doctor_join_time": doctor_join_time,
        "patient_can_join_now": patient_can_join,
        "doctor_can_join_now": doctor_can_join,
        "patient_joined": patient_joined,
        "doctor_joined": doctor_joined,
        "both_joined": both_joined,
        "waiting_for": waiting_for,
        "is_missed": status == "missed",
    }


def sync_call_status(appointment: Appointment, now=None):
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    ensure_join_windows(appointment)
    state = evaluate_call_state(appointment, now=now)
    changed = False

    if appointment.call_status != state["status"]:
        appointment.call_status = state["status"]
        changed = True

    if state["status"] == "ongoing" and appointment.call_started_at is None and state["both_joined"]:
        appointment.call_started_at = now
        changed = True

    return state, changed


def get_or_create_direct_conversation(user_id_a: int, user_id_b: int):
    if not user_id_a or not user_id_b:
        return None

    user_a_convs = [p.conversation_id for p in Participant.query.filter_by(user_id=user_id_a).all()]
    user_b_convs = [p.conversation_id for p in Participant.query.filter_by(user_id=user_id_b).all()]
    common_ids = set(user_a_convs).intersection(set(user_b_convs))

    for conv_id in common_ids:
        conv = Conversation.query.get(conv_id)
        if conv and conv.type == "direct":
            return conv

    conv = Conversation(type="direct")
    db.session.add(conv)
    db.session.flush()
    db.session.add(Participant(conversation_id=conv.id, user_id=user_id_a))
    db.session.add(Participant(conversation_id=conv.id, user_id=user_id_b))
    db.session.flush()
    return conv


def emit_chat_message(message: Message):
    try:
        from extensions.socket import socketio

        payload = message.to_dict()
        conversation_room = f"conversation_{message.conversation_id}"
        socketio.emit("new_message", payload, room=conversation_room)
        socketio.emit("receive_message", payload, room=conversation_room)
        socketio.emit("new_message", payload, room=f"user_{message.sender_id}")
        socketio.emit("receive_message", payload, room=f"user_{message.sender_id}")

        participants = Participant.query.filter(Participant.conversation_id == message.conversation_id).all()
        for participant in participants:
            socketio.emit("new_message", payload, room=f"user_{participant.user_id}")
            socketio.emit("receive_message", payload, room=f"user_{participant.user_id}")
    except Exception as error:
        print(f"[CALL CHAT] socket emit failed: {error}")


def send_system_chat_message(appointment: Appointment, content: str, sender_id: int = None):
    if not appointment or not content:
        return None

    conversation = get_or_create_direct_conversation(appointment.patient_id, appointment.doctor_id)
    if not conversation:
        return None

    message = Message(
        conversation_id=conversation.id,
        sender_id=sender_id or appointment.doctor_id or appointment.patient_id,
        content=content,
        type="system",
    )
    db.session.add(message)
    db.session.flush()
    emit_chat_message(message)
    return message


def notify_both_parties(appointment: Appointment, title: str, body: str, event_type: str = "appointment_call"):
    payload = {
        "appointment_id": appointment.id,
        "event_type": event_type,
        "call_status": appointment.call_status,
    }
    NotificationService.send_in_app(
        user_id=appointment.patient_id,
        title=title,
        message=body,
        notif_type="appointment",
        payload=payload,
    )
    NotificationService.send_in_app(
        user_id=appointment.doctor_id,
        title=title,
        message=body,
        notif_type="appointment",
        payload=payload,
    )
