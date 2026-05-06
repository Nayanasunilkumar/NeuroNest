from app import app
from database.models import Alert
import json

with app.app_context():
    alerts = Alert.query.filter_by(patient_id=3).all()
    print(json.dumps([a.to_dict() for a in alerts], indent=2))
