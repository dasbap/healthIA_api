from fastapi import APIRouter

from app.schemas.feedback_schema import FeedbackRequest, FeedbackResponse
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/ai/recommendations", tags=["Feedback"])


@router.post("/{recommendation_id}/feedback", response_model=FeedbackResponse, status_code=201)
async def create_feedback(recommendation_id: str, payload: FeedbackRequest) -> dict:
    return await FeedbackService().create(recommendation_id, payload)
