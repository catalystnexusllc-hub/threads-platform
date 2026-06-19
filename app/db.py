"""
THREADS — async PostgreSQL data layer (asyncpg).

Responsibilities:
  * Own the connection pool.
  * Apply raw SQL migrations on startup via a schema_migrations ledger,
    serialized across replicas with a pg_advisory_lock.
  * Seed the demo dataset idempotently (only when empty).
  * Reconstruct the EXACT nested JSON the frontend expects (contract parity)
    from the relational spine + JSONB leaves.
  * Perform granular, transactional writes (one entity per call) — this both
    preserves the API contract and removes the read-whole-blob/write-whole-blob
    race the SQLite KV store had.

Design notes live in migrations/0001_core_schema.sql.
"""

import json
import os
from pathlib import Path

import asyncpg

DATABASE_URL = os.environ["DATABASE_URL"]
MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"
SEED_PATH = Path(__file__).resolve().parent.parent / "seed" / "seed.json"

# Arbitrary but stable key so concurrent replica boots serialize migrate+seed.
_INIT_LOCK_KEY = 873_421_007

_pool: asyncpg.Pool | None = None


# ─── soldier field mapping (snake_case column ↔ camelCase JSON key) ──────────
# Order is irrelevant to the contract (the parity check sorts keys), but kept
# readable. dodid is a real field inside the soldier object; slug is NOT (it is
# the object key). All listed columns are string-valued in the data; a NULL
# column is omitted from the reconstructed object, which preserves the seed's
# per-soldier heterogeneity (the seed never carries JSON null, only absent keys).
SOLDIER_FIELD_MAP = [
    ("dodid", "dodid"),
    ("name", "name"), ("rank", "rank"), ("position", "position"), ("mos", "mos"),
    ("unit", "unit"), ("section", "section"), ("branch", "branch"), ("ssn", "ssn"),
    ("religion", "religion"), ("security", "security"), ("flags", "flags"),
    ("marital_status", "maritalStatus"), ("dependents", "dependents"),
    ("date_of_rank", "dateOfRank"), ("gain_date", "gainDate"),
    ("loss_date", "lossDate"), ("ets", "ets"),
    ("nipr_email", "niprEmail"), ("sipr_email", "siprEmail"),
    ("sipr_phone", "siprPhone"), ("nipr_phone", "niprPhone"),
    ("civ_phone", "civPhone"), ("pers_email", "persEmail"),
    ("eval_type", "evalType"), ("eval_subtype", "evalSubtype"),
    ("eval_status", "evalStatus"), ("rater", "rater"), ("rater_dodid", "raterDodid"),
    ("senior_rater", "seniorRater"), ("senior_rater_dodid", "seniorRaterDodid"),
    ("last_eval", "lastEval"), ("eval_thru_date", "evalThruDate"),
]
SOLDIER_COLS = [c for c, _ in SOLDIER_FIELD_MAP]
SOLDIER_KEY_TO_COL = {k: c for c, k in SOLDIER_FIELD_MAP}
# Nested groups that live in side tables (NOT spread from columns / profile_extra)
GROUP_KEYS = {"dd93", "sglv", "prr", "medical", "acft", "training", "leave", "awards"}

EVENT_KEY_TO_COL = {
    "title": "title", "day": "day", "start": "start_min", "duration": "duration",
    "location": "location", "opr": "opr", "category": "category", "recurring": "recurring",
}
EVENT_COL_TO_KEY = {v: k for k, v in EVENT_KEY_TO_COL.items()}


# ─── pool / migrations / seed ───────────────────────────────────────────────

async def _init_conn(conn: asyncpg.Connection) -> None:
    # Decode json/jsonb into Python objects (and encode dicts/lists on the way
    # in). This is what preserves number-vs-string fidelity inside the leaves.
    for typ in ("json", "jsonb"):
        await conn.set_type_codec(
            typ, encoder=json.dumps, decoder=json.loads, schema="pg_catalog",
        )


async def init() -> None:
    global _pool
    _pool = await asyncpg.create_pool(DATABASE_URL, init=_init_conn, min_size=1, max_size=10)
    async with _pool.acquire() as conn:
        await conn.execute("SELECT pg_advisory_lock($1)", _INIT_LOCK_KEY)
        try:
            await _run_migrations(conn)
            await _seed(conn)
        finally:
            await conn.execute("SELECT pg_advisory_unlock($1)", _INIT_LOCK_KEY)


