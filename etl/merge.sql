-- ============================================================================
--  THREADS — staging → core merge
--
--  Idempotent upserts from the staging tables into the relational core, keyed
--  on natural keys (dodid for soldier sources; lin/nsn, auth_number, task_id,
--  para_line, event_id for entity sources). Safe to re-run: ON CONFLICT updates
--  in place, so a replayed ETL load converges rather than duplicating.
--
--  Ordering matters:
--    1. IPPS-A (identity) first — all soldier-keyed sources resolve dodid → soldier_id
--    2. Soldier side tables (MEDPROS, DTMS, DISS, JKO, STEPP, ATTARS, iPERMS, AUP)
--    3. Entity tables (GCSS, DTS, TMT, FMSWeb, ATTARS events) — no FK to soldiers
--
--  DISTINCT ON collapses multiple staging rows for the same key within one run
--  (latest _loaded_at wins) to avoid "cannot affect row a second time".
--
--  Provenance: each block stamps source_system; the updated_at trigger advances
--  the timestamp. App-originated edits carry source_system='app'.
--
--  Run by etl/run.py after a dlt load, inside one transaction.
-- ============================================================================

BEGIN;

-- ─── 1. IPPS-A → core.soldiers (mint slug on first sight of a dodid) ─────────
INSERT INTO core.soldiers (slug, dodid, name, rank, unit, section, mos, source_system, updated_at)
SELECT DISTINCT ON (s.dodid)
       COALESCE(c.slug, 'sol-' || s.dodid) AS slug,
       s.dodid,
       COALESCE(s.last_name || ', ' || s.first_name, s.last_name, s.first_name) AS name,
       s.rank, s.unit, s.section, s.mos, 'IPPS-A', now()
FROM staging.ipps_a_personnel s
LEFT JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY s.dodid, s._dlt_load_id DESC
ON CONFLICT (dodid) DO UPDATE SET
  name          = EXCLUDED.name,
  rank          = EXCLUDED.rank,
  unit          = EXCLUDED.unit,
  section       = EXCLUDED.section,
  mos           = EXCLUDED.mos,
  source_system = 'IPPS-A',
  updated_at    = now();

