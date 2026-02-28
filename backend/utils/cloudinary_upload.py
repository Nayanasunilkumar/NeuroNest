"""
Centralised Cloudinary helper for NeuroNest.
All file uploads go through this module so swapping providers later is trivial.
"""
import os
import cloudinary
import cloudinary.uploader

# One-time SDK configuration (reads from environment variables set at deploy time)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

def upload_file(file_stream, public_id: str, folder: str, resource_type: str = "auto") -> dict:
    """
    Upload a file stream to Cloudinary.
    Returns the full Cloudinary response dict (url, public_id, etc.)
    Raises on failure.
    """
    result = cloudinary.uploader.upload(
        file_stream,
        public_id=public_id,
        folder=folder,
        resource_type=resource_type,
        overwrite=True,
        use_filename=False,
    )
    return result


def delete_file(public_id: str, resource_type: str = "auto") -> None:
    """Delete a file from Cloudinary by its public_id. Silent on failure."""
    try:
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
    except Exception:
        pass


def cloudinary_is_configured() -> bool:
    """Returns True only when all three Cloudinary env vars are present."""
    return all([
        os.getenv("CLOUDINARY_CLOUD_NAME"),
        os.getenv("CLOUDINARY_API_KEY"),
        os.getenv("CLOUDINARY_API_SECRET"),
    ])
