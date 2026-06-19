# THREADS — Architecture Reference

## Overview

THREADS follows a classic **three-tier web architecture** with a purpose-built ETL pipeline feeding the database. The design priorities are:

1. **Disconnected operation** — the full stack runs on a single Kubernetes node with no internet dependency; SOR data arrives via file drops, not live API calls.
2. **Schema resilience** — external SOR data structures change without notice; the relational spine + JSONB leaves pattern absorbs structure variance without migrations.
3. **Idempotency** — the ETL can be replayed any number of times; every merge is a `ON CONFLICT DO UPDATE` with `DISTINCT ON` deduplication.
4. **Source provenance** — every row in `core.*` carries `source_system` and `updated_at`; manual edits (`source_system='app'`) and ETL writes (`source_system='IPPS-A'`, etc.) are always distinguishable.

---

## Component Diagram

```
┌──────────────────────── Kubernetes Namespace: threads ─────────────────────────┐
│                                                                                 │
│  ┌───────────────┐     ┌──────────────────┐     ┌───────────────────────────┐  │
│  │  nginx (SPA)  │────►│  FastAPI (api)   │────►│  PostgreSQL 16 (core.*)  │  │
│  │  Deployment   │     │  Deployment      │     │  StatefulSet              │  │
│  │  :80          │     │  :8000           │     │  :5432                    │  │
│  └───────────────┘     └──────────────────┘     └───────────────────────────┘  │
│                                                            ▲                    │
│                                              ┌─────────────┘                   │
│                                              │ staging.* → core.*              │
│                                    ┌─────────┴────────┐                        │
│                                    │  ETL CronJob     │                        │
│                                    │  dlt pipeline    │                        │
│                                    └──────────────────┘                        │
│                                            ▲                                   │
│                                    ┌───────┴──────────┐                        │
│                                    │  etl-drop PVC    │  (file drops from SOR) │
│                                    └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Pattern: Relational Spine + JSONB Leaves

The core schema separates concerns between:

- **Relational entities** — tables with proper FK relationships for data the application joins on programmatically (soldiers, units, events, leave, awards).
- **SOR-specific JSONB leaves** — per-source 1:1 side tables where each SOR owns a `data jsonb` column that carries its full raw payload. Each source has its own table so provenance is explicit and sources don't contend on a single row.

This handles the primary challenge of military SOR data: **mixed types within a single logical field** (e.g., an AFT score is `540` for most soldiers but `"N/A"` for one who hasn't tested; JSONB round-trips both without coercion loss).

### Schema Map

```
core.soldiers          (identity spine)
  │  FK ─────────────────────────────────────────────────────────────┐
  ├── core.soldier_medical       (MEDPROS → data jsonb)              │
  ├── core.soldier_acft          (DTMS AFT → data jsonb)             │
  ├── core.soldier_training      (JKO+STEPP+ATTARS+AUP → data jsonb) │
  ├── core.soldier_clearance     (DISS → clearance fields + data)    │
  ├── core.soldier_admin_docs    (iPERMS → dd93/sglv/prr jsonb)      │
  ├── core.soldier_leave         (IPPS-A DA31 → balance/use-lose)    │
  └── core.soldier_awards        (awards pipeline nominations)       │
                                                                     │
core.units             ◄────────────────────────────────────────────┘
  └── core.unit_sections

core.standup_events    (battle rhythm / recurring meetings)
core.sitreps           (monthly readiness reports)
core.leader_groups     (command team live/closeout board layout)
  └── core.leaders
      └── core.leader_locations

