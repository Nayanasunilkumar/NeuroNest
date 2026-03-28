from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from database.models import Appointment, DoctorNotificationSetting, db
from services.notification_service import NotificationService
from services.appointment_call_service import ensure_join_windows, send_system_chat_message, sync_call_status

def check_upcoming_consultations(app):
    """
    Runs every minute. Finds upcoming appointments and checks if a reminder is due 
    based on the doctor's NotificationSettings.
    """
    with app.app_context():
        try:
            now = datetime.now(timezone.utc)
            window_start = (now - timedelta(minutes=60)).date()
            window_end = (now + timedelta(days=1)).date()
            upcoming_appointments = Appointment.query.filter(
                Appointment.status.in_(["approved", "rescheduled", "pending"]),
                Appointment.consultation_type == "online",
                Appointment.appointment_date >= window_start,
                Appointment.appointment_date <= window_end,
            ).all()

            for appt in upcoming_appointments:
                ensure_join_windows(appt)
                state, _ = sync_call_status(appt, now=now)

                # appt_datetime is now UTC-aware
                appt_datetime = appt._resolved_schedule_datetime()
                if not appt_datetime: continue
                
                # Format for display in IST
                ist_tz = ZoneInfo("Asia/Kolkata")
                appt_display_time = appt_datetime.astimezone(ist_tz).strftime('%I:%M %p')

                minutes_until = int((appt_datetime - now).total_seconds() / 60)

                if appt.reminder_30_sent_at is None and 29 <= minutes_until <= 30:
                    NotificationService.send_in_app(
                        user_id=appt.patient_id,
                        title="Appointment in 30 minutes",
                        message=f"Your video appointment starts in 30 minutes at {appt_display_time}.",
                        notif_type="appointment",
                        payload={"appointment_id": appt.id, "event_type": "appointment_30_min"},
                    )
                    NotificationService.send_in_app(
                        user_id=appt.doctor_id,
                        title="Appointment in 30 minutes",
                        message=f"Your video appointment with {appt.patient.full_name if appt.patient else 'patient'} starts in 30 minutes.",
                        notif_type="appointment",
                        payload={"appointment_id": appt.id, "event_type": "appointment_30_min"},
                    )
                    _send_scheduled_email_reminder(appt, minutes_before=30)
                    appt.reminder_30_sent_at = now

                if appt.reminder_10_sent_at is None and 9 <= minutes_until <= 10:
                    # join_time should also be localized for message
                    raw_join_time = appt.join_enabled_doctor_time or (appt_datetime - timedelta(minutes=5))
                    if raw_join_time.tzinfo is None: raw_join_time = raw_join_time.replace(tzinfo=timezone.utc)
                    join_display_time = raw_join_time.astimezone(ist_tz).strftime('%I:%M %p')

                    NotificationService.send_in_app(
                        user_id=appt.patient_id,
                        title="Appointment in 10 minutes",
                        message=f"Your video appointment starts in 10 minutes. You can join at {join_display_time}.",
                        notif_type="appointment",
                        payload={"appointment_id": appt.id, "event_type": "appointment_10_min"},
                    )
                    NotificationService.send_in_app(
                        user_id=appt.doctor_id,
                        title="Appointment in 10 minutes",
                        message=f"Video appointment with {appt.patient.full_name if appt.patient else 'patient'} starts in 10 minutes.",
                        notif_type="appointment",
                        payload={"appointment_id": appt.id, "event_type": "appointment_10_min"},
                    )
                    _send_scheduled_email_reminder(appt, minutes_before=10)
                    appt.reminder_10_sent_at = now
                    appt.popup_shown_at = now

                if (
                    state["is_missed"]
                    and appt.missed_notified_at is None
                    and not state["both_joined"]
                    and now >= (appt_datetime + timedelta(minutes=10))
                ):
                    NotificationService.send_in_app(
                        user_id=appt.patient_id,
                        title="Appointment missed",
                        message="Your online appointment was marked as missed. Please reschedule.",
                        notif_type="appointment",
                        payload={"appointment_id": appt.id, "event_type": "appointment_missed"},
                    )
                    NotificationService.send_in_app(
                        user_id=appt.doctor_id,
                        title="Appointment missed",
                        message=f"Appointment with {appt.patient.full_name if appt.patient else 'patient'} was marked as missed.",
                        notif_type="appointment",
                        payload={"appointment_id": appt.id, "event_type": "appointment_missed"},
                    )
                    _send_missed_email(appt)
                    appt.missed_notified_at = now
                    
                    # 🔗 Governance Hook: Track missed session telemetry
                    from services.governance_service import GovernanceService
                    GovernanceService.process_missed_appointment(appt.id)

                # Get doctor's notification settings
                doc_settings = DoctorNotificationSetting.query.filter_by(doctor_user_id=appt.doctor_id).first()
                if not doc_settings or not doc_settings.reminder_before_minutes or doc_settings.reminder_before_minutes <= 0:
                    continue
                
                # We trigger exactly when minutes_until == reminder_before_minutes (give or take a minute)
                if minutes_until == doc_settings.reminder_before_minutes:
                    _trigger_upcoming_consultation_alert(appt, minutes_until)

            db.session.commit()

        except Exception as e:
            db.session.rollback()
            print(f"[SCHEDULER ERROR] Failed to check upcoming consultations: {e}")

