from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

# We expect a postgresql:// URL from Supabase in the .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env")

# Handle the case where the URL starts with postgres:// instead of postgresql://
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# PostgreSQL usually doesn't need check_same_thread=False (that's for SQLite)
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
def init_db():
    """Initializes the SQLite tables if they do not exist."""
    import models.image_model
    import models.user_model
    import models.connection_model
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def insert_image_record(filename: str, filepath: str, ocr_text: str = None, category: str = None, embeddings: list = None) -> int:
    """
    Inserts a new image record into the Images SQLite table and returns the generated primary key ID.
    """
    from models.image_model import ImageRecord
    init_db()  # Ensure table exists before inserting
    db = SessionLocal()
    try:
        record = ImageRecord(
            filename=filename,
            filepath=filepath,
            ocr_text=ocr_text,
            category=category,
            embeddings=embeddings
        )

        db.add(record)
        db.commit()
        db.refresh(record)
        return record.id
    finally:
        db.close()
