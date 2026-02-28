import os
from flask import Flask
from utils.security import hash_password
from database.models import db, User, DoctorProfile, PatientProfile

REMOTE_DB_URL = "postgresql://neondb_owner:npg_iA8dhqTLUMj1@ep-old-waterfall-a1xzxd6q.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

def seed_db():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = REMOTE_DB_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    db.init_app(app)
    
    with app.app_context():
        # Doctor/Admin
        email = "abc@gmail.com"
        existing = User.query.filter_by(email=email).first()
        if not existing:
            print("Creating Doctor abc@gmail.com ...")
            user = User(
                email=email,
                password_hash=hash_password("password123"),
                role="doctor",
                full_name="Dr. Default"
            )
            db.session.add(user)
            db.session.flush()
            
            profile = DoctorProfile(
                user_id=user.id,
                specialization="Neurologist",
                qualification="MD",
                experience_years=5
            )
            db.session.add(profile)
            db.session.commit()
            print("✅ Default doctor 'abc@gmail.com' created with password: password123")
        else:
            print(f"✅ {email} already exists in remote DB!")

if __name__ == "__main__":
    seed_db()
