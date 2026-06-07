from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.recommendation_repository import RecommendationRepository
from app.core.metrics import metrics
from app.recommender.sport_recommender import recommend_sport
from app.schemas.sport_schema import SportRecommendationRequest


class SportService:
    def __init__(self) -> None:
        self.repository = RecommendationRepository()
        self.logs = AiLogRepository()

    async def recommend(self, payload: SportRecommendationRequest) -> dict:
        recommendation = recommend_sport(payload)
        metrics.ai_recommendation_total += 1
        if recommendation.get("fallbackUsed"):
            metrics.ai_fallback_total += 1
        document = {
            "userId": payload.userId,
            "type": "sport",
            "payload": recommendation,
            **recommendation,
        }
        stored = await self.repository.create(document)
        await self.logs.create("recommendation.sport.created", {"userId": payload.userId})
        return stored
