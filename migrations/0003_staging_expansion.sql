-- ============================================================================
--  THREADS — 0003 staging expansion + entity core tables
--
--  Adds staging tables for the 13 new SOR connectors added to etl/pipeline.py
--  and the corresponding core entity tables for non-soldier-keyed sources.
--
--  Soldier-keyed sources (DISS, JKO, STEPP, ATTARS, iPERMS, cyber_aup) merge
--  into the existing per-source 1:1 side tables on core.soldiers.
--
--  Entity-keyed sources (GCSS-Army, DTS, TMT, FMSWeb, ATTARS events) get their
--  own core tables keyed on natural identifiers (lin, auth_number, task_id,
--  para_line, event_id). etl/merge.sql handles the upserts.
--
--  Also renames staging.dtms_acft → staging.dtms_training to reflect that DTMS
--  now covers AFT + CFT + course records, not just the ACFT.
-- ============================================================================

-- ─── Rename dtms_acft → dtms_training ───────────────────────────────────────
-- Safe: IF EXISTS guards mean a fresh install gets the right name from the start.
ALTER TABLE IF EXISTS staging.dtms_acft RENAME TO dtms_training;
ALTER TABLE IF EXISTS staging.dtms_training RENAME COLUMN acft_date TO aft_date;

-- ─── New: DISS security clearances ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.diss_clearances (
  dodid              text,
  last_name          text,
  first_name         text,
  rank               text,
  unit               text,
  eligibility_level  text,
  eligibility_status text,
  investigation_type text,
  investigation_date text,
  adjudication_date  text,
  pr_due_date        text,
  pr_status          text,
  status             text,
  derog_info         jsonb,
  _raw               jsonb,
  _load_id           text,
  _loaded_at         timestamptz NOT NULL DEFAULT now()
);

