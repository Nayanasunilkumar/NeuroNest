import re
from sqlalchemy import func

from database.models import Appointment, User, db


DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES = (
    "rejected",
    "cancelled",
    "cancelled_by_doctor",
    "cancelled_by_patient",
)
DOCTOR_PATIENT_TERMINAL_STATUSES = DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES

CANONICAL_DR_NAINA_EMAIL = "nayanasunilkumar8@gmail.com"


def _normalize_doctor_name(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9\s]", " ", (value or "").lower())
    normalized = re.sub(r"\bdr\b", " ", normalized)
    return " ".join(normalized.split())


def is_dr_naina_user(user: User) -> bool:
    if not user or user.role != "doctor":
        return False
    email = (user.email or "").strip().lower()
    return email == CANONICAL_DR_NAINA_EMAIL or _normalize_doctor_name(user.full_name) == "naina"


def get_dr_naina_scope_ids():
    rows = User.query.filter_by(role="doctor").all()
    return [user.id for user in rows if is_dr_naina_user(user)]


def get_doctor_scope_ids(doctor_id: int):
    if not doctor_id:
        return []

    current_user = User.query.get(doctor_id)
    if is_dr_naina_user(current_user):
        scoped_ids = set(get_dr_naina_scope_ids())
        scoped_ids.add(doctor_id)
        return sorted(scoped_ids)

    return [doctor_id]


def get_canonical_dr_naina_user():
    canonical = User.query.filter_by(email=CANONICAL_DR_NAINA_EMAIL, role="doctor").first()
    if canonical:
        return canonical

    candidates = User.query.filter_by(role="doctor").all()
    naina_candidates = [user for user in candidates if is_dr_naina_user(user)]
    if not naina_candidates:
        return None

    active_candidates = [
        user for user in naina_candidates
        if not getattr(user, "is_deleted", False) and getattr(user, "account_status", "active") == "active"
    ]
    return sorted(active_candidates or naina_candidates, key=lambda user: user.id)[0]


def get_related_patient_ids_for_doctor(doctor_id: int):
    if not doctor_id:
        return []

    doctor_ids = get_doctor_scope_ids(doctor_id)
    rows = (
        db.session.query(Appointment.patient_id)
        .filter(
            Appointment.doctor_id.in_(doctor_ids),
            func.lower(Appointment.status).notin_(DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES),
        )
        .distinct()
        .all()
    )
    return [row[0] for row in rows if row and row[0]]


def get_related_doctor_ids_for_patient(patient_id: int, include_all=True):
    if not patient_id:
        return []

    query = db.session.query(Appointment.doctor_id).filter(Appointment.patient_id == patient_id)
    
    if not include_all:
        query = query.filter(func.lower(Appointment.status).notin_(DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES))
        
    rows = query.distinct().all()
    return [row[0] for row in rows if row and row[0]]


def doctor_has_patient_relationship(doctor_id: int, patient_id: int) -> bool:
    if not doctor_id or not patient_id:
        return False

    doctor_ids = get_doctor_scope_ids(doctor_id)
    exists = (
        Appointment.query.filter(
            Appointment.doctor_id.in_(doctor_ids),
            Appointment.patient_id == patient_id,
            func.lower(Appointment.status).notin_(DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES),
        )
        .first()
    )
    return exists is not None
