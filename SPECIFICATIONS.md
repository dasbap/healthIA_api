# HealthIA - Specifications operationnelles

Ce document complete les README existants avec les contrats necessaires pour integrer et exploiter HealthIA. Il decrit l'etat cible minimal et indique les points qui restent a implementer lorsque le code actuel ne les couvre pas encore.

## 1. Perimetre applicatif

HealthIA est compose de deux services :

- API principale NestJS : gestion des utilisateurs, authentification, autorisation et orchestration des appels IA. Elle vit dans `services/api`.
- Service IA FastAPI : analyse de repas, recommandations nutritionnelles, recommandations sportives, historique et feedback. Ce service est implemente dans `services/ai-service`.

Les services locaux sont demarres avec Docker Compose :

```bash
docker compose up --build
```

Swagger FastAPI est disponible sur `http://localhost:8001/docs`.

## 2. Specifications API

### Format standard de reponse

Les endpoints FastAPI retournent actuellement directement les modeles de reponse. L'API principale devrait standardiser toutes les reponses publiques au format suivant :

```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-06-05T10:00:00Z"
}
```

Format d'erreur cible :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": []
  },
  "timestamp": "2026-06-05T10:00:00Z",
  "path": "/ai/nutrition/recommend"
}
```

Codes d'erreur standardises :

| Code | HTTP | Usage |
| --- | ---: | --- |
| `VALIDATION_ERROR` | 400 ou 422 | Payload invalide, enum inconnue, champ manquant |
| `UNAUTHORIZED` | 401 | Token absent, invalide ou expire |
| `FORBIDDEN` | 403 | Scope insuffisant ou acces a une ressource d'un autre utilisateur |
| `NOT_FOUND` | 404 | Ressource inexistante |
| `AI_SERVICE_UNAVAILABLE` | 503 | Service IA ou dependance modele indisponible |
| `DATABASE_UNAVAILABLE` | 503 | MongoDB indisponible hors mode fallback |
| `INTERNAL_ERROR` | 500 | Erreur non geree |

### Endpoints IA exposes par FastAPI

#### `GET /health`

Reponse :

```json
{
  "status": "ok",
  "mongo": "connected",
  "fallback": {
    "enabled": true,
    "reason": "Local deterministic fallback avoids external AI dependency during demos."
  }
}
```

#### `POST /ai/meal/analyze`

Requete :

```json
{
  "userId": "user_123",
  "imageUrl": "https://example.com/meal.jpg",
  "notes": "salade, poulet et riz"
}
```

Reponse :

```json
{
  "id": "66618f4f7f1a1c0012aa0001",
  "userId": "user_123",
  "imageUrl": "https://example.com/meal.jpg",
  "detectedFoods": [
    {
      "name": "salade composee",
      "confidence": 0.82,
      "calories": 240,
      "proteins": 18.0,
      "carbs": 24.0,
      "fats": 9.0
    }
  ],
  "totalCalories": 460,
  "summary": "Repas equilibre avec apport proteique modere.",
  "fallbackUsed": false
}
```

Contraintes : `imageUrl` doit etre une URL valide ; `notes` est optionnel et limite a 500 caracteres.

#### `POST /ai/nutrition/recommend`

Requete :

```json
{
  "userId": "user_123",
  "age": 29,
  "sex": "female",
  "heightCm": 168,
  "weightKg": 64,
  "goal": "maintain",
  "activityLevel": "moderate",
  "dietaryRestrictions": ["vegetarian"]
}
```

Valeurs autorisees :

- `sex` : `female`, `male`, `other`
- `goal` : `lose_weight`, `maintain`, `gain_muscle`
- `activityLevel` : `low`, `moderate`, `high`

Reponse :

```json
{
  "id": "66618f4f7f1a1c0012aa0002",
  "userId": "user_123",
  "type": "nutrition",
  "dailyCalories": 1960,
  "macros": {
    "proteins": 120,
    "carbs": 220,
    "fats": 65
  },
  "recommendations": [
    "Maintenir une hydratation reguliere",
    "Repartir les proteines sur la journee"
  ],
  "fallbackUsed": false
}
```

Contraintes : `age` 12-100, `heightCm` 120-230, `weightKg` 35-250.

#### `POST /ai/sport/recommend`

Requete :

```json
{
  "userId": "user_123",
  "age": 31,
  "goal": "strength",
  "level": "beginner",
  "sessionsPerWeek": 3,
  "limitations": ["knee_pain"]
}
```

Valeurs autorisees :

- `goal` : `fat_loss`, `endurance`, `strength`, `mobility`
- `level` : `beginner`, `intermediate`, `advanced`

Reponse :

```json
{
  "id": "66618f4f7f1a1c0012aa0003",
  "userId": "user_123",
  "type": "sport",
  "weeklyPlan": [
    {
      "day": "Monday",
      "session": "Full body strength",
      "duration": "45 min"
    }
  ],
  "safetyNotes": [
    "Adapter l'intensite en cas de douleur"
  ],
  "fallbackUsed": false
}
```

Contraintes : `age` 12-100, `sessionsPerWeek` 1-7.

#### `GET /ai/recommendations/{userId}?limit=20`

Reponse :

```json
{
  "userId": "user_123",
  "items": [
    {
      "id": "66618f4f7f1a1c0012aa0002",
      "userId": "user_123",
      "type": "nutrition",
      "payload": {
        "dailyCalories": 1960
      }
    }
  ]
}
```

Contraintes : `limit` entre 1 et 100.

#### `POST /ai/feedback`

Requete :

```json
{
  "userId": "user_123",
  "recommendationId": "66618f4f7f1a1c0012aa0002",
  "rating": 5,
  "comment": "Plan utile"
}
```

Reponse HTTP `201` :

```json
{
  "id": "66618f4f7f1a1c0012aa0004",
  "userId": "user_123",
  "recommendationId": "66618f4f7f1a1c0012aa0002",
  "rating": 5,
  "comment": "Plan utile"
}
```

Contraintes : `rating` entre 1 et 5 ; `comment` optionnel limite a 1000 caracteres.

## 3. Authentification et autorisation

Etat actuel : le service IA n'impose pas directement l'authentification utilisateur. L'API principale NestJS porte le controle d'acces public et relaie au service IA un `userId` deja autorise.

Etat cible recommande :

- Methode : JWT Bearer emis par l'API principale apres login.
- Algorithme : `HS256` en local, `RS256` recommande en production.
- OAuth : non requis pour le prototype ; a ajouter via fournisseur externe si une connexion sociale ou enterprise est demandee.
- Duree de vie : access token 15 minutes, refresh token 7 jours.
- Claims minimaux : `sub`, `email`, `roles`, `scopes`, `iat`, `exp`.
- Transport : header `Authorization: Bearer <token>`.

Scopes proposes :

| Scope | Description |
| --- | --- |
| `profile:read` | Lire son profil utilisateur |
| `profile:write` | Modifier son profil utilisateur |
| `ai:recommend` | Generer des recommandations IA |
| `ai:read` | Lire son historique IA |
| `feedback:write` | Envoyer un feedback |
| `admin:read` | Lire les donnees d'administration |

Regles d'autorisation :

- Un utilisateur ne peut lire ou ecrire que ses propres donnees, sauf role `admin`.
- L'API principale valide le JWT et transmet au service IA un `userId` deja autorise.
- Les appels directs au service IA doivent etre reserves au reseau interne ou proteges par un token de service.

## 4. Modele de donnees NoSQL

Base : MongoDB, base par defaut `healthia`.

### `users`

Collection geree par l'API principale.

Exemple cible :

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "passwordHash": "bcrypt_hash",
  "roles": ["user"],
  "profile": {
    "age": 29,
    "sex": "female",
    "heightCm": 168,
    "weightKg": 64
  },
  "preferences": {
    "dietaryRestrictions": ["vegetarian"],
    "activityLevel": "moderate"
  },
  "createdAt": "2026-06-05T10:00:00Z",
  "updatedAt": "2026-06-05T10:00:00Z"
}
```

