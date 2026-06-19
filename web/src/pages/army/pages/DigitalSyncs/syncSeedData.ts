// ── Leader location data (Stand-Up / Close-Out) ─────────────────────────────

export interface SyncLeader {
  name: string; rank: string; role: string; dodid: string; location: string; note: string
}

export interface SyncDay {
  id: string; label: string; leaders: SyncLeader[]
}

export function locColor(loc: string): string {
  const u = loc.toLowerCase()
  if (u === 'hq')               return '#27ae60'
  if (u === 'range' || u === 'pdy') return '#f39c12'
  if (u === 'leave')            return '#8e44ad'
  if (u.startsWith('tdy'))      return '#2980b9'
  if (u === 'medical')          return '#e74c3c'
  return '#777'
}

export const STANDUP_DAYS: SyncDay[] = [
  {
    id: 'monday', label: 'Monday',
    leaders: [
      { name: 'Bradley',   rank: 'LTC', role: 'BN Commander',      dodid: '5051001001', location: 'HQ',    note: 'Weekly CDR battle rhythm — BUB 0900, CDR sync 1300' },
      { name: 'Ortega',    rank: 'MAJ', role: 'BN XO',             dodid: '5051001002', location: 'HQ',    note: 'Staff sync 0800; logistics review 1400' },
      { name: 'Vasquez',   rank: 'MAJ', role: 'S3 Operations',     dodid: '5051004001', location: 'HQ',    note: 'ODA CDR sync 0930; targeting meeting 1000 SIPR' },
      { name: 'Thompson',  rank: 'CPT', role: 'Alpha Co CDR',      dodid: '5053000001', location: 'PDY',   note: 'Range coordination — ODA-5211 live fire' },
      { name: 'Hassan',    rank: 'CPT', role: 'S2 Intel OIC',      dodid: '5051003001', location: 'HQ',    note: 'Intel sync 1000 SCIF; Group threat brief' },
      { name: 'Okafor',   rank: 'MAJ', role: 'S9 CA OIC',          dodid: '5051010001', location: 'TDY-C', note: 'TDY — USSOCOM Tampa CENTCOM CA coordination' },
    ],
  },
  {
    id: 'tuesday', label: 'Tuesday',
    leaders: [
      { name: 'Bradley',   rank: 'LTC', role: 'BN Commander',      dodid: '5051001001', location: 'HQ',      note: 'Group CDR downlink SVTC 0900; ACFT test observation' },
      { name: 'Harris',    rank: 'CPT', role: 'Bravo Co CDR',      dodid: '5054000001', location: 'Range',   note: 'ACFT test OIC — B Co test window' },
      { name: 'Donovan',   rank: 'MAJ', role: 'S5 Plans OIC',      dodid: '5051006001', location: 'HQ',      note: 'XO sync 1300; wargame review 1400' },
      { name: 'Kowalczyk', rank: 'CPT', role: 'S6 Signal OIC',     dodid: '5051007001', location: 'HQ',      note: 'Network status brief; AUP compliance review 1000' },
      { name: 'Navarro',   rank: 'MAJ', role: 'S8 Finance OIC',    dodid: '5051009001', location: 'HQ',      note: 'Finance sync with DFAS rep — pay discrepancy review' },
      { name: 'Okonkwo',   rank: 'SFC', role: 'ODA-5221 Team Sgt', dodid: '5054001003', location: 'Medical', note: 'Shoulder follow-up — physical therapy Womack AMC' },
    ],
  },
  {
    id: 'wednesday', label: 'Wednesday',
    leaders: [
      { name: 'Bradley',  rank: 'LTC', role: 'BN Commander',       dodid: '5051001001', location: 'TDY-O', note: 'CDR at Group HQ — weekly Group CDR meeting; returns 1700' },
      { name: 'Ortega',   rank: 'MAJ', role: 'BN XO (Acting CDR)', dodid: '5051001002', location: 'HQ',    note: 'Acting CDR; training meeting chair 1300' },
      { name: 'Vasquez',  rank: 'MAJ', role: 'S3 Operations',      dodid: '5051004001', location: 'HQ',    note: 'Targeting 1000 SIPR; KLE review 1400 SVTC' },
      { name: 'Hayes',    rank: 'CPT', role: 'S7 Training OIC',    dodid: '5051008001', location: 'HQ',    note: 'Training meeting 1300 — T-week brief; DTMS review' },
      { name: 'Diallo',   rank: 'SFC', role: 'S9 NCOIC / CA NCO', dodid: '5051010002', location: 'PDY',   note: 'FHA project site walk — partner nation medical clinic' },
      { name: 'McKinley', rank: 'CW3', role: 'S8 Finance Tech',    dodid: '5051009002', location: 'Leave', note: 'Annual leave — approved 5-day block; returns Monday' },
    ],
  },
  {
    id: 'thursday', label: 'Thursday',
    leaders: [
      { name: 'Bradley', rank: 'LTC', role: 'BN Commander',        dodid: '5051001001', location: 'Range',   note: 'Range day — CDR observing ODA-5213 CQB certification' },
      { name: 'Lynch',   rank: 'CPT', role: 'Charlie Co CDR',      dodid: '5055000001', location: 'HQ',      note: 'XO sync 1300; CAR review for ODA-5232 pending deployment' },
      { name: 'Warren',  rank: 'SFC', role: 'S7 NCOIC',            dodid: '5051008002', location: 'Range',   note: 'Range OIC — CQB certification grader' },
      { name: 'Okafor',  rank: 'MAJ', role: 'S9 CA OIC',           dodid: '5051010001', location: 'HQ',      note: 'Returned from TDY — CENTCOM CA annex update' },
      { name: 'Perkins', rank: 'MSG', role: 'S3 NCOIC',            dodid: '5051004002', location: 'HQ',      note: 'O&I brief prep 0830; readiness SVTC 0900 SIPR' },
      { name: 'Riley',   rank: 'SFC', role: 'S3 Admin (MEB)',      dodid: '5051004006', location: 'Medical', note: 'MEB follow-up — BAMC consult; non-deployable' },
    ],
  },
  {
    id: 'friday', label: 'Friday',
    leaders: [
      { name: 'Bradley', rank: 'LTC', role: 'BN Commander',        dodid: '5051001001', location: 'HQ',    note: 'Weekly closeout brief 1500 — all sections; CSM notes follow' },
      { name: 'Vasquez', rank: 'MAJ', role: 'S3 Operations',       dodid: '5051004001', location: 'PDY',   note: 'Motor pool maintenance observation 0800–1100' },
      { name: 'Hassan',  rank: 'CPT', role: 'S2 Intel OIC',        dodid: '5051003001', location: 'HQ',    note: 'GWOT theater brief 1300 SCIF; S2 weekly closeout metrics' },
      { name: 'Phillips',rank: 'CPT', role: 'S1 Personnel',        dodid: '5051002001', location: 'HQ',    note: 'Personnel readiness update 1000; flagging report to CDR' },
      { name: 'Hayes',   rank: 'CPT', role: 'S7 Training OIC',     dodid: '5051008001', location: 'HQ',    note: 'DTMS closeout — training hours input; ACFT data review 1100' },
      { name: 'Donovan', rank: 'MAJ', role: 'S5 Plans',            dodid: '5051006001', location: 'Leave', note: 'Leave — approved 4-day pass; returns Monday' },
    ],
  },
  {
    id: 'weekend_duty', label: 'Weekend Duty',
    leaders: [
      { name: 'Petrov',  rank: 'SSG', role: 'S7 DTMS Mgr',    dodid: '5051008003', location: 'PDY', note: 'Weekend CDO — covers BN duty officer duties Sat' },
      { name: 'Simmons', rank: 'SSG', role: 'S8 Pay Tech',     dodid: '5051009004', location: 'HQ',  note: 'ADSO on-call — finance emergency only; available by cell' },
      { name: 'Ibrahim', rank: 'SSG', role: 'S9 CA NCO',       dodid: '5051010003', location: 'PDY', note: 'BN duty NCO Saturday; partner nation coordination SOP on-hand' },
    ],
  },
]

