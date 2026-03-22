from app import app
from database.models import User

with app.app_context():
    users = User.query.all()
    for u in users:
        print(f"ID:{u.id} | Email:{u.email} | Name:{u.full_name}")
