from fastapi import APIRouter

from app.database.mongo import get_database
from app.recommender.nutrition_sport_model_status import nutrition_model_status, sport_model_status
from app.recommender.vision_model_analyzer import vision_model_status
from app.services.fallback_service import fallback_status

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "healthai-ai-service",
        "mongo": "connected" if get_database() is not None else "unavailable",
        "fallback": fallback_status(),
        "vision": vision_model_status(),
        "nutritionModel": nutrition_model_status(),
        "sportModel": sport_model_status(),
    }