export const CLOSEOUT_DAYS: SyncDay[] = [
  {
    id: 'monday_co', label: 'Monday Closeout',
    leaders: [
      { name: 'Bradley',   rank: 'LTC', role: 'BN Commander',   dodid: '5051001001', location: 'HQ', note: 'Weekly closeout — stand-down 1600; safety brief' },
      { name: 'Vasquez',   rank: 'MAJ', role: 'S3 Operations',  dodid: '5051004001', location: 'HQ', note: 'Ops summary to CDR — targeting status, upcoming ranges' },
      { name: 'Donovan',   rank: 'MAJ', role: 'S5 Plans OIC',   dodid: '5051006001', location: 'HQ', note: 'SITREP status — Jan–Jun complete; Jul overdue (TDY conflict)' },
      { name: 'Kowalczyk', rank: 'CPT', role: 'S6 Signal OIC',  dodid: '5051007001', location: 'HQ', note: "Network status — all green; AUP outstanding: O'Brien (suspended)" },
    ],
  },
  {
    id: 'friday_co', label: 'Friday Weekly Closeout',
    leaders: [
      { name: 'Bradley', rank: 'LTC', role: 'BN Commander',     dodid: '5051001001', location: 'HQ', note: 'Weekly closeout brief — all sections report; CDR notes to CSM' },
      { name: 'Vasquez', rank: 'MAJ', role: 'S3 Operations',    dodid: '5051004001', location: 'HQ', note: 'S3 ops summary — motor pool ready; 3 ODAs deployment-ready' },
      { name: 'Navarro', rank: 'MAJ', role: 'S8 Finance OIC',   dodid: '5051009001', location: 'HQ', note: 'EOM suspenses — 1 open (DD93 overdue Garza); FLPP audit complete' },
      { name: 'Hayes',   rank: 'CPT', role: 'S7 Training OIC',  dodid: '5051008001', location: 'HQ', note: 'Training metrics — ACFT pass rate 91.2%; 3 Required (1 MEB, 2 new gains)' },
      { name: 'Okafor',  rank: 'MAJ', role: 'S9 CA OIC',        dodid: '5051010001', location: 'HQ', note: 'CA update — FHA project on track; CENTCOM CA annex submitted to Group' },
      { name: 'Hassan',  rank: 'CPT', role: 'S2 Intel OIC',     dodid: '5051003001', location: 'HQ', note: 'Intel summary — SIGINT update briefed; no emerging high-priority threats' },
    ],
  },
]

