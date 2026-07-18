import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from utils.supabase_client import supabase

async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Uploads an UploadFile to the 'images' Supabase storage bucket with a unique filename.
    Returns the storage path: 'images/unique_name.ext'
    """
    # Extract original filename and extension
    original_filename = upload_file.filename or "unknown.png"
    extension = Path(original_filename).suffix
    if not extension:
        extension = ".png"
        
    # Generate unique filename using UUID to prevent collisions
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    # We prefix with 'images/' just to keep the path consistent with what we had before,
    # or you can just store 'unique_filename' if the bucket is named 'images'.
    # For now, let's store it at the root of the 'images' bucket.
    storage_path = f"{unique_filename}"
    
    # Read the file content
    file_bytes = await upload_file.read()
    
    # Upload to Supabase 'images' bucket
    # The file bytes are sent directly
    res = supabase.storage.from_("images").upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": upload_file.content_type or "image/png"}
    )
    
    # Reset file cursor just in case it is read again later
    await upload_file.seek(0)
    
    # Return path. We prefix with "images/" so the database stores "images/xyz.png"
    # This matches old behavior, but we will strip the "images/" part when generating signed URLs
    # OR we can just return unique_filename and update the DB records during migration.
    # Returning unique_filename is cleaner for Supabase bucket logic.
    return unique_filename
