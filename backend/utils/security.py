from passlib.context import CryptContext
from flask_jwt_extended import create_access_token

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

def generate_token(user_id: int, role: str) -> str:
    return create_access_token(
        identity=str(user_id),   # 🔥 MUST BE STRING
        additional_claims={"role": role}
    )