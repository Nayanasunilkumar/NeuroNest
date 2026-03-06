from dotenv import load_dotenv
load_dotenv()
from app import app
from database.models import db
from models.chat_models import Conversation, Participant, Message
from sqlalchemy import text

with app.app_context():
    # Only drop chat tables
    print("Dropping chat tables...")
    try:
        db.session.execute(text("DROP TABLE IF EXISTS messages CASCADE"))
        db.session.execute(text("DROP TABLE IF EXISTS participants CASCADE"))
        db.session.execute(text("DROP TABLE IF EXISTS conversations CASCADE"))
        db.session.commit()
    except Exception as e:
        print(f"Error dropping: {e}")
        db.session.rollback()

    print("Recreating chat tables...")
    db.create_all()
    print("Done.")
