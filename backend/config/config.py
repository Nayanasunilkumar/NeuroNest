import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY") or os.urandom(32).hex()
    JWT_SECRET_KEY = os.getenv("JWT_SECRET") or SECRET_KEY
    # No forced access-token timeout. Frontend inactivity manager handles session logout.
    JWT_ACCESS_TOKEN_EXPIRES = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Disable Connection Pooling to prevent Eventlet lock crashes in production
    from sqlalchemy.pool import NullPool
    SQLALCHEMY_ENGINE_OPTIONS = {
        'poolclass': NullPool
    }
