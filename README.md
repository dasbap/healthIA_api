# HealthAI Coach

HealthAI Coach est une application de coaching nutrition et sport avec une API IA, une reconnaissance de repas par image, des recommandations personnalisees, un frontend React accessible et une observabilite locale Prometheus/Grafana.

Le projet est prepare pour une demonstration MSPR : lancement simple, endpoints documentes par Swagger, tests backend/frontend, monitoring, et fallbacks explicites quand un service IA optionnel n'est pas disponible.

## Fonctionnalites

- Analyse de repas par image locale ou URL.
- Reconnaissance image avec le modele Hugging Face `nateraw/food`.
- Recommandations nutritionnelles personnalisees.
- Recommandations sportives personnalisees.
- Historique des recommandations et analyses.
- Detail d'une recommandation.
- Feedback utilisateur.
- Profil utilisateur local avec `userId` stable.
- Options d'accessibilite : daltonisme, contraste renforce, taille du texte, reduction des animations.
- Monitoring local avec Prometheus, Grafana et Blackbox Exporter.

## Stack

- Frontend : React, TypeScript, Vite, TanStack Query, Recharts.
- Backend IA : FastAPI, Python, Pydantic, Uvicorn.
- Vision : Hugging Face Transformers, PyTorch CPU, modele `nateraw/food`.
- Stockage : MongoDB si disponible, fallback memoire sinon.
- Observabilite : Prometheus, Grafana, Blackbox Exporter.
- Conteneurisation : Docker Compose.

## Prerequis

- Git.
- Node.js 20 ou version recente compatible avec Vite.
- Python 3.11+.
- Docker Desktop si vous voulez lancer les services conteneurises.

## Variables d'environnement

Des fichiers d'exemple sont fournis :

- `.env.example` pour Docker Compose et le frontend ;
- `apps/web/.env.example` pour le frontend ;
- `services/ai-service/.env.example` pour l'API IA locale.

Copiez l'exemple utile avant de lancer :

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp services/ai-service/.env.example services/ai-service/.env
```

Les valeurs sont des exemples de developpement. Ne commitez jamais un vrai `.env`.

## Lancement rapide sans Docker

API IA :

```bash
cd services/ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend :

```bash
cd apps/web
npm ci
npm run dev
```

Pour connecter le frontend a l'API reelle, utilisez :

```env
VITE_AI_API_URL=http://localhost:8000
VITE_USE_MOCKS=false
```

## Lancement avec Docker

Lancement complet des services utiles :

```bash
docker compose up --build mongodb ai-service prometheus grafana blackbox-exporter
```

Lancement en arriere-plan :

```bash
docker compose up -d --build mongodb ai-service prometheus grafana blackbox-exporter
```

Pour construire l'image IA avec la vraie vision locale :

```bash
AI_SERVICE_INSTALL_VISION=true VISION_ENABLED=true VISION_MODEL_NAME=nateraw/food docker compose up -d --build ai-service
```

## URLs utiles

- Frontend : http://localhost:5173
- API IA : http://localhost:8000
- Swagger API IA : http://localhost:8000/docs
- Healthcheck : http://localhost:8000/health
- Metriques : http://localhost:8000/metrics
- Prometheus : http://localhost:9091
- Grafana : http://localhost:3002

Les identifiants Grafana de demonstration viennent de `.env.example`.

## Tester la vraie vision

Installer les dependances de base puis les dependances vision :

```bash
cd services/ai-service
pip install -r requirements.txt
pip install -r requirements-vision.txt
```

Activer la vision :

```env
VISION_ENABLED=true
VISION_MODEL_NAME=nateraw/food
VISION_DEVICE=cpu
```

Lancer l'API puis verifier :

```bash
curl http://localhost:8000/health
```

La vraie vision est active si `/health` indique :

- `vision.enabled=true`
- `vision.modelAvailable=true`
- `vision.torch=true`
- `vision.transformers=true`

Test d'upload :

```bash
curl -X POST http://localhost:8000/ai/meal/analyze \
  -F "userId=demo-user" \
  -F "file=@/chemin/vers/photo.jpg"
```

Une reconnaissance reelle retourne `model: "nateraw/food"` et `fallbackUsed: false`.

## Recommandations nutrition et sport

Les endpoints principaux sont :

- `POST /ai/nutrition/recommend`
- `POST /ai/sport/recommend`

Nutrition et sport utilisent des moteurs HealthAI rules/scoring integres dans l'API :

- `healthai-nutrition-recommender-v1`
- `healthai-sport-recommender-v1`

Ces moteurs ne sont pas presentes comme des modeles ML entraines. Les artefacts entraines nutrition/sport ne sont pas inclus dans le repo. Les fallbacks restent disponibles uniquement en secours.

## Tests

La CI GitHub Actions lance ces controles sur `mb_2` et sur les pull requests vers `mb_2` :

- API NestJS : installation, lint ESLint, typecheck, tests unitaires, tests e2e avec MongoDB, build.
- API IA FastAPI : installation Python 3.11, lint Ruff, `pytest` et quality gates IA.
- AI quality gates : job dedie aux scenarios qualite nutrition/sport et au statut des moteurs IA.
- Frontend React : installation, lint ESLint, typecheck, tests Vitest, build.
- Docker Compose : validation `docker compose config`.

API IA :

```bash
cd services/ai-service
pip install -r requirements.txt -r requirements-dev.txt
python -m ruff check app scripts
python -m pytest
```

Les quality gates IA valident :

- le statut explicite des moteurs nutrition/sport ;
- les scores minimaux de scenarios nutrition et sport ;
- le respect des allergies et regimes ;
- l'adaptation sport en cas de fatigue ou limitation ;
- l'absence de fallback par defaut sur les moteurs rules/scoring.

Ils ne prouvent pas qu'un modele ML entraine a progresse : les artefacts entraines nutrition/sport ne sont pas inclus dans ce depot. La CI signale donc clairement que les moteurs actifs sont des moteurs rules/scoring et que `trainedModelAvailable=false` tant qu'un vrai bundle modele n'est pas livre.

Frontend :

```bash
cd apps/web
npm run lint
npm run typecheck
npm run test
npm run build
```

API NestJS :

```bash
cd services/api
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Configuration Docker :

```bash
docker compose config
```

## Accessibilite

Le frontend contient un panneau d'accessibilite avec :

- mode daltonien ;
- contraste renforce ;
- taille de texte reglable ;
- reduction des animations ;
- navigation clavier et focus visibles.

## Observabilite

Prometheus collecte :

- `/health` via Blackbox Exporter ;
- `/metrics` expose par FastAPI.

Grafana charge les dashboards JSON depuis `monitoring/grafana/dashboards` et les sources depuis `monitoring/grafana/provisioning`.

## Limites

- HealthAI Coach est une application de demonstration, pas un dispositif medical.
- Les estimations nutritionnelles restent approximatives.
- Le modele vision `nateraw/food` est un modele pre-entraine generaliste.
- MongoDB est optionnel : si la base est indisponible, l'API utilise un stockage memoire.
- Les recommandations nutrition/sport sont basees sur un moteur rules/scoring, pas sur un modele ML entraine livre dans ce repo.

## Structure du projet

```text
apps/web/                  frontend React/Vite
services/ai-service/       API IA FastAPI
monitoring/                Prometheus, Grafana, Blackbox
docker-compose.yml         services locaux
.env.example               variables d'environnement de demonstration
```

## Commandes utiles

```bash
docker compose ps
docker compose logs -f ai-service
docker compose down
```