Indexes :

- Unique : `{ "email": 1 }`
- Recherche profil : `{ "createdAt": -1 }`

### `meal_analyses`

Indexes :

- `{ "userId": 1, "createdAt": -1 }`
- TTL optionnel sur `createdAt` si les images ou analyses doivent expirer.

Contraintes :

- `userId`, `imageUrl`, `detectedFoods`, `totalCalories`, `createdAt` requis.
- Ne pas stocker l'image brute ; stocker uniquement une URL ou une reference d'objet.

### `recommendations`

Indexes :

- `{ "userId": 1, "createdAt": -1 }`
- `{ "userId": 1, "type": 1, "createdAt": -1 }`

Contraintes :

- `type` limite a `nutrition` ou `sport`.
- `payload` contient la sortie complete du moteur IA.

### `feedbacks`

Indexes :

- `{ "userId": 1, "createdAt": -1 }`
- `{ "recommendationId": 1 }`

Contraintes :

- `rating` entre 1 et 5.
- `recommendationId` optionnel mais recommande pour relier le feedback a une recommandation.

### `ai_logs`

Indexes :

- `{ "createdAt": -1 }`
- `{ "event": 1, "createdAt": -1 }`

Contraintes :

- Ne pas journaliser de donnees de sante identifiantes.
- Stocker des evenements techniques et des identifiants pseudonymises.