async def close() -> None:
    if _pool is not None:
        await _pool.close()


async def ping() -> bool:
    async with _pool.acquire() as conn:
        return await conn.fetchval("SELECT 1") == 1


async def _run_migrations(conn: asyncpg.Connection) -> None:
    await conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        "  version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())"
    )
    applied = {r["version"] for r in await conn.fetch("SELECT version FROM schema_migrations")}
    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        if path.name in applied:
            continue
        async with conn.transaction():
            await conn.execute(path.read_text())
            await conn.execute("INSERT INTO schema_migrations(version) VALUES($1)", path.name)


async def _seed(conn: asyncpg.Connection) -> None:
    if await conn.fetchval("SELECT count(*) FROM core.soldiers") > 0:
        return
    data = json.loads(SEED_PATH.read_text())
    async with conn.transaction():
        # units + sections
        for unit_key, sections in data["unitSections"].items():
            await conn.execute(
                "INSERT INTO core.units(unit_key) VALUES($1) ON CONFLICT (unit_key) DO NOTHING",
                unit_key,
            )
            for pos, s in enumerate(sections):
                await conn.execute(
                    "INSERT INTO core.unit_sections(unit_key, section_key, name, color, position)"
                    " VALUES($1,$2,$3,$4,$5)",
                    unit_key, s["key"], s["name"], s.get("color", "#444"), pos,
                )
        # soldiers
        for slug, obj in data["soldiers"].items():
            cols, profile_extra, groups = _split_soldier(obj)
            soldier_id = await _insert_soldier_row(conn, slug, cols, profile_extra, "seed")
            await _write_soldier_groups(conn, soldier_id, groups, "seed")
        # sitreps
        for pos, s in enumerate(data["sitrepData"]):
            await conn.execute(
                "INSERT INTO core.sitreps(position, month, cdr_review, jcu, jsoc, status)"
                " VALUES($1,$2,$3,$4,$5,$6)",
                pos, s["month"], s.get("cdrReview"), s.get("jcu"), s.get("jsoc"), s.get("status"),
            )
        # standup events
        for e in data["standupEvents"]:
            await _persist_event(conn, e, "seed", is_new=True)
        # leader groups (two views)
        await _seed_leader_view(conn, data["leaderGroups"], "live")
        await _seed_leader_view(conn, data["closeoutLeaderGroups"], "closeout")


async def _seed_leader_view(conn, groups, view) -> None:
    for gpos, g in enumerate(groups):
        gid = await conn.fetchval(
            "INSERT INTO core.leader_groups(view, name, color, icon, position)"
            " VALUES($1,$2,$3,$4,$5) RETURNING id",
            view, g["name"], g.get("color"), g.get("icon"), gpos,
        )
        for lpos, leader in enumerate(g["leaders"]):
            lid = await conn.fetchval(
                "INSERT INTO core.leaders(group_id, leader_key, view, name, position)"
                " VALUES($1,$2,$3,$4,$5) RETURNING id",
                gid, leader["id"], view, leader["name"], lpos,
            )
            for day, loc in enumerate(leader.get("locations", [])):
                await conn.execute(
                    "INSERT INTO core.leader_locations(leader_id, day_index, location)"
                    " VALUES($1,$2,$3)",
                    lid, day, loc,
                )


# ─── soldier split / persist ────────────────────────────────────────────────

def _split_soldier(obj: dict):
    """Partition a soldier object into (column values, profile_extra, groups)."""
    cols, profile_extra, groups = {}, {}, {}
    for key, val in obj.items():
        if key in SOLDIER_KEY_TO_COL:
            cols[SOLDIER_KEY_TO_COL[key]] = val
        elif key in GROUP_KEYS:
            groups[key] = val
        else:
            profile_extra[key] = val  # evalDays (mixed-type) + sparse long tail
    return cols, profile_extra, groups


async def _insert_soldier_row(conn, slug, cols, profile_extra, source) -> int:
    columns = ["slug"] + SOLDIER_COLS + ["profile_extra", "source_system"]
    values = [slug] + [cols.get(c) for c in SOLDIER_COLS] + [profile_extra, source]
    placeholders = ", ".join(f"${i+1}" for i in range(len(values)))
    return await conn.fetchval(
        f"INSERT INTO core.soldiers ({', '.join(columns)}) VALUES ({placeholders}) RETURNING id",
        *values,
    )


