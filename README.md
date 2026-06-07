HealthIA API

## Specifications

Les specifications operationnelles et contractuelles sont documentees dans
[`SPECIFICATIONS.md`](SPECIFICATIONS.md).
Les variables d'environnement d'exemple sont dans [`.env.example`](.env.example).

## OpenAPI

Exports statiques :

- API NestJS : `services/api/openapi.json`
- Service IA FastAPI : `services/ai-service/openapi.json`

## Docker

All local checks and services should run through Docker Compose.

```bash
docker compose up --build
```

NestJS Swagger is available at `http://localhost:13000/docs`.
FastAPI Swagger is available at `http://localhost:8001/docs`.

Run the AI service tests in Docker:

```bash
docker compose run --rm ai-service pytest
```
