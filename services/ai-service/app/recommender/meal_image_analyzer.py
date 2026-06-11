from app.recommender.vision_model_analyzer import (
    active_vision_model_name,
    analyze_image_bytes_with_vision_model,
    analyze_with_vision_model,
)
from app.schemas.meal_analysis_schema import MealFoodItem


def analyze_meal_image(image_url: str, notes: str | None = None) -> dict:
    model_foods = analyze_with_vision_model(image_url)
    if model_foods:
        return _model_analysis(model_foods, source_label="URL image")

    return _fallback_analysis(image_url, notes, source_label="URL image")


def analyze_meal_image_bytes(image_bytes: bytes, file_name: str, notes: str | None = None) -> dict:
    model_foods = analyze_image_bytes_with_vision_model(image_bytes)
    if model_foods:
        return _model_analysis(model_foods, source_label="fichier image recu")

    return _fallback_analysis(file_name, notes, source_label="fichier image recu")


def _model_analysis(model_foods: list[dict], source_label: str) -> dict:
    top_food = model_foods[0]
    total = int(top_food.get("calories", 0)) or 520
    warnings = list(top_food.get("warnings", []))
    confidence = float(top_food.get("confidence", 0))
    if confidence < 0.5:
        warnings.append("Confiance faible : estimation nutritionnelle a verifier.")

    return {
        "detectedFoods": model_foods,
        "totalCalories": total,
        "warnings": warnings,
        "summary": (
            f"Analyse image realisee par modele local depuis {source_label}. "
            f"Classe principale detectee : {top_food.get('name', 'aliment')} "
            f"avec une confiance de {round(confidence * 100)}%."
        ),
        "model": active_vision_model_name(),
        "fallbackUsed": False,
    }


def _fallback_analysis(source: str, notes: str | None = None, source_label: str = "image") -> dict:
    lowered = f"{source} {notes or ''}".lower()
    if "salad" in lowered or "salade" in lowered or "legume" in lowered:
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
        "warnings": [],
        "summary": f"Analyse estimee depuis {source_label}: {total} kcal detectees.",
        "model": "healthai-vision-fallback-v1",
        "fallbackUsed": True,
    }
