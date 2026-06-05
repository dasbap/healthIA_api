from datetime import UTC, datetime
from typing import Any

from app.database.mongo import get_database, serialize_document


class RecommendationRepository:
    collection_name = "recommendations"

    async def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        db = get_database()
        document = {**payload, "createdAt": datetime.now(UTC)}
        if db is None:
            return {"id": None, **document, "storage": "memory_fallback"}
        result = await db[self.collection_name].insert_one(document)
        stored = await db[self.collection_name].find_one({"_id": result.inserted_id})
        return serialize_document(stored) or document

    async def list_by_user(self, user_id: str, limit: int = 20) -> list[dict[str, Any]]:
        db = get_database()
        if db is None:
            return []
        cursor = (
            db[self.collection_name]
            .find({"userId": user_id})
            .sort("createdAt", -1)
            .limit(limit)
        )
        return [serialize_document(document) for document in await cursor.to_list(length=limit)]
