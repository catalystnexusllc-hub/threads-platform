"""
Stage the bundled SOR datasets into the ETL drop layout the pipeline reads.

Why this exists: each Army system of record stores data differently (different
fields, parameters, formats) — that is intentional and must NOT be normalized.
This step does NOT transform any source field or value; it only places each
source's dataset into  DROP_DIR/<source>/  in a container `_read_records()` can
parse. The 5th SFG exports are pretty-printed *envelope objects*, which the
JSON-array / JSON-lines reader can't parse, so we re-emit them as **compact,
single-line JSON** (same data, one line). The per-source field mapping is still
done downstream by the dlt resources + merge.sql.

Idempotent: overwrites every run, so the periodic CronJob re-ingests any updated
dataset (that's the "check for updates" mechanism).

Dual-mode:
  * Demo / self-contained:  ETL_AUTOSEED=1 (default) → stage bundled datasets.
  * Real external drops:    ETL_AUTOSEED=0 → skip; the pipeline reads whatever a
                            provider/share dropped into DROP_DIR/<source>/.

Env:
  ETL_DROP_DIR       — where the pipeline reads sources (default /data/drop)
  ETL_DATASETS_DIR   — where the bundled datasets live
                       (default: <repo>/seed/datasets/external-sor)
"""
import json
import os
from pathlib import Path

DROP_DIR = os.environ.get("ETL_DROP_DIR", "/data/drop")
DATASETS_DIR = os.environ.get(
    "ETL_DATASETS_DIR",
    str(Path(__file__).resolve().parent.parent / "seed" / "datasets" / "external-sor"),
)

# source key (matches pipeline.py `_read_records("<key>")`) → bundled dataset file.
# One entry per connector; the dataset keeps its own native shape.
SOURCE_MAP = {
    "ipps_a":  "5th SFG - IPPSA Full Roster.json",
    "medpros": "5th SFG - MEDPROS.json",
    "dtms":    "5th SFG - DTMS.json",
    "diss":    "5th SFG - DISS.json",
    "jko":     "5th SFG - JKO.json",
    "stepp":   "5th SFG - STEPP.json",
    "iperms":  "5th SFG - iPERMS.json",
    "dts":     "5th SFG - DTS.json",
    "tmt":     "5th SFG - TMT.json",
    "attars":  "5th SFG - ATTARS.json",
    "gcss":    "5th SFG - GCSS-Army.json",
    "fmsweb":  "5th SFG - FMSWeb MTOE.json",
    "atcts":   "5sfg-j6-aup-cyber-bulk-etl.json",
}


def stage(drop_dir: str = DROP_DIR, datasets_dir: str = DATASETS_DIR) -> int:
    """Copy each mapped dataset into drop_dir/<source>/<source>.json (compact)."""
    staged = 0
    for source, filename in SOURCE_MAP.items():
        src = os.path.join(datasets_dir, filename)
        if not os.path.exists(src):
            print(f"[stage] skip {source}: '{filename}' not found in {datasets_dir}")
            continue
        with open(src, encoding="utf-8") as f:
            data = json.load(f)
        dest_dir = os.path.join(drop_dir, source)
        os.makedirs(dest_dir, exist_ok=True)
        # Compact single-line: container only, never the source fields/values.
        with open(os.path.join(dest_dir, f"{source}.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, separators=(",", ":"))
        staged += 1
        print(f"[stage] {source:8s} <- {filename}")
    print(f"[stage] staged {staged}/{len(SOURCE_MAP)} sources into {drop_dir}")
    return staged


if __name__ == "__main__":
    stage()
