from app.recommender.imbalance_detector import detect_nutrition_imbalances
from app.recommender.meal_plan_generator import generate_meal_plan
from app.recommender.nutrition_estimator import estimate_daily_calories


def recommend_nutrition(payload) -> dict:
    calories = estimate_daily_calories(
        payload.sex,
        payload.weightKg,
        payload.heightCm,
        payload.age,
        payload.activityLevel,
        payload.goal,
    )
    macros = {
        "proteinsGrams": round(payload.weightKg * (1.6 if payload.goal == "gain_muscle" else 1.3)),
        "carbsGrams": round(calories * 0.45 / 4),
        "fatsGrams": round(calories * 0.28 / 9),
    }
    recommendations = generate_meal_plan(calories, payload.dietaryRestrictions)
    recommendations.extend(detect_nutrition_imbalances(payload.dietaryRestrictions, payload.goal))
    return {
        "dailyCalories": calories,
        "macros": macros,
        "recommendations": recommendations,
        "fallbackUsed": True,
    }
