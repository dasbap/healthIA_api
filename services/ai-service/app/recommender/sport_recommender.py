def recommend_sport(payload) -> dict:
    focus = {
        "fat_loss": "cardio modere + renforcement full body",
        "endurance": "course, velo ou rameur en progressif",
        "strength": "mouvements polyarticulaires controles",
        "mobility": "mobilite active et gainage doux",
    }[payload.goal]
    plan = []
    for index in range(payload.sessionsPerWeek):
        plan.append(
            {
                "day": f"session_{index + 1}",
                "focus": focus,
                "duration": "35-50 min" if payload.level == "beginner" else "50-70 min",
            }
        )
    safety_notes = ["Echauffement 8-10 min", "Arreter en cas de douleur inhabituelle"]
    if payload.limitations:
        safety_notes.append("Adapter les exercices aux limitations declarees.")
    return {"weeklyPlan": plan, "safetyNotes": safety_notes, "fallbackUsed": True}
