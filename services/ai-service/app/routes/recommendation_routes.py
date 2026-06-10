from fastapi import APIRouter, HTTPException, Query, status

from app.database.repositories.recommendation_repository import RecommendationRepository
from app.schemas.recommendation_schema import RecommendationDetail, RecommendationHistoryItem
from app.services.recommendation_mapper import to_detail, to_history_item

router = APIRouter(prefix="/ai/recommendations", tags=["Recommandations"])


@router.get("/detail/{recommendation_id}", response_model=RecommendationDetail)
async def get_recommendation_detail(recommendation_id: str) -> dict:
    item = await RecommendationRepository().get_by_id(recommendation_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommandation introuvable.",
        )
    return to_detail(item)


@router.get("/{user_id}", response_model=list[RecommendationHistoryItem])
async def get_recommendation_history(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100),
) -> list[dict]:
    items = await RecommendationRepository().list_by_user(user_id, limit)
    return [to_history_item(item) for item in items]
