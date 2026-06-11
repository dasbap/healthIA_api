from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.meal_analysis_repository import MealAnalysisRepository
from app.database.repositories.recommendation_repository import RecommendationRepository
from app.core.metrics import metrics
from app.recommender.meal_image_analyzer import analyze_meal_image, analyze_meal_image_bytes
from app.schemas.meal_analysis_schema import MealAnalysisRequest
from app.services.recommendation_mapper import build_recommendation_id


class MealAnalysisService:
    def __init__(self) -> None:
        self.repository = MealAnalysisRepository()
        self.recommendations = RecommendationRepository()
        self.logs = AiLogRepository()

    async def analyze(self, payload: MealAnalysisRequest) -> dict:
        source = str(payload.normalized_image_url) if payload.normalized_image_url else payload.normalized_file_name or "image_locale"
        notes = payload.notes or payload.normalized_file_name
        raw_analysis = analyze_meal_image(source, notes)
        return await self._store_analysis(
            user_id=payload.normalized_user_id,
            source=source,
            raw_analysis=raw_analysis,
            source_kind="url",
        )

    async def analyze_upload(self, user_id: str, file_name: str, image_bytes: bytes, notes: str | None = None) -> dict:
        raw_analysis = analyze_meal_image_bytes(image_bytes, file_name, notes)
        return await self._store_analysis(
            user_id=user_id,
            source=file_name,
            raw_analysis=raw_analysis,
            source_kind="upload",
        )

    async def _store_analysis(self, user_id: str, source: str, raw_analysis: dict, source_kind: str) -> dict:
        fallback_used = bool(raw_analysis.get("fallbackUsed"))
        if fallback_used:
            metrics.ai_fallback_total += 1
        foods = raw_analysis.get("detectedFoods", [])
        calories = int(sum(food.get("calories", 0) for food in foods)) or int(raw_analysis.get("totalCalories", 0))
        protein = round(sum(float(food.get("proteins", 0)) for food in foods))
        carbs = round(sum(float(food.get("carbs", 0)) for food in foods))
        fat = round(sum(float(food.get("fats", 0)) for food in foods))
        average_confidence = round(sum(float(food.get("confidence", 0)) for food in foods) / len(foods), 2) if foods else 0.0
        imbalances = list(raw_analysis.get("warnings", []))
        if carbs > protein * 1.5:
            imbalances.append("Glucides eleves")
        if protein < 20:
            imbalances.append("Proteines a renforcer")
        imbalances = list(dict.fromkeys(imbalances))
        if not imbalances:
            imbalances.append("Repas globalement equilibre")

        suggestions = [
            "Verifier les portions si l'estimation semble trop haute.",
            "Ajouter des legumes pour augmenter les fibres.",
        ]
        if fallback_used:
            suggestions.append("Resultat issu du fallback : a confirmer avec le modele vision local en demo avancee.")

        analysis_id = build_recommendation_id("meal")
        title = "Analyse repas par image"
        model_name = raw_analysis.get("model") or ("healthai-vision-fallback-v1" if fallback_used else "healthai-vision-local-v1")
        document = {
            "id": analysis_id,
            "analysisId": analysis_id,
            "userId": user_id,
            "source": source,
            "sourceKind": source_kind,
            "type": "meal-analysis",
            "title": title,
            "score": average_confidence,
            "detectedFoods": [
                {"label": food.get("name", "aliment detecte"), "confidence": food.get("confidence", 0)}
                for food in foods
            ],
            "nutrition": {
                "calories": calories,
                "protein": protein,
                "carbs": carbs,
                "fat": fat,
            },
            "estimatedCalories": calories,
            "macros": {
                "proteins": protein,
                "carbs": carbs,
                "fats": fat,
            },
            "warnings": imbalances,
            "imbalances": imbalances,
            "suggestions": suggestions,
            "explanation": raw_analysis.get("summary", "Analyse repas estimee."),
            "model": model_name,
            "fallbackUsed": fallback_used,
        }
        stored = await self.repository.create(document)
        history_document = {
            **document,
            "id": analysis_id,
            "status": "flagged" if fallback_used or len(imbalances) > 1 else "completed",
            "summary": f"{calories} kcal estimees, confiance moyenne {round(average_confidence * 100)}%.",
            "userInput": f"Source image: {source}",
            "aiResult": ", ".join(food["label"] for food in document["detectedFoods"]),
            "modelVersion": "1.0.0-fallback" if fallback_used else "1.0.0-local",
            "signals": [*imbalances, f"Modele: {model_name}"],
            "createdAt": stored["createdAt"],
        }
        await self.recommendations.create(history_document)
        await self.logs.create("meal_analysis.created", {"userId": user_id, "sourceKind": source_kind})
        return {**document, "createdAt": stored["createdAt"]}
