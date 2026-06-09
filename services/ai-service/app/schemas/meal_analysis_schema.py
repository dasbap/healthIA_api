from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator

from app.schemas.nutrition_schema import DEFAULT_USER_ID

SUPPORTED_IMAGE_SUFFIXES = (".jpg", ".jpeg", ".png", ".webp")


class MealAnalysisRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    userId: str = Field(default=DEFAULT_USER_ID, min_length=1, examples=["demo-user"])
    user_id: str | None = Field(default=None, min_length=1, examples=["demo-user"])
    imageUrl: HttpUrl | None = Field(default=None, examples=["https://example.com/meal.jpg"])
    image_url: HttpUrl | None = Field(default=None, examples=["https://example.com/meal.jpg"])
    fileName: str | None = Field(default=None, min_length=1, examples=["repas.png"])
    file_name: str | None = Field(default=None, min_length=1, examples=["repas.png"])
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("fileName", "file_name")
    @classmethod
    def validate_file_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        lowered = value.lower()
        if not lowered.endswith(SUPPORTED_IMAGE_SUFFIXES):
            raise ValueError("Format image non supporte. Utilisez JPG, PNG ou WebP.")
        return value

    @model_validator(mode="after")
    def require_image_source(self) -> "MealAnalysisRequest":
        if self.normalized_image_url is None and not self.normalized_file_name:
            raise ValueError("Ajoutez une URL d'image ou un fichier image.")
        return self

    @property
    def normalized_user_id(self) -> str:
        return self.user_id or self.userId

    @property
    def normalized_image_url(self) -> HttpUrl | None:
        return self.image_url or self.imageUrl

    @property
    def normalized_file_name(self) -> str | None:
        return self.file_name or self.fileName


class MealFoodItem(BaseModel):
    name: str
    confidence: float = Field(..., ge=0, le=1)
    calories: int = Field(..., ge=0)
    proteins: float = Field(..., ge=0)
    carbs: float = Field(..., ge=0)
    fats: float = Field(..., ge=0)


class DetectedFood(BaseModel):
    label: str
    confidence: float = Field(..., ge=0, le=1)


class NutritionMacros(BaseModel):
    calories: int = Field(..., ge=0)
    protein: int = Field(..., ge=0)
    carbs: int = Field(..., ge=0)
    fat: int = Field(..., ge=0)


class VisionMacros(BaseModel):
    proteins: int = Field(..., ge=0)
    carbs: int = Field(..., ge=0)
    fats: int = Field(..., ge=0)


class MealAnalysisResponse(BaseModel):
    id: str
    analysisId: str
    type: Literal["meal-analysis"] = "meal-analysis"
    title: str
    score: float = Field(..., ge=0, le=1)
    estimatedCalories: int = Field(..., ge=0)
    detectedFoods: list[DetectedFood]
    macros: VisionMacros
    nutrition: NutritionMacros
    warnings: list[str]
    imbalances: list[str]
    suggestions: list[str]
    explanation: str
    model: str
    createdAt: str
    fallbackUsed: bool = False
