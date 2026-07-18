import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
# Use the secret key for backend admin operations, or publishable key if secret isn't available
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_signed_url(filepath: str, expires_in: int = 3600) -> str:
    """
    Generates a signed URL for a file in the 'images' bucket.
    """
    # If the database accidentally stored 'images/xyz.png' (from old sqlite), strip 'images/'
    if filepath.startswith("images/"):
        filepath = filepath[7:]
    
    # Generate the signed URL
    res = supabase.storage.from_("images").create_signed_url(filepath, expires_in)
    if isinstance(res, dict):
        return res.get("signedUrl", res.get("signedURL", filepath))
    elif isinstance(res, str):
        return res
    return filepath
