from app import app
from database.models import db
from models.audit_models import PatientStatusLog, PatientFlag, PatientAuditLog
from sqlalchemy import text

def reset_audit_tables():
    with app.app_context():
        print("Dropping old audit tables (schema mismatch detected)...")
        tables = ['patient_flags', 'patient_status_logs', 'patient_audit_logs']
        for table in tables:
            try:
                db.session.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                db.session.commit()
                print(f"Dropped {table}")
            except Exception as e:
                db.session.rollback()
                print(f"Error dropping {table}: {e}")
        
        print("Recreating tables from new models...")
        db.create_all()
        print("Success! Audit tables are now synchronized.")

if __name__ == "__main__":
    reset_audit_tables()
