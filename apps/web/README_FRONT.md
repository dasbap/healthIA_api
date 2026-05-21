# HealthAI Coach IA - Frontend

Interface React demo pour la partie IA de la MSPR HealthAI Coach.

## Role

Ce frontend presente les parcours attendus avant la disponibilite du backend NestJS, du microservice IA FastAPI, de MongoDB et des vrais modeles IA.

## Stack

- React 18 + TypeScript
- Vite
- React Router
- TanStack Query
- Recharts
- Testing Library + Vitest
- CSS applicatif responsive dans `src/styles/index.css`

## Routes

- `/login`
- `/dashboard`
- `/meal-analysis`
- `/nutrition/recommend`
- `/sport/recommend`
- `/recommendations`
- `/recommendations/:id`
- `/profile`

## Mode donnees fictives

Les donnees sont mockees cote frontend dans `src/api`.

Variables prevues:

- `VITE_API_BASE_URL`, defaut `http://localhost:3000`
- `VITE_USE_MOCKS`, defaut `true`

Si `VITE_USE_MOCKS=true`, les modules API retournent directement les mocks. Si `VITE_USE_MOCKS=false`, le front tente les endpoints reels puis retombe proprement sur les mocks en cas d’erreur.

## Lancer le front

```bash
cd apps/web
npm install
npm run dev
```

Build:

```bash
npm run build
```

Tests:

```bash
npm run test
```

## Limites actuelles

- Pas d’authentification backend reelle.
- Pas d’upload fichier vers serveur.
- Pas de persistance MongoDB.
- Pas d’appel IA reel.
- Le feedback et le profil sont simules localement.

## Branchement futur API

Remplacer progressivement les chemins dans:

- `src/api/authApi.ts`
- `src/api/usersApi.ts`
- `src/api/aiApi.ts`
- `src/api/recommendationsApi.ts`

Les types exportes representent les contrats attendus pour connecter NestJS et le microservice IA plus tard.
