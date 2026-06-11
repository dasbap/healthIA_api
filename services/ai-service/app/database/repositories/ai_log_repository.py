from datetime import UTC, datetime
from typing import Any

from app.database.mongo import get_database


class AiLogRepository:
    collection_name = "ai_logs"

    async def create(self, event: str, payload: dict[str, Any]) -> None:
        db = get_database()
        if db is None:
            return
        await db[self.collection_name].insert_one(
            {"event": event, "payload": payload, "createdAt": datetime.now(UTC)}
        )
