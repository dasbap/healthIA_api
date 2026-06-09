# HealthIA_api

## Observabilité Prometheus / Grafana

Le projet contient une configuration locale d'observabilité pour HealthAI Coach avec Prometheus, Grafana et Blackbox Exporter.

Objectif :

- suivre la disponibilité du frontend React/Vite ;
- suivre l'API IA FastAPI sur `/health` et `/metrics` ;
- garder une cible NestJS visible si le placeholder backend est lancé ;
- surveiller Prometheus et Grafana ;
- exposer les métriques applicatives de l'API IA.

Lancer le frontend :

```bash
cd apps/web
npm run dev
```

Lancer l'API IA :

```bash
cd services/ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Lancer l'observabilité depuis la racine :

```bash
docker compose up -d ai-service prometheus grafana blackbox-exporter
```

Analyse repas :

- le frontend peut envoyer une URL ou une vraie image locale via `FormData` ;
- l'API FastAPI accepte JPEG, PNG et WebP jusqu'a 8 Mo ;
- sans modele vision local, le backend renvoie un fallback explicite avec `fallbackUsed=true` ;
- `requirements.txt` contient l'API de base et l'upload, `requirements-vision.txt` contient seulement `torch` et `transformers`.

## API IA et reconnaissance image

Installation API de base :

```bash
cd services/ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Installation vision reelle optionnelle :

```bash
pip install -r requirements-vision.txt
```

Configuration :

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

Avec Docker, les dependances vision restent optionnelles. Pour construire l'image avec le modele local :

```bash
VISION_ENABLED=true AI_SERVICE_INSTALL_VISION=true docker compose build --no-cache ai-service
docker compose up -d ai-service
```

Le vrai modele vision est actif quand `/health` indique `vision.enabled=true`, `vision.torch=true`, `vision.transformers=true` et `vision.modelAvailable=true`. Sinon l'API continue avec `fallbackUsed=true`.

Vérifier :

```bash
docker compose ps
```

URLs utiles :

- Frontend : http://localhost:5173
- API IA FastAPI : http://localhost:8000
- Swagger API IA : http://localhost:8000/docs
- Prometheus : http://localhost:9091
- Grafana : http://localhost:3002

Identifiants Grafana de démonstration :

```text
admin / admin
```

Documentation détaillée :

- `monitoring/README_MONITORING.md`
- `docs/observabilite/benchmark_observabilite.md`
- `docs/observabilite/architecture_observabilite.md`
- `docs/observabilite/configuration_prometheus_grafana.md`
- `docs/observabilite/dashboard_grafana.md`
- `docs/observabilite/tests_observabilite.md`
- `docs/observabilite/limites_observabilite.md`
- `docs/api/api_overview.md`
- `docs/api/integration_frontend.md`
- `docs/api/image_recognition_api.md`

Limite importante : l'API IA FastAPI est disponible dans `services/ai-service`, avec fallbacks deterministes documentes. Le dossier `nestjs` reste un placeholder sur `mb3` et peut apparaitre DOWN tant qu'une gateway NestJS complete n'est pas lancee.
