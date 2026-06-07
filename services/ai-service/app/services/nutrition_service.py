from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.recommendation_repository import RecommendationRepository
from app.core.metrics import metrics
from app.recommender.nutrition_recommender import recommend_nutrition
from app.schemas.nutrition_schema import NutritionRecommendationRequest


class NutritionService:
    def __init__(self) -> None:
        self.repository = RecommendationRepository()
        self.logs = AiLogRepository()

    async def recommend(self, payload: NutritionRecommendationRequest) -> dict:
        recommendation = recommend_nutrition(payload)
        metrics.ai_recommendation_total += 1
        if recommendation.get("fallbackUsed"):
            metrics.ai_fallback_total += 1
        document = {
            "userId": payload.userId,
            "type": "nutrition",
            "payload": recommendation,
            **recommendation,
        }
        stored = await self.repository.create(document)
        await self.logs.create("recommendation.nutrition.created", {"userId": payload.userId})
        return stored
