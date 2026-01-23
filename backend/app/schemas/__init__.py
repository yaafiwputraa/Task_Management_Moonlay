"""Pydantic schemas for request/response validation.

This module defines all Pydantic models used for API request validation
and response serialization.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from ..models import TaskStatus


class Token(BaseModel):
    """JWT token response schema.

    Attributes:
        access_token: The JWT access token string.
        token_type: Token type, always "bearer".
    """

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded token data schema.

    Attributes:
        user_id: The authenticated user's ID.
        email: The authenticated user's email.
    """

    user_id: int
    email: EmailStr


class UserBase(BaseModel):
    """Base schema for user data.

    Attributes:
        name: User's display name (max 100 chars).
        email: User's email address.
    """

    name: str = Field(..., max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user.

    Attributes:
        password: Plain text password (min 6 chars).
    """

    password: str = Field(..., min_length=6)


class UserRead(UserBase):
    """Schema for reading user data.

    Attributes:
        id: User's unique identifier.
        created_at: Timestamp of user creation.
    """

    id: int
    created_at: datetime

    class Config:
        """Pydantic configuration."""

        from_attributes = True


class TaskBase(BaseModel):
    """Base schema for task data.

    Attributes:
        title: Task title (max 150 chars).
        description: Detailed task description.
        status: Current task status.
        deadline: Optional deadline datetime.
        assignee_id: Optional assigned user ID.
    """

    title: str = Field(..., max_length=150)
    description: str
    status: TaskStatus = TaskStatus.todo
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task."""

    pass


class TaskUpdate(BaseModel):
    """Schema for updating an existing task.

    All fields are optional for partial updates.
    """

    title: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskRead(TaskBase):
    """Schema for reading task data.

    Attributes:
        id: Task's unique identifier.
        created_at: Timestamp of task creation.
        updated_at: Timestamp of last update.
        assignee_name: Name of assigned user (if any).
    """

    id: int
    created_at: datetime
    updated_at: datetime
    assignee_name: Optional[str] = None

    class Config:
        """Pydantic configuration."""

        from_attributes = True