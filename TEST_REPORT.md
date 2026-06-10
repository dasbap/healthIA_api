# HealthIA test report

Date: 2026-06-07

## Summary

All critical API checks pass for the member 2 scope: MongoDB-backed services, FastAPI IA routes, NestJS proxy routes, validation, fallback/error handling and operational endpoints.

## Commands run

```bash
cd services/api && npm run build
```

Result: passed.

```bash
cd services/api && npm test -- --runInBand
```

Result: 3 test suites passed, 7 tests passed.

```bash
docker compose run --rm api npm run test:e2e -- --runInBand
```

Result: 3 test suites passed, 6 tests passed.

```bash
docker compose run --rm ai-service pytest
```

Result: 9 tests passed.

## Coverage by requirement

- `GET /health`: covered by FastAPI pytest and NestJS e2e.
- `POST /ai/meal/analyze`: covered by FastAPI pytest and NestJS AI proxy e2e.
- `POST /ai/nutrition/recommend`: covered by FastAPI pytest and NestJS AI proxy e2e.
- `POST /ai/sport/recommend`: covered by FastAPI pytest and NestJS AI proxy e2e.
- `GET /ai/recommendations`: covered by FastAPI pytest and NestJS AI proxy e2e.
- Payload invalid: covered by FastAPI schema tests and NestJS AI proxy e2e.
- AI service unavailable: covered by NestJS unit and e2e tests.
- MongoDB storage fallback: covered by FastAPI pytest.

## OpenAPI exports

- NestJS API: `services/api/openapi.json`
- FastAPI AI service: `services/ai-service/openapi.json`
