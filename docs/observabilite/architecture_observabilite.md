# Architecture d'observabilité

## Rôle de l'observabilité dans HealthAI Coach

HealthAI Coach propose des parcours de nutrition, sport, analyse de repas et recommandations IA. Pour une démonstration fiable, il est utile de savoir rapidement si les services essentiels sont disponibles.

L'observabilité ajoutée au projet permet de suivre :

- la disponibilité du frontend React/Vite ;
- l'état attendu du backend ou gateway NestJS ;
- l'état attendu du microservice IA FastAPI ;
- la disponibilité de Prometheus et Grafana ;
- les temps de réponse HTTP ;
- les codes de retour HTTP ;
- les futures métriques applicatives si `/metrics` est exposé par les API.

## Services surveillés

| Service | Port | Méthode de suivi | État actuel |
| --- | --- | --- | --- |
| Frontend Vite | `5173` | Sonde HTTP Blackbox | Réel si `npm run dev` est lancé |
| Backend / gateway NestJS | `3000` | Sonde `/health` + cible `/metrics` prête | Dossier présent, application non fournie |
| API IA FastAPI | `8000` | Sonde `/health` + cible `/metrics` prête | Dossier présent, application non fournie |
| Prometheus | `9091` côté hôte | `/metrics` et `/-/ready` | Réel |
| Grafana | `3002` côté hôte | `/api/health` | Réel |
| Blackbox Exporter | `9116` côté hôte | `/metrics` | Réel |

## Flux de supervision

```text
Frontend / API IA / Backend
        ↓
Prometheus / Blackbox Exporter
        ↓
Grafana Dashboard
```

Prometheus collecte les métriques. Blackbox Exporter teste les endpoints HTTP. Grafana lit Prometheus et affiche un dashboard synthétique pour la soutenance.

## Pourquoi cette architecture est progressive

Le projet contient un `docker-compose.yml` avec MongoDB, l'API IA FastAPI, une cible NestJS optionnelle, Prometheus, Grafana et Blackbox Exporter. L'observabilité montre FastAPI quand `ai-service` est lance et laisse NestJS DOWN tant que la gateway complete n'est pas disponible.

Aujourd'hui, les sondes HTTP montrent clairement si un endpoint est disponible ou non. Plus tard, quand FastAPI ou NestJS exposeront `/metrics`, les panels Grafana liés aux métriques applicatives pourront afficher le nombre de requêtes, les erreurs HTTP et les temps de réponse métier.

## Compétences démontrées

Cette architecture aide à démontrer :

- conception d'une architecture logicielle claire ;
- intégration de services Docker complémentaires ;
- paramétrage Prometheus, Grafana et Blackbox Exporter ;
- test de disponibilité des services ;
- justification technique via benchmark ;
- documentation professionnelle et défendable devant un jury.
