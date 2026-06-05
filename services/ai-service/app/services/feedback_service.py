from app.database.repositories.feedback_repository import FeedbackRepository
from app.schemas.feedback_schema import FeedbackRequest


class FeedbackService:
    def __init__(self) -> None:
        self.repository = FeedbackRepository()

    async def create(self, payload: FeedbackRequest) -> dict:
        return await self.repository.create(payload.model_dump())
