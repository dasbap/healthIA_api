from pydantic import BaseModel, Field


class FeedbackRequest(BaseModel):
    userId: str = Field(..., min_length=1)
    recommendationId: str | None = None
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class FeedbackResponse(BaseModel):
    id: str | None = None
    userId: str
    recommendationId: str | None = None
    rating: int
    comment: str | None = None
