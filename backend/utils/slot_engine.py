from datetime import date, datetime, time, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from database.models import (
    db,
    AppointmentSlot,
    DoctorProfile,
    DoctorAvailability,
    DoctorBlockedDate,
    DoctorScheduleSetting,
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


def _combine_local(target_date: date, t: time, tz_name: str) -> datetime:
    tz = ZoneInfo(tz_name)
    return datetime(target_date.year, target_date.month, target_date.day, t.hour, t.minute, t.second, tzinfo=tz)


def _to_utc(local_dt: datetime) -> datetime:
    return local_dt.astimezone(timezone.utc)


def release_expired_holds(doctor_user_id: Optional[int] = None) -> int:
    now_utc = utc_now()
    query = AppointmentSlot.query.filter(
        AppointmentSlot.status == "held",
        AppointmentSlot.held_until_utc.isnot(None),
        AppointmentSlot.held_until_utc < now_utc,
    )
    if doctor_user_id:
        query = query.filter(AppointmentSlot.doctor_user_id == doctor_user_id)

    slots = query.all()
    for slot in slots:
        slot.status = "available"
        slot.held_by_patient_id = None
        slot.held_until_utc = None
        slot.booked_appointment_id = None
    return len(slots)


def generate_slots_for_doctor(doctor_user_id: int, start_date: date, end_date: date) -> dict:
    if start_date > end_date:
        raise ValueError("start_date must be <= end_date")

    profile = DoctorProfile.query.filter_by(user_id=doctor_user_id).first()
    if not profile:
        raise ValueError("Doctor profile not found")

    setting = get_or_create_schedule_setting(doctor_user_id)

    availability_by_day: dict[str, list[DoctorAvailability]] = {}
    for slot in DoctorAvailability.query.filter_by(doctor_id=profile.id).all():
        availability_by_day.setdefault(slot.day_of_week, []).append(slot)

    blocked_dates = {b.date for b in DoctorBlockedDate.query.filter_by(doctor_id=profile.id).all()}

    duration = timedelta(minutes=setting.slot_duration_minutes)
    buffer_gap = timedelta(minutes=setting.buffer_minutes)

    generated = 0
    blocked_generated = 0
    skipped_existing = 0

    current = start_date
    while current <= end_date:
        if current in blocked_dates:
            current += timedelta(days=1)
            continue

        day_name = DAY_NAMES[current.weekday()]
        windows = availability_by_day.get(day_name, [])
        if not windows:
            current += timedelta(days=1)
            continue

        for window in windows:
            pointer_local = _combine_local(current, window.start_time, setting.timezone)
            end_local = _combine_local(current, window.end_time, setting.timezone)

            while pointer_local + duration <= end_local:
                consult_start_utc = _to_utc(pointer_local)
                consult_end_utc = _to_utc(pointer_local + duration)

                existing = AppointmentSlot.query.filter_by(
                    doctor_user_id=doctor_user_id,
                    slot_start_utc=consult_start_utc,
                ).first()

                if existing:
                    skipped_existing += 1
                else:
                    db.session.add(
                        AppointmentSlot(
                            doctor_user_id=doctor_user_id,
                            slot_start_utc=consult_start_utc,
                            slot_end_utc=consult_end_utc,
                            slot_date_local=current,
                            status="available",
                            source="generated",
                        )
                    )
                    generated += 1

                if buffer_gap.total_seconds() > 0:
                    buffer_start_local = pointer_local + duration
                    buffer_end_local = buffer_start_local + buffer_gap
                    if buffer_end_local <= end_local:
                        buffer_start_utc = _to_utc(buffer_start_local)
                        buffer_end_utc = _to_utc(buffer_end_local)
                        existing_buffer = AppointmentSlot.query.filter_by(
                            doctor_user_id=doctor_user_id,
                            slot_start_utc=buffer_start_utc,
                        ).first()
                        if existing_buffer:
                            skipped_existing += 1
                        else:
                            db.session.add(
                                AppointmentSlot(
                                    doctor_user_id=doctor_user_id,
                                    slot_start_utc=buffer_start_utc,
                                    slot_end_utc=buffer_end_utc,
                                    slot_date_local=current,
                                    status="blocked",
                                    source="generated",
                                )
                            )
                            blocked_generated += 1

                pointer_local = pointer_local + duration + buffer_gap

        current += timedelta(days=1)

    return {
        "generated_available": generated,
        "generated_blocked": blocked_generated,
        "skipped_existing": skipped_existing,
        "setting": setting.to_dict(),
    }


def find_slot_for_legacy_time(doctor_user_id: int, target_date: date, target_time: time):
    setting = get_or_create_schedule_setting(doctor_user_id)
    local_start = _combine_local(target_date, target_time, setting.timezone)
    slot_start_utc = _to_utc(local_start)

    return AppointmentSlot.query.filter_by(
        doctor_user_id=doctor_user_id,
        slot_start_utc=slot_start_utc,
    ).first()
