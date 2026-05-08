import sys
import os
from sqlalchemy import create_engine, MetaData, Table, select, func

DATABASE_URL = "postgresql://neondb_owner:npg_iA8dhqTLUMj1@ep-old-waterfall-a1xzxd6q-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

engine = create_engine(DATABASE_URL)
metadata = MetaData()

DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES = (
    "rejected",
    "cancelled",
    "cancelled_by_doctor",
    "cancelled_by_patient",
)

try:
    users = Table('users', metadata, autoload_with=engine)
    appointments = Table('appointments', metadata, autoload_with=engine)

    with engine.connect() as conn:
        doctor_ids = [2] # Dr. Naina
        
        print(f"Checking for Doctor IDs: {doctor_ids}")
        
        stmt = (
            select(appointments.c.patient_id)
            .where(
                appointments.c.doctor_id.in_(doctor_ids),
                func.lower(appointments.c.status).notin_(DOCTOR_PATIENT_RELATIONSHIP_EXCLUDED_STATUSES)
            )
            .distinct()
        )
        
        rows = conn.execute(stmt).all()
        print(f"Related Patient IDs: {[row[0] for row in rows]}")
        
except Exception as e:
    print(f"Error: {e}")
