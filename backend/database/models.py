from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from sqlalchemy import UniqueConstraint, CheckConstraint, Index, Enum as SAEnum

db = SQLAlchemy()


# =========================================
# USER TABLE
# =========================================
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default="patient")
    full_name = db.Column(db.String(100))

    # Account Control Fields
    account_status = db.Column(db.String(20), default="active") # active, suspended, deleted
    is_email_verified = db.Column(db.Boolean, default=False)
    is_phone_verified = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False) # Clinical/Medical verification

    # Canonical verification flags used by application code.
    is_deleted = db.Column(db.Boolean, default=False)
    preferred_language = db.Column(db.String(20), default="en")
    is_two_factor_enabled = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# =========================================
# PATIENT PROFILE TABLE
# =========================================
class PatientProfile(db.Model):
    __tablename__ = "patient_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    full_name = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    blood_group = db.Column(db.String(5))
    height_cm = db.Column(db.Integer)
    weight_kg = db.Column(db.Integer)

    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    country = db.Column(db.String(100))
    pincode = db.Column(db.String(20))

    allergies = db.Column(db.Text)
    chronic_conditions = db.Column(db.Text)

    profile_image = db.Column(db.String(255))

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationship
    user = db.relationship("User", backref=db.backref("patient_profile", uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "phone": self.phone,
            "date_of_birth": str(self.date_of_birth) if self.date_of_birth else None,
            "gender": self.gender,
            "blood_group": self.blood_group,
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "pincode": self.pincode,
            "allergies": self.allergies,
            "chronic_conditions": self.chronic_conditions,
            "profile_image": self.profile_image,
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z',
        }


# =========================================
# EMERGENCY CONTACT TABLE
# =========================================
class EmergencyContact(db.Model):
    __tablename__ = "emergency_contacts"

    id = db.Column(db.Integer, primary_key=True)

    # ✅ FIXED FOREIGN KEY
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patient_profiles.id"),
        nullable=False
    )

    contact_name = db.Column(db.String(100), nullable=False)
    relationship = db.Column(db.String(50))
    phone = db.Column(db.String(20), nullable=False)
    alternate_phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    is_primary = db.Column(db.Boolean, default=True)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "contact_name": self.contact_name,
            "relationship": self.relationship,
            "phone": self.phone,
            "alternate_phone": self.alternate_phone,
            "email": self.email,
            "is_primary": self.is_primary,
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z',
        }


# =========================================
# NOTIFICATION PREFERENCES TABLE (Patient)
# =========================================
class NotificationPreference(db.Model):
    __tablename__ = "notification_preferences"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Email
    email_appointments = db.Column(db.Boolean, default=True)
    email_prescriptions = db.Column(db.Boolean, default=True)
    email_messages = db.Column(db.Boolean, default=True)
    email_announcements = db.Column(db.Boolean, default=True)
    email_feedback = db.Column(db.Boolean, default=True)
    email_alerts = db.Column(db.Boolean, default=True)

    # SMS
    sms_appointments = db.Column(db.Boolean, default=False)
    sms_prescriptions = db.Column(db.Boolean, default=False)
    sms_messages = db.Column(db.Boolean, default=False)
    sms_announcements = db.Column(db.Boolean, default=False)

    # In-App
    inapp_appointments = db.Column(db.Boolean, default=True)
    inapp_prescriptions = db.Column(db.Boolean, default=True)
    inapp_messages = db.Column(db.Boolean, default=True)
    inapp_announcements = db.Column(db.Boolean, default=True)
    inapp_alerts = db.Column(db.Boolean, default=True)

    allow_doctor_followup = db.Column(db.Boolean, default=True)
    allow_promotions = db.Column(db.Boolean, default=False)
    allow_anonymous_feedback = db.Column(db.Boolean, default=True)
    share_history_with_doctors = db.Column(db.Boolean, default=True)
    allow_analytics = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship("User", backref=db.backref("notification_preferences", uselist=False))
    
