import os
from sqlalchemy import create_engine, inspect

db_url = "postgresql://postgres:9744@localhost:5432/neuronest"
engine = create_engine(db_url)
inspector = inspect(engine)

print("Columns in 'users' table:")
for column in inspector.get_columns("users"):
    print(f" - {column['name']} ({column['type']})")
