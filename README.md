# THREADS

### Tactical Hub for Readiness, Execution, Administration, Data & Sync

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-compose%20ready-2496ED.svg?logo=docker)](docker-compose.yml)
[![Kubernetes](https://img.shields.io/badge/kubernetes-manifests-326CE5.svg?logo=kubernetes)](k8s/)
[![Air-Gap](https://img.shields.io/badge/air--gap-Zarf%2FUDS-orange.svg)](zarf.yaml)

---

## The Problem

Every unit leader in the U.S. military already knows what the data shows.

In 2015, Dr. Leonard Wong and Dr. Stephen Gerras published *[Lying to Ourselves: Dishonesty in the Army Profession](https://press.armywarcollege.edu/monographs/673/)* through the U.S. Army War College. What they documented wasn't a scandal — it was standard operating procedure. When the Army floods units with more requirements than any human organization can possibly execute, and when reporting noncompliance isn't an acceptable alternative, something breaks. Officers become ethically numb. Their signatures — once symbols of professional integrity — become administrative tools for maneuvering through bureaucracy. Subordinates are forced to make a private calculation: which requirements will actually be done to standard, and which will only be **reported** as done to standard.

The readiness data flowing up the chain of command isn't a picture of reality. It's a picture of what the institution demanded be reported.

The system that produces this distortion is the one every unit operates every day: **over 2,300 authoritative Army systems**, none of which natively talk to each other, layered on top of an unofficial Microsoft shadow infrastructure — SharePoint trackers, Teams channels, Excel rosters, Outlook suspense chains, and Word forms — that actually runs day-to-day operations at every echelon from squad to COCOM.

The S1 runs a tracker for leaves, a separate tracker for flags, another for evaluations, another for awards — none of them fed from the same source, none of them automatically updated when something changes in IPPS-A or HR Connect. The S4 manages equipment readiness in GCSS-Army but tracks maintenance status in a separate spreadsheet that gets emailed to the XO on Monday mornings. The commander asks for a readiness report and four people spend four hours manually pulling data from six systems to build a PowerPoint that is already out of date by the time it's briefed.

This isn't inefficiency. This is the architecture of distortion.

---

## The Solution

THREADS is a **purpose-built integration layer** that connects a unit's authoritative systems of record — the systems that actually own the data — and consolidates them into a single operational picture that updates automatically.

It doesn't replace IPPS-A. It doesn't replace MEDPROS or DTMS or GCSS-Army. Those systems are the sources of truth and they stay that way. What THREADS does is pull the data from those systems, reconcile it, and present it to the people who need it — in one place, in real time, without the manual transfer work that currently lives in someone's personal SharePoint folder.

**The Microsoft Office Master Badge is retired. Say hello to THREADS.**

What a unit gets:
- Every soldier's readiness status — medical, training, administrative, clearance, equipment — in a single view, sourced directly from the authoritative systems
- Suspense tracking that actually knows when something is due because it reads the system, not because an NCO manually updated a spreadsheet
- Leave tracker populated from IPPS-A, not from a handwritten DA 31 log
- Awards pipeline status without emailing each section
- Equipment readiness from GCSS-Army, not from Monday's email attachment
- Travel authorization and voucher status from DTS
- Clearance PR due dates from DISS before they become a problem
- Training currency — AFT, SHARP, cyber, weapons qual — from the systems that own that data

No more shadow work. No more "I'll need to check the tracker." No more briefing numbers you aren't sure of.

---

## Who This Is For

| Role | What THREADS does for you |
|---|---|
| **Commander / CSM** | Single readiness picture across all S-sections; no more waiting for the Monday brief to know what's real |
| **XO** | Suspense tracking that surfaces what's overdue before it becomes a commander's problem |
| **S1** | IPPS-A, MEDPROS, HR Connect, and iPERMS consolidated; leave tracker auto-populated; awards pipeline visible to anyone with access |
| **S3** | Battle rhythm in one place; training status fed from DTMS and ATTARS, not from NCO-maintained spreadsheets |
| **S4** | GCSS-Army property book and maintenance status without the weekly email chain |
| **S6** | AUP/cyber compliance from ATCTS; system access visibility |
| **S2** | Clearance status from DISS; STEPP training completion; JKO records |
| **Staff NCOs** | The tracker is the system. No more maintaining parallel records. |

---

## What It Connects

THREADS currently integrates with 14 Army Systems of Record:

| System | What it provides |
|---|---|
| **IPPS-A** | Master personnel roster, leave (DA Form 31), evaluation status, admin flags |
| **MEDPROS** | Medical readiness class, dental, immunizations, deployment-limiting conditions |
| **DTMS** | AFT scores, CFT scores, course completions, training management |
| **DISS** | Security clearance eligibility, investigation dates, PR due dates |
| **JKO** | Online course completions and compliance status |
| **STEPP** | Security training certifications |
| **GCSS-Army** | Equipment property book, maintenance status, FMC/PMC/NMC by LIN |
| **DTS** | Travel authorizations, per diem, voucher status |
| **ATTARS** | Soldier-level and unit-level training readiness |
| **iPERMS** | OMPF completeness, record audit status |
| **TMT** | Task management and cross-section suspense tracking |
| **FMSWeb** | MTOE authorized positions, SDAP authorizations, para/line data |
| **ATCTS** | AUP compliance, cyber awareness, SHARP completion |

---

## Deployment Options

THREADS runs where the unit operates — it doesn't require an internet connection, a commercial cloud account, or a dedicated IT staff.

| Environment | How | What it takes |
|---|---|---|
| **Local demo** | `docker compose up` | A laptop and 10 minutes |
| **Unit server / S6 rack** | Docker Compose or Kubernetes | A single server; can run offline |
| **Air-gapped / SIPR** | Zarf/UDS package | Pre-bundled install; no internet required at deploy time |
| **Cloud (NIPRNet/AWS GovCloud)** | Kubernetes manifests | Standard DoD cloud environment |

---

## Quick Start (Demo)

```bash
git clone https://github.com/catalystnexusllc-hub/threads-platform.git
cd threads-platform
cp .env.example .env
docker compose up --build
```

Open **http://localhost:8080**

The demo loads with a full synthetic unit roster, training records, equipment status, travel authorizations, and clearance data so you can see every section working without connecting to any real system.

> **Note:** All demo data is completely synthetic — procedurally generated, not sourced from any real unit or personnel record. See [`seed/README.md`](seed/README.md).

---

## How Data Flows

At its core, THREADS is an **ETL pipeline** — Extract, Transform, Load. In plain terms: it reads data from the systems that own it, normalizes it into a common format, and makes it available through a single interface.

```
Your authoritative systems (IPPS-A, MEDPROS, DTMS, DISS, ...)
        │
        │  Each system exports a data file (JSON) on a schedule
        │  — or THREADS pulls via API where available
        ▼
THREADS ETL pipeline
        │  Reads each system's data
        │  Normalizes field names (every system calls the ID something different)
        │  Loads into the THREADS database
        │  Runs automatically on a schedule; safe to replay
        ▼
THREADS database (PostgreSQL)
        │  Single consolidated store
        │  Every record stamped with its source system and timestamp
        │  App edits distinguished from ETL data — provenance is always visible
        ▼
THREADS web application
        │  One interface for all sections
        │  Role-based views (S1 sees S1 data; commander sees the roll-up)
        ▼
The truth, visible to the people who need it
```

No data is invented by THREADS. If the source system is wrong, THREADS shows that. The difference is that THREADS shows it to everyone simultaneously, automatically, so there's no longer a gap between what the system says and what the tracker says.

---

## Architecture (Technical Summary)

For developers and technical decision makers:

| Layer | Technology | Purpose |
|---|---|---|
| Web application | React 19 + TypeScript, served by nginx | The interface — S1–S9 sections, unit views, command dashboard |
| API | FastAPI (Python) | Serves data to the frontend; handles all write operations |
| Database | PostgreSQL 16 | Consolidated data store: relational tables + JSONB for flexible SOR payloads |
| ETL pipeline | Python `dlt` (data load tool) | Reads SOR file drops → staging tables → core tables (idempotent) |
| Container runtime | Docker / Kubernetes | Runs everything; single-node capable for unit-server deployment |
| Air-gap packaging | Zarf / UDS | Bundles all images and config for offline install; no internet at deploy time |

The database uses a **relational spine + JSONB leaves** pattern — structured tables for the data that gets joined and filtered (soldiers, units, events), with flexible JSON storage for the source-system payloads that vary in structure between SOR providers. This means adding a new system of record doesn't require rebuilding the database schema.

Full technical documentation: [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## For Developers

### Prerequisites

Docker Desktop, Git. That's it for the demo.

For local development: Node.js 22+, Python 3.12+.

### Adding a new SOR connector

Each system of record is one self-contained module:
1. A Python function that reads the system's data export and normalizes it
2. A database table that receives that data
3. A SQL merge block that moves it from staging into the live database

No changes to the core application. No schema rebuild. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the step-by-step.

### Project structure

```
app/           FastAPI backend
etl/           Data pipeline (one file per SOR connector)
migrations/    Database schema (versioned, idempotent)
web/           React frontend (S1–S9 pages, unit views, integration map)
k8s/           Kubernetes manifests for cluster deployment
seed/          Synthetic demo data (100% fictional)
pipelines/     Field-level documentation: which system feeds which field in which UI
```

Full structure: [`ARCHITECTURE.md#project-structure`](ARCHITECTURE.md)

---

## API Reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | System health check |
| `GET` | `/api/data` | Full data payload — soldiers, units, sections, events, readiness |
| `PUT` | `/api/soldiers/:id` | Update a soldier record |
| `GET/POST/PUT` | `/api/sections/:unit` | Unit section data |
| `GET/PUT` | `/api/sitreps` | Monthly readiness reports |
| `GET/POST/PUT/DELETE` | `/api/events` | Battle rhythm / standup events |
| `GET/PUT` | `/api/leader-groups` | Command team board layout |
| `PUT` | `/api/locations` | Leader location assignments |

All routes require `Authorization: Bearer <API_KEY>` or `X-Api-Key: <API_KEY>`.

---

## Roadmap

### Done
- [x] Full S1–S9 coordinating staff sections
- [x] Unit hierarchy (Group → Battalion → Company)
- [x] Special Staff pages (Medical, SHARP/EO, Finance, Safety, CBRN, Career Counselor)
- [x] 14 SOR connectors with idempotent ETL pipeline
- [x] Air-gap deployment via Zarf/UDS
- [x] Integration Map — in-app panel showing status of all connected systems
- [x] PostgreSQL backend with provenance tracking (who wrote what, from which system)

### Next
- [ ] Edit forms wired to live API (currently read-only for most fields in the demo)
- [ ] CAC/PIV authentication (replaces API key for production)
- [ ] Navy, Air Force, and Marine Corps branch verticals
- [ ] Real-time data push (WebSocket) so the screen updates without refresh
- [ ] Dagster-based ETL scheduling with retry logic and alerting
- [ ] IL4/IL5 deployment guide for classified network environments

---

## Background

THREADS was conceived by a former Army officer who lived this problem firsthand. The mission gap it addresses isn't unique to one branch, one echelon, or one MOS — it is endemic across the entire Department of Defense. Every unit, at every level, is running some version of the same shadow infrastructure: the tracker that lives in someone's SharePoint, the roster that gets emailed Friday afternoon, the checklist that exists because the system doesn't.

The Wong and Gerras study named what every leader already felt: the reporting environment we built doesn't just create inefficiency — it creates dishonesty. Not because the Army is full of dishonest people, but because we built a system that makes honesty functionally impossible to sustain at scale.

THREADS is what it looks like to take that problem seriously.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Security

See [SECURITY.md](SECURITY.md)

## License

Apache 2.0 — see [LICENSE](LICENSE)

---

> **Demo data notice:** All personnel records, unit data, and operational content in `seed/` are completely synthetic. No real DoD personnel records or sensitive information is included. See [`seed/README.md`](seed/README.md).