core.equipment_lines   (GCSS-Army property book; keyed on lin+nsn)
core.travel_authorizations  (DTS; keyed on auth_number)
core.tmt_tasks         (TMT; keyed on task_id)
core.mtoe_positions    (FMSWeb MTOE; keyed on para_line)
core.training_events   (ATTARS unit-level events; keyed on event_id)
```

---

## ETL Pipeline Detail

### Extract Phase (`etl/pipeline.py`)

Each `@dlt.resource` corresponds to one SOR. Resources:

1. **Read:** `_read_records(source)` globs `ETL_DROP_DIR/<source>/*.json` and yields each record, handling both JSON array files and JSON-lines files.
2. **Unwrap:** `_iter_nested(records, key)` handles the two common drop formats — envelope objects (`{extractMetadata, soldiers: [...]}`) and flat arrays.
3. **Normalize:** Each resource maps source-specific field names to stable column names, normalizes `edipi → dodid` (EDIPI === DODID, 10-digit DoD ID), and always preserves `_raw: jsonb` for the full original record.
4. **Schema:** `write_disposition="replace"` means each run replaces all staging rows for that source. dlt auto-evolves the staging table schema if new fields appear in a drop.

### Load Phase (`etl/merge.sql`)

The merge SQL runs inside a single `BEGIN/COMMIT` transaction after dlt completes. Each block:

```sql
-- Pattern: soldier-keyed source → core side table
INSERT INTO core.soldier_medical (soldier_id, data, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id, s._raw, 'MEDPROS', now()
FROM staging.medpros_readiness s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._loaded_at DESC          -- latest staging row wins
ON CONFLICT (soldier_id) DO UPDATE SET
  data = EXCLUDED.data, ...;

-- Pattern: multi-source training leaf (JSONB merge per source key)
ON CONFLICT (soldier_id) DO UPDATE SET
  data = core.soldier_training.data
       || jsonb_build_object('jko', EXCLUDED.data->'jko');
  -- subsequent sources (STEPP, ATTARS, AUP) each add their own key

-- Pattern: entity-keyed source → own core table
INSERT INTO core.equipment_lines (lin, nsn, ...)
SELECT DISTINCT ON (s.lin, COALESCE(s.nsn, ''))
       ...
FROM staging.gcss_equipment s
ON CONFLICT (lin, nsn) DO UPDATE SET ...;
```

### Multi-Source Training Leaf

`core.soldier_training.data` is a JSONB object where each SOR adds its own top-level key:

```json
{
  "jko":    { "overallStatus": "Current", "completions": [...] },
  "stepp":  { "clearanceLevel": "TS/SCI", "overallStatus": "Current" },
  "attars": { "aft": {...}, "weaponsQual": {...}, "readinessFlag": "GREEN" },
  "aup":    { "aup": "Current", "cyber": "Current", "sharp": "Current" }
}
```

This pattern avoids `ON CONFLICT` last-writer-wins overwriting between sources that all touch training readiness.

---

## Frontend Architecture

### Stack

- **React 19** with concurrent features
- **React Router 7** for client-side routing
- **CSS Modules** — scoped styles per component, no CSS-in-JS runtime
- **Vite 8** — HMR in dev, optimized bundle in prod

### Data Flow

```
ArmyDataContext (top-level)
  └─ fetches GET /api/data on mount
  └─ provides { soldiers, units, sections, events, sitreps, leaderGroups }
       └─ S1Page reads soldiers → filters by unit/section
       └─ S4Page reads soldiers → joins with equipment from API
       └─ UnitPage reads sections → renders section grid
```

### Page Structure

```
web/src/pages/army/
├── ArmyApp.tsx          — top-level router + page dispatch
├── ArmyDataContext.tsx  — global data fetch + state
├── UserContext.tsx       — demo profile switcher (rank, unit level)
├── components/
│   ├── NavBar/          — header nav + Integration Map modal
│   ├── SectionSidebar/  — left-side staff section nav
│   └── ClassificationBanner/
└── pages/
    ├── S1/ … S9/        — coordinating staff section pages
    ├── UnitPage/         — unit-level view (Train/Man/Equip/COP tabs)
    ├── SpecialStaff/     — Medical, SHARP, Finance, Safety, CBRN pages
    └── CommandTeam/      — Commander, XO, CSM, Chaplain, IG, JAG, PAO
```

---

## API Design

The API is a thin REST layer over PostgreSQL. It does not contain business logic — all filtering and aggregation happens in the client or in the database merge SQL.

### Auth

```
GET /api/data
Authorization: Bearer <API_KEY>
# or
X-Api-Key: <API_KEY>
```

If `API_KEY` env var is empty, auth is disabled (development only).

### Data reconstruction

`GET /api/data` reconstructs the full JSON payload from PostgreSQL relational tables. The reconstruction logic in `app/db.py` mirrors the original seed schema so the frontend receives the same shape regardless of whether data came from the seed file or from ETL.

Key reconstructions:
- Soldier fields spread from `core.soldiers` + `profile_extra jsonb` (handles mixed-type fields like `evalDays`)
- Medical status from `core.soldier_medical.data` joined to soldier
- ACFT from `core.soldier_acft.data`
- Leave entries from `core.soldier_leave` + `core.soldier_leave_entries`
- Awards from `core.soldier_awards` grouped by bucket

---

## Deployment Architecture

### Docker Compose (Development)

```yaml
services:
  postgres:   # PostgreSQL 16, healthcheck, named volume
  api:        # FastAPI; depends_on postgres healthy; runs migrations+seed on start
  web:        # nginx SPA; /api proxied to api:8000
```

### Kubernetes (Staging / Production Cloud)

```
namespace: threads
├── postgres       StatefulSet + PVC + Service (ClusterIP)
├── api            Deployment (2 replicas) + Service (ClusterIP)
├── web            Deployment (2 replicas) + Service (ClusterIP)
├── ingress        nginx Ingress Controller
└── etl            CronJob (runs ETL on schedule)
    └── etl-drop   PVC (shared between CronJob and any SOR feed agents)
```

### Air-Gap (Zarf / UDS)

The `zarf.yaml` defines a package that:
1. Bundles all three container images (api, web, etl)
2. Bundles the Kubernetes manifests
3. Bundles the kustomize overlay for the target cluster
4. Exposes `API_KEY` and `PG_PASSWORD` as Zarf variables (prompted at deploy time)

The `uds-bundle.yaml` wraps the Zarf package in a UDS bundle alongside any mission-required sidecar packages (e.g., Istio service mesh, KeyCloak for CAC auth).

---

## Security Considerations

- **API key** is the current auth mechanism; intended for replacement with CAC/PIV (PKCS#11 + X.509) in production.
- The SPA receives `VITE_API_KEY` at build time via `--build-arg`. In air-gap production, the build happens on the packaging side (connected system) and the key is never transmitted post-deploy.
- All containers run as non-root users (`threads:10001`, `etl:10002`).
- PostgreSQL credentials are injected via Kubernetes Secret, never stored in manifests.
- `CORS_ORIGIN` should be set to the specific ingress hostname in production, not `*`.
- The ETL drop PVC is write-accessible only to SOR feed agents — read by the ETL CronJob; the API has no access.

---

## Extension Points

| Extension | Where |
|---|---|
| New SOR connector | `etl/pipeline.py` → new `@dlt.resource` + migration + merge block |
| New branch vertical | `web/src/pages/branch/` — mirror the `army/` structure |
| Dagster integration | Wrap each `@dlt.resource` as a `@asset`; `run.py` becomes an op |
| Real-time push | Replace polling in `ArmyDataContext` with WebSocket; API adds `/ws` endpoint |
| CAC/PIV auth | Replace `API_KEY` bearer with mutual TLS + X.509 subject extraction |
| STIG hardening | Distroless base images, seccomp profiles, NetworkPolicies, PodSecurityAdmission |
