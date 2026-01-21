from sqlalchemy.orm import Session

from . import models
from .core.security import get_password_hash


def seed_users(db: Session):
    demo_users = [
        {"name": "Admin", "email": "admin@example.com", "password": "admin123"},
        {"name": "Budi", "email": "budi@example.com", "password": "password"},
        {"name": "Siti", "email": "siti@example.com", "password": "password"},
    ]
    for user in demo_users:
        exists = (
            db.query(models.User)
            .filter(models.User.email == user["email"])
            .first()
        )
        if exists:
            continue
        new_user = models.User(
            name=user["name"],
            email=user["email"],
            password_hash=get_password_hash(user["password"]),
        )
        db.add(new_user)
    db.commit()
