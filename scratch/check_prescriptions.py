import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app
from database.models import db, User
from models.prescription_models import Prescription, PrescriptionItem

def check_prescriptions(patient_id):
    app = create_app()
    with app.app_context():
        prescriptions = Prescription.query.filter_by(patient_id=patient_id, is_deleted=False).all()
        print(f"Found {len(prescriptions)} prescriptions for patient ID {patient_id}")
        for p in prescriptions:
            print(f"ID: {p.id}, Diagnosis: {p.diagnosis}, Status: {p.status}, Created: {p.created_at}")
            for item in p.items:
                print(f"  - Medicine: {item.medicine_name}, Dosage: {item.dosage}")

if __name__ == "__main__":
    check_prescriptions(3)
