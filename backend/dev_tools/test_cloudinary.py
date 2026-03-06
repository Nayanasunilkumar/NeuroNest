from dotenv import load_dotenv
import os
import cloudinary
import cloudinary.api

load_dotenv()
try:
    print("Testing credentials...")
    res = cloudinary.api.ping()
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
