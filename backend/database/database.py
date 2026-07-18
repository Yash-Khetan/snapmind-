from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = ROOT_DIR / "database" / "snapmind.db"

# Ensure database directory exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    """Initializes the SQLite tables if they do not exist."""
    import backend.models.image_model
    import backend.models.user_model
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
    from backend.models.image_model import ImageRecord
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
