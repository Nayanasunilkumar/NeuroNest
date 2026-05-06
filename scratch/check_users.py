import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app
from database.models import db, User

def check_users():
    app = create_app()
    with app.app_context():
        users = User.query.limit(10).all()
        print(f"Found {len(users)} users")
        for u in users:
            print(f"{u.id}: {u.full_name} ({u.role})")

if __name__ == "__main__":
    check_users()