// ── Meeting schedule & action items ─────────────────────────────────────────

export type Cadence = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual'
export type PrepStatus = 'Ready' | 'In Progress' | 'Pending'
export type ItemStatus = 'Open' | 'In Progress' | 'Complete' | 'Overdue'
export type SectionLight = 'Green' | 'Amber' | 'Red'

export interface UpcomingSync {
  id: string; dateLabel: string; time: string; title: string
  cadence: Cadence; prepStatus: PrepStatus; subPage: string
}

export const UPCOMING_SYNCS: UpcomingSync[] = [
  { id: 'us1', dateLabel: 'Today',  time: '0700', title: 'Admin Review',       cadence: 'Daily',     prepStatus: 'Ready',       subPage: 'admin-review'      },
  { id: 'us2', dateLabel: 'Today',  time: '1600', title: 'Operations Review',  cadence: 'Daily',     prepStatus: 'Ready',       subPage: 'operations-review' },
  { id: 'us3', dateLabel: 'Mon',    time: '0900', title: 'Weekly Stand Up',    cadence: 'Weekly',    prepStatus: 'In Progress', subPage: 'stand-up'          },
  { id: 'us4', dateLabel: 'Fri',    time: '1500', title: 'Weekly Close Out',   cadence: 'Weekly',    prepStatus: 'Pending',     subPage: 'close-out'         },
  { id: 'us5', dateLabel: '20 Jun', time: '0900', title: 'Operations Sync',    cadence: 'Monthly',   prepStatus: 'Pending',     subPage: 'operations-sync'   },
  { id: 'us6', dateLabel: '27 Jun', time: '1300', title: 'Resource Sync',      cadence: 'Monthly',   prepStatus: 'Pending',     subPage: 'resource-sync'     },
]

