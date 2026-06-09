# HealthAI Coach - AI Service

Microservice FastAPI pour analyse de repas, recommandations nutrition/sport, historique, detail, feedback et observabilite.

## Run with Docker

```bash
docker compose up --build ai-service
```

Swagger est disponible sur `http://localhost:8000/docs`.
Le fichier OpenAPI exporte est `services/ai-service/openapi.json`.

Run tests through Docker:

```bash
docker compose run --rm ai-service pytest
```

Export OpenAPI:

```bash
python scripts/export_openapi.py
```

## Environment

```env
AI_SERVICE_ENVIRONMENT=docker
AI_SERVICE_HOST_PORT=8000
AI_SERVICE_MONGO_URI=mongodb://root:rootpassword@mongodb:27017
AI_SERVICE_MONGO_DB=healthia
AI_SERVICE_MONGO_TIMEOUT_MS=1200
AI_SERVICE_MONGO_ENABLED=true
AI_SERVICE_SERVICE_TOKEN=
AI_SERVICE_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
AI_SERVICE_INSTALL_VISION=false
VISION_ENABLED=false
VISION_MODEL_NAME=nateraw/food
VISION_DEVICE=cpu
```

Si MongoDB est indisponible, l'API repond avec un stockage memoire de secours. Quand `AI_SERVICE_SERVICE_TOKEN` est renseigne, les routes `/ai/*` exigent le header `X-Service-Token`.

## Dependencies

`requirements.txt` installe uniquement l'API de base :

- `python-multipart` pour recevoir les uploads FastAPI en `multipart/form-data` ;
- `pillow` pour valider les images JPEG, PNG et WebP avant analyse ;
- `httpx` et `pytest` pour les tests API ;
- FastAPI, Uvicorn, Motor et Pydantic Settings pour le service.

`requirements-vision.txt` garde les dependances lourdes optionnelles :

- `torch` ;
- `transformers`.

Docker n'installe pas `requirements-vision.txt` tant que `AI_SERVICE_INSTALL_VISION=false`.

Installation locale de base :

```bash
cd services/ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Installation locale de la vraie vision :

```bash
pip install -r requirements-vision.txt
```

## Optional meal vision model

L'analyse repas peut utiliser un classifieur local ou Hugging Face compatible `transformers` si les dependances vision sont installees. Par defaut, Docker garde ce mode desactive pour une demo rapide et stable.

Modele par defaut :

```text
nateraw/food
```

Il peut etre remplace avec `VISION_MODEL_NAME`.

Activer le modele local :

```env
AI_SERVICE_INSTALL_VISION=true
AI_SERVICE_VISION_MODEL_ID=nateraw/food
VISION_ENABLED=true
VISION_MODEL_NAME=nateraw/food
VISION_DEVICE=cpu
```

Le modele est stocke dans :

```text
services/ai-service/app/models/meal_image_analyzer
```

Si le modele ou les dependances sont absents, le service utilise `fallbackUsed=true`. `/health` expose `vision.enabled`, `vision.modelAvailable`, `vision.uploadSupported`, `vision.urlSupported` et le statut des dependances.

Le fichier upload est lu en memoire, valide par Pillow, limite a 8 Mo et n'est pas sauvegarde sur disque.

Configuration locale :

```bash
cat > .env <<'EOF'
VISION_ENABLED=true
VISION_DEVICE=cpu
VISION_MODEL_NAME=nateraw/food
EOF
```

Lancement :

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verification :

```bash
curl http://localhost:8000/health
```

Test upload image :

```bash
curl -X POST http://localhost:8000/ai/meal/analyze \
  -F "userId=demo-user" \
  -F "file=@/chemin/vers/photo.jpg"
```

L'API utilise la vraie vision quand `/health` affiche `torch=true`, `transformers=true`, `modelAvailable=true` et `enabled=true`. Sinon elle reste disponible avec le fallback.

Les calories et macronutriments proviennent d'un mapping approximatif apres classification alimentaire. Ce n'est pas une estimation medicale precise.

## NoSQL collections

`users`: managed by the main NestJS API.

`meal_analyses`: stores meal image analysis results.

Example:

```json
{
  "userId": "user_123",
  "imageUrl": "https://example.com/salad.jpg",
  "detectedFoods": [{ "name": "salade composee", "calories": 240 }],
  "totalCalories": 460,
  "fallbackUsed": true,
  "createdAt": "2026-06-05T10:00:00Z"
}
```

`recommendations`: stores nutrition and sport recommendations.

```json
{
  "userId": "user_123",
  "type": "nutrition",
  "payload": { "dailyCalories": 1960 },
  "createdAt": "2026-06-05T10:00:00Z"
}
```

`feedbacks`: stores user feedback on recommendations.

```json
{
  "userId": "user_123",
  "recommendationId": "rec_123",
  "rating": 5,
  "comment": "Useful plan",
  "createdAt": "2026-06-05T10:00:00Z"
}
```

`ai_logs`: stores internal AI events for traceability.

## Main endpoints

`GET /health`

`GET /metrics`

`POST /ai/meal/analyze`

```json
{
  "userId": "user_123",
  "imageUrl": "https://example.com/salad.jpg",
  "notes": "salad and chicken"
}
```

Ou en multipart :

```text
userId=user_123
file=@repas.png
notes=salad and chicken
```

`POST /ai/nutrition/recommend`

```json
{
  "userId": "user_123",
  "age": 29,
  "sex": "female",
  "heightCm": 168,
  "weightKg": 64,
  "goal": "maintain",
  "activityLevel": "moderate",
  "dietaryRestrictions": ["vegetarian"]
}
```

`POST /ai/sport/recommend`

```json
{
  "userId": "user_123",
  "age": 31,
  "goal": "strength",
  "level": "beginner",
  "sessionsPerWeek": 3,
  "limitations": []
}
```

`GET /ai/recommendations/{userId}`

`GET /ai/recommendations/detail/{recommendationId}`

`POST /ai/recommendations/{recommendationId}/feedback`

```json
{
  "userId": "user_123",
  "recommendationId": "rec_123",
  "rating": 5,
  "comment": "Useful plan"
}
```
