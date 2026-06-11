from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.nutrition_schema import DEFAULT_USER_ID, _as_list


class SportRecommendationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    userId: str = Field(default=DEFAULT_USER_ID, min_length=1)
    user_id: str | None = Field(default=None, min_length=1)
    goal: str = Field(default="perte de graisse", min_length=1)
    objective: str | None = Field(default=None, min_length=1)
    level: str = Field(default="debutant", min_length=1)
    duration: int | None = Field(default=None, ge=10, le=180)
    duration_minutes: int | None = Field(default=None, ge=10, le=180)
    equipment: list[str] | str = Field(default_factory=list)
    preferences: list[str] | str = Field(default_factory=list)
    limitations: list[str] | str = Field(default_factory=list)
    physical_limitations: list[str] | str = Field(default_factory=list)
    fatigue: str = Field(default="moderee", min_length=1)
    sessionsPerWeek: int | None = Field(default=None, ge=1, le=7)
    sessions_per_week: int | None = Field(default=None, ge=1, le=7)
    durationMinutes: int | None = Field(default=None, ge=10, le=180)
    age: int | None = Field(default=None, ge=10, le=100)
    weightKg: float | None = Field(default=None, ge=25, le=250)
    weight_kg: float | None = Field(default=None, ge=25, le=250)
    intensity: str | None = Field(default=None)

    @field_validator("equipment", "preferences", "limitations", "physical_limitations", mode="before")
    @classmethod
    def normalize_list_fields(cls, value: list[str] | str | None) -> list[str]:
        return _as_list(value)

    @property
    def normalized_goal(self) -> str:
        return self.objective or self.goal

    @property
    def normalized_user_id(self) -> str:
        return self.user_id or self.userId

    @property
    def normalized_duration(self) -> int:
        return self.durationMinutes or self.duration_minutes or self.duration or 30

    @property
    def normalized_limitations(self) -> list[str]:
        return [*self.limitations, *self.physical_limitations]

    @property
    def normalized_sessions_per_week(self) -> int:
        return self.sessions_per_week or self.sessionsPerWeek or 3

    @property
    def normalized_age(self) -> int:
        return self.age or 30

    @property
    def normalized_weight_kg(self) -> float:
        return self.weight_kg or self.weightKg or 70


class Exercise(BaseModel):
    name: str
    duration: int = Field(..., ge=0)
    intensity: Literal["low", "medium", "high"]
    note: str


class SportRecommendationResponse(BaseModel):
    recommendationId: str
    id: str
    userId: str
    type: Literal["sport"] = "sport"
    title: str
    score: float = Field(..., ge=0, le=1)
    scoreLabel: str
    summary: str
    duration: int = Field(..., ge=0)
    durationMinutes: int = Field(..., ge=0)
    sessionsPerWeek: int = Field(..., ge=1, le=7)
    intensity: Literal["low", "medium", "high"]
    exercises: list[Exercise]
    explanation: str
    precautions: list[str]
    warning: str | None = None
    model: str
    createdAt: str
    fallbackUsed: bool = True
