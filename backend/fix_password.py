import os
from flask import Flask
from utils.security import hash_password
from database.models import db, User

REMOTE_DB_URL = "postgresql://neondb_owner:npg_iA8dhqTLUMj1@ep-old-waterfall-a1xzxd6q.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

def fix_password():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = REMOTE_DB_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    db.init_app(app)
    
    with app.app_context():
        # Update doctor password
        user = User.query.filter_by(email="doctor@neuronest.com").first()
        if user:
            user.password_hash = hash_password("123456")
            db.session.commit()
            print("Successfully updated password for doctor@neuronest.com to '123456'")
        else:
            print("User doctor@neuronest.com not found")

if __name__ == "__main__":
    fix_password()
