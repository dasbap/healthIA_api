# HealthAI Coach - Frontend

Interface React de démonstration pour la partie IA, nutrition, sport et suivi utilisateur du projet MSPR HealthAI Coach.

Le frontend est volontairement connecté à des mocks par défaut afin de garantir une démonstration stable tant que le backend NestJS, le microservice FastAPI, MongoDB et les modèles IA ne sont pas complètement disponibles.

## Stack

- React 18 + TypeScript
- Vite
- React Router
- TanStack Query
- Recharts
- Lucide React
- Vitest + Testing Library
- CSS responsive dans `src/styles/index.css`

## Installation

```bash
cd apps/web
npm ci
```

## Lancement

```bash
npm run dev
```

Build :

```bash
npm run build
```

Tests :

```bash
npm run test
```

## Variables d'environnement

Créer un fichier `.env` dans `apps/web` si besoin :

```bash
VITE_AI_API_URL=http://localhost:8000
VITE_USE_MOCKS=true
VITE_GRAFANA_URL=http://localhost:3002
```

- `VITE_AI_API_URL` : URL de l'API IA FastAPI, `http://localhost:8000` par defaut.
- `VITE_API_BASE_URL` : compatibilite avec l'ancien nom de variable.
- `VITE_USE_MOCKS` : `true` par défaut. Si la valeur est `false`, le frontend tente l'API réelle puis retombe sur les mocks en cas d'erreur.
- `VITE_GRAFANA_URL` : URL du dashboard Grafana local, `http://localhost:3002` par défaut.

## Routes principales

- `/login`
- `/dashboard`
- `/meal-analysis`
- `/nutrition/recommend`
- `/sport/recommend`
- `/recommendations`
- `/recommendations/:id`
- `/profile`

## Endpoints IA attendus

- `GET /health`
- `POST /ai/nutrition/recommend`
- `POST /ai/sport/recommend`
- `POST /ai/meal/analyze`
- `GET /ai/recommendations/{user_id}`
- `GET /ai/recommendations/detail/{recommendation_id}`
- `POST /ai/recommendations/{recommendation_id}/feedback`

## Structure

```text
src/
  api/                 appels API et mocks
  app/                 providers, query client, router
  components/          layout, UI, états loading/error/empty
  config/              env et routes
  features/            pages par domaine métier
  styles/              CSS global responsive
  tests/               tests critiques
```

## Mode démo

Un bandeau dans l'application indique clairement que les recommandations viennent des mocks frontend lorsque `VITE_USE_MOCKS=true`. Si `VITE_USE_MOCKS=false` mais que l'API IA est indisponible, le fallback mock reste visible via un bandeau dedie. Les mocks sont temporaires et ne doivent pas être présentés comme une vraie IA.

Le profil est sauvegardé localement dans le navigateur en mode démo. Le feedback est également simulé.

## Analyse repas avec fichier

La page `/meal-analysis` peut envoyer une vraie image locale a l'API FastAPI avec `FormData` natif du navigateur. Aucune librairie d'upload n'est ajoutee.

Quand `VITE_USE_MOCKS=false` et que l'API est lancee, le fichier est poste vers `POST /ai/meal/analyze`. Si le modele vision local n'est pas actif, le backend renvoie un resultat avec `fallbackUsed=true` et l'interface affiche un message "Analyse estimee".

Les tests Vitest gardent `VITE_USE_MOCKS=true` via `vite.config.ts` pour rester stables meme si le `.env` local utilise l'API reelle.

## Documentation frontend

Les livrables membre 3 sont dans `../../docs/frontend` :

- `benchmark_frontend.md`
- `maquettes_responsive.md`
- `choix_technologiques_front.md`
- `accessibilite_rgAA_wcag.md`
- `parcours_utilisateur.md`
- `front_tests_report.md`
- `soutenance_frontend.md`

## Observabilité Prometheus / Grafana

Le dashboard frontend contient un lien discret `Ouvrir Grafana`, configurable avec `VITE_GRAFANA_URL`.

Lancer l'observabilité depuis la racine du projet :

```bash
docker compose up -d ai-service prometheus grafana blackbox-exporter
```

URLs :

- Frontend : http://localhost:5173
- API IA : http://localhost:8000
- Swagger API IA : http://localhost:8000/docs
- Prometheus : http://localhost:9091
- Grafana : http://localhost:3002

Identifiants Grafana de démonstration :

```text
admin / admin
```

La documentation complète est disponible dans `../../docs/observabilite` et `../../monitoring/README_MONITORING.md`.

## Éléments à montrer en soutenance

- Dashboard avec KPI, graphiques et état API/mock.
- Carte Observabilité avec ouverture du dashboard Grafana.
- Recommandation nutrition avec validation, score et contraintes.
- Recommandation sport avec limitation physique et précaution.
- Analyse repas avec aperçu, loading et résultats.
- Upload image repas avec statut fallback explicite si le modele vision local est absent.
- Historique filtrable et détail explicable.
- Feedback et profil sauvegardé localement.
- Tests passants : `npm run test`.
- Build passants : `npm run build`.

## Limites connues

- Authentification backend non branchée.
- Recommandations IA mockées par défaut si `VITE_USE_MOCKS=true`.
- Recommandations nutrition/sport API en fallback deterministe tant qu'un modele entraine n'est pas branche.
- Analyse repas API en fallback backend tant que `torch`, `transformers` et le modele vision local ne sont pas actives dans `requirements-vision.txt`.
- Pas de persistance MongoDB côté frontend.
- Pas de test end-to-end navigateur.
- `npm audit` signale des vulnérabilités à analyser avant production, dont 2 modérées sur les dépendances de production React Router.
