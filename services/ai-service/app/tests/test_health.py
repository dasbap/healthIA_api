import pytest

from app.main import app
from app.routes.health_routes import health


@pytest.mark.anyio
async def test_health_returns_status():
    response = await health()

    assert response["status"] == "ok"


def test_app_registers_health_route():
    paths = {route.path for route in app.routes}

    assert "/health" in paths
    assert "/metrics" in paths
