from typing import List

import httpx
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Task


def _summarize_tasks(tasks: List[Task]) -> str:
    if not tasks:
        return "Tidak ada task yang cocok."
    lines = []
    for t in tasks:
        lines.append(
            f"- {t.title} | status={t.status.value} | deadline={t.deadline} | assignee={t.assignee_rel.name if t.assignee_rel else 'Unassigned'}"
        )
    return "\n".join(lines)


def build_prompt(user_question: str, tasks: List[Task]) -> str:
    summary = _summarize_tasks(tasks)
    return (
        "Kamu adalah asisten untuk aplikasi manajemen task. Jawab ringkas dalam bahasa Indonesia.\n\n"
        f"Pertanyaan user: {user_question}\n\n"
        f"Data task:\n{summary}\n\n"
        "Jika data tidak cukup, katakan tidak ada data."
    )


async def ask_deepseek(question: str, tasks: List[Task]) -> str:
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "Kamu adalah asisten task."},
            {"role": "user", "content": build_prompt(question, tasks)},
        ],
        "temperature": 0.2,
    }
    headers = {"Authorization": f"Bearer {settings.deepseek_api_key}"}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(settings.deepseek_api_url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
