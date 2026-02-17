from database.models import db
from datetime import datetime

# =========================================
# PRESCRIPTION TABLE
# =========================================
class Prescription(db.Model):
    __tablename__ = "prescriptions"

    id = db.Column(db.Integer, primary_key=True)

    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        nullable=True
    )

    diagnosis = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text)
    
    status = db.Column(
        db.String(50), 
        default="Active"  # Active / Completed / Cancelled / Expired
    )
    
    valid_until = db.Column(db.Date)

    items = db.relationship(
        "PrescriptionItem",
        backref="prescription",
        lazy=True,
        cascade="all, delete-orphan"
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

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_id": self.doctor_id,
            "patient_id": self.patient_id,
            "appointment_id": self.appointment_id,
            "diagnosis": self.diagnosis,
            "notes": self.notes,
            "status": self.status,
            "valid_until": str(self.valid_until) if self.valid_until else None,
            "items": [item.to_dict() for item in self.items],
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
        }


# =========================================
# PRESCRIPTION ITEM TABLE
# =========================================
class PrescriptionItem(db.Model):
    __tablename__ = "prescription_items"

    id = db.Column(db.Integer, primary_key=True)

    prescription_id = db.Column(
        db.Integer,
        db.ForeignKey("prescriptions.id"),
        nullable=False
    )

    medicine_name = db.Column(db.String(255), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)  # e.g. 500mg
    frequency = db.Column(db.String(100), nullable=False)  # e.g. 1-0-1
    duration = db.Column(db.String(100), nullable=False)   # e.g. 5 days
    instructions = db.Column(db.Text)  # e.g. After food

    def to_dict(self):
        return {
            "id": self.id,
            "prescription_id": self.prescription_id,
            "medicine_name": self.medicine_name,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "duration": self.duration,
            "instructions": self.instructions,
        }