async def _update_soldier_row(conn, slug, cols, profile_extra, source) -> int | None:
    assignments = ", ".join(f"{c} = ${i+2}" for i, c in enumerate(SOLDIER_COLS))
    n = len(SOLDIER_COLS)
    return await conn.fetchval(
        f"UPDATE core.soldiers SET {assignments},"
        f" profile_extra = ${n+2}, source_system = ${n+3} WHERE slug = $1 RETURNING id",
        slug, *[cols.get(c) for c in SOLDIER_COLS], profile_extra, source,
    )


async def _write_soldier_groups(conn, soldier_id, groups, source) -> None:
    """Reconcile every side table/collection for a soldier (upsert present, delete absent)."""
    # admin docs (dd93/sglv/prr)
    if any(k in groups for k in ("dd93", "sglv", "prr")):
        await conn.execute(
            "INSERT INTO core.soldier_admin_docs(soldier_id, dd93, sglv, prr, source_system)"
            " VALUES($1,$2,$3,$4,$5)"
            " ON CONFLICT (soldier_id) DO UPDATE SET"
            "   dd93=EXCLUDED.dd93, sglv=EXCLUDED.sglv, prr=EXCLUDED.prr, source_system=EXCLUDED.source_system",
            soldier_id, groups.get("dd93"), groups.get("sglv"), groups.get("prr"), source,
        )
    else:
        await conn.execute("DELETE FROM core.soldier_admin_docs WHERE soldier_id=$1", soldier_id)

    for key, table in (("medical", "soldier_medical"), ("acft", "soldier_acft"), ("training", "soldier_training")):
        if key in groups:
            await conn.execute(
                f"INSERT INTO core.{table}(soldier_id, data, source_system) VALUES($1,$2,$3)"
                f" ON CONFLICT (soldier_id) DO UPDATE SET data=EXCLUDED.data, source_system=EXCLUDED.source_system",
                soldier_id, groups[key], source,
            )
        else:
            await conn.execute(f"DELETE FROM core.{table} WHERE soldier_id=$1", soldier_id)

    # leave summary + entries
    await conn.execute("DELETE FROM core.soldier_leave_entries WHERE soldier_id=$1", soldier_id)
    if "leave" in groups:
        lv = groups["leave"] or {}
        await conn.execute(
            "INSERT INTO core.soldier_leave(soldier_id, balance, use_lose, source_system)"
            " VALUES($1,$2,$3,$4)"
            " ON CONFLICT (soldier_id) DO UPDATE SET balance=EXCLUDED.balance,"
            "   use_lose=EXCLUDED.use_lose, source_system=EXCLUDED.source_system",
            soldier_id, lv.get("balance"), lv.get("useLose"), source,
        )
        for bucket in ("pending", "approved"):
            for pos, entry in enumerate(lv.get(bucket, []) or []):
                await conn.execute(
                    "INSERT INTO core.soldier_leave_entries"
                    "(soldier_id, bucket, leave_type, start_date, end_date, days, position, source_system)"
                    " VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
                    soldier_id, bucket, entry.get("type"), entry.get("start"),
                    entry.get("end"), entry.get("days"), pos, source,
                )
    else:
        await conn.execute("DELETE FROM core.soldier_leave WHERE soldier_id=$1", soldier_id)

    # awards
    await conn.execute("DELETE FROM core.soldier_awards WHERE soldier_id=$1", soldier_id)
    if "awards" in groups:
        aw = groups["awards"] or {}
        for bucket in ("current", "submitted", "nominated"):
            for pos, award in enumerate(aw.get(bucket, []) or []):
                await conn.execute(
                    "INSERT INTO core.soldier_awards(soldier_id, bucket, award, position, source_system)"
                    " VALUES($1,$2,$3,$4,$5)",
                    soldier_id, bucket, award, pos, source,
                )


# ─── reconstruction (relational → exact nested JSON) ────────────────────────

