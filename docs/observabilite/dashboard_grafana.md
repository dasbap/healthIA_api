# Dashboard Grafana

## Nom

Le dashboard provisionné s'appelle :

```text
HealthAI Coach - Observabilité globale
```

Il est placé dans le dossier Grafana `HealthAI Coach`.

## Panels disponibles

| Panel | Ce qu'il montre | Source |
| --- | --- | --- |
| Frontend React | Statut UP/DOWN du frontend Vite | Blackbox Exporter |
| API IA FastAPI | Statut UP/DOWN de `/health` FastAPI attendu | Blackbox Exporter |
| Backend / Gateway | Statut UP/DOWN de `/health` NestJS attendu | Blackbox Exporter |
| Prometheus | Disponibilité de Prometheus | Blackbox Exporter |
| Grafana | Disponibilité de Grafana | Blackbox Exporter |
| Temps de réponse HTTP | Durée des sondes HTTP | `probe_duration_seconds` |
| Codes HTTP des endpoints | Codes retournés par les endpoints sondés | `probe_http_status_code` |
| Services disponibles | Nombre de sondes HTTP en succès | `probe_success` |
| Métriques applicatives API | État des endpoints `/metrics` API IA et gateway optionnelle | `up{job="healthai-api-metrics"}` |

## Interprétation UP/DOWN

- `UP` signifie que la sonde HTTP a reçu une réponse valide.
- `DOWN` signifie que le service ne répond pas, que le DNS Docker ne résout pas la cible, ou que l'endpoint attendu n'existe pas encore.
- Pour l'API IA FastAPI, le statut doit passer UP quand `ai-service` est lance.
- Pour NestJS, un statut DOWN reste normal sur `mb3` tant que la gateway complete n'est pas lancee.

## Temps de réponse

Le panel `Temps de réponse HTTP` affiche le temps nécessaire à Blackbox Exporter pour joindre chaque service. Une hausse peut indiquer :

- service lent ;
- conteneur en surcharge ;
- endpoint indisponible par intermittence ;
- problème réseau Docker.

## Erreurs HTTP

Le panel `Codes HTTP des endpoints` permet de repérer :

- `200` ou autre code 2xx : service accessible ;
- `404` : endpoint non présent ;
- `500` : erreur serveur ;
- absence de valeur : service non joignable.

## Captures à ajouter

Pour le dossier de soutenance, ajouter plus tard :

- capture de Prometheus avec les targets ;
- capture de Grafana avec le dashboard complet ;
- capture montrant un service UP ;
- capture montrant un service DOWN après arrêt volontaire.

## Message à défendre

Le dashboard ne masque pas les limites du projet. Il montre clairement les services réels, les endpoints attendus et les futures métriques applicatives. Cette transparence est importante pour une démonstration crédible.
