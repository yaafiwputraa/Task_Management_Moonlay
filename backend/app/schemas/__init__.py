from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from ..models import TaskStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int
    email: EmailStr


class UserBase(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str = Field(..., max_length=150)
    description: str
    status: TaskStatus = TaskStatus.todo
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskRead(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assignee_name: Optional[str] = None

    class Config:
        from_attributes = True