# =========================================
# APPOINTMENTS TABLE
# =========================================
class Appointment(db.Model):
    __tablename__ = "appointments"
 
    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    slot_id = db.Column(
        db.Integer,
        db.ForeignKey("appointment_slots.id"),
        nullable=True,
        index=True
    )

    reason = db.Column(db.String(255))
    notes = db.Column(db.Text)

    status = db.Column(
        db.String(50),
        default="pending"  # pending / approved / rejected / cancelled / completed
    )
    booking_mode = db.Column(
        SAEnum("auto_confirm", "doctor_approval", name="booking_mode_enum"),
        nullable=False,
        default="doctor_approval"
    )
    delay_reason = db.Column(db.Text, nullable=True)
    extended_from_appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        nullable=True
    )
    priority_level = db.Column(
        db.String(50),
        default="routine"  # routine / urgent / emergency
    )
    consultation_type = db.Column(
        db.String(20),
        default="in_person"  # in_person / online
    )
    join_enabled_patient_time = db.Column(db.DateTime, nullable=True)
    join_enabled_doctor_time = db.Column(db.DateTime, nullable=True)
    doctor_joined_at = db.Column(db.DateTime, nullable=True)
    patient_joined_at = db.Column(db.DateTime, nullable=True)
    call_started_at = db.Column(db.DateTime, nullable=True)
    call_status = db.Column(
        db.String(20),
        default="scheduled"  # scheduled / waiting / ongoing / completed / missed
    )
    reminder_30_sent_at = db.Column(db.DateTime, nullable=True)
    reminder_10_sent_at = db.Column(db.DateTime, nullable=True)
    popup_shown_at = db.Column(db.DateTime, nullable=True)
    missed_notified_at = db.Column(db.DateTime, nullable=True)
    video_room_id = db.Column(db.String(100), nullable=True, index=True)

    # Reschedule tracking
    rescheduled_by = db.Column(db.String(20), nullable=True) # "doctor" / "patient"
    old_date_time = db.Column(db.DateTime, nullable=True)
    new_date_time = db.Column(db.DateTime, nullable=True)
    reschedule_reason = db.Column(db.Text, nullable=True)
    reschedule_status = db.Column(db.String(20), nullable=True) # "Pending" / "Approved" / "Rejected"


    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    feedback_given = db.Column(db.Boolean, default=False)


    # Relationships
    patient = db.relationship("User", foreign_keys=[patient_id], backref="patient_appointments")
    doctor = db.relationship("User", foreign_keys=[doctor_id], backref="doctor_appointments")
    slot = db.relationship("AppointmentSlot", foreign_keys=[slot_id], backref="appointment", uselist=False)

    # =========================================
    # RETURN JSON DATA
    # =========================================
    def _resolved_schedule_datetime(self):
        """Returns a timezone-aware UTC datetime for the appointment."""
        if self.slot and self.slot.slot_start_utc:
            dt = self.slot.slot_start_utc
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)

        if not self.appointment_date or not self.appointment_time:
            return None

        dt = datetime.combine(self.appointment_date, self.appointment_time)
        return dt.replace(tzinfo=timezone.utc)

    def _appointment_datetime(self):
        return self._resolved_schedule_datetime()

    def _join_window_values(self):
        appt_dt = self._appointment_datetime()
        patient_dt = self.join_enabled_patient_time
        doctor_dt = self.join_enabled_doctor_time
        if appt_dt:
            if patient_dt is None:
                patient_dt = appt_dt - timedelta(minutes=10)
            if doctor_dt is None:
                doctor_dt = appt_dt - timedelta(minutes=5)
        return appt_dt, patient_dt, doctor_dt

    def _call_state(self):
        now = datetime.now(timezone.utc)
        appt_dt, patient_join_time, doctor_join_time = self._join_window_values()
        
        # Ensure UTC awareness
        if appt_dt and appt_dt.tzinfo is None: appt_dt = appt_dt.replace(tzinfo=timezone.utc)
        if patient_join_time and patient_join_time.tzinfo is None: patient_join_time = patient_join_time.replace(tzinfo=timezone.utc)
        if doctor_join_time and doctor_join_time.tzinfo is None: doctor_join_time = doctor_join_time.replace(tzinfo=timezone.utc)

        patient_joined = bool(self.patient_joined_at)
        doctor_joined = bool(self.doctor_joined_at)
        both_joined = patient_joined and doctor_joined
        status = (self.call_status or "scheduled").lower()

        if status not in {"scheduled", "waiting", "ongoing", "completed", "missed"}:
            status = "scheduled"

        if status == "ongoing" and not self.call_started_at and both_joined:
            status = "waiting"

        if status in {"scheduled", "waiting"} and appt_dt and now >= (appt_dt + timedelta(minutes=30)) and not both_joined:
            status = "missed"

        join_allowed_status = status in {"scheduled", "waiting", "ongoing"}
        patient_can_join = bool(patient_join_time and now >= patient_join_time and join_allowed_status)
        doctor_can_join = bool(doctor_join_time and now >= doctor_join_time and join_allowed_status)

        waiting_for = None
        if patient_joined and not doctor_joined:
            waiting_for = "doctor"
        elif doctor_joined and not patient_joined:
            waiting_for = "patient"

        return {
            "status": status,
            "appointment_time": appt_dt,
            "patient_join_time": patient_join_time,
            "doctor_join_time": doctor_join_time,
            "patient_joined": patient_joined,
            "doctor_joined": doctor_joined,
            "both_joined": both_joined,
            "patient_can_join": patient_can_join,
            "doctor_can_join": doctor_can_join,
            "waiting_for": waiting_for,
        }

    def to_dict(self):
        state = self._call_state()
        resolved_dt = self._resolved_schedule_datetime()
        ist_dt = resolved_dt.astimezone(ZoneInfo("Asia/Kolkata")) if resolved_dt else None
        utc_dt = resolved_dt.astimezone(timezone.utc) if resolved_dt else None
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "patient_name": self.patient.full_name if self.patient else f"Patient #{self.patient_id}",
            "patient_image": self.patient.patient_profile.profile_image if self.patient and self.patient.patient_profile else None,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.full_name if self.doctor else None,
            # API contract: expose appointment_date/time in IST wall-clock for UI display and sorting.
            "appointment_date": str(ist_dt.date()) if ist_dt else str(self.appointment_date),
            "appointment_time": str(ist_dt.time().replace(microsecond=0)) if ist_dt else str(self.appointment_time),
            # Keep UTC timestamp for absolute-time operations.
            "appointment_start_utc": utc_dt.isoformat() if utc_dt else None,
            "slot_id": self.slot_id,
            "reason": self.reason,
            "notes": self.notes,
            "priority_level": self.priority_level,
            "consultation_type": self.consultation_type or "in_person",
            "status": self.status,
            "call_status": state["status"],
            "join_enabled_patient_time": state["patient_join_time"].isoformat() if state["patient_join_time"] else None,
            "join_enabled_doctor_time": state["doctor_join_time"].isoformat() if state["doctor_join_time"] else None,
            "patient_joined_at": self.patient_joined_at.isoformat() if self.patient_joined_at else None,
            "doctor_joined_at": self.doctor_joined_at.isoformat() if self.doctor_joined_at else None,
            "call_started_at": self.call_started_at.isoformat() if self.call_started_at else None,
            "popup_shown": bool(self.popup_shown_at),
            "popup_shown_at": self.popup_shown_at.isoformat() if self.popup_shown_at else None,
            "call_state": {
                "patient_can_join_now": state["patient_can_join"],
                "doctor_can_join_now": state["doctor_can_join"],
                "patient_joined": state["patient_joined"],
                "doctor_joined": state["doctor_joined"],
                "both_joined": state["both_joined"],
                "waiting_for": state["waiting_for"],
                "appointment_started": state["status"] == "ongoing",
                "missed": state["status"] == "missed",
            },
            "booking_mode": self.booking_mode,
            "delay_reason": self.delay_reason,
            "extended_from_appointment_id": self.extended_from_appointment_id,
            "feedback_given": self.feedback_given,
            "rescheduled_by": self.rescheduled_by,
            "old_date_time": self.old_date_time.isoformat() if self.old_date_time else None,
            "new_date_time": self.new_date_time.isoformat() if self.new_date_time else None,
            "reschedule_reason": self.reschedule_reason,
            "reschedule_status": self.reschedule_status,
            "video_room_id": self.video_room_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


