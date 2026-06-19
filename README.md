# THREADS

**Tactical Hub for Readiness, Execution, Administration, Data & Sync**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-compose%20ready-2496ED.svg?logo=docker)](docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi)](app/main.py)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](web/package.json)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql)](migrations/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-manifests-326CE5.svg?logo=kubernetes)](k8s/)

THREADS is a full-stack unit management and readiness platform designed for disconnected, intermittent, and limited (DIL) environments. It ingests data from up to 14 authoritative Army Systems of Record (SOR) via a Python `dlt`-based ETL pipeline, consolidates it into a PostgreSQL relational core, and serves it to a React 19 single-page application through a FastAPI REST layer.

The platform is deployable via **Docker Compose** (development), **Kubernetes** (staging/cloud), and **Zarf/UDS** (production air-gap).

---

## Architecture

```
┌─────────────────── External Systems of Record (SOR) ───────────────────────┐
│  IPPS-A · MEDPROS · DTMS · DISS · JKO · STEPP · GCSS-Army · DTS · ATTARS  │
│  iPERMS · TMT · FMSWeb · ATCTS                                              │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │ JSON drops  (ETL_DROP_DIR/<source>/*.json)
                              ▼
                    ┌─────────────────┐
                    │   ETL CronJob   │   Python dlt (extract + schema evolution)
                    │  etl/pipeline.py│──► staging.* tables
                    │  etl/merge.sql  │──► core.* tables  (idempotent upserts)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  PostgreSQL 16  │   relational spine + JSONB leaves
                    │  core.*         │   core.soldiers, core.equipment_lines, …
                    │  staging.*      │   14 per-source staging tables
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   FastAPI API   │   asyncpg · bearer-token auth · CORS
                    │  app/main.py    │   GET /api/data  PUT /api/soldiers/:id
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  React 19 SPA   │   TypeScript · Vite · CSS Modules
                    │  served by nginx│   S1–S9 staff sections + unit views
                    └─────────────────┘
```

### Deployment Tiers

| Tier | Tool | Target |
|---|---|---|
| Development | `docker compose up --build` | Local workstation |
| Staging / cloud | `kubectl apply -k deploy/k3d` | k3d or any K8s cluster |
| Production (air-gap) | `zarf package deploy` | Disconnected environments |

---

## Features

- **14-source ETL pipeline** — ingests from IPPS-A, MEDPROS, DTMS, DISS, JKO, STEPP, GCSS-Army, DTS, ATTARS, iPERMS, TMT, FMSWeb MTOE, and ATCTS/AUP; new SOR sources add a `@dlt.resource` + a migration, not a schema rewrite
- **S1–S9 coordinating staff sections** — Personnel, Intelligence, Operations, Logistics, Plans, Communications, Training, Finance, Civil Affairs; each section consumes its relevant SOR data
- **Special Staff pages** — Medical, SHARP/EO, Finance, Safety, CBRN, Career Counselor
- **Integration Map** — in-app panel showing all connected/pending/planned SOR integrations with field-level descriptions
- **Unit hierarchy** — Group → Battalion → Company views with configurable MTOE positions
- **Leave tracker** — sourced from IPPS-A DA Form 31 leave data
- **Awards pipeline** — tracks nominations through submission
- **Clearance tracking** — DISS PR due dates, eligibility status
- **Equipment readiness** — GCSS-Army property book with FMC/PMC/NMC status
- **Travel management** — DTS authorization and voucher tracking
- **Task management** — TMT cross-section suspense tracking
- **Relational spine + JSONB leaves** — PostgreSQL schema pattern that handles mixed-type fields and arbitrary SOR structure variance without schema changes
- **Idempotent ETL** — `ON CONFLICT DO UPDATE` merge SQL; safe to replay; staging schema auto-evolved by dlt
- **Air-gap packaging** — Zarf/UDS bundle wraps all images and Kubernetes manifests for offline install
- **Zero-trust API** — bearer-token or `X-Api-Key` header; build-time inlined into SPA bundle

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + TypeScript + Vite | 19 / ~6.0 / 8.x |
| Routing | React Router | 7.x |
| Styling | CSS Modules | — |
| API | FastAPI + uvicorn | 0.115 / 0.34 |
| DB driver | asyncpg | 0.30 |
| Database | PostgreSQL | 16 |
| ETL | dlt (data load tool) | 1.4 |
| Web server | nginx | 1.27 |
| Container | Docker / Compose | — |
| Orchestration | Kubernetes | 1.29+ |
| Air-gap | Zarf / UDS | — |
| CI/CD | GitHub Actions (self-hosted) | — |

