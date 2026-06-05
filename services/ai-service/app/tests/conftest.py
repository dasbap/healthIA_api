import os

import pytest

os.environ.setdefault("AI_SERVICE_MONGO_ENABLED", "false")


def pytest_configure(config):
    config.addinivalue_line("markers", "anyio: run async tests")


@pytest.fixture
def anyio_backend():
    return "asyncio"
