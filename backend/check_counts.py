import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app import app
from database.models import db, User, DoctorProfile, PatientProfile, Appointment

def check_counts():
    with app.app_context():
        print("--- DATABASE SNAPSHOT ---")
        print(f"Total Users: {User.query.count()}")
        print(f"Total Doctor Profiles: {DoctorProfile.query.count()}")
        print(f"Total Patient Profiles: {PatientProfile.query.count()}")
        print(f"Total Appointments: {Appointment.query.count()}")
        
        print("\n--- DOCTOR DETAILS ---")
        doctors = User.query.filter_by(role='doctor').all()
        for d in doctors:
            profile = DoctorProfile.query.filter_by(user_id=d.id).first()
            appt_count = Appointment.query.filter_by(doctor_id=d.id).count()
            print(f"ID: {d.id} | Email: {d.email} | Profile: {'Yes' if profile else 'No'} | Appointments: {appt_count}")

if __name__ == "__main__":
    check_counts()
