from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database.database import get_db
from backend.models.user_model import UserRecord
from backend.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Request / Response Schemas ──────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    id: int
    name: str
    email: str
    token: str


class MeResponse(BaseModel):
    id: int
    name: str
    email: str
    queries: list


# ─── Endpoints ───────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user. Returns the user profile + a JWT access token.
    """
    # Check if email already exists
    existing = db.query(UserRecord).filter(UserRecord.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = UserRecord(
        name=body.name,
        email=body.email,
        password=hash_password(body.password),
        queries=[],
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})

    return AuthResponse(id=user.id, name=user.name, email=user.email, token=token)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an existing user. Returns the user profile + a JWT access token.
    """
    user = db.query(UserRecord).filter(UserRecord.email == body.email).first()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(data={"sub": str(user.id)})

    return AuthResponse(id=user.id, name=user.name, email=user.email, token=token)


@router.get("/me", response_model=MeResponse)
def me(current_user: UserRecord = Depends(get_current_user)):
    """
    Returns the authenticated user's profile including their query history.
    """
    return MeResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        queries=current_user.queries or [],
    )
