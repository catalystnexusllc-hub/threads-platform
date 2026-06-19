"""
THREADS — dlt extract/load pipeline (source → staging).

A third party drops source datasets as files under ETL_DROP_DIR/<source>/*.json
(JSON array or JSON-lines). dlt infers/evolves the schema, so arbitrary provider
structures land without code changes; we keep the FULL record in `_raw` (which
preserves JSON types — numbers stay numbers) and pull out a few typed columns
for convenience/queries. The staging tables are pre-created by migration
0002_etl_staging.sql; dlt replaces their contents each run.

Each resource here is intentionally small and independent so it can later be
wrapped as a Dagster asset without changing the load logic.

Drop-directory → resource mapping:
  ipps_a/    → ipps_a_personnel      (IPPS-A Full Roster)
  medpros/   → medpros_readiness     (MEDPROS medical readiness)
  dtms/      → dtms_training         (DTMS AFT/CFT/course records)
  diss/      → diss_clearances       (DISS security clearances & investigations)
  jko/       → jko_completions       (JKO online training completions)
  stepp/     → stepp_certs           (STEPP security training certs)
  gcss/      → gcss_equipment        (GCSS-Army property book lines)
  dts/       → dts_travel            (DTS travel authorizations)
  attars/    → attars_training       (ATTARS soldier readiness records)
  attars/    → attars_events         (ATTARS training event records)
  iperms/    → iperms_records        (iPERMS OMPF record completeness)
  tmt/       → tmt_tasks             (TMT task management)
  fmsweb/    → fmsweb_positions      (FMSWeb MTOE authorized positions)
  atcts/     → cyber_aup             (ATCTS AUP/cyber compliance)
"""

import glob
import json
import os

import dlt

DROP_DIR = os.environ.get("ETL_DROP_DIR", "/data/drop")


def _read_records(source: str):
    """Yield raw records from every file the provider dropped for a source."""
    for path in sorted(glob.glob(os.path.join(DROP_DIR, source, "*.json"))):
        text = open(path, encoding="utf-8").read().strip()
        if not text:
            continue
        if text[0] == "[":                       # JSON array
            yield from json.loads(text)
        else:                                    # JSON-lines or envelope object
            for line in text.splitlines():
                if line.strip():
                    yield json.loads(line)


def _iter_nested(records, nested_key: str):
    """
    For each raw record, either yield from record[nested_key] (envelope format)
    or yield the record itself (flat format). Handles both drop styles.
    """
    for r in records:
        if nested_key in r:
            yield from r[nested_key]
        else:
            yield r


# ── IPPS-A ──────────────────────────────────────────────────────────────────