export interface ActionItem {
  id: string; item: string; sync: string; opr: string; due: string; status: ItemStatus
}

export const ACTION_ITEMS: ActionItem[] = [
  { id: 'ai1', item: 'Submit updated MTOE to G1',        sync: 'Weekly Stand Up',   opr: 'J1',  due: '15 Jun', status: 'In Progress' },
  { id: 'ai2', item: 'Complete BN readiness SITREP',     sync: 'Admin Review',      opr: 'J3',  due: '18 Jun', status: 'Open'        },
  { id: 'ai3', item: 'Coordinate DTS travel for TDY',    sync: 'Operations Review', opr: 'J4',  due: '20 Jun', status: 'In Progress' },
  { id: 'ai4', item: 'Publish training schedule Wk 28',  sync: 'Weekly Stand Up',   opr: 'J7',  due: '14 Jun', status: 'Overdue'     },
  { id: 'ai5', item: 'Submit FHA project update',        sync: 'Operations Sync',   opr: 'J9',  due: '25 Jun', status: 'Open'        },
  { id: 'ai6', item: 'Close out ACFT test data DTMS',    sync: 'Weekly Close Out',  opr: 'J7',  due: '17 Jun', status: 'Open'        },
  { id: 'ai7', item: 'Resolve pay discrepancy — Garza',  sync: 'Admin Review',      opr: 'J8',  due: '19 Jun', status: 'In Progress' },
  { id: 'ai8', item: 'Submit intel products to Group',   sync: 'Operations Review', opr: 'J2',  due: '16 Jun', status: 'Overdue'     },
]

export interface SectionStatus {
  section: string; label: string; status: SectionLight; update: string; actions: number
}

export const SECTION_STATUSES: SectionStatus[] = [
  { section: 'J1', label: 'Personnel',    status: 'Amber', update: 'Pay discrepancy open — Garza DD93 overdue. Flagging report submitted.',    actions: 2 },
  { section: 'J2', label: 'Intelligence', status: 'Green', update: 'SIGINT update briefed; no emerging high-priority threats this period.',     actions: 1 },
  { section: 'J3', label: 'Operations',   status: 'Green', update: 'ODA-5213 CQB cert complete. 3 ODAs deployment-ready. Targeting on track.',  actions: 1 },
  { section: 'J4', label: 'Logistics',    status: 'Amber', update: 'Motor pool at 88% readiness. 2 vehicles deadline — parts ordered.',          actions: 2 },
  { section: 'J5', label: 'Plans',        status: 'Green', update: 'Campaign plan revisions on track. CONPLAN annex to Group by 20 Jun.',        actions: 0 },
  { section: 'J6', label: 'Comms',        status: 'Green', update: 'All networks green. AUP outstanding: 1 soldier (suspended access).',         actions: 1 },
  { section: 'J7', label: 'Training',     status: 'Amber', update: 'Training schedule Wk 28 overdue. ACFT pass rate 91.2%. DTMS current.',      actions: 2 },
  { section: 'J8', label: 'Finance',      status: 'Amber', update: 'FLPP audit complete. 1 open suspense: Garza DD93. EOM on track.',            actions: 1 },
  { section: 'J9', label: 'Civil Affairs',status: 'Green', update: 'FHA project on track. CENTCOM CA annex submitted. Partner nation coord OK.', actions: 1 },
]

export interface OdaReadiness {
  team: string; company: string; status: 'Mission Ready' | 'Deployment Ready' | 'Training' | 'Stand Down'
  personnel: string; equip: string; nextEvent: string
}

