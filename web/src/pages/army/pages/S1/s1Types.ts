/**
 * S1 Section — Data Architecture
 *
 * Defines the integration layer between external Systems of Record (SOR)
 * and the THREADS S1 data tables. Each field carries its source, sync
 * timestamp, and connection status so the UI can distinguish live data
 * from placeholders.
 *
 * Data flow:
 *   SOR (IPPSA / MEDPROS / DTMS / …)
 *     → /api/sor/<source>  (backend adapter, future)
 *     → S1DataStore (in-memory + IndexedDB cache)
 *     → React context / hooks
 *     → S1Page tables / charts
 */

export type SorSource =
  | 'IPPSA'        // Personnel management: grade, name, MOS, UIC
  | 'MEDPROS'      // Medical readiness: PHA, immunizations, dental
  | 'DTMS'         // Training management: course completions, AFT scores
  | 'HR_CONNECT'   // HR Connect / HRC: promotions, assignments
  | 'RCMS'         // Retention / reenlistment
  | 'THREADS'      // Internal THREADS profile: phone, email, duty title

export type ConnectionStatus = 'connected' | 'pending' | 'disconnected' | 'error'

/** A single field value annotated with its origin and freshness. */
export interface SorField<T = string> {
  value: T | null
  source: SorSource
  syncedAt: string | null   // ISO timestamp of last successful sync
  status: ConnectionStatus
}

/** Helpers to build placeholder fields */
export function ippsaField(_fieldLabel: string): SorField {
  return { value: null, source: 'IPPSA', syncedAt: null, status: 'pending' }
}
export function threadsField(_fieldLabel: string): SorField {
  return { value: null, source: 'THREADS', syncedAt: null, status: 'pending' }
}

// ── IPPSA Personnel Record ────────────────────────────────────────────────────
/** Raw record shape as it arrives from an IPPSA integration feed. */
export interface IppsaPersonnelRecord {
  dodid:            string
  grade:            SorField        // "PFC", "SPC", "SGT" …
  nameLastFirst:    SorField        // "SMITH, JOHN A"
  mos:              SorField        // "42A", "11B" …
  positionTitle:    SorField        // "S1 NCOIC"
  unitUic:          SorField        // "WXXXXX"
  etsSeparationDate:SorField        // "2026-05-31"
  securityClearance:SorField        // "SECRET"
}

// ── THREADS Profile Record ───────────────────────────────────────────────────
/** Contact fields stored in the THREADS user-profile database. */
export interface ThreadsProfileRecord {
  dodid:     string
  phone:     SorField   // Commercial cell / DSN
  dsnPhone:  SorField
  email:     SorField   // NIPR email
  dutyTitle: SorField
}

// ── Merged S1 Contact Record (roster row) ────────────────────────────────────
/** Composed record shown in the S1 Contact Roster table. */
export interface S1ContactRecord {
  dodid:    string
  grade:    SorField   // IPPSA
  name:     SorField   // IPPSA
  mos:      SorField   // IPPSA
  position: SorField   // IPPSA
  section:  string     // THREADS internal
  phone:    SorField   // THREADS Profile
  email:    SorField   // THREADS Profile
}

// ── Strength Data ─────────────────────────────────────────────────────────────
/** Unit strength numbers flowing from IPPSA / HRC. */
export interface StrengthData {
  authorized:    SorField<number>
  assigned:      SorField<number>
  presentForDuty:SorField<number>
  absent:        SorField<number>
  nonEffective:  SorField<number>
  asOf:          string   // date string
}

// ── SOR Connection Registry ──────────────────────────────────────────────────
export interface SorConnection {
  source:   SorSource
  label:    string
  status:   ConnectionStatus
  lastSync: string | null
  endpoint: string          // future API route
}

export const SOR_CONNECTIONS: SorConnection[] = [
  { source: 'IPPSA',       label: 'IPPSA',            status: 'pending',     lastSync: null, endpoint: '/api/sor/ippsa'       },
  { source: 'MEDPROS',     label: 'MEDPROS',          status: 'pending',     lastSync: null, endpoint: '/api/sor/medpros'     },
  { source: 'DTMS',        label: 'DTMS',             status: 'pending',     lastSync: null, endpoint: '/api/sor/dtms'        },
  { source: 'HR_CONNECT',  label: 'HR Connect',       status: 'pending',     lastSync: null, endpoint: '/api/sor/hrconnect'   },
  { source: 'RCMS',        label: 'RCMS',             status: 'pending',     lastSync: null, endpoint: '/api/sor/rcms'        },
  { source: 'THREADS',     label: 'THREADS Profile',  status: 'connected',   lastSync: 'Pending sync', endpoint: '/api/profile' },
]
