from app import app
from database.models import db, User, DoctorProfile, DoctorAvailability
from utils.security import hash_password
from datetime import time, date
from sqlalchemy import text

def create_doctor():
    with app.app_context():
        # Drop old tables to ensure schema validity
        print("Cleaning up old tables...")
        try:
            db.session.execute(text("DROP TABLE IF EXISTS clock_in_out CASCADE")) # Just in case
            db.session.execute(text("DROP TABLE IF EXISTS doctor_profiles CASCADE"))
            db.session.execute(text("DROP TABLE IF EXISTS doctor_availability CASCADE"))
            db.session.execute(text("DROP TABLE IF EXISTS doctor_blocked_dates CASCADE"))
            db.session.execute(text("DROP TABLE IF EXISTS doctor_expertise_tags CASCADE"))
            db.session.execute(text("DROP TABLE IF EXISTS doctors CASCADE")) # Old table cleanup
            db.session.commit()
            print("Dropped old doctor tables.")
        except Exception as e:
            print(f"Error dropping tables: {e}")
            db.session.rollback()

        db.create_all() # Recreate tables
        
        # Check if doctor exists
        email = "doctor@neuronest.com"
        existing = User.query.filter_by(email=email).first()
        
        if existing:
            print(f"Doctor {email} already exists! Deleting to recreate with updated schema and password...")
            db.session.delete(existing)
            db.session.commit()

        # Create User
        print(f"Creating user {email}...")
        user = User(
            full_name="Dr. Nayana",
            email=email,
            password_hash=hash_password("123456"),
            role="doctor"
        )
        db.session.add(user)
        db.session.commit()
        
        # Create Doctor Profile
        print("Creating doctor profile...")
        doctor = DoctorProfile(
            user_id=user.id,
            specialization="Neurologist",
            license_number="NEURO-12345",
            experience_years=10,
            department="Neurology",
            bio="Expert in neurological disorders with over a decade of experience.",
            consultation_fee=150.0,
            qualification="MBBS, MD (Neurology)",
            hospital_name="City Neuro Hospital",
            consultation_mode="Both",
            phone="+1234567890",
            gender="Female",
            dob=date(1985, 5, 20),
            profile_image="" # Placeholder
        )
        db.session.add(doctor)
        db.session.commit()
        
        # Add Default Availability
        print("Adding default availability (Mon-Fri, 9am - 5pm)...")
        weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        for day in weekdays:
            avail = DoctorAvailability(
                doctor_id=doctor.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0)
            )
            db.session.add(avail)
            
        db.session.commit()
        
        print(f"✅ Doctor {email} created successfully with profile and availability!")

if __name__ == "__main__":
    create_doctor()
