def estimate_daily_calories(
    sex: str,
    weight_kg: float,
    height_cm: float,
    age: int,
    activity_level: str,
    goal: str,
) -> int:
    sex_adjustment = 5 if sex == "male" else -161
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + sex_adjustment
    factors = {"low": 1.25, "moderate": 1.45, "high": 1.7}
    calories = bmr * factors[activity_level]
    if goal == "lose_weight":
        calories -= 350
    if goal == "gain_muscle":
        calories += 250
    return max(1200, round(calories))
