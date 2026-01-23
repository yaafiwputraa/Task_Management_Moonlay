"""SQLAlchemy ORM models for the Task Management application.

This module defines the database models for Users and Tasks,
including their relationships and status enumerations.
"""

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
    """Enumeration of possible task statuses.

    Attributes:
        todo: Task is pending and not started.
        in_progress: Task is currently being worked on.
        done: Task has been completed.
    """

    todo = "Todo"
    in_progress = "In Progress"
    done = "Done"


class User(Base):
    """User model representing application users.

    Attributes:
        id: Primary key identifier.
        name: User's display name (unique).
        email: User's email address (unique).
        password_hash: Bcrypt hashed password.
        created_at: Timestamp of user creation.
        tasks: Relationship to tasks assigned to this user.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="assignee_rel")


class Task(Base):
    """Task model representing work items.

    Attributes:
        id: Primary key identifier.
        title: Task title (max 150 characters).
        description: Detailed task description.
        status: Current task status (Todo, In Progress, Done).
        deadline: Optional deadline datetime.
        assignee_id: Foreign key to assigned user.
        created_at: Timestamp of task creation.
        updated_at: Timestamp of last update.
        assignee_rel: Relationship to the assigned User.
    """

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
        """Get the name of the assigned user.

        Returns:
            Optional[str]: Assignee's name or None if unassigned.
        """
        return self.assignee_rel.name if self.assignee_rel else None
