from fastapi import APIRouter, Query

from app.database.repositories.recommendation_repository import RecommendationRepository
from app.schemas.recommendation_schema import RecommendationHistoryResponse

router = APIRouter(prefix="/ai/recommendations", tags=["recommendations"])


@router.get("/{user_id}", response_model=RecommendationHistoryResponse)
async def get_recommendation_history(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100),
) -> dict:
    items = await RecommendationRepository().list_by_user(user_id, limit)
    return {"userId": user_id, "items": items}
