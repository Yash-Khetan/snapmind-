from typing import List, Dict, Any

import numpy as np
from sqlalchemy.orm import Session

from models.image_model import ImageRecord
from services.embeddings_service import generate_text_embedding

# Default number of top results to return
TOP_K = 5


def cosine_similarity(vec_a: list, vec_b: list) -> float:
    """
    Computes cosine similarity between two vectors.
    Returns a float in [-1, 1].  Higher = more similar.
    """
    a = np.array(vec_a, dtype=np.float64).flatten()
    b = np.array(vec_b, dtype=np.float64).flatten()

    if a.shape != b.shape:
        return 0.0

    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    # Guard against zero-length vectors
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return float(dot_product / (norm_a * norm_b))


def search_images(query: str, db: Session, top_k: int = TOP_K, user_id: int = None) -> List[Dict[str, Any]]:
    """
    1. Generate an embedding for the user's query text.
    2. Fetch all image records that have a stored embedding for the given user.
    3. Compute cosine similarity between the query embedding and each image embedding.
    4. Return the top K (default 5) most similar images, sorted by similarity descending.
    """
    # Step 1 — embed the query
    query_embedding = generate_text_embedding(query)
    if query_embedding is None:
        return []

    # Step 2 — fetch all images with non-null embeddings for the user
    query_filter = [ImageRecord.embeddings.isnot(None)]
    if user_id is not None:
        query_filter.append(ImageRecord.user_id == user_id)

    images = (
        db.query(ImageRecord)
        .filter(*query_filter)
        .all()
    )

    if not images:
        return []

    # Step 3 — compute similarity for each image
    scored_results = []
    for image in images:
        score = cosine_similarity(query_embedding, image.embeddings)
        scored_results.append({
            "id": image.id,
            "filename": image.filename,
            "filepath": image.filepath,
            "ocr_text": image.ocr_text,
            "similarity_score": round(score, 4),
        })

    # Step 4 — sort by similarity descending and return top K
    scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)

    return scored_results[:top_k]
