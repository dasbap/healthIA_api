import pytest

from app.routes.sport_routes import recommend_sport
from app.schemas.sport_schema import SportRecommendationRequest


@pytest.mark.anyio
async def test_sport_recommendation():
    payload = SportRecommendationRequest(
        userId="user_123",
        age=31,
        goal="strength",
        level="beginner",
        sessionsPerWeek=3,
        limitations=[],
    )

    body = await recommend_sport(payload)

    assert body["type"] == "sport"
    assert len(body["weeklyPlan"]) == 3
    assert body["safetyNotes"]