# =========================================
# APPOINTMENT SLOTS TABLE
# =========================================
class AppointmentSlot(db.Model):
    __tablename__ = "appointment_slots"
    __table_args__ = (
        UniqueConstraint("doctor_user_id", "slot_start_utc", name="uq_doctor_slot_start"),
        CheckConstraint("slot_end_utc > slot_start_utc", name="ck_slot_end_after_start"),
        Index("idx_slot_doctor_date_status", "doctor_user_id", "slot_date_local", "status"),
    )

    id = db.Column(db.Integer, primary_key=True)
    doctor_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    slot_start_utc = db.Column(db.DateTime(timezone=True), nullable=False, index=True)
    slot_end_utc = db.Column(db.DateTime(timezone=True), nullable=False)
    slot_date_local = db.Column(db.Date, nullable=False, index=True)
    status = db.Column(
        SAEnum("available", "held", "booked", "blocked", "cancelled", name="slot_status_enum"),
        nullable=False,
        default="available",
        index=True
    )
    held_by_patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    held_until_utc = db.Column(db.DateTime(timezone=True), nullable=True)
    booked_appointment_id = db.Column(db.Integer, nullable=True, index=True)
    source = db.Column(
        SAEnum("generated", "manual_override", "emergency_block", name="slot_source_enum"),
        nullable=False,
        default="generated"
    )
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    doctor_user = db.relationship("User", foreign_keys=[doctor_user_id], backref="appointment_slots")
    held_by_patient = db.relationship("User", foreign_keys=[held_by_patient_id], backref="held_slots")

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_user_id": self.doctor_user_id,
            "slot_start_utc": self.slot_start_utc.isoformat() if self.slot_start_utc else None,
            "slot_end_utc": self.slot_end_utc.isoformat() if self.slot_end_utc else None,
            "slot_date_local": str(self.slot_date_local),
            "status": self.status,
            "held_by_patient_id": self.held_by_patient_id,
            "held_until_utc": self.held_until_utc.isoformat() if self.held_until_utc else None,
            "booked_appointment_id": self.booked_appointment_id,
            "source": self.source,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# =========================================
