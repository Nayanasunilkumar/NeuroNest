import jwt
from datetime import datetime, timedelta
from config.config import Config

def generate_token(payload):
    payload["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")
