from pydantic import BaseModel, Field


class SportRecommendationRequest(BaseModel):
    userId: str = Field(..., min_length=1)
    age: int = Field(..., ge=12, le=100)
    goal: str = Field(..., pattern="^(fat_loss|endurance|strength|mobility)$")
    level: str = Field(..., pattern="^(beginner|intermediate|advanced)$")
    sessionsPerWeek: int = Field(..., ge=1, le=7)
    limitations: list[str] = Field(default_factory=list)


class SportRecommendationResponse(BaseModel):
    id: str | None = None
    userId: str
    type: str = "sport"
    weeklyPlan: list[dict[str, str]]
    safetyNotes: list[str]
    fallbackUsed: bool = False
