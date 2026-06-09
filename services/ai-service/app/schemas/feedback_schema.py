from pydantic import BaseModel, ConfigDict, Field

from app.schemas.nutrition_schema import DEFAULT_USER_ID


class FeedbackRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    userId: str = Field(default=DEFAULT_USER_ID, min_length=1)
    user_id: str | None = Field(default=None, min_length=1)
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(default=None, min_length=1, max_length=1000)

    @property
    def normalized_user_id(self) -> str:
        return self.user_id or self.userId


class FeedbackResponse(BaseModel):
    message: str
    recommendationId: str
    status: str
    ok: bool = True
