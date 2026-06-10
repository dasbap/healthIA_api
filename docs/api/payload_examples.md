# Exemples de payloads API IA

## Recommandation nutrition

Requete :

```json
{
  "userId": "demo-user",
  "goal": "perte de graisse",
  "targetCalories": 560,
  "budget": 65,
  "diet": "omnivore",
  "allergies": "Noisettes",
  "preferences": "repas rapides, legumes verts, poulet"
}
```

Reponse :

```json
{
  "recommendationId": "rec_nutrition_xxxxx",
  "type": "nutrition",
  "title": "Repas equilibre pour objectif personnalise",
  "score": 0.87,
  "mealPlan": ["Construire les repas autour de poulet, oeufs, yaourt grec ou poisson."],
  "macros": { "calories": 560, "protein": 42, "carbs": 59, "fat": 16 },
  "constraintsChecked": { "allergies": true, "diet": true, "budget": true },
  "fallbackUsed": true
}
```

## Recommandation sport

```json
{
  "userId": "demo-user",
  "goal": "perte de graisse",
  "level": "debutant",
  "duration": 30,
  "equipment": "tapis de sol",
  "limitations": "genou droit sensible",
  "preferences": "bas impact, marche rapide",
  "fatigue": "moderee"
}
```

## Analyse repas

Par URL :

```json
{
  "userId": "demo-user",
  "imageUrl": "https://example.com/salad.jpg",
  "notes": "salad and chicken"
}
```

Par fichier :

```text
multipart/form-data
userId=demo-user
file=@repas.png
fileName=repas.png
notes=assiette de midi
```

Formats acceptes : JPEG, PNG, WebP, 8 Mo maximum.

Exemple curl :

```bash
curl -X POST http://localhost:8000/ai/meal/analyze \
  -F "userId=demo-user" \
  -F "file=@repas.png"
```

Reponse :

```json
{
  "id": "rec_meal_xxxxx",
  "analysisId": "rec_meal_xxxxx",
  "type": "meal-analysis",
  "title": "Analyse repas par image",
  "score": 0.78,
  "detectedFoods": [{ "label": "salade composee", "confidence": 0.82 }],
  "estimatedCalories": 460,
  "macros": { "proteins": 40, "carbs": 22, "fats": 20 },
  "nutrition": { "calories": 460, "protein": 40, "carbs": 22, "fat": 20 },
  "warnings": ["Repas globalement equilibre"],
  "imbalances": ["Repas globalement equilibre"],
  "explanation": "Analyse estimee depuis la source recue.",
  "model": "healthai-vision-fallback-v1",
  "createdAt": "2026-06-09T10:00:00Z",
  "fallbackUsed": true
}
```

Si `fallbackUsed=true`, le backend a bien recu et valide l'image, mais le vrai modele vision local n'est pas actif.

Si `VISION_ENABLED=true` et que `torch`, `transformers` et le modele sont disponibles, la meme route peut retourner :

```json
{
  "id": "rec_meal_xxxxx",
  "analysisId": "rec_meal_xxxxx",
  "type": "meal-analysis",
  "title": "Analyse repas par image",
  "score": 0.87,
  "detectedFoods": [{ "label": "spaghetti", "confidence": 0.87 }],
  "estimatedCalories": 520,
  "macros": { "proteins": 18, "carbs": 80, "fats": 14 },
  "nutrition": { "calories": 520, "protein": 18, "carbs": 80, "fat": 14 },
  "warnings": ["Glucides eleves"],
  "imbalances": ["Glucides eleves"],
  "explanation": "Analyse image realisee par modele local depuis fichier image recu.",
  "model": "nateraw/food",
  "createdAt": "2026-06-10T10:00:00Z",
  "fallbackUsed": false
}
```

## Historique et detail

```bash
curl http://localhost:8000/ai/recommendations/demo-user
curl http://localhost:8000/ai/recommendations/detail/rec_nutrition_xxxxx
```

## Feedback

```json
{
  "rating": 4,
  "comment": "Recommandation utile"
}
```

Reponse :

```json
{
  "message": "Feedback enregistre",
  "recommendationId": "rec_nutrition_xxxxx",
  "status": "received",
  "ok": true
}
```

## Exemple d'erreur

```json
{
  "detail": "Recommandation introuvable."
}
```
