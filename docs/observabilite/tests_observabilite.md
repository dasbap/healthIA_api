# Tests d'observabilité

## Préparation

Depuis la racine du projet, vérifier la configuration Docker Compose :

```bash
docker compose config
```

Lancer le frontend dans un terminal séparé :

```bash
cd apps/web
npm run dev
```

Lancer l'observabilité :

```bash
docker compose up -d prometheus grafana
```

`blackbox-exporter` démarre automatiquement grâce à la dépendance de Prometheus.

## Vérifier les conteneurs

```bash
docker compose ps
```

Les services attendus pour la partie observabilité :

- `blackbox-exporter` ;
- `prometheus` ;
- `grafana`.

## Vérifier les logs

```bash
docker compose logs prometheus
docker compose logs grafana
docker compose logs blackbox-exporter
```

Les logs ne doivent pas contenir d'erreur bloquante de chargement de configuration.

## Vérifier Prometheus

Ouvrir :

```text
http://localhost:9091
```

Aller dans `Status > Targets` et vérifier :

- `prometheus` UP ;
- `blackbox-exporter` UP ;
- `healthai-http-availability` avec les cibles visibles ;
- `healthai-api-metrics` prêt pour les futurs endpoints `/metrics`.

Les targets FastAPI/NestJS peuvent être DOWN tant que les services backend ne sont pas disponibles.

## Vérifier Grafana

Ouvrir :

```text
http://localhost:3002
```

Connexion :

```text
admin / admin
```

Vérifier que le dashboard `HealthAI Coach - Observabilité globale` est présent dans le dossier `HealthAI Coach`.

## Test UP/DOWN

1. Lancer le frontend avec `npm run dev`.
2. Vérifier que le panel `Frontend React` passe UP.
3. Arrêter le frontend.
4. Attendre un ou deux intervalles de scrape.
5. Vérifier que le panel passe DOWN.
6. Relancer le frontend.
7. Vérifier que le panel repasse UP.

## Tests frontend

Depuis `apps/web` :

```bash
npm run test
npm run build
```

Ces commandes vérifient que l'ajout du lien Grafana ne casse ni les tests existants ni le build React.

## Résultat attendu

La démonstration doit permettre de montrer :

- la disponibilité du frontend ;
- la disponibilité de Prometheus et Grafana ;
- les endpoints `/health` attendus ;
- la différence entre services réels et services encore à implémenter ;
- une base prête pour les futures métriques API.
