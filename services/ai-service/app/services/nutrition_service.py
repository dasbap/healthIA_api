from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.recommendation_repository import RecommendationRepository
from app.core.metrics import metrics
from app.recommender.imbalance_detector import detect_nutrition_imbalances
from app.recommender.meal_plan_generator import generate_meal_plan
from app.schemas.nutrition_schema import NutritionRecommendationRequest
from app.services.recommendation_mapper import utc_now_iso, build_recommendation_id


class NutritionService:
    def __init__(self) -> None:
        self.repository = RecommendationRepository()
        self.logs = AiLogRepository()

    async def recommend(self, payload: NutritionRecommendationRequest) -> dict:
        recommendation_id = build_recommendation_id("nutrition")
        calories = payload.normalized_calories
        restrictions = [payload.normalized_diet, *payload.allergies]
        meal_plan = generate_meal_plan(calories, restrictions)
        imbalances = detect_nutrition_imbalances(restrictions, payload.normalized_goal)
        protein = round(calories * 0.30 / 4)
        carbs = round(calories * 0.42 / 4)
        fat = round(calories * 0.25 / 9)
        budget_ok = payload.normalized_budget >= 35
        score = 0.87 if budget_ok else 0.73
        created_at = utc_now_iso()

        recommendation = {
            "recommendationId": recommendation_id,
            "type": "nutrition",
            "title": "Repas equilibre pour objectif personnalise",
            "score": score,
            "mealPlan": meal_plan,
            "macros": {
                "calories": calories,
                "protein": protein,
                "carbs": carbs,
                "fat": fat,
            },
            "constraintsChecked": {
                "allergies": True,
                "diet": True,
                "budget": budget_ok,
            },
            "explanation": (
                "La recommandation utilise les contraintes saisies, ajuste les macros et reste en mode "
                "fallback deterministe tant qu'aucun modele nutrition entraine n'est branche."
            ),
            "advice": [
                "Preparer les bases proteinees en avance pour stabiliser les portions.",
                "Ajouter des legumes verts si la faim persiste.",
                "Verifier les etiquettes en cas d'allergie declaree.",
                *imbalances,
            ],
            "model": "healthai-nutrition-fallback-v1",
            "createdAt": created_at,
            "fallbackUsed": True,
        }
        metrics.ai_recommendation_total += 1
        metrics.ai_fallback_total += 1
        document = {
            "id": recommendation_id,
            "recommendationId": recommendation_id,
            "userId": payload.normalized_user_id,
            "type": "nutrition",
            "title": recommendation["title"],
            "score": recommendation["score"],
            "status": "completed",
            "summary": "Plan riche en proteines, budget et preferences pris en compte.",
            "userInput": (
                f"Objectif {payload.normalized_goal}, {calories} kcal, budget "
                f"{payload.normalized_budget} euros, regime {payload.normalized_diet}."
            ),
            "aiResult": "; ".join(meal_plan),
            "explanation": recommendation["explanation"],
            "model": recommendation["model"],
            "modelVersion": "1.0.0-fallback",
            "signals": [
                f"Calories cible: {calories}",
                f"Budget {'compatible' if budget_ok else 'a surveiller'}",
                f"Allergies filtrees: {', '.join(payload.allergies) if payload.allergies else 'aucune'}",
            ],
            **recommendation,
        }
        stored = await self.repository.create(document)
        await self.logs.create("recommendation.nutrition.created", {"userId": payload.normalized_user_id})
        return {**recommendation, "createdAt": stored["createdAt"]}
