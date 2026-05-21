Microservice FastAPI IA - minimal setup

Routes:
- GET /health
- POST /ai/meal/analyze
- POST /ai/nutrition/recommend
- POST /ai/sport/recommend
- GET /ai/recommendations/{user_id}
- POST /ai/feedback

Run with docker-compose (project root):
- `docker compose up --build`

.env variables: see .env.example

Model integration: member 1 must replace simulated logic in `main.py` with real model calls.
