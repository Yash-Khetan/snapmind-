from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import get_db
from models.user_model import UserRecord
from models.image_model import ImageRecord
from models.connection_model import Connection
from utils.auth import get_current_user


router = APIRouter(tags=["Graph"])


# ─── Response Schemas ────────────────────────────────────────────────

class GraphNode(BaseModel):
    id: int
    filename: str
    filepath: str
    ocr_text: str | None


class GraphEdge(BaseModel):
    source: int
    target: int
    similarity_score: float


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


# ─── Endpoint ────────────────────────────────────────────────────────

@router.get("/graph", response_model=GraphResponse)
def get_graph(
    current_user: UserRecord = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all images as nodes and all connections as edges,
    structured for direct consumption by React Flow.
    """
    images = (
        db.query(ImageRecord)
        .filter(ImageRecord.embeddings.isnot(None))
        .all()
    )

    nodes = [
        GraphNode(
            id=img.id,
            filename=img.filename,
            filepath=img.filepath,
            ocr_text=img.ocr_text,
        )
        for img in images
    ]

    connections = db.query(Connection).all()

    edges = [
        GraphEdge(
            source=conn.image_a_id,
            target=conn.image_b_id,
            similarity_score=conn.similarity_score,
        )
        for conn in connections
    ]

    return GraphResponse(nodes=nodes, edges=edges)
