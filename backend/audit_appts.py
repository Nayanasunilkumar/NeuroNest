import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app import app
from database.models import db, User, Appointment

def audit_appointments():
    with app.app_context():
        print("--- APPOINTMENT AUDIT ---")
        appts = Appointment.query.all()
        print(f"Total Appointments in DB: {len(appts)}")
        
        doctor_ids_in_appts = set(a.doctor_id for a in appts)
        print(f"Doctor IDs found in Appointments: {doctor_ids_in_appts}")
        
        print("\n--- DOCTOR USERS ---")
        doctors = User.query.filter_by(role='doctor').all()
        for d in doctors:
            print(f"ID: {d.id} | Email: {d.email} | Name: {d.full_name}")
            
        print("\n--- SAMPLE APPOINTMENTS ---")
        for a in appts[:5]:
            print(f"ID: {a.id} | DoctorID: {a.doctor_id} | PatientID: {a.patient_id} | Status: {a.status}")

if __name__ == "__main__":
    audit_appointments()
