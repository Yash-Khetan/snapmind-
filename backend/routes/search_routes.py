from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import get_db
from models.user_model import UserRecord
from utils.auth import get_current_user
from services.search_service import search_images

router = APIRouter(tags=["Search"])


# ─── Request / Response Schemas ──────────────────────────────────────

class SearchRequest(BaseModel):
    query: str


class SearchResultItem(BaseModel):
    id: int
    filename: str
    filepath: str
    ocr_text: str | None
    similarity_score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
    count: int


# ─── Endpoint ────────────────────────────────────────────────────────

@router.post("/search", response_model=SearchResponse)
def search(
    body: SearchRequest,
    current_user: UserRecord = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accepts a text query, generates its embedding, computes cosine similarity
    against all stored image embeddings, and returns the top K (default 5)
    most similar images.  The query is appended to the user's query history.
    """
    if not body.query or not body.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )

    # Run the semantic search
    results = search_images(query=body.query.strip(), db=db)

    # Append this query to the user's query history
    existing_queries = current_user.queries or []
    updated_queries = existing_queries + [body.query.strip()]

    # SQLAlchemy won't detect in-place mutation of a JSON column,
    # so we reassign the entire list to trigger the dirty flag.
    current_user.queries = updated_queries
    db.commit()

    return SearchResponse(
        query=body.query.strip(),
        results=results,
        count=len(results),
    )
