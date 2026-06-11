import pytest

from app.main import app


@pytest.mark.anyio
async def test_health_returns_status(api_client):
    response = await api_client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "healthai-ai-service"
    assert body["vision"]["uploadSupported"] is True
    assert body["vision"]["urlSupported"] is True
    assert "modelName" in body["vision"]
    assert "modelAvailable" in body["vision"]
    assert "torch" in body["vision"]
    assert "transformers" in body["vision"]
    assert body["vision"]["fallbackAvailable"] is True
    assert body["nutritionModel"]["enabled"] is True
    assert body["nutritionModel"]["engineAvailable"] is True
    assert body["nutritionModel"]["engineType"] == "rules-scoring"
    assert body["nutritionModel"]["trainedModelAvailable"] is False
    assert body["nutritionModel"]["modelAvailable"] is False
    assert body["nutritionModel"]["fallbackAvailable"] is True
    assert body["nutritionModel"]["fallbackUsedByDefault"] is False
    assert body["nutritionModel"]["modelName"] == "healthai-nutrition-recommender-v1"
    assert body["sportModel"]["enabled"] is True
    assert body["sportModel"]["engineAvailable"] is True
    assert body["sportModel"]["engineType"] == "rules-scoring"
    assert body["sportModel"]["trainedModelAvailable"] is False
    assert body["sportModel"]["modelAvailable"] is False
    assert body["sportModel"]["fallbackAvailable"] is True
    assert body["sportModel"]["fallbackUsedByDefault"] is False
    assert body["sportModel"]["modelName"] == "healthai-sport-recommender-v1"


@pytest.mark.anyio
async def test_metrics_endpoint_is_available(api_client):
    response = await api_client.get("/metrics")

    assert response.status_code == 200
    assert "http_requests_total" in response.text


def test_app_registers_health_route():
    paths = {route.path for route in app.routes}

    assert "/health" in paths
    assert "/metrics" in paths
