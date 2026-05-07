import os
from app import create_app
from database.models import db

def setup_db():
    print("[SETUP] Starting database initialization...")
    app = create_app()
    with app.app_context():
        try:
            # 1. Create tables
            db.create_all()
            print("[SETUP] ✓ Tables created.")
            
            # 2. Run migrations
            from core.migrations import run_startup_migrations
            run_startup_migrations()
            print("[SETUP] ✓ Migrations complete.")
            
        except Exception as e:
            print(f"[SETUP] ❌ Error: {e}")
            # We don't exit with 1 because we want the app to try booting anyway
            
    print("[SETUP] Database initialization finished.")

if __name__ == "__main__":
    setup_db()
