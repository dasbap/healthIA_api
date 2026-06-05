# HealthIA API

NestJS API for public authentication, users and AI service orchestration.

## Run

```bash
docker compose up --build api
```

Swagger is available at `http://localhost:3000/docs`.

## Environment

```env
API_PORT=3000
MONGO_URI=mongodb://root:rootpassword@mongodb:27017/healthia?authSource=admin
JWT_SECRET=development-secret
JWT_EXPIRES_IN=15m
AI_SERVICE_URL=http://ai-service:8001
```

## Endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `PATCH /users/me`
- `GET /ai/health`
- `POST /ai/meal/analyze`
- `POST /ai/nutrition/recommend`
- `POST /ai/sport/recommend`
- `GET /ai/recommendations`
- `POST /ai/feedback`
