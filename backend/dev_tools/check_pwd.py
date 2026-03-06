import os
from sqlalchemy import create_engine, text

db_url = "postgresql://postgres:9744@localhost:5432/neuronest"
engine = create_engine(db_url)

with engine.connect() as conn:
    result = conn.execute(text("SELECT email, password_hash FROM users WHERE email = 'abc@gmail.com'"))
    row = result.fetchone()
    if row:
        print(f"User: {row[0]}")
        print(f"Hash: {row[1][:20]}...")
    else:
        print("User not found")
