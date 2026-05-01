from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent


def load_environment():
    """Load backend-local environment variables once before app setup."""
    load_dotenv(BASE_DIR / ".env", override=False)
    return BASE_DIR
