from fastapi import APIRouter, Response

from app.core.metrics import metrics

router = APIRouter(tags=["metrics"])


@router.get("/metrics")
async def metrics_text() -> Response:
    return Response(metrics.render(), media_type="text/plain; version=0.0.4")
