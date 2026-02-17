from app import create_app
from database.models import db
from models.prescription_models import Prescription, PrescriptionItem
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Dropping prescription tables...")
    try:
        # Drop tables if they exist
        db.session.execute(text("DROP TABLE IF EXISTS prescription_items CASCADE"))
        db.session.execute(text("DROP TABLE IF EXISTS prescriptions CASCADE"))
        db.session.commit()
        print("Dropped old tables.")
    except Exception as e:
        print(f"Error dropping tables: {e}")
        db.session.rollback()

    print("Recreating tables based on current models...")
    # This creates all tables that don't exist, which includes the ones we just dropped
    db.create_all()
    print("Tables recreated successfully!")