export const ODA_READINESS: OdaReadiness[] = [
  { team: 'ODA-5211', company: 'Alpha',   status: 'Mission Ready',    personnel: '12/12', equip: '100%', nextEvent: 'MOB window 1 Jul'       },
  { team: 'ODA-5212', company: 'Alpha',   status: 'Training',         personnel: '11/12', equip: '92%',  nextEvent: 'CQB Cert 25 Jun'        },
  { team: 'ODA-5213', company: 'Alpha',   status: 'Deployment Ready', personnel: '12/12', equip: '100%', nextEvent: 'Pre-dep brief 22 Jun'   },
  { team: 'ODA-5221', company: 'Bravo',   status: 'Training',         personnel: '11/12', equip: '88%',  nextEvent: 'ACFT retest 20 Jun'     },
  { team: 'ODA-5222', company: 'Bravo',   status: 'Mission Ready',    personnel: '12/12', equip: '100%', nextEvent: 'FTX 2–12 Jul'          },
  { team: 'ODA-5223', company: 'Bravo',   status: 'Stand Down',       personnel: '10/12', equip: '80%',  nextEvent: 'Return from TDY 25 Jun' },
  { team: 'ODA-5231', company: 'Charlie', status: 'Deployment Ready', personnel: '12/12', equip: '96%',  nextEvent: 'Deploy w/in 72hrs NLT'  },
  { team: 'ODA-5232', company: 'Charlie', status: 'Mission Ready',    personnel: '11/12', equip: '100%', nextEvent: 'CAR review 20 Jun'      },
]

// ── Admin Review — Personnel Accountability ───────────────────────────────────

export const PERSONNEL_ACCOUNTABILITY = {
  present: 237, leave: 8, tdy: 3, medical: 2, pass: 1, unaccounted: 0,
}

// ── Admin Review — Critical Items ─────────────────────────────────────────────

export type UrgencyLevel = 'today' | 'expired' | '2days' | '7days' | 'future'

export interface CriticalItem {
  id: string; title: string; detail: string
  urgencyLabel: string; urgency: UrgencyLevel
}

export const CRITICAL_ITEMS: CriticalItem[] = [
  { id: 'ci1', title: 'NCOER Due — SSG Martinez',            detail: 'Thru date today. Senior Rater signature needed.',        urgencyLabel: 'TODAY',   urgency: 'today'   },
  { id: 'ci2', title: 'Security Clearance Expired — SPC Williams', detail: 'PR submitted 45 days ago. Follow up with S2.',    urgencyLabel: 'EXPIRED', urgency: 'expired' },
  { id: 'ci3', title: 'Award Packet — ARCOM CPT Reynolds',   detail: 'Commander signature required for submission.',           urgencyLabel: '2 DAYS',  urgency: '2days'   },
  { id: 'ci4', title: 'Travel Orders — 3 PAX',               detail: 'DTS submitted, pending AO approval. Travel 18 Dec.',    urgencyLabel: '7 DAYS',  urgency: '7days'   },
]

// ── Admin Review — Admin Checklist ────────────────────────────────────────────

export type ChecklistStatus = 'complete' | 'pending' | 'due'

export interface ChecklistItem {
  id: string; label: string; status: ChecklistStatus; note?: string
}

export const ADMIN_CHECKLIST: ChecklistItem[] = [
  { id: 'acl1', label: 'Morning Report Submitted',    status: 'complete' },
  { id: 'acl2', label: 'Leave / Pass Forms Processed',status: 'complete' },
  { id: 'acl3', label: 'Pay Inquiries Reviewed',      status: 'pending', note: '2 Pending' },
  { id: 'acl4', label: 'Orders Requests',             status: 'complete' },
  { id: 'acl5', label: 'Evaluation Status Check',     status: 'due',     note: '1 Due'     },
]

// ── Admin Review — Pending Actions ────────────────────────────────────────────

export type ActionStatus = 'Pending' | 'In Progress' | 'Complete' | 'Overdue'