def _trigger_upcoming_consultation_alert(appt, minutes_until):
    # Keep it simple and stateless by relying on exact minute matching.
    doctor = appt.doctor
    patient = appt.patient

    title = f"Upcoming Consultation in {minutes_until} mins"
    message = f"Your appointment with patient {patient.full_name} is starting in {minutes_until} minutes."

    # Send Notification (Email / In-App based on doctor settings)
    doc_settings = DoctorNotificationSetting.query.filter_by(doctor_user_id=doctor.id).first()

    # 1. In-App Notification (Database Log)
    if doc_settings and doc_settings.in_app_notifications:
        NotificationService.send_in_app(
            user_id=doctor.id,
            title=title,
            message=message,
            payload={"type": "upcoming_consultation", "related_client_id": patient.id}
        )

    # 2. Email Notification
    if doc_settings and doc_settings.email_on_booking:
        NotificationService.send_email(
            recipient=doctor.email,
            subject=title,
            body=f"Hello Dr. {doctor.full_name},\n\n" + message + "\n\nRegards,\nThe App Team"
        )


def _send_scheduled_email_reminder(appt, minutes_before: int):
    doc_settings = DoctorNotificationSetting.query.filter_by(doctor_user_id=appt.doctor_id).first()
    doctor_name = appt.doctor.full_name if appt.doctor else "Doctor"
    patient_name = appt.patient.full_name if appt.patient else "Patient"
    appt_date = appt.appointment_date.strftime("%B %d, %Y")
    appt_time = appt.appointment_time.strftime("%I:%M %p")

    if minutes_before == 30:
        subject = "Upcoming Appointment Reminder – NeuroNest"
        patient_body = (
            "Hello,\n\n"
            "This is a reminder that you have an upcoming appointment.\n\n"
            f"Doctor: Dr. {doctor_name}\n"
            f"Date: {appt_date}\n"
            f"Time: {appt_time}\n"
            "Type: Video Consultation\n\n"
            "Please log in to NeuroNest 10 minutes before the appointment to join the call.\n\n"
            "Thank you,\nNeuroNest Team"
        )
        doctor_body = (
            "Hello,\n\n"
            "This is a reminder that you have an upcoming appointment.\n\n"
            f"Patient: {patient_name}\n"
            f"Date: {appt_date}\n"
            f"Time: {appt_time}\n"
            "Type: Video Consultation\n\n"
            "Please log in to NeuroNest before the appointment to join the call.\n\n"
            "Thank you,\nNeuroNest Team"
        )
    else:
        subject = "Your Appointment Starts in 10 Minutes"
        patient_body = (
            "Hello,\n\n"
            f"Your appointment with Dr. {doctor_name} will start in 10 minutes.\n\n"
            "You can now join the call from your NeuroNest dashboard.\n\n"
            "Join link: Open NeuroNest Dashboard\n\n"
            "Thank you,\nNeuroNest Team"
        )
        doctor_body = (
            "Hello,\n\n"
            f"Your appointment with {patient_name} will start in 10 minutes.\n\n"
            "You can now join the call from your NeuroNest dashboard.\n\n"
            "Join link: Open NeuroNest Dashboard\n\n"
            "Thank you,\nNeuroNest Team"
        )

    try:
        if appt.patient and appt.patient.email:
            NotificationService.send_email(appt.patient.email, subject, patient_body, event_type="approved")
        if appt.doctor and appt.doctor.email and (not doc_settings or doc_settings.email_on_booking):
            NotificationService.send_email(appt.doctor.email, subject, doctor_body, event_type="approved")
    except Exception as error:
        print(f"[SCHEDULER EMAIL] reminder email failed: {error}")


def _send_missed_email(appt):
    doc_settings = DoctorNotificationSetting.query.filter_by(doctor_user_id=appt.doctor_id).first()
    doctor_name = appt.doctor.full_name if appt.doctor else "Doctor"
    patient_name = appt.patient.full_name if appt.patient else "Patient"
    subject = "Appointment Missed – NeuroNest"
    patient_body = (
        "Hello,\n\n"
        f"Your appointment with Dr. {doctor_name} was marked as missed.\n"
        "Please reschedule from your NeuroNest dashboard.\n\n"
        "Thank you,\nNeuroNest Team"
    )
    doctor_body = (
        "Hello,\n\n"
        f"Your appointment with {patient_name} was marked as missed.\n"
        "Please follow up from your NeuroNest dashboard.\n\n"
        "Thank you,\nNeuroNest Team"
    )

    try:
        if appt.patient and appt.patient.email:
            NotificationService.send_email(appt.patient.email, subject, patient_body, event_type="cancelled")
        if appt.doctor and appt.doctor.email and (not doc_settings or doc_settings.email_on_booking):
            NotificationService.send_email(appt.doctor.email, subject, doctor_body, event_type="cancelled")
    except Exception as error:
        print(f"[SCHEDULER EMAIL] missed email failed: {error}")