def _assemble_soldier(srow, admin, medical, acft, training, leave_row, entries, awards) -> dict:
    obj: dict = {}
    for col, key in SOLDIER_FIELD_MAP:
        v = srow[col]
        if v is not None:
            obj[key] = v
    obj.update(srow["profile_extra"] or {})       # evalDays + sparse long tail
    if admin is not None:
        for col in ("dd93", "sglv", "prr"):
            if admin[col] is not None:
                obj[col] = admin[col]
    if medical is not None:
        obj["medical"] = medical
    if acft is not None:
        obj["acft"] = acft
    if training is not None:
        obj["training"] = training
    # leave (present for every soldier record in this dataset)
    if leave_row is not None or entries:
        lv: dict = {}
        if leave_row is not None:
            if leave_row["balance"] is not None:
                lv["balance"] = leave_row["balance"]
            if leave_row["use_lose"] is not None:
                lv["useLose"] = leave_row["use_lose"]
        lv["pending"] = [_entry(e) for e in entries if e["bucket"] == "pending"]
        lv["approved"] = [_entry(e) for e in entries if e["bucket"] == "approved"]
        obj["leave"] = lv
    # awards: structural part of every soldier record (empty buckets if none)
    obj["awards"] = {
        "current": [a["award"] for a in awards if a["bucket"] == "current"],
        "submitted": [a["award"] for a in awards if a["bucket"] == "submitted"],
        "nominated": [a["award"] for a in awards if a["bucket"] == "nominated"],
    }
    return obj


def _entry(e) -> dict:
    return {"type": e["leave_type"], "start": e["start_date"], "end": e["end_date"], "days": e["days"]}


def _assemble_event(row) -> dict:
    out = {"id": row["event_id"]}
    for col, key in EVENT_COL_TO_KEY.items():
        if row[col] is not None:
            out[key] = row[col]
    out.update(row["extra"] or {})
    return out


async def get_all_data() -> dict:
    async with _pool.acquire() as conn:
        soldiers = await conn.fetch("SELECT * FROM core.soldiers ORDER BY id")
        admin = {r["soldier_id"]: r for r in await conn.fetch("SELECT * FROM core.soldier_admin_docs")}
        medical = {r["soldier_id"]: r["data"] for r in await conn.fetch("SELECT soldier_id, data FROM core.soldier_medical")}
        acft = {r["soldier_id"]: r["data"] for r in await conn.fetch("SELECT soldier_id, data FROM core.soldier_acft")}
        training = {r["soldier_id"]: r["data"] for r in await conn.fetch("SELECT soldier_id, data FROM core.soldier_training")}
        leave = {r["soldier_id"]: r for r in await conn.fetch("SELECT * FROM core.soldier_leave")}
        entries_rows = await conn.fetch("SELECT * FROM core.soldier_leave_entries ORDER BY soldier_id, position")
        awards_rows = await conn.fetch("SELECT * FROM core.soldier_awards ORDER BY soldier_id, position")

        entries: dict = {}
        for e in entries_rows:
            entries.setdefault(e["soldier_id"], []).append(e)
        awards: dict = {}
        for a in awards_rows:
            awards.setdefault(a["soldier_id"], []).append(a)

        soldiers_out = {}
        for s in soldiers:
            sid = s["id"]
            soldiers_out[s["slug"]] = _assemble_soldier(
                s, admin.get(sid), medical.get(sid), acft.get(sid), training.get(sid),
                leave.get(sid), entries.get(sid, []), awards.get(sid, []),
            )

        return {
            "soldiers": soldiers_out,
            "unitSections": await _unit_sections(conn),
            "sitrepData": await _sitreps(conn),
            "standupEvents": [_assemble_event(r) for r in
                              await conn.fetch("SELECT * FROM core.standup_events ORDER BY event_id")],
            "leaderGroups": await _leader_view(conn, "live"),
            "closeoutLeaderGroups": await _leader_view(conn, "closeout"),
        }


async def _reload_soldier(conn, slug) -> dict | None:
    s = await conn.fetchrow("SELECT * FROM core.soldiers WHERE slug=$1", slug)
    if s is None:
        return None
    sid = s["id"]
    admin = await conn.fetchrow("SELECT * FROM core.soldier_admin_docs WHERE soldier_id=$1", sid)
    medical = await conn.fetchval("SELECT data FROM core.soldier_medical WHERE soldier_id=$1", sid)
    acft = await conn.fetchval("SELECT data FROM core.soldier_acft WHERE soldier_id=$1", sid)
    training = await conn.fetchval("SELECT data FROM core.soldier_training WHERE soldier_id=$1", sid)
    leave_row = await conn.fetchrow("SELECT * FROM core.soldier_leave WHERE soldier_id=$1", sid)
    entries = await conn.fetch("SELECT * FROM core.soldier_leave_entries WHERE soldier_id=$1 ORDER BY position", sid)
    awards = await conn.fetch("SELECT * FROM core.soldier_awards WHERE soldier_id=$1 ORDER BY position", sid)
    return _assemble_soldier(s, admin, medical, acft, training, leave_row, entries, awards)


