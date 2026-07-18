import os
import re
from pathlib import Path
from PIL import Image
import pytesseract
import io


def _ensure_tesseract_cmd():
    """
    Checks common Windows installation locations for tesseract.exe 
    if it is not already accessible in the system PATH.
    """
    common_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    ]
    for path in common_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break

def extract_text_from_image(relative_image_path: str) -> str:
    """
    Takes a relative path like 'images/abc.png', opens the image file,
    and returns the extracted OCR text string.
    """
    _ensure_tesseract_cmd()
    
    # Resolve absolute path from project root
    root_dir = Path(__file__).resolve().parent.parent.parent
    absolute_path = root_dir / relative_image_path
    
    if not absolute_path.exists():
        return ""
        
    try:
        with Image.open(absolute_path) as img:
            raw_text = pytesseract.image_to_string(img)
            # Replace all newlines, carriage returns, and multiple spaces with a single space
            return re.sub(r'\s+', ' ', raw_text).strip()

    except Exception as e:
        print(f"OCR error for {relative_image_path}: {e}")
        return f"OCR Error: {str(e)}"

def extract_text_from_bytes(file_bytes: bytes) -> str:
    """
    Takes raw image bytes and returns the extracted OCR text string.
    """
    _ensure_tesseract_cmd()
    
    try:
        with Image.open(io.BytesIO(file_bytes)) as img:
            raw_text = pytesseract.image_to_string(img)
            # Replace all newlines, carriage returns, and multiple spaces with a single space
            return re.sub(r'\s+', ' ', raw_text).strip()

    except Exception as e:
        print(f"OCR error from bytes: {e}")
        return f"OCR Error: {str(e)}"
