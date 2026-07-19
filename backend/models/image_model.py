from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from database.database import Base

class ImageRecord(Base):
    __tablename__ = "Images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.id"), nullable=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    ocr_text = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    embeddings = Column(JSON, nullable=True)
