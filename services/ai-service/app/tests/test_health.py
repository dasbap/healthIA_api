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


@pytest.mark.anyio
async def test_metrics_endpoint_is_available(api_client):
    response = await api_client.get("/metrics")

    assert response.status_code == 200
    assert "http_requests_total" in response.text


def test_app_registers_health_route():
    paths = {route.path for route in app.routes}

    assert "/health" in paths
    assert "/metrics" in paths
