from passlib.context import CryptContext
from flask_jwt_extended import create_access_token
import bcrypt

pwd_context = CryptContext(
    schemes=["bcrypt"],
    bcrypt__default_rounds=10,
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    if not password or not hashed_password:
        return False
    try:
        return pwd_context.verify(password, hashed_password)
    except Exception:
        return False

def generate_token(user_id: int, role: str) -> str:
    return create_access_token(
        identity=str(user_id),   # 🔥 MUST BE STRING
        additional_claims={"role": role}
    )