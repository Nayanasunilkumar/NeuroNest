from app import app
from database.models import db
from sqlalchemy import text

def migrate():
    with app.app_context():
        print("Starting PostgreSQL migration...")
        
        # Add columns to users table
        columns = [
            ("account_status", "VARCHAR(20) DEFAULT 'active'"),
            ("is_email_verified", "BOOLEAN DEFAULT FALSE"),
            ("is_phone_verified", "BOOLEAN DEFAULT FALSE")
        ]
        
        for col_name, col_type in columns:
            try:
                db.session.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                db.session.commit()
                print(f"Added column: {col_name}")
            except Exception as e:
                db.session.rollback()
                print(f"Column {col_name} might already exist or error: {e}")

        # The new tables (flags, audit logs, etc.) were already created by init_db.py db.create_all()
        # because I added them to my models before running it.
        
        print("Migration check complete.")

if __name__ == "__main__":
    migrate()
