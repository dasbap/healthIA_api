"""
Tests unitaires — Module 4 : Recommandations sportives
"""

import pytest
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from app.recommender.sport_recommender import recommend_sport


def test_recommend_returns_dict():
    """La fonction retourne bien un dictionnaire"""
    profile = {"objectif": "sante_generale", "niveau": "debutant", "fatigue": 3, "limitation_physique": 0}
    result = recommend_sport(profile)
    assert isinstance(result, dict)


def test_recommend_has_required_keys():
    """Le résultat contient les clés attendues"""
    profile = {"objectif": "sante_generale", "niveau": "debutant", "fatigue": 3, "limitation_physique": 0}
    result = recommend_sport(profile)
    assert "recommended_program" in result
    assert "score" in result
    assert "exercises" in result


def test_recommend_score_between_0_and_1():
    """Le score de confiance est entre 0 et 1"""
    profile = {"objectif": "sante_generale", "niveau": "debutant", "fatigue": 3, "limitation_physique": 0}
    result = recommend_sport(profile)
    assert 0 <= result["score"] <= 1


def test_recommend_high_fatigue():
    """Une fatigue élevée recommande mobility_recovery"""
    profile = {"objectif": "sante_generale", "niveau": "intermediaire",
               "fatigue": 9, "limitation_physique": 0, "age": 30, "poids_kg": 70,
               "duree_min": 30, "materiel": "aucun"}
    result = recommend_sport(profile)
    assert result["recommended_program"] == "mobility_recovery"


def test_recommend_limitation_physique():
    """Une limitation physique recommande mobility_recovery"""
    profile = {"objectif": "prise_de_masse", "niveau": "avance",
               "fatigue": 3, "limitation_physique": 1, "age": 25, "poids_kg": 80,
               "duree_min": 60, "materiel": "salle"}
    result = recommend_sport(profile)
    assert result["recommended_program"] == "mobility_recovery"


def test_recommend_muscle_gain():
    """Un objectif prise de masse recommande muscle_gain_plan"""
    profile = {"objectif": "prise_de_masse", "niveau": "intermediaire",
               "fatigue": 3, "limitation_physique": 0, "age": 24, "poids_kg": 80,
               "duree_min": 60, "materiel": "salle"}
    result = recommend_sport(profile)
    assert result["recommended_program"] == "muscle_gain_plan"


def test_recommend_exercises_not_empty():
    """La liste d'exercices n'est pas vide"""
    profile = {"objectif": "sante_generale", "niveau": "debutant", "fatigue": 3, "limitation_physique": 0}
    result = recommend_sport(profile)
    assert len(result["exercises"]) > 0
