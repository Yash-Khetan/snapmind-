from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database.database import Base


class Connection(Base):
    __tablename__ = "Connections"

    id = Column(Integer, primary_key=True, index=True)
    image_a_id = Column(Integer, ForeignKey("Images.id"), nullable=False)
    image_b_id = Column(Integer, ForeignKey("Images.id"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships to ImageRecord for ORM-level joins
    image_a = relationship("ImageRecord", foreign_keys=[image_a_id])
    image_b = relationship("ImageRecord", foreign_keys=[image_b_id])

    # Prevent duplicate pairs — combined with min/max ordering this also
    # prevents reverse duplicates (A↔B stored only once).
    __table_args__ = (
        UniqueConstraint("image_a_id", "image_b_id", name="uq_connection_pair"),
    )