## 5. Contrats IA

### Inputs

Les inputs IA doivent rester structures, valides par schema et rattaches a un `userId` autorise. Les valeurs libres comme `notes`, `limitations` et `dietaryRestrictions` doivent etre limitees en taille et nettoyees cote API.

### Outputs

Chaque sortie IA doit exposer :

- un identifiant `id` si stockee en base ;
- le `userId` ;
- un `type` pour les recommandations ;
- les donnees metier calculees ;
- `fallbackUsed` pour indiquer si une reponse deterministe a remplace le modele.

### SLA cible

| Operation | Latence cible p95 | Fallback |
| --- | ---: | --- |
| Analyse repas | 2500 ms | Analyse deterministe basee sur l'URL et les notes |
| Recommandation nutrition | 800 ms | Regles locales avec estimation calorique |
| Recommandation sport | 800 ms | Plan local selon objectif, niveau et frequence |
| Historique | 300 ms | Liste vide si MongoDB indisponible |
| Feedback | 300 ms | Stockage `memory_fallback` si MongoDB indisponible |

En mode fallback, la reponse doit rester valide, explicite et marquee avec `fallbackUsed: true` lorsque le schema le permet.

## 6. Deploiement et infrastructure

### Containerisation

Services actuels :

- `mongodb` : MongoDB 6.0
- `ai-service` : FastAPI expose sur `8001`

L'API NestJS est exposee par le service `api` et consomme le service interne `ai-service`.

### Variables d'environnement

Service IA :

| Variable | Defaut local | Description |
| --- | --- | --- |
| `AI_SERVICE_ENVIRONMENT` | `development` | Environnement d'execution |
| `AI_SERVICE_MONGO_ENABLED` | `true` | Active la persistance MongoDB |
| `AI_SERVICE_MONGO_URI` | `mongodb://root:rootpassword@localhost:27017` | URI MongoDB |
| `AI_SERVICE_MONGO_DB` | `healthia` | Nom de base |
| `AI_SERVICE_MONGO_TIMEOUT_MS` | `1200` | Timeout de connexion MongoDB |

API principale cible :

| Variable | Description |
| --- | --- |
| `API_PORT` | Port HTTP NestJS |
| `JWT_SECRET` ou `JWT_PUBLIC_KEY` | Verification JWT |
| `JWT_EXPIRES_IN` | Duree de vie access token |
| `MONGO_URI` | URI MongoDB |
| `AI_SERVICE_URL` | URL interne du service IA |

### CI/CD cible

Pipeline minimal :

1. Installer les dependances.
2. Linter et typer le code si les scripts existent.
3. Executer les tests API NestJS.
4. Executer les tests FastAPI.
5. Construire les images Docker.
6. Publier les images sur la registry.
7. Deployer sur l'environnement cible.

