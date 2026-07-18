from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import get_db
from models.user_model import UserRecord
from models.image_model import ImageRecord
from models.connection_model import Connection
from utils.auth import get_current_user
from utils.supabase_client import get_signed_url


router = APIRouter(tags=["Connections"])


# ─── Response Schemas ────────────────────────────────────────────────

class ConnectedImageItem(BaseModel):
    image_id: int
    filename: str
    filepath: str
    ocr_text: str | None
    similarity_score: float


class ConnectionsResponse(BaseModel):
    image_id: int
    connections: list[ConnectedImageItem]


# ─── Endpoint ────────────────────────────────────────────────────────

@router.get("/connections/{image_id}", response_model=ConnectionsResponse)
def get_connections(
    image_id: int,
    current_user: UserRecord = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all images semantically connected to the given image,
    along with their similarity scores.
    """
    # Verify the image exists
    image = db.query(ImageRecord).filter(ImageRecord.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image with id {image_id} not found",
        )

    # Fetch connections where this image is on either side of the pair
    connections = (
        db.query(Connection)
        .filter(
            (Connection.image_a_id == image_id) | (Connection.image_b_id == image_id)
        )
        .all()
    )

    results = []
    for conn in connections:
        # Determine which side is the "other" image
        other_id = conn.image_b_id if conn.image_a_id == image_id else conn.image_a_id
        other_image = db.query(ImageRecord).filter(ImageRecord.id == other_id).first()

        if other_image:
            results.append(
                ConnectedImageItem(
                    image_id=other_image.id,
                    filename=other_image.filename,
                    filepath=get_signed_url(other_image.filepath),
                    ocr_text=other_image.ocr_text,
                    similarity_score=conn.similarity_score,
                )
            )

    # Sort by similarity descending and return top K (5)
    results.sort(key=lambda x: x.similarity_score, reverse=True)

    return ConnectionsResponse(image_id=image_id, connections=results[:5])
