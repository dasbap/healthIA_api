import pytest

from app.routes.feedback_routes import create_feedback
from app.routes.recommendation_routes import get_recommendation_history
from app.schemas.feedback_schema import FeedbackRequest


@pytest.mark.anyio
async def test_recommendation_history_returns_list():
    response = await get_recommendation_history("user_123")

    assert response == {"userId": "user_123", "items": []}


@pytest.mark.anyio
async def test_feedback_is_validated_and_returned():
    payload = FeedbackRequest(
        userId="user_123",
        recommendationId="rec_123",
        rating=5,
        comment="Useful plan",
    )

    body = await create_feedback(payload)

    assert body["rating"] == 5
    assert body["userId"] == "user_123"
