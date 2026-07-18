import os
import uuid
from pathlib import Path
from fastapi import UploadFile

# Define root project directory and images directory
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
IMAGES_DIR = ROOT_DIR / "images"

# Ensure the images directory exists
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Saves an UploadFile to the 'images/' directory with a unique filename.
    Returns the relative path: 'images/unique_name.ext'
    """
    # Extract original filename and extension
    original_filename = upload_file.filename or "unknown.png"
    extension = Path(original_filename).suffix
    if not extension:
        extension = ".png"
        
    # Generate unique filename using UUID to prevent collisions
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    target_path = IMAGES_DIR / unique_filename
    
    # Stream chunks from the uploaded file and write directly to disk
    with open(target_path, "wb") as buffer:
        while chunk := await upload_file.read(1024 * 1024):  # Read in 1MB chunks
            buffer.write(chunk)
            
    # Reset file cursor just in case it is read again later
    await upload_file.seek(0)
    
    # Return path exactly as specified: "images/abc.png"
    return f"images/{unique_filename}"
