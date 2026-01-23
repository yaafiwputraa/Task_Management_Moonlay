"""AI Chatbot service using DeepSeek API.

This module provides the chatbot functionality for answering
task-related questions using DeepSeek's language model.
"""

from datetime import datetime, timedelta
from typing import List

import httpx
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Task, TaskStatus


SYSTEM_PROMPT = """Kamu adalah asisten AI untuk aplikasi Task Management. 

ATURAN PENTING:
1. HANYA jawab pertanyaan yang berkaitan dengan data task yang diberikan.
2. Jika pertanyaan TIDAK berkaitan dengan task/tugas/pekerjaan, jawab dengan sopan: "Maaf, saya hanya bisa membantu menjawab pertanyaan seputar task management seperti status task, deadline, assignee, dan informasi task lainnya."
3. Jawab dalam Bahasa Indonesia yang ringkas dan jelas.
4. Jika data tidak tersedia untuk menjawab, katakan dengan jujur.
5. Gunakan format yang mudah dibaca (bullet points, numbering jika perlu).
6. Untuk pertanyaan tentang jumlah/statistik, berikan angka yang tepat dari data.

KEMAMPUAN:
- Menampilkan daftar task berdasarkan status (Todo, In Progress, Done)
- Menghitung jumlah task
- Mencari task berdasarkan deadline (hari ini, besok, minggu ini, terlambat)
- Memberitahu assignee dari task tertentu
- Memberikan ringkasan/summary task
- Mencari task berdasarkan judul atau deskripsi
"""


def _format_deadline(deadline) -> str:
    """Format deadline dengan informasi relatif (hari ini, besok, terlambat, dll)"""
    if not deadline:
        return "Tidak ada deadline"
    
    today = datetime.now().date()
    deadline_date = deadline.date() if isinstance(deadline, datetime) else deadline
    
    diff = (deadline_date - today).days
    
    if diff < 0:
        return f"{deadline.strftime('%Y-%m-%d')} (⚠️ TERLAMBAT {abs(diff)} hari)"
    elif diff == 0:
        return f"{deadline.strftime('%Y-%m-%d')} (📌 HARI INI)"
    elif diff == 1:
        return f"{deadline.strftime('%Y-%m-%d')} (⏰ BESOK)"
    elif diff <= 7:
        return f"{deadline.strftime('%Y-%m-%d')} ({diff} hari lagi)"
    else:
        return deadline.strftime('%Y-%m-%d')


def _get_task_statistics(tasks: List[Task]) -> str:
    """Generate statistik dari daftar task"""
    if not tasks:
        return "Tidak ada task."
    
    total = len(tasks)
    todo = sum(1 for t in tasks if t.status == TaskStatus.todo)
    in_progress = sum(1 for t in tasks if t.status == TaskStatus.in_progress)
    done = sum(1 for t in tasks if t.status == TaskStatus.done)
    
    today = datetime.now().date()
    overdue = sum(1 for t in tasks if t.deadline and t.deadline.date() < today and t.status != TaskStatus.done)
    due_today = sum(1 for t in tasks if t.deadline and t.deadline.date() == today)
    
    unassigned = sum(1 for t in tasks if not t.assignee_rel)
    
    return f"""📊 STATISTIK TASK:
- Total: {total} task
- Todo: {todo} | In Progress: {in_progress} | Done: {done}
- Deadline hari ini: {due_today}
- Terlambat (overdue): {overdue}
- Belum ada assignee: {unassigned}"""


def _summarize_tasks(tasks: List[Task]) -> str:
    """Format daftar task dengan informasi lengkap"""
    if not tasks:
        return "Tidak ada task yang ditemukan."
    
    lines = []
    for i, t in enumerate(tasks, 1):
        assignee = t.assignee_rel.name if t.assignee_rel else "Belum ditugaskan"
        deadline_str = _format_deadline(t.deadline)
        status_emoji = {"Todo": "⬜", "In Progress": "🔄", "Done": "✅"}.get(t.status.value, "")
        
        lines.append(
            f"{i}. {t.title}\n"
            f"   Status: {status_emoji} {t.status.value}\n"
            f"   Deadline: {deadline_str}\n"
            f"   Assignee: {assignee}"
        )
    
    return "\n\n".join(lines)


def build_prompt(user_question: str, tasks: List[Task]) -> str:
    """Build a complete prompt with task context for the AI.

    Args:
        user_question: The user's question about tasks.
        tasks: List of Task objects to include as context.

    Returns:
        str: Formatted prompt with statistics and task list.
    """
    statistics = _get_task_statistics(tasks)
    task_list = _summarize_tasks(tasks)

    return f"""Pertanyaan user: {user_question}

{statistics}

📋 DAFTAR TASK:
{task_list}

Berikan jawaban yang relevan berdasarkan data di atas."""


def _detect_intent(question: str) -> dict:
    """Detect user intent from question for query optimization.

    Args:
        question: The user's question text.

    Returns:
        dict: Intent dictionary with filter_status, filter_deadline, search_keyword.
    """
    question_lower = question.lower()
    
    intent = {
        "filter_status": None,
        "filter_deadline": None,
        "search_keyword": None
    }
    
    # Deteksi filter status
    if any(word in question_lower for word in ["belum selesai", "belum dikerjakan", "todo", "to do", "pending"]):
        intent["filter_status"] = TaskStatus.todo
    elif any(word in question_lower for word in ["sedang dikerjakan", "in progress", "ongoing", "proses"]):
        intent["filter_status"] = TaskStatus.in_progress
    elif any(word in question_lower for word in ["selesai", "done", "completed", "sudah"]):
        intent["filter_status"] = TaskStatus.done
    
    # Deteksi filter deadline
    if any(word in question_lower for word in ["hari ini", "today"]):
        intent["filter_deadline"] = "today"
    elif any(word in question_lower for word in ["besok", "tomorrow"]):
        intent["filter_deadline"] = "tomorrow"
    elif any(word in question_lower for word in ["terlambat", "overdue", "lewat"]):
        intent["filter_deadline"] = "overdue"
    elif any(word in question_lower for word in ["minggu ini", "this week"]):
        intent["filter_deadline"] = "this_week"
    
    return intent


async def ask_deepseek(question: str, tasks: List[Task]) -> str:
    """Send a question to DeepSeek API with task context.

    Args:
        question: The user's question.
        tasks: List of tasks to provide as context.

    Returns:
        str: AI-generated response or error message.
    """
    # If no tasks exist at all
    if not tasks:
        return (
            "Saat ini tidak ada task yang tersedia di sistem. "
            "Silakan tambahkan task terlebih dahulu."
        )
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(question, tasks)},
        ],
        "temperature": 0.3,
        "max_tokens": 1000,
    }
    
    headers = {"Authorization": f"Bearer {settings.deepseek_api_key}"}
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(settings.deepseek_api_url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except httpx.TimeoutException:
        return "Maaf, server sedang sibuk. Silakan coba lagi dalam beberapa saat."
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            return "Maaf, terlalu banyak permintaan. Silakan tunggu sebentar dan coba lagi."
        return "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi."
    except Exception:
        return "Maaf, terjadi kesalahan. Silakan coba lagi."
