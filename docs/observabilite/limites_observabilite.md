# Limites de l'observabilité

## Limites actuelles

Le frontend React ne fournit pas naturellement de métriques Prometheus. Il est donc surveillé par disponibilité HTTP via Blackbox Exporter.

Les dossiers `fastapi` et `nestjs` existent, mais ne contiennent pas encore d'application complète. Les endpoints `/health` et `/metrics` sont donc des cibles attendues, pas des services garantis dans l'état actuel du dépôt.

Les métriques métier IA sont limitées tant que le moteur IA réel n'est pas connecté. Les recommandations nutrition, sport et analyse repas restent majoritairement en mode démo/mocks côté frontend.

Le dashboard est local. Il ne remplace pas une supervision de production avec authentification renforcée, alerting complet, stockage long terme et gestion des incidents.

Il n'y a pas encore de centralisation de logs ni de traces distribuées.

## Ce qui est réellement observable

Aujourd'hui, on peut observer :

- Prometheus ;
- Grafana ;
- Blackbox Exporter ;
- la disponibilité HTTP du frontend si Vite est lancé ;
- les tentatives de sondes `/health` vers FastAPI et NestJS ;
- les futures cibles `/metrics` dès qu'elles seront implémentées.

## Améliorations futures

Les évolutions utiles seraient :

- ajouter `/health` dans FastAPI et NestJS ;
- instrumenter FastAPI avec `prometheus-fastapi-instrumentator` ;
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
