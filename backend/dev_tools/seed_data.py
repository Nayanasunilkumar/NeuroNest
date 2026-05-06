import sys
from pathlib import Path
from datetime import datetime, date, time, timedelta

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app import app
from database.models import db, User, DoctorProfile, PatientProfile, Appointment, AppointmentSlot
from utils.security import hash_password

def seed_data():
    with app.app_context():
        print("--- SEEDING CLINICAL DATA ---")
        
        # 1. Identify the Doctor
        doctor_email = "nayanasunilkumar8@gmail.com"
        doctor = User.query.filter_by(email=doctor_email).first()
        if not doctor:
            print(f"Doctor {doctor_email} not found. Please register first.")
            return
            
        print(f"Seeding for Doctor: {doctor.full_name} ({doctor.id})")

        # 2. Create Sample Patients if they don't exist
        patients_to_create = [
            {"email": "nezrinnoushad20@gmail.com", "name": "Nesrin Noushad", "dob": date(1995, 8, 15)},
            {"email": "patient.one@example.com", "name": "John Doe", "dob": date(1980, 1, 1)},
            {"email": "patient.two@example.com", "name": "Jane Smith", "dob": date(1992, 11, 23)}
        ]
        
        patient_users = []
        for pdata in patients_to_create:
            p_user = User.query.filter_by(email=pdata["email"]).first()
            if not p_user:
                p_user = User(
                    email=pdata["email"],
                    password_hash=hash_password("123456"),
                    role="patient",
                    full_name=pdata["name"]
                )
                db.session.add(p_user)
                db.session.flush()
                
                p_profile = PatientProfile(
                    user_id=p_user.id,
                    date_of_birth=pdata["dob"],
                    gender="Not Specified"
                )
                db.session.add(p_profile)
                print(f"  ✓ Created Patient: {pdata['name']}")
            else:
                print(f"  - Patient {pdata['name']} already exists")
            patient_users.append(p_user)
        
        db.session.commit()

        # 3. Create Sample Appointments
        today = date.today()
        
        # Appointment 1: Today (Upcoming)
        apt1 = Appointment(
            patient_id=patient_users[0].id,
            doctor_id=doctor.id,
            appointment_date=today,
            appointment_time=time(14, 30),
            status="approved",
            reason="Routine checkup",
            priority_level="routine"
        )
        db.session.add(apt1)
        
        # Appointment 2: Yesterday (History)
        apt2 = Appointment(
            patient_id=patient_users[1].id,
            doctor_id=doctor.id,
            appointment_date=today - timedelta(days=1),
            appointment_time=time(10, 0),
            status="approved",
            reason="Follow-up consultation",
            priority_level="high"
        )
        db.session.add(apt2)
        
        # Appointment 3: Pending Request
        apt3 = Appointment(
            patient_id=patient_users[2].id,
            doctor_id=doctor.id,
            appointment_date=today + timedelta(days=2),
            appointment_time=time(11, 15),
            status="pending",
            reason="Sudden headache and dizziness",
            priority_level="emergency"
        )
        db.session.add(apt3)

        try:
            db.session.commit()
            print("\n✅ Sample data seeded successfully!")
            print("Refresh your dashboard now.")
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Error seeding data: {e}")

if __name__ == "__main__":
    seed_data()
