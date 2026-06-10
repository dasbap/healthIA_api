# Rapport de tests API IA

## Commande lancee

```bash
cd services/ai-service
python -m pytest
```

## Resultat

```text
16 passed
```

## Tests couverts

- `GET /health` retourne 200.
- `GET /metrics` retourne des metriques Prometheus.
- `POST /ai/nutrition/recommend` retourne une recommandation compatible frontend.
- `POST /ai/sport/recommend` retourne un programme compatible frontend.
- `POST /ai/meal/analyze` avec URL valide retourne une analyse.
- `POST /ai/meal/analyze` avec fichier PNG multipart retourne une analyse fallback.
- `POST /ai/meal/analyze` avec service vision mocke retourne `fallbackUsed=false`.
- `POST /ai/meal/analyze` rejette un fichier non image en multipart.
- `POST /ai/meal/analyze` avec payload incomplet retourne une erreur.
- URL image invalide rejetee par Pydantic.
- `GET /ai/recommendations/{user_id}` retourne une liste.
- `GET /ai/recommendations/detail/{id}` retourne un detail.
- `GET /ai/recommendations/detail/{id}` retourne 404 si l'id n'existe pas.
- `POST /ai/recommendations/{id}/feedback` accepte un feedback valide.
- Feedback incomplet refuse.
- Statut fallback et statut vision verifies.

## Limites des tests

- Les tests utilisent le fallback memoire, pas une vraie instance MongoDB.
- Le modele vision local n'est pas telecharge pendant les tests.
- Le cas vraie vision est teste avec un mock pour eviter de telecharger un modele lourd en CI.
- Les tests API valident le contrat et le mapping, pas la qualite d'une vraie reconnaissance image locale.

## Valeur pour la soutenance

Ces tests montrent que l'API IA est stable, documentee, branchable au frontend et honnete sur ses fallbacks.
