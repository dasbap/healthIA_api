# Swagger et OpenAPI FastAPI

## URL Swagger

Quand l'API IA est lancee :

```bash
cd services/ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Swagger est disponible ici :

```text
http://localhost:8000/docs
```

Le schema OpenAPI exporte est disponible dans :

```text
services/ai-service/openapi.json
```

## Organisation des routes

Les routes sont separees par domaine :

- `Health` : `/health`
- `Observabilite` : `/metrics`
- `Nutrition IA` : `/ai/nutrition/recommend`
- `Sport IA` : `/ai/sport/recommend`
- `Analyse repas` : `/ai/meal/analyze`
- `Recommandations` : historique et detail
- `Feedback` : retour utilisateur

## Schemas Pydantic

Les schemas acceptent les payloads camelCase du frontend et plusieurs variantes snake_case de documentation.

Exemples :

- `targetCalories` ou `calories_target` ;
- `userId` ou `user_id` ;
- `imageUrl` ou `image_url` ;
- `fileName` ou `file_name`.

Cette compatibilite evite de casser le frontend existant tout en gardant des contrats API lisibles pour Swagger.

## Interet pour les tests et la soutenance

Swagger permet de montrer au jury :

- les endpoints IA disponibles ;
- les formats de payload ;
- les reponses attendues ;
- les erreurs possibles ;
- la presence des routes d'observabilite.

L'export OpenAPI peut etre regenere avec :

```bash
cd services/ai-service
python scripts/export_openapi.py
```
