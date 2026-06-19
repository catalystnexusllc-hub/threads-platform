"""
THREADS — ETL entrypoint (the CronJob runs this).

  1. dlt loads each source from the drop directory into staging.* .
  2. The staging → core merge (merge.sql) upserts into the relational core on
     natural keys (idempotent).

Env:
  DATABASE_URL                          — Postgres DSN (merge connection)
  DESTINATION__POSTGRES__CREDENTIALS    — same DSN, for the dlt postgres dest
  ETL_DROP_DIR                          — where the provider drops files (default /data/drop)
  ETL_AUTOSEED                          — 1 (default) stage bundled datasets first;
                                          0 to read only real external drops
  ETL_DATASETS_DIR                      — bundled datasets dir (see stage_datasets.py)

Structured as plain steps so each can become a Dagster op/asset later.
"""

import os
from pathlib import Path

import dlt
import psycopg2

from pipeline import threads_sources
from stage_datasets import stage

MERGE_SQL = Path(__file__).resolve().parent / "merge.sql"


def load_to_staging():
    pipeline = dlt.pipeline(
        pipeline_name="threads_etl",
        destination="postgres",
        dataset_name="staging",
    )
    info = pipeline.run(threads_sources())
    print(f"[etl] loaded to staging: {info}")


def merge_to_core():
    dsn = os.environ["DATABASE_URL"]
    sql = MERGE_SQL.read_text()
    with psycopg2.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)   # merge.sql wraps its own BEGIN/COMMIT
    print("[etl] staging → core merge complete")


def main():
    # Self-contained demo: stage the bundled SOR datasets into the drop dir.
    # Set ETL_AUTOSEED=0 to ingest only real external drops instead.
    if os.environ.get("ETL_AUTOSEED", "1") != "0":
        stage()
    load_to_staging()
    merge_to_core()


if __name__ == "__main__":
    main()
