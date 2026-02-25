from app import app
from database.models import db, User
from sqlalchemy import text
from datetime import datetime
import json

def json_serial(obj):
    if isinstance(obj, (datetime)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

with app.app_context():
    uid = 1 # Assuming user 1 exists
    user = User.query.get(uid)
    if not user:
        print("User not found")
        exit()
        
    appointments = db.session.execute(
        text("SELECT a.*, u.full_name as doctor_name FROM appointments a JOIN users u ON u.id = a.doctor_id WHERE a.patient_id = :uid ORDER BY a.appointment_date DESC"),
        {"uid": uid}
    ).mappings().fetchall()
    
    try:
        data = [dict(a) for a in appointments]
        # Try serializing with standard json
        json.dumps(data, default=str)
        print("Serialization successful")
    except Exception as e:
        print(f"Serialization failed: {e}")
