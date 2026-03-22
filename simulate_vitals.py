import requests
import json
import time

url = "http://localhost:5000/api/vitals/update"
payload = {
    "hr": 75,
    "spo2": 98,
    "temp": 36.6,
    "signal": "strong",
    "patient_id": 1 # Patient ABC's ID (found earlier via find_user.py)
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
