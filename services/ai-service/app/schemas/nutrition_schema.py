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
    weeklyBudget: float | None = Field(default=None, ge=0, examples=[65])
    allergies: list[str] | str = Field(default_factory=list, examples=[["noisettes"]])
    dietaryRestrictions: list[str] | str = Field(default_factory=list)
    dietary_restrictions: list[str] | str = Field(default_factory=list)
    diet: str | None = Field(default=None, examples=["omnivore"])
    dietType: str | None = Field(default=None, examples=["omnivore"])
    diet_type: str | None = Field(default=None, examples=["omnivore"])
    preferences: list[str] | str = Field(default_factory=list, examples=[["repas rapides", "poulet"]])
    activityLevel: str | None = Field(default=None, examples=["debutant"])
    activity_level: str | None = Field(default=None, examples=["debutant"])
    age: int | None = Field(default=None, ge=10, le=100)
    sex: str | None = Field(default=None)
    heightCm: int | None = Field(default=None, ge=80, le=250)
    height_cm: int | None = Field(default=None, ge=80, le=250)
    weightKg: float | None = Field(default=None, ge=25, le=250)
    weight_kg: float | None = Field(default=None, ge=25, le=250)

    @field_validator("allergies", "preferences", "dietaryRestrictions", "dietary_restrictions", mode="before")
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
        if self.weekly_budget is not None:
            return self.weekly_budget
        if self.weeklyBudget is not None:
            return self.weeklyBudget
        return self.budget or 0

    @property
    def normalized_diet(self) -> str:
        return self.diet_type or self.dietType or self.diet or "omnivore"

    @property
    def normalized_weight_kg(self) -> float:
        return self.weight_kg or self.weightKg or 70

    @property
    def normalized_age(self) -> int:
        return self.age or 30

    @property
    def normalized_dietary_restrictions(self) -> list[str]:
        return [*self.dietaryRestrictions, *self.dietary_restrictions]


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
    id: str
    userId: str
    type: Literal["nutrition"] = "nutrition"
    title: str
    score: float = Field(..., ge=0, le=1)
    scoreLabel: str
    summary: str
    calories: int = Field(..., ge=0)
    mealPlan: list[str]
    recommendations: list[str]
    macros: NutritionMacros
    constraintsChecked: ConstraintsChecked
    respectedConstraints: ConstraintsChecked
    warnings: list[str]
    explanation: str
    advice: list[str]
    model: str
    createdAt: str
    fallbackUsed: bool = True
