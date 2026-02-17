from dotenv import load_dotenv
load_dotenv()
from app import app
from database.models import db, User
from models.chat_models import Conversation, Participant, Message
from werkzeug.security import generate_password_hash

with app.app_context():
    # 1. Ensure a Doctor exists
    doctor = User.query.filter_by(role='doctor').first()
    if not doctor:
        print("Creating a dummy doctor...")
        doctor = User(
            full_name="Dr. House",
            email="house@neuronest.com",
            password_hash=generate_password_hash("password", method='pbkdf2:sha256'),
            role="doctor"
        )
        db.session.add(doctor)
        db.session.commit()
    else:
        print(f"Found Doctor: {doctor.full_name}")

    # 2. Ensure Current User (Patient) exists
    # Assuming user ID 4 (abc@gmail.com) from context
    patient = User.query.get(4)
    if not patient:
        print("Patient ID 4 not found. Trying email abc@gmail.com")
        patient = User.query.filter_by(email="abc@gmail.com").first()
    
    if not patient:
        print("Patient not found. Cannot seed chat.")
        exit()
        
    print(f"Seeding chat between {patient.full_name} and {doctor.full_name}")
    
    # 3. Create Conversation
    # check exists
    existing = Participant.query.filter_by(user_id=patient.id).all()
    # find shared
    conv = None
    for p in existing:
        other = Participant.query.filter(
            Participant.conversation_id == p.conversation_id,
            Participant.user_id == doctor.id
        ).first()
        if other:
            conv = Conversation.query.get(p.conversation_id)
            break
            
    if not conv:
        conv = Conversation(type="direct")
        db.session.add(conv)
        db.session.flush()
        
        p1 = Participant(conversation_id=conv.id, user_id=patient.id)
        p2 = Participant(conversation_id=conv.id, user_id=doctor.id)
        db.session.add(p1)
        db.session.add(p2)
        db.session.commit()
        print("Created new conversation.")
    else:
        print("Using existing conversation.")

    # 4. Add Messages
    msgs = [
        (doctor.id, "Hello! How are you feeling today?"),
        (patient.id, "Hi Dr. House. I'm feeling a bit better, thanks."),
        (doctor.id, "That's good to hear. Have you been taking the medication?"),
        (patient.id, "Yes, twice a day as prescribed."),
        (doctor.id, "Excellent. Let me know if you experience any side effects.")
    ]
    
    for sender_id, text in msgs:
        # Check if already exists roughly (optional)
        m = Message(
            conversation_id=conv.id,
            sender_id=sender_id,
            content=text,
            is_read=True if sender_id == patient.id else False
        )
        db.session.add(m)
    
    conv.updated_at = db.func.now()
    db.session.commit()
    print("Added sample messages.")
