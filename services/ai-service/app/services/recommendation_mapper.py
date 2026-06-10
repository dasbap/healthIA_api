from datetime import UTC, datetime
from uuid import uuid4


def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()


def build_recommendation_id(kind: str) -> str:
    return f"rec_{kind}_{uuid4().hex[:10]}"


def to_history_item(document: dict) -> dict:
    return {
        "id": document["id"],
        "type": document["type"],
        "title": document["title"],
        "score": document["score"],
        "status": document.get("status", "completed"),
        "createdAt": document["createdAt"],
        "summary": document.get("summary", ""),
    }


def to_detail(document: dict) -> dict:
    return {
        **to_history_item(document),
        "userInput": document.get("userInput", ""),
        "aiResult": document.get("aiResult", ""),
        "explanation": document.get("explanation", ""),
        "model": document.get("model", "healthai-fallback"),
        "modelVersion": document.get("modelVersion", "1.0.0-fallback"),
        "signals": document.get("signals", []),
    }
