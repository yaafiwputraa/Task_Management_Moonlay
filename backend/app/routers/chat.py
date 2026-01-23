"""Chat router for AI-powered task assistant.

This module provides the chatbot endpoint that uses DeepSeek AI
to answer questions about tasks with smart filtering.
"""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db
from ..deps import get_current_user
from ..services.chatbot import _detect_intent, ask_deepseek

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    """Request model for chat queries.

    Attributes:
        question: The user's question about tasks.
    """

    question: str


class ChatResponse(BaseModel):
    """Response model for chat answers.

    Attributes:
        answer: The AI-generated response.
    """

    answer: str


def _fetch_tasks_smart(db: Session, question: str) -> List[models.Task]:
    """Fetch tasks with smart filtering based on question intent.

    Args:
        db: Database session.
        question: User's question to analyze for filtering.

    Returns:
        List[models.Task]: Filtered list of tasks (max 50).
    """
    intent = _detect_intent(question)
    query = db.query(models.Task).join(models.User, isouter=True)

    # Filter by status if detected
    if intent["filter_status"]:
        query = query.filter(models.Task.status == intent["filter_status"])

    # Filter by deadline if detected
    today = datetime.now().date()
    if intent["filter_deadline"] == "today":
        query = query.filter(
            models.Task.deadline >= datetime.combine(today, datetime.min.time()),
            models.Task.deadline
            < datetime.combine(today + timedelta(days=1), datetime.min.time()),
        )
    elif intent["filter_deadline"] == "tomorrow":
        tomorrow = today + timedelta(days=1)
        query = query.filter(
            models.Task.deadline >= datetime.combine(tomorrow, datetime.min.time()),
            models.Task.deadline
            < datetime.combine(tomorrow + timedelta(days=1), datetime.min.time()),
        )
    elif intent["filter_deadline"] == "overdue":
        query = query.filter(
            models.Task.deadline < datetime.combine(today, datetime.min.time()),
            models.Task.status != models.TaskStatus.done,
        )
    elif intent["filter_deadline"] == "this_week":
        week_end = today + timedelta(days=(6 - today.weekday()))
        query = query.filter(
            models.Task.deadline >= datetime.combine(today, datetime.min.time()),
            models.Task.deadline <= datetime.combine(week_end, datetime.max.time()),
        )

    # Order by deadline (null last), then by created_at
    return (
        query.order_by(
            models.Task.deadline.asc().nullslast(), models.Task.created_at.desc()
        )
        .limit(50)
        .all()
    )


@router.post("/query", response_model=ChatResponse)
async def chat_query(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> ChatResponse:
    """Process a chat query using DeepSeek AI.

    Args:
        payload: Chat request containing the question.
        db: Database session.
        _: Current authenticated user (unused, for auth only).

    Returns:
        ChatResponse: AI-generated answer about tasks.

    Raises:
        HTTPException: 400 Bad Request if question is empty.
    """
    # Validate question is not empty
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong")

    # Fetch tasks with smart filtering
    tasks = _fetch_tasks_smart(db, payload.question)

    # If no results from filter, get all tasks for context
    if not tasks:
        tasks = (
            db.query(models.Task)
            .join(models.User, isouter=True)
            .order_by(models.Task.deadline.asc().nullslast())
            .limit(50)
            .all()
        )

    answer = await ask_deepseek(payload.question, tasks)
    return ChatResponse(answer=answer)