async def _unit_sections(conn) -> dict:
    rows = await conn.fetch(
        "SELECT unit_key, section_key, name, color FROM core.unit_sections ORDER BY unit_key, position")
    out: dict = {}
    for r in rows:
        out.setdefault(r["unit_key"], []).append(
            {"name": r["name"], "key": r["section_key"], "color": r["color"]})
    return out


async def _sitreps(conn) -> list:
    rows = await conn.fetch("SELECT * FROM core.sitreps ORDER BY position")
    return [{"month": r["month"], "cdrReview": r["cdr_review"], "jcu": r["jcu"],
             "jsoc": r["jsoc"], "status": r["status"]} for r in rows]


async def _leader_view(conn, view) -> list:
    groups = await conn.fetch(
        "SELECT * FROM core.leader_groups WHERE view=$1 ORDER BY position", view)
    out = []
    for g in groups:
        leaders = await conn.fetch(
            "SELECT * FROM core.leaders WHERE group_id=$1 ORDER BY position", g["id"])
        lout = []
        for ld in leaders:
            locs = await conn.fetch(
                "SELECT location FROM core.leader_locations WHERE leader_id=$1 ORDER BY day_index", ld["id"])
            lout.append({"id": ld["leader_key"], "name": ld["name"],
                         "locations": [x["location"] for x in locs]})
        out.append({"name": g["name"], "color": g["color"], "icon": g["icon"], "leaders": lout})
    return out


async def list_leader_groups(view: str) -> list:
    async with _pool.acquire() as conn:
        return await _leader_view(conn, view)


# ─── granular write methods (called by the routes) ──────────────────────────

def _deep_merge(target: dict, source: dict) -> dict:
    out = dict(target)
    for k, v in source.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out


async def update_soldier(slug: str, patch: dict) -> dict | None:
    async with _pool.acquire() as conn:
        async with conn.transaction():
            current = await _reload_soldier(conn, slug)
            if current is None:
                return None
            merged = _deep_merge(current, patch)
            cols, profile_extra, groups = _split_soldier(merged)
            soldier_id = await _update_soldier_row(conn, slug, cols, profile_extra, "app")
            await _write_soldier_groups(conn, soldier_id, groups, "app")
            return await _reload_soldier(conn, slug)


async def list_sections(unit: str) -> list:
    async with _pool.acquire() as conn:
        return (await _unit_sections(conn)).get(unit, [])


async def add_section(unit: str, name: str, key: str, color: str | None) -> list | str:
    async with _pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                "INSERT INTO core.units(unit_key) VALUES($1) ON CONFLICT (unit_key) DO NOTHING", unit)
            exists = await conn.fetchval(
                "SELECT 1 FROM core.unit_sections WHERE unit_key=$1 AND section_key=$2", unit, key)
            if exists:
                return "exists"
            pos = await conn.fetchval(
                "SELECT COALESCE(MAX(position)+1, 0) FROM core.unit_sections WHERE unit_key=$1", unit)
            await conn.execute(
                "INSERT INTO core.unit_sections(unit_key, section_key, name, color, position, source_system)"
                " VALUES($1,$2,$3,$4,$5,'app')",
                unit, key, name, color or "#444", pos)
            return (await _unit_sections(conn)).get(unit, [])


async def replace_sections(unit: str, sections: list) -> list:
    async with _pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                "INSERT INTO core.units(unit_key) VALUES($1) ON CONFLICT (unit_key) DO NOTHING", unit)
            await conn.execute("DELETE FROM core.unit_sections WHERE unit_key=$1", unit)
            for pos, s in enumerate(sections):
                await conn.execute(
                    "INSERT INTO core.unit_sections(unit_key, section_key, name, color, position, source_system)"
                    " VALUES($1,$2,$3,$4,$5,'app')",
                    unit, s["key"], s["name"], s.get("color", "#444"), pos)
            return (await _unit_sections(conn)).get(unit, [])


async def list_sitreps() -> list:
    async with _pool.acquire() as conn:
        return await _sitreps(conn)


