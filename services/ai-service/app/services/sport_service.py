from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.recommendation_repository import RecommendationRepository
from app.core.metrics import metrics
from app.schemas.sport_schema import SportRecommendationRequest
from app.services.recommendation_mapper import utc_now_iso, build_recommendation_id


class SportService:
    def __init__(self) -> None:
        self.repository = RecommendationRepository()
        self.logs = AiLogRepository()

    async def recommend(self, payload: SportRecommendationRequest) -> dict:
        recommendation_id = build_recommendation_id("sport")
        duration = payload.normalized_duration
        has_limitations = bool(payload.normalized_limitations)
        fatigue = payload.fatigue.lower()
        intensity = "low" if fatigue in {"elevee", "elevée", "high"} or has_limitations else "medium"
        created_at = utc_now_iso()
        warmup = max(5, round(duration * 0.2))
        main_block = max(8, round(duration * 0.55))
        strength = max(5, round(duration * 0.18))
        cooldown = max(2, duration - warmup - main_block - strength)
        score = 0.84 if has_limitations else 0.88

        exercises = [
            {"name": "Echauffement articulaire", "duration": warmup, "intensity": "low", "note": "Mobilite douce et respiration."},
            {"name": "Marche rapide bas impact", "duration": main_block, "intensity": intensity, "note": "Garder une allure confortable."},
            {"name": "Gainage adapte", "duration": strength, "intensity": "medium", "note": "Series courtes, dos neutre."},
            {"name": "Retour au calme", "duration": cooldown, "intensity": "low", "note": "Etirements legers et respiration lente."},
        ]
        warning = (
            "Limitation declaree prise en compte : reduire l'amplitude et arreter en cas de douleur vive."
            if has_limitations
            else None
        )
        recommendation = {
            "recommendationId": recommendation_id,
            "type": "sport",
            "title": "Programme cardio debutant bas impact",
            "score": score,
            "duration": duration,
            "intensity": intensity,
            "exercises": exercises,
            "explanation": (
                "Le programme est construit avec une intensite prudente, compatible avec les preferences "
                "et limitations declarees. Il reste en fallback deterministe pour la demonstration."
            ),
            "warning": warning,
            "model": "healthai-sport-fallback-v1",
            "createdAt": created_at,
            "fallbackUsed": True,
        }
        metrics.ai_recommendation_total += 1
        metrics.ai_fallback_total += 1
        document = {
            "id": recommendation_id,
            "recommendationId": recommendation_id,
            "userId": payload.normalized_user_id,
            "type": "sport",
            "title": recommendation["title"],
            "score": recommendation["score"],
            "status": "reviewed" if has_limitations else "completed",
            "summary": f"{duration} minutes {intensity}, limitations prises en compte.",
            "userInput": (
                f"Objectif {payload.normalized_goal}, niveau {payload.level}, duree {duration} min, "
                f"fatigue {payload.fatigue}."
            ),
            "aiResult": "; ".join(exercise["name"] for exercise in exercises),
            "explanation": recommendation["explanation"],
            "model": recommendation["model"],
            "modelVersion": "1.0.0-fallback",
            "signals": [
                f"Duree: {duration} min",
                f"Intensite: {intensity}",
                f"Limitations: {', '.join(payload.normalized_limitations) if has_limitations else 'aucune'}",
            ],
            **recommendation,
        }
        stored = await self.repository.create(document)
        await self.logs.create("recommendation.sport.created", {"userId": payload.normalized_user_id})
        return {**recommendation, "createdAt": stored["createdAt"]}
