from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db
from ..deps import get_current_user
from ..services.chatbot import ask_deepseek

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    question: str
    status: Optional[models.TaskStatus] = None


class ChatResponse(BaseModel):
    answer: str


def _fetch_related_tasks(
    db: Session, status: Optional[models.TaskStatus]
) -> List[models.Task]:
    query = db.query(models.Task).join(models.User, isouter=True)
    if status:
        query = query.filter(models.Task.status == status)
    return query.order_by(models.Task.deadline.asc()).limit(20).all()


@router.post("/query", response_model=ChatResponse)
async def chat_query(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    tasks = _fetch_related_tasks(db, payload.status)
    answer = await ask_deepseek(payload.question, tasks)
    return ChatResponse(answer=answer)
