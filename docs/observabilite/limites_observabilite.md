# Limites de l'observabilité

## Limites actuelles

Le frontend React ne fournit pas naturellement de métriques Prometheus. Il est donc surveillé par disponibilité HTTP via Blackbox Exporter.

L'API IA FastAPI est maintenant disponible dans `services/ai-service` avec `/health` et `/metrics`. Le dossier `nestjs` reste un placeholder sur `mb3`; sa cible peut donc rester DOWN tant qu'une gateway NestJS complete n'est pas lancee.

Les métriques métier IA existent sur les appels HTTP et les compteurs de fallback. Elles restent limitees tant qu'un modele nutrition/sport entraine n'est pas branche. Les recommandations nutrition et sport API sont des fallbacks deterministes documentes.

Le dashboard est local. Il ne remplace pas une supervision de production avec authentification renforcée, alerting complet, stockage long terme et gestion des incidents.

Il n'y a pas encore de centralisation de logs ni de traces distribuées.

## Ce qui est réellement observable

Aujourd'hui, on peut observer :

- Prometheus ;
- Grafana ;
- Blackbox Exporter ;
- la disponibilité HTTP du frontend si Vite est lancé ;
- la sonde `/health` de l'API IA FastAPI ;
- les metriques `/metrics` de l'API IA FastAPI ;
- la sonde NestJS si la gateway est lancee.

## Améliorations futures

Les évolutions utiles seraient :

- brancher une gateway NestJS complete si elle devient necessaire ;
- enrichir l'instrumentation FastAPI avec `prometheus-fastapi-instrumentator` si un histogramme plus avance est attendu ;
- instrumenter NestJS avec un module Prometheus compatible ;
- suivre le temps de génération des recommandations IA ;
- suivre le taux d'erreur par endpoint ;
- suivre le nombre de recommandations nutrition/sport générées ;
- superviser MongoDB avec un exporter dédié ;
- ajouter des alertes Grafana ;
- centraliser les logs avec Loki ou Elastic ;
- ajouter des traces distribuées avec OpenTelemetry.

## Positionnement soutenance

Ces limites ne sont pas des échecs : elles montrent une architecture progressive. La priorité est d'avoir une base stable, lisible et honnête, puis de brancher progressivement les métriques métier quand les services backend seront complets.

Cette approche permet de démontrer les compétences attendues sans inventer de faux indicateurs.
