# HealthIA_api

## Observabilité Prometheus / Grafana

Le projet contient une configuration locale d'observabilité pour HealthAI Coach avec Prometheus, Grafana et Blackbox Exporter.

Objectif :

- suivre la disponibilité du frontend React/Vite ;
- suivre les endpoints `/health` attendus côté FastAPI et NestJS ;
- surveiller Prometheus et Grafana ;
- préparer les futures métriques applicatives `/metrics`.

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

URLs utiles :

- Frontend : http://localhost:5173
- Prometheus : http://localhost:9091
- Grafana : http://localhost:3002

Identifiants Grafana de démonstration :

```text
admin / admin
```

Documentation détaillée :

- `monitoring/README_MONITORING.md`
- `docs/observabilite/benchmark_observabilite.md`
- `docs/observabilite/architecture_observabilite.md`
- `docs/observabilite/configuration_prometheus_grafana.md`
- `docs/observabilite/dashboard_grafana.md`
- `docs/observabilite/tests_observabilite.md`
- `docs/observabilite/limites_observabilite.md`

Limite importante : les dossiers `fastapi` et `nestjs` sont présents mais ne contiennent pas encore d'application backend complète. Les targets associées peuvent donc apparaître DOWN jusqu'à l'implémentation des endpoints `/health` et `/metrics`.
