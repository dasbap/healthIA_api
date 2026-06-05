import pytest

from app.routes.nutrition_routes import recommend_nutrition
from app.schemas.nutrition_schema import NutritionRecommendationRequest


@pytest.mark.anyio
async def test_nutrition_recommendation():
    payload = NutritionRecommendationRequest(
        userId="user_123",
        age=29,
        sex="female",
        heightCm=168,
        weightKg=64,
        goal="maintain",
        activityLevel="moderate",
        dietaryRestrictions=["vegetarian"],
    )

    body = await recommend_nutrition(payload)

    assert body["type"] == "nutrition"
    assert body["dailyCalories"] >= 1200
    assert body["recommendations"]
