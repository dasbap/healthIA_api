from app.schemas.nutrition_schema import NutritionRecommendationRequest

MODEL_NAME = "healthai-nutrition-recommender-v1"
FALLBACK_MODEL_NAME = "healthai-nutrition-fallback-v1"

MEAL_EXAMPLES = {
    "balanced_meal": ["Poulet grille", "Riz complet", "Legumes verts", "Yaourt nature"],
    "high_protein_meal": ["Steak de boeuf", "Oeufs", "Fromage cottage", "Legumineuses"],
    "low_calorie_meal": ["Salade verte", "Poulet vapeur", "Legumes crus", "Fruit frais"],
    "performance_meal": ["Pates completes", "Poulet", "Banane", "Noix"],
}

VEGETARIAN_SWAPS = {
    "Poulet grille": "Tofu grille",
    "Poulet vapeur": "Tofu vapeur",
    "Poulet": "Tempeh grille",
    "Steak de boeuf": "Lentilles corail",
}

ALLERGEN_SWAPS = {
    "gluten": {"Pates completes": "Riz complet", "Pain complet": "Quinoa"},
    "lactose": {"Yaourt nature": "Yaourt soja", "Fromage cottage": "Houmous"},
    "noisette": {"Noix": "Graines de courge"},
    "noisettes": {"Noix": "Graines de courge"},
    "noix": {"Noix": "Graines de courge"},
}

MACRO_RATIOS = {
    "balanced_meal": {"protein": 0.28, "carbs": 0.42, "fat": 0.27},
    "high_protein_meal": {"protein": 0.34, "carbs": 0.36, "fat": 0.27},
    "low_calorie_meal": {"protein": 0.32, "carbs": 0.38, "fat": 0.25},
    "performance_meal": {"protein": 0.25, "carbs": 0.50, "fat": 0.22},
}


def build_nutrition_recommendation(
    payload: NutritionRecommendationRequest,
    recommendation_id: str,
    created_at: str,
) -> dict:
    goal = _normalize_goal(payload.normalized_goal)
    diet = _normalize_diet(payload.normalized_diet, payload.normalized_dietary_restrictions)
    allergies = _normalize_terms(payload.allergies)
    preferences = _normalize_terms(payload.preferences)
    calories = payload.normalized_calories
    budget_ok = payload.normalized_budget >= 35

    meal_type = _assign_meal_type(goal, diet, calories)
    meal_plan = _adapt_meal_plan(MEAL_EXAMPLES[meal_type], diet, allergies, preferences)
    macros = _build_macros(calories, meal_type)
    warnings = _build_warnings(goal, calories, macros, budget_ok, allergies)
    score = _score_recommendation(meal_type, budget_ok, warnings, preferences)
    score_label = _score_label(score)

    constraints = {
        "allergies": True,
        "diet": True,
        "budget": budget_ok,
    }
    title = _title_for_meal_type(meal_type)
    summary = _summary_for_meal_type(meal_type, calories, budget_ok)

    return {
        "recommendationId": recommendation_id,
        "id": recommendation_id,
        "userId": payload.normalized_user_id,
        "type": "nutrition",
        "title": title,
        "score": score,
        "scoreLabel": score_label,
        "summary": summary,
        "calories": calories,
        "mealPlan": meal_plan,
        "recommendations": meal_plan,
        "macros": macros,
        "constraintsChecked": constraints,
        "respectedConstraints": constraints,
        "warnings": warnings,
        "explanation": (
            "Moteur nutrition HealthAI issu des regles du notebook Module 3 : objectif, "
            "calories, regime, allergies et budget determinent le type de repas recommande. "
            "Aucun modele ML entraine n'est charge au runtime."
        ),
        "advice": _build_advice(meal_type, budget_ok, allergies),
        "model": MODEL_NAME,
        "createdAt": created_at,
        "fallbackUsed": False,
    }


def build_nutrition_fallback(
    payload: NutritionRecommendationRequest,
    recommendation_id: str,
    created_at: str,
    reason: str,
) -> dict:
    calories = payload.normalized_calories
    protein = round(calories * 0.30 / 4)
    carbs = round(calories * 0.42 / 4)
    fat = round(calories * 0.25 / 9)
    budget_ok = payload.normalized_budget >= 35
    constraints = {"allergies": True, "diet": True, "budget": budget_ok}
    meal_plan = ["Base proteinee simple", "Feculent complet", "Legumes de saison", "Fruit"]

    return {
        "recommendationId": recommendation_id,
        "id": recommendation_id,
        "userId": payload.normalized_user_id,
        "type": "nutrition",
        "title": "Repas equilibre de secours",
        "score": 0.72,
        "scoreLabel": "A verifier",
        "summary": "Fallback backend utilise car le moteur nutrition principal a echoue.",
        "calories": calories,
        "mealPlan": meal_plan,
        "recommendations": meal_plan,
        "macros": {"calories": calories, "protein": protein, "carbs": carbs, "fat": fat},
        "constraintsChecked": constraints,
        "respectedConstraints": constraints,
        "warnings": [reason],
        "explanation": f"Fallback nutrition active : {reason}",
        "advice": ["Verifier manuellement les portions et les allergenes."],
        "model": FALLBACK_MODEL_NAME,
        "createdAt": created_at,
        "fallbackUsed": True,
    }


