import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .db import Base


class TaskStatus(str, enum.Enum):
    todo = "Todo"
    in_progress = "In Progress"
    done = "Done"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="assignee_rel")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.todo, nullable=False)
    deadline = Column(DateTime, nullable=True)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assignee_rel = relationship("User", back_populates="tasks")

    @property
    def assignee_name(self) -> Optional[str]:
        return self.assignee_rel.name if self.assignee_rel else None
