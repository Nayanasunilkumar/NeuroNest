import json
import random
import time
from datetime import datetime, timezone
from os import getenv

import requests


BACKEND_URL = getenv("NEURONEST_BACKEND_URL", "http://127.0.0.1:5000")
DEVICE_ID = getenv("NEURONEST_DEVICE_ID", "device-demo-001")
DEVICE_TOKEN = getenv("NEURONEST_DEVICE_TOKEN", "")
INTERVAL_SECONDS = float(getenv("NEURONEST_STREAM_INTERVAL", "2"))


def build_payload():
    base_hr = random.randint(68, 82)
    return {
        "device_id": DEVICE_ID,
        "device_token": DEVICE_TOKEN,
        "heart_rate": base_hr,
        "spo2": random.randint(96, 100),
        "temperature": round(random.uniform(36.4, 37.1), 1),
        "ecg_data": [round(random.uniform(-0.25, 1.0), 3) for _ in range(96)],
        "signal": "ok",
        "recorded_timestamp": datetime.now(timezone.utc).isoformat(),
    }


def main():
    if not DEVICE_TOKEN:
        raise SystemExit("Set NEURONEST_DEVICE_TOKEN before running this client.")

    endpoint = f"{BACKEND_URL.rstrip('/')}/api/device/vitals"
    print(f"Streaming vitals to {endpoint} as {DEVICE_ID}")

    while True:
        payload = build_payload()
        try:
            response = requests.post(
                endpoint,
                json=payload,
                timeout=10,
                headers={
                    "Content-Type": "application/json",
                    "X-Device-Id": DEVICE_ID,
                    "X-Device-Token": DEVICE_TOKEN,
                },
            )
            response.raise_for_status()
            print(f"[{datetime.now().isoformat(timespec='seconds')}] sent {json.dumps(response.json())}")
        except requests.RequestException as exc:
            print(f"[WARN] stream failed: {exc}. Retrying in 5s...")
            time.sleep(5)
            continue

        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
