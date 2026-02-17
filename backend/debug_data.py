from dotenv import load_dotenv
load_dotenv()
from app import app
from database.models import db, User, Appointment, MedicalRecord

with app.app_context():
    print("-" * 60)
    print(f"{'User Email':<30} {'ID':<5} {'Role':<10} {'Appts':<5} {'Records':<5}")
    print("-" * 60)
    users = User.query.all()
    for u in users:
        appts = Appointment.query.filter_by(patient_id=u.id).count()
        records = MedicalRecord.query.filter_by(patient_id=u.id).count()
        print(f"{u.email:<30} {u.id:<5} {u.role:<10} {appts:<5} {records:<5}")
    print("-" * 60)
