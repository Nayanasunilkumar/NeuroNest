from app import app
from database.models import db, User, PatientProfile
from utils.security import hash_password


def create_patient():
    with app.app_context():
        # Create default patient if none exist
        existing = User.query.filter_by(role="patient").first()
        if existing:
            print(f"Patient already exists: {existing.email} (id={existing.id})")
            return

        email = "patient@example.com"
        password = "patient123"

        user = User(
            full_name="Test Patient",
            email=email,
            password_hash=hash_password(password),
            role="patient"
        )
        db.session.add(user)
        db.session.commit()

        profile = PatientProfile(user_id=user.id, full_name=user.full_name)
        db.session.add(profile)
        db.session.commit()

        print("✅ Created test patient account")
        print(f"  email: {email}")
        print(f"  password: {password}")
        print(f"  user id: {user.id}")


if __name__ == "__main__":
    create_patient()
