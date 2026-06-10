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
    assert body["macros"]["calories"] == 560
    assert body["constraintsChecked"]["budget"] is True
    assert body["fallbackUsed"] is True
