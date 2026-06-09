import pytest
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from app.recommender.nutrition_estimator import estimate_nutrition, detect_imbalances


def test_estimate_returns_dict():
    """La fonction retourne bien un dictionnaire"""
    result = estimate_nutrition(["banana"])
    assert isinstance(result, dict)


def test_estimate_has_totals_key():
    """Le résultat contient la clé totals"""
    result = estimate_nutrition(["banana"])
    assert "totals" in result


def test_estimate_banana_has_calories():
    """La banane a des calories"""
    result = estimate_nutrition(["banana"])
    assert result["totals"]["calories"] > 0


def test_estimate_unknown_food():
    """Un aliment inconnu retourne une erreur propre"""
    result = estimate_nutrition(["xyzunknownfood123"])
    assert "error" in result


def test_detect_imbalances_returns_list():
    """detect_imbalances retourne une liste"""
    totals = {"calories": 300, "protein_g": 5, "carbs_g": 30, "fat_g": 10}
    result = detect_imbalances(totals)
    assert isinstance(result, list)


def test_detect_imbalances_high_calories():
    """Détecte les calories trop élevées pour perte de poids"""
    totals = {"calories": 800, "protein_g": 5, "carbs_g": 30, "fat_g": 10}
    result = detect_imbalances(totals, user_goal="perte_de_poids")
    assert any("calorique" in i for i in result)


def test_detect_imbalances_equilibre():
    """Un repas équilibré ne génère pas d'alerte"""
    totals = {"calories": 300, "protein_g": 15, "carbs_g": 30, "fat_g": 10}
    result = detect_imbalances(totals, user_goal="equilibre")
    assert any("équilibré" in i for i in result)