# DOCTOR SLOT OVERRIDES (EMERGENCY BLOCKS)
# =========================================
class DoctorSlotOverride(db.Model):
    __tablename__ = "doctor_slot_overrides"
    __table_args__ = (
        CheckConstraint("scope IN ('full_day', 'range')", name="ck_slot_override_scope"),
        CheckConstraint(
            "(scope = 'full_day' AND start_time_utc IS NULL AND end_time_utc IS NULL) OR "
            "(scope = 'range' AND start_time_utc IS NOT NULL AND end_time_utc IS NOT NULL AND end_time_utc > start_time_utc)",
            name="ck_slot_override_time_scope",
        ),
        Index("idx_slot_override_doctor_date", "doctor_user_id", "override_date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    doctor_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    override_date = db.Column(db.Date, nullable=False, index=True)
    scope = db.Column(
        SAEnum("full_day", "range", name="slot_override_scope_enum"),
        nullable=False,
        default="full_day",
    )
    start_time_utc = db.Column(db.DateTime(timezone=True), nullable=True)
    end_time_utc = db.Column(db.DateTime(timezone=True), nullable=True)
    reason = db.Column(db.String(255), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    doctor_user = db.relationship("User", foreign_keys=[doctor_user_id], backref="slot_overrides")
    created_by_user = db.relationship("User", foreign_keys=[created_by], backref="created_slot_overrides")

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_user_id": self.doctor_user_id,
            "override_date": str(self.override_date),
            "scope": self.scope,
            "start_time_utc": self.start_time_utc.isoformat() if self.start_time_utc else None,
            "end_time_utc": self.end_time_utc.isoformat() if self.end_time_utc else None,
            "reason": self.reason,
            "created_by": self.created_by,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# =========================================
# SLOT EVENT LOGS
# =========================================
class SlotEventLog(db.Model):
    __tablename__ = "slot_event_logs"
    __table_args__ = (
        Index("idx_slot_event_doctor_created", "doctor_user_id", "created_at"),
        Index("idx_slot_event_slot_created", "slot_id", "created_at"),
    )

    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(80), nullable=False, index=True)
    doctor_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    slot_id = db.Column(db.Integer, db.ForeignKey("appointment_slots.id"), nullable=True, index=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=True, index=True)
    actor_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    source = db.Column(db.String(80), nullable=False, default="system")
    reason = db.Column(db.String(255), nullable=True)
    correlation_id = db.Column(db.String(100), nullable=True, index=True)
    previous_status = db.Column(db.String(50), nullable=True)
    new_status = db.Column(db.String(50), nullable=True)
    metadata_json = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    doctor_user = db.relationship("User", foreign_keys=[doctor_user_id], backref="slot_event_logs")
    actor_user = db.relationship("User", foreign_keys=[actor_user_id], backref="slot_events_by_actor")
    slot = db.relationship("AppointmentSlot", foreign_keys=[slot_id], backref="event_logs")
    appointment = db.relationship("Appointment", foreign_keys=[appointment_id], backref="slot_event_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "event_type": self.event_type,
            "doctor_user_id": self.doctor_user_id,
            "slot_id": self.slot_id,
            "appointment_id": self.appointment_id,
            "actor_user_id": self.actor_user_id,
            "source": self.source,
            "reason": self.reason,
            "correlation_id": self.correlation_id,
            "previous_status": self.previous_status,
            "new_status": self.new_status,
            "metadata": self.metadata_json or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# =========================================
# DOCTOR SCHEDULE SETTINGS
# =========================================
class DoctorScheduleSetting(db.Model):
    __tablename__ = "doctor_schedule_settings"

    id = db.Column(db.Integer, primary_key=True)
    doctor_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True, index=True)
    slot_duration_minutes = db.Column(db.Integer, nullable=False, default=30)
    buffer_minutes = db.Column(db.Integer, nullable=False, default=10)
    approval_mode = db.Column(
        SAEnum("auto_confirm", "doctor_approval", name="approval_mode_enum"),
        nullable=False,
        default="doctor_approval"
    )
    accepting_new_bookings = db.Column(db.Boolean, nullable=False, default=True)
    timezone = db.Column(db.String(64), nullable=False, default="Asia/Kolkata")
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    doctor_user = db.relationship("User", backref=db.backref("schedule_setting", uselist=False))

    def to_dict(self):
        return {
            "doctor_user_id": self.doctor_user_id,
            "slot_duration_minutes": self.slot_duration_minutes,
            "buffer_minutes": self.buffer_minutes,
            "approval_mode": self.approval_mode,
            "accepting_new_bookings": self.accepting_new_bookings,
            "timezone": self.timezone,
        }


# =========================================
# DOCTOR NOTIFICATION SETTINGS
# =========================================
class DoctorNotificationSetting(db.Model):
    __tablename__ = "doctor_notification_settings"

    id = db.Column(db.Integer, primary_key=True)

    doctor_user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True
    )

    email_on_booking = db.Column(db.Boolean, default=True)
    sms_on_booking = db.Column(db.Boolean, default=False)
    in_app_notifications = db.Column(db.Boolean, default=True)
    email_on_alerts = db.Column(db.Boolean, default=True)

    reminder_before_minutes = db.Column(db.Integer, default=30)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    doctor = db.relationship("User", backref=db.backref("notification_setting", uselist=False))

    def to_dict(self):
        return {
            "email_on_booking": self.email_on_booking,
            "sms_on_booking": self.sms_on_booking,
            "in_app_notifications": self.in_app_notifications,
            "email_on_alerts": self.email_on_alerts,
            "reminder_before_minutes": self.reminder_before_minutes,
        }

# =========================================
# DOCTOR PRIVACY SETTINGS
# =========================================
class DoctorPrivacySetting(db.Model):
    __tablename__ = "doctor_privacy_settings"

    id = db.Column(db.Integer, primary_key=True)

    doctor_user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True
    )

    show_profile_publicly = db.Column(db.Boolean, default=True)
    show_consultation_fee = db.Column(db.Boolean, default=True)
    allow_chat_before_booking = db.Column(db.Boolean, default=True)
    allow_reviews_publicly = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    doctor = db.relationship("User", backref=db.backref("privacy_setting", uselist=False))

    def to_dict(self):
        return {
            "show_profile_publicly": self.show_profile_publicly,
            "show_consultation_fee": self.show_consultation_fee,
            "allow_chat_before_booking": self.allow_chat_before_booking,
            "allow_reviews_publicly": self.allow_reviews_publicly,
        }


# =========================================
# DOCTOR CONSULTATION SETTINGS
# =========================================
class DoctorConsultationSetting(db.Model):
    __tablename__ = "doctor_consultation_settings"

    id = db.Column(db.Integer, primary_key=True)

    doctor_user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True
    )

    consultation_fee = db.Column(db.Float, nullable=False, default=500.0)
    consultation_mode = db.Column(db.String(50), default="Online")
    cancellation_policy_hours = db.Column(db.Integer, default=24)
    auto_cancel_unpaid_minutes = db.Column(db.Integer, default=15)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    doctor = db.relationship("User", backref=db.backref("consultation_setting", uselist=False))

    def to_dict(self):
        return {
            "consultation_fee": self.consultation_fee,
            "consultation_mode": self.consultation_mode,
            "cancellation_policy_hours": self.cancellation_policy_hours,
            "auto_cancel_unpaid_minutes": self.auto_cancel_unpaid_minutes,
        }


# =========================================
# IN-APP NOTIFICATIONS
# =========================================
class InAppNotification(db.Model):
    __tablename__ = "in_app_notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False, default="info")
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    payload = db.Column(db.JSON, nullable=True)
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user = db.relationship("User", backref="notifications")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "metadata": self.payload or {},
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }



# =========================================
# CRITICAL ALERTS TABLE
# =========================================
class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    vital_type = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Float, nullable=True)
    severity = db.Column(db.String(20), nullable=False, default="critical")
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    is_acknowledged = db.Column(db.Boolean, default=False, nullable=False)
    acknowledged_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    acknowledged_at = db.Column(db.DateTime(timezone=True), nullable=True)

    patient = db.relationship("User", foreign_keys=[patient_id], backref=db.backref("alerts", lazy=True))
    acknowledged_user = db.relationship("User", foreign_keys=[acknowledged_by])

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "vital_type": self.vital_type,
            "value": self.value,
            "severity": self.severity,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_acknowledged": self.is_acknowledged,
            "acknowledged_by": self.acknowledged_by,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
        }



