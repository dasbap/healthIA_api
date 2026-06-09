# Monitoring HealthAI Coach

## Objectif

Cette configuration ajoute une observabilité locale pour HealthAI Coach avec Prometheus, Grafana et Blackbox Exporter.

Elle permet de surveiller la disponibilité du frontend, de l'API IA FastAPI, de Prometheus et de Grafana, puis de garder une cible NestJS visible si la gateway est lancee.

## Lancement rapide

Lancer le frontend :

```bash
cd apps/web
npm run dev
```

Lancer l'observabilité depuis la racine :

```bash
docker compose up -d ai-service prometheus grafana blackbox-exporter
```

Vérifier :

```bash
docker compose ps
```

## URLs

- Frontend : http://localhost:5173
- API IA FastAPI : http://localhost:8000
- Prometheus : http://localhost:9091
- Grafana : http://localhost:3002
- Blackbox Exporter : http://localhost:9116

Les services d'observabilité utilisent le réseau hôte pour que Blackbox Exporter puisse sonder simplement le frontend local et les ports exposés par les futurs services backend.

## Identifiants Grafana

```text
admin / admin
```

Ces identifiants sont réservés à la démonstration locale.

## Dashboard

Le dashboard Grafana est provisionné automatiquement :

```text
HealthAI Coach - Observabilité globale
```

Il affiche :

- statut du frontend ;
- statut de l'API IA FastAPI ;
- statut attendu du backend/gateway NestJS ;
- statut de Prometheus ;
- statut de Grafana ;
- temps de réponse HTTP ;
- codes HTTP ;
- état des futures métriques applicatives.

## Limites

Le frontend React est observé par disponibilité HTTP, pas par métriques applicatives natives.

L'API IA FastAPI est disponible dans `services/ai-service`. La cible NestJS peut rester DOWN sur `mb3` tant que la gateway complete n'est pas lancee.
