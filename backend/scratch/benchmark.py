
import time
import requests

URL = "https://neuronest-backend-2rn0.onrender.com"

print("--- Step 1: Warm-up Ping ---")
start = time.time()
try:
    r = requests.get(URL, timeout=120)
    print(f"Warm-up took: {time.time() - start:.2f}s")
    print(f"Status: {r.status_code}")
except Exception as e:
    print(f"Warm-up failed: {e}")

print("\n--- Step 2: Login API ---")
start = time.time()
try:
    r = requests.post(f"{URL}/api/auth/login", json={"email": "nezrinnoushad20@gmail.com", "password": "wrong"}, timeout=120)
    print(f"Login took: {time.time() - start:.2f}s")
    print(f"Status: {r.status_code}")
except Exception as e:
    print(f"Login failed: {e}")
