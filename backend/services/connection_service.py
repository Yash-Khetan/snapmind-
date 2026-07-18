from typing import List
from sqlalchemy.orm import Session

from backend.models.image_model import ImageRecord
from backend.models.connection_model import Connection
from backend.services.search_service import cosine_similarity

# Minimum cosine similarity to create a connection between two images
SIMILARITY_THRESHOLD = 0.8


def create_connections_for_image(new_image_id: int, new_embedding: list, db: Session) -> int:
    """
    Compares the new image's embedding against every existing image embedding.
    Creates a Connection record for each pair that scores >= SIMILARITY_THRESHOLD.

    Args:
        new_image_id: The database ID of the newly inserted image.
        new_embedding: The 384-dim embedding vector of the new image's OCR text.
        db: An active SQLAlchemy session.

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

    connections_created = 0

    for image in existing_images:
        score = cosine_similarity(new_embedding, image.embeddings)

        if score < SIMILARITY_THRESHOLD:
            continue

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