export interface PendingAction {
  id: string; item: string; opr: string; description: string; due: string; status: ActionStatus
}

export const PENDING_ACTIONS: PendingAction[] = [
  { id: 'pa1',  item: 'Submit SGLV updates',         opr: 'S1-1',  description: '5 soldiers need updated beneficiary info',    due: '13 Dec', status: 'Pending'     },
  { id: 'pa2',  item: 'Process promotion packets',    opr: 'S1-3',  description: '3 SSG packets for Jan board',                due: '15 Dec', status: 'In Progress' },
  { id: 'pa3',  item: 'Complete DD93 audit',          opr: 'S1-1',  description: '12 records need verification',               due: '18 Dec', status: 'Pending'     },
  { id: 'pa4',  item: 'Pay inquiry resolution',       opr: 'S1-4',  description: 'SGT Johnson BAH discrepancy',                due: '14 Dec', status: 'In Progress' },
  { id: 'pa5',  item: 'Award narrative drafts',       opr: 'S1-5',  description: '2 ARCOM, 1 MSM draft needed',               due: '16 Dec', status: 'Pending'     },
  { id: 'pa6',  item: 'NCOER support forms',          opr: 'S1-2',  description: '8 support forms due by end of month',        due: '20 Dec', status: 'Pending'     },
  { id: 'pa7',  item: 'Leave packet processing',      opr: 'S1-1',  description: 'Holiday block leave — 15 packets pending',   due: '13 Dec', status: 'In Progress' },
  { id: 'pa8',  item: 'PCS orders follow-up',         opr: 'S1-6',  description: '2 soldiers awaiting Feb PCS orders',         due: '19 Dec', status: 'Pending'     },
  { id: 'pa9',  item: 'Medical profile updates',      opr: 'S1-1',  description: '3 profiles expiring, need renewal',          due: '15 Dec', status: 'Pending'     },
  { id: 'pa10', item: 'Security clearance updates',   opr: 'S1/S2', description: '2 PRs need commander endorsement',           due: '14 Dec', status: 'In Progress' },
  { id: 'pa11', item: 'Training cert uploads',        opr: 'S1-7',  description: 'Cyber awareness certs to iPERMS',            due: '17 Dec', status: 'Pending'     },
  { id: 'pa12', item: 'Assumption of command',        opr: 'S1-0',  description: 'CPT Davis CoC orders preparation',           due: '20 Dec', status: 'In Progress' },
]

// ── Admin Review — New Suspenses ──────────────────────────────────────────────

export interface NewSuspense {
  id: string; suspense: string; source: string; description: string; received: string
}

export const NEW_SUSPENSES: NewSuspense[] = [
  { id: 'ns1', suspense: 'FY26 Manning Document',  source: 'JSOC J1',   description: 'Submit updated manning requirements for FY26 MTOE review', received: '11 Dec' },
  { id: 'ns2', suspense: 'Holiday Leave Report',   source: 'Group CDR', description: 'Consolidated leave roster for holiday block leave period',  received: '11 Dec' },
  { id: 'ns3', suspense: 'Awards Nomination List', source: 'Bn CDR',    description: 'Submit award nominations for quarterly awards ceremony',    received: '11 Dec' },
]

// ── Operations Review — Calendar Events ───────────────────────────────────────

export type CalEventStatus = 'Complete' | 'In Progress' | 'Upcoming' | 'Current' | 'Scheduled' | 'Suspense'

export interface CalEvent {
  time: string; title: string; status: CalEventStatus
}

export const CAL_TODAY: CalEvent[] = [
  { time: '0700', title: 'Daily Admin Review',     status: 'Complete'    },
  { time: '1300', title: 'J3 Coordination Mtg',   status: 'In Progress' },
  { time: '1500', title: 'Equipment Inspection',   status: 'Upcoming'    },
  { time: '1600', title: 'Ops Review (THIS)',       status: 'Current'     },
]

