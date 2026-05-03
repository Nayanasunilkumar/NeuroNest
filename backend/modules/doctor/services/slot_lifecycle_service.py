from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from sqlalchemy import inspect

from database.models import (
    Appointment,
    AppointmentSlot,
    DoctorBlockedDate,
    DoctorProfile,
    DoctorSlotOverride,
    SlotEventLog,
    db,
)
from models.system_settings import SystemSetting


DEFAULT_PATIENT_CANCEL_CUTOFF_MINUTES = 60
_slot_event_log_table_available: Optional[bool] = None
_slot_overrides_table_available: Optional[bool] = None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def get_patient_cancel_cutoff_minutes() -> int:
    setting = SystemSetting.query.filter_by(setting_key="patient_cancel_cutoff_minutes").first()
    if not setting:
        return DEFAULT_PATIENT_CANCEL_CUTOFF_MINUTES
    try:
        return max(0, int(setting.setting_value))
    except (TypeError, ValueError):
        return DEFAULT_PATIENT_CANCEL_CUTOFF_MINUTES


def _slot_event_log_enabled() -> bool:
    global _slot_event_log_table_available
    if _slot_event_log_table_available is not None:
        return _slot_event_log_table_available

    try:
        inspector = inspect(db.engine)
        _slot_event_log_table_available = inspector.has_table("slot_event_logs")
    except Exception:
        _slot_event_log_table_available = False
    return _slot_event_log_table_available


def _slot_overrides_enabled() -> bool:
    global _slot_overrides_table_available
    if _slot_overrides_table_available is not None:
        return _slot_overrides_table_available

    try:
        inspector = inspect(db.engine)
        _slot_overrides_table_available = inspector.has_table("doctor_slot_overrides")
    except Exception:
        _slot_overrides_table_available = False
    return _slot_overrides_table_available


def log_slot_event(
    *,
    event_type: str,
    slot: Optional[AppointmentSlot] = None,
    appointment: Optional[Appointment] = None,
    doctor_user_id: Optional[int] = None,
    slot_id: Optional[int] = None,
    appointment_id: Optional[int] = None,
    actor_user_id: Optional[int] = None,
    source: str = "system",
    reason: Optional[str] = None,
    correlation_id: Optional[str] = None,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    metadata: Optional[dict] = None,
):
    if not _slot_event_log_enabled():
        return

    resolved_slot_id = slot_id if slot_id is not None else (slot.id if slot else None)
    resolved_doctor_id = doctor_user_id if doctor_user_id is not None else (
        slot.doctor_user_id if slot else (appointment.doctor_id if appointment else None)
    )
    resolved_appointment_id = appointment_id if appointment_id is not None else (
        appointment.id if appointment else (slot.booked_appointment_id if slot else None)
    )

    db.session.add(
        SlotEventLog(
            event_type=event_type,
            doctor_user_id=resolved_doctor_id,
            slot_id=resolved_slot_id,
            appointment_id=resolved_appointment_id,
            actor_user_id=actor_user_id,
            source=source,
            reason=reason,
            correlation_id=correlation_id,
            previous_status=previous_status,
            new_status=new_status,
            metadata_json=metadata or {},
        )
    )


def is_slot_overridden(
    *,
    doctor_user_id: int,
    slot_start_utc: datetime,
    slot_end_utc: datetime,
    slot_date_local,
) -> Tuple[bool, Optional[DoctorSlotOverride]]:
    if not _slot_overrides_enabled():
        return False, None

    doctor_profile = DoctorProfile.query.filter_by(user_id=doctor_user_id).first()
    if doctor_profile:
        legacy_block = DoctorBlockedDate.query.filter_by(
            doctor_id=doctor_profile.id,
            date=slot_date_local,
        ).first()
        if legacy_block:
            return True, None

    overrides = (
        DoctorSlotOverride.query.filter_by(
            doctor_user_id=doctor_user_id,
            override_date=slot_date_local,
            is_active=True,
        )
        .order_by(DoctorSlotOverride.created_at.desc())
        .all()
    )
    if not overrides:
        return False, None

    slot_start = _as_utc(slot_start_utc)
    slot_end = _as_utc(slot_end_utc)
    for override in overrides:
        if override.scope == "full_day":
            return True, override
        range_start = _as_utc(override.start_time_utc)
        range_end = _as_utc(override.end_time_utc)
        if range_start and range_end and slot_start < range_end and slot_end > range_start:
            return True, override
    return False, None


def mark_slot_held(
    *,
    slot: AppointmentSlot,
    patient_id: int,
    hold_minutes: int = 5,
    actor_user_id: Optional[int] = None,
    source: str = "booking",
    reason: Optional[str] = None,
):
    previous = slot.status
    slot.status = "held"
    slot.held_by_patient_id = patient_id
    slot.held_until_utc = utc_now() + timedelta(minutes=hold_minutes)
    log_slot_event(
        event_type="slot_status_changed",
        slot=slot,
        actor_user_id=actor_user_id,
        source=source,
        reason=reason,
        previous_status=previous,
        new_status="held",
    )


