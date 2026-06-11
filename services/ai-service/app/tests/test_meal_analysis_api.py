from io import BytesIO

import pytest
from PIL import Image
from pydantic import ValidationError

from app.schemas.meal_analysis_schema import MealAnalysisRequest


def make_png_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (1, 1), color=(20, 160, 130)).save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.mark.anyio
async def test_meal_analysis_with_image_url(api_client):
    response = await api_client.post(
        "/ai/meal/analyze",
        json={
            "userId": "meal_user",
            "imageUrl": "https://example.com/salad.jpg",
            "notes": "salad and chicken",
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["analysisId"].startswith("rec_meal_")
    assert body["nutrition"]["calories"] > 0
    assert body["detectedFoods"]
    assert body["fallbackUsed"] is True
    assert body["model"]


@pytest.mark.anyio
async def test_meal_analysis_with_uploaded_image(api_client):
    response = await api_client.post(
        "/ai/meal/analyze",
        data={"userId": "meal_upload_user", "notes": "salade"},
        files={"file": ("assiette.png", make_png_bytes(), "image/png")},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["analysisId"].startswith("rec_meal_")
    assert body["fallbackUsed"] is True
    assert body["model"] == "healthai-vision-fallback-v1"
    assert body["detectedFoods"]


@pytest.mark.anyio
async def test_meal_analysis_can_return_real_vision_result_when_model_is_mocked(api_client, monkeypatch):
    def fake_analyze_image_bytes(image_bytes: bytes):
        assert image_bytes
        return [
            {
                "name": "spaghetti",
                "confidence": 0.87,
                "calories": 520,
                "proteins": 18,
                "carbs": 80,
                "fats": 14,
                "warnings": ["Glucides eleves"],
            }
        ]

    monkeypatch.setattr(
        "app.recommender.meal_image_analyzer.analyze_image_bytes_with_vision_model",
        fake_analyze_image_bytes,
    )
    monkeypatch.setattr("app.recommender.meal_image_analyzer.active_vision_model_name", lambda: "unit-test-food-model")

    response = await api_client.post(
        "/ai/meal/analyze",
        data={"userId": "meal_upload_user"},
        files={"file": ("spaghetti.png", make_png_bytes(), "image/png")},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["fallbackUsed"] is False
    assert body["model"] == "unit-test-food-model"
    assert body["detectedFoods"][0]["label"] == "spaghetti"
    assert body["nutrition"]["calories"] == 520
    assert body["macros"]["carbs"] == 80
    assert "Glucides eleves" in body["warnings"]


@pytest.mark.anyio
async def test_meal_analysis_rejects_empty_payload(api_client):
    response = await api_client.post("/ai/meal/analyze", json={"userId": "meal_user"})

    assert response.status_code == 422
    assert "image" in str(response.json()["detail"]).lower()


def test_meal_analysis_rejects_invalid_url():
    with pytest.raises(ValidationError):
        MealAnalysisRequest(userId="user_123", imageUrl="not-a-url")


@pytest.mark.anyio
async def test_meal_analysis_rejects_non_image_file(api_client):
    response = await api_client.post(
        "/ai/meal/analyze",
        data={"userId": "meal_upload_user"},
        files={"file": ("notes.txt", b"pas une image", "text/plain")},
    )

    assert response.status_code == 400
    assert "image au format JPEG, PNG ou WebP" in response.json()["detail"]