export const CAL_TOMORROW: CalEvent[] = [
  { time: '0700', title: 'Daily Admin Review',        status: 'Scheduled' },
  { time: '0800', title: 'PT Test (Makeup)',           status: 'Scheduled' },
  { time: '1400', title: 'NCOER Due SSG Martinez',    status: 'Suspense'  },
  { time: '1600', title: 'Ops Review',                 status: 'Scheduled' },
]

// ── Operations Review — Calendar Changes ──────────────────────────────────────

export type CalChangeType = 'ADDED' | 'MOVED' | 'CANCELED' | 'UPDATED'

export interface CalChange {
  id: string; type: CalChangeType; event: string; original: string; updated: string
  affected: string; notified: boolean
}

export const CAL_CHANGES: CalChange[] = [
  { id: 'cc1', type: 'ADDED',    event: 'JRTC Sync Meeting',  original: '—',             updated: '13 Dec 1000', affected: 'CDR, XO, J3, J4',       notified: true  },
  { id: 'cc2', type: 'MOVED',    event: 'Awards Board',        original: '14 Dec 1300',   updated: '14 Dec 1500', affected: 'CDR, SGM, S1',           notified: true  },
  { id: 'cc3', type: 'CANCELED', event: 'Range Safety Brief',  original: '13 Dec 0800',   updated: '—',           affected: 'All personnel',           notified: true  },
  { id: 'cc4', type: 'ADDED',    event: 'Equipment Draw',      original: '—',             updated: '14 Dec 0800', affected: 'ODA 1231, J4',           notified: false },
  { id: 'cc5', type: 'MOVED',    event: 'Training Mtg',        original: '13 Dec 0900',   updated: '13 Dec 1400', affected: 'J3, ODA NCOICs',         notified: false },
  { id: 'cc6', type: 'UPDATED',  event: 'Motor Pool Svc',      original: 'Location: Bldg 100', updated: 'Location: Bldg 250', affected: 'Maintenance personnel', notified: true },
]

// ── Operations Review — External Taskings ─────────────────────────────────────

export type TaskingStatus = 'In Progress' | 'Pending' | 'Resourced' | 'Complete' | 'Overdue'

export interface ExternalTasking {
  id: string; tasking: string; source: string; description: string
  opr: string; due: string; status: TaskingStatus; urgent?: boolean
}

export const EXTERNAL_TASKINGS: ExternalTasking[] = [
  { id: 'et1', tasking: 'JRTC OPORD Input',      source: 'Group J3',     description: 'Submit unit OPORD annexes for rotation',           opr: 'J3', due: '15 Dec', status: 'In Progress', urgent: true },
  { id: 'et2', tasking: 'Equipment Status Rpt',   source: 'JSOC J4',      description: 'Monthly equipment readiness report',               opr: 'J4', due: '18 Dec', status: 'Pending'     },
  { id: 'et3', tasking: 'Intel Summary',           source: 'Group J2',     description: 'Weekly intel summary for AO',                      opr: 'J2', due: '13 Dec', status: 'In Progress' },
  { id: 'et4', tasking: 'Training Readiness',      source: 'SOCOM G3',     description: 'Quarterly training readiness assessment',          opr: 'J3', due: '20 Dec', status: 'Pending'     },
  { id: 'et5', tasking: 'Comms Exercise',          source: 'Group J6',     description: 'Participate in comms interop exercise',            opr: 'J6', due: '16 Dec', status: 'Resourced'   },
  { id: 'et6', tasking: 'Manning Update',          source: 'JSOC J1',      description: 'FY26 manning requirements',                        opr: 'J1', due: '18 Dec', status: 'In Progress' },
  { id: 'et7', tasking: 'Budget Execution',        source: 'Group J8',     description: 'Q1 budget execution report',                       opr: 'J8', due: '22 Dec', status: 'Pending'     },
  { id: 'et8', tasking: 'Safety Review',           source: 'USASOC Safety',description: 'Holiday safety stand-down checklist',             opr: 'XO', due: '19 Dec', status: 'Pending'     },
]

