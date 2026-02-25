from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.models import (
    db,
    DoctorScheduleSetting,
    DoctorNotificationSetting,
    DoctorPrivacySetting,
    DoctorConsultationSetting
)
from utils.slot_engine import regenerate_slots_for_doctor, rolling_window_bounds

doctor_settings_bp = Blueprint("doctor_settings", __name__)

def _is_doctor():
    return get_jwt().get("role") == "doctor"

def _get_or_create_settings(doctor_id):
    # Schedule Setting
    schedule = DoctorScheduleSetting.query.filter_by(doctor_user_id=doctor_id).first()
    if not schedule:
        schedule = DoctorScheduleSetting(doctor_user_id=doctor_id)
        db.session.add(schedule)

    # Notification Setting
    notifications = DoctorNotificationSetting.query.filter_by(doctor_user_id=doctor_id).first()
    if not notifications:
        notifications = DoctorNotificationSetting(doctor_user_id=doctor_id)
        db.session.add(notifications)

    # Privacy Setting
    privacy = DoctorPrivacySetting.query.filter_by(doctor_user_id=doctor_id).first()
    if not privacy:
        privacy = DoctorPrivacySetting(doctor_user_id=doctor_id)
        db.session.add(privacy)

    # Consultation Setting
    consultation = DoctorConsultationSetting.query.filter_by(doctor_user_id=doctor_id).first()
    if not consultation:
        consultation = DoctorConsultationSetting(doctor_user_id=doctor_id)
        db.session.add(consultation)

    db.session.commit()
    return schedule, notifications, privacy, consultation


@doctor_settings_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_settings():
    if not _is_doctor():
        return jsonify({"message": "Doctor access required"}), 403

    doctor_id = int(get_jwt_identity())
    schedule, notifications, privacy, consultation = _get_or_create_settings(doctor_id)

    return jsonify({
        "schedule": schedule.to_dict(),
        "notifications": notifications.to_dict(),
        "privacy": privacy.to_dict(),
        "consultation": consultation.to_dict()
    }), 200


@doctor_settings_bp.route("/schedule", methods=["PUT"])
@jwt_required()
def update_schedule_settings():
    if not _is_doctor():
        return jsonify({"message": "Doctor access required"}), 403

    doctor_id = int(get_jwt_identity())
    data = request.json or {}
    schedule, _, _, _ = _get_or_create_settings(doctor_id)

    slot_duration = schedule.slot_duration_minutes
    buffer_minutes = schedule.buffer_minutes
    timezone = schedule.timezone

    if "slot_duration_minutes" in data:
        slot_duration = int(data["slot_duration_minutes"])
    if "buffer_minutes" in data:
        buffer_minutes = int(data["buffer_minutes"])
    if "approval_mode" in data:
        schedule.approval_mode = data["approval_mode"]
    if "accepting_new_bookings" in data:
        schedule.accepting_new_bookings = bool(data["accepting_new_bookings"])
    if "timezone" in data:
        timezone = data["timezone"]

    requires_regeneration = (
        schedule.slot_duration_minutes != slot_duration
        or schedule.buffer_minutes != buffer_minutes
        or schedule.timezone != timezone
    )

    schedule.slot_duration_minutes = slot_duration
    schedule.buffer_minutes = buffer_minutes
    schedule.timezone = timezone

    if requires_regeneration:
        start_date, end_date = rolling_window_bounds()
        regenerate_slots_for_doctor(doctor_id, start_date, end_date)
    db.session.commit()
    return jsonify({"message": "Schedule settings updated", "settings": schedule.to_dict()}), 200


@doctor_settings_bp.route("/notifications", methods=["PUT"])
@jwt_required()
def update_notification_settings():
    if not _is_doctor():
        return jsonify({"message": "Doctor access required"}), 403

    doctor_id = int(get_jwt_identity())
    data = request.json or {}
    _, notifications, _, _ = _get_or_create_settings(doctor_id)

    if "email_on_booking" in data:
        notifications.email_on_booking = bool(data["email_on_booking"])
    if "sms_on_booking" in data:
        notifications.sms_on_booking = bool(data["sms_on_booking"])
    if "in_app_notifications" in data:
        notifications.in_app_notifications = bool(data["in_app_notifications"])
    if "reminder_before_minutes" in data:
        notifications.reminder_before_minutes = int(data["reminder_before_minutes"])

    db.session.commit()
    return jsonify({"message": "Notification settings updated", "settings": notifications.to_dict()}), 200


@doctor_settings_bp.route("/privacy", methods=["PUT"])
@jwt_required()
def update_privacy_settings():
    if not _is_doctor():
        return jsonify({"message": "Doctor access required"}), 403

    doctor_id = int(get_jwt_identity())
    data = request.json or {}
    _, _, privacy, _ = _get_or_create_settings(doctor_id)

    if "show_profile_publicly" in data:
        privacy.show_profile_publicly = bool(data["show_profile_publicly"])
    if "show_consultation_fee" in data:
        privacy.show_consultation_fee = bool(data["show_consultation_fee"])
    if "allow_chat_before_booking" in data:
        privacy.allow_chat_before_booking = bool(data["allow_chat_before_booking"])
    if "allow_reviews_publicly" in data:
        privacy.allow_reviews_publicly = bool(data["allow_reviews_publicly"])

    db.session.commit()
    return jsonify({"message": "Privacy settings updated", "settings": privacy.to_dict()}), 200


@doctor_settings_bp.route("/consultation", methods=["PUT"])
@jwt_required()
def update_consultation_settings():
    if not _is_doctor():
        return jsonify({"message": "Doctor access required"}), 403

    doctor_id = int(get_jwt_identity())
    data = request.json or {}
    _, _, _, consultation = _get_or_create_settings(doctor_id)

    if "consultation_fee" in data:
        consultation.consultation_fee = float(data["consultation_fee"])
    if "consultation_mode" in data:
        consultation.consultation_mode = data["consultation_mode"]
    if "cancellation_policy_hours" in data:
        consultation.cancellation_policy_hours = int(data["cancellation_policy_hours"])
    if "auto_cancel_unpaid_minutes" in data:
        consultation.auto_cancel_unpaid_minutes = int(data["auto_cancel_unpaid_minutes"])

    db.session.commit()
    return jsonify({"message": "Consultation settings updated", "settings": consultation.to_dict()}), 200
