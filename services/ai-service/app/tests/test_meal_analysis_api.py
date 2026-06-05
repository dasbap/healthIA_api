import pytest
from pydantic import ValidationError

from app.routes.meal_routes import analyze_meal
from app.schemas.meal_analysis_schema import MealAnalysisRequest


@pytest.mark.anyio
async def test_meal_analysis_with_image_url():
    payload = MealAnalysisRequest(
        userId="user_123",
        imageUrl="https://example.com/salad.jpg",
        notes="salad and chicken",
    )

    body = await analyze_meal(payload)

    assert body["userId"] == "user_123"
    assert body["totalCalories"] > 0
    assert body["detectedFoods"]


def test_meal_analysis_rejects_invalid_url():
    with pytest.raises(ValidationError):
        MealAnalysisRequest(userId="user_123", imageUrl="not-a-url")
