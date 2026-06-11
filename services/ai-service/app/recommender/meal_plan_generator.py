def generate_meal_plan(calories: int, restrictions: list[str]) -> list[str]:
    protein = "tofu, oeufs ou poisson" if restrictions else "poulet, oeufs, yaourt grec ou poisson"
    return [
        f"Construire les repas autour de {protein}.",
        f"Viser environ {round(calories / 3)} kcal sur les repas principaux.",
        "Ajouter une portion de legumes a chaque repas.",
    ]
