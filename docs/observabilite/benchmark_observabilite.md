# Benchmark observabilité HealthAI Coach

## Objectif

L'objectif est de choisir une solution de supervision adaptée à HealthAI Coach : un projet étudiant avec frontend React, services backend prévus, microservice IA FastAPI attendu, Docker Compose et besoin d'une démonstration claire devant un jury.

La solution doit être simple à lancer en local, compréhensible, documentée et capable de montrer l'état des services nutrition, sport, recommandation et API IA.

## Comparaison des solutions

| Solution | Coût | Intégration Docker | Dashboards | Métriques techniques | Courbe d'apprentissage | Pertinence HealthAI |
| --- | --- | --- | --- | --- | --- | --- |
| Prometheus + Grafana | Gratuit en local, open source | Très bonne avec Docker Compose | Très bons dashboards Grafana | Très adapté aux métriques, `/metrics`, sondes HTTP | Moyenne mais défendable | Très élevée |
| ELK / Elastic Stack | Gratuit en partie, plus lourd | Possible mais plus consommateur | Kibana puissant | Plutôt orienté logs que métriques | Plus élevée | Intéressant pour logs futurs, trop lourd ici |
| Datadog | Payant au-delà de l'essai | Très bonne | Très bons dashboards | Très complet | Moyenne | Peu adapté à une démo locale gratuite |
| Zabbix | Open source | Possible | Dashboards corrects | Supervision infra classique | Moyenne à élevée | Moins naturel pour métriques applicatives modernes |
| Grafana Cloud | Offre gratuite limitée | Bonne | Excellent | Dépend du cloud | Moyenne | Bien pour production, moins nécessaire en local |

## Choix retenu

Prometheus + Grafana est le choix le plus adapté pour HealthAI Coach.

Les raisons principales sont :

- solution open source et gratuite en local ;
- très adaptée à la collecte de métriques techniques ;
- facile à intégrer avec Docker Compose ;
- compatible avec FastAPI, NestJS et les exporters Prometheus ;
- lisible en soutenance grâce aux dashboards Grafana ;
- utilisable même si les services applicatifs ne sont pas encore complets, grâce à Blackbox Exporter ;
- cohérente avec les compétences MSPR : architecture, paramétrage, tests, documentation et supervision.

## Pourquoi Blackbox Exporter

Le frontend React/Vite ne fournit pas naturellement de métriques Prometheus. Pour ne pas inventer de métriques fictives, HealthAI Coach utilise Blackbox Exporter pour vérifier la disponibilité HTTP du frontend, de Prometheus, de Grafana et des endpoints `/health` attendus.

Cette approche est simple et honnête : elle montre si un service répond, avec son temps de réponse et son code HTTP, sans prétendre que le frontend expose des métriques applicatives.

## Conclusion

Prometheus + Grafana + Blackbox Exporter donne une observabilité claire, démontrable et réaliste pour HealthAI Coach. La solution reste légère, locale, compatible Docker et extensible lorsque les API FastAPI/NestJS exposeront de vrais endpoints `/metrics`.
