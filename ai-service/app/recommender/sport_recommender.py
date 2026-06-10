"""
Module 4 — Recommandations sportives personnalisées
Modèle : RandomForestClassifier (accuracy 100%)
Dataset : synthétique (1000 profils, 5 classes)
"""

import os
import pandas as pd
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "../../data/models")

model = joblib.load(os.path.join(MODEL_DIR, "sport_model.joblib"))
le_objectif = joblib.load(os.path.join(MODEL_DIR, "sport_le_objectif.joblib"))
le_niveau = joblib.load(os.path.join(MODEL_DIR, "sport_le_niveau.joblib"))
le_materiel = joblib.load(os.path.join(MODEL_DIR, "sport_le_materiel.joblib"))
le_label = joblib.load(os.path.join(MODEL_DIR, "sport_le_label.joblib"))

SPORT_EXAMPLES = {
    "cardio_beginner": ["Marche rapide 30min", "Vélo doux 20min", "Natation débutant", "Yoga flow"],
    "strength_full_body": ["Squats 3x12", "Pompes 3x15", "Tractions 3x8", "Fentes 3x12"],
    "mobility_recovery": ["Étirements 20min", "Yoga restauratif", "Marche légère 15min", "Respiration profonde"],
    "endurance_plan": ["Course 45min", "Vélo 60min", "Natation 1km", "HIIT 30min"],
    "muscle_gain_plan": ["Développé couché 4x8", "Soulevé de terre 4x6", "Rowing barre 4x10", "Presse jambes 4x12"]
}


def recommend_sport(user_profile: dict) -> dict:
    """
    Recommande un programme sportif selon le profil utilisateur.

    Args:
        user_profile: dict avec objectif, niveau, duree_min, materiel, fatigue, limitation_physique

    Returns:
        dict avec programme recommandé, score de confiance et exercices suggérés
    """
    objectif = user_profile.get("objectif", "sante_generale")
    niveau = user_profile.get("niveau", "debutant")
    materiel = user_profile.get("materiel", "aucun")
    duree_min = user_profile.get("duree_min", 30)
    fatigue = user_profile.get("fatigue", 5)
    limitation_physique = user_profile.get("limitation_physique", 0)
    age = user_profile.get("age", 30)
    poids_kg = user_profile.get("poids_kg", 70)

    try:
        objectif_encoded = le_objectif.transform([objectif])[0]
    except:
        objectif_encoded = 0

    try:
        niveau_encoded = le_niveau.transform([niveau])[0]
    except:
        niveau_encoded = 0

    try:
        materiel_encoded = le_materiel.transform([materiel])[0]
    except:
        materiel_encoded = 0

    features = pd.DataFrame(
        [[age, poids_kg, objectif_encoded, niveau_encoded,
          duree_min, materiel_encoded, fatigue, limitation_physique]],
        columns=["age", "poids_kg", "objectif_encoded", "niveau_encoded",
                 "duree_min", "materiel_encoded", "fatigue", "limitation_physique"]
    )

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = round(float(max(probabilities)), 4)
    label = le_label.inverse_transform([prediction])[0]

    return {
        "recommended_program": label,
        "score": confidence,
        "exercises": SPORT_EXAMPLES.get(label, []),
        "duration_min": duree_min
    }
