from dotenv import load_dotenv
load_dotenv()
from app import app
from database.models import db, User

with app.app_context():
    print("-" * 50)
    print(f"{'ID':<5} {'Email':<30} {'Role':<15} {'Name'}")
    print("-" * 50)
    
    # FIND AND UPDATE
    target_email = "abc@gmail.com"
    user = User.query.filter_by(email=target_email).first()
    if user:
        print(f"Found User: {user.email}, Current Role: {user.role}")
        user.role = "patient"
        db.session.commit()
        print(f"UPDATED User: {user.email} to Role: {user.role}")
    else:
        print(f"User {target_email} not found!")

    print("-" * 50)
    # List again to confirm
    users = User.query.all()
    for u in users:
        print(f"{u.id:<5} {u.email:<30} {u.role:<15} {u.full_name}")
    print("-" * 50)
