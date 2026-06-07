from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

client: AsyncIOMotorClient | None = None


async def connect_mongo() -> None:
    global client
    client = AsyncIOMotorClient(
        settings.mongo_uri,
        serverSelectionTimeoutMS=settings.mongo_timeout_ms,
    )
    await client.admin.command("ping")
    await ensure_indexes()


async def close_mongo() -> None:
    global client
    if client:
        client.close()
        client = None


def get_database() -> AsyncIOMotorDatabase | None:
    if client is None:
        return None
    return client[settings.mongo_db]


async def ensure_indexes() -> None:
    database = get_database()
    if database is None:
        return

    await database.meal_analyses.create_index([("userId", 1), ("createdAt", -1)])
    await database.recommendations.create_index([("userId", 1), ("createdAt", -1)])
    await database.recommendations.create_index([("userId", 1), ("type", 1), ("createdAt", -1)])
    await database.feedbacks.create_index([("userId", 1), ("createdAt", -1)])
    await database.feedbacks.create_index([("recommendationId", 1)])
    await database.ai_logs.create_index([("createdAt", -1)])
    await database.ai_logs.create_index([("event", 1), ("createdAt", -1)])


def serialize_document(document: dict | None) -> dict | None:
    if document is None:
        return None
    item = dict(document)
    if "_id" in item:
        item["id"] = str(item.pop("_id"))
    return item
