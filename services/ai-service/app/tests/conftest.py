import os

import pytest
from httpx import ASGITransport, AsyncClient

os.environ["AI_SERVICE_MONGO_ENABLED"] = "false"
os.environ["AI_SERVICE_VISION_ENABLED"] = "false"
os.environ["VISION_ENABLED"] = "false"


def pytest_configure(config):
    config.addinivalue_line("markers", "anyio: run async tests")


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def api_client():
    from app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