# =========================================
# MEDICAL RECORDS TABLE
# =========================================
class MedicalRecord(db.Model):
    __tablename__ = "medical_records"
    __table_args__ = (
        Index("idx_medical_records_patient_date", "patient_id", "record_date"),
        Index("idx_medical_records_patient_category", "patient_id", "category"),
    )

    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50), nullable=True)
    file_size_bytes = db.Column(db.BigInteger, nullable=True)
    
    doctor_name = db.Column(db.String(120))
    hospital_name = db.Column(db.String(200))
    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        nullable=True
    )
    
    description = db.Column(db.Text)
    notes = db.Column(db.Text)
    record_date = db.Column(db.Date)
    status = db.Column(db.String(30), nullable=False, default="active")
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    
    verified_by_doctor = db.Column(db.Boolean, default=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    tags = db.relationship("MedicalRecordTag", backref="record", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "title": self.title,
            "category": self.category,
            "file_path": self.file_path,
            "file_type": self.file_type,
            "file_size_bytes": self.file_size_bytes,
            "doctor_name": self.doctor_name,
            "hospital_name": self.hospital_name,
            "appointment_id": self.appointment_id,
            "description": self.description,
            "notes": self.notes,
            "record_date": str(self.record_date) if self.record_date else None,
            "status": self.status,
            "uploaded_by": self.uploaded_by,
            "tags": [tag.tag_name for tag in self.tags],
            "record_date": str(self.record_date) if self.record_date else None,
            "verified_by_doctor": self.verified_by_doctor,
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z',
        }


class MedicalRecordTag(db.Model):
    __tablename__ = "record_tags"
    __table_args__ = (
        UniqueConstraint("record_id", "tag_name", name="uq_record_tag_name"),
        Index("idx_record_tags_record_id", "record_id"),
        Index("idx_record_tags_tag_name", "tag_name"),
    )

    id = db.Column(db.Integer, primary_key=True)
    record_id = db.Column(db.Integer, db.ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=False)
    tag_name = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "record_id": self.record_id,
            "tag_name": self.tag_name,
            "created_at": self.created_at.isoformat() + 'Z',
        }


class PatientAllergy(db.Model):
    __tablename__ = "patient_allergies"
    __table_args__ = (
        UniqueConstraint("patient_id", "allergy_name", name="uq_patient_allergy_name"),
        Index("idx_patient_allergies_patient_status", "patient_id", "status"),
    )

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    allergy_name = db.Column(db.String(120), nullable=False)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_by_role = db.Column(db.String(20), nullable=False, default="patient")
    reaction = db.Column(db.String(255), nullable=True)
    severity = db.Column(db.String(20), nullable=False, default="mild")
    diagnosed_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(30), nullable=False, default="active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "allergy_name": self.allergy_name,
            "created_by_user_id": self.created_by_user_id,
            "created_by_role": self.created_by_role,
            "reaction": self.reaction,
            "severity": self.severity,
            "diagnosed_date": str(self.diagnosed_date) if self.diagnosed_date else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z',
        }


class PatientCondition(db.Model):
    __tablename__ = "patient_conditions"
    __table_args__ = (
        UniqueConstraint("patient_id", "condition_name", name="uq_patient_condition_name"),
        Index("idx_patient_conditions_patient_status", "patient_id", "status"),
    )

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    condition_name = db.Column(db.String(120), nullable=False)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_by_role = db.Column(db.String(20), nullable=False, default="patient")
    diagnosed_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(30), nullable=False, default="active")
    under_treatment = db.Column(db.Boolean, nullable=False, default=True)
    last_reviewed = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "condition_name": self.condition_name,
            "created_by_user_id": self.created_by_user_id,
            "created_by_role": self.created_by_role,
            "diagnosed_date": str(self.diagnosed_date) if self.diagnosed_date else None,
            "status": self.status,
            "under_treatment": self.under_treatment,
            "last_reviewed": str(self.last_reviewed) if self.last_reviewed else None,
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z',
        }


