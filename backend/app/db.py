"""Database session and base declaration.

This module provides SQLAlchemy engine configuration, session factory,
and the declarative base for ORM models.
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from .config import settings

engine = create_engine(settings.database_url, future=True, echo=False)
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, future=True
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Provide a transactional database session.

    Yields:
        Session: SQLAlchemy database session.

    Note:
        The session is automatically closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