---

## Quick Start

**Prerequisites:** Docker Desktop (or Docker + Compose v2), Git

```bash
git clone https://github.com/catalystnexusllc-hub/threads-platform.git
cd threads-platform
cp .env.example .env          # review and adjust if needed
docker compose up --build
```

Open **http://localhost:8080** — the SPA loads with demo data already seeded.

The API is also accessible directly at **http://localhost:8000/api/health**.

### What runs

| Container | Port | Notes |
|---|---|---|
| `web` | 8080 | nginx serving the built React SPA; `/api` proxied to `api:8000` |
| `api` | 8000 | FastAPI + uvicorn; runs DB migrations and seeds on startup |
| `postgres` | (internal) | PostgreSQL 16; named volume `threads-pg` |

---

## Configuration

All configuration is via environment variables. Copy `.env.example` to `.env` and set:

| Variable | Default | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | — | **Yes** | PostgreSQL DSN: `postgresql://user:pass@host:5432/db` |
| `API_KEY` | (empty) | No | Bearer token for all `/api` routes. Empty = open (dev only). |
| `CORS_ORIGIN` | `http://localhost:3000` | No | Comma-separated allowed origins. Use `*` only in isolated airgap. |
| `NODE_ENV` | `development` | No | Label echoed by `/api/health`. |

