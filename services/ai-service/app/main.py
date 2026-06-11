import logging
from contextlib import asynccontextmanager
from time import perf_counter

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError, service_unavailable_handler
from app.core.logging import configure_logging
from app.core.metrics import metrics
from app.database.mongo import close_mongo, connect_mongo
from app.routes import (
    feedback_routes,
    health_routes,
    meal_routes,
    metrics_routes,
    nutrition_routes,
    recommendation_routes,
    sport_routes,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    if settings.mongo_enabled:
        try:
            await connect_mongo()
            logger.info("MongoDB connected")
        except Exception as exc:
            metrics.mongo_unavailable_total += 1
            logger.warning("MongoDB unavailable, using storage fallback: %s", exc)
    else:
        logger.info("MongoDB disabled, using storage fallback")
    yield
    await close_mongo()


app = FastAPI(
    title="HealthIA AI Service",
    description=(
        "FastAPI microservice for HealthAI meal analysis, nutrition recommendations, "
        "sport recommendations, history, feedback and observability."
    ),
    version="0.1.0",
    lifespan=lifespan,
)
app.add_exception_handler(ServiceUnavailableError, service_unavailable_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def operational_middleware(request: Request, call_next) -> Response:
    started_at = perf_counter()
    request_id = request.headers.get("x-request-id", "")[:128] or "-"

    if settings.service_token and request.url.path.startswith("/ai"):
        if request.headers.get("x-service-token") != settings.service_token:
            response = Response(status_code=status.HTTP_403_FORBIDDEN)
            response.headers["X-Request-Id"] = request_id
            metrics.record_request(request.method, request.url.path, response.status_code, 0)
            return response

    response = await call_next(request)
    duration_ms = (perf_counter() - started_at) * 1000
    response.headers["X-Request-Id"] = request_id
    metrics.record_request(request.method, request.url.path, response.status_code, duration_ms)
    logger.info(
        "request completed",
        extra={
            "requestId": request_id,
            "route": request.url.path,
            "statusCode": response.status_code,
            "durationMs": round(duration_ms, 3),
        },
    )
    return response

app.include_router(health_routes.router)
app.include_router(metrics_routes.router)
app.include_router(meal_routes.router)
app.include_router(nutrition_routes.router)
app.include_router(sport_routes.router)
app.include_router(recommendation_routes.router)
app.include_router(feedback_routes.router)