-- ─── 2. MEDPROS → core.soldier_medical ───────────────────────────────────────
INSERT INTO core.soldier_medical (soldier_id, data, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id, COALESCE(s._raw, '{}'::jsonb), 'MEDPROS', now()
FROM staging.medpros_readiness s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._dlt_load_id DESC
ON CONFLICT (soldier_id) DO UPDATE SET
  data          = EXCLUDED.data,
  source_system = 'MEDPROS',
  updated_at    = now();

-- ─── 3. DTMS → core.soldier_acft ─────────────────────────────────────────────
INSERT INTO core.soldier_acft (soldier_id, data, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id,
       COALESCE(
         s._raw,
         jsonb_strip_nulls(jsonb_build_object(
           'score',  CASE WHEN s.aft_score ~ '^-?[0-9]+$' THEN to_jsonb(s.aft_score::bigint) ELSE to_jsonb(s.aft_score) END,
           'status', to_jsonb(s.aft_status),
           'date',   to_jsonb(s.aft_date)))
       ),
       'DTMS', now()
FROM staging.dtms_training s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._dlt_load_id DESC
ON CONFLICT (soldier_id) DO UPDATE SET
  data          = EXCLUDED.data,
  source_system = 'DTMS',
  updated_at    = now();

-- ─── 4. DISS → core.soldier_clearance ────────────────────────────────────────
INSERT INTO core.soldier_clearance (soldier_id, eligibility_level, eligibility_status, pr_due_date, pr_status, data, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id,
       s.eligibility_level,
       s.eligibility_status,
       s.pr_due_date,
       s.pr_status,
       COALESCE(s._raw, '{}'::jsonb),
       'DISS', now()
FROM staging.diss_clearances s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._dlt_load_id DESC
ON CONFLICT (soldier_id) DO UPDATE SET
  eligibility_level  = EXCLUDED.eligibility_level,
  eligibility_status = EXCLUDED.eligibility_status,
  pr_due_date        = EXCLUDED.pr_due_date,
  pr_status          = EXCLUDED.pr_status,
  data               = EXCLUDED.data,
  source_system      = 'DISS',
  updated_at         = now();

-- ─── 5. JKO → core.soldier_training (merges 'jko' key into training JSONB) ───
INSERT INTO core.soldier_training (soldier_id, data, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id,
       jsonb_build_object('jko', s._raw),
       'JKO', now()
FROM staging.jko_completions s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._dlt_load_id DESC
ON CONFLICT (soldier_id) DO UPDATE SET
  data          = core.soldier_training.data || jsonb_build_object('jko', EXCLUDED.data->'jko'),
  source_system = 'JKO',
  updated_at    = now();

-- ─── 6. STEPP → core.soldier_training (merges 'stepp' key) ──────────────────
INSERT INTO core.soldier_training (soldier_id, data, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id,
       jsonb_build_object('stepp', s._raw),
       'STEPP', now()
FROM staging.stepp_certs s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._dlt_load_id DESC
ON CONFLICT (soldier_id) DO UPDATE SET
  data          = core.soldier_training.data || jsonb_build_object('stepp', EXCLUDED.data->'stepp'),
  source_system = 'STEPP',
  updated_at    = now();

-- ─── 7. ATTARS → core.soldier_training (merges 'attars' key) ────────────────
INSERT INTO core.soldier_training (soldier_id, data, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id,
       jsonb_build_object('attars', s._raw),
       'ATTARS', now()
FROM staging.attars_training s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._dlt_load_id DESC
ON CONFLICT (soldier_id) DO UPDATE SET
  data          = core.soldier_training.data || jsonb_build_object('attars', EXCLUDED.data->'attars'),
  source_system = 'ATTARS',
  updated_at    = now();

-- ─── 8. ATCTS/AUP → core.soldier_training (merges 'aup' key) ────────────────
INSERT INTO core.soldier_training (soldier_id, data, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id,
       jsonb_build_object('aup', s._raw),
       'ATCTS', now()
FROM staging.cyber_aup s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._dlt_load_id DESC
ON CONFLICT (soldier_id) DO UPDATE SET
  data          = core.soldier_training.data || jsonb_build_object('aup', EXCLUDED.data->'aup'),
  source_system = 'ATCTS',
  updated_at    = now();

-- ─── 9. iPERMS → core.soldier_admin_docs (OMPF completeness) ─────────────────
INSERT INTO core.soldier_admin_docs (soldier_id, source_system, updated_at)
SELECT DISTINCT ON (c.id)
       c.id, 'iPERMS', now()
FROM staging.iperms_records s
JOIN core.soldiers c ON c.dodid = s.dodid
WHERE s.dodid IS NOT NULL
ORDER BY c.id, s._dlt_load_id DESC
ON CONFLICT (soldier_id) DO UPDATE SET
  source_system = 'iPERMS',
  updated_at    = now();

-- ─── 10. GCSS-Army → core.equipment_lines (keyed on lin + nsn) ───────────────
INSERT INTO core.equipment_lines (lin, nsn, nomenclature, qty_authorized, qty_on_hand, qty_shortfall, condition, hand_receipt, maint_status, readiness_flag, data, source_system, updated_at)
SELECT DISTINCT ON (s.lin, COALESCE(s.nsn, ''))
       s.lin, s.nsn, s.nomenclature,
       s.qty_authorized, s.qty_on_hand, s.qty_shortfall,
       s.condition, s.hand_receipt, s.maint_status, s.readiness_flag,
       COALESCE(s._raw, '{}'::jsonb),
       'GCSS-A', now()
FROM staging.gcss_equipment s
WHERE s.lin IS NOT NULL
ORDER BY s.lin, COALESCE(s.nsn, ''), s._dlt_load_id DESC
ON CONFLICT (lin, nsn) DO UPDATE SET
  nomenclature   = EXCLUDED.nomenclature,
  qty_authorized = EXCLUDED.qty_authorized,
  qty_on_hand    = EXCLUDED.qty_on_hand,
  qty_shortfall  = EXCLUDED.qty_shortfall,
  condition      = EXCLUDED.condition,
  hand_receipt   = EXCLUDED.hand_receipt,
  maint_status   = EXCLUDED.maint_status,
  readiness_flag = EXCLUDED.readiness_flag,
  data           = EXCLUDED.data,
  source_system  = 'GCSS-A',
  updated_at     = now();

-- ─── 11. DTS → core.travel_authorizations (keyed on auth_number) ─────────────
INSERT INTO core.travel_authorizations (auth_number, traveler, purpose, departure_date, return_date, destination, approval_status, voucher_status, data, source_system, updated_at)
SELECT DISTINCT ON (s.auth_number)
       s.auth_number, s.traveler__name, s.purpose,
       s.departure_date, s.return_date, s.destination,
       s.approval_status, s.voucher_status,
       COALESCE(s._raw, '{}'::jsonb),
       'DTS', now()
FROM staging.dts_travel s
WHERE s.auth_number IS NOT NULL
ORDER BY s.auth_number, s._dlt_load_id DESC
ON CONFLICT (auth_number) DO UPDATE SET
  traveler        = EXCLUDED.traveler,
  purpose         = EXCLUDED.purpose,
  departure_date  = EXCLUDED.departure_date,
  return_date     = EXCLUDED.return_date,
  destination     = EXCLUDED.destination,
  approval_status = EXCLUDED.approval_status,
  voucher_status  = EXCLUDED.voucher_status,
  data            = EXCLUDED.data,
  source_system   = 'DTS',
  updated_at      = now();

-- ─── 12. TMT → core.tmt_tasks (keyed on task_id) ─────────────────────────────
INSERT INTO core.tmt_tasks (task_id, title, section, assigned_to, assigned_by, priority, category, due_date, status, pct_complete, data, source_system, updated_at)
SELECT DISTINCT ON (s.task_id)
       s.task_id, s.title, s.section,
       s.assigned_to, s.assigned_by,
       s.priority, s.category, s.due_date,
       s.status, s.pct_complete,
       COALESCE(s._raw, '{}'::jsonb),
       'TMT', now()
FROM staging.tmt_tasks s
WHERE s.task_id IS NOT NULL
ORDER BY s.task_id, s._dlt_load_id DESC
ON CONFLICT (task_id) DO UPDATE SET
  title         = EXCLUDED.title,
  section       = EXCLUDED.section,
  assigned_to   = EXCLUDED.assigned_to,
  assigned_by   = EXCLUDED.assigned_by,
  priority      = EXCLUDED.priority,
  category      = EXCLUDED.category,
  due_date      = EXCLUDED.due_date,
  status        = EXCLUDED.status,
  pct_complete  = EXCLUDED.pct_complete,
  data          = EXCLUDED.data,
  source_system = 'TMT',
  updated_at    = now();

-- ─── 13. FMSWeb → core.mtoe_positions (keyed on para_line) ───────────────────
INSERT INTO core.mtoe_positions (para_line, uic, org_name, section, grade, mos, title, filled, sdap, data, source_system, updated_at)
SELECT DISTINCT ON (s.para_line)
       s.para_line, s.uic, s.org_name, s.section,
       s.grade, s.mos, s.title, s.filled, s.sdap,
       COALESCE(s._raw, '{}'::jsonb),
       'FMSWeb', now()
FROM staging.fmsweb_positions s
WHERE s.para_line IS NOT NULL
ORDER BY s.para_line, s._dlt_load_id DESC
ON CONFLICT (para_line) DO UPDATE SET
  uic           = EXCLUDED.uic,
  org_name      = EXCLUDED.org_name,
  section       = EXCLUDED.section,
  grade         = EXCLUDED.grade,
  mos           = EXCLUDED.mos,
  title         = EXCLUDED.title,
  filled        = EXCLUDED.filled,
  sdap          = EXCLUDED.sdap,
  data          = EXCLUDED.data,
  source_system = 'FMSWeb',
  updated_at    = now();

-- ─── 14. ATTARS events → core.training_events (keyed on event_id) ────────────
INSERT INTO core.training_events (event_id, title, category, type, status, scheduled_date, completion_date, location, oic, soldiers_tested, pass_count, fail_count, pass_rate, data, source_system, updated_at)
SELECT DISTINCT ON (s.event_id)
       s.event_id, s.title, s.category, s.type, s.status,
       s.scheduled_date, s.completion_date, s.location, s.oic,
       s.soldiers_tested, s.pass_count, s.fail_count, s.pass_rate,
       COALESCE(s._raw, '{}'::jsonb),
       'ATTARS', now()
FROM staging.attars_events s
WHERE s.event_id IS NOT NULL
ORDER BY s.event_id, s._dlt_load_id DESC
ON CONFLICT (event_id) DO UPDATE SET
  title           = EXCLUDED.title,
  category        = EXCLUDED.category,
  type            = EXCLUDED.type,
  status          = EXCLUDED.status,
  scheduled_date  = EXCLUDED.scheduled_date,
  completion_date = EXCLUDED.completion_date,
  location        = EXCLUDED.location,
  oic             = EXCLUDED.oic,
  soldiers_tested = EXCLUDED.soldiers_tested,
  pass_count      = EXCLUDED.pass_count,
  fail_count      = EXCLUDED.fail_count,
  pass_rate       = EXCLUDED.pass_rate,
  data            = EXCLUDED.data,
  source_system   = 'ATTARS',
  updated_at      = now();

COMMIT;
