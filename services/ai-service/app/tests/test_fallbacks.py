from app.services.fallback_service import fallback_status


def test_fallback_status_is_enabled():
    status = fallback_status()

    assert status["enabled"] is True
    assert "external AI" in status["reason"]
