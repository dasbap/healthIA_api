from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from app.database.mongo import get_database, serialize_document

_memory_recommendations: list[dict[str, Any]] = []


def _serialize_memory_document(document: dict[str, Any]) -> dict[str, Any]:
    item = dict(document)
    created_at = item.get("createdAt")
    if isinstance(created_at, datetime):
        item["createdAt"] = created_at.isoformat()
    return item


class RecommendationRepository:
    collection_name = "recommendations"

    async def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        db = get_database()
        document = {**payload, "createdAt": datetime.now(UTC)}
        document["id"] = document.get("id") or document.get("recommendationId") or f"rec_{uuid4().hex[:10]}"
        if db is None:
            stored = {**document, "storage": "memory_fallback"}
            _memory_recommendations.insert(0, stored)
            return _serialize_memory_document(stored)
        result = await db[self.collection_name].insert_one(document)
        stored = await db[self.collection_name].find_one({"_id": result.inserted_id})
        return serialize_document(stored) or document

    async def list_by_user(self, user_id: str, limit: int = 20) -> list[dict[str, Any]]:
        db = get_database()
        if db is None:
            return [
                _serialize_memory_document(document)
                for document in _memory_recommendations
                if document.get("userId") == user_id
            ][:limit]
        cursor = (
            db[self.collection_name]
            .find({"userId": user_id})
            .sort("createdAt", -1)
            .limit(limit)
        )
        return [serialize_document(document) for document in await cursor.to_list(length=limit)]

    async def get_by_id(self, recommendation_id: str) -> dict[str, Any] | None:
        db = get_database()
        if db is None:
            for document in _memory_recommendations:
                if document.get("id") == recommendation_id or document.get("recommendationId") == recommendation_id:
                    return _serialize_memory_document(document)
            return None

        document = await db[self.collection_name].find_one(
            {
                "$or": [
                    {"id": recommendation_id},
                    {"recommendationId": recommendation_id},
                ]
            }
        )
        return serialize_document(document)
