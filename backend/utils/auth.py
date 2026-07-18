import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database.database import get_db

# Load environment variables from .env
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "snapmind-dev-secret-key-change-in-prod")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Password hashing context using bcrypt
# bcrypt__truncate_error=False allows passlib to silently truncate
# passwords longer than 72 bytes instead of raising an error
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=False)

# FastAPI security scheme — extracts Bearer token from Authorization header
bearer_scheme = HTTPBearer()


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using bcrypt (max 72 bytes)."""
    # Encode to bytes to check actual byte-length (UTF-8 chars can be multi-byte)
    if len(plain_password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be 72 bytes or fewer (roughly 72 ASCII characters).",
        )
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT token containing the provided data payload.
    Default expiry is ACCESS_TOKEN_EXPIRE_MINUTES from .env.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency that extracts and validates the JWT from the
    Authorization: Bearer <token> header, then returns the UserRecord.
    """
    from models.user_model import UserRecord

    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise credentials_exception

    user = db.query(UserRecord).filter(UserRecord.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user
