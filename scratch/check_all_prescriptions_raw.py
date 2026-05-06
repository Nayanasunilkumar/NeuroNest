import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app
from database.models import db, User
from models.prescription_models import Prescription, PrescriptionItem

def check_all_prescriptions_raw():
    app = create_app()
    with app.app_context():
        prescriptions = Prescription.query.all()
        print(f"Found {len(prescriptions)} prescriptions in total (including deleted)")
        for p in prescriptions:
            print(f"ID: {p.id}, Patient ID: {p.patient_id}, Diagnosis: {p.diagnosis}, Status: {p.status}, Deleted: {p.is_deleted}")

if __name__ == "__main__":
    check_all_prescriptions_raw()
