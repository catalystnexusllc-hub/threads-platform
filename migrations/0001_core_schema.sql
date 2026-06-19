-- ============================================================================
--  THREADS — 0001 core relational schema
--
--  Design: "relational spine + JSONB leaves".
--    * Real tables + FKs for the ENTITIES and COLLECTIONS the ETL joins on
--      (soldiers, units, sections, leave entries, awards, sitreps, events,
--      leader groups/leaders/locations). soldiers.dodid is the natural key
--      that makes source-system upserts idempotent.
--    * Per-source 1:1 side tables (soldier_medical / _acft / _training /
--      _admin_docs) so each ETL source (MEDPROS, DTMS, IPPS-A) owns its own
--      row and carries its OWN provenance (source_system/loaded_at/updated_at)
--      without contending on the soldier row.
--    * The leaf readiness detail is stored as JSONB. This is deliberate, not
--      lazy: the seed mixes JSON types within one field (acft.score is 540 on
--      most soldiers but 'N/A' on one; dd93 carries different keys per soldier).
--      JSONB round-trips number-vs-string and heterogeneous keys EXACTLY, which
--      typed TEXT columns cannot, and it absorbs the structure variance of
--      datasets produced by a third party. ETL still queries it relationally via
--      `data->>'status'` (+ expression indexes); see the bottom of this file.
--
--  Idempotency: applied once via the schema_migrations ledger in app/db.py.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS core;

-- Reusable trigger to maintain updated_at on app-side writes.
CREATE OR REPLACE FUNCTION core.touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── units & sections ───────────────────────────────────────────────────────

CREATE TABLE core.units (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unit_key      text NOT NULL UNIQUE,              -- 'scs','ecs','hsts'
  display_name  text,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE core.unit_sections (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unit_key      text NOT NULL REFERENCES core.units(unit_key) ON DELETE CASCADE,
  section_key   text NOT NULL,                     -- 'hq','ops','support','maint'
  name          text NOT NULL,
  color         text NOT NULL DEFAULT '#444',
  position      int  NOT NULL DEFAULT 0,           -- preserves list order
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_key, section_key)                   -- idempotent upsert key
);

-- ─── soldiers (relational spine) ────────────────────────────────────────────
-- slug = app/API identity (PUT /api/soldiers/:id). dodid = ETL natural key.
-- All-string top-level fields are TEXT columns; a NULL column is OMITTED from
-- the reconstructed JSON (the seed never carries JSON null — only absent keys),
-- which is how per-soldier heterogeneity is preserved. Mixed-type top-level
-- fields (e.g. evalDays = 180 | 'N/A') and the sparse long tail live in
-- profile_extra and are spread back at the top level.

