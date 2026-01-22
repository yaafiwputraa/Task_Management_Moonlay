from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db
from ..deps import get_current_user
from ..services.chatbot import ask_deepseek, _detect_intent

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str


def _fetch_tasks_smart(db: Session, question: str) -> List[models.Task]:
    """Fetch tasks dengan smart filtering berdasarkan intent pertanyaan"""
    
    intent = _detect_intent(question)
    query = db.query(models.Task).join(models.User, isouter=True)
    
    # Filter by status jika terdeteksi
    if intent["filter_status"]:
        query = query.filter(models.Task.status == intent["filter_status"])
    
    # Filter by deadline jika terdeteksi
    today = datetime.now().date()
    if intent["filter_deadline"] == "today":
        query = query.filter(
            models.Task.deadline >= datetime.combine(today, datetime.min.time()),
            models.Task.deadline < datetime.combine(today + timedelta(days=1), datetime.min.time())
        )
    elif intent["filter_deadline"] == "tomorrow":
        tomorrow = today + timedelta(days=1)
        query = query.filter(
            models.Task.deadline >= datetime.combine(tomorrow, datetime.min.time()),
            models.Task.deadline < datetime.combine(tomorrow + timedelta(days=1), datetime.min.time())
        )
    elif intent["filter_deadline"] == "overdue":
        query = query.filter(
            models.Task.deadline < datetime.combine(today, datetime.min.time()),
            models.Task.status != models.TaskStatus.done
        )
    elif intent["filter_deadline"] == "this_week":
        week_end = today + timedelta(days=(6 - today.weekday()))
        query = query.filter(
            models.Task.deadline >= datetime.combine(today, datetime.min.time()),
            models.Task.deadline <= datetime.combine(week_end, datetime.max.time())
        )
    
    # Order by deadline (null last), lalu by created_at
    return query.order_by(
        models.Task.deadline.asc().nullslast(),
        models.Task.created_at.desc()
    ).limit(50).all()


@router.post("/query", response_model=ChatResponse)
async def chat_query(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    # Validasi pertanyaan tidak kosong
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong")
    
    # Ambil task dengan smart filtering
    tasks = _fetch_tasks_smart(db, payload.question)
    
    # Jika tidak ada hasil dari filter, ambil semua task untuk context
    if not tasks:
        tasks = db.query(models.Task).join(
            models.User, isouter=True
        ).order_by(
            models.Task.deadline.asc().nullslast()
        ).limit(50).all()
    
    answer = await ask_deepseek(payload.question, tasks)
    return ChatResponse(answer=answer)
