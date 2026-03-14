from flask import session
from flask_socketio import emit, join_room, leave_room

from database.models import Appointment, User
from extensions.socket import socketio


def _can_access_patient_vitals(user_id, role, patient_id):
    if role == "patient":
        return int(user_id) == int(patient_id)

    if role in ("admin", "super_admin"):
        return True

    if role == "doctor":
        relationship = Appointment.query.filter_by(
            doctor_id=int(user_id),
            patient_id=int(patient_id),
        ).first()
        return relationship is not None

    return False


@socketio.on("join_vitals_room")
def join_vitals_room(data):
    user_id = session.get("user_id")
    if not user_id:
        emit("vitals_error", {"message": "Authentication required"})
        return

    patient_id = (data or {}).get("patient_id")
    if not patient_id:
        emit("vitals_error", {"message": "patient_id is required"})
        return

    user = User.query.get(int(user_id))
    if not user or not _can_access_patient_vitals(user.id, user.role, patient_id):
        emit("vitals_error", {"message": "Access denied"})
        return

    room = f"patient_vitals_{int(patient_id)}"
    join_room(room)
    emit("vitals_room_joined", {"patient_id": int(patient_id), "room": room})


@socketio.on("leave_vitals_room")
def leave_vitals_room(data):
    patient_id = (data or {}).get("patient_id")
    if not patient_id:
        return
    leave_room(f"patient_vitals_{int(patient_id)}")
