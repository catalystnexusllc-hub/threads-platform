// Types mirror the THREADS API contract exactly (the shape GET /api/data returns).
// The data is heterogeneous per soldier, so nested records carry index signatures
// and mixed-type fields (e.g. acft.score) are number | string.

// ── Shared status types ───────────────────────────────────────────────────────
export type StatusColor = 'Green' | 'Amber' | 'Red'
export type BadgeClass = 'active' | 'guard' | 'reserve' | 'cocom'

// ── Personnel ─────────────────────────────────────────────────────────────────
export interface MedicalRecord {
  status: string
  dental: string
  dentalExp: string
  immunizations: string
  immunizationsExp: string
  pharmacy: string
  vision: string
  visionExp: string
  mrcClass: string
  pulhes: string
  // anderson-class soldiers add hearing/hiv/pha/meb/profileStatus/bloodType/...
  [key: string]: unknown
}

export interface AcftRecord {
  score: number | string // 'N/A' for untested soldiers
  status: string // 'Pass' | 'Required' | ...
  category: string
  ageGroup: string
  date?: string
  type?: string
  [key: string]: unknown
}

export interface TrainingRecord {
  cyber: string
  cyberExp: string
  aup: string
  aupExp: string
  sharp: string
  [key: string]: string
}

export interface LeaveRequest {
  type: string
  start: string
  end: string
  days: number
}

export interface LeaveRecord {
  balance: number
  useLose: number
  pending: LeaveRequest[]
  approved: LeaveRequest[]
}

export interface AwardsRecord {
  current: string[]
  submitted: string[]
  nominated: string[]
}

export interface SoldierRecord {
  name: string
  rank: string
  position: string
  mos: string
  unit: string
  section: string
  branch: string
  ssn: string
  religion?: string
  dateOfRank: string
  dodid: string
  niprEmail: string
  siprEmail: string
  siprPhone: string
  niprPhone: string
  civPhone: string
  persEmail: string
  gainDate: string
  lossDate: string
  ets: string
  dd93: { status: string; date?: string; exp?: string; comment?: string }
  sglv: { status: string; amount?: string; exp?: string; comment?: string }
  prr: { status: string; date?: string; exp?: string; comment?: string }
  evalType: string
  evalSubtype: string
  evalDays: number | string
  rater: string
  raterDodid: string
  seniorRater: string
  seniorRaterDodid: string
  lastEval: string
  evalThruDate: string
  medical: MedicalRecord
  acft: AcftRecord
  training: TrainingRecord
  leave: LeaveRecord
  awards: AwardsRecord
  flags: string
  security?: string
  // sparse fields (maritalStatus, address, spouse, s2, badge, pme, ...) vary per soldier
  [key: string]: unknown
}

// ── Unit Sections ─────────────────────────────────────────────────────────────
export interface UnitSection {
  name: string
  key: string
  color: string
}

// ── SITREP (one row per month) ────────────────────────────────────────────────
export interface SitrepEntry {
  month: string
  cdrReview: string
  jcu: string
  jsoc: string
  status: string // 'scheduled' | 'complete' | 'pending' | 'overdue'
  [key: string]: unknown
}

// ── Standup Events ────────────────────────────────────────────────────────────
export interface StandupEvent {
  id: number
  title: string
  category: string
  day: number
  start: number // minutes from midnight
  duration: number
  location?: string
  opr?: string
  recurring?: string
  allDay?: boolean
  [key: string]: unknown
}

// ── Leader Locations (locations is a positional array, one per weekday) ────────
export interface Leader {
  id: number | string
  name: string
  rank?: string
  locations: string[]
}

export interface LeaderGroup {
  name: string
  color?: string
  icon?: string
  leaders: Leader[]
}

// ── API response root ─────────────────────────────────────────────────────────
export interface AppData {
  soldiers: Record<string, SoldierRecord>
  unitSections: Record<string, UnitSection[]>
  sitrepData: SitrepEntry[]
  standupEvents: StandupEvent[]
  leaderGroups: LeaderGroup[]
  closeoutLeaderGroups: LeaderGroup[]
}
