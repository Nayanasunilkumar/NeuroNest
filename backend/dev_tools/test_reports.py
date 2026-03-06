import os
import json
from app import app
from database.models import db, User
from flask_jwt_extended import create_access_token

def test_endpoints():
    with app.test_request_context():
        with app.app_context():
            token = create_access_token(identity="1", additional_claims={"role": "admin"})

    with app.test_client() as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        for ep in ["overview", "appointments", "doctors", "governance"]:
            print(f"Testing /api/admin/reports/{ep}")
            res = client.get(f"/api/admin/reports/{ep}", headers=headers)
            print(f"Status: {res.status_code}")
            if res.status_code != 200:
                print(f"Error: {res.get_data(as_text=True)}")

if __name__ == "__main__":
    test_endpoints()
