from fastapi import APIRouter

from app.schemas.feedback_schema import FeedbackRequest, FeedbackResponse
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/ai/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackResponse, status_code=201)
async def create_feedback(payload: FeedbackRequest) -> dict:
    return await FeedbackService().create(payload)
