from app.schemas.sport_schema import SportRecommendationRequest

MODEL_NAME = "healthai-sport-recommender-v1"
FALLBACK_MODEL_NAME = "healthai-sport-fallback-v1"

SPORT_EXAMPLES = {
    "cardio_beginner": [
        ("Marche rapide", "Rythme respiratoire confortable."),
        ("Velo doux", "Cadence reguliere sans essoufflement excessif."),
        ("Renforcement leger", "Squats assistes ou assis-debout."),
        ("Retour au calme", "Respiration lente et mobilite douce."),
    ],
    "strength_full_body": [
        ("Squats", "Controle du mouvement et dos neutre."),
        ("Pompes adaptees", "Sur genoux si necessaire."),
        ("Fentes", "Amplitude stable et genou aligne."),
        ("Gainage", "Series courtes, qualite prioritaire."),
    ],
    "mobility_recovery": [
        ("Mobilite articulaire", "Amplitude douce, sans douleur."),
        ("Yoga restauratif", "Respiration calme et postures faciles."),
        ("Marche legere", "Allure tres confortable."),
        ("Etirements", "Maintenir sans forcer."),
    ],
    "endurance_plan": [
        ("Course ou velo continu", "Zone d'effort moderee."),
        ("Intervalles courts", "Alternance effort/recuperation."),
        ("Renforcement tronc", "Stabilite et prevention blessures."),
        ("Retour au calme", "Baisse progressive du rythme."),
    ],
    "muscle_gain_plan": [
        ("Developpe couche ou pompes lestables", "Series de 6 a 10 reps."),
        ("Souleve de terre adapte", "Charge progressive et technique stricte."),
        ("Rowing", "Tirer avec le dos, epaules basses."),
        ("Presse jambes ou squats", "Progression graduelle."),
    ],
}


def build_sport_recommendation(
    payload: SportRecommendationRequest,
    recommendation_id: str,
    created_at: str,
) -> dict:
    goal = _normalize_goal(payload.normalized_goal)
    level = _normalize_level(payload.level)
    duration = payload.normalized_duration
    sessions = payload.normalized_sessions_per_week
    material = _normalize_material(payload.equipment)
    limitations = payload.normalized_limitations
    fatigue_score = _fatigue_score(payload.fatigue)
    has_limitations = bool(limitations)

    program_type = _assign_program_type(goal, level, fatigue_score, has_limitations)
    intensity = _intensity_for_program(program_type, fatigue_score)
    exercises = _build_exercises(program_type, duration, intensity)
    precautions = _build_precautions(program_type, limitations, fatigue_score)
    score = _score_program(program_type, level, material, has_limitations, fatigue_score)
    score_label = _score_label(score)
    title = _title_for_program(program_type)
    summary = _summary_for_program(program_type, duration, sessions, intensity)
    warning = precautions[0] if precautions else None

    return {
        "recommendationId": recommendation_id,
        "id": recommendation_id,
        "userId": payload.normalized_user_id,
        "type": "sport",
        "title": title,
        "score": score,
        "scoreLabel": score_label,
        "summary": summary,
        "duration": duration,
        "durationMinutes": duration,
        "sessionsPerWeek": sessions,
        "intensity": intensity,
        "exercises": exercises,
        "explanation": (
            "Moteur sport HealthAI issu des regles du notebook Module 4 : objectif, niveau, "
            "duree, fatigue, materiel et limitations determinent le programme. Aucun modele "
            "ML entraine n'est charge au runtime."
        ),
        "precautions": precautions,
        "warning": warning,
        "model": MODEL_NAME,
        "createdAt": created_at,
        "fallbackUsed": False,
    }


def build_sport_fallback(
    payload: SportRecommendationRequest,
    recommendation_id: str,
    created_at: str,
    reason: str,
) -> dict:
    duration = payload.normalized_duration
    sessions = payload.normalized_sessions_per_week
    exercises = _build_exercises("cardio_beginner", duration, "low")
    precautions = [reason, "Arreter en cas de douleur inhabituelle."]
    return {
        "recommendationId": recommendation_id,
        "id": recommendation_id,
        "userId": payload.normalized_user_id,
        "type": "sport",
        "title": "Programme de secours bas impact",
        "score": 0.70,
        "scoreLabel": "A verifier",
        "summary": "Fallback backend utilise car le moteur sport principal a echoue.",
        "duration": duration,
        "durationMinutes": duration,
        "sessionsPerWeek": sessions,
        "intensity": "low",
        "exercises": exercises,
        "explanation": f"Fallback sport actif : {reason}",
        "precautions": precautions,
        "warning": precautions[0],
        "model": FALLBACK_MODEL_NAME,
        "createdAt": created_at,
        "fallbackUsed": True,
    }