class PatientMedication(db.Model):
    __tablename__ = "patient_medications"
    __table_args__ = (
        Index("idx_patient_medications_patient_active", "patient_id", "status", "end_date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    drug_name = db.Column(db.String(150), nullable=False)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_by_role = db.Column(db.String(20), nullable=False, default="patient")
    dosage = db.Column(db.String(80), nullable=True)
    frequency = db.Column(db.String(80), nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    prescribed_by = db.Column(db.String(120), nullable=True)
    medication_origin = db.Column(db.String(30), nullable=False, default="past_external")
    source_hospital_name = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(30), nullable=False, default="active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "drug_name": self.drug_name,
            "created_by_user_id": self.created_by_user_id,
            "created_by_role": self.created_by_role,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "start_date": str(self.start_date) if self.start_date else None,
            "end_date": str(self.end_date) if self.end_date else None,
            "prescribed_by": self.prescribed_by,
            "medication_origin": self.medication_origin,
            "source_hospital_name": self.source_hospital_name,
            "status": self.status,
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z',
        }





# =========================================
# CLINICAL STRUCTURE TABLE (Hierarchy)
# =========================================
class ClinicalStructure(db.Model):
    __tablename__ = "clinical_structures"

    id = db.Column(db.Integer, primary_key=True)
    sector = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "sector": self.sector,
            "specialty": self.specialty,
            "is_active": self.is_active
        }


# =========================================
# DOCTOR PROFILE TABLE
# =========================================
class DoctorProfile(db.Model):
    __tablename__ = "doctor_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    specialization = db.Column(db.String(100))
    license_number = db.Column(db.String(50), unique=True)
    qualification = db.Column(db.String(100))
    experience_years = db.Column(db.Integer)
    department = db.Column(db.String(100))
    sector = db.Column(db.String(50), default="North Sector") # North, South, East, West
    
    phone = db.Column(db.String(20))
    gender = db.Column(db.String(20))
    dob = db.Column(db.Date)
    bio = db.Column(db.Text)
    hospital_name = db.Column(db.String(200))
    
    consultation_fee = db.Column(db.Float)
    consultation_mode = db.Column(db.String(50)) # Online/Offline/Both
    
    profile_image = db.Column(db.String(255)) 
    
    # --- Governance & Performance ---
    report_count = db.Column(db.Integer, default=0)
    critical_review_count = db.Column(db.Integer, default=0)
    missed_appointments_count = db.Column(db.Integer, default=0)
    avg_rating = db.Column(db.Float, default=5.0)
    risk_level = db.Column(db.String(20), default="low") # low, medium, high, critical
    # Doctor-specific status (synchronizes with User.account_status)
    # active, under_review, restricted, suspended, blocked
    doctor_status = db.Column(db.String(20), default="active") 

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )
    
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    user = db.relationship("User", backref=db.backref("doctor_profile", uselist=False))
    availability = db.relationship("DoctorAvailability", backref="doctor", lazy=True, cascade="all, delete-orphan")
    blocked_dates = db.relationship("DoctorBlockedDate", backref="doctor", lazy=True, cascade="all, delete-orphan")
    expertise_tags = db.relationship("DoctorExpertiseTag", backref="doctor", lazy=True, cascade="all, delete-orphan")
    experience = db.relationship("DoctorExperience", backref="doctor", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        # Dynamically fetch consultation settings to ensure it matches Settings -> Consultation Terms perfectly
        from database.models import DoctorConsultationSetting
        consultation = DoctorConsultationSetting.query.filter_by(doctor_user_id=self.user_id).first()
        actual_fee = consultation.consultation_fee if consultation else (self.consultation_fee or 500.0)
        actual_mode = consultation.consultation_mode if consultation else (self.consultation_mode or "Online")

        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.user.full_name if self.user else "Doctor",
            "specialization": self.specialization,
            "license_number": self.license_number,
            "qualification": self.qualification,
            "experience_years": self.experience_years,
            "department": self.department,
            "sector": self.sector,
            "phone": self.phone,
            "gender": self.gender,
            "dob": str(self.dob) if self.dob else None,
            "bio": self.bio,
            "hospital_name": self.hospital_name,
            "consultation_fee": actual_fee,
            "consultation_mode": actual_mode,
            "profile_image": self.profile_image,
            "telemetry": {
                "report_count": self.report_count,
                "critical_review_count": self.critical_review_count,
                "missed_appointments_count": self.missed_appointments_count,
                "avg_rating": self.avg_rating,
                "risk_level": self.risk_level,
                "doctor_status": self.doctor_status
            },
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z',
            "availability": [a.to_dict() for a in self.availability],
            "blocked_dates": [b.to_dict() for b in self.blocked_dates],
            "expertise_tags": [t.to_dict() for t in self.expertise_tags],
            "experience": [e.to_dict() for e in self.experience]
        }


# =========================================
# DOCTOR AVAILABILITY
# =========================================
class DoctorAvailability(db.Model):
    __tablename__ = "doctor_availability"
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctor_profiles.id"), nullable=False)
    
    day_of_week = db.Column(db.String(20), nullable=False) # Monday, Tuesday...
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "day_of_week": self.day_of_week,
            "start_time": str(self.start_time),
            "end_time": str(self.end_time)
        }


# =========================================
# DOCTOR BLOCKED DATES
# =========================================
class DoctorBlockedDate(db.Model):
    __tablename__ = "doctor_blocked_dates"
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctor_profiles.id"), nullable=False)
    
    date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            "id": self.id,
            "date": str(self.date),
            "reason": self.reason
        }


# =========================================
# DOCTOR EXPERTISE TAGS
# =========================================
class DoctorExpertiseTag(db.Model):
    __tablename__ = "doctor_expertise_tags"
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctor_profiles.id"), nullable=False)
    
    tag_name = db.Column(db.String(100), nullable=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "tag_name": self.tag_name
        }

# =========================================
# DOCTOR EXPERIENCE TIMELINE
# =========================================
class DoctorExperience(db.Model):
    __tablename__ = "doctor_experiences"
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctor_profiles.id"), nullable=False)
    
    title = db.Column(db.String(150), nullable=False)
    hospital = db.Column(db.String(200), nullable=False)
    period = db.Column(db.String(50), nullable=False) # e.g., "2020 - Present"
    description = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "hospital": self.hospital,
            "period": self.period,
            "description": self.description
        }

# =========================================
# CLINICAL REMARKS TABLE
# =========================================
class ClinicalRemark(db.Model):
    __tablename__ = "clinical_remarks"

    id = db.Column(db.Integer, primary_key=True)
    
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    content = db.Column(db.Text, nullable=False)
    
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "content": self.content,
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z'
        }


# =========================================
# MODULES CONFIG TABLE (FUTURE SERVER TOGGLES)
# =========================================
class ModuleConfig(db.Model):
    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)
    module_key = db.Column(db.String(120), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(150), nullable=False)
    is_enabled = db.Column(db.Boolean, nullable=False, default=True)
    roles_allowed = db.Column(db.JSON, nullable=False, default=list)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "module_key": self.module_key,
            "display_name": self.display_name,
            "is_enabled": self.is_enabled,
            "roles_allowed": self.roles_allowed or [],
            "created_at": self.created_at.isoformat() + 'Z',
            "updated_at": self.updated_at.isoformat() + 'Z',
        }

