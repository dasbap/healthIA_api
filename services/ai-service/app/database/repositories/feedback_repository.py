from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from app.database.mongo import get_database, serialize_document

_memory_feedbacks: list[dict[str, Any]] = []


class FeedbackRepository:
    collection_name = "feedbacks"

    async def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        db = get_database()
        document = {**payload, "createdAt": datetime.now(UTC)}
        document["id"] = document.get("id") or f"feedback_{uuid4().hex[:10]}"
        if db is None:
            stored = {**document, "storage": "memory_fallback"}
            _memory_feedbacks.insert(0, stored)
            if isinstance(stored.get("createdAt"), datetime):
                stored = {**stored, "createdAt": stored["createdAt"].isoformat()}
            return stored
        result = await db[self.collection_name].insert_one(document)
        stored = await db[self.collection_name].find_one({"_id": result.inserted_id})
        return serialize_document(stored) or document
