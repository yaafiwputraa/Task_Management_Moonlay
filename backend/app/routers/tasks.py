"""Tasks router for task management CRUD operations.

This module provides endpoints for creating, reading, updating,
and deleting tasks.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=List[schemas.TaskRead])
def list_tasks(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> List[models.Task]:
    """Retrieve all tasks ordered by creation date (newest first).

    Args:
        db: Database session.
        _: Current authenticated user (unused, for auth only).

    Returns:
        List[models.Task]: List of all tasks.
    """
    return db.query(models.Task).order_by(models.Task.created_at.desc()).all()


@router.post("/", response_model=schemas.TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> models.Task:
    """Create a new task.

    Args:
        payload: Task creation data.
        db: Database session.
        _: Current authenticated user (unused, for auth only).

    Returns:
        models.Task: The newly created task.

    Raises:
        HTTPException: 404 Not Found if assignee_id doesn't exist.
    """
    if payload.assignee_id:
        assignee = (
            db.query(models.User)
            .filter(models.User.id == payload.assignee_id)
            .first()
        )
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")

    task = models.Task(**payload.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=schemas.TaskRead)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> models.Task:
    """Retrieve a single task by ID.

    Args:
        task_id: The task's unique identifier.
        db: Database session.
        _: Current authenticated user (unused, for auth only).

    Returns:
        models.Task: The requested task.

    Raises:
        HTTPException: 404 Not Found if task doesn't exist.
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=schemas.TaskRead)
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> models.Task:
    """Update an existing task.

    Args:
        task_id: The task's unique identifier.
        payload: Fields to update (partial update supported).
        db: Database session.
        _: Current authenticated user (unused, for auth only).

    Returns:
        models.Task: The updated task.

    Raises:
        HTTPException: 404 Not Found if task or assignee doesn't exist.
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.dict(exclude_unset=True)
    if "assignee_id" in data and data["assignee_id"]:
        assignee = (
            db.query(models.User)
            .filter(models.User.id == data["assignee_id"])
            .first()
        )
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")

    for field, value in data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> None:
    """Delete a task by ID.

    Args:
        task_id: The task's unique identifier.
        db: Database session.
        _: Current authenticated user (unused, for auth only).

    Raises:
        HTTPException: 404 Not Found if task doesn't exist.
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None
