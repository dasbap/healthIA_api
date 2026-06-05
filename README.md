HealthIA API

## Docker

All local checks and services should run through Docker Compose.

```bash
docker compose up --build
```

FastAPI Swagger is available at `http://localhost:8001/docs`.

Run the AI service tests in Docker:

```bash
docker compose run --rm ai-service pytest
```
