from app.core.metrics import metrics
from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.recommendation_repository import RecommendationRepository
from app.recommender.sport_recommender import build_sport_fallback, build_sport_recommendation
from app.schemas.sport_schema import SportRecommendationRequest
from app.services.recommendation_mapper import build_recommendation_id, utc_now_iso


class SportService:
    def __init__(self) -> None:
        self.repository = RecommendationRepository()
        self.logs = AiLogRepository()

    async def recommend(self, payload: SportRecommendationRequest) -> dict:
        recommendation_id = build_recommendation_id("sport")
        created_at = utc_now_iso()
        try:
            recommendation = build_sport_recommendation(payload, recommendation_id, created_at)
        except Exception as exc:
            recommendation = build_sport_fallback(payload, recommendation_id, created_at, str(exc))

        metrics.ai_recommendation_total += 1
        if recommendation["fallbackUsed"]:
            metrics.ai_fallback_total += 1

        has_limitations = bool(payload.normalized_limitations)
        document = {
            "id": recommendation_id,
            "recommendationId": recommendation_id,
            "userId": payload.normalized_user_id,
            "type": "sport",
            "title": recommendation["title"],
            "score": recommendation["score"],
            "status": "reviewed" if has_limitations else "completed",
            "summary": recommendation["summary"],
            "userInput": (
                f"Objectif {payload.normalized_goal}, niveau {payload.level}, duree {recommendation['duration']} min, "
                f"fatigue {payload.fatigue}."
            ),
            "aiResult": "; ".join(exercise["name"] for exercise in recommendation["exercises"]),
            "explanation": recommendation["explanation"],
            "model": recommendation["model"],
            "modelVersion": "1.0.0-fallback" if recommendation["fallbackUsed"] else "1.0.0-rules",
            "signals": [
                f"Duree: {recommendation['duration']} min",
                f"Intensite: {recommendation['intensity']}",
                f"Limitations: {', '.join(payload.normalized_limitations) if has_limitations else 'aucune'}",
                f"Moteur: {recommendation['model']}",
            ],
            **recommendation,
        }
        stored = await self.repository.create(document)
        await self.logs.create("recommendation.sport.created", {"userId": payload.normalized_user_id})
        return {**recommendation, "createdAt": stored["createdAt"]}
