from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

DEFAULT_USER_ID = "profile_demo_001"


def _as_list(value: list[str] | str | None) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [item.strip() for item in value if item.strip()]
    return [item.strip() for item in value.split(",") if item.strip()]


class NutritionRecommendationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    userId: str = Field(default=DEFAULT_USER_ID, min_length=1)
    user_id: str | None = Field(default=None, min_length=1)
    goal: str | None = Field(default=None, min_length=1, examples=["perte de graisse"])
    objective: str | None = Field(default=None, min_length=1, examples=["perte de graisse"])
    targetCalories: int | None = Field(default=None, ge=300, le=4000)
    calories_target: int | None = Field(default=None, ge=300, le=4000)
    budget: float | None = Field(default=None, ge=0, examples=[65])
    weekly_budget: float | None = Field(default=None, ge=0, examples=[65])
    allergies: list[str] | str = Field(default_factory=list, examples=[["noisettes"]])
    diet: str | None = Field(default=None, examples=["omnivore"])
    diet_type: str | None = Field(default=None, examples=["omnivore"])
    preferences: list[str] | str = Field(default_factory=list, examples=[["repas rapides", "poulet"]])
    activityLevel: str | None = Field(default=None, examples=["debutant"])
    activity_level: str | None = Field(default=None, examples=["debutant"])

    @field_validator("allergies", "preferences", mode="before")
    @classmethod
    def normalize_list_fields(cls, value: list[str] | str | None) -> list[str]:
        return _as_list(value)

    @property
    def normalized_goal(self) -> str:
        return self.objective or self.goal or "equilibre"

    @property
    def normalized_user_id(self) -> str:
        return self.user_id or self.userId

    @property
    def normalized_calories(self) -> int:
        return self.calories_target or self.targetCalories or 560

    @property
    def normalized_budget(self) -> float:
        return self.weekly_budget if self.weekly_budget is not None else self.budget or 0

    @property
    def normalized_diet(self) -> str:
        return self.diet_type or self.diet or "omnivore"


class NutritionMacros(BaseModel):
    calories: int = Field(..., ge=0)
    protein: int = Field(..., ge=0)
    carbs: int = Field(..., ge=0)
    fat: int = Field(..., ge=0)


class ConstraintsChecked(BaseModel):
    allergies: bool
    diet: bool
    budget: bool


class NutritionRecommendationResponse(BaseModel):
    recommendationId: str
    type: Literal["nutrition"] = "nutrition"
    title: str
    score: float = Field(..., ge=0, le=1)
    mealPlan: list[str]
    macros: NutritionMacros
    constraintsChecked: ConstraintsChecked
    explanation: str
    advice: list[str]
    model: str
    createdAt: str
    fallbackUsed: bool = True
