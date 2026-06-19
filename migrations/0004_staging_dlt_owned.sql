-- ============================================================================
--  THREADS — 0004 staging schema is dlt-owned
--
--  dlt (etl/pipeline.py) CREATES and EVOLVES the staging.* tables from each
--  resource's columns on every load. Pre-creating them in a migration (as 0002
--  and 0003 did) conflicts with dlt:
--    * when a resource's columns differ from the migration's table, dlt's load
--      fails ("column ... does not exist"); and
--    * the 0003 `dtms_acft → dtms_training` rename collides with the table dlt
--      itself creates for the dtms_training resource.
--  So staging must be 100% dlt-owned.
--
--  This resets the staging schema to empty; dlt rebuilds it on the next ETL run.
--  Runs once (recorded in schema_migrations); afterwards dlt's tables persist
--  untouched across api restarts. Going forward, migrations must NOT create
--  staging.* tables — only core.* belongs in migrations.
-- ============================================================================

DROP SCHEMA IF EXISTS staging CASCADE;
CREATE SCHEMA staging;