-- ─── New: JKO online training completions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.jko_completions (
  dodid          text,
  name           text,
  rank           text,
  unit           text,
  overall_status text,
  completions    jsonb,
  _raw           jsonb,
  _load_id       text,
  _loaded_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── New: STEPP security training certs ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.stepp_certs (
  dodid            text,
  name             text,
  rank             text,
  unit             text,
  clearance_level  text,
  overall_status   text,
  last_review_date text,
  completions      jsonb,
  _raw             jsonb,
  _load_id         text,
  _loaded_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── New: GCSS-Army property book equipment lines ───────────────────────────
CREATE TABLE IF NOT EXISTS staging.gcss_equipment (
  lin             text,
  nsn             text,
  nomenclature    text,
  qty_authorized  int,
  qty_on_hand     int,
  qty_shortfall   int,
  condition       text,
  hand_receipt    text,
  maint_status    text,
  readiness_flag  text,
  _raw            jsonb,
  _load_id        text,
  _loaded_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── New: DTS travel authorizations ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.dts_travel (
  auth_number      text,
  traveler         text,
  purpose          text,
  departure_date   text,
  return_date      text,
  destination      text,
  per_diem_rate    numeric,
  transport_mode   text,
  estimated_cost   numeric,
  approval_status  text,
  approved_by      text,
  voucher_status   text,
  reimbursement    numeric,
  _raw             jsonb,
  _load_id         text,
  _loaded_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── New: ATTARS soldier training readiness ──────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.attars_training (
  dodid          text,
  name           text,
  rank           text,
  unit           text,
  aft            jsonb,
  cft            jsonb,
  weapons_qual   jsonb,
  sharp          jsonb,
  opsec          jsonb,
  combatives     jsonb,
  airborne       jsonb,
  tccc           jsonb,
  readiness_flag text,
  _raw           jsonb,
  _load_id       text,
  _loaded_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── New: ATTARS training events ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.attars_events (
  event_id        text,
  title           text,
  category        text,
  type            text,
  status          text,
  scheduled_date  text,
  completion_date text,
  location        text,
  oic             text,
  soldiers_tested int,
  pass_count      int,
  fail_count      int,
  required_count  int,
  pass_rate       numeric,
  _raw            jsonb,
  _load_id        text,
  _loaded_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── New: iPERMS OMPF record completeness ───────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.iperms_records (
  dodid                text,
  name                 text,
  rank                 text,
  unit                 text,
  section              text,
  ompf_sections        jsonb,
  record_completeness  text,
  last_audit_date      text,
  audited_by           text,
  _raw                 jsonb,
  _load_id             text,
  _loaded_at           timestamptz NOT NULL DEFAULT now()
);

-- ─── New: TMT task management ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.tmt_tasks (
  task_id       text,
  title         text,
  section       text,
  assigned_to   text,
  assigned_by   text,
  priority      text,
  category      text,
  due_date      text,
  status        text,
  pct_complete  int,
  opened_date   text,
  closed_date   text,
  description   text,
  _raw          jsonb,
  _load_id      text,
  _loaded_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── New: FMSWeb MTOE authorized positions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.fmsweb_positions (
  org_name   text,
  uic        text,
  section    text,
  para_line  text,
  grade      text,
  mos        text,
  title      text,
  filled     boolean,
  sdap       text,
  _raw       jsonb,
  _load_id   text,
  _loaded_at timestamptz NOT NULL DEFAULT now()
);

-- ─── New: ATCTS AUP / cyber compliance ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS staging.cyber_aup (
  dodid       text,
  name        text,
  rank        text,
  unit        text,
  section     text,
  aup         text,
  aup_date    text,
  aup_exp     text,
  cyber       text,
  cyber_date  text,
  cyber_exp   text,
  sharp       text,
  sharp_date  text,
  opsec       text,
  opsec_date  text,
  _raw        jsonb,
  _load_id    text,
  _loaded_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── New core: entity-keyed tables (non-soldier-primary sources) ─────────────

-- GCSS-Army equipment property book (keyed on lin+nsn within a unit)
CREATE TABLE IF NOT EXISTS core.equipment_lines (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lin            text NOT NULL,
  nsn            text,
  nomenclature   text,
  qty_authorized int,
  qty_on_hand    int,
  qty_shortfall  int,
  condition      text,
  hand_receipt   text,
  maint_status   text,
  readiness_flag text,
  data           jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system  text NOT NULL DEFAULT 'GCSS-A',
  loaded_at      timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lin, nsn)
);
CREATE TRIGGER trg_equipment_touch BEFORE UPDATE ON core.equipment_lines
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- DTS travel authorizations (keyed on auth_number)
CREATE TABLE IF NOT EXISTS core.travel_authorizations (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_number     text NOT NULL UNIQUE,
  traveler        text,
  purpose         text,
  departure_date  text,
  return_date     text,
  destination     text,
  approval_status text,
  voucher_status  text,
  data            jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system   text NOT NULL DEFAULT 'DTS',
  loaded_at       timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_travel_touch BEFORE UPDATE ON core.travel_authorizations
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- TMT tasks (keyed on task_id)
CREATE TABLE IF NOT EXISTS core.tmt_tasks (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id       text NOT NULL UNIQUE,
  title         text,
  section       text,
  assigned_to   text,
  assigned_by   text,
  priority      text,
  category      text,
  due_date      text,
  status        text,
  pct_complete  int,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system text NOT NULL DEFAULT 'TMT',
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_tmt_tasks_touch BEFORE UPDATE ON core.tmt_tasks
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- FMSWeb MTOE authorized positions (keyed on para_line)
CREATE TABLE IF NOT EXISTS core.mtoe_positions (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  para_line  text NOT NULL UNIQUE,
  uic        text,
  org_name   text,
  section    text,
  grade      text,
  mos        text,
  title      text,
  filled     boolean,
  sdap       text,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system text NOT NULL DEFAULT 'FMSWeb',
  loaded_at  timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_mtoe_touch BEFORE UPDATE ON core.mtoe_positions
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ATTARS training events (keyed on event_id)
CREATE TABLE IF NOT EXISTS core.training_events (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id        text NOT NULL UNIQUE,
  title           text,
  category        text,
  type            text,
  status          text,
  scheduled_date  text,
  completion_date text,
  location        text,
  oic             text,
  soldiers_tested int,
  pass_count      int,
  fail_count      int,
  pass_rate       numeric,
  data            jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system   text NOT NULL DEFAULT 'ATTARS',
  loaded_at       timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_training_events_touch BEFORE UPDATE ON core.training_events
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- New core: soldier clearance (from DISS)
CREATE TABLE IF NOT EXISTS core.soldier_clearance (
  soldier_id         bigint PRIMARY KEY REFERENCES core.soldiers(id) ON DELETE CASCADE,
  eligibility_level  text,
  eligibility_status text,
  pr_due_date        text,
  pr_status          text,
  data               jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_system      text NOT NULL DEFAULT 'DISS',
  loaded_at          timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_clearance_touch BEFORE UPDATE ON core.soldier_clearance
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ─── Query helper indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_training_status     ON core.soldier_training  ((data->>'status'));
CREATE INDEX IF NOT EXISTS idx_clearance_status    ON core.soldier_clearance ((data->>'eligibilityStatus'));
CREATE INDEX IF NOT EXISTS idx_equipment_readiness ON core.equipment_lines   (readiness_flag);
CREATE INDEX IF NOT EXISTS idx_travel_status       ON core.travel_authorizations (approval_status, voucher_status);
CREATE INDEX IF NOT EXISTS idx_tmt_status          ON core.tmt_tasks         (status, section);
CREATE INDEX IF NOT EXISTS idx_mtoe_mos            ON core.mtoe_positions    (mos, grade);
