"""
Tests unitaires — Module 1 : Analyse de photo de repas
"""

import pytest
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from app.recommender.meal_image_analyzer import analyze_meal_image

# Image de test
TEST_IMAGE_DIR = os.path.join(os.path.dirname(__file__), "../../data/raw/nutrition/Food Types.v3i.folder/test")


def get_test_image(class_name: str) -> str:
    class_path = os.path.join(TEST_IMAGE_DIR, class_name)
    images = os.listdir(class_path)
    return os.path.join(class_path, images[0])


def test_analyze_returns_dict():
    """La fonction retourne bien un dictionnaire"""
    image_path = get_test_image("banana")
    result = analyze_meal_image(image_path)
    assert isinstance(result, dict)


def test_analyze_has_detected_foods_key():
    """Le résultat contient la clé detected_foods"""
    image_path = get_test_image("banana")
    result = analyze_meal_image(image_path)
    assert "detected_foods" in result


def test_analyze_returns_top_3():
    """Le résultat contient bien 3 prédictions"""
    image_path = get_test_image("banana")
    result = analyze_meal_image(image_path)
    assert len(result["detected_foods"]) == 3


def test_analyze_confidence_between_0_and_1():
    """Les scores de confiance sont entre 0 et 1"""
    image_path = get_test_image("banana")
    result = analyze_meal_image(image_path)
    for food in result["detected_foods"]:
        assert 0 <= food["confidence"] <= 1


def test_analyze_banana_correct():
    """Le modèle détecte correctement une banane"""
    image_path = get_test_image("banana")
    result = analyze_meal_image(image_path)
    top_label = result["detected_foods"][0]["label"]
    assert top_label == "banana"


def test_analyze_fallback_on_invalid_path():
    """La fonction gère proprement un chemin invalide"""
    result = analyze_meal_image("chemin/inexistant.jpg")
    assert "error" in result or "fallback" in result