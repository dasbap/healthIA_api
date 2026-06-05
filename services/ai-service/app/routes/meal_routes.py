from fastapi import APIRouter

from app.schemas.meal_analysis_schema import MealAnalysisRequest, MealAnalysisResponse
from app.services.meal_analysis_service import MealAnalysisService

router = APIRouter(prefix="/ai/meal", tags=["meal analysis"])


@router.post("/analyze", response_model=MealAnalysisResponse)
async def analyze_meal(payload: MealAnalysisRequest) -> dict:
    return await MealAnalysisService().analyze(payload)
