from app import app
from database.models import User

with app.app_context():
    u = User.query.filter_by(email='nezrinnoushad20@gmail.com').first()
    if u:
        print(f"USER_ID:{u.id}")
        print(f"FULL_NAME:{u.full_name}")
    else:
        print("NOT_FOUND")
