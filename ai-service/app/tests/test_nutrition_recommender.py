"""
Tests unitaires — Module 3 : Recommandations nutritionnelles
"""

import pytest
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from app.recommender.nutrition_recommender import recommend_meal


def test_recommend_returns_dict():
    """La fonction retourne bien un dictionnaire"""
    profile = {"goal": "equilibre", "calorie_target": 2000, "diet": "aucun", "allergies": []}
    result = recommend_meal(profile)
    assert isinstance(result, dict)


def test_recommend_has_required_keys():
    """Le résultat contient les clés attendues"""
    profile = {"goal": "equilibre", "calorie_target": 2000, "diet": "aucun", "allergies": []}
    result = recommend_meal(profile)
    assert "recommended_type" in result
    assert "score" in result
    assert "recommended_meal" in result


def test_recommend_score_between_0_and_1():
    """Le score de confiance est entre 0 et 1"""
    profile = {"goal": "equilibre", "calorie_target": 2000, "diet": "aucun", "allergies": []}
    result = recommend_meal(profile)
    assert 0 <= result["score"] <= 1


def test_recommend_weight_loss():
    """Un objectif perte de poids recommande low_calorie_meal"""
    profile = {"goal": "weight_loss", "calorie_target": 1400, "diet": "aucun", "allergies": [], "age": 30, "poids_kg": 75}
    result = recommend_meal(profile)
    assert result["recommended_type"] == "low_calorie_meal"


def test_recommend_muscle_gain():
    """Un objectif prise de masse recommande high_protein_meal"""
    profile = {"goal": "muscle_gain", "calorie_target": 2800, "diet": "aucun", "allergies": [], "age": 25, "poids_kg": 80}
    result = recommend_meal(profile)
    assert result["recommended_type"] == "high_protein_meal"


def test_recommend_meal_list_not_empty():
    """La liste de repas recommandés n'est pas vide"""
    profile = {"goal": "equilibre", "calorie_target": 2000, "diet": "aucun", "allergies": []}
    result = recommend_meal(profile)
    assert len(result["recommended_meal"]) > 0