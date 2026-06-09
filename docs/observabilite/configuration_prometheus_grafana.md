# Configuration Prometheus / Grafana

## Fichiers ajoutés

```text
monitoring/
├── prometheus/
│   └── prometheus.yml
├── blackbox/
│   └── blackbox.yml
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml
│   │   └── dashboards/
│   │       └── dashboards.yml
│   └── dashboards/
│       └── healthai-overview.json
└── README_MONITORING.md
```

## Services Docker ajoutés

Le fichier `docker-compose.yml` conserve les services existants et ajoute :

| Service | Image | Port hôte | Rôle |
| --- | --- | --- | --- |
| `blackbox-exporter` | `prom/blackbox-exporter:v0.25.0` | `9116` | Vérifie la disponibilité HTTP depuis le réseau hôte |
| `prometheus` | `prom/prometheus:v2.55.1` | `9091` | Collecte et stocke les métriques |
| `grafana` | `grafana/grafana:11.3.0` | `3002` | Affiche les dashboards |

Grafana utilise le port `3002` côté hôte pour éviter les conflits avec le backend NestJS prévu sur `3000` et avec un éventuel service local sur `3001`.

Les trois services d'observabilité utilisent le réseau hôte pour que les sondes locales `localhost` soient fiables pendant la démonstration. Prometheus écoute donc directement sur `localhost:9091`, Grafana sur `localhost:3002` et Blackbox Exporter sur `localhost:9116`.

## Configuration Prometheus

Le fichier `monitoring/prometheus/prometheus.yml` contient :

- un scrape de Prometheus lui-même ;
- un scrape de Blackbox Exporter ;
- des sondes HTTP via le job `healthai-http-availability` ;
- des cibles `/metrics` prêtes pour `nestjs:3000` et `fastapi:8000`.

Les cibles applicatives peuvent être DOWN tant que les services backend ne sont pas implémentés. Ce comportement est volontaire et documenté.

## Configuration Blackbox Exporter

Le fichier `monitoring/blackbox/blackbox.yml` définit un module `http_2xx` qui réalise une requête HTTP GET et considère les codes 2xx comme succès.

Le frontend local est sondé via :

```text
http://localhost:5173
```

Blackbox Exporter utilise le réseau hôte et écoute sur `localhost:9116`. Cela permet de vérifier le frontend Vite lancé localement sur `localhost:5173`, ce qui est plus fiable pour une démonstration locale.

## Configuration Grafana

Grafana est provisionné automatiquement :

- datasource Prometheus : `monitoring/grafana/provisioning/datasources/prometheus.yml` ;
- provider de dashboards : `monitoring/grafana/provisioning/dashboards/dashboards.yml` ;
- dashboard : `monitoring/grafana/dashboards/healthai-overview.json`.

Identifiants de démonstration :

```text
Utilisateur : admin
Mot de passe : admin
```

Ces identifiants sont uniquement prévus pour une démonstration locale.

## Commandes

Lancer le frontend :

```bash
cd apps/web
npm run dev
```

Lancer l'observabilité depuis la racine :

```bash
docker compose up -d prometheus grafana
```

Cette commande démarre aussi `blackbox-exporter` car Prometheus en dépend.

Vérifier les conteneurs :

```bash
docker compose ps
```

Valider la configuration Compose :

```bash
docker compose config
```

## URLs utiles

| Interface | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Prometheus | http://localhost:9091 |
| Grafana | http://localhost:3002 |
| Blackbox Exporter | http://localhost:9116 |

## Variables utiles

Frontend :

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCKS=true
VITE_GRAFANA_URL=http://localhost:3002
```
