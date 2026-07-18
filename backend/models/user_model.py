from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from database.database import Base


class UserRecord(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)  # bcrypt hash
    queries = Column(JSON, nullable=True, default=list)  # list of past query strings
    created_at = Column(DateTime, default=datetime.utcnow)
