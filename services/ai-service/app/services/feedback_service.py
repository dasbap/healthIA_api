from app.database.repositories.ai_log_repository import AiLogRepository
from app.database.repositories.feedback_repository import FeedbackRepository
from app.schemas.feedback_schema import FeedbackRequest


class FeedbackService:
    def __init__(self) -> None:
        self.repository = FeedbackRepository()
        self.logs = AiLogRepository()

    async def create(self, recommendation_id: str, payload: FeedbackRequest) -> dict:
        stored = await self.repository.create(
            {
                "userId": payload.normalized_user_id,
                "recommendationId": recommendation_id,
                "rating": payload.rating,
                "comment": payload.comment,
            }
        )
        await self.logs.create("feedback.created", {"userId": payload.normalized_user_id, "rating": payload.rating})
        return {
            "message": "Feedback enregistre",
            "recommendationId": stored["recommendationId"],
            "status": "received",
            "ok": True,
        }