**Web build-time variable** (baked into the SPA bundle):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_KEY` | (empty) | Sent as `X-Api-Key` header on all API calls. Must match `API_KEY`. |

---

## ETL Pipeline

### How it works

```
ETL_DROP_DIR/<source>/*.json
        ↓ dlt extract (etl/pipeline.py)
staging.<source> tables          ← dlt replaces each run
        ↓ idempotent SQL merge (etl/merge.sql)
core.* tables                    ← upserts on natural keys (dodid, lin, task_id …)
        ↓ FastAPI /api/data
React frontend
```

1. **Extract:** Each SOR system drops a JSON file (array or JSON-lines) into `ETL_DROP_DIR/<source>/`. The `etl/pipeline.py` dlt resources read these files, handle both flat and nested-envelope formats, normalize field names, and load into `staging.*` tables.

2. **Load:** `etl/run.py` triggers dlt → staging, then executes `etl/merge.sql` inside a single transaction. Each block upserts staging rows into the corresponding core table on the natural key. `DISTINCT ON` collapses duplicate staging rows (latest wins).

3. **Provenance:** Every row in `core.*` carries `source_system` and `updated_at`. App-side edits carry `source_system='app'` so ETL and manual edits are always distinguishable.

### SOR connectors

| Resource | Drop dir | Core target | Join key |
|---|---|---|---|
| `ipps_a_personnel` | `ipps_a/` | `core.soldiers` | EDIPI/DODID |
| `medpros_readiness` | `medpros/` | `core.soldier_medical` | DODID |
| `dtms_training` | `dtms/` | `core.soldier_acft` | DODID |
| `diss_clearances` | `diss/` | `core.soldier_clearance` | DODID |
| `jko_completions` | `jko/` | `core.soldier_training` (jko key) | DODID |
| `stepp_certs` | `stepp/` | `core.soldier_training` (stepp key) | DODID |
| `attars_training` | `attars/` | `core.soldier_training` (attars key) | DODID |
| `attars_events` | `attars/` | `core.training_events` | event_id |
| `iperms_records` | `iperms/` | `core.soldier_admin_docs` | DODID |
| `cyber_aup` | `atcts/` | `core.soldier_training` (aup key) | DODID |
| `gcss_equipment` | `gcss/` | `core.equipment_lines` | LIN + NSN |
| `dts_travel` | `dts/` | `core.travel_authorizations` | auth_number |
| `tmt_tasks` | `tmt/` | `core.tmt_tasks` | task_id |
| `fmsweb_positions` | `fmsweb/` | `core.mtoe_positions` | para_line |

### Running the ETL manually

```bash
# Inside the running api container (seeds bundled datasets)
docker compose exec api python -c "from etl.run import main; main()"

# Or run the ETL container standalone
docker compose run --rm etl
```

### Adding a new SOR connector

1. Add a `@dlt.resource` in `etl/pipeline.py` that reads from `_read_records("<source>")` and yields normalized fields + `_raw`.
2. Add the resource to `threads_sources()`.
3. Add a staging table in a new migration (`migrations/000N_*.sql`).
4. Add a merge block in `etl/merge.sql`.
5. Drop JSON files into `ETL_DROP_DIR/<source>/` and run the ETL.

---

## Database Schema

The schema follows a **relational spine + JSONB leaves** pattern:

- **Relational spine:** Real tables with foreign keys for entities and collections the ETL joins on (`core.soldiers`, `core.units`, `core.standup_events`, etc.). `soldiers.dodid` is the natural ETL key.
- **JSONB leaves:** Per-source 1:1 side tables (`soldier_medical`, `soldier_acft`, `soldier_training`, `soldier_clearance`, `soldier_admin_docs`) carry arbitrary SOR payload as JSONB. This handles mixed-type fields and structure variance without schema changes.
- **Entity tables:** Non-soldier-keyed sources get their own tables (`core.equipment_lines`, `core.travel_authorizations`, `core.tmt_tasks`, `core.mtoe_positions`, `core.training_events`).

See [`migrations/0001_core_schema.sql`](migrations/0001_core_schema.sql) for the full schema with commentary.

### Key tables

```
core.soldiers              — relational spine; dodid is the ETL natural key
core.soldier_medical       — MEDPROS leaf (JSONB)
core.soldier_acft          — DTMS AFT/training leaf (JSONB)
core.soldier_training      — multi-source training leaf: jko/stepp/attars/aup keys (JSONB)
core.soldier_clearance     — DISS clearance leaf
core.soldier_admin_docs    — iPERMS OMPF completeness
core.equipment_lines       — GCSS-Army property book (keyed on lin+nsn)
core.travel_authorizations — DTS travel (keyed on auth_number)
core.tmt_tasks             — TMT task management (keyed on task_id)
core.mtoe_positions        — FMSWeb MTOE authorized positions (keyed on para_line)
core.training_events       — ATTARS training events (keyed on event_id)
```

---

## API Reference

All routes require `Authorization: Bearer <API_KEY>` or `X-Api-Key: <API_KEY>` (unless `API_KEY` is empty).

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check; returns `{status, env, ts}` |
| `GET` | `/api/data` | Full data payload (soldiers, units, sections, events, sitreps, leader groups) |
| `PUT` | `/api/soldiers/:id` | Update a soldier record (partial update, preserves unset fields) |
| `GET` | `/api/sections/:unit` | Get all sections for a unit |
| `POST` | `/api/sections/:unit` | Create a section |
| `PUT` | `/api/sections/:unit/:key` | Update a section |
| `GET` | `/api/sitreps` | List all sitrep records |
| `PUT` | `/api/sitreps/:index` | Upsert a sitrep by position index |
| `GET` | `/api/events` | List standup events |
| `POST` | `/api/events` | Create standup event |
| `PUT` | `/api/events/:id` | Update standup event |
| `DELETE` | `/api/events/:id` | Delete standup event |
| `GET` | `/api/leader-groups` | Get leader group layout |
| `PUT` | `/api/leader-groups` | Replace leader group layout |
| `PUT` | `/api/locations` | Update leader location assignments |

---

## Kubernetes Deployment

### Prerequisites

- `kubectl` configured against your cluster
- Namespace `threads` (auto-created by manifests)
- A PostgreSQL instance accessible from the cluster (or use the bundled StatefulSet)

### Deploy

```bash
# Create the secret (replace values)
kubectl create secret generic threads-secret \
  --namespace threads \
  --from-literal=API_KEY=your-api-key \
  --from-literal=PG_PASSWORD=your-pg-password \
  --from-literal=DATABASE_URL=postgresql://threads:your-pg-password@postgres:5432/threads

# Apply all manifests
kubectl apply -k k8s/

# Watch rollout
kubectl rollout status deployment/api -n threads
kubectl rollout status deployment/web -n threads
```

### ETL CronJob

```bash
# Trigger ETL manually
kubectl create job --from=cronjob/etl etl-manual -n threads

# Watch logs
kubectl logs -l job-name=etl-manual -n threads -f
```

---

## Air-Gap Deployment (Zarf / UDS)

THREADS ships as a Zarf package for disconnected/air-gapped environments.

```bash
# On a connected machine — build the package
zarf package create . --confirm

# Transfer threads-*.zst to the air-gapped system, then:
zarf package deploy threads-*.zst --confirm

# Or deploy as a full UDS bundle
uds deploy uds-bundle-threads-*.tar.zst --confirm
```

See [`DEPLOY-k3d.md`](DEPLOY-k3d.md) for the full k3d staging workflow.

---

## Development

### Frontend

```bash
cd web
npm install
cp .env.example .env.local   # set VITE_API_KEY if your API uses one
npm run dev                  # Vite dev server at http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:8000` (see `vite.config.ts`).

### Backend

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://threads:threads@localhost:5432/threads
export API_KEY=dev-key
uvicorn app.main:app --reload --port 8000
```

The API auto-applies migrations and seeds demo data from `seed/seed.json` on first startup.

### ETL

```bash
cd etl
pip install -r requirements.txt
export DATABASE_URL=postgresql://threads:threads@localhost:5432/threads
export DESTINATION__POSTGRES__CREDENTIALS=$DATABASE_URL
export ETL_DROP_DIR=/path/to/your/drop/dir
python run.py
```

To test with the bundled demo data, copy the `seed/datasets/external-sor/` files into subdirectories matching the source names (`ipps_a/`, `medpros/`, `dtms/`, etc.) under `ETL_DROP_DIR`.

---

## Project Structure

```
threads-platform/
├── app/
│   ├── main.py              # FastAPI application, routes, auth middleware
│   └── db.py                # asyncpg pool, migration runner, data reconstruction
├── etl/
│   ├── pipeline.py          # dlt resources — one per SOR connector
│   ├── run.py               # ETL entrypoint: dlt load + SQL merge
│   ├── merge.sql            # 14 idempotent staging→core upsert blocks
│   └── stage_datasets.py    # Helper to stage bundled demo datasets
├── migrations/
│   ├── 0001_core_schema.sql # Relational core: soldiers, events, leave, awards …
│   ├── 0002_etl_staging.sql # Initial staging tables (IPPS-A, MEDPROS, DTMS)
│   ├── 0003_staging_expansion.sql  # 13 new staging tables + 6 new core entity tables
│   └── 0004_staging_dlt_owned.sql  # dlt schema ownership migration
├── seed/
│   ├── seed.json            # Initial data seeded by the API on first startup
│   └── datasets/
│       ├── external-sor/    # 16 JSON files simulating SOR API drops
│       └── internal/        # 9 JSON files for THREADS-native data
├── web/
│   └── src/
│       ├── pages/army/      # Army branch: ArmyApp, S1–S9 pages, unit pages
│       ├── components/      # Shared UI: SiteHeader, ClassificationBanner
│       └── types/           # TypeScript type definitions
├── nginx/
│   └── threads.conf         # SPA serving + /api reverse proxy
├── k8s/                     # Kubernetes manifests (namespace → postgres → api → web → etl CronJob)
├── deploy/k3d/              # kustomize overlay for k3d staging
├── pipelines/
│   └── coordinating-staff-data-pipeline.md  # Field-level SOR→UI mapping for all staff sections
├── Dockerfile.api
├── Dockerfile.web           # Multi-stage: Node build → nginx serve
├── Dockerfile.etl
├── docker-compose.yml
├── zarf.yaml                # Zarf air-gap package definition
├── uds-bundle.yaml          # UDS bundle wrapping the Zarf package
└── .github/workflows/
    └── deploy-k3d.yml       # CI: build → import into k3d → rolling deploy
```

---

## Roadmap

- [x] PostgreSQL 16 backend replacing SQLite
- [x] FastAPI REST layer with asyncpg
- [x] API key authentication
- [x] dlt-based ETL with 14 SOR connectors
- [x] Idempotent SQL merge (staging → core)
- [x] React 19 SPA with full S1–S9 staff sections
- [x] Unit hierarchy (Group → Battalion → Company)
- [x] Special Staff pages (Medical, SHARP, Finance, Safety, CBRN)
- [x] Integration Map panel (in-app SOR status)
- [x] Kubernetes manifests + Zarf/UDS air-gap packaging
- [x] Self-hosted CI/CD (GitHub Actions → k3d)
- [ ] Edit forms wired to PUT endpoints (currently read-only for most fields)
- [ ] CAC/PIV authentication (replace API key)
- [ ] Navy and Air Force branch verticals
- [ ] Dagster asset-based ETL orchestration
- [ ] Real-time sync via WebSocket push
- [ ] STIG-hardened container images
- [ ] IL4/IL5 deployment guide

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting instructions.

## License

Apache 2.0 — see [LICENSE](LICENSE).

---

> **Demo data notice:** All personnel records, unit data, and operational content included in `seed/` are completely synthetic and procedurally generated. No real DoD personnel records or sensitive information is included. See [`seed/README.md`](seed/README.md).
