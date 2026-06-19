-- ============================================================================
--  THREADS — 0002 ETL staging schema
--
--  A third party produces the source datasets, with structures/types THREADS
--  does not control. So staging follows a two-layer landing pattern:
--
--    1. staging.source_load — a GENERIC raw landing table. Every ETL run appends
--       one row per source record with the untouched payload as JSONB plus
--       provenance. Nothing here is schema-coupled, so an arbitrary new source
--       structure lands without DDL changes. (dlt may also create its own
--       per-source tables in this schema via schema inference; both coexist.)
--
--    2. staging.<source> — typed per-source tables for the sources we DO map
--       into core today (IPPS-A, MEDPROS, DTMS). The ETL normalizes provider
--       data into these; the staging→core merge (etl/merge.sql) upserts from
--       here into the relational core on natural keys. Adding a source = add a
--       table here + a merge block; the app/core schema is untouched.
--
--  Applied automatically by the API migration runner (app/db.py) on startup.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS staging;

-- ─── generic raw landing (schema-agnostic) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.source_load (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  load_id        text NOT NULL,                 -- one id per ETL run (dlt load id)
  source_system  text NOT NULL,                 -- 'IPPS-A' | 'MEDPROS' | 'DTMS' | ...
  dodid          text,                          -- natural key when present
  payload        jsonb NOT NULL,                -- untouched source record
  loaded_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_source_load_run    ON staging.source_load (source_system, load_id);
CREATE INDEX IF NOT EXISTS idx_source_load_dodid  ON staging.source_load (dodid);

-- ─── IPPS-A: personnel / identity ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.ipps_a_personnel (
  dodid        text,
  name         text,
  rank         text,
  unit         text,
  section      text,
  mos          text,
  _raw         jsonb,
  _load_id     text,
  _loaded_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── MEDPROS: medical readiness ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.medpros_readiness (
  dodid          text,
  status         text,          -- overall medical readiness (Green/Amber/Red)
  dental         text,
  immunizations  text,
  medpros_status text,
  _raw           jsonb,         -- full record → becomes the medical JSONB leaf
  _load_id       text,
  _loaded_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── DTMS: ACFT ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.dtms_acft (
  dodid      text,
  score      text,          -- text: source may send a number or 'N/A'
  status     text,
  acft_date  text,
  _raw       jsonb,
  _load_id   text,
  _loaded_at timestamptz NOT NULL DEFAULT now()
);
