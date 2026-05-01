import os
import secrets
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
_ENVIRONMENT = (os.getenv("FLASK_ENV") or os.getenv("APP_ENV") or "development").strip().lower()
_IS_PRODUCTION = _ENVIRONMENT == "production"
_DEV_FALLBACK_SECRET = secrets.token_hex(32)


def _env_flag(name: str, default: bool = False) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None or raw_value.strip() == "":
        return default
    return int(raw_value)


def _resolve_secret_key() -> str:
    secret_key = (os.getenv("SECRET_KEY") or "").strip()
    if secret_key:
        return secret_key
    if _IS_PRODUCTION:
        raise RuntimeError("SECRET_KEY must be set when FLASK_ENV=production")
    return _DEV_FALLBACK_SECRET


def _resolve_jwt_secret(secret_key: str) -> str:
    jwt_secret = (os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET") or "").strip()
    if jwt_secret:
        return jwt_secret
    if _IS_PRODUCTION:
        raise RuntimeError("JWT_SECRET_KEY must be set when FLASK_ENV=production")
    return secret_key


def _resolve_access_token_expiry():
    hours = _env_int("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 12)
    if hours <= 0:
        if _IS_PRODUCTION:
            raise RuntimeError("JWT_ACCESS_TOKEN_EXPIRES_HOURS must be greater than 0 in production")
        return False
    return timedelta(hours=hours)


class Config:
    ENVIRONMENT = _ENVIRONMENT
    IS_PRODUCTION = _IS_PRODUCTION
    SECRET_KEY = _resolve_secret_key()
    JWT_SECRET_KEY = _resolve_jwt_secret(SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = _resolve_access_token_expiry()
    ENABLE_DIAGNOSTIC_ROUTES = _env_flag("ENABLE_DIAGNOSTIC_ROUTES", default=False) and not IS_PRODUCTION
    ALLOW_DEV_DOCTOR_BOOTSTRAP = _env_flag("ALLOW_DEV_DOCTOR_BOOTSTRAP", default=False) and not IS_PRODUCTION
    DEFAULT_DOCTOR_EMAIL = (os.getenv("DEFAULT_DOCTOR_EMAIL") or "").strip().lower()
    DEFAULT_DOCTOR_PASSWORD = os.getenv("DEFAULT_DOCTOR_PASSWORD") or ""
    VITALS_REQUIRE_DEVICE_AUTH = IS_PRODUCTION or _env_flag("VITALS_REQUIRE_DEVICE_AUTH", default=False)
    VITALS_DEVICE_TOKEN = (os.getenv("VITALS_DEVICE_TOKEN") or "").strip() or None
    VITALS_DEVICE_PATIENT_ID = _env_int("VITALS_DEVICE_PATIENT_ID", 0) or None
    VITALS_DEVICE_PATIENT_EMAIL = (os.getenv("VITALS_DEVICE_PATIENT_EMAIL") or "").strip().lower() or None

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
