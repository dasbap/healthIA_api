# Monitoring HealthAI Coach

## Objectif

Cette configuration ajoute une observabilité locale pour HealthAI Coach avec Prometheus, Grafana et Blackbox Exporter.

Elle permet de surveiller la disponibilité du frontend, des endpoints `/health` attendus, de Prometheus et de Grafana, puis de préparer les futures métriques applicatives FastAPI/NestJS.

## Lancement rapide

Lancer le frontend :

```bash
cd apps/web
npm run dev
```

Lancer l'observabilité depuis la racine :

```bash
docker compose up -d prometheus grafana
```

Vérifier :

```bash
docker compose ps
```

## URLs

- Frontend : http://localhost:5173
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
- statut attendu de l'API IA FastAPI ;
- statut attendu du backend/gateway NestJS ;
- statut de Prometheus ;
- statut de Grafana ;
- temps de réponse HTTP ;
- codes HTTP ;
- état des futures métriques applicatives.

## Limites

Le frontend React est observé par disponibilité HTTP, pas par métriques applicatives natives.

FastAPI et NestJS sont préparés dans la configuration, mais les applications backend ne sont pas encore présentes dans le dépôt. Les cibles correspondantes peuvent donc être DOWN tant que les endpoints `/health` et `/metrics` ne sont pas implémentés.
