import pytest


@pytest.mark.anyio
async def test_recommendation_history_returns_list(api_client):
    await api_client.post(
        "/ai/nutrition/recommend",
        json={"userId": "history_user", "goal": "maintien", "targetCalories": 650, "budget": 50, "diet": "omnivore"},
    )
    response = await api_client.get("/ai/recommendations/history_user")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["type"] == "nutrition"


@pytest.mark.anyio
async def test_recommendation_detail_returns_404_for_unknown_id(api_client):
    response = await api_client.get("/ai/recommendations/detail/unknown")

    assert response.status_code == 404
    assert response.json()["detail"] == "Recommandation introuvable."


@pytest.mark.anyio
async def test_recommendation_detail_and_feedback(api_client):
    created = await api_client.post(
        "/ai/sport/recommend",
        json={"userId": "feedback_user", "goal": "endurance", "level": "debutant", "duration": 25, "fatigue": "faible"},
    )
    recommendation_id = created.json()["recommendationId"]

    detail = await api_client.get(f"/ai/recommendations/detail/{recommendation_id}")
    feedback = await api_client.post(
        f"/ai/recommendations/{recommendation_id}/feedback",
        json={"rating": 4, "comment": "Recommandation utile"},
    )

    assert detail.status_code == 200
    assert detail.json()["id"] == recommendation_id
    assert feedback.status_code == 201
    assert feedback.json()["status"] == "received"
    assert feedback.json()["ok"] is True


@pytest.mark.anyio
async def test_feedback_rejects_incomplete_payload(api_client):
    response = await api_client.post("/ai/recommendations/rec_test/feedback", json={"comment": "incomplet"})

    assert response.status_code == 422
