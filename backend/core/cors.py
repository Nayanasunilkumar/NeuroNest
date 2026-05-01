import os
import re


DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


def build_cors_origins():
    raw_origins = os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    allowed_origins.append(re.compile(r"^https://.*\.vercel\.app$"))
    return allowed_origins
