from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

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
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
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
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
        }
    
# =========================================
# APPOINTMENTS TABLE
# =========================================
class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)

    reason = db.Column(db.String(255))
    notes = db.Column(db.Text)

    status = db.Column(
        db.String(50),
        default="Pending"  # Pending / Approved / Rejected / Cancelled / Completed
    )

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
    patient = db.relationship("User", foreign_keys=[patient_id], backref="patient_appointments")
    doctor = db.relationship("User", foreign_keys=[doctor_id], backref="doctor_appointments")

    # =========================================
    # RETURN JSON DATA
    # =========================================
    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "patient_name": self.patient.full_name if self.patient else f"Patient #{self.patient_id}",
            "patient_image": self.patient.patient_profile.profile_image if self.patient and self.patient.patient_profile else None,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.full_name if self.doctor else None,
            "appointment_date": str(self.appointment_date),
            "appointment_time": str(self.appointment_time),
            "reason": self.reason,
            "notes": self.notes,
            "status": self.status,
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
        }
    



# =========================================
# MEDICAL RECORDS TABLE
# =========================================
class MedicalRecord(db.Model):
    __tablename__ = "medical_records"

    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    
    doctor_name = db.Column(db.String(120))
    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        nullable=True
    )
    
    description = db.Column(db.Text)
    record_date = db.Column(db.Date)
    
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

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "title": self.title,
            "category": self.category,
            "file_path": self.file_path,
            "doctor_name": self.doctor_name,
            "appointment_id": self.appointment_id,
            "description": self.description,
            "record_date": str(self.record_date) if self.record_date else None,
            "verified_by_doctor": self.verified_by_doctor,
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
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
    
    phone = db.Column(db.String(20))
    gender = db.Column(db.String(20))
    dob = db.Column(db.Date)
    bio = db.Column(db.Text)
    hospital_name = db.Column(db.String(200))
    
    consultation_fee = db.Column(db.Float)
    consultation_mode = db.Column(db.String(50)) # Online/Offline/Both
    
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

    # Relationships
    user = db.relationship("User", backref=db.backref("doctor_profile", uselist=False))
    availability = db.relationship("DoctorAvailability", backref="doctor", lazy=True, cascade="all, delete-orphan")
    blocked_dates = db.relationship("DoctorBlockedDate", backref="doctor", lazy=True, cascade="all, delete-orphan")
    expertise_tags = db.relationship("DoctorExpertiseTag", backref="doctor", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.user.full_name if self.user else "Doctor",
            "specialization": self.specialization,
            "license_number": self.license_number,
            "qualification": self.qualification,
            "experience_years": self.experience_years,
            "department": self.department,
            "phone": self.phone,
            "gender": self.gender,
            "dob": str(self.dob) if self.dob else None,
            "bio": self.bio,
            "hospital_name": self.hospital_name,
            "consultation_fee": self.consultation_fee,
            "consultation_mode": self.consultation_mode,
            "profile_image": self.profile_image,
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
            "availability": [a.to_dict() for a in self.availability],
            "blocked_dates": [b.to_dict() for b in self.blocked_dates],
            "expertise_tags": [t.to_dict() for t in self.expertise_tags]
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
# CLINICAL REMARKS TABLE
# =========================================
class ClinicalRemark(db.Model):
    __tablename__ = "clinical_remarks"

    id = db.Column(db.Integer, primary_key=True)
    
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )
    
    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
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
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at)
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
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
        }