# =========================================
# CLINICAL QUALITY & REVIEWS TABLE
# =========================================
class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=False, unique=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    rating = db.Column(db.Integer, CheckConstraint('rating >= 1 AND rating <= 5'), nullable=False)
    review_text = db.Column(db.Text)
    sentiment = db.Column(db.String(20)) # positive, neutral, negative
    
    is_hidden = db.Column(db.Boolean, default=False)
    is_flagged = db.Column(db.Boolean, default=False)
    
    # Governance & Oversight Logic
    status = db.Column(db.String(20), default="Pending") # Pending, Approved, Flagged, Hidden, Escalated
    escalation_severity = db.Column(db.String(50))
    audit_category = db.Column(db.String(50))
    admin_note = db.Column(db.Text)
    escalated_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    appointment = db.relationship("Appointment", backref=db.backref("review", uselist=False))
    patient = db.relationship("User", foreign_keys=[patient_id], backref="reviews_given")
    doctor = db.relationship("User", foreign_keys=[doctor_id], backref="reviews_received")

    def to_dict(self):
        return {
            "id": self.id,
            "appointment_id": self.appointment_id,
            "patient_id": self.patient_id,
            "patient_name": self.patient.full_name if self.patient else "Anonymous",
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.full_name if self.doctor else "N/A",
            "rating": self.rating,
            "review_text": self.review_text,
            "sentiment": self.sentiment,
            "status": self.status,
            "is_hidden": self.is_hidden,
            "is_flagged": self.is_flagged,
            "governance_details": {
                "severity": self.escalation_severity,
                "category": self.audit_category,
                "note": self.admin_note,
                "escalated_at": self.escalated_at.isoformat() if self.escalated_at else None
            },
            "created_at": self.created_at.isoformat() + 'Z'
        }

# =========================================
# REVIEW MODERATION LOGS
# =========================================
class ReviewModerationLog(db.Model):
    __tablename__ = "review_moderation_logs"

    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey("reviews.id"), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(50), nullable=False) # approve, flag, hide, escalate
    performed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    review = db.relationship("Review", backref="moderation_logs")
    admin = db.relationship("User", foreign_keys=[performed_by])

    def to_dict(self):
        return {
            "id": self.id,
            "review_id": self.review_id,
            "doctor_id": self.doctor_id,
            "patient_id": self.patient_id,
            "action": self.action,
            "performed_by": self.performed_by,
            "note": self.note,
            "created_at": self.created_at.isoformat()
        }

# =========================================
# REVIEW TAGS (Institutional Triage)
# =========================================
class ReviewTag(db.Model):
    __tablename__ = "review_tags"

    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey("reviews.id"), nullable=False)
    tag = db.Column(db.String(50), nullable=False) # Rude, Late, Misdiagnosis etc.

# =========================================
# DOCTOR ESCALATION SYSTEM
# =========================================
class DoctorEscalation(db.Model):
    __tablename__ = "doctor_escalations"

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reason = db.Column(db.Text, nullable=False) # "high-risk-review-cluster", "manual-report", "low-rating-avg"
    risk_level = db.Column(db.String(20), default="medium")
    status = db.Column(db.String(20), default="open") # open, investigating, resolved, dismissed
    
    admin_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)

    # Relationships
    doctor = db.relationship("User", foreign_keys=[doctor_id], backref="escalations")

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.full_name if self.doctor else "Unknown",
            "reason": self.reason,
            "risk_level": self.risk_level,
            "status": self.status,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "actions": [a.to_dict() for a in self.actions]
        }

class EscalationAction(db.Model):
    __tablename__ = "escalation_actions"

    id = db.Column(db.Integer, primary_key=True)
    escalation_id = db.Column(db.Integer, db.ForeignKey("doctor_escalations.id"), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    action_type = db.Column(db.String(50), nullable=False) # warning, suspend, restrict, resolve, note
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    escalation = db.relationship("DoctorEscalation", backref="actions")
    admin = db.relationship("User", foreign_keys=[admin_id])

    def to_dict(self):
        return {
            "id": self.id,
            "escalation_id": self.escalation_id,
            "admin_id": self.admin_id,
            "admin_name": self.admin.full_name if self.admin else "System",
            "action_type": self.action_type,
            "note": self.note,
            "created_at": self.created_at.isoformat()
        }

# =========================================
# REVIEW ESCALATIONS (Original Serious Complaint)
# =========================================
class ReviewEscalation(db.Model):
    __tablename__ = "review_escalations"

    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey("reviews.id"), nullable=False)
    escalated_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    severity_level = db.Column(db.String(20), default="Standard") # Standard, Urgent, Emergency
    category = db.Column(db.String(50), default="Quality of Care") # Quality of Care, Professionalism, Misconduct
    
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="Open") # Open, Under Investigation, Resolved, Dismissed
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    review = db.relationship("Review", backref=db.backref("escalations", cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "review_id": self.review_id,
            "escalated_by": self.escalated_by,
            "severity_level": self.severity_level,
            "category": self.category,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None
        }

# =========================================
# SECURITY ACTIVITY LOGS
# =========================================
class SecurityActivity(db.Model):
    __tablename__ = "security_activity"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    
    event_type = db.Column(db.String(100), nullable=False) # password_change, login_success, login_failed
    description = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="security_activities")

    def to_dict(self):
        return {
            "id": self.id,
            "event_type": self.event_type,
            "description": self.description,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat() + 'Z'
        }

