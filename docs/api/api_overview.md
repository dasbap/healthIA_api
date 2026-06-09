# Vue d'ensemble API IA

## Role

L'API IA de HealthAI Coach est un microservice FastAPI situe dans `services/ai-service`.

Elle expose les parcours IA utilises par le frontend React :

- recommandation nutritionnelle ;
- recommandation sportive ;
- analyse de repas par URL ou fichier image ;
- historique des recommandations et analyses ;
- detail d'une recommandation ;
- feedback utilisateur ;
- endpoints d'observabilite `/health` et `/metrics`.

## Stack detectee

- FastAPI pour l'API IA.
- Pydantic pour les schemas et validations.
- Uvicorn pour le serveur ASGI.
- Pytest et httpx pour les tests.
- MongoDB avec fallback memoire si la base est indisponible.
- Prometheus/Grafana/Blackbox Exporter pour l'observabilite locale.
- React/Vite dans `apps/web` pour le frontend.
- Le dossier `nestjs/` existe sur `mb3`, mais reste un placeholder. Il n'est pas supprime.

## Endpoints principaux

| Methode | Endpoint | Role |
| --- | --- | --- |
| GET | `/health` | Etat API, Mongo, fallback et vision |
| GET | `/metrics` | Metriques Prometheus |
| POST | `/ai/nutrition/recommend` | Recommandation nutrition |
| POST | `/ai/sport/recommend` | Recommandation sport |
| POST | `/ai/meal/analyze` | Analyse repas |
| GET | `/ai/recommendations/{user_id}` | Historique |
| GET | `/ai/recommendations/detail/{recommendation_id}` | Detail |
| POST | `/ai/recommendations/{recommendation_id}/feedback` | Feedback |

## Lien frontend

Le frontend appelle l'API via :

```env
VITE_AI_API_URL=http://localhost:8000
VITE_USE_MOCKS=false
```

Si `VITE_USE_MOCKS=true`, les mocks frontend sont utilises directement. Si `VITE_USE_MOCKS=false` mais que l'API ne repond pas, le frontend retombe sur les mocks et affiche un bandeau visible.

## Lien observabilite

Prometheus surveille :

- `http://localhost:8000/health` via Blackbox Exporter ;
- `http://localhost:8000/metrics` via le job `healthai-api-metrics`.

Grafana affiche alors l'etat de disponibilite de l'API IA et les metriques HTTP exposees par FastAPI.

## Positionnement competences MSPR

Cette API permet de demontrer :

- le parametrage d'un backend IA ;
- l'exposition de moteurs IA ou fallbacks via API ;
- l'integration avec un frontend React ;
- la validation de payloads ;
- la gestion d'erreurs lisibles ;
- les tests API ;
- Swagger/OpenAPI ;
- Docker Compose ;
- l'observabilite Prometheus/Grafana.
