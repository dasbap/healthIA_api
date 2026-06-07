from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.meal_analysis_repository import MealAnalysisRepository
from app.core.metrics import metrics
from app.recommender.meal_image_analyzer import analyze_meal_image
from app.schemas.meal_analysis_schema import MealAnalysisRequest


class MealAnalysisService:
    def __init__(self) -> None:
        self.repository = MealAnalysisRepository()
        self.logs = AiLogRepository()

    async def analyze(self, payload: MealAnalysisRequest) -> dict:
        analysis = analyze_meal_image(str(payload.imageUrl), payload.notes)
        if analysis.get("fallbackUsed"):
            metrics.ai_fallback_total += 1
        document = {
            "userId": payload.userId,
            "imageUrl": str(payload.imageUrl),
            **analysis,
        }
        stored = await self.repository.create(document)
        await self.logs.create("meal_analysis.created", {"userId": payload.userId})
        return stored
