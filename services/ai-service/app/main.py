from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI

from app.core.exceptions import ServiceUnavailableError, service_unavailable_handler
from app.core.config import settings
from app.core.logging import configure_logging
from app.database.mongo import close_mongo, connect_mongo
from app.routes import (
    feedback_routes,
    health_routes,
    meal_routes,
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
            logger.warning("MongoDB unavailable, using storage fallback: %s", exc)
    else:
        logger.info("MongoDB disabled, using storage fallback")
    yield
    await close_mongo()


app = FastAPI(
    title="HealthIA AI Service",
    description="FastAPI microservice for meal analysis, nutrition and sport recommendations.",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_exception_handler(ServiceUnavailableError, service_unavailable_handler)

app.include_router(health_routes.router)
app.include_router(meal_routes.router)
app.include_router(nutrition_routes.router)
app.include_router(sport_routes.router)
app.include_router(recommendation_routes.router)
app.include_router(feedback_routes.router)
