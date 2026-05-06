import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app
from database.models import db, User
from models.prescription_models import Prescription, PrescriptionItem
from datetime import date, timedelta

def create_sample_prescription():
    app = create_app()
    with app.app_context():
        # Find Nezrin
        nezrin = User.query.get(3)
        if not nezrin:
            print("Nezrin (ID 3) not found")
            return
            
        # Find any doctor
        doctor = User.query.filter_by(role='doctor').first()
        if not doctor:
            print("No doctor found")
            return
            
        print(f"Creating prescription for {nezrin.full_name} from Dr. {doctor.full_name}")
        
        p = Prescription(
            doctor_id=doctor.id,
            patient_id=nezrin.id,
            diagnosis="Generalized Anxiety Disorder (Mild)",
            notes="Follow up in 2 weeks. Practice deep breathing exercises daily.",
            status="active",
            valid_until=date.today() + timedelta(days=30),
            issued_date=date.today()
        )
        db.session.add(p)
        db.session.flush()
        
        item1 = PrescriptionItem(
            prescription_id=p.id,
            medicine_name="Lexapro (Escitalopram)",
            dosage="10mg",
            frequency="1-0-0 (Morning)",
            duration="30 days",
            instructions="Take after breakfast."
        )
        item2 = PrescriptionItem(
            prescription_id=p.id,
            medicine_name="Melatonin",
            dosage="3mg",
            frequency="0-0-1 (Night)",
            duration="15 days",
            instructions="Take 30 minutes before bed."
        )
        db.session.add(item1)
        db.session.add(item2)
        
        db.session.commit()
        print(f"Prescription ID {p.id} created successfully")

if __name__ == "__main__":
    create_sample_prescription()