async def sitrep_count() -> int:
    async with _pool.acquire() as conn:
        return await conn.fetchval("SELECT count(*) FROM core.sitreps")


async def update_sitrep(index: int, patch: dict) -> dict | None:
    colmap = {"month": "month", "cdrReview": "cdr_review", "jcu": "jcu", "jsoc": "jsoc", "status": "status"}
    async with _pool.acquire() as conn:
        async with conn.transaction():
            row = await conn.fetchrow("SELECT * FROM core.sitreps WHERE position=$1", index)
            if row is None:
                return None
            sets, vals = [], []
            for key, val in patch.items():
                if key in colmap:
                    vals.append(val)
                    sets.append(f"{colmap[key]} = ${len(vals)}")
            if sets:
                vals.append(index)
                await conn.execute(
                    f"UPDATE core.sitreps SET {', '.join(sets)} WHERE position=${len(vals)}", *vals)
            r = await conn.fetchrow("SELECT * FROM core.sitreps WHERE position=$1", index)
            return {"month": r["month"], "cdrReview": r["cdr_review"], "jcu": r["jcu"],
                    "jsoc": r["jsoc"], "status": r["status"]}


async def list_events() -> list:
    async with _pool.acquire() as conn:
        return [_assemble_event(r) for r in
                await conn.fetch("SELECT * FROM core.standup_events ORDER BY event_id")]


async def _persist_event(conn, event: dict, source: str, is_new: bool) -> None:
    cols = {"title": None, "day": None, "start_min": None, "duration": None,
            "location": None, "opr": None, "category": None, "recurring": None}
    extra = {}
    for key, val in event.items():
        if key == "id":
            continue
        if key in EVENT_KEY_TO_COL:
            cols[EVENT_KEY_TO_COL[key]] = val
        else:
            extra[key] = val
    await conn.execute(
        "INSERT INTO core.standup_events"
        "(event_id, title, day, start_min, duration, location, opr, category, recurring, extra, source_system)"
        " VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)"
        " ON CONFLICT (event_id) DO UPDATE SET title=EXCLUDED.title, day=EXCLUDED.day,"
        " start_min=EXCLUDED.start_min, duration=EXCLUDED.duration, location=EXCLUDED.location,"
        " opr=EXCLUDED.opr, category=EXCLUDED.category, recurring=EXCLUDED.recurring,"
        " extra=EXCLUDED.extra, source_system=EXCLUDED.source_system",
        event["id"], cols["title"], cols["day"], cols["start_min"], cols["duration"],
        cols["location"], cols["opr"], cols["category"], cols["recurring"], extra, source,
    )


async def create_event(body: dict) -> dict:
    async with _pool.acquire() as conn:
        async with conn.transaction():
            new_id = (await conn.fetchval("SELECT COALESCE(MAX(event_id), 0) FROM core.standup_events")) + 1
            event = {**body, "id": new_id}
            await _persist_event(conn, event, "app", is_new=True)
            r = await conn.fetchrow("SELECT * FROM core.standup_events WHERE event_id=$1", new_id)
            return _assemble_event(r)


async def update_event(event_id: int, body: dict) -> dict | None:
    async with _pool.acquire() as conn:
        async with conn.transaction():
            r = await conn.fetchrow("SELECT * FROM core.standup_events WHERE event_id=$1", event_id)
            if r is None:
                return None
            merged = {**_assemble_event(r), **body, "id": event_id}
            await _persist_event(conn, merged, "app", is_new=False)
            r = await conn.fetchrow("SELECT * FROM core.standup_events WHERE event_id=$1", event_id)
            return _assemble_event(r)


async def delete_event(event_id: int) -> bool:
    async with _pool.acquire() as conn:
        result = await conn.execute("DELETE FROM core.standup_events WHERE event_id=$1", event_id)
        return result.endswith("1")


async def set_leader_location(view: str, leader_id: str, day: int, location: str) -> bool:
    async with _pool.acquire() as conn:
        lid = await conn.fetchval(
            "SELECT id FROM core.leaders WHERE view=$1 AND leader_key=$2", view, leader_id)
        if lid is None:
            return False
        await conn.execute(
            "INSERT INTO core.leader_locations(leader_id, day_index, location) VALUES($1,$2,$3)"
            " ON CONFLICT (leader_id, day_index) DO UPDATE SET location=EXCLUDED.location, updated_at=now()",
            lid, day, location)
        return True
