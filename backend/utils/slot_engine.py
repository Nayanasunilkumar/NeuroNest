from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from sqlalchemy import inspect

from database.models import (
    AppointmentSlot,
    DoctorAvailability,
    DoctorBlockedDate,
    DoctorProfile,
    DoctorScheduleSetting,
    DoctorSlotOverride,
    db,
)
from services.slot_lifecycle_service import (
    log_slot_event,
    release_expired_holds as release_expired_holds_service,
)

DAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

ROLLING_WINDOW_DAYS = 14
LOCKED_SLOT_DURATION_MINUTES = 30
LOCKED_BUFFER_MINUTES = 10
LOCKED_SLOT_STEP_MINUTES = LOCKED_SLOT_DURATION_MINUTES + LOCKED_BUFFER_MINUTES
_slot_overrides_table_available: Optional[bool] = None


class SlotConflictError(Exception):
    pass


def utc_now():
    return datetime.now(timezone.utc)


def get_or_create_schedule_setting(doctor_user_id: int) -> DoctorScheduleSetting:
    setting = DoctorScheduleSetting.query.filter_by(doctor_user_id=doctor_user_id).first()
    if setting:
        return setting

    setting = DoctorScheduleSetting(doctor_user_id=doctor_user_id)
    db.session.add(setting)
    db.session.flush()
    return setting


def rolling_window_bounds(days: int = ROLLING_WINDOW_DAYS) -> tuple[date, date]:
    start = date.today()
    end = start + timedelta(days=max(1, days) - 1)
    return start, end


def _combine_local(target_date: date, t: time, tz_name: str) -> datetime:
    tz = ZoneInfo(tz_name)
    return datetime(target_date.year, target_date.month, target_date.day, t.hour, t.minute, t.second, tzinfo=tz)


def _to_utc(local_dt: datetime) -> datetime:
    return local_dt.astimezone(timezone.utc)


def _slot_overrides_enabled() -> bool:
    global _slot_overrides_table_available
    if _slot_overrides_table_available is not None:
        return _slot_overrides_table_available

    try:
        _slot_overrides_table_available = inspect(db.engine).has_table("doctor_slot_overrides")
    except Exception:
        _slot_overrides_table_available = False
    return _slot_overrides_table_available


def _active_overrides_for_date(doctor_user_id: int, target_date: date) -> list[DoctorSlotOverride]:
    if not _slot_overrides_enabled():
        return []
    return (
        DoctorSlotOverride.query.filter_by(
            doctor_user_id=doctor_user_id,
            override_date=target_date,
            is_active=True,
        )
        .order_by(DoctorSlotOverride.created_at.desc())
        .all()
    )


def _is_slot_in_override(
    *,
    slot_start_utc: datetime,
    slot_end_utc: datetime,
    overrides: list[DoctorSlotOverride],
) -> bool:
    for override in overrides:
        if override.scope == "full_day":
            return True
        if override.start_time_utc and override.end_time_utc:
            range_start = override.start_time_utc
            range_end = override.end_time_utc
            if range_start.tzinfo is None:
                range_start = range_start.replace(tzinfo=timezone.utc)
            if range_end.tzinfo is None:
                range_end = range_end.replace(tzinfo=timezone.utc)
            if slot_start_utc < range_end and slot_end_utc > range_start:
                return True
    return False


def release_expired_holds(doctor_user_id: Optional[int] = None) -> int:
    return release_expired_holds_service(doctor_user_id=doctor_user_id, source="slot_engine")


def _availability_map_for_profile(profile_id: int) -> dict[str, list[DoctorAvailability]]:
    availability_by_day: dict[str, list[DoctorAvailability]] = {}
    for availability in DoctorAvailability.query.filter_by(doctor_id=profile_id).all():
        availability_by_day.setdefault(availability.day_of_week, []).append(availability)
    return availability_by_day


