from typing import List
from sqlalchemy.orm import Session

from models.image_model import ImageRecord
from models.connection_model import Connection
from services.search_service import cosine_similarity

# Default number of top connections to create for an image
TOP_K = 5


def create_connections_for_image(new_image_id: int, new_embedding: list, db: Session, top_k: int = TOP_K) -> int:
    """
    Compares the new image's embedding against every existing image embedding.
    Creates Connection records for the top K (default 5) most similar existing images.

    Args:
        new_image_id: The database ID of the newly inserted image.
        new_embedding: The 384-dim embedding vector of the new image's OCR text.
        db: An active SQLAlchemy session.
        top_k: Number of top similar images to connect to.

    Returns:
        The number of new connections created.
    """
    if new_embedding is None:
        return 0

    # Fetch all existing images that have embeddings, excluding the new one
    existing_images = (
        db.query(ImageRecord)
        .filter(
            ImageRecord.embeddings.isnot(None),
            ImageRecord.id != new_image_id,
        )
        .all()
    )

    if not existing_images:
        return 0

    # Score each candidate existing image against the new image
    scored_candidates = []
    for image in existing_images:
        score = cosine_similarity(new_embedding, image.embeddings)
        scored_candidates.append((score, image))

    # Sort by similarity score descending and pick top_k
    scored_candidates.sort(key=lambda x: x[0], reverse=True)
    top_candidates = scored_candidates[:top_k]

    connections_created = 0

    for score, image in top_candidates:
        # Enforce consistent ordering: smaller ID is always image_a_id
        a_id = min(new_image_id, image.id)
        b_id = max(new_image_id, image.id)

        # Skip if this connection already exists
        exists = (
            db.query(Connection)
            .filter(Connection.image_a_id == a_id, Connection.image_b_id == b_id)
            .first()
        )
        if exists:
            continue

        connection = Connection(
            image_a_id=a_id,
            image_b_id=b_id,
            similarity_score=round(score, 4),
        )
        db.add(connection)
        connections_created += 1

    # Commit all new connections in one batch
    if connections_created > 0:
        db.commit()

    return connections_created
