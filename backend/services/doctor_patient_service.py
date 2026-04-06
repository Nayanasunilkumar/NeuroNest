from database.models import Appointment, db


DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES = ("rejected",)
DOCTOR_PATIENT_TERMINAL_STATUSES = (
    "rejected",
    "cancelled",
    "cancelled_by_doctor",
    "cancelled_by_patient",
)


def get_related_patient_ids_for_doctor(doctor_id: int):
    if not doctor_id:
        return []

    rows = (
        db.session.query(Appointment.patient_id)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.status.notin_(DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES),
        )
        .distinct()
        .all()
    )
    return [row[0] for row in rows if row and row[0]]


def get_related_doctor_ids_for_patient(patient_id: int):
    if not patient_id:
        return []

    rows = (
        db.session.query(Appointment.doctor_id)
        .filter(
            Appointment.patient_id == patient_id,
            Appointment.status.notin_(DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES),
        )
        .distinct()
        .all()
    )
    return [row[0] for row in rows if row and row[0]]


def doctor_has_patient_relationship(doctor_id: int, patient_id: int) -> bool:
    if not doctor_id or not patient_id:
        return False

    exists = (
        Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            Appointment.patient_id == patient_id,
            Appointment.status.notin_(DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES),
        )
        .first()
    )
    return exists is not None
