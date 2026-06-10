# Choix technologiques frontend

## Stack réelle

Le frontend est situé dans `apps/web` et utilise :

- React 18 ;
- TypeScript ;
- Vite ;
- React Router ;
- TanStack Query ;
- Recharts ;
- Lucide React ;
- Vitest + Testing Library ;
- CSS global dans `src/styles/index.css`.

## Justification

React est adapté à HealthAI Coach car l'interface est composée de blocs réutilisables : cartes, formulaires, alertes, badges, états loading/empty/error et pages de recommandations.

TypeScript sécurise les types de payloads et de réponses dans `src/api`, notamment pour :

- `NutritionRecommendationRequest` ;
- `SportRecommendationRequest` ;
- `MealAnalysisResponse` ;
- `RecommendationDetail` ;
- `UserProfile`.

Vite permet de lancer et builder rapidement la partie front, ce qui est important pour une démonstration MSPR.

TanStack Query gère proprement les données serveur et les états loading sur le dashboard, l'historique, le détail et le profil.

Recharts est conservé car il est déjà présent et permet d'afficher les graphiques du dashboard, les macros nutritionnelles et la durée des exercices.

## API et mocks

Les appels sont centralisés dans `src/api`. Les endpoints attendus côté IA sont maintenant alignés avec le sujet :

- `GET /health` ;
- `POST /ai/nutrition/recommend` ;
- `POST /ai/sport/recommend` ;
- `POST /ai/meal/analyze` ;
- `GET /ai/recommendations/{user_id}` ;
- `GET /ai/recommendations/detail/{recommendation_id}` ;
- `POST /ai/recommendations/{recommendation_id}/feedback`.

La variable `VITE_USE_MOCKS` vaut `true` par défaut. En mode mock, les réponses viennent du frontend. En mode API, le front tente l'appel réel puis retombe sur le mock si le backend n'est pas disponible.

## Performance

Les pages sont chargées avec `React.lazy` et `Suspense` dans `src/app/router.tsx`. Cela évite de charger tout Recharts et toutes les pages au premier affichage.

Résultat observé après build : le chunk initial passe sous le seuil d'avertissement Vite, et les pages sont séparées en fichiers distincts.

## Limites

- Pas d'authentification backend réelle.
- La sauvegarde du profil est simulée dans `localStorage`.
- Les recommandations IA sont des mocks explicites tant que FastAPI/NestJS ne répondent pas.
- Aucun outil d'audit automatique RGAA n'est encore intégré.
