import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    # 💎 HARD FIX: Stable secret for persistent sessions across restarts
    SECRET_KEY = os.getenv("SECRET_KEY") or "neuronest-production-clinical-nexus-secret-v1"
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = False

    # Default to sqlite for local development if DATABASE_URL is not provided
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or f"sqlite:///{BASE_DIR / 'neuronest.db'}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # SQLAlchemy Engine config to fix "SSL connection closed unexpectedly" on Neon/Render
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }
