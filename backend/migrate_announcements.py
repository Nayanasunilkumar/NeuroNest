import sys
import os

# Add the current directory to sys.path to import app and models
sys.path.append(os.getcwd())

from app import app
from database.models import db
# Import new models so SQLAlchemy knows about them
from models.announcement import Announcement
from models.announcement_target import AnnouncementTarget
from models.announcement_read import AnnouncementRead

def migrate():
    with app.app_context():
        print("Creating Announcement tables...")
        try:
            db.create_all()
            print("Successfully created announcement tables.")
        except Exception as e:
            print(f"Error creating tables: {e}")

if __name__ == "__main__":
    migrate()
