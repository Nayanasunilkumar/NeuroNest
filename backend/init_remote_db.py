import os
from flask import Flask
from config.config import Config
from database.models import db

# Explicitly use the remote NEON database URL provided by the user
REMOTE_DB_URL = "postgresql://neondb_owner:npg_iA8dhqTLUMj1@ep-old-waterfall-a1xzxd6q.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

def init_remote_db():
    print(f"Connecting to remote database at {REMOTE_DB_URL.split('@')[1]}...")
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = REMOTE_DB_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    db.init_app(app)
    
    with app.app_context():
        print("Creating all tables in the remote Neon database...")
        db.create_all()
        print("✅ Database successfully initialized with all NeuroNest tables!")

if __name__ == "__main__":
    init_remote_db()
