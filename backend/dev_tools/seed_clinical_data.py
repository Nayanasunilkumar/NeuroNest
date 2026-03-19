import os
import sys
from datetime import datetime, timedelta
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from database.models import db, User, PatientProfile, PatientAllergy, PatientCondition, PatientMedication, MedicalRecord

# Use the environment variable for DB connection if available (for production/preview)
DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://nayanasp@localhost:5432/neuronest"

def seed_clinical():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    db.init_app(app)
    
    with app.app_context():
        # Ensure tables exist
        db.create_all()
        
        # 1. Create a Test Patient if not exists
        patient_email = "test.patient@neuronest.com"
        patient = User.query.filter_by(email=patient_email).first()
        if not patient:
            from utils.security import hash_password
            patient = User(
                email=patient_email,
                password_hash=hash_password("password123"),
                role="patient",
                full_name="Alex Johnson"
            )
            db.session.add(patient)
            db.session.commit()
            print(f"✅ Created Patient: {patient_email}")
        
        # 2. Create Patient Profile
        profile = PatientProfile.query.filter_by(user_id=patient.id).first()
        if not profile:
            profile = PatientProfile(
                user_id=patient.id,
                full_name="Alex Johnson",
                gender="Male",
                date_of_birth=datetime(1990, 5, 20).date(),
                city="Cairo",
                weight_kg=78,
                height_cm=182,
                blood_group="O+"
            )
            db.session.add(profile)
            db.session.commit()
            print(f"✅ Created Profile for: {patient.full_name}")

        # 3. Add Allergies
        if not PatientAllergy.query.filter_by(patient_id=patient.id).first():
            allergies = [
                PatientAllergy(patient_id=patient.id, allergy_name="Peanuts", reaction="Anaphylaxis", severity="severe", status="active"),
                PatientAllergy(patient_id=patient.id, allergy_name="Penicillin", reaction="Rash", severity="mild", status="active")
            ]
            db.session.bulk_save_objects(allergies)
            print("✅ Added Allergies")

        # 4. Add Conditions
        if not PatientCondition.query.filter_by(patient_id=patient.id).first():
            conditions = [
                PatientCondition(patient_id=patient.id, condition_name="Type 2 Diabetes", status="active", diagnosed_date=datetime(2022, 1, 10).date(), under_treatment=True),
                PatientCondition(patient_id=patient.id, condition_name="Hypertension", status="active", diagnosed_date=datetime(2023, 3, 15).date(), under_treatment=True)
            ]
            db.session.bulk_save_objects(conditions)
            print("✅ Added Conditions")

        # 5. Add Medications
        if not PatientMedication.query.filter_by(patient_id=patient.id).first():
            meds = [
                PatientMedication(patient_id=patient.id, drug_name="Metformin", dosage="500mg", frequency="Twice Daily", status="active", medication_origin="current_doctor"),
                PatientMedication(patient_id=patient.id, drug_name="Lisinopril", dosage="10mg", frequency="Once Daily", status="active", medication_origin="current_doctor")
            ]
            db.session.bulk_save_objects(meds)
            print("✅ Added Medications")

        # 6. Add Medical Records
        if not MedicalRecord.query.filter_by(patient_id=patient.id).first():
            records = [
                MedicalRecord(
                    patient_id=patient.id, 
                    title="Annual Blood Work", 
                    category="Labs", 
                    record_date=datetime(2024, 2, 1).date(),
                    doctor_name="Dr. Smith",
                    hospital_name="Neuronest General",
                    file_path="https://res.cloudinary.com/dummy/blood_work.pdf",
                    file_type="pdf",
                    file_size_bytes=1024 * 500
                )
            ]
            db.session.bulk_save_objects(records)
            print("✅ Added Medical Records")

        db.session.commit()
        print("\n🎉 Seeding complete for Alex Johnson (Test Patient)!")

if __name__ == "__main__":
    seed_clinical()
