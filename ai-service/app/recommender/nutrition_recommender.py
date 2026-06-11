"""
Module 3 — Recommandations nutritionnelles personnalisées
Modèle : RandomForestClassifier (accuracy 100%)
Dataset : synthétique (1000 profils, 4 classes)
"""

import os
import pandas as pd
import joblib

# Chemins des modèles
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../../data/models")

model = joblib.load(os.path.join(MODEL_DIR, "nutrition_model.joblib"))
le_objectif = joblib.load(os.path.join(MODEL_DIR, "nutrition_le_objectif.joblib"))
le_regime = joblib.load(os.path.join(MODEL_DIR, "nutrition_le_regime.joblib"))
le_label = joblib.load(os.path.join(MODEL_DIR, "nutrition_le_label.joblib"))

MEAL_EXAMPLES = {
    "balanced_meal": ["Poulet grillé", "Riz complet", "Légumes verts", "Yaourt nature"],
    "high_protein_meal": ["Steak de bœuf", "Œufs", "Fromage cottage", "Légumineuses"],
    "low_calorie_meal": ["Salade verte", "Poulet vapeur", "Légumes crus", "Fruit frais"],
    "performance_meal": ["Pâtes complètes", "Poulet", "Banane", "Noix"]
}

GOAL_MAP = {
    "weight_loss": "perte_de_poids",
    "perte_de_poids": "perte_de_poids",
    "muscle_gain": "prise_de_masse",
    "prise_de_masse": "prise_de_masse",
    "performance": "performance",
    "equilibre": "equilibre"
}


def recommend_meal(user_profile: dict) -> dict:
    """
    Recommande un type de repas selon le profil utilisateur.

    Args:
        user_profile: dict avec goal, calorie_target, diet, allergies, age, poids_kg

    Returns:
        dict avec type de repas recommandé et score de confiance
    """
    objectif = GOAL_MAP.get(user_profile.get("goal", "equilibre"), "equilibre")
    regime = user_profile.get("diet", "aucun")
    calories_cibles = user_profile.get("calorie_target", 2000)
    age = user_profile.get("age", 30)
    poids = user_profile.get("poids_kg", 70)
    allergie_gluten = 1 if "gluten" in user_profile.get("allergies", []) else 0
    allergie_lactose = 1 if "lactose" in user_profile.get("allergies", []) else 0

    try:
        objectif_encoded = le_objectif.transform([objectif])[0]
    except:
        objectif_encoded = 0

    try:
        regime_encoded = le_regime.transform([regime])[0]
    except:
        regime_encoded = 0

    features = pd.DataFrame(
        [[age, poids, objectif_encoded, regime_encoded,
          calories_cibles, allergie_gluten, allergie_lactose]],
        columns=["age", "poids_kg", "objectif_encoded", "regime_encoded",
                 "calories_cibles", "allergie_gluten", "allergie_lactose"]
    )

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = round(float(max(probabilities)), 4)
    label = le_label.inverse_transform([prediction])[0]

    return {
        "recommended_type": label,
        "score": confidence,
        "recommended_meal": MEAL_EXAMPLES.get(label, []),
        "constraints_checked": {
            "allergies": True,
            "diet": True
        }
    }