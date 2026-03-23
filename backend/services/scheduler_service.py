from datetime import datetime, timedelta
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
            now = datetime.now()
            window_start = (now - timedelta(minutes=30)).date()
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

                appt_datetime = datetime.combine(appt.appointment_date, appt.appointment_time)
                minutes_until = int((appt_datetime - now).total_seconds() / 60)

                if appt.reminder_30_sent_at is None and 29 <= minutes_until <= 30:
                    send_system_chat_message(
                        appt,
                        f"System: Your video appointment with Dr. {appt.doctor.full_name if appt.doctor else 'your doctor'} starts in 30 minutes.",
                        sender_id=appt.doctor_id,
                    )
                    NotificationService.send_in_app(
                        user_id=appt.patient_id,
                        title="Appointment in 30 minutes",
                        message=f"Your video appointment starts in 30 minutes at {appt.appointment_time.strftime('%I:%M %p')}.",
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
                    appt.reminder_30_sent_at = now

                if appt.reminder_10_sent_at is None and 9 <= minutes_until <= 10:
                    join_time = appt.join_enabled_doctor_time or (appt_datetime - timedelta(minutes=5))
                    send_system_chat_message(
                        appt,
                        f"System: Your video appointment with Dr. {appt.doctor.full_name if appt.doctor else 'your doctor'} starts in 10 minutes. You can join the call at {join_time.strftime('%I:%M %p')}.",
                        sender_id=appt.doctor_id,
                    )
                    NotificationService.send_in_app(
                        user_id=appt.patient_id,
                        title="Appointment in 10 minutes",
                        message=f"Your video appointment starts in 10 minutes. You can join at {join_time.strftime('%I:%M %p')}.",
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
                    appt.reminder_10_sent_at = now

                if (
                    state["is_missed"]
                    and appt.missed_notified_at is None
                    and not state["both_joined"]
                    and now >= (appt_datetime + timedelta(minutes=10))
                ):
                    send_system_chat_message(
                        appt,
                        "System: Appointment marked as missed. Please reschedule.",
                        sender_id=appt.doctor_id,
                    )
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
                    appt.missed_notified_at = now

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