def _blocked_days_for_profile(profile_id: int) -> set[date]:
    return {row.date for row in DoctorBlockedDate.query.filter_by(doctor_id=profile_id).all()}


def generate_slots_for_doctor(doctor_user_id: int, start_date: date, end_date: date) -> dict:
    if start_date > end_date:
        raise ValueError("start_date must be <= end_date")

    profile = DoctorProfile.query.filter_by(user_id=doctor_user_id).first()
    if not profile:
        raise ValueError("Doctor profile not found")

    setting = get_or_create_schedule_setting(doctor_user_id)
    duration = timedelta(minutes=LOCKED_SLOT_DURATION_MINUTES)
    step = timedelta(minutes=LOCKED_SLOT_STEP_MINUTES)

    availability_by_day = _availability_map_for_profile(profile.id)
    blocked_dates = _blocked_days_for_profile(profile.id)

    generated = 0
    blocked_generated = 0
    skipped_existing = 0
    updated_existing = 0

    current = start_date
    while current <= end_date:
        day_name = DAY_NAMES[current.weekday()]
        windows = availability_by_day.get(day_name, [])
        overrides = _active_overrides_for_date(doctor_user_id, current)

        if current in blocked_dates:
            windows = []

        for window in windows:
            pointer_local = _combine_local(current, window.start_time, setting.timezone)
            end_local = _combine_local(current, window.end_time, setting.timezone)

            while pointer_local + duration <= end_local:
                slot_start_utc = _to_utc(pointer_local)
                slot_end_utc = _to_utc(pointer_local + duration)
                desired_status = "blocked" if _is_slot_in_override(
                    slot_start_utc=slot_start_utc,
                    slot_end_utc=slot_end_utc,
                    overrides=overrides,
                ) else "available"

                existing = AppointmentSlot.query.filter_by(
                    doctor_user_id=doctor_user_id,
                    slot_start_utc=slot_start_utc,
                ).first()

                if existing:
                    skipped_existing += 1
                    if existing.status not in ("booked", "held") and existing.status != desired_status:
                        previous = existing.status
                        existing.status = desired_status
                        existing.slot_end_utc = slot_end_utc
                        existing.slot_date_local = current
                        existing.source = "generated" if desired_status == "available" else "emergency_block"
                        updated_existing += 1
                        log_slot_event(
                            event_type="slot_status_changed",
                            slot=existing,
                            source="slot_generation",
                            reason="Regeneration sync",
                            previous_status=previous,
                            new_status=desired_status,
                        )
                else:
                    new_slot = AppointmentSlot(
                        doctor_user_id=doctor_user_id,
                        slot_start_utc=slot_start_utc,
                        slot_end_utc=slot_end_utc,
                        slot_date_local=current,
                        status=desired_status,
                        source="generated" if desired_status == "available" else "emergency_block",
                    )
                    db.session.add(new_slot)
                    generated += 1
                    if desired_status == "blocked":
                        blocked_generated += 1

                pointer_local = pointer_local + step

        current += timedelta(days=1)

    log_slot_event(
        event_type="slots_generated",
        doctor_user_id=doctor_user_id,
        source="slot_generation",
        reason="generate_slots_for_doctor",
        metadata={
            "doctor_user_id": doctor_user_id,
            "start_date": str(start_date),
            "end_date": str(end_date),
            "generated_available": generated - blocked_generated,
            "generated_blocked": blocked_generated,
            "updated_existing": updated_existing,
            "skipped_existing": skipped_existing,
        },
    )
    return {
        "generated_available": generated - blocked_generated,
        "generated_blocked": blocked_generated,
        "updated_existing": updated_existing,
        "skipped_existing": skipped_existing,
        "setting": setting.to_dict(),
    }


