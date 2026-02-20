from app import app
from database.models import db
from sqlalchemy import text

def migrate():
    with app.app_context():
        try:
            # Add sector column to doctor_profiles
            db.session.execute(text("ALTER TABLE doctor_profiles ADD COLUMN sector VARCHAR(50) DEFAULT 'North Sector'"))
            db.session.commit()
            print("Successfully added sector column to doctor_profiles.")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding sector column: {e}")

        try:
            # Update existing records to have default sector if they are null
            db.session.execute(text("UPDATE doctor_profiles SET sector = 'North Sector' WHERE sector IS NULL"))
            db.session.commit()
            print("Successfully updated existing records with default sector.")
        except Exception as e:
            db.session.rollback()
            print(f"Error updating sector values: {e}")

if __name__ == "__main__":
    migrate()
