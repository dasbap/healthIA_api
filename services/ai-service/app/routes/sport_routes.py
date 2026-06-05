from fastapi import APIRouter

from app.schemas.sport_schema import SportRecommendationRequest, SportRecommendationResponse
from app.services.sport_service import SportService

router = APIRouter(prefix="/ai/sport", tags=["sport"])


@router.post("/recommend", response_model=SportRecommendationResponse)
async def recommend_sport(payload: SportRecommendationRequest) -> dict:
    return await SportService().recommend(payload)