def _assign_meal_type(goal: str, diet: str, calories: int) -> str:
    if goal == "perte_de_poids" and calories < 1600:
        return "low_calorie_meal"
    if goal == "prise_de_masse":
        return "high_protein_meal"
    if goal == "performance":
        return "performance_meal"
    if diet == "vegetarien":
        return "balanced_meal"
    return "balanced_meal"


def _normalize_goal(value: str) -> str:
    normalized = _normalize_text(value)
    if any(token in normalized for token in ["perte", "weight_loss", "fat_loss", "maigrir"]):
        return "perte_de_poids"
    if any(token in normalized for token in ["masse", "muscle", "gain", "strength"]):
        return "prise_de_masse"
    if any(token in normalized for token in ["performance", "endurance"]):
        return "performance"
    return "equilibre"


def _normalize_diet(value: str, restrictions: list[str]) -> str:
    terms = [_normalize_text(value), *[_normalize_text(item) for item in restrictions]]
    joined = " ".join(terms)
    if any(token in joined for token in ["vegetarien", "vegetarian", "vegan"]):
        return "vegetarien"
    if "halal" in joined:
        return "halal"
    if "gluten" in joined:
        return "sans_gluten"
    return "aucun"


def _normalize_terms(values: list[str] | str) -> list[str]:
    if isinstance(values, str):
        values = [values]
    return [_normalize_text(value) for value in values if value]


def _normalize_text(value: str) -> str:
    return (
        value.lower()
        .strip()
        .replace("é", "e")
        .replace("è", "e")
        .replace("ê", "e")
        .replace("à", "a")
        .replace("ç", "c")
        .replace(" ", "_")
        .replace("-", "_")
    )


def _adapt_meal_plan(base_plan: list[str], diet: str, allergies: list[str], preferences: list[str]) -> list[str]:
    plan = list(base_plan)
    if diet == "vegetarien":
        plan = [VEGETARIAN_SWAPS.get(item, item) for item in plan]

    for allergen in allergies:
        swaps = ALLERGEN_SWAPS.get(allergen, {})
        plan = [swaps.get(item, item) for item in plan]

    if "rapide" in " ".join(preferences) and "Batch cooking 20 min" not in plan:
        plan.append("Batch cooking 20 min")
    return plan


def _build_macros(calories: int, meal_type: str) -> dict:
    ratios = MACRO_RATIOS[meal_type]
    protein = round(calories * ratios["protein"] / 4)
    carbs = round(calories * ratios["carbs"] / 4)
    fat = round(calories * ratios["fat"] / 9)
    return {"calories": calories, "protein": protein, "carbs": carbs, "fat": fat}


def _build_warnings(goal: str, calories: int, macros: dict, budget_ok: bool, allergies: list[str]) -> list[str]:
    warnings = []
    if goal == "perte_de_poids" and calories >= 1600:
        warnings.append("Calories elevees pour un objectif de perte de poids.")
    if goal == "prise_de_masse" and macros["protein"] < 35:
        warnings.append("Proteines a renforcer pour une prise de masse.")
    if not budget_ok:
        warnings.append("Budget hebdomadaire faible : privilegier oeufs, legumes secs et surgele.")
    if allergies:
        warnings.append("Allergies declarees filtrees dans les propositions.")
    return warnings


def _score_recommendation(meal_type: str, budget_ok: bool, warnings: list[str], preferences: list[str]) -> float:
    base_scores = {
        "balanced_meal": 0.86,
        "high_protein_meal": 0.91,
        "low_calorie_meal": 0.88,
        "performance_meal": 0.89,
    }
    score = base_scores[meal_type]
    if not budget_ok:
        score -= 0.07
    if len(warnings) > 1:
        score -= 0.03
    if preferences:
        score += 0.02
    return round(max(0.60, min(score, 0.95)), 2)


def _score_label(score: float) -> str:
    if score >= 0.85:
        return "Tres adapte"
    if score >= 0.70:
        return "Adapte"
    return "A verifier"


def _title_for_meal_type(meal_type: str) -> str:
    return {
        "balanced_meal": "Repas equilibre personnalise",
        "high_protein_meal": "Repas riche en proteines",
        "low_calorie_meal": "Repas leger pour perte de poids",
        "performance_meal": "Repas performance et energie",
    }[meal_type]


def _summary_for_meal_type(meal_type: str, calories: int, budget_ok: bool) -> str:
    budget_text = "budget compatible" if budget_ok else "budget a surveiller"
    return f"{_title_for_meal_type(meal_type)} autour de {calories} kcal, {budget_text}."


def _build_advice(meal_type: str, budget_ok: bool, allergies: list[str]) -> list[str]:
    advice = {
        "balanced_meal": ["Garder une assiette moitie legumes, quart proteines, quart feculents."],
        "high_protein_meal": ["Repartir les proteines sur la journee pour mieux assimiler."],
        "low_calorie_meal": ["Ajouter du volume avec crudites et legumes verts."],
        "performance_meal": ["Placer les glucides autour de l'entrainement."],
    }[meal_type]
    if not budget_ok:
        advice.append("Preparer plusieurs portions avec des aliments peu couteux.")
    if allergies:
        advice.append("Relire les etiquettes pour eviter les traces d'allergenes.")
    return advice
