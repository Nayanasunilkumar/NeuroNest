from dotenv import load_dotenv
load_dotenv()
from app import app
from database.models import db, Appointment, MedicalRecord

with app.app_context():
    print("Testing string vs int query...")
    
    # Int
    count_int = MedicalRecord.query.filter_by(patient_id=4).count()
    print(f"Int Query count: {count_int}")
    
    # String
    count_str = MedicalRecord.query.filter_by(patient_id="4").count()
    print(f"String Query count: {count_str}")
