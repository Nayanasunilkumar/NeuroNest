import os
import sys
from pathlib import Path

# Add backend to path so we can import app and models
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app import app
from database.models import db, User
from utils.security import hash_password

def emergency_fix():
    with app.app_context():
        print("--- EMERGENCY AUTH FIX ---")
        
        # 1. Fix Doctor Accounts
        doctor_emails = ["nayanasunukumar8@gmail.com", "nayanasunilkumar8@gmail.com"]
        for email in doctor_emails:
            u = User.query.filter_by(email=email).first()
            if u:
                print(f"Found Doctor account: {email}")
                u.role = "doctor"
                u.password_hash = hash_password("123456")
                u.account_status = "active"
                u.is_deleted = False
                print(f"  ✓ Set role to 'doctor'")
                print(f"  ✓ Reset password to '123456'")
            else:
                print(f"Doctor account {email} not found.")

        # 2. Fix Patient Accounts (Nesrin)
        patient_emails = ["nezrinnoushad20@gmail.com", "nesrinnoushad20@gmail.com"]
        for email in patient_emails:
            u = User.query.filter_by(email=email).first()
            if u:
                print(f"Found Patient account: {email}")
                u.role = "patient"
                u.password_hash = hash_password("123456")
                u.account_status = "active"
                u.is_deleted = False
                print(f"  ✓ Reset password to '123456'")
            else:
                print(f"Patient account {email} not found.")

        try:
            db.session.commit()
            print("\n✅ All changes committed to database.")
            print("Try logging in now with password '123456'")
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Error committing changes: {e}")

if __name__ == "__main__":
    emergency_fix()
