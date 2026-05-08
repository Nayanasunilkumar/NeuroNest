import sys
import os
from sqlalchemy import create_engine, MetaData, Table, select

DATABASE_URL = "postgresql://neondb_owner:npg_iA8dhqTLUMj1@ep-old-waterfall-a1xzxd6q-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

engine = create_engine(DATABASE_URL)
metadata = MetaData()

try:
    users = Table('users', metadata, autoload_with=engine)
    appointments = Table('appointments', metadata, autoload_with=engine)

    with engine.connect() as conn:
        print("Doctors:")
        stmt = select(users).where(users.c.role == 'doctor')
        for row in conn.execute(stmt):
            print(f"ID: {row.id}, Name: {row.full_name}, Email: {row.email}")

        print("\nPatients:")
        stmt = select(users).where(users.c.role == 'patient')
        for row in conn.execute(stmt):
            print(f"ID: {row.id}, Name: {row.full_name}")

        print("\nAppointments:")
        stmt = select(appointments)
        for row in conn.execute(stmt):
            # Fetch patient name
            p_stmt = select(users.c.full_name).where(users.c.id == row.patient_id)
            p_name = conn.execute(p_stmt).scalar() or "Unknown"
            print(f"ID: {row.id}, Doctor ID: {row.doctor_id}, Patient: {p_name} (ID: {row.patient_id}), Date: {row.appointment_date}, Status: {row.status}")
except Exception as e:
    print(f"Error: {e}")
