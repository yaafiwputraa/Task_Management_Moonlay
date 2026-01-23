"""Users router for user management.

This module provides endpoints for listing and creating users.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..core.security import get_password_hash
from ..db import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.UserRead])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> List[models.User]:
    """Retrieve all users ordered by creation date.

    Args:
        db: Database session.
        _: Current authenticated user (unused, for auth only).

    Returns:
        List[models.User]: List of all users.
    """
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.post("/", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> models.User:
    """Create a new user.

    Args:
        payload: User creation data (name, email, password).
        db: Database session.
        _: Current authenticated user (unused, for auth only).

    Returns:
        models.User: The newly created user.

    Raises:
        HTTPException: 400 Bad Request if email already exists.
    """
    exists = (
        db.query(models.User).filter(models.User.email == payload.email).first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
