from dotenv import load_dotenv
load_dotenv()
from app import app
from database.models import db, Appointment

with app.app_context():
    print("Checking Appointments for User 4...")
    appts = Appointment.query.filter_by(patient_id=4).all()
    for a in appts:
        print(f"ID: {a.id}, Date: {a.appointment_date} ({type(a.appointment_date)}), Time: {a.appointment_time} ({type(a.appointment_time)})")
        try:
            print(f"To Dict: {a.to_dict()}")
        except Exception as e:
            print(f"To Dict Failed: {e}")