def mark_slot_booked(
    *,
    slot: AppointmentSlot,
    appointment_id: int,
    actor_user_id: Optional[int] = None,
    source: str = "booking",
    reason: Optional[str] = None,
):
    previous = slot.status
    slot.status = "booked"
    slot.booked_appointment_id = appointment_id
    slot.held_by_patient_id = None
    slot.held_until_utc = None
    log_slot_event(
        event_type="slot_status_changed",
        slot=slot,
        actor_user_id=actor_user_id,
        source=source,
        reason=reason,
        previous_status=previous,
        new_status="booked",
    )


def mark_slot_available(
    *,
    slot: AppointmentSlot,
    actor_user_id: Optional[int] = None,
    source: str = "system",
    reason: Optional[str] = None,
):
    previous = slot.status
    slot.status = "available"
    slot.held_by_patient_id = None
    slot.held_until_utc = None
    slot.booked_appointment_id = None
    log_slot_event(
        event_type="slot_status_changed",
        slot=slot,
        actor_user_id=actor_user_id,
        source=source,
        reason=reason,
        previous_status=previous,
        new_status="available",
    )


def mark_slot_blocked(
    *,
    slot: AppointmentSlot,
    actor_user_id: Optional[int] = None,
    source: str = "system",
    reason: Optional[str] = None,
):
    previous = slot.status
    slot.status = "blocked"
    slot.held_by_patient_id = None
    slot.held_until_utc = None
    slot.booked_appointment_id = None
    log_slot_event(
        event_type="slot_status_changed",
        slot=slot,
        actor_user_id=actor_user_id,
        source=source,
        reason=reason,
        previous_status=previous,
        new_status="blocked",
    )


def release_expired_holds(*, doctor_user_id: Optional[int] = None, source: str = "hold_sweeper") -> int:
    now = utc_now()
    query = AppointmentSlot.query.filter(
        AppointmentSlot.status == "held",
        AppointmentSlot.held_until_utc.isnot(None),
        AppointmentSlot.held_until_utc < now,
    )
    if doctor_user_id:
        query = query.filter(AppointmentSlot.doctor_user_id == doctor_user_id)

    released = 0
    for slot in query.all():
        mark_slot_available(slot=slot, source=source, reason="Hold expired")
        released += 1
    return released


def apply_cancellation_policy(
    *,
    appointment: Appointment,
    cancelled_by: str,
    actor_user_id: Optional[int],
    source: str,
    reason: Optional[str] = None,
) -> Optional[str]:
    if not appointment.slot_id:
        return None

    slot = AppointmentSlot.query.filter_by(id=appointment.slot_id).with_for_update().first()
    if not slot:
        return None
    if slot.booked_appointment_id not in (None, appointment.id):
        return None

    slot_start = _as_utc(slot.slot_start_utc)
    now = utc_now()
    overridden, override = is_slot_overridden(
        doctor_user_id=appointment.doctor_id,
        slot_start_utc=slot.slot_start_utc,
        slot_end_utc=slot.slot_end_utc,
        slot_date_local=slot.slot_date_local,
    )

    if cancelled_by == "no_show":
        mark_slot_blocked(slot=slot, actor_user_id=actor_user_id, source=source, reason=reason or "No-show")
        return "blocked"

    if cancelled_by == "doctor":
        if overridden:
            mark_slot_blocked(
                slot=slot,
                actor_user_id=actor_user_id,
                source=source,
                reason=reason or (override.reason if override else "Doctor cancelled; override active"),
            )
            return "blocked"
        mark_slot_available(slot=slot, actor_user_id=actor_user_id, source=source, reason=reason or "Doctor cancelled")
        return "available"

    if cancelled_by == "patient":
        cutoff_mins = get_patient_cancel_cutoff_minutes()
        cutoff_boundary = slot_start - timedelta(minutes=cutoff_mins)
        if overridden:
            mark_slot_blocked(
                slot=slot,
                actor_user_id=actor_user_id,
                source=source,
                reason=reason or (override.reason if override else "Patient cancelled; override active"),
            )
            return "blocked"
        if now <= cutoff_boundary:
            mark_slot_available(
                slot=slot,
                actor_user_id=actor_user_id,
                source=source,
                reason=reason or f"Patient cancelled before {cutoff_mins}m cutoff",
            )
            return "available"
        mark_slot_blocked(
            slot=slot,
            actor_user_id=actor_user_id,
            source=source,
            reason=reason or f"Patient cancelled inside {cutoff_mins}m cutoff",
        )
        return "blocked"

    return None