def regenerate_slots_for_doctor(doctor_user_id: int, start_date: date, end_date: date) -> dict:
    if start_date > end_date:
        raise ValueError("start_date must be <= end_date")

    cleanup_query = AppointmentSlot.query.filter(
        AppointmentSlot.doctor_user_id == doctor_user_id,
        AppointmentSlot.slot_date_local >= start_date,
        AppointmentSlot.slot_date_local <= end_date,
        AppointmentSlot.status.in_(["available", "blocked", "cancelled"]),
    )
    cleanup_count = cleanup_query.count()
    cleanup_query.delete(synchronize_session=False)

    log_slot_event(
        event_type="slots_cleanup",
        doctor_user_id=doctor_user_id,
        source="slot_generation",
        reason="Regenerate range cleanup",
        metadata={
            "doctor_user_id": doctor_user_id,
            "start_date": str(start_date),
            "end_date": str(end_date),
            "deleted_slots": cleanup_count,
        },
    )

    result = generate_slots_for_doctor(doctor_user_id, start_date, end_date)
    result["cleanup_deleted"] = cleanup_count
    return result


def maintain_rolling_window(*, days: int = ROLLING_WINDOW_DAYS, doctor_user_id: Optional[int] = None) -> dict:
    start_date, end_date = rolling_window_bounds(days)
    now_utc = utc_now()

    past_query = AppointmentSlot.query.filter(AppointmentSlot.slot_end_utc < now_utc)
    if doctor_user_id:
        past_query = past_query.filter(AppointmentSlot.doctor_user_id == doctor_user_id)
    deleted_past = past_query.count()
    past_query.delete(synchronize_session=False)

    doctor_ids = [doctor_user_id] if doctor_user_id else [p.user_id for p in DoctorProfile.query.all()]

    generated_summary = []
    for d_id in doctor_ids:
        if not d_id:
            continue
        release_expired_holds(d_id)
        summary = regenerate_slots_for_doctor(d_id, start_date, end_date)
        generated_summary.append({"doctor_user_id": d_id, **summary})

    log_slot_event(
        event_type="rolling_window_maintained",
        doctor_user_id=doctor_user_id,
        source="slot_maintenance",
        reason="Daily rolling window reconciliation",
        metadata={
            "doctor_user_id": doctor_user_id,
            "window_days": days,
            "start_date": str(start_date),
            "end_date": str(end_date),
            "deleted_past_slots": deleted_past,
            "doctors_processed": len(generated_summary),
        },
    )

    return {
        "window": {"start_date": str(start_date), "end_date": str(end_date), "days": days},
        "deleted_past_slots": deleted_past,
        "doctors_processed": len(generated_summary),
        "doctors": generated_summary,
    }


def apply_override_to_existing_slots(doctor_user_id: int, target_date: date) -> dict:
    overrides = _active_overrides_for_date(doctor_user_id, target_date)
    if not overrides:
        return {"updated": 0}

    slots = AppointmentSlot.query.filter(
        AppointmentSlot.doctor_user_id == doctor_user_id,
        AppointmentSlot.slot_date_local == target_date,
        AppointmentSlot.status == "available",
    ).all()

    updated = 0
    for slot in slots:
        if _is_slot_in_override(
            slot_start_utc=slot.slot_start_utc,
            slot_end_utc=slot.slot_end_utc,
            overrides=overrides,
        ):
            previous = slot.status
            slot.status = "blocked"
            slot.source = "emergency_block"
            updated += 1
            log_slot_event(
                event_type="slot_status_changed",
                slot=slot,
                source="override_apply",
                reason="Emergency override applied",
                previous_status=previous,
                new_status="blocked",
            )
    return {"updated": updated}


def find_slot_for_legacy_time(doctor_user_id: int, target_date: date, target_time: time):
    setting = get_or_create_schedule_setting(doctor_user_id)
    local_start = _combine_local(target_date, target_time, setting.timezone)
    slot_start_utc = _to_utc(local_start)

    return AppointmentSlot.query.filter_by(
        doctor_user_id=doctor_user_id,
        slot_start_utc=slot_start_utc,
    ).first()
