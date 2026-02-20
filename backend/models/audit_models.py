from database.models import db
from datetime import datetime

# =========================================
# PATIENT STATUS LOGS (e.g. active -> suspended)
# =========================================
class PatientStatusLog(db.Model):
    __tablename__ = "patient_status_logs"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    previous_status = db.Column(db.String(50))
    new_status = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    patient = db.relationship("User", foreign_keys=[patient_id], backref="status_history")
    admin = db.relationship("User", foreign_keys=[admin_id], backref="status_changes_authorized")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "admin_id": self.admin_id,
            "admin_name": self.admin.full_name if self.admin else "System",
            "previous_status": self.previous_status,
            "new_status": self.new_status,
            "reason": self.reason,
            "created_at": str(self.created_at)
        }

# =========================================
# PATIENT FLAGS (Safety / Behavioral monitoring)
# =========================================
class PatientFlag(db.Model):
    __tablename__ = "patient_flags"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False) # Admin or Doctor
    
    category = db.Column(db.String(100), nullable=False) # security, behavioral, medical, financial
    reason = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default="medium") # low, medium, high
    
    is_resolved = db.Column(db.Boolean, default=False)
    resolved_at = db.Column(db.DateTime)
    resolved_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    resolution_note = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "category": self.category,
            "reason": self.reason,
            "severity": self.severity,
            "is_resolved": self.is_resolved,
            "created_at": str(self.created_at)
        }

# =========================================
# UNIFIED AUDIT LOG (Medical Integrity / Audit Tracking)
# =========================================
class PatientAuditLog(db.Model):
    __tablename__ = "patient_audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False) # Who performed action
    
    action_type = db.Column(db.String(100), nullable=False) # status_change, flag_added, prescription_cancelled, record_verified
    description = db.Column(db.Text)
    action_metadata = db.Column(db.JSON) # Store specific details as JSON
    
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "action_type": self.action_type,
            "description": self.description,
            "actor_id": self.actor_id,
            "created_at": str(self.created_at)
        }

# =========================================
# DOCTOR STATUS LOGS (e.g. active -> suspended)
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

    # Relationships
    doctor = db.relationship("User", foreign_keys=[doctor_id], backref="doctor_status_history")
    admin = db.relationship("User", foreign_keys=[admin_id], backref="doctor_status_changes_authorized")

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_id": self.doctor_id,
            "admin_id": self.admin_id,
            "admin_name": self.admin.full_name if self.admin else "System",
            "previous_status": self.previous_status,
            "new_status": self.new_status,
            "reason": self.reason,
            "created_at": str(self.created_at)
        }

# =========================================
# UNIFIED DOCTOR AUDIT LOG
# =========================================
class DoctorAuditLog(db.Model):
    __tablename__ = "doctor_audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    action_type = db.Column(db.String(100), nullable=False) # license_verified, fee_updated, profile_edited
    description = db.Column(db.Text)
    action_metadata = db.Column(db.JSON)
    
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "action_type": self.action_type,
            "description": self.description,
            "actor_id": self.actor_id,
            "created_at": str(self.created_at)
        }