// ── Operations Review — Internal Tasks ───────────────────────────────────────

export type InternalTaskStatus = 'Scheduled' | 'In Progress' | 'Pending' | 'Complete'

export interface InternalTask {
  id: string; task: string; section: string; description: string
  assigned: string; due: string; status: InternalTaskStatus
}

export const INTERNAL_TASKS: InternalTask[] = [
  { id: 'it1',  task: 'Range Recon',         section: 'ODA 1231', description: 'Conduct range recon for next week\'s live fire', assigned: 'SSG Brown',    due: '13 Dec', status: 'Scheduled'   },
  { id: 'it2',  task: 'Load Plan Update',    section: 'J4',       description: 'Finalize JRTC equipment load plans',            assigned: 'SFC Davis',    due: '14 Dec', status: 'In Progress' },
  { id: 'it3',  task: 'CONOP Brief',         section: 'ODA 1232', description: 'Prepare CONOP brief for commander approval',    assigned: 'CPT Miller',   due: '15 Dec', status: 'In Progress' },
  { id: 'it4',  task: 'Vehicle Svc',         section: 'Maint',    description: 'Complete PMCS on 3 NMC vehicles',               assigned: 'SGT Torres',   due: '16 Dec', status: 'Pending'     },
  { id: 'it5',  task: 'Ammo Request',        section: 'J4',       description: 'Submit ammo request for range week',            assigned: 'SFC Adams',    due: '13 Dec', status: 'Complete'    },
  { id: 'it6',  task: 'Risk Assessment',     section: 'J3',       description: 'Complete deliberate risk assessment for exercise', assigned: 'MAJ Thompson', due: '14 Dec', status: 'In Progress' },
  { id: 'it7',  task: 'Medical Screening',   section: 'S1',       description: 'Pre-deployment medical screening for 3 PAX',    assigned: 'SFC Lopez',    due: '15 Dec', status: 'Pending'     },
  { id: 'it8',  task: 'Comms Check',         section: 'J6',       description: 'SATCOM verification with SOCOM net ops',        assigned: 'SSG Kim',      due: '14 Dec', status: 'In Progress' },
]

// ── Operations Review — Due Outs ──────────────────────────────────────────────

export type DueOutStatus = 'Overdue' | 'Tomorrow' | 'In Progress' | 'Pending'

export interface DueOut {
  id: string; dueOut: string; sourceSync: string; description: string
  opr: string; due: string; status: DueOutStatus
}

export const DUE_OUTS: DueOut[] = [
  { id: 'do1', dueOut: 'FY26 Training Cal',     sourceSync: 'Weekly Stand Up (9 Dec)',   description: 'Finalize and route for CDR approval',          opr: 'J3', due: 'TODAY', status: 'Overdue'     },
  { id: 'do2', dueOut: 'Equipment Shortfall',   sourceSync: 'Ops Sync (5 Dec)',          description: 'Brief CDR on critical shortfalls and mitigation',opr: 'J4', due: '12 Dec', status: 'Tomorrow'    },
  { id: 'do3', dueOut: 'JRTC Pax Manifest',     sourceSync: 'Weekly Stand Up (9 Dec)',   description: 'Complete personnel manifest for rotation',      opr: 'J1', due: '15 Dec', status: 'In Progress' },
  { id: 'do4', dueOut: 'Comms Plan Update',     sourceSync: 'J6 Touchpoint (10 Dec)',   description: 'Update comms plan for exercise',                opr: 'J6', due: '14 Dec', status: 'In Progress' },
  { id: 'do5', dueOut: 'Risk Mitigation Plan',  sourceSync: 'CDR Touchpoint (8 Dec)',   description: 'Develop mitigation for 3 red risks',            opr: 'XO', due: '13 Dec', status: 'In Progress' },
  { id: 'do6', dueOut: 'Planning Timeline',     sourceSync: 'Ops Sync (5 Dec)',          description: 'Publish detailed planning timeline for JRTC',   opr: 'J3', due: '14 Dec', status: 'Pending'     },
]
