def detect_nutrition_imbalances(restrictions: list[str], goal: str) -> list[str]:
    notes = []
    if "vegetarian" in restrictions or "vegan" in restrictions:
        notes.append("Surveiller les apports en proteines, fer et vitamine B12.")
    if goal == "lose_weight":
        notes.append("Prioriser les aliments rassasiants et limiter les calories liquides.")
    if goal == "gain_muscle":
        notes.append("Repartir les proteines sur 3 a 4 repas.")
    return notes
