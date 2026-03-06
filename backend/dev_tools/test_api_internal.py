import os
from flask import Flask
from dotenv import load_dotenv

# We need to simulate a request to see what the server returns
from database.models import db, PatientMedication
from app import create_app

app = create_app()

with app.app_context():
    # test query manually for patient 4
    import datetime
    query = PatientMedication.query.filter_by(patient_id=4)
    rows = query.all()
    print("Patient 4 meds:", [r.drug_name for r in rows])
    
    # check route manually via test client
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity="4", additional_claims={"role": "patient"})
    
    client = app.test_client()
    resp = client.get("/api/patient/medications?include_inactive=true", headers={"Authorization": f"Bearer {token}"})
    print("API RESPONSE STATUS:", resp.status_code)
    try:
        data = resp.get_json()
        print("API RESPONSE MEDS COUNT:", len(data))
        print("API RESPONSE DATA:", [d.get("drug_name") for d in data])
        print("API RESPONSE STATUSES:", [d.get("status") for d in data])
    except Exception as e:
        print("failed JSON", str(e))
