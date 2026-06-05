from app.schemas.meal_analysis_schema import MealFoodItem


def analyze_meal_image(image_url: str, notes: str | None = None) -> dict:
    lowered = f"{image_url} {notes or ''}".lower()
    if "salad" in lowered or "legume" in lowered:
        foods = [
            MealFoodItem(name="salade composee", confidence=0.82, calories=240, proteins=8, carbs=22, fats=12),
            MealFoodItem(name="poulet grille", confidence=0.74, calories=220, proteins=32, carbs=0, fats=8),
        ]
    elif "pizza" in lowered:
        foods = [
            MealFoodItem(name="pizza", confidence=0.78, calories=720, proteins=28, carbs=86, fats=28),
        ]
    else:
        foods = [
            MealFoodItem(name="repas mixte", confidence=0.55, calories=520, proteins=24, carbs=62, fats=18),
        ]
    total = sum(food.calories for food in foods)
    return {
        "detectedFoods": [food.model_dump() for food in foods],
        "totalCalories": total,
        "summary": f"Analyse estimee: {total} kcal detectees.",
        "fallbackUsed": True,
    }
