import pytest


@pytest.mark.anyio
async def test_ai_model_status_is_explicit(api_client):
    response = await api_client.get("/health")
    body = response.json()

    assert response.status_code == 200
    assert body["nutritionModel"]["engineAvailable"] is True
    assert body["nutritionModel"]["engineType"] == "rules-scoring"
    assert body["nutritionModel"]["trainedModelAvailable"] is False
    assert body["nutritionModel"]["fallbackUsedByDefault"] is False
    assert body["sportModel"]["engineAvailable"] is True
    assert body["sportModel"]["engineType"] == "rules-scoring"
    assert body["sportModel"]["trainedModelAvailable"] is False
    assert body["sportModel"]["fallbackUsedByDefault"] is False


@pytest.mark.anyio
async def test_nutrition_quality_gate_respects_weight_loss_allergy_and_baseline_score(api_client):
    response = await api_client.post(
        "/ai/nutrition/recommend",
        json={
            "userId": "quality_nutrition_weight_loss",
            "goal": "perte de graisse",
            "targetCalories": 1400,
            "budget": 65,
            "allergies": "noisettes",
            "diet": "omnivore",
            "preferences": "rapide",
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["model"] == "healthai-nutrition-recommender-v1"
    assert body["fallbackUsed"] is False
    assert body["score"] >= 0.87
    assert body["scoreLabel"] == "Tres adapte"
    assert body["macros"]["calories"] == 1400
    assert body["macros"]["protein"] >= 100
    assert body["constraintsChecked"]["allergies"] is True
    assert "Noix" not in body["mealPlan"]
    assert "Graines de courge" in body["mealPlan"] or "Noix" not in " ".join(body["mealPlan"])


@pytest.mark.anyio
async def test_nutrition_quality_gate_adapts_vegetarian_plan(api_client):
    response = await api_client.post(
        "/ai/nutrition/recommend",
        json={
            "userId": "quality_nutrition_vegetarian",
            "goal": "maintien",
            "targetCalories": 1900,
            "budget": 45,
            "diet": "vegetarien",
            "preferences": "legumes",
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["fallbackUsed"] is False
    assert body["score"] >= 0.85
    assert "Poulet grille" not in body["mealPlan"]
    assert "Tofu grille" in body["mealPlan"]
    assert body["constraintsChecked"]["diet"] is True


@pytest.mark.anyio
async def test_sport_quality_gate_protects_limited_or_fatigued_user(api_client):
    response = await api_client.post(
        "/ai/sport/recommend",
        json={
            "userId": "quality_sport_recovery",
            "goal": "perte de graisse",
            "level": "debutant",
            "duration": 25,
            "sessionsPerWeek": 2,
            "equipment": "aucun",
            "limitations": "genou sensible",
            "fatigue": "elevee",
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["model"] == "healthai-sport-recommender-v1"
    assert body["fallbackUsed"] is False
    assert body["score"] >= 0.79
    assert body["intensity"] == "low"
    assert body["title"] == "Mobilite et recuperation"
    assert any("Limitations declarees" in precaution for precaution in body["precautions"])
    assert any("Fatigue elevee" in precaution for precaution in body["precautions"])


@pytest.mark.anyio
async def test_sport_quality_gate_progresses_to_muscle_gain_plan(api_client):
    response = await api_client.post(
        "/ai/sport/recommend",
        json={
            "userId": "quality_sport_muscle_gain",
            "goal": "prise de masse",
            "level": "intermediaire",
            "duration": 45,
            "sessionsPerWeek": 4,
            "equipment": "salle, barre",
            "limitations": "",
            "fatigue": "faible",
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["fallbackUsed"] is False
    assert body["score"] >= 0.90
    assert body["title"] == "Programme prise de masse"
    assert body["intensity"] == "high"
    assert body["sessionsPerWeek"] == 4
    assert any("charges progressivement" in precaution for precaution in body["precautions"])
