from dotenv import load_dotenv
load_dotenv()
from app import app
from database.models import db, User
from utils.security import hash_password

def reset_admin():
    with app.app_context():
        admin_email = "admin@neuronest.com"
        user = User.query.filter_by(email=admin_email).first()
        
        if user:
            print(f"Resetting password for {admin_email}...")
            user.password_hash = hash_password("Admin@123")
            user.role = "admin"
            user.account_status = "active"
            db.session.commit()
            print("Password reset successful!")
        else:
            print(f"Creating new admin user {admin_email}...")
            new_admin = User(
                email=admin_email,
                password_hash=hash_password("Admin@123"),
                role="admin",
                full_name="Nayana Admin",
                account_status="active"
            )
            db.session.add(new_admin)
            db.session.commit()
            print("Admin user created successfully!")

if __name__ == "__main__":
    reset_admin()
