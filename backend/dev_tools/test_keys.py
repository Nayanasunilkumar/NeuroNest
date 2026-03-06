import cloudinary
import cloudinary.api
import cloudinary.uploader
import base64

candidates = [
    "0085U7QHG3cuUd3-AmTWcjlaTL8",
    "O085U7QHG3cuUd3-AmTWcjlaTL8",
    "0O85U7QHG3cuUd3-AmTWcjlaTL8",
    "OO85U7QHG3cuUd3-AmTWcjlaTL8",
    "0085U7QHG3cuUd3-AmTWcj1aTL8",
]

for secret in candidates:
    print(f"Testing {secret}...")
    cloudinary.config(
        cloud_name="dqzb7b4zw",
        api_key="462441973916419",
        api_secret=secret,
        secure=True
    )
    try:
        cloudinary.api.ping()
        print(f"✅ SUCCESS: {secret}")
        with open(".env", "a") as f:
            f.write(f"\nFOUND_SECRET={secret}\n")
        break
    except Exception as e:
        pass