class PatientAuditLog(db.Model):
    __tablename__ = "patient_audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    action_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    audit_metadata = db.Column(db.JSON)   # 👈 FIXED HERE

    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PatientFlag(db.Model):
    __tablename__ = "patient_flags"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    category = db.Column(db.String(100), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default="medium")

    is_resolved = db.Column(db.Boolean, default=False)
    resolved_at = db.Column(db.DateTime)
    resolved_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    resolution_note = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PatientStatusLog(db.Model):
    __tablename__ = "patient_status_logs"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    previous_status = db.Column(db.String(50))
    new_status = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# =========================================
# DOCTOR STATUS LOG
# =========================================
class DoctorStatusLog(db.Model):
    __tablename__ = "doctor_status_logs"

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    previous_status = db.Column(db.String(50))
    new_status = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# =========================================
# DOCTOR AUDIT LOG
# =========================================
class DoctorAuditLog(db.Model):
    __tablename__ = "doctor_audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    action_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    audit_metadata = db.Column(db.JSON)

    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# =========================================
# CLINICAL PINS (DOCTOR TASKS)
# =========================================
class ClinicalPin(db.Model):
    __tablename__ = "clinical_pins"
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    date = db.Column(db.String(100))
    time = db.Column(db.String(100))
    description = db.Column(db.Text)
    category = db.Column(db.String(100), default="General")
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    doctor = db.relationship("User", foreign_keys=[doctor_id], backref="clinical_pins")

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_id": self.doctor_id,
            "title": self.title,
            "date": self.date,
            "time": self.time,
            "description": self.description,
            "category": self.category,
            "completed": self.completed,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# =========================================
# REMOTE VITALS DEVICE REGISTRY
# =========================================
class MedicalDevice(db.Model):
    __tablename__ = "medical_devices"
    __table_args__ = (
        Index("idx_medical_device_patient_status", "patient_id", "device_status"),
    )

    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(120), nullable=False, unique=True, index=True)
    device_name = db.Column(db.String(150), nullable=False)
    device_token_hash = db.Column(db.String(255), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    last_seen_timestamp = db.Column(db.DateTime(timezone=True), nullable=True, index=True)
    device_status = db.Column(db.String(20), nullable=False, default="offline", index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    patient = db.relationship("User", foreign_keys=[patient_id], backref="medical_devices")

    def to_dict(self):
        return {
            "id": self.id,
            "device_id": self.device_id,
            "device_name": self.device_name,
            "patient_id": self.patient_id,
            "patient_name": self.patient.full_name if self.patient else None,
            "last_seen_timestamp": self.last_seen_timestamp.isoformat() if self.last_seen_timestamp else None,
            "device_status": self.device_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# =========================================
# HISTORICAL VITALS STREAM
# =========================================
class VitalStreamRecord(db.Model):
    __tablename__ = "vital_stream_records"
    __table_args__ = (
        Index("idx_vitals_patient_recorded", "patient_id", "recorded_timestamp"),
        Index("idx_vitals_device_recorded", "device_id", "recorded_timestamp"),
    )

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    device_id = db.Column(db.String(120), db.ForeignKey("medical_devices.device_id"), nullable=False, index=True)
    heart_rate = db.Column(db.Float, nullable=True)
    spo2 = db.Column(db.Float, nullable=True)
    temperature = db.Column(db.Float, nullable=True)
    ecg_data = db.Column(db.JSON, nullable=True)
    recorded_timestamp = db.Column(db.DateTime(timezone=True), nullable=False, index=True, default=datetime.utcnow)
    signal = db.Column(db.String(20), nullable=False, default="ok")
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    patient = db.relationship("User", foreign_keys=[patient_id], backref="vital_stream_records")
    device = db.relationship("MedicalDevice", foreign_keys=[device_id], backref="vital_stream_records")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "device_id": self.device_id,
            "heart_rate": self.heart_rate,
            "spo2": self.spo2,
            "temperature": self.temperature,
            "ecg_data": self.ecg_data or [],
            "recorded_timestamp": self.recorded_timestamp.isoformat() if self.recorded_timestamp else None,
            "signal": self.signal,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# =========================================
# LATEST VITALS CACHE
# =========================================
class LatestVitalState(db.Model):
    __tablename__ = "latest_vital_states"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True, index=True)
    device_id = db.Column(db.String(120), db.ForeignKey("medical_devices.device_id"), nullable=False, index=True)
    heart_rate = db.Column(db.Float, nullable=True)
    spo2 = db.Column(db.Float, nullable=True)
    temperature = db.Column(db.Float, nullable=True)
    ecg_data = db.Column(db.JSON, nullable=True)
    recorded_timestamp = db.Column(db.DateTime(timezone=True), nullable=False, index=True, default=datetime.utcnow)
    signal = db.Column(db.String(20), nullable=False, default="ok")
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    patient = db.relationship("User", foreign_keys=[patient_id], backref=db.backref("latest_vital_state", uselist=False))
    device = db.relationship("MedicalDevice", foreign_keys=[device_id], backref="latest_vital_states")

    def to_dict(self):
        device_payload = self.device.to_dict() if self.device else None
        return {
            "patient_id": self.patient_id,
            "patient_name": self.patient.full_name if self.patient else None,
            "device_id": self.device_id,
            "heart_rate": self.heart_rate,
            "spo2": self.spo2,
            "temperature": self.temperature,
            "ecg_data": self.ecg_data or [],
            "recorded_timestamp": self.recorded_timestamp.isoformat() if self.recorded_timestamp else None,
            "signal": self.signal,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "device_status": device_payload["device_status"] if device_payload else "offline",
            "last_seen_timestamp": device_payload["last_seen_timestamp"] if device_payload else None,
            "device_name": device_payload["device_name"] if device_payload else None,
        }