def _assign_program_type(goal: str, level: str, fatigue_score: int, has_limitations: bool) -> str:
    if has_limitations or fatigue_score >= 8:
        return "mobility_recovery"
    if goal == "prise_de_masse":
        return "muscle_gain_plan"
    if goal == "endurance" and level != "debutant":
        return "endurance_plan"
    if level == "debutant" or goal in {"sante_generale", "perte_de_graisse"}:
        return "cardio_beginner"
    return "strength_full_body"


def _normalize_goal(value: str) -> str:
    normalized = _normalize_text(value)
    if any(token in normalized for token in ["masse", "muscle", "strength", "gain"]):
        return "prise_de_masse"
    if "endurance" in normalized:
        return "endurance"
    if any(token in normalized for token in ["sante", "health", "mobilite", "mobility"]):
        return "sante_generale"
    if any(token in normalized for token in ["perte", "fat_loss", "graisse", "weight_loss"]):
        return "perte_de_graisse"
    return "sante_generale"


def _normalize_level(value: str) -> str:
    normalized = _normalize_text(value)
    if any(token in normalized for token in ["avance", "advanced"]):
        return "avance"
    if any(token in normalized for token in ["intermediaire", "medium"]):
        return "intermediaire"
    return "debutant"


def _normalize_material(values: list[str] | str) -> str:
    terms = _normalize_terms(values)
    joined = " ".join(terms)
    if any(token in joined for token in ["salle", "gym", "machine", "barre"]):
        return "salle"
    if any(token in joined for token in ["domicile", "maison", "tapis", "halteres", "home"]):
        return "domicile"
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


def _fatigue_score(value: str) -> int:
    normalized = _normalize_text(value)
    if normalized.isdigit():
        return max(1, min(int(normalized), 10))
    if any(token in normalized for token in ["elevee", "high", "forte"]):
        return 8
    if any(token in normalized for token in ["faible", "low", "basse"]):
        return 3
    return 5


def _intensity_for_program(program_type: str, fatigue_score: int) -> str:
    if program_type == "mobility_recovery" or fatigue_score >= 8:
        return "low"
    if program_type in {"endurance_plan", "muscle_gain_plan", "strength_full_body"}:
        return "high"
    return "medium"


def _build_exercises(program_type: str, duration: int, intensity: str) -> list[dict]:
    examples = SPORT_EXAMPLES[program_type]
    warmup = max(5, round(duration * 0.20))
    cooldown = max(3, round(duration * 0.12))
    remaining = max(8, duration - warmup - cooldown)
    main_each = max(4, round(remaining / 2))
    durations = [warmup, main_each, max(4, remaining - main_each), cooldown]

    return [
        {"name": name, "duration": durations[index], "intensity": "low" if index in {0, 3} else intensity, "note": note}
        for index, (name, note) in enumerate(examples)
    ]


def _build_precautions(program_type: str, limitations: list[str], fatigue_score: int) -> list[str]:
    precautions = ["Echauffement obligatoire et hydratation reguliere."]
    if limitations:
        precautions.append("Limitations declarees prises en compte : reduire l'amplitude et eviter la douleur.")
    if fatigue_score >= 8:
        precautions.append("Fatigue elevee : garder une intensite basse et privilegier la recuperation.")
    if program_type == "muscle_gain_plan":
        precautions.append("Augmenter les charges progressivement, sans sacrifier la technique.")
    return precautions


def _score_program(program_type: str, level: str, material: str, has_limitations: bool, fatigue_score: int) -> float:
    base_scores = {
        "cardio_beginner": 0.86,
        "strength_full_body": 0.87,
        "mobility_recovery": 0.84,
        "endurance_plan": 0.89,
        "muscle_gain_plan": 0.90,
    }
    score = base_scores[program_type]
    if material != "aucun":
        score += 0.02
    if has_limitations:
        score -= 0.03
    if fatigue_score >= 8:
        score -= 0.02
    if level == "avance" and program_type == "cardio_beginner":
        score -= 0.05
    return round(max(0.60, min(score, 0.95)), 2)


def _score_label(score: float) -> str:
    if score >= 0.85:
        return "Tres adapte"
    if score >= 0.70:
        return "Adapte"
    return "A verifier"


def _title_for_program(program_type: str) -> str:
    return {
        "cardio_beginner": "Programme cardio debutant",
        "strength_full_body": "Renforcement full body",
        "mobility_recovery": "Mobilite et recuperation",
        "endurance_plan": "Plan endurance progressif",
        "muscle_gain_plan": "Programme prise de masse",
    }[program_type]


def _summary_for_program(program_type: str, duration: int, sessions: int, intensity: str) -> str:
    return f"{_title_for_program(program_type)} : {sessions} seances/semaine, {duration} min, intensite {intensity}."
