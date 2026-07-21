from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.database import get_db
from models.image_model import ImageRecord
from models.user_model import UserRecord
from utils.auth import get_current_user
from services.clustering_service import run_dbscan_clustering

router = APIRouter(prefix="/clusters", tags=["Clustering"])


@router.get("/run")
def run_clustering(
    eps: float = Query(0.5, description="DBSCAN eps (cosine distance threshold)"),
    min_samples: int = Query(2, description="DBSCAN minimum samples per cluster"),
    current_user: UserRecord = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Experimental endpoint: runs DBSCAN clustering on the authenticated user's
    images that already have embeddings stored in the database.

    Does NOT modify the database — purely read-only.
    """
    # Fetch only the current user's images that have non-null embeddings
    images = (
        db.query(ImageRecord)
        .filter(
            ImageRecord.user_id == current_user.id,
            ImageRecord.embeddings.isnot(None),
        )
        .all()
    )

    result = run_dbscan_clustering(images=images, eps=eps, min_samples=min_samples)
    return result
