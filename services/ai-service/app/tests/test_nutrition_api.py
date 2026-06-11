import pytest


@pytest.mark.anyio
async def test_nutrition_recommendation(api_client):
    response = await api_client.post(
        "/ai/nutrition/recommend",
        json={
            "userId": "nutrition_user",
            "goal": "perte de graisse",
            "targetCalories": 560,
            "budget": 65,
            "allergies": "Noisettes",
            "diet": "omnivore",
            "preferences": "repas rapides, legumes verts, poulet",
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["type"] == "nutrition"
    assert body["recommendationId"].startswith("rec_nutrition_")
    assert body["id"] == body["recommendationId"]
    assert body["userId"] == "nutrition_user"
    assert body["macros"]["calories"] == 560
    assert body["calories"] == 560
    assert body["scoreLabel"]
    assert body["summary"]
    assert body["recommendations"]
    assert body["warnings"] is not None
    assert body["constraintsChecked"]["budget"] is True
    assert body["respectedConstraints"]["budget"] is True
    assert body["model"] == "healthai-nutrition-recommender-v1"
    assert body["fallbackUsed"] is False
