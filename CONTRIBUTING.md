# Contributing to THREADS

Thank you for your interest in contributing. This document covers how to set up a development environment, the contribution workflow, and coding conventions.

## Development Setup

### Prerequisites

- Docker Desktop (or Docker + Compose v2)
- Node.js 22+ and npm 10+
- Python 3.12+
- Git

### First-time setup

```bash
git clone https://github.com/catalystnexusllc-hub/threads-platform.git
cd threads-platform

# Start the full stack (Postgres + API + Web)
cp .env.example .env
docker compose up --build
```

### Running services individually

**Backend (FastAPI):**
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://threads:threads@localhost:5432/threads
export API_KEY=dev
uvicorn app.main:app --reload --port 8000
```

**Frontend (React + Vite):**
```bash
cd web
npm install
echo "VITE_API_KEY=dev" > .env.local
npm run dev   # http://localhost:5173
```

**ETL:**
```bash
cd etl
pip install -r requirements.txt
export DATABASE_URL=postgresql://threads:threads@localhost:5432/threads
export DESTINATION__POSTGRES__CREDENTIALS=$DATABASE_URL
export ETL_DROP_DIR=/tmp/threads-drop
python run.py
```

## Contribution Workflow

1. **Fork** the repository and create a branch from `main`.
2. **Make your changes.** Follow the conventions below.
3. **Test locally** with `docker compose up --build` to verify the full stack.
4. **Lint:** `cd web && npm run lint`
5. **Open a pull request** against `main`. Include a description of *why* the change is needed.

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<short-desc>` | `feat/s4-equipment-page` |
| Bug fix | `fix/<short-desc>` | `fix/medpros-null-dodid` |
| ETL | `etl/<source-name>` | `etl/iperms-connector` |
| Docs | `docs/<topic>` | `docs/deployment-guide` |

## Commit Message Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(s1): add leave tracker table wired from IPPSA full roster
fix(etl): handle null dodid in MEDPROS bulk extract
docs(arch): update Mermaid diagram for entity tables
chore(deps): bump dlt to 1.5.0
```

Scope should be the component affected: `s1`–`s9`, `etl`, `api`, `db`, `k8s`, `web`, `arch`.

## Code Conventions

### Python (backend + ETL)

- Python 3.12+; type hints on all public functions.
- `asyncpg` for all database access — no synchronous DB calls in the API.
- ETL resources must be **idempotent** — always `write_disposition="replace"` + `ON CONFLICT DO UPDATE` in merge SQL.
- Each new SOR connector = one `@dlt.resource` function + one staging table migration + one merge block. No monolithic functions.
- No business logic in `app/main.py` — route handlers call `db.py` helpers only.

### TypeScript / React

- React 19 functional components with hooks; no class components.
- CSS Modules for all styling — no inline styles except for truly dynamic values (colors from data).
- No `any` types; use the types defined in `web/src/types/`.
- Pages are self-contained under `web/src/pages/`; shared UI goes under `web/src/components/`.
- Data access only through `ArmyDataContext` — no direct `fetch` calls inside page components.

### SQL (migrations)

- All migrations are `IF NOT EXISTS` — idempotent and safe to replay.
- New migrations go in `migrations/000N_<description>.sql` (increment N).
- Every new table gets an `updated_at` column + the `core.touch_updated_at()` trigger.
- Add expression indexes for JSONB columns that queries filter on.

### Kubernetes / Docker

- All containers run as non-root; use numeric UIDs.
- Resource requests/limits on all Deployments.
- `livenessProbe` + `readinessProbe` on all application pods.
- Secrets via environment variables from `SecretKeyRef`, never hardcoded in manifests.

## Adding a New SOR Connector

1. Add a `@dlt.resource` in [`etl/pipeline.py`](etl/pipeline.py) that reads from `_read_records("<source>")`, handles both flat and envelope formats via `_iter_nested`, normalizes to `dodid` (EDIPI === DODID), and yields `_raw`.
2. Add the resource to `threads_sources()`.
3. Create `migrations/000N_staging_<source>.sql` with the new `staging.<resource>` table.
4. Add a merge block in [`etl/merge.sql`](etl/merge.sql) targeting the appropriate `core.*` table.
5. Add demo data in `seed/datasets/external-sor/demo-unit-<SOURCE>.json`.
6. Update [`ARCHITECTURE.md`](ARCHITECTURE.md) SOR connector table.
7. Update the Integration Map in [`web/src/pages/army/components/NavBar/IntegrationMap.tsx`](web/src/pages/army/components/NavBar/IntegrationMap.tsx).

## Pull Request Checklist

- [ ] `docker compose up --build` succeeds and the app loads
- [ ] `cd web && npm run lint` passes with no errors
- [ ] New ETL connectors have a corresponding demo data file in `seed/datasets/`
- [ ] New migrations are `IF NOT EXISTS` (idempotent)
- [ ] New core tables have `updated_at` + trigger
- [ ] No secrets, real PII, or classified content committed
- [ ] Seed data disclaimer preserved if adding new demo data files

## Reporting Issues

Use [GitHub Issues](https://github.com/catalystnexusllc-hub/threads-platform/issues). Include:

- Steps to reproduce
- Expected vs. actual behavior
- Environment (Docker version, OS, browser if frontend)
- Relevant logs (`docker compose logs api` / browser console)

## Questions

Open a [GitHub Discussion](https://github.com/catalystnexusllc-hub/threads-platform/discussions) for questions about architecture, roadmap, or integration patterns.
