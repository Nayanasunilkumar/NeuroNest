from dotenv import load_dotenv
load_dotenv()
from app import app
from database.models import db
from models.chat_models import Conversation, Participant, Message
from models.audit_models import PatientStatusLog, PatientFlag, PatientAuditLog

with app.app_context():
    db.create_all()
    print("Database tables created successfully!")
