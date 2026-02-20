from app import app
from database.models import db
from sqlalchemy import text

def migrate():
    with app.app_context():
        print("Starting Doctor Governance Migration (PostgreSQL)...")
        
        # 1. Add is_verified to users
        try:
            db.session.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
            db.session.commit()
            print("Added column: is_verified to users table")
        except Exception as e:
            db.session.rollback()
            print(f"Column is_verified might already exist: {e}")

        # 2. Create doctor_status_logs
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS doctor_status_logs (
                    id SERIAL PRIMARY KEY,
                    doctor_id INTEGER NOT NULL REFERENCES users(id),
                    admin_id INTEGER NOT NULL REFERENCES users(id),
                    previous_status VARCHAR(50),
                    new_status VARCHAR(50) NOT NULL,
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            db.session.commit()
            print("Created table: doctor_status_logs")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating doctor_status_logs: {e}")

        # 3. Create doctor_audit_logs
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS doctor_audit_logs (
                    id SERIAL PRIMARY KEY,
                    doctor_id INTEGER NOT NULL REFERENCES users(id),
                    actor_id INTEGER NOT NULL REFERENCES users(id),
                    action_type VARCHAR(100) NOT NULL,
                    description TEXT,
                    action_metadata JSONB,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            db.session.commit()
            print("Created table: doctor_audit_logs")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating doctor_audit_logs: {e}")

        print("Doctor Governance Migration Complete.")

if __name__ == "__main__":
    migrate()
