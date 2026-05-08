import os
import re


DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173,https://neuro-nest-two.vercel.app"


def build_cors_origins():
    raw_origins = os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    # Remove regex for now to test stability
    return allowed_origins