@dlt.resource(name="ipps_a_personnel", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def ipps_a_personnel():
    """IPPS-A Full Roster: master personnel record for every assigned soldier."""
    for r in _iter_nested(_read_records("ipps_a"), "soldiers"):
        yield {
            "dodid":      r.get("edipi") or r.get("dodid"),   # EDIPI === DODID (10-digit)
            "last_name":  r.get("lastName") or r.get("last_name"),
            "first_name": r.get("firstName") or r.get("first_name"),
            "rank":       r.get("rank"),
            "grade":      r.get("grade"),
            "mos":        r.get("mos"),
            "unit":       r.get("unitName") or r.get("unit"),
            "unit_uic":   r.get("unitUIC"),
            "company":    r.get("company"),
            "section":    r.get("section"),
            "para_line":  r.get("paraLine"),
            "ets":        r.get("ets"),
            "basd":       r.get("basd"),
            "pebd":       r.get("pebd"),
            "_raw":       r,
        }


# ── MEDPROS ─────────────────────────────────────────────────────────────────

@dlt.resource(name="medpros_readiness", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def medpros_readiness():
    """MEDPROS: medical readiness status per soldier."""
    for r in _iter_nested(_read_records("medpros"), "soldiers"):
        yield {
            "dodid":          r.get("dodid"),
            "name":           r.get("name"),
            "rank":           r.get("rank"),
            "unit":           r.get("unit"),
            "section":        r.get("section"),
            "med_status":     r.get("medStatus"),
            "mrc_class":      r.get("mrcClass"),
            "dental":         r.get("dental"),
            "dental_date":    r.get("dentalDate"),
            "immunizations":  r.get("immunizations"),
            "imm_date":       r.get("immunizationsDate"),
            "vision":         r.get("vision"),
            "_raw":           r,
        }


# ── DTMS ────────────────────────────────────────────────────────────────────

@dlt.resource(name="dtms_training", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def dtms_training():
    """DTMS: AFT/CFT scores, course completions, training status per soldier."""
    for r in _iter_nested(_read_records("dtms"), "soldiers"):
        score_field = r.get("score")
        # Flat bulk ETL files carry aft/cft as nested objects; handle both
        aft = r.get("aft") or {}
        yield {
            "dodid":       r.get("dodid"),
            "name":        r.get("name"),
            "rank":        r.get("rank"),
            "unit":        r.get("unit"),
            "section":     r.get("section"),
            "mos":         r.get("mos"),
            "gender":      r.get("gender"),
            "age_group":   r.get("ageGroup") or r.get("age_group"),
            "aft_score":   (None if score_field is None else str(score_field))
                           or (str(aft.get("totalScore")) if aft.get("totalScore") is not None else None),
            "aft_status":  r.get("status") or aft.get("status"),
            "aft_date":    r.get("date") or aft.get("testDate"),
            "_raw":        r,
        }


# ── DISS ─────────────────────────────────────────────────────────────────────

@dlt.resource(name="diss_clearances", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def diss_clearances():
    """DISS: security clearance eligibility, investigation status, PR due dates."""
    for r in _iter_nested(_read_records("diss"), "subjects"):
        yield {
            "dodid":               r.get("edipi") or r.get("dodid"),   # EDIPI === DODID
            "last_name":           r.get("lastName"),
            "first_name":          r.get("firstName"),
            "rank":                r.get("rank"),
            "unit":                r.get("unit"),
            "eligibility_level":   r.get("eligibilityLevel"),
            "eligibility_status":  r.get("eligibilityStatus"),
            "investigation_type":  r.get("investigationType"),
            "investigation_date":  r.get("investigationDate"),
            "adjudication_date":   r.get("adjudicationDate"),
            "pr_due_date":         r.get("prDueDate"),
            "pr_status":           r.get("prStatus"),
            "status":              r.get("status"),
            "derog_info":          r.get("derogInfo"),
            "_raw":                r,
        }


# ── JKO ──────────────────────────────────────────────────────────────────────

@dlt.resource(name="jko_completions", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def jko_completions():
    """JKO: online course completion records per soldier."""
    for r in _iter_nested(_read_records("jko"), "records"):
        yield {
            "dodid":          r.get("edipi") or r.get("dodid"),   # EDIPI === DODID
            "name":           r.get("name"),
            "rank":           r.get("rank"),
            "unit":           r.get("unit"),
            "overall_status": r.get("overallStatus"),
            "completions":    r.get("completions"),   # kept as _raw nested object
            "_raw":           r,
        }


# ── STEPP ────────────────────────────────────────────────────────────────────

@dlt.resource(name="stepp_certs", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def stepp_certs():
    """STEPP: security training certifications (SCI-adjacent, CI awareness, etc.)."""
    for r in _iter_nested(_read_records("stepp"), "records"):
        yield {
            "dodid":             r.get("edipi") or r.get("dodid"),   # EDIPI === DODID
            "name":              r.get("name"),
            "rank":              r.get("rank"),
            "unit":              r.get("unit"),
            "clearance_level":   r.get("clearanceLevel"),
            "overall_status":    r.get("overallStatus"),
            "last_review_date":  r.get("lastReviewDate"),
            "completions":       r.get("trainingCompletions"),
            "_raw":              r,
        }


# ── GCSS-Army ────────────────────────────────────────────────────────────────

@dlt.resource(name="gcss_equipment", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def gcss_equipment():
    """GCSS-Army: property book equipment lines (LIN/NSN, condition, readiness)."""
    for r in _read_records("gcss"):
        # Envelope: { propertyBook: { equipmentLines: [...] }, ... }
        if "propertyBook" in r:
            lines = r["propertyBook"].get("equipmentLines", [])
        else:
            # Already a flat equipment line record
            lines = [r]
        for line in lines:
            yield {
                "lin":              line.get("lin"),
                "nsn":              line.get("nsn"),
                "nomenclature":     line.get("nomenclature"),
                "qty_authorized":   line.get("qty_authorized"),
                "qty_on_hand":      line.get("qty_onHand"),
                "qty_shortfall":    line.get("qty_shortfall"),
                "condition":        line.get("condition"),
                "hand_receipt":     line.get("handReceiptHolder"),
                "maint_status":     line.get("maintenanceStatus"),
                "readiness_flag":   line.get("readinessFlag"),
                "_raw":             line,
            }


# ── DTS ──────────────────────────────────────────────────────────────────────

@dlt.resource(name="dts_travel", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def dts_travel():
    """DTS: travel authorizations and voucher status."""
    for r in _iter_nested(_read_records("dts"), "travelAuthorizations"):
        yield {
            "auth_number":        r.get("authNumber"),
            "traveler":           r.get("traveler"),
            "purpose":            r.get("purpose"),
            "departure_date":     r.get("departureDate"),
            "return_date":        r.get("returnDate"),
            "destination":        r.get("destination"),
            "per_diem_rate":      r.get("perDiemRate"),
            "transport_mode":     r.get("transportMode"),
            "estimated_cost":     r.get("estimatedCost"),
            "approval_status":    r.get("approvalStatus"),
            "approved_by":        r.get("approvedBy"),
            "voucher_status":     r.get("voucherStatus"),
            "reimbursement":      r.get("reimbursementAmount"),
            "_raw":               r,
        }


# ── ATTARS ───────────────────────────────────────────────────────────────────

@dlt.resource(name="attars_training", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def attars_training():
    """ATTARS: soldier-level training readiness records (AFT, weapons, SHARP, etc.)."""
    for r in _iter_nested(_read_records("attars"), "soldierTrainingRecords"):
        yield {
            "dodid":          r.get("dodid"),
            "name":           r.get("name"),
            "rank":           r.get("rank"),
            "unit":           r.get("unit"),
            "aft":            r.get("aft"),
            "cft":            r.get("cft"),
            "weapons_qual":   r.get("weaponsQual"),
            "sharp":          r.get("sharp"),
            "opsec":          r.get("opsec"),
            "combatives":     r.get("combatives"),
            "airborne":       r.get("airborne"),
            "tccc":           r.get("tccc"),
            "readiness_flag": r.get("readinessFlag"),
            "_raw":           r,
        }


@dlt.resource(name="attars_events", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def attars_events():
    """ATTARS: training event records (unit-level AFT/weapons events)."""
    for r in _iter_nested(_read_records("attars"), "trainingEvents"):
        yield {
            "event_id":        r.get("eventId"),
            "title":           r.get("title"),
            "category":        r.get("category"),
            "type":            r.get("type"),
            "status":          r.get("status"),
            "scheduled_date":  r.get("scheduledDate"),
            "completion_date": r.get("completionDate"),
            "location":        r.get("location"),
            "oic":             r.get("officer_in_charge"),
            "soldiers_tested": r.get("soldiers_tested"),
            "pass_count":      r.get("passCount"),
            "fail_count":      r.get("failCount"),
            "required_count":  r.get("requiredCount"),
            "pass_rate":       r.get("passRate"),
            "_raw":            r,
        }


# ── iPERMS ───────────────────────────────────────────────────────────────────

@dlt.resource(name="iperms_records", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def iperms_records():
    """iPERMS: OMPF record completeness and audit status."""
    for r in _iter_nested(_read_records("iperms"), "records"):
        yield {
            "dodid":               r.get("dodid"),
            "name":                r.get("name"),
            "rank":                r.get("rank"),
            "unit":                r.get("unit"),
            "section":             r.get("section"),
            "ompf_sections":       r.get("ompfSections"),
            "record_completeness": r.get("recordCompleteness"),
            "last_audit_date":     r.get("lastAuditDate"),
            "audited_by":          r.get("auditedBy"),
            "_raw":                r,
        }


# ── TMT ──────────────────────────────────────────────────────────────────────

@dlt.resource(name="tmt_tasks", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def tmt_tasks():
    """TMT: task management — suspenses, assignments, percent complete."""
    for r in _iter_nested(_read_records("tmt"), "tasks"):
        yield {
            "task_id":         r.get("taskId"),
            "title":           r.get("title"),
            "section":         r.get("section"),
            "assigned_to":     r.get("assignedTo"),
            "assigned_by":     r.get("assignedBy"),
            "priority":        r.get("priority"),
            "category":        r.get("category"),
            "due_date":        r.get("dueDate"),
            "status":          r.get("status"),
            "pct_complete":    r.get("percentComplete"),
            "opened_date":     r.get("openedDate"),
            "closed_date":     r.get("closedDate"),
            "description":     r.get("description"),
            "_raw":            r,
        }


# ── FMSWeb MTOE ──────────────────────────────────────────────────────────────

@dlt.resource(name="fmsweb_positions", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def fmsweb_positions():
    """FMSWeb: MTOE authorized positions flattened from organizations → sections → positions."""
    for r in _read_records("fmsweb"):
        if "organizations" in r:
            for org in r["organizations"]:
                for sec in org.get("sections", []):
                    for pos in sec.get("positions", []):
                        yield {
                            "org_name":  org.get("name"),
                            "uic":       org.get("uic"),
                            "section":   sec.get("section"),
                            "para_line": pos.get("paraLine"),
                            "grade":     pos.get("grade"),
                            "mos":       pos.get("mos"),
                            "title":     pos.get("title"),
                            "filled":    pos.get("filled"),
                            "sdap":      pos.get("sdap"),
                            "_raw":      pos,
                        }
        else:
            # Already a flat position record
            yield {
                "para_line": r.get("paraLine"),
                "grade":     r.get("grade"),
                "mos":       r.get("mos"),
                "title":     r.get("title"),
                "filled":    r.get("filled"),
                "sdap":      r.get("sdap"),
                "_raw":      r,
            }


# ── ATCTS / AUP / Cyber ──────────────────────────────────────────────────────

@dlt.resource(name="cyber_aup", write_disposition="replace", columns={"_raw": {"data_type": "json"}})
def cyber_aup():
    """ATCTS/AUP: annual cyber awareness and acceptable use policy compliance."""
    for r in _read_records("atcts"):
        yield {
            "dodid":      r.get("dodid"),
            "name":       r.get("name"),
            "rank":       r.get("rank"),
            "unit":       r.get("unit"),
            "section":    r.get("section"),
            "aup":        r.get("aup"),
            "aup_date":   r.get("aupDate"),
            "aup_exp":    r.get("aupExp"),
            "cyber":      r.get("cyber"),
            "cyber_date": r.get("cyberDate"),
            "cyber_exp":  r.get("cyberExp"),
            "sharp":      r.get("sharp"),
            "sharp_date": r.get("sharpDate"),
            "opsec":      r.get("opsec"),
            "opsec_date": r.get("opsecDate"),
            "_raw":       r,
        }


# ── Source bundle ─────────────────────────────────────────────────────────────

@dlt.source(name="threads")
def threads_sources():
    return [
        ipps_a_personnel(),
        medpros_readiness(),
        dtms_training(),
        diss_clearances(),
        jko_completions(),
        stepp_certs(),
        gcss_equipment(),
        dts_travel(),
        attars_training(),
        attars_events(),
        iperms_records(),
        tmt_tasks(),
        fmsweb_positions(),
        cyber_aup(),
    ]
