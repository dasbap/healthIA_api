from fastapi import APIRouter

from app.database.mongo import get_database
from app.services.fallback_service import fallback_status

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "mongo": "connected" if get_database() is not None else "unavailable",
        "fallback": fallback_status(),
    }
