import pytest


@pytest.mark.anyio
async def test_sport_recommendation(api_client):
    response = await api_client.post(
        "/ai/sport/recommend",
        json={
            "userId": "sport_user",
            "goal": "perte de graisse",
            "level": "debutant",
            "duration": 30,
            "equipment": "tapis de sol",
            "limitations": "genou droit sensible",
            "preferences": "bas impact, marche rapide",
            "fatigue": "moderee",
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["type"] == "sport"
    assert body["recommendationId"].startswith("rec_sport_")
    assert body["duration"] == 30
    assert body["exercises"]
    assert body["warning"]
