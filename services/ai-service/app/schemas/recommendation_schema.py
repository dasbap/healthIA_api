from pydantic import BaseModel, Field


class RecommendationHistoryItem(BaseModel):
    id: str | None = None
    userId: str
    type: str
    payload: dict


class RecommendationHistoryResponse(BaseModel):
    userId: str = Field(..., min_length=1)
    items: list[RecommendationHistoryItem]
