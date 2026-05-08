import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app import create_app
from backend.database.models import User, Appointment

app = create_app()
with app.app_context():
    doctors = User.query.filter_by(role='doctor').all()
    print("Doctors:")
    for d in doctors:
        print(f"ID: {d.id}, Name: {d.full_name}, Email: {d.email}")
    
    appts = Appointment.query.all()
    print("\nAppointments:")
    for a in appts:
        print(f"ID: {a.id}, Doctor ID: {a.doctor_id}, Patient ID: {a.patient_id}, Date: {a.appointment_date}, Status: {a.status}")
