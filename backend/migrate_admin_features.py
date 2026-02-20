import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "neuronest.db")

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Updating 'users' table...")
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'active'")
        cursor.execute("ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT 0")
        cursor.execute("ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT 0")
        print("Columns added to 'users'.")
    except Exception as e:
        print(f"Users table might already be updated or error: {e}")

    print("Creating audit and flag tables...")
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS patient_status_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        admin_id INTEGER NOT NULL,
        previous_status TEXT,
        new_status TEXT NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES users(id),
        FOREIGN KEY(admin_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS patient_flags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        reporter_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        reason TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',
        is_resolved BOOLEAN DEFAULT 0,
        resolved_at DATETIME,
        resolved_by INTEGER,
        resolution_note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES users(id),
        FOREIGN KEY(reporter_id) REFERENCES users(id),
        FOREIGN KEY(resolved_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS patient_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        actor_id INTEGER NOT NULL,
        action_type TEXT NOT NULL,
        description TEXT,
        action_metadata TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES users(id),
        FOREIGN KEY(actor_id) REFERENCES users(id)
    );
    """)
    print("New tables created.")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
