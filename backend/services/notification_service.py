import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from datetime import timedelta
import os
class NotificationService:
    @staticmethod
    def _utc_now():
        from datetime import datetime, timezone
        return datetime.now(timezone.utc)

    @staticmethod
    def notify_appointment_event(appointment_id, event_type):
        """
        event_type: 'new_booking', 'cancelled', 'rescheduled', 'approved', 'rejected', 'completed'
        Doctor delivery channels respect notification settings (email + in-app).
        """
        from database.models import db, Appointment, DoctorNotificationSetting, NotificationPreference
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return

        doctor_id  = appointment.doctor_id
        patient_id = appointment.patient_id

        subject = f"NeuroNest — {event_type.replace('_', ' ').title()} Notification"

        # ── 1. DOCTOR ────────────────────────────────────────────────
        doctor_settings = DoctorNotificationSetting.query.filter_by(doctor_user_id=doctor_id).first()
        if not doctor_settings:
            doctor_settings = DoctorNotificationSetting(doctor_user_id=doctor_id)
            db.session.add(doctor_settings)
            db.session.commit()

        doctor_msg = NotificationService._generate_message(appointment, event_type, recipient_role="doctor")

        # In-app (respects setting)
        if doctor_settings.in_app_notifications:
            NotificationService.send_in_app(
                user_id=doctor_id,
                title=f"Clinical Update: {event_type.replace('_', ' ').title()}",
                message=doctor_msg,
                payload={"appointment_id": appointment.id, "event_type": event_type}
            )

        # Email (respects setting)
        if doctor_settings.email_on_booking:
            try:
                NotificationService.send_email(appointment.doctor.email, subject, doctor_msg, event_type=event_type)
            except Exception as e:
                print(f"[NOTIFICATION] Doctor email failed: {e}")

        # ── 2. PATIENT ───────────────────────────────────────────────
        patient_settings = NotificationPreference.query.filter_by(user_id=patient_id).first()
        if not patient_settings:
            patient_settings = NotificationPreference(user_id=patient_id)
            db.session.add(patient_settings)
            db.session.commit()

        patient_msg = NotificationService._generate_message(appointment, event_type, recipient_role="patient")

        # In-app (respects setting)
        NotificationService.send_in_app(
            user_id=patient_id,
            title=f"Health Update: {event_type.replace('_', ' ').title()}",
            message=patient_msg,
            notif_type="appointment",
            payload={"appointment_id": appointment.id, "event_type": event_type}
        )

        # Email (respects setting)
        if patient_settings.email_appointments:
            try:
                NotificationService.send_email(appointment.patient.email, subject, patient_msg, event_type=event_type)
            except Exception as e:
                print(f"[NOTIFICATION] Patient email failed: {e}")

        # SMS (respects setting)
        if patient_settings.sms_appointments:
            phone = appointment.patient.patient_profile.phone if appointment.patient.patient_profile else None
            if phone:
                NotificationService.send_sms(phone, patient_msg)

        # ── 3. FEEDBACK REQUEST (Health Surveys setting) ──
        if event_type == "completed":
            NotificationService.send_in_app(
                user_id=patient_id,
                title="How was your visit?",
                message=f"Please take a moment to share your feedback about your recent consultation with Dr. {doctor_name}.",
                notif_type="feedback",
                email_subject=f"BrainNest Feedback: How was your visit with Dr. {doctor_name}?",
                payload={"appointment_id": appointment.id}
            )

    @staticmethod
    def send_in_app(user_id, title, message, payload=None, notif_type="appointment", email_subject=None, email_event_type=None):
        from database.models import db, InAppNotification, User, NotificationPreference, DoctorNotificationSetting
        
        user = User.query.get(user_id)
        if not user: return

        # ── 1. PREFERENCE CHECK (In-App) ──
        should_send_in_app = True
        pref = None
        d_pref = None

        if user.role == "patient":
            pref = NotificationPreference.query.filter_by(user_id=user_id).first()
            if not pref:
                pref = NotificationPreference(user_id=user_id)
                db.session.add(pref)
                db.session.commit()
            
            if notif_type == "appointment": should_send_in_app = pref.inapp_appointments
            elif notif_type == "prescription": should_send_in_app = pref.inapp_prescriptions
            elif notif_type == "vitals_alert": should_send_in_app = pref.inapp_alerts
            elif notif_type == "message": should_send_in_app = pref.inapp_messages
            elif notif_type == "announcement": should_send_in_app = pref.inapp_announcements
            elif notif_type == "feedback": should_send_in_app = pref.email_feedback # Patient profile doesn't have inapp_feedback, use email_feedback as proxy for all feedback request
        else: # Doctor
            d_pref = DoctorNotificationSetting.query.filter_by(doctor_user_id=user_id).first()
            if not d_pref:
                d_pref = DoctorNotificationSetting(doctor_user_id=user_id)
                db.session.add(d_pref)
                db.session.commit()
            should_send_in_app = d_pref.in_app_notifications

        # ── 2. EXECUTE In-App ──
        if should_send_in_app:
            notif = InAppNotification(
                user_id=user_id,
                title=title,
                message=message,
                payload=payload,
                type=notif_type
            )
            db.session.add(notif)
            db.session.commit()
            
            try:
                from extensions.socket import socketio
                socketio.emit('new_in_app_notification', notif.to_dict(), room=f"user_{user_id}")
            except Exception:
                pass

        # ── 3. OPTIONAL EMAIL (Respecting Preferences) ──
        if email_subject and user.email:
            should_send_email = False
            if user.role == "patient":
                if notif_type == "vitals_alert":  should_send_email = pref.email_alerts
                elif notif_type == "prescription": should_send_email = pref.email_prescriptions
                elif notif_type == "appointment":  should_send_email = pref.email_appointments
                elif notif_type == "message":      should_send_email = pref.email_messages
                elif notif_type == "announcement": should_send_email = pref.email_announcements
                elif notif_type == "feedback":     should_send_email = pref.email_feedback
                else: should_send_email = True
                print(f"[NOTIF] Patient (UID: {user_id}) Email Pref Eval: {should_send_email} (type: {notif_type})")
            else:
                if notif_type == "vitals_alert": should_send_email = d_pref.email_on_alerts
                else: should_send_email = d_pref.email_on_booking
                print(f"[NOTIF] Doctor (UID: {user_id}) Email Pref Eval: {should_send_email} (type: {notif_type})")

            if should_send_email:
                print(f"[NOTIF] ✅ E-mail Preference: True. Sending to {user.email}")
                try:
                    NotificationService.send_email(user.email, email_subject, message, event_type=email_event_type)
                except Exception as e:
                    print(f"[NOTIFICATION] Auto-email failed for user {user_id}: {e}")
            else:
                print(f"[NOTIF] ❌ E-mail Preference: False (type: {notif_type}). Skipping.")

    @staticmethod
    def notify_critical_vitals(patient_id, alert):
        """Standardized notification for clinical vital alerts."""
        from database.models import User, Appointment
        patient = User.query.get(patient_id)
        if not patient: return

        subject = f"🚨 Critical Health Alert: {alert.vital_type} - {patient.full_name}"
        # Display both IST (UTC+5.5) and UTC for convenience
        ist_time = alert.created_at + timedelta(hours=5, minutes=30)
        time_display = f"{ist_time.strftime('%b %d, %I:%M %p')} IST / {alert.created_at.strftime('%I:%M %p')} UTC"

        msg = (
            f"A critical health alert has been triggered for {patient.full_name}.\n\n"
            f"Vital: {alert.vital_type}\n"
            f"Value: {alert.value}\n"
            f"Message: {alert.message}\n"
            f"Time: {time_display}\n\n"
            f"Immediate review is required."
        )

        # 1. Notify Patient (Forcing email for nezrinnoushad20@gmail.com)
        force_email = (patient.email == 'nezrinnoushad20@gmail.com')
        
        NotificationService.send_in_app(
            user_id=patient_id,
            title=f"Critical {alert.vital_type} Alert",
            message=msg,
            notif_type="vitals_alert",
            email_subject=subject,
            email_event_type="critical"
        )
        
        # If it's the target patient and they somehow have email alerts off, we send it anyway 
        # as per strict requirement, OR we just trust send_in_app if we ensured prefs are true.
        # To be 100% sure as per "Send an immediate email alert":
        if force_email:
             NotificationService.send_email(patient.email, subject, msg, event_type="critical")

        # 2. Notify Assigned Doctor
        appointment = Appointment.query.filter_by(patient_id=patient_id).order_by(Appointment.created_at.desc()).first()
        if appointment and appointment.doctor:
            NotificationService.send_in_app(
                user_id=appointment.doctor_id,
                title=f"Patient Vital Critical: {patient.full_name}",
                message=msg,
                notif_type="vitals_alert",
                email_subject=subject,
                email_event_type="critical"
            )

    @staticmethod
    def notify_prescription_event(prescription_id):
        from database.models import db, User
        from models.prescription_models import Prescription
        p = Prescription.query.get(prescription_id)
        if not p: return

        patient = User.query.get(p.patient_id)
        doctor = User.query.get(p.doctor_id)
        if not patient or not doctor: return

        msg = (
            f"Dear {patient.full_name},\n\n"
            f"Dr. {doctor.full_name} has issued a new medical prescription for you.\n\n"
            f"Diagnosis: {p.diagnosis}\n"
            f"Notes: {p.notes or 'None'}\n\n"
            f"Please log in to your dashboard to view the full medication schedule and instructions."
        )

        NotificationService.send_in_app(
            user_id=patient.id,
            title="New Prescription Issued",
            message=msg,
            notif_type="prescription",
            email_subject="New Prescription from NeuroNest",
            email_event_type="approved"
        )

    @staticmethod
    def _build_html_email(subject, body, event_type=None):
        """Returns a professional HTML email for NeuroNest notifications."""
        # Choose accent colour based on event type
        colour_map = {
            "new_booking":  {"accent": "#2563EB", "badge_bg": "#DBEAFE", "badge_text": "#1D4ED8", "label": "New Booking"},
            "approved":     {"accent": "#16A34A", "badge_bg": "#DCFCE7", "badge_text": "#166534", "label": "Confirmed ✓"},
            "rejected":     {"accent": "#DC2626", "badge_bg": "#FEE2E2", "badge_text": "#991B1B", "label": "Not Accepted"},
            "cancelled":    {"accent": "#F59E0B", "badge_bg": "#FEF9C3", "badge_text": "#92400E", "label": "Cancelled"},
            "rescheduled":  {"accent": "#7C3AED", "badge_bg": "#EDE9FE", "badge_text": "#5B21B6", "label": "Rescheduled"},
            "completed":    {"accent": "#0EA5E9", "badge_bg": "#E0F2FE", "badge_text": "#0369A1", "label": "Completed"},
            "critical":     {"accent": "#EF4444", "badge_bg": "#FEE2E2", "badge_text": "#B91C1C", "label": "Critical Alert 🔴"},
        }
        c = colour_map.get(event_type, {"accent": "#2563EB", "badge_bg": "#DBEAFE", "badge_text": "#1D4ED8", "label": "Update"})

        # Convert plain body to HTML paragraphs
        body_html = "".join(f"<p style='margin:0 0 12px 0;'>{line}</p>" for line in body.strip().split("\n") if line.strip())

        return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{subject}</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background:{c['accent']};border-radius:16px 16px 0 0;padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🧠 NeuroNest</div>
                <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Healthcare Management Platform</div>
              </td>
              <td align="right">
                <span style="background:rgba(255,255,255,0.2);color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">{c['label']}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#FFFFFF;padding:40px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
          <h2 style="margin:0 0 8px 0;color:#0F172A;font-size:20px;font-weight:700;">{subject}</h2>
          <div style="width:40px;height:3px;background:{c['accent']};border-radius:2px;margin-bottom:24px;"></div>

          <div style="color:#334155;font-size:15px;line-height:1.7;">
            {body_html}
          </div>

          <!-- DIVIDER -->
          <div style="border-top:1px solid #E2E8F0;margin:28px 0;"></div>

          <!-- STATUS BADGE -->
          <div style="background:{c['badge_bg']};border:1px solid {c['accent']}30;border-radius:10px;padding:14px 18px;display:inline-block;">
            <span style="color:{c['badge_text']};font-size:13px;font-weight:700;">
              Status: {c['label']}
            </span>
          </div>

          <p style="margin:28px 0 0 0;color:#64748B;font-size:13px;">
            If you have any questions, please contact your NeuroNest care coordinator or log in to your dashboard.
          </p>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#F1F5F9;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#94A3B8;font-size:12px;">
                © 2026 NeuroNest · Healthcare Management Platform<br>
                <span style="font-size:11px;">This is an automated notification. Please do not reply to this email.</span>
              </td>
              <td align="right">
                <a href="https://neuro-nest-two.vercel.app" style="background:{c['accent']};color:#fff;font-size:12px;font-weight:700;padding:8px 16px;border-radius:8px;text-decoration:none;">Open Dashboard →</a>
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    @staticmethod
    def send_email(recipient, subject, body, event_type=None):
        import urllib.request
        import urllib.error
        import json

        resend_sender = os.getenv("RESEND_FROM", "onboarding@resend.dev")

        # TEST_EMAIL_OVERRIDE: redirect all emails to one inbox in dev/demo
        test_override = os.getenv("TEST_EMAIL_OVERRIDE")
        actual_recipient = test_override or recipient
        if test_override:
            body = f"[DEV MODE] Intended for: {recipient}\n\n{body}"
            print(f"[EMAIL] TEST OVERRIDE active — redirecting {recipient} → {test_override}")

        # Build HTML version
        html_body = NotificationService._build_html_email(subject, body, event_type)

        # ── PRIMARY: Brevo ─────────────────────────────────────────
        brevo_api_key = os.getenv("BREVO_API_KEY")
        if brevo_api_key:
            try:
                payload = json.dumps({
                    "sender": {"name": "NeuroNest", "email": os.getenv("BREVO_FROM_EMAIL", "neuronest4@gmail.com")},
                    "to": [{"email": actual_recipient}],
                    "subject": subject,
                    "htmlContent": html_body,
                    "textContent": body,
                }).encode("utf-8")
                req = urllib.request.Request(
                    "https://api.brevo.com/v3/smtp/email",
                    data=payload,
                    headers={"api-key": brevo_api_key, "Content-Type": "application/json", "Accept": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    json.loads(resp.read())
                    print(f"[EMAIL] Brevo HTML SUCCESS → {actual_recipient}")
                    return True
            except urllib.error.HTTPError as e:
                print(f"[EMAIL ERROR] Brevo HTTP {e.code}: {e.read().decode('utf-8')}")
            except Exception as e:
                print(f"[EMAIL ERROR] Brevo: {type(e).__name__}: {e}")


                req = urllib.request.Request(
                    "https://api.brevo.com/v3/smtp/email",
                    data=payload,
                    headers={
                        "api-key": brevo_api_key,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    result = json.loads(resp.read())
                    print(f"[EMAIL] Brevo SUCCESS → {actual_recipient} (intended: {recipient})")
                    return True
            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8")
                print(f"[EMAIL ERROR] Brevo HTTP {e.code}: {error_body}")
                # Fall through to Resend below
            except Exception as e:
                print(f"[EMAIL ERROR] Brevo failed: {type(e).__name__}: {e}")
                # Fall through to Resend below

        # ---------------------------------------------------------------
        # FALLBACK: Resend API — free plan only sends to own email unless
        # a domain is verified. Set RESEND_API_KEY in Render.
        # ---------------------------------------------------------------
        resend_api_key = os.getenv("RESEND_API_KEY")
        if resend_api_key:
            try:
                sender = os.getenv("RESEND_FROM", "onboarding@resend.dev")
                payload = json.dumps({
                    "from": f"NeuroNest <{sender}>",
                    "to": [actual_recipient],
                    "subject": subject,
                    "text": body,
                }).encode("utf-8")

                req = urllib.request.Request(
                    "https://api.resend.com/emails",
                    data=payload,
                    headers={
                        "Authorization": f"Bearer {resend_api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "python-httpx/0.23.0",
                        "Accept": "application/json",
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    result = json.loads(resp.read())
                    print(f"[EMAIL] Resend SUCCESS → {actual_recipient} (intended: {recipient})")
                    return True
            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8")
                print(f"[EMAIL ERROR] Resend HTTP {e.code}: {error_body}")
                return False
            except Exception as e:
                print(f"[EMAIL ERROR] Resend failed: {type(e).__name__}: {e}")
                return False

        # --- Fallback: SMTP (may be blocked by Render on free plan) ---
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = os.getenv("SMTP_PORT", 587)
        smtp_pass = os.getenv("SMTP_PASS")
        smtp_user = os.getenv("smtp_user") # lowercase from the setup in app.py

        if not all([smtp_host, smtp_user, smtp_pass]):
            print(f"[EMAIL] No RESEND_API_KEY and no SMTP config. Cannot send email to {recipient}.")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = recipient
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            server = smtplib.SMTP(smtp_host, int(smtp_port), timeout=15)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
            print(f"[EMAIL] SMTP SUCCESS to {recipient}")
            return True
        except Exception as e:
            print(f"[EMAIL ERROR] SMTP failed: {type(e).__name__}: {e}")
            return False

    @staticmethod
    def send_sms(phone_number, message):
        twilio_sid = os.getenv("TWILIO_SID")
        twilio_auth = os.getenv("TWILIO_AUTH")
        twilio_phone = os.getenv("TWILIO_FROM_PHONE")

        if twilio_sid and twilio_auth and twilio_phone:
            try:
                from twilio.rest import Client
                client = Client(twilio_sid, twilio_auth)
                msg_obj = client.messages.create(
                    body=message,
                    from_=twilio_phone,
                    to=phone_number
                )
                print(f"[TWILIO SMS] Sent to {phone_number}, SID: {msg_obj.sid}")
                return True
            except Exception as e:
                print(f"[TWILIO ERROR] {e}")

        # Fallback to console logging if Twilio is not configured or fails
        print(f"[SIMULATED SMS] To: {phone_number}, Message: {message}")
        return True

    @staticmethod
    def _generate_message(appointment, event_type, recipient_role="doctor"):
        patient_name = appointment.patient.full_name
        doctor_name = appointment.doctor.full_name
        patient_name_full = appointment.patient.full_name
        apt_date = appointment.appointment_date.strftime("%B %d, %Y")
        apt_time = appointment.appointment_time.strftime("%I:%M %p")
        reason   = appointment.reason or "General consultation"
        priority = (appointment.priority_level or "routine").title()

        if recipient_role == "doctor":
            if event_type == "new_booking":
                return (
                    f"Dear Dr. {doctor_name},\n\n"
                    f"A new appointment request has been submitted by your patient {patient_name_full}.\n\n"
                    f"Appointment Details:\n"
                    f"  • Date       : {apt_date}\n"
                    f"  • Time       : {apt_time}\n"
                    f"  • Reason     : {reason}\n"
                    f"  • Priority   : {priority}\n\n"
                    f"Please log in to your NeuroNest dashboard to review and approve or reschedule this request at your earliest convenience."
                )
            elif event_type == "cancelled":
                return (
                    f"Dear Dr. {doctor_name},\n\n"
                    f"We would like to inform you that the appointment scheduled with {patient_name_full} "
                    f"on {apt_date} at {apt_time} has been cancelled.\n\n"
                    f"Reason for visit was: {reason}.\n\n"
                    f"The slot is now available for other patients. You may log in to your dashboard to manage your schedule."
                )
            elif event_type == "rescheduled":
                return (
                    f"Dear Dr. {doctor_name},\n\n"
                    f"Your patient {patient_name_full} has requested a reschedule of their appointment.\n\n"
                    f"Updated Appointment Details:\n"
                    f"  • New Date   : {apt_date}\n"
                    f"  • New Time   : {apt_time}\n"
                    f"  • Reason     : {reason}\n\n"
                    f"Please review the updated schedule in your NeuroNest dashboard and confirm availability."
                )
            elif event_type == "approved":
                return (
                    f"Dear Dr. {doctor_name},\n\n"
                    f"The appointment with {patient_name_full} on {apt_date} at {apt_time} has been confirmed and added to your schedule.\n\n"
                    f"Appointment Details:\n"
                    f"  • Date       : {apt_date}\n"
                    f"  • Time       : {apt_time}\n"
                    f"  • Reason     : {reason}\n\n"
                    f"You can review full patient details and clinical notes in your NeuroNest dashboard."
                )
            elif event_type == "rejected":
                return (
                    f"Dear Dr. {doctor_name},\n\n"
                    f"The appointment request from {patient_name_full} scheduled for {apt_date} at {apt_time} has been declined.\n\n"
                    f"The patient will be notified and may submit a new request at a different time. "
                    f"No further action is required from your side at this moment."
                )
            elif event_type == "completed":
                return (
                    f"Dear Dr. {doctor_name},\n\n"
                    f"The appointment with {patient_name_full} on {apt_date} has been successfully marked as completed.\n\n"
                    f"Please ensure that any clinical notes, prescriptions, or follow-up instructions have been recorded "
                    f"in the patient's profile on your NeuroNest dashboard.\n\n"
                    f"Thank you for your continued dedication to patient care."
                )

        else:  # Patient
            if event_type == "new_booking":
                return (
                    f"Dear {patient_name_full},\n\n"
                    f"Your appointment request has been successfully submitted and is now awaiting approval from Dr. {doctor_name}.\n\n"
                    f"Appointment Details:\n"
                    f"  • Doctor     : Dr. {doctor_name}\n"
                    f"  • Date       : {apt_date}\n"
                    f"  • Time       : {apt_time}\n"
                    f"  • Reason     : {reason}\n"
                    f"  • Priority   : {priority}\n\n"
                    f"You will receive another notification once the doctor reviews your request. "
                    f"You can track the status of your appointment in your NeuroNest patient dashboard."
                )
            elif event_type == "cancelled":
                return (
                    f"Dear {patient_name_full},\n\n"
                    f"We regret to inform you that your appointment with Dr. {doctor_name} on {apt_date} at {apt_time} has been cancelled.\n\n"
                    f"If you would like to reschedule, please log in to your NeuroNest dashboard and book a new slot at your convenience. "
                    f"We apologise for any inconvenience caused."
                )
            elif event_type == "rescheduled":
                return (
                    f"Dear {patient_name_full},\n\n"
                    f"Your appointment with Dr. {doctor_name} has been rescheduled to a new time.\n\n"
                    f"Updated Appointment Details:\n"
                    f"  • Doctor     : Dr. {doctor_name}\n"
                    f"  • New Date   : {apt_date}\n"
                    f"  • New Time   : {apt_time}\n\n"
                    f"Please log in to your NeuroNest dashboard to confirm this new schedule. "
                    f"If this time does not work for you, you may contact the clinic to arrange an alternative."
                )
            elif event_type == "approved":
                return (
                    f"Dear {patient_name_full},\n\n"
                    f"Great news! Your appointment with Dr. {doctor_name} has been confirmed.\n\n"
                    f"Appointment Details:\n"
                    f"  • Doctor     : Dr. {doctor_name}\n"
                    f"  • Date       : {apt_date}\n"
                    f"  • Time       : {apt_time}\n"
                    f"  • Reason     : {reason}\n\n"
                    f"Please arrive 10 minutes before your scheduled time. You can view full details "
                    f"and manage your appointments through your NeuroNest patient dashboard."
                )
            elif event_type == "rejected":
                return (
                    f"Dear {patient_name_full},\n\n"
                    f"We regret to inform you that your appointment request with Dr. {doctor_name} "
                    f"on {apt_date} at {apt_time} could not be accommodated at this time.\n\n"
                    f"This may be due to scheduling conflicts or unavailability. "
                    f"We encourage you to log in to your NeuroNest dashboard and select an alternative date or doctor. "
                    f"We apologise for the inconvenience."
                )
            elif event_type == "completed":
                return (
                    f"Dear {patient_name_full},\n\n"
                    f"Your appointment with Dr. {doctor_name} on {apt_date} has been successfully completed. "
                    f"We hope your experience was positive and your health concern was addressed.\n\n"
                    f"Any prescriptions, clinical notes, or follow-up instructions from Dr. {doctor_name} have been recorded "
                    f"in your NeuroNest patient profile. You can access them anytime through your dashboard.\n\n"
                    f"Thank you for choosing NeuroNest for your healthcare needs. "
                    f"Wishing you good health!"
                )

        return (
            f"Dear User,\n\n"
            f"There has been an update regarding your appointment with Dr. {doctor_name} "
            f"and patient {patient_name_full} on {apt_date} at {apt_time}.\n\n"
            f"Please log in to your NeuroNest dashboard for full details."
        )
