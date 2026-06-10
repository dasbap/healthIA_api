# HealthIA API

NestJS API for public authentication, users and AI service orchestration.

## Run

```bash
docker compose up --build api
```

Swagger is available at `http://localhost:13000/docs` with the default Docker Compose port mapping.
The exported OpenAPI file is `services/api/openapi.json`.

## Environment

```env
API_PORT=3000
API_HOST_PORT=13000
MONGO_URI=mongodb://root:rootpassword@mongodb:27017/healthia?authSource=admin
JWT_SECRET=development-secret
JWT_EXPIRES_IN=15m
AI_SERVICE_URL=http://ai-service:8001
AI_SERVICE_TOKEN=local-service-token
```

Export OpenAPI:

```bash
npm run openapi:export
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
- `GET /metrics`

Protected routes require a JWT Bearer token. User and AI routes enforce the scopes embedded in the token.
