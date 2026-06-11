import pandas as pd
import os

# Chargement du dataset nettoyé
DATA_PATH = os.path.join(os.path.dirname(__file__), "../../data/processed/nutrition_clean.csv")
df = pd.read_csv(DATA_PATH)


def estimate_nutrition(detected_foods: list, portion: str = "standard") -> dict:
    """
    Estime les apports nutritionnels à partir d'une liste d'aliments détectés.

    Args:
        detected_foods: liste de labels détectés par le Module 1
        portion: "standard" (100g par défaut)

    Returns:
        dict avec calories, macros et déséquilibres détectés
    """
    results = []

    for food_label in detected_foods:
        matches = df[df['Food'].str.lower().str.contains(food_label.lower(), na=False)]

        if not matches.empty:
            row = matches.iloc[0]
            grams = row['Grams'] if row['Grams'] > 0 else 100
            factor = 100 / grams

            results.append({
                "food": food_label,
                "found_as": row['Food'],
                "calories_per_100g": round(row['Calories'] * factor, 1),
                "protein_per_100g": round(row['Protein'] * factor, 1),
                "carbs_per_100g": round(row['Carbs'] * factor, 1),
                "fat_per_100g": round(row['Fat'] * factor, 1),
                "fiber_per_100g": round(row['Fiber'] * factor, 1),
            })
        else:
            results.append({
                "food": food_label,
                "found_as": None,
                "calories_per_100g": None,
                "protein_per_100g": None,
                "carbs_per_100g": None,
                "fat_per_100g": None,
                "fiber_per_100g": None,
            })

    found = [r for r in results if r['calories_per_100g'] is not None]

    if not found:
        return {"error": "Aucun aliment reconnu dans la base nutritionnelle"}

    total_calories = sum(r['calories_per_100g'] for r in found)
    total_protein = sum(r['protein_per_100g'] for r in found)
    total_carbs = sum(r['carbs_per_100g'] for r in found)
    total_fat = sum(r['fat_per_100g'] for r in found)

    return {
        "detected_foods": results,
        "totals": {
            "calories": round(total_calories, 1),
            "protein_g": round(total_protein, 1),
            "carbs_g": round(total_carbs, 1),
            "fat_g": round(total_fat, 1),
        }
    }


def detect_imbalances(totals: dict, user_goal: str = "equilibre") -> list:
    """
    Détecte les déséquilibres nutritionnels selon l'objectif utilisateur.

    Args:
        totals: dict avec calories, protein_g, carbs_g, fat_g
        user_goal: "perte_de_poids", "prise_de_masse", "equilibre"

    Returns:
        liste de déséquilibres détectés
    """
    imbalances = []

    calories = totals["calories"]
    protein = totals["protein_g"]
    carbs = totals["carbs_g"]
    fat = totals["fat_g"]

    if user_goal == "perte_de_poids":
        if calories > 400:
            imbalances.append("Repas trop calorique pour un objectif de perte de poids")
        if carbs > 50:
            imbalances.append("Glucides élevés — à réduire pour la perte de poids")
        if fat > 15:
            imbalances.append("Lipides élevés")

    elif user_goal == "prise_de_masse":
        if protein < 20:
            imbalances.append("Apport en protéines insuffisant pour la prise de masse")
        if calories < 500:
            imbalances.append("Apport calorique insuffisant pour la prise de masse")

    else:
        if protein < 10:
            imbalances.append("Manque de protéines")
        if carbs > 60:
            imbalances.append("Glucides élevés")
        if fat > 20:
            imbalances.append("Lipides élevés")

    if not imbalances:
        imbalances.append("Repas équilibré selon votre objectif")

    return imbalances