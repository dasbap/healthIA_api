from pydantic import BaseModel, Field


class NutritionRecommendationRequest(BaseModel):
    userId: str = Field(..., min_length=1)
    age: int = Field(..., ge=12, le=100)
    sex: str = Field(..., pattern="^(female|male|other)$")
    heightCm: float = Field(..., ge=120, le=230)
    weightKg: float = Field(..., ge=35, le=250)
    goal: str = Field(..., pattern="^(lose_weight|maintain|gain_muscle)$")
    activityLevel: str = Field(..., pattern="^(low|moderate|high)$")
    dietaryRestrictions: list[str] = Field(default_factory=list)


class NutritionRecommendationResponse(BaseModel):
    id: str | None = None
    userId: str
    type: str = "nutrition"
    dailyCalories: int
    macros: dict[str, int]
    recommendations: list[str]
    fallbackUsed: bool = False
