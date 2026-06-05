from pydantic import BaseModel, Field, HttpUrl


class MealAnalysisRequest(BaseModel):
    userId: str = Field(..., min_length=1, examples=["user_123"])
    imageUrl: HttpUrl = Field(..., examples=["https://example.com/meal.jpg"])
    notes: str | None = Field(default=None, max_length=500)


class MealFoodItem(BaseModel):
    name: str
    confidence: float = Field(..., ge=0, le=1)
    calories: int = Field(..., ge=0)
    proteins: float = Field(..., ge=0)
    carbs: float = Field(..., ge=0)
    fats: float = Field(..., ge=0)


class MealAnalysisResponse(BaseModel):
    id: str | None = None
    userId: str
    imageUrl: str
    detectedFoods: list[MealFoodItem]
    totalCalories: int
    summary: str
    fallbackUsed: bool = False
