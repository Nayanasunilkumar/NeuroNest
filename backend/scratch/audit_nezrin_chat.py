
import os
import sys
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from flask import Flask
from core.env import load_environment
load_environment()

from database.models import db, User, Appointment, Participant, Conversation, Message
from modules.doctor.services.doctor_patient_service import get_related_doctor_ids_for_patient

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
        
        related_ids = get_related_doctor_ids_for_patient(nezrin.id)
        print(f"Related Doctor IDs: {related_ids}")
        for rid in related_ids:
            doc = User.query.get(rid)
            print(f"  - Related Doc: {doc.full_name if doc else 'Unknown'} (ID: {rid})")
            
        participations = Participant.query.filter_by(user_id=nezrin.id).all()
        print(f"Conversations in DB: {len(participations)}")
        for p in participations:
            conv = Conversation.query.get(p.conversation_id)
            other_p = Participant.query.filter(Participant.conversation_id == conv.id, Participant.user_id != nezrin.id).first()
            other_user = User.query.get(other_p.user_id) if other_p else None
            last_msg = conv.messages.order_by(Message.created_at.desc()).first()
            print(f"  - Conv {conv.id} with {other_user.full_name if other_user else 'None'} (ID: {other_user.id if other_user else 'N/A'})")
            print(f"    Last Message: {last_msg.content if last_msg else 'NONE'}")
            
        # Check appointments specifically
        appts = Appointment.query.filter_by(patient_id=nezrin.id).all()
        print(f"Appointments in DB: {len(appts)}")
        for a in appts:
            doc = User.query.get(a.doctor_id)
            print(f"  - Appt with {doc.full_name if doc else 'Unknown'} (ID: {a.doctor_id}), Status: {a.status}")
