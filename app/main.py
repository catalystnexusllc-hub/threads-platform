"""
THREADS — FastAPI REST API.

Serves the data API only (nginx serves the SPA). Routes are 1:1 with the
original Express server's contract; the responses are byte-for-byte compatible
so the existing frontend is untouched.

Environment (see .env.example):
  DATABASE_URL  — Postgres DSN (required)
  API_KEY       — bearer/X-Api-Key required on all /api data routes (reads + writes;
                  /api/health stays open for probes). Empty = open, dev only.
  CORS_ORIGIN   — comma-separated allowed origins (default http://localhost:3000)
  NODE_ENV      — environment label echoed by /api/health (default development)
"""

import hmac
import logging
import os
import re
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import db

log = logging.getLogger("threads")

ENV = os.environ.get("NODE_ENV", "development")
API_KEY = os.environ.get("API_KEY") or None
UNIT_KEY_RE = re.compile(r"^[a-zA-Z0-9_-]{1,50}$")
VERSION = "2.4.1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init()
    yield
    await db.close()


app = FastAPI(lifespan=lifespan, title="THREADS API", version=VERSION)

_origins = [o.strip() for o in os.environ.get("CORS_ORIGIN", "http://localhost:3000").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in _origins else _origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Api-Key"],
)


def _err(status: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"ok": False, "error": message})


@app.exception_handler(Exception)
async def _unhandled(request: Request, exc: Exception):
    # Log the real error server-side; never leak internals (DB/SQL/paths) to clients.
    log.exception("Unhandled error on %s %s", request.method, request.url.path)
    return _err(500, "Internal server error")


# ─── auth + validation dependencies ─────────────────────────────────────────

async def require_api_key(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
):
    if not API_KEY:
        return  # auth disabled (local dev only)
    header = authorization or x_api_key or ""
    provided = header[7:] if header.startswith("Bearer ") else header
    # Constant-time comparison to avoid leaking the key via timing.
    if not hmac.compare_digest(provided, API_KEY):
        # Raise as a sentinel handled below to keep the {ok:false} envelope.
        raise _Unauthorized()


class _Unauthorized(Exception):
    pass


@app.exception_handler(_Unauthorized)
async def _on_unauthorized(request: Request, exc: _Unauthorized):
    return _err(401, "Unauthorized")


def validate_unit(unit: str) -> str:
    if not UNIT_KEY_RE.match(unit):
        raise _InvalidUnit()
    return unit


class _InvalidUnit(Exception):
    pass


@app.exception_handler(_InvalidUnit)
async def _on_invalid_unit(request: Request, exc: _InvalidUnit):
    return _err(400, "Invalid unit identifier")


# ─── data bootstrap ─────────────────────────────────────────────────────────

@app.get("/api/data", dependencies=[Depends(require_api_key)])
async def get_data():
    return {"ok": True, "data": await db.get_all_data()}


# ─── soldiers ───────────────────────────────────────────────────────────────

@app.put("/api/soldiers/{soldier_id}", dependencies=[Depends(require_api_key)])
async def put_soldier(soldier_id: str, request: Request):
    patch = await request.json()
    soldier = await db.update_soldier(soldier_id, patch)
    if soldier is None:
        return _err(404, "Soldier not found")
    return {"ok": True, "soldier": soldier}


# ─── unit sections ──────────────────────────────────────────────────────────

@app.get("/api/sections/{unit}", dependencies=[Depends(require_api_key)])
async def get_sections(unit: str = Depends(validate_unit)):
    return {"ok": True, "sections": await db.list_sections(unit)}


@app.post("/api/sections/{unit}", dependencies=[Depends(require_api_key)])
async def post_section(request: Request, unit: str = Depends(validate_unit)):
    body = await request.json()
    name, key, color = body.get("name"), body.get("key"), body.get("color")
    if not name or not key:
        return _err(400, "name and key are required")
    result = await db.add_section(unit, name, key, color)
    if result == "exists":
        return _err(409, "Section already exists")
    return {"ok": True, "sections": result}


@app.put("/api/sections/{unit}", dependencies=[Depends(require_api_key)])
async def put_sections(request: Request, unit: str = Depends(validate_unit)):
    body = await request.json()
    new_list = body.get("sections")
    if not isinstance(new_list, list):
        return _err(400, "sections must be an array")
    return {"ok": True, "sections": await db.replace_sections(unit, new_list)}


# ─── sitreps ────────────────────────────────────────────────────────────────

@app.get("/api/sitreps", dependencies=[Depends(require_api_key)])
async def get_sitreps():
    return {"ok": True, "sitreps": await db.list_sitreps()}


@app.put("/api/sitreps/{index}", dependencies=[Depends(require_api_key)])
async def put_sitrep(index: int, request: Request):
    patch = await request.json()
    count = await db.sitrep_count()
    if index < 0 or index >= count:
        return _err(404, "Sitrep index out of range")
    sitrep = await db.update_sitrep(index, patch)
    return {"ok": True, "sitrep": sitrep}


# ─── standup events ─────────────────────────────────────────────────────────

@app.get("/api/events", dependencies=[Depends(require_api_key)])
async def get_events():
    return {"ok": True, "events": await db.list_events()}


@app.post("/api/events", dependencies=[Depends(require_api_key)])
async def post_event(request: Request):
    body = await request.json()
    event = await db.create_event(body)
    return JSONResponse(status_code=201, content={"ok": True, "event": event})


@app.put("/api/events/{event_id}", dependencies=[Depends(require_api_key)])
async def put_event(event_id: int, request: Request):
    body = await request.json()
    event = await db.update_event(event_id, body)
    if event is None:
        return _err(404, "Event not found")
    return {"ok": True, "event": event}


@app.delete("/api/events/{event_id}", dependencies=[Depends(require_api_key)])
async def del_event(event_id: int):
    if not await db.delete_event(event_id):
        return _err(404, "Event not found")
    return {"ok": True}


# ─── leader locations ───────────────────────────────────────────────────────

async def _update_location(view: str, body: dict):
    leader_id, day, location = body.get("leaderId"), body.get("day"), body.get("location")
    if leader_id is None or day is None or not location:
        return _err(400, "leaderId, day, and location are required")
    if not await db.set_leader_location(view, leader_id, day, location):
        return _err(404, "Leader not found")
    return {"ok": True}


@app.put("/api/locations", dependencies=[Depends(require_api_key)])
async def put_location(request: Request):
    return await _update_location("live", await request.json())


@app.put("/api/closeout-locations", dependencies=[Depends(require_api_key)])
async def put_closeout_location(request: Request):
    return await _update_location("closeout", await request.json())


# ─── leader groups (standalone fetch; also available via /api/data) ──────────

@app.get("/api/leader-groups", dependencies=[Depends(require_api_key)])
async def get_leader_groups(view: str = "live"):
    if view not in ("live", "closeout"):
        return _err(400, "view must be 'live' or 'closeout'")
    return {"ok": True, "groups": await db.list_leader_groups(view)}


# ─── health ─────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    try:
        db_ok = await db.ping()
    except Exception:
        db_ok = False
    return {"ok": True, "version": VERSION, "service": "THREADS API", "env": ENV, "db": db_ok}
