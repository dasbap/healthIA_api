# Integration frontend avec l'API IA

## Configuration

Dans `apps/web/.env` :

```env
VITE_AI_API_URL=http://localhost:8000
VITE_USE_MOCKS=false
VITE_GRAFANA_URL=http://localhost:3002
```

`VITE_AI_API_URL` est prioritaire. `VITE_API_BASE_URL` reste accepte comme compatibilite.

## Fichiers frontend concernes

- `apps/web/src/config/env.ts`
- `apps/web/src/api/httpClient.ts`
- `apps/web/src/api/aiApi.ts`
- `apps/web/src/api/recommendationsApi.ts`
- `apps/web/src/components/layout/AppLayout.tsx`

## Endpoints utilises

- `GET /health`
- `POST /ai/nutrition/recommend`
- `POST /ai/sport/recommend`
- `POST /ai/meal/analyze`
- `GET /ai/recommendations/{user_id}`
- `GET /ai/recommendations/detail/{recommendation_id}`
- `POST /ai/recommendations/{recommendation_id}/feedback`

## Upload image repas

Le formulaire `/meal-analysis` accepte :

- une URL d'image publique ;
- un fichier local via input fichier ou glisser-deposer.

Quand un fichier est selectionne, `apps/web/src/api/aiApi.ts` construit un `FormData` natif avec :

- `userId` ;
- `file` ;
- `fileName` si disponible.

`apps/web/src/api/httpClient.ts` ne force pas `Content-Type: application/json` quand le body est un `FormData`. Le navigateur ajoute donc automatiquement le `boundary` multipart attendu par FastAPI.

Aucune librairie frontend d'upload n'est necessaire.

## Fallback mock

Le fallback est conserve volontairement :

- il securise la demo si l'API n'est pas lancee ;
- il est visible via un bandeau ;
- il ne doit pas etre presente comme une IA reelle.

## Parcours demonstrables

Avec l'API lancee et `VITE_USE_MOCKS=false`, le frontend peut :

- generer une recommandation nutrition ;
- generer une recommandation sport ;
- analyser un repas ;
- afficher l'historique cree pendant la session ;
- ouvrir un detail ;
- envoyer un feedback.

Sans MongoDB, l'historique est conserve en memoire tant que le processus FastAPI tourne.

## Tests frontend

Les tests Vitest forcent `VITE_USE_MOCKS=true` dans `apps/web/vite.config.ts` afin de rester deterministes meme si le `.env` local pointe vers l'API reelle.

Un test dedie verifie que `analyzeMeal` envoie un fichier sous forme de `FormData` sans header JSON force.
