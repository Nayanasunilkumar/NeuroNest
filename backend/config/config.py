import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY") or os.urandom(32).hex()
    JWT_SECRET_KEY = os.getenv("JWT_SECRET") or SECRET_KEY
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///neuronest.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