Orchestration :

- Local : Docker Compose.
- Production : Kubernetes recommande si plusieurs instances, secrets manages, probes et autoscaling sont necessaires.

## 7. Observabilite

Logs :

- Format cible : JSON en production.
- Champs minimaux : `timestamp`, `level`, `service`, `requestId`, `userIdHash`, `route`, `statusCode`, `durationMs`.
- Ne pas logger les images, notes libres completes, donnees medicales brutes ou tokens.

Metriques :

- `http_requests_total`
- `http_request_duration_ms`
- `ai_fallback_total`
- `ai_recommendation_total`
- `mongo_operation_duration_ms`
- `mongo_unavailable_total`

Tracage :

- Propager `X-Request-Id` entre API principale et service IA.
- Ajouter OpenTelemetry lorsque l'API principale orchestre plusieurs appels.

Alerting :

- p95 superieur au SLA pendant 10 minutes.
- Taux 5xx superieur a 2 % pendant 5 minutes.
- MongoDB indisponible pendant plus de 5 minutes.
- Hausse anormale de `ai_fallback_total`.

## 8. Securite et confidentialite

HealthIA manipule des donnees potentiellement sensibles. Les exigences suivantes sont obligatoires avant production :

- Minimisation : collecter uniquement les champs necessaires aux recommandations.
- Pseudonymisation : utiliser un identifiant technique `userId`, jamais l'email dans les logs IA.
- Chiffrement en transit : HTTPS/TLS pour tous les flux externes.
- Chiffrement au repos : disque chiffre et secrets hors du code source.
- Mots de passe : hash `bcrypt` ou `argon2id`, jamais de stockage en clair.
- Images : stocker des URLs ou references d'objet ; supprimer les images selon une politique de retention.
- Consentement : afficher clairement l'usage des donnees sante/bien-etre.
- Droit a suppression : supprimer ou anonymiser `users`, `meal_analyses`, `recommendations`, `feedbacks`, `ai_logs`.
- Acces : RBAC minimal, principe du moindre privilege.
- Conformite : cadrer le projet comme bien-etre ou obtenir une validation juridique si des donnees de sante au sens reglementaire sont traitees.

## 9. Criteres d'acceptation et checklist de tests

### Tests unitaires

- Validation des schemas Pydantic : bornes numeriques, enums, champs requis.
- Services IA : sortie stable pour nutrition, sport, repas.
- Fallbacks : reponses valides si MongoDB est indisponible.
- Repositories : insertion et lecture avec MongoDB disponible.

### Tests d'integration

- `GET /health` retourne `status: ok`.
- Chaque endpoint IA retourne un schema conforme.
- `GET /ai/recommendations/{userId}` respecte `limit`.
- `POST /ai/feedback` retourne HTTP `201`.
- L'API principale bloque les appels non authentifies lorsque l'auth sera implementee.

### Tests e2e

- Register/login utilisateur.
- Generation nutrition puis lecture historique.
- Generation sport puis feedback.
- Analyse repas avec URL valide.
- Refus d'acces aux donnees d'un autre utilisateur.

### Performance

- p95 nutrition et sport inferieur a 800 ms en local hors cold start.
- p95 analyse repas inferieur a 2500 ms.
- Aucune fuite de donnees sensibles dans les logs de test.

Commandes actuelles :

```bash
docker compose run --rm ai-service pytest
```

Lorsque l'API NestJS sera complete, ajouter :

```bash
docker compose run --rm api npm test
docker compose run --rm api npm run test:e2e
```

## 10. Points ouverts

- Creer les indexes MongoDB au demarrage ou via migration.
- Ajouter logs JSON, metriques Prometheus et propagation `X-Request-Id`.
- Formaliser la politique de retention des donnees.
- Ajouter OAuth si le produit exige une federation d'identite.

## Conclusion

La base est suffisante pour demarrer un prototype fonctionnel du service IA. Pour une integration robuste, il faut maintenant contractualiser l'API principale, l'authentification, les indexes MongoDB, les garanties de fallback, l'observabilite et les exigences de securite liees aux donnees sensibles.