CREATE TABLE core.soldiers (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  dodid         text UNIQUE,
  -- identity
  name          text,
  rank          text,
  position      text,
  mos           text,
  unit          text,
  section       text,
  branch        text,
  ssn           text,
  religion      text,
  security      text,
  flags         text,
  marital_status text,
  dependents    text,
  -- service dates
  date_of_rank  text,
  gain_date     text,
  loss_date     text,
  ets           text,
  -- contact
  nipr_email    text,
  sipr_email    text,
  sipr_phone    text,
  nipr_phone    text,
  civ_phone     text,
  pers_email    text,
  -- evaluation (string fields; evalDays is mixed-type -> profile_extra)
  eval_type     text,
  eval_subtype  text,
  eval_status   text,
  rater         text,
  rater_dodid   text,
  senior_rater  text,
  senior_rater_dodid text,
  last_eval     text,
  eval_thru_date text,
  -- mixed-type top-level fields + sparse nested long tail
  -- (evalDays, address, spouse, nextOfKin, s2, s2Training, badge, sysAccess,
  --  sysAccounts, isoprep, ocie, itEquip, distros, pme, milSchools, ...)
  profile_extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_soldiers_unit ON core.soldiers (unit);
CREATE TRIGGER trg_soldiers_touch BEFORE UPDATE ON core.soldiers
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ─── per-source readiness side tables (1:1, own provenance) ──────────────────

-- IPPS-A: admin readiness docs (dd93 / sglv / prr keep their own JSON shapes)
CREATE TABLE core.soldier_admin_docs (
  soldier_id    bigint PRIMARY KEY REFERENCES core.soldiers(id) ON DELETE CASCADE,
  dd93          jsonb,
  sglv          jsonb,
  prr           jsonb,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_admin_docs_touch BEFORE UPDATE ON core.soldier_admin_docs
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- MEDPROS: medical readiness (status, dental, immunizations, ... + nested meb)
CREATE TABLE core.soldier_medical (
  soldier_id    bigint PRIMARY KEY REFERENCES core.soldiers(id) ON DELETE CASCADE,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_medical_touch BEFORE UPDATE ON core.soldier_medical
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- DTMS: ACFT
CREATE TABLE core.soldier_acft (
  soldier_id    bigint PRIMARY KEY REFERENCES core.soldiers(id) ON DELETE CASCADE,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_acft_touch BEFORE UPDATE ON core.soldier_acft
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- DTMS/ALMS: training currency
CREATE TABLE core.soldier_training (
  soldier_id    bigint PRIMARY KEY REFERENCES core.soldiers(id) ON DELETE CASCADE,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_training_touch BEFORE UPDATE ON core.soldier_training
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ─── leave (1:1 summary + 1:many entries) ───────────────────────────────────

CREATE TABLE core.soldier_leave (
  soldier_id    bigint PRIMARY KEY REFERENCES core.soldiers(id) ON DELETE CASCADE,
  balance       int,
  use_lose      int,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_leave_touch BEFORE UPDATE ON core.soldier_leave
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

CREATE TABLE core.soldier_leave_entries (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  soldier_id    bigint NOT NULL REFERENCES core.soldiers(id) ON DELETE CASCADE,
  bucket        text NOT NULL CHECK (bucket IN ('pending','approved')),
  leave_type    text,          -- maps to JSON key "type"
  start_date    text,          -- maps to JSON key "start"
  end_date      text,          -- maps to JSON key "end"
  days          int,
  position      int NOT NULL DEFAULT 0,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_leave_entries_soldier ON core.soldier_leave_entries (soldier_id, bucket, position);

-- ─── awards (1:many across current/submitted/nominated buckets) ─────────────

CREATE TABLE core.soldier_awards (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  soldier_id    bigint NOT NULL REFERENCES core.soldiers(id) ON DELETE CASCADE,
  bucket        text NOT NULL CHECK (bucket IN ('current','submitted','nominated')),
  award         text NOT NULL,           -- 'MSM', 'ARCOM (2)'
  position      int NOT NULL DEFAULT 0,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_awards_soldier ON core.soldier_awards (soldier_id, bucket, position);

-- ─── sitreps (array addressed by :index) ────────────────────────────────────

CREATE TABLE core.sitreps (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  position      int  NOT NULL,            -- the :index the frontend PUTs
  month         text NOT NULL UNIQUE,     -- natural key for idempotent upsert
  cdr_review    text,
  jcu           text,
  jsoc          text,
  status        text,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_sitreps_touch BEFORE UPDATE ON core.sitreps
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ─── standup events (numeric fields stay numeric) ───────────────────────────

CREATE TABLE core.standup_events (
  event_id      int PRIMARY KEY,          -- the {id} the API uses; POST mints max+1
  title         text,
  day           int,
  start_min     int,                      -- maps to JSON key "start"
  duration      int,
  location      text,
  opr           text,
  category      text,
  recurring     text,
  extra         jsonb NOT NULL DEFAULT '{}'::jsonb,   -- any future event fields
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_events_touch BEFORE UPDATE ON core.standup_events
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ─── leader groups / leaders / locations (live + closeout views) ────────────

CREATE TABLE core.leader_groups (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  view          text NOT NULL CHECK (view IN ('live','closeout')),
  name          text NOT NULL,
  color         text,
  icon          text,
  position      int  NOT NULL DEFAULT 0,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (view, name)
);

CREATE TABLE core.leaders (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id      bigint NOT NULL REFERENCES core.leader_groups(id) ON DELETE CASCADE,
  leader_key    text NOT NULL,            -- the API leaderId ('cdr','c1',...)
  view          text NOT NULL,            -- denormalized for the locations PUT lookup
  name          text NOT NULL,
  position      int  NOT NULL DEFAULT 0,
  source_system text NOT NULL DEFAULT 'seed',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (view, leader_key)               -- PUT /api/locations finds (view, leaderId)
);

CREATE TABLE core.leader_locations (
  leader_id     bigint NOT NULL REFERENCES core.leaders(id) ON DELETE CASCADE,
  day_index     int NOT NULL,             -- positional array index (0..4)
  location      text NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (leader_id, day_index)
);

-- ─── ETL/dashboard query helpers over the JSONB leaves ──────────────────────
CREATE INDEX idx_medical_status  ON core.soldier_medical  ((data->>'status'));
CREATE INDEX idx_acft_status     ON core.soldier_acft     ((data->>'status'));
