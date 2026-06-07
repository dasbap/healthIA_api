# HealthIA AI Service

FastAPI microservice for meal photo analysis, nutrition recommendations, sport recommendations, recommendation history and feedback.

## Run with Docker

```bash
docker compose up --build ai-service
```

Swagger is available at `http://localhost:8001/docs`.

Run tests through Docker:

```bash
docker compose run --rm ai-service pytest
```

## Environment

```env
AI_SERVICE_MONGO_URI=mongodb://root:rootpassword@localhost:27017
AI_SERVICE_MONGO_DB=healthia
AI_SERVICE_MONGO_TIMEOUT_MS=1200
AI_SERVICE_MONGO_ENABLED=true
AI_SERVICE_SERVICE_TOKEN=local-service-token
```

If MongoDB is unavailable, the API still responds with deterministic fallback recommendations and marks storage as `memory_fallback`.
When `AI_SERVICE_SERVICE_TOKEN` is set, every `/ai/*` route requires the same value in `X-Service-Token`.

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

`POST /ai/feedback`

```json
{
  "userId": "user_123",
  "recommendationId": "rec_123",
  "rating": 5,
  "comment": "Useful plan"
}
```
