from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.database import get_db
from models.user_model import UserRecord
from models.image_model import ImageRecord
from models.connection_model import Connection
from utils.auth import get_current_user
from utils.supabase_client import get_signed_url

router = APIRouter(tags=["Images"])


# ─── Response Schemas ────────────────────────────────────────────────

class ImageListItem(BaseModel):
    id: int
    filename: str
    filepath: str
    ocr_text: str | None
    uploaded_at: str
    connections_count: int


class ImageListResponse(BaseModel):
    images: list[ImageListItem]
    total: int


class ImageDetailResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    ocr_text: str | None
    uploaded_at: str
    connections_count: int


# ─── Endpoints ───────────────────────────────────────────────────────

@router.get("/images", response_model=ImageListResponse)
def list_images(
    sort: str = Query("newest", pattern="^(newest|connections)$"),
    current_user: UserRecord = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all uploaded images with their connection counts.
    Supports sorting by 'newest' (default) or 'connections'.
    """
    images = db.query(ImageRecord).all()

    results = []
    for img in images:
        conn_count = (
            db.query(func.count(Connection.id))
            .filter(
                (Connection.image_a_id == img.id) | (Connection.image_b_id == img.id)
            )
            .scalar()
        )
        results.append(
            ImageListItem(
                id=img.id,
                filename=img.filename,
                filepath=get_signed_url(img.filepath),
                ocr_text=img.ocr_text,
                uploaded_at=img.uploaded_at.isoformat() if img.uploaded_at else "",
                connections_count=conn_count,
            )
        )

    if sort == "newest":
        results.sort(key=lambda x: x.uploaded_at, reverse=True)
    elif sort == "connections":
        results.sort(key=lambda x: x.connections_count, reverse=True)

    return ImageListResponse(images=results, total=len(results))


@router.get("/images/{image_id}", response_model=ImageDetailResponse)
def get_image(
    image_id: int,
    current_user: UserRecord = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns a single image's details by ID.
    """
    image = db.query(ImageRecord).filter(ImageRecord.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image with id {image_id} not found",
        )

    conn_count = (
        db.query(func.count(Connection.id))
        .filter(
            (Connection.image_a_id == image_id) | (Connection.image_b_id == image_id)
        )
        .scalar()
    )

    return ImageDetailResponse(
        id=image.id,
        filename=image.filename,
        filepath=get_signed_url(image.filepath),
        ocr_text=image.ocr_text,
        uploaded_at=image.uploaded_at.isoformat() if image.uploaded_at else "",
        connections_count=conn_count,
    )
