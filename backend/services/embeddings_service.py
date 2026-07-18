from typing import List, Optional
from sentence_transformers import SentenceTransformer

# Load pretrained model once when the service is initialized
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def generate_text_embedding(text: Optional[str]) -> Optional[List[float]]:
    """
    Takes OCR text, encodes it using all-MiniLM-L6-v2, and returns a Python list of floats.
    Returns None if text is empty or None.
    """
    if not text or not text.strip():
        return None
        
    try:
        # Calculate embeddings
        vector = model.encode(text)
        # MUST convert numpy array to pure Python list (.tolist()) so SQLAlchemy/JSON can serialize it
        return vector.tolist()
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None