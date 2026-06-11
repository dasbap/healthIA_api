from app.core.metrics import metrics
from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.recommendation_repository import RecommendationRepository
from app.recommender.nutrition_recommender import build_nutrition_fallback, build_nutrition_recommendation
from app.schemas.nutrition_schema import NutritionRecommendationRequest
from app.services.recommendation_mapper import build_recommendation_id, utc_now_iso


class NutritionService:
    def __init__(self) -> None:
        self.repository = RecommendationRepository()
        self.logs = AiLogRepository()

    async def recommend(self, payload: NutritionRecommendationRequest) -> dict:
        recommendation_id = build_recommendation_id("nutrition")
        created_at = utc_now_iso()
        try:
            recommendation = build_nutrition_recommendation(payload, recommendation_id, created_at)
        except Exception as exc:
            recommendation = build_nutrition_fallback(payload, recommendation_id, created_at, str(exc))

        metrics.ai_recommendation_total += 1
        if recommendation["fallbackUsed"]:
            metrics.ai_fallback_total += 1

        document = {
            "id": recommendation_id,
            "recommendationId": recommendation_id,
            "userId": payload.normalized_user_id,
            "type": "nutrition",
            "title": recommendation["title"],
            "score": recommendation["score"],
            "status": "completed",
            "summary": recommendation["summary"],
            "userInput": (
                f"Objectif {payload.normalized_goal}, {recommendation['calories']} kcal, budget "
                f"{payload.normalized_budget} euros, regime {payload.normalized_diet}."
            ),
            "aiResult": "; ".join(recommendation["mealPlan"]),
            "explanation": recommendation["explanation"],
            "model": recommendation["model"],
            "modelVersion": "1.0.0-fallback" if recommendation["fallbackUsed"] else "1.0.0-rules",
            "signals": [
                f"Calories cible: {recommendation['calories']}",
                f"Score: {recommendation['scoreLabel']}",
                f"Allergies filtrees: {', '.join(payload.allergies) if payload.allergies else 'aucune'}",
                f"Moteur: {recommendation['model']}",
            ],
            **recommendation,
        }
        stored = await self.repository.create(document)
        await self.logs.create("recommendation.nutrition.created", {"userId": payload.normalized_user_id})
        return {**recommendation, "createdAt": stored["createdAt"]}
