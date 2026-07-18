from typing import List, Dict, Any

import numpy as np
from sqlalchemy.orm import Session

from backend.models.image_model import ImageRecord
from backend.services.embeddings_service import generate_text_embedding

# Minimum cosine similarity threshold — only images scoring above this are returned
SIMILARITY_THRESHOLD = 0.8


def cosine_similarity(vec_a: list, vec_b: list) -> float:
    """
    Computes cosine similarity between two vectors.
    Returns a float in [-1, 1].  Higher = more similar.
    """
    a = np.array(vec_a, dtype=np.float64)
    b = np.array(vec_b, dtype=np.float64)

    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    # Guard against zero-length vectors
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return float(dot_product / (norm_a * norm_b))


def search_images(query: str, db: Session) -> List[Dict[str, Any]]:
    """
    1. Generate an embedding for the user's query text.
    2. Fetch all image records that have a stored embedding.
    3. Compute cosine similarity between the query embedding and each image embedding.
    4. Return ALL images whose similarity score >= SIMILARITY_THRESHOLD (0.8),
       sorted by similarity descending.
    """
    # Step 1 — embed the query
    query_embedding = generate_text_embedding(query)
    if query_embedding is None:
        return []

    # Step 2 — fetch all images with non-null embeddings
    images = (
        db.query(ImageRecord)
        .filter(ImageRecord.embeddings.isnot(None))
        .all()
    )

    if not images:
        return []

    # Step 3 — compute similarity for each image
    scored_results = []
    for image in images:
        score = cosine_similarity(query_embedding, image.embeddings)
        if score >= SIMILARITY_THRESHOLD:
            scored_results.append({
                "id": image.id,
                "filename": image.filename,
                "filepath": image.filepath,
                "ocr_text": image.ocr_text,
                "similarity_score": round(score, 4),
            })

    # Step 4 — sort by similarity descending
    scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)

    return scored_results
