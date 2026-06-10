from fastapi import APIRouter

from app.schemas.nutrition_schema import (
    NutritionRecommendationRequest,
    NutritionRecommendationResponse,
)
from app.services.nutrition_service import NutritionService

router = APIRouter(prefix="/ai/nutrition", tags=["Nutrition IA"])


@router.post("/recommend", response_model=NutritionRecommendationResponse)
async def recommend_nutrition(payload: NutritionRecommendationRequest) -> dict:
    return await NutritionService().recommend(payload)
