
import os
import sys
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from flask import Flask
from core.env import load_environment
load_environment()

from database.models import db, User, Appointment

app = Flask(__name__)
from config.config import Config
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    nezrin = User.query.filter(User.full_name.ilike('%Nezrin%')).first()
    if not nezrin:
        print("Nezrin not found")
    else:
        print(f"Found Nezrin (ID: {nezrin.id})")
        appts = Appointment.query.filter_by(patient_id=nezrin.id).all()
        print(f"Appointments: {len(appts)}")
        for a in appts:
            doc = User.query.get(a.doctor_id)
            print(f"- Doc: {doc.full_name if doc else 'Unknown'} (ID: {a.doctor_id}), Status: {a.status}")
