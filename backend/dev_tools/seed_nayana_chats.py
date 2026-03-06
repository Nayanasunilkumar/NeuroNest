from app import app
from database.models import db, User
from models.chat_models import Conversation, Participant, Message

with app.app_context():
    # Target Dr. Nayana (ID 8)
    doctor = User.query.get(8)
    if not doctor:
        doctor = User.query.filter_by(full_name='Dr. Nayana').first()
    
    if not doctor:
        print("Doctor Nayana not found.")
        exit()

    print(f"Seeding chats for: {doctor.full_name}")

    # For each patient, create a conversation if it doesn't exist
    patients = User.query.filter_by(role='patient').all()
    
    for patient in patients:
        # Check if conversation exists
        existing_p1 = Participant.query.filter_by(user_id=doctor.id).all()
        conv = None
        for p in existing_p1:
            shared = Participant.query.filter_by(conversation_id=p.conversation_id, user_id=patient.id).first()
            if shared:
                conv = Conversation.query.get(p.conversation_id)
                break
        
        if not conv:
            conv = Conversation(type="direct")
            db.session.add(conv)
            db.session.flush()
            
            p1 = Participant(conversation_id=conv.id, user_id=doctor.id)
            p2 = Participant(conversation_id=conv.id, user_id=patient.id)
            db.session.add(p1)
            db.session.add(p2)
            db.session.commit()
            print(f"Created conversation between {doctor.full_name} and {patient.full_name}")
        
        # Add a placeholder last message if none exists
        last_msg = Message.query.filter_by(conversation_id=conv.id).first()
        if not last_msg:
            msg = Message(
                conversation_id=conv.id,
                sender_id=patient.id,
                content=f"Hello Dr. {doctor.full_name.split()[-1]}, checking in for my assessment.",
                type="text"
            )
            db.session.add(msg)
            db.session.commit()
            print(f"Added initial message for {patient.full_name}")

    print("Success: Clinical Inbox seeded for Dr. Nayana.")
