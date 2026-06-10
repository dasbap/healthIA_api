from typing import Literal

from pydantic import BaseModel, Field

RecommendationType = Literal["nutrition", "sport", "meal-analysis"]
RecommendationStatus = Literal["completed", "reviewed", "flagged"]


class RecommendationHistoryItem(BaseModel):
    id: str
    type: RecommendationType
    title: str
    score: float = Field(..., ge=0, le=1)
    status: RecommendationStatus
    createdAt: str
    summary: str


class RecommendationDetail(RecommendationHistoryItem):
    userInput: str
    aiResult: str
    explanation: str
    model: str
    modelVersion: str
    signals: list[str]
