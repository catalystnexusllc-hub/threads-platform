import { useState } from 'react'
import { useArmyData } from '../../ArmyDataContext'
import { SOR_CONNECTIONS } from './s1Types'
import { STATUS_COLOR } from '../util'
import shared from '../shared.module.css'
import styles from './S1Page.module.css'
import {
  IPPSA_SOLDIERS,
  MEDPROS_SOLDIERS,
  DISS_SUBJECTS,
  DTMS_SOLDIERS,
  DTS_TRAVEL,
  ADMIN_SUSPENSES,
  AWARDS_PIPELINE,
  type AwardCategory,
  GCSS_EQUIPMENT,
  S1_SECTION_SOLDIERS,
  getEtsDerosSoldiers,
  getSoldiersWithPayIssues,
  getAllAllotments,
  getMedStatus,
  getDtmsRecord,
  daysUntil,
  etsFlag,
} from './s1SeedData'
import {
  computePmcsSchedule,
  WORK_ORDERS,
  MAINT_CONTACTS,
  getMaintStats,
} from '../shared/pmcsSeedData'
import MaintenanceView from '../shared/MaintenanceView'

type ModalState =
  | { kind: 'view-all' }
  | { kind: 'detail'; slug: string }
  | { kind: 'report'; reportId: string }
  | null

// ── S1 section responsibilities ───────────────────────────────────────────────
const RESPONSIBILITIES = [
  { id: 'accountability', icon: 'fa-clipboard-check',  title: 'Personnel Accountability',       desc: 'PERSTAT submissions, daily head count, strength reporting, and accountability procedures.' },
  { id: 'readiness',      icon: 'fa-shield-alt',        title: 'Personnel Readiness Management', desc: 'Manage deployable readiness status for all assigned personnel; coordinate FMC/NMC tracking.' },
  { id: 'eps',            icon: 'fa-medal',             title: 'Essential Personnel Services',   desc: 'Awards, promotions, OER/NCOER evaluations, personnel actions, and finance coordination.' },
  { id: 'casualty',       icon: 'fa-heartbeat',         title: 'Casualty Operations',            desc: 'CASREP submission procedures, LOD determinations, and survivor benefits coordination.' },
  { id: 'retention',      icon: 'fa-handshake',         title: 'Retention & Reenlistment',       desc: 'Unit reenlistment objectives, retention board coordination, and SRB management.' },
  { id: 'postal',         icon: 'fa-envelope',          title: 'Postal Operations',              desc: 'Unit mail management, official mail procedures, and deployment postal support.' },
  { id: 'legal',          icon: 'fa-balance-scale',     title: 'Legal Assistance Coordination',  desc: 'Liaise with JAG for wills, powers of attorney, administrative separations, and legal holds.' },
  { id: 'leave',          icon: 'fa-calendar-check',    title: 'Leave Management',               desc: 'Leave form processing, use/lose tracking, pass management, and R&R coordination.' },
]

// ── S1 roster positions ───────────────────────────────────────────────────────
const S1_ROSTER_POSITIONS = [
  { position: 'S1 Officer in Charge',    mos: '42B' },
  { position: 'S1 NCOIC',               mos: '42A' },
  { position: 'Senior Personnel Clerk', mos: '42A' },
  { position: 'Awards / Decorations',   mos: '42A' },
  { position: 'Leave Clerk',            mos: '42A' },
  { position: 'Personnel Clerk',        mos: '42A' },
]

// ── Standard S1 reports ───────────────────────────────────────────────────────
const REPORTS = [
  {
    id: 'perstat',
    title: 'Daily Personnel Status (PERSTAT)',
    desc: 'Submitted to higher daily — accounts for all assigned personnel by category.',
    fields: [
      ['Date',            'Report date (auto-populated)',                 'THREADS'],
      ['Unit',            'Unit designation and UIC',                     'IPPSA'],
      ['Authorized',      'Authorized strength from TOE/MTOE',            'IPPSA'],
      ['Assigned',        'Total assigned per IPPSA',                     'IPPSA'],
      ['Present for Duty','Present and performing duty',                  'IPPSA + CMD'],
      ['Absent',          'Personnel on leave, TDY, or AWOL',             'IPPSA'],
    ] as [string, string, string][],
  },
  {
    id: 'manning',
    title: 'Unit Manning Report (UMR)',
    desc: 'Authorized vs. assigned fill by position — used for readiness reporting.',
    fields: [
      ['Position Title', 'Position name from MTOE',                      'IPPSA'],
      ['Grade',          'Required grade for position',                   'IPPSA'],
      ['Name',           'Assigned soldier name',                         'IPPSA'],
      ['MOS',            'Primary MOS',                                   'IPPSA'],
      ['DEROS / ETS',    'Rotation or separation date',                   'IPPSA'],
      ['Fill Status',    'Filled / Vacant / Over-grade',                  'Calc'],
    ] as [string, string, string][],
  },
  {
    id: 'strength',
    title: 'Monthly Strength Report',
    desc: 'Comprehensive monthly summary for submission to higher headquarters.',
    fields: [
      ['Category',   'Officer / Warrant / Enlisted',                  'IPPSA'],
      ['Authorized', 'MTOE authorized strength',                      'IPPSA'],
      ['Assigned',   'Total assigned',                                 'IPPSA'],
      ['Gain (MTH)', 'Gains this month',                              'IPPSA'],
      ['Loss (MTH)', 'Losses this month',                             'IPPSA'],
      ['Net Change', 'Calculated net delta',                          'Calc'],
    ] as [string, string, string][],
  },
  {
    id: 'leave',
    title: 'Leave Roster',
    desc: 'Active and upcoming leave requests across the unit.',
    fields: [
      ['Soldier',    'Name and rank',                                  'IPPSA'],
      ['Leave Type', 'Annual / Emergency / PTDY / R&R',               'THREADS'],
      ['Start Date', 'Leave start',                                    'THREADS'],
      ['End Date',   'Leave end',                                      'THREADS'],
      ['Days',       'Calendar days charged',                          'Calc'],
      ['Approver',   'Approving authority',                            'THREADS'],
    ] as [string, string, string][],
  },
  {
    id: 'awards',
    title: 'Awards & Decorations Tracker',
    desc: 'Pending and submitted award actions across the unit.',
    fields: [
      ['Soldier',        'Recipient name and rank',                        'IPPSA'],
      ['Award',          'Award type (ARCOM, AAM, etc.)',                  'THREADS'],
      ['Action Officer', 'S1 clerk responsible',                           'THREADS'],
      ['Date Submitted', 'Submission date',                                'THREADS'],
      ['Status',         'Draft / Submitted / Approved / Returned',        'THREADS'],
      ['ETA',            'Estimated completion date',                      'THREADS'],
    ] as [string, string, string][],
  },
  {
    id: 'admin',
    title: 'Admin Suspenses (Due Dates)',
    desc: 'Overdue and upcoming administrative suspenses across the unit.',
    fields: [
      ['Soldier',  'Name and rank',                                  'IPPSA'],
      ['Item',     'DD93 / SGLV / PRR / Training etc.',              'THREADS'],
      ['Due Date', 'Suspense date',                                  'THREADS'],
      ['Status',   'Complete / Overdue / Pending',                   'THREADS'],
      ['POC',      'Point of contact for resolution',                'THREADS'],
      ['Notes',    'Free-text notes',                                'THREADS'],
    ] as [string, string, string][],
  },
  {
    id: 'promo',
    title: 'Promotion Board Eligibility',
    desc: 'Soldiers eligible for or pending promotion action.',
    fields: [
      ['Name',       'Soldier name',                                   'IPPSA'],
      ['Rank',       'Current grade',                                  'IPPSA'],
      ['PEBD',       'Pay entry base date',                            'IPPSA'],
      ['TIG',        'Time in grade',                                  'Calc'],
      ['Board Date', 'Next eligible board date',                       'IPPSA'],
      ['Status',     'Eligible / Waiver / Pending / Selected',         'HR_CONNECT'],
    ] as [string, string, string][],
  },
  {
    id: 'ets',
    title: 'ETS / DEROS Tracker (90-60-30)',
    desc: '90 / 60 / 30-day separation and rotation tracking report.',
    fields: [
      ['Name',             'Soldier name',                                   'IPPSA'],
      ['Rank',             'Current grade',                                  'IPPSA'],
      ['ETS / DEROS',      'Separation or rotation date',                    'IPPSA'],
      ['Days Out',         'Days until ETS/DEROS',                           'Calc'],
      ['Retention Contact','Assigned retention NCO',                         'RCMS'],
      ['Status',           'Separating / Re-enlisting / Extending / TBD',    'RCMS'],
    ] as [string, string, string][],
  },
]

// ── CSV export utility ────────────────────────────────────────────────────────
function exportCSV(headers: string[], rows: string[][], filename: string) {
  const content = [
    headers.join(','),
    ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const STATUS_CONN: Record<string, string> = {
  connected:    styles.sorConnected,
  pending:      styles.sorPending,
  disconnected: styles.sorDisconnect,
  error:        styles.sorDisconnect,
}

// ── Nav items for overview page ───────────────────────────────────────────────
const OVERVIEW_NAV = [
  { key: 'dashboard',  label: 'Dashboard',   icon: 'fa-tachometer-alt' },
  { key: 'reports',    label: 'Reports',     icon: 'fa-file-alt'       },
  { key: 'trackers',   label: 'Trackers',    icon: 'fa-tasks'          },
  { key: 'requests',   label: 'Requests',    icon: 'fa-inbox'          },
  { key: 'resources',  label: 'Resources',   icon: 'fa-book'           },
]

// ── Per-tab action buttons (only shown on the matching admin sub-page) ────────
const ADM_TAB_ACTIONS: Record<string, Array<{ key: string; icon: string; label: string }>> = {
  'adm-people': [
    { key: 'roster',     icon: 'fa-address-book',    label: 'Roster'         },
    { key: 'counseling', icon: 'fa-file-alt',        label: 'Counseling'     },
    { key: 'in-proc',    icon: 'fa-sign-in-alt',     label: 'In-Processing'  },
    { key: 'out-proc',   icon: 'fa-sign-out-alt',    label: 'Out-Processing' },
    { key: 'awards',     icon: 'fa-medal',           label: 'Awards'         },
    { key: 'promotions', icon: 'fa-arrow-circle-up', label: 'Promotions'     },
    { key: 'leave',      icon: 'fa-calendar-check',  label: 'Leave'          },
  ],
  'adm-tasks': [
    { key: 'new-task',  icon: 'fa-plus',                 label: 'New Task'  },
    { key: 'my-tasks',  icon: 'fa-user-check',           label: 'My Tasks'  },
    { key: 'all-tasks', icon: 'fa-list',                 label: 'All Tasks' },
    { key: 'priority',  icon: 'fa-exclamation-triangle', label: 'Priority'  },
    { key: 'completed', icon: 'fa-check-double',         label: 'Completed' },
  ],
  'adm-security': [
    { key: 'clearances',  icon: 'fa-id-badge',      label: 'Clearances' },
    { key: 'persec',      icon: 'fa-user-shield',   label: 'PERSEC'     },
    { key: 'opsec',       icon: 'fa-eye-slash',     label: 'OPSEC'      },
    { key: 'access-log',  icon: 'fa-file-contract', label: 'Access Log' },
  ],
  'adm-operations': [
    { key: 'battle-rhythm', icon: 'fa-drum',    label: 'Battle Rhythm' },
    { key: 'priorities',    icon: 'fa-list-ol', label: 'Priorities'    },
    { key: 'suspenses',     icon: 'fa-bell',    label: 'Suspenses'     },
    { key: 'daily-ops',     icon: 'fa-sun',     label: 'Daily Ops'     },
  ],
  'adm-sustainment': [
    { key: 'dts-travel', icon: 'fa-plane',          label: 'DTS / Travel' },
    { key: 'gtcc',       icon: 'fa-credit-card',    label: 'GTCC'         },
    { key: 'equipment',  icon: 'fa-tools',          label: 'Equipment'    },
    { key: 'da-2062',    icon: 'fa-clipboard-list', label: 'DA 2062'      },
  ],
  'adm-plans': [
    { key: 'lr-calendar', icon: 'fa-calendar-alt',    label: 'LR Calendar'      },
    { key: 'annual-susp', icon: 'fa-redo',            label: 'Annual Suspenses' },
    { key: 'planning',    icon: 'fa-project-diagram', label: 'Planning Factors' },
  ],
  'adm-comms': [
    { key: 'contact-roster', icon: 'fa-address-book', label: 'Contact Roster' },
    { key: 'ext-contacts',   icon: 'fa-phone-alt',    label: 'Ext Contacts'   },
    { key: 'message-log',    icon: 'fa-envelope',     label: 'Message Log'    },
  ],
  'adm-training': [
    { key: 'requirements', icon: 'fa-chalkboard-teacher', label: 'Requirements' },
    { key: 'metl',         icon: 'fa-crosshairs',         label: 'METL'         },
    { key: 'certs',        icon: 'fa-certificate',        label: 'Certs'        },
  ],
  'adm-resources': [
    { key: 'budget',   icon: 'fa-dollar-sign',  label: 'Budget'   },
    { key: 'property', icon: 'fa-boxes',        label: 'Property' },
    { key: 'requests', icon: 'fa-file-invoice', label: 'Requests' },
  ],
  'adm-coord': [
    { key: 'coord-tracker', icon: 'fa-project-diagram', label: 'Coord Tracker' },
    { key: 'key-contacts',  icon: 'fa-users',           label: 'Key Contacts'  },
    { key: 'deconflict',    icon: 'fa-handshake',       label: 'Deconfliction' },
    { key: 'sync-log',      icon: 'fa-comments',        label: 'Sync Log'      },
  ],
}

// ── Inline admin seed data ────────────────────────────────────────────────────

const COUNSELING_RECORDS = [
  { soldier:'Bynum, Keisha A.', rank:'SGT', date:'14 Apr 2026', type:'Initial Counseling', counselor:'SFC Garza', status:'Signed', notes:'New gain in-processing; duty expectations and standards' },
  { soldier:'Garza, Roberto M.', rank:'SFC', date:'01 Mar 2026', type:'Performance Counseling', counselor:'CPT Phillips', status:'Signed', notes:'Semi-annual performance review — above standard' },
  { soldier:'Garza, Roberto M.', rank:'SFC', date:'01 Jun 2026', type:'Event-Driven', counselor:'CPT Phillips', status:'Pending Signature', notes:'DD93 overdue action — required follow-up counseling' },
  { soldier:'Phillips, Sarah T.', rank:'CPT', date:'15 Jan 2026', type:'OER Support Form', counselor:'MAJ Ortega', status:'Signed', notes:'Annual OER support form — period beginning 15 Jan 2026' },
]

const LEAVE_RECORDS = [
  { soldier:'Garza, Roberto M.', rank:'SFC', type:'Annual Leave', start:'21 Jul 2026', end:'01 Aug 2026', days:8, balance:32, status:'Approved', approver:'CPT Phillips' },
  { soldier:'Phillips, Sarah T.', rank:'CPT', type:'TDY (Fort Jackson)', start:'07 Jul 2026', end:'18 Jul 2026', days:0, balance:41, status:'TDY Orders', approver:'MAJ Ortega' },
  { soldier:'Bynum, Keisha A.', rank:'SGT', type:'Emergency Leave', start:'10 Jun 2026', end:'17 Jun 2026', days:5, balance:18, status:'Returned', approver:'SFC Garza' },
]

const PROMO_TIG_MONTHS: Record<string, number> = { E5:12, E6:18, E7:24, E8:36, O3:24, O4:48 }

const SHOP_TASKS = [
  { id:'T-001', task:'Process DD93 for SGT Bynum (in-proc)', category:'Admin', assignedTo:'SFC Garza', priority:'High', dueDate:'18 Jun 2026', status:'Open', notes:'New gain — in-processing window' },
  { id:'T-002', task:'Submit SGLV for SGT Bynum', category:'Admin', assignedTo:'SFC Garza', priority:'High', dueDate:'18 Jun 2026', status:'Open', notes:'New gain — beneficiary required' },
  { id:'T-003', task:'Follow-up: DD93 SFC Garza overdue', category:'Admin', assignedTo:'CPT Phillips', priority:'High', dueDate:'20 Jun 2026', status:'In Progress', notes:'Deployment gap — beneficiary update 2024' },
  { id:'T-004', task:'Coordinate PRR — SFC Delgado (S4)', category:'Security', assignedTo:'SFC Garza', priority:'Medium', dueDate:'30 Jun 2026', status:'Open', notes:'Overdue PRR — coordinate w/ SARM' },
  { id:'T-005', task:'PRR action — CW3 McKinley dental flag', category:'Security', assignedTo:'CPT Phillips', priority:'Medium', dueDate:'30 Jun 2026', status:'Open', notes:'CAF review required — dental Amber' },
  { id:'T-006', task:'Submit PERSTAT by 0600', category:'Daily', assignedTo:'SFC Garza', priority:'Critical', dueDate:'18 Jun 2026', status:'Completed', notes:'Daily recurring' },
  { id:'T-007', task:'Prepare UMR for June', category:'Reporting', assignedTo:'CPT Phillips', priority:'Routine', dueDate:'07 Jul 2026', status:'Pending', notes:'Due NLT 5th of month' },
  { id:'T-008', task:'ETS counseling — SFC Guerrero (ODA)', category:'Retention', assignedTo:'SFC Garza', priority:'High', dueDate:'01 Jul 2026', status:'Open', notes:'ETS Dec 2027 — initiate 18-month plan' },
]

const ACCESS_LOG = [
  { date:'18 Jun 2026', soldier:'Phillips, Sarah T.', rank:'CPT', action:'IPPSA Pay Correction', system:'IPPSA', classification:'PII', authorized:'Yes' },
  { date:'17 Jun 2026', soldier:'Garza, Roberto M.', rank:'SFC', action:'Pull PERSTAT data', system:'IPPSA', classification:'FOUO', authorized:'Yes' },
  { date:'16 Jun 2026', soldier:'Garza, Roberto M.', rank:'SFC', action:'DISS clearance query', system:'DISS', classification:'CONFIDENTIAL', authorized:'Yes' },
  { date:'15 Jun 2026', soldier:'Bynum, Keisha A.', rank:'SGT', action:'In-proc SGLV entry', system:'IPPSA', classification:'PII', authorized:'Yes' },
  { date:'10 Jun 2026', soldier:'Phillips, Sarah T.', rank:'CPT', action:'Award submission (BSM Hunt)', system:'IPPSA', classification:'FOUO', authorized:'Yes' },
]

const LR_CALENDAR = [
  { month:'Jul 2026', event:'S1 Leadership Course — CPT Phillips TDY', type:'TDY/Training', prepDue:'01 Jul 2026', owner:'SFC Garza' },
  { month:'Aug 2026', event:'ACFT Testing Window (Bn-wide)', type:'Fitness', prepDue:'15 Jul 2026', owner:'S7 coord / S1 roster' },
  { month:'Aug 2026', event:'PCS cycle — MSM due for SSG Bishop', type:'Awards', prepDue:'01 Jul 2026', owner:'CPT Phillips' },
  { month:'Sep 2026', event:'Semi-annual DD93/SGLV Review', type:'Admin', prepDue:'01 Aug 2026', owner:'SFC Garza' },
  { month:'Sep 2026', event:'LOM packet due — MSG Hensley retirement', type:'Awards/ETS', prepDue:'01 Aug 2026', owner:'CPT Phillips' },
  { month:'Nov 2026', event:'Promotion Board Packets Due', type:'Promos', prepDue:'01 Oct 2026', owner:'SFC Garza' },
]

const PLANNING_FACTORS = [
  { factor:'IPPSA Roll-up Lag', detail:'IPPSA data lags 24–48h — reconcile PERSTAT against system daily', impact:'Reporting' },
  { factor:'PCS / ETS Window', detail:'Action lead time: 90 days prior to ETS for awards, counseling, and retention contact', impact:'Retention / Awards' },
  { factor:'Clearance PR Window', detail:'Initiate PRR 90 days before expiration to avoid gap in access eligibility', impact:'Security' },
  { factor:'SGLV / DD93 Lifecycle', detail:'Update on every PCS, deployment gap, or life event. Semi-annual audit minimum', impact:'Benefits' },
  { factor:'Award SLA Baseline', detail:'ARCOM ≤45d, MSM ≤60d, BSM ≤75d from AR 600-8-22. Track from initiation in IPPSA', impact:'Awards' },
  { factor:'ETS Transition Lead', detail:'Retention counseling 18m, TAP 90d, out-processing checklist 60d before separation', impact:'Retention' },
]

const EXT_CONTACTS = [
  { org:'G1 / Brigade S1',         poc:'SFC Williams, T.',   role:'Brigade S1 NCOIC',      phone:'DSN 555-1001', email:'t.williams@sfg.mil',    notes:'PERSTAT / UMR approvals' },
  { org:'HRC Customer Service',    poc:'MSG Calloway, J.',   role:'HRC Records Clerk',      phone:'1-888-276-9472', email:'hrc.answers@hrc.army.mil', notes:'ERB/ORB corrections; promotion actions' },
  { org:'DFAS / Finance',          poc:'SFC Chen, M.',       role:'Finance Sergeant',        phone:'DSN 555-2040', email:'m.chen@dfas.mil',       notes:'Pay discrepancies; allotment actions' },
  { org:'JAG Office',              poc:'CPT Rodriguez, A.',  role:'Legal Assistance OIC',    phone:'DSN 555-3100', email:'a.rodriguez@jag.mil',    notes:'Powers of attorney; separations; LOD' },
  { org:'Retention NCO (Bn)',      poc:'SSG Mercer, D.',     role:'Career Counselor',        phone:'DSN 555-1210', email:'d.mercer@sfg.mil',       notes:'Reenlistment; SRB; ETS coordination' },
  { org:'MEDCEN / BAMC',          poc:'CPT Nguyen, L.',     role:'Medical Readiness OIC',   phone:'DSN 555-4500', email:'l.nguyen@bamc.amedd.mil', notes:'MEB coordination; profiles; deployment clearance' },
]

const MESSAGE_LOG = [
  { date:'17 Jun 2026', from:'G1 / BDE S1', subject:'June PERSTAT Reconciliation Required', priority:'High', status:'Action Required', poc:'SFC Garza', notes:'Discrepancy in total strength — submit correction NLT 19 Jun' },
  { date:'15 Jun 2026', from:'HRC',          subject:'Promotion List — SSG Board Results Available', priority:'Routine', status:'Info', poc:'CPT Phillips', notes:'Check HRC for board results and initiate congratulatory orders' },
  { date:'12 Jun 2026', from:'DFAS',         subject:'Pay Adjustment Pending — SFC Garza',           priority:'High', status:'Pending Action', poc:'CPT Phillips', notes:'Coordinate IPPSA correction for deployment gap BAH' },
  { date:'10 Jun 2026', from:'JAG',          subject:'Admin Separation Package — PVT Hall (pending)', priority:'Medium', status:'Info', poc:'SFC Garza', notes:'POA and initial counseling required before submission' },
  { date:'05 Jun 2026', from:'MEDCEN',       subject:'MEDPROS Update — MEB Status SFC Riley',        priority:'Medium', status:'Acknowledged', poc:'CPT Phillips', notes:'WTU coordination — Riley MEB on track; review PHX monthly' },
]

const CERT_RECORDS = [
  { soldier:'Phillips, Sarah T.', rank:'CPT', cert:'S1 / 42H OIC Course', completedDate:'15 Aug 2025', expiresDate:'N/A', status:'Current', issuingOrg:'TRADOC / Fort Jackson' },
  { soldier:'Garza, Roberto M.', rank:'SFC', cert:'IPPSA Operator Certification', completedDate:'20 Jan 2026', expiresDate:'20 Jan 2027', status:'Current', issuingOrg:'IPPS-A PMO' },
  { soldier:'Bynum, Keisha A.', rank:'SGT', cert:'Personnel Actions Clerk Course', completedDate:'10 Mar 2026', expiresDate:'N/A', status:'Current', issuingOrg:'TRADOC' },
  { soldier:'Bynum, Keisha A.', rank:'SGT', cert:'DTS Travel Clerk Authorization', completedDate:'Pending', expiresDate:'—', status:'Pending', issuingOrg:'DTS Admin' },
  { soldier:'Garza, Roberto M.', rank:'SFC', cert:'Army Records Management (ARIMS)', completedDate:'15 Nov 2025', expiresDate:'15 Nov 2026', status:'Current', issuingOrg:'NARA / Army' },
]

const BUDGET_LINES = [
  { program:'TDY / Travel (DTS)',        authorization:18000, obligated:11935, expended:5485,  fy:'FY26 Q3' },
  { program:'Training Aids / Supplies',  authorization:4500,  obligated:2100,  expended:1800,  fy:'FY26 Q3' },
  { program:'Office Supplies / Admin',   authorization:2200,  obligated:1650,  expended:1400,  fy:'FY26 Q3' },
  { program:'Retention / BOSS Events',   authorization:3000,  obligated:800,   expended:400,   fy:'FY26 Q3' },
]

const RESOURCE_REQUESTS = [
  { reqNo:'RR-26-001', item:'IPPSA Operator Training Slot (SGT Bynum)', type:'Training', submittedDate:'01 Jun 2026', status:'Approved', poc:'CPT Phillips', notes:'Slot confirmed 14 Jul 2026 at Fort Jackson' },
  { reqNo:'RR-26-002', item:'Shredder Replacement (S1 Office)', type:'Equipment', submittedDate:'05 Jun 2026', status:'Pending', poc:'SFC Garza', notes:'Current unit beyond service life — FOUO doc handling risk' },
  { reqNo:'RR-26-003', item:'Additional IPPSA Terminal License', type:'Software', submittedDate:'10 Jun 2026', status:'Under Review', poc:'CPT Phillips', notes:'S6 coordination ongoing; G1 approval required' },
]

const COORD_TRACKER = [
  { date:'15 Jun 2026', request:'Brigade PERSTAT Format Change — unit-level rollup', requestingUnit:'HQ BDE S1', poc:'SFC Garza', status:'Acknowledged', dueDate:'20 Jun 2026', notes:'New format effective 01 Jul 2026' },
  { date:'10 Jun 2026', request:'MEB Coordination — SFC Riley (WTU BAMC)',         requestingUnit:'MEDCEN WTU', poc:'CPT Phillips', status:'In Progress', dueDate:'30 Jun 2026', notes:'Monthly status review; disability rating pending' },
  { date:'05 Jun 2026', request:'Promotion Order Coordination — SSG Bishop PCS',   requestingUnit:'ODA-5211 / S3', poc:'SFC Garza', status:'Completed', dueDate:'01 Jun 2026', notes:'Orders published; in-proc complete' },
  { date:'28 May 2026', request:'JAG: Admin separation counseling — PVT Hall',     requestingUnit:'JAG Office', poc:'CPT Phillips', status:'Pending Action', dueDate:'25 Jun 2026', notes:'Initial counseling and POA required before submission' },
]

const KEY_CONTACTS = [
  { org:'5th SFG HQ S1',      rep:'SFC Williams, T.',  role:'Group S1 NCOIC',       phone:'DSN 555-1001', lastContact:'16 Jun 2026' },
  { org:'HRC',                rep:'MSG Calloway, J.',  role:'Records Manager',       phone:'1-888-276-9472', lastContact:'12 Jun 2026' },
  { org:'G1 BDE',             rep:'CPT Osei, A.',      role:'BDE Personnel OIC',     phone:'DSN 555-1050', lastContact:'15 Jun 2026' },
  { org:'DFAS / Finance',     rep:'SFC Chen, M.',      role:'Finance Sergeant',       phone:'DSN 555-2040', lastContact:'12 Jun 2026' },
  { org:'JAG',                rep:'CPT Rodriguez, A.', role:'Legal Assistance OIC',  phone:'DSN 555-3100', lastContact:'10 Jun 2026' },
]

const DECONFLICT_LOG = [
  { date:'18 Jun 2026', issue:'PERSTAT count discrepancy vs BDE roll-up (−1)', resolvedBy:'SFC Garza', status:'Open', action:'SGT Bynum TDY status not reflected — submitting correction' },
  { date:'14 Jun 2026', issue:'Award SLA conflict — BSM Hunt due before Board convenes', resolvedBy:'CPT Phillips', status:'Resolved', action:'Expedited routing approved — signed by CDR 15 Jun' },
  { date:'08 Jun 2026', issue:'DTS voucher hold — CW3 McKinley GTCC balance flag', resolvedBy:'CPT Phillips', status:'Resolved', action:'Finance cleared hold — resubmit authorized' },
]

const SYNC_LOG = [
  { date:'17 Jun 2026', meeting:'BDE S1 Sync', attendees:'CPT Phillips, SFC Garza', keyItems:'PERSTAT correction required; July PCS cycle brief', actionItems:'SFC Garza submit correction by 19 Jun' },
  { date:'10 Jun 2026', meeting:'Bn CDR Update (S1 brief)', attendees:'CPT Phillips', keyItems:'Awards SLA at risk (Hunt BSM); 3 DD93 overdue', actionItems:'CDR directed expedited Hunt award routing; schedule DD93 counselings' },
  { date:'03 Jun 2026', meeting:'WTU Coordination (MEDCEN)', attendees:'CPT Phillips', keyItems:'Riley / Washington MEB status; SDAP suspense', actionItems:'Monthly check-ins scheduled; SDAP reviewed by Finance' },
  { date:'27 May 2026', meeting:'S1 Shop Sync (internal)', attendees:'CPT Phillips, SFC Garza, SGT Bynum', keyItems:'New gain Bynum in-proc checklist; awards pipeline; ETS tracker', actionItems:'DD93/SGLV actions assigned; awards board set for 10 Jun' },
]

// ── Placeholder row helper ────────────────────────────────────────────────────
const P = () => <span className={styles.srcPending}>Pending</span>
const PI = () => <span className={styles.srcPending}>IPPSA data input</span>

// ── Component ─────────────────────────────────────────────────────────────────
export default function S1Page({
  subPage = 'overview',
  onNavigate,
}: {
  subPage?: string
  onNavigate?: (page: string) => void
}) {
  const { data } = useArmyData()
  const [modal, setModal] = useState<ModalState>(null)
  const [adminSubTab, setAdminSubTab] = useState('summary')
  const [prevAdmPage, setPrevAdmPage] = useState(subPage)
  if (prevAdmPage !== subPage) {
    setPrevAdmPage(subPage)
    setAdminSubTab('summary')
  }

  const [internalTab, setInternalTab] = useState('summary')
  const [prevIntPage, setPrevIntPage] = useState(subPage)
  if (prevIntPage !== subPage) {
    setPrevIntPage(subPage)
    setInternalTab('summary')
  }

  // Legacy ArmyDataContext (API unavailable — seed data used instead)
  const entries   = data ? Object.entries(data.soldiers) : []

  // Seed-derived dashboard stats
  const seedTotal    = IPPSA_SOLDIERS.length
  const seedMedGreen = MEDPROS_SOLDIERS.filter(m => m.medStatus === 'Green').length
  const seedMedAmber = MEDPROS_SOLDIERS.filter(m => m.medStatus === 'Amber').length
  const seedMedRed   = MEDPROS_SOLDIERS.filter(m => m.medStatus === 'Red').length
  const seedOverdue  = ADMIN_SUSPENSES.filter(s => s.status === 'Overdue').length

  const hasSorData = true // seed data always available

  const dashStats = [
    { label: 'Assigned',         value: String(seedTotal),                   note: 'IPPSA',   bg: '#2d2d2d'          },
    { label: 'Present for Duty', value: String(seedTotal - seedMedRed),      note: 'CMD',     bg: '#2d2d2d'          },
    { label: 'Med Ready',        value: String(seedMedGreen),                note: 'MEDPROS', bg: STATUS_COLOR.Green },
    { label: 'Med Flags',        value: String(seedMedAmber + seedMedRed),   note: 'MEDPROS', bg: STATUS_COLOR.Amber },
    { label: 'Admin Overdue',    value: String(seedOverdue),                 note: 'THREADS', bg: STATUS_COLOR.Red   },
  ]

  function closeModal() { setModal(null) }

  function exportRoster() {
    exportCSV(
      ['Name', 'Rank', 'MOS', 'Position', 'Section', 'Med Status', 'AFT Score'],
      IPPSA_SOLDIERS.map(s => {
        const med = getMedStatus(s.edipi)
        const dtms = getDtmsRecord(s.edipi)
        return [
          `${s.lastName}, ${s.firstName}`, s.rank, s.mos, s.positionTitle,
          s.section, med?.medStatus ?? '—', dtms ? String(dtms.aftScore || dtms.aftStatus) : '—',
        ]
      }),
      's1-personnel-roster.csv',
    )
  }

  function exportReport(rpt: typeof REPORTS[number]) {
    exportCSV(
      rpt.fields.map(f => f[0]),
      [rpt.fields.map(f => `[${f[2]}] — ${f[1]}`)],
      `s1-${rpt.id}.csv`,
    )
  }

  const selSoldier = modal?.kind === 'detail' && data ? data.soldiers[modal.slug] : null
  const selReport  = modal?.kind === 'report' ? REPORTS.find(r => r.id === modal.reportId) : null

  // ── Admin quick-nav bar ──────────────────────────────────────────────────
  const currentTabActions = ADM_TAB_ACTIONS[subPage] ?? []
  const isAdmPage = subPage.startsWith('adm-') && subPage !== 'adm-sustainment'
  const adminQuickNav = isAdmPage ? (
    <div className={styles.adminNav}>
      <button
        className={`${styles.tabActionBtn} ${adminSubTab === 'summary' ? styles.tabActionActive : ''}`}
        onClick={() => setAdminSubTab('summary')}
      >
        <i className="fas fa-tachometer-alt" />
        Summary
      </button>
      {currentTabActions.map(btn => (
        <button
          key={btn.key}
          className={`${styles.tabActionBtn} ${adminSubTab === btn.key ? styles.tabActionActive : ''}`}
          onClick={() => setAdminSubTab(btn.key)}
        >
          <i className={`fas ${btn.icon}`} />
          {btn.label}
        </button>
      ))}
    </div>
  ) : null


  // ── Page header (shared by all sub-pages) ────────────────────────────────
  const pageHeader = (
    <>
      <div className={shared.header}>
        <h2><i className="fas fa-users" /> S1 Section — Personnel</h2>
        <span className={shared.sub}>Personnel management · administrative readiness</span>
      </div>
      {/* SOR integration status bar */}
      <div className={styles.sorBar}>
        <span className={styles.sorBarLabel}>Data Sources</span>
        {SOR_CONNECTIONS.map(c => (
          <div key={c.source} className={`${styles.sorPill} ${STATUS_CONN[c.status] ?? styles.sorPending}`}>
            <span className={styles.sorDot} />
            {c.label}
          </div>
        ))}
      </div>
    </>
  )

  // ── Placeholder rows helper ───────────────────────────────────────────────
  function placeholderRows(count: number, cols: number) {
    return Array.from({ length: count }, (_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }, (__, j) => (
          <td key={j}><P /></td>
        ))}
      </tr>
    ))
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SUB-PAGE ROUTING
  // ══════════════════════════════════════════════════════════════════════════

  // ── OVERVIEW ──────────────────────────────────────────────────────────────
  if (subPage === 'overview') {
    return (
      <>
        <div className={shared.page}>
          {pageHeader}

          {/* Nav cards */}
          <div className={shared.navCards} style={{ marginBottom: 20 }}>
            {OVERVIEW_NAV.map(n => (
              <button
                key={n.key}
                className={shared.navCard}
                onClick={() => onNavigate?.(`j1-${n.key}`)}
              >
                <i className={`fas ${n.icon}`} />
                {n.label}
              </button>
            ))}
          </div>

          <div className={shared.card} style={{ marginBottom: 14 }}>
            <div className={shared.cardHeader}><i className="fas fa-info-circle" /> S1 Section Charter</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.65, margin: 0 }}>
                The S1 section is the primary staff section responsible for all personnel management
                functions within the unit. The S1 advises the commander on personnel readiness,
                administrative operations, and ensures all soldiers receive timely and accurate
                personnel services in support of mission requirements.
              </p>
            </div>
          </div>

          <div className={shared.grid2}>
            <div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Key Responsibilities</div>
                <div className={shared.cardBody}>
                  <div className={styles.responsibilityGrid} style={{ gridTemplateColumns: '1fr' }}>
                    {RESPONSIBILITIES.map((r, i) => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < RESPONSIBILITIES.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                        <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                          <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-id-badge" /> S1 Section Leadership</div>
                <div className={shared.cardBody}>
                  {S1_SECTION_SOLDIERS.map(s => {
                    const med = getMedStatus(s.edipi)
                    return (
                      <div key={s.edipi} className={styles.leadershipRow}>
                        <span className={styles.leadershipTitle}>{s.positionTitle}</span>
                        <span className={styles.leadershipName} style={{ display:'flex', alignItems:'center', gap:6 }}>
                          {s.rank} {s.lastName}
                          <span className={shared.dot} style={{ background: STATUS_COLOR[med?.medStatus ?? ''] ?? '#555', marginLeft:2 }} />
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-link" /> System Connections</div>
                <div className={shared.cardBody}>
                  {SOR_CONNECTIONS.map(c => (
                    <div key={c.source} className={styles.leadershipRow}>
                      <span className={styles.leadershipTitle}>{c.label}</span>
                      <span className={`${styles.sorPill} ${STATUS_CONN[c.status]}`} style={{ fontSize: 9 }}>
                        <span className={styles.sorDot} />
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderModals()}
      </>
    )
  }

  // ── Internal page tab bar helper ─────────────────────────────────────────
  function intTabBar(tabs: { key: string; label: string; icon: string }[]) {
    return (
      <div className={styles.adminNav} style={{ marginBottom: 16 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`${styles.tabActionBtn} ${internalTab === t.key ? styles.tabActionActive : ''}`}
            onClick={() => setInternalTab(t.key)}
          >
            <i className={`fas ${t.icon}`} />
            {t.label}
          </button>
        ))}
      </div>
    )
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  if (subPage === 'dashboard') {
    return (
      <>
        <div className={shared.page}>
          {pageHeader}
          {intTabBar([
            { key:'summary',     label:'Summary',     icon:'fa-tachometer-alt' },
            { key:'readiness',   label:'Readiness',   icon:'fa-shield-alt'     },
            { key:'medical',     label:'Medical',     icon:'fa-heartbeat'      },
            { key:'fitness',     label:'Fitness',     icon:'fa-running'        },
            { key:'admin-flags', label:'Admin Flags', icon:'fa-flag'           },
          ])}

          {internalTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {dashStats.map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 3, letterSpacing: '0.5px' }}>{s.note}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><i className="fas fa-users" /> Personnel Summary</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className={styles.btnSecondary} onClick={exportRoster}>
                      <i className="fas fa-download" /> Export CSV
                    </button>
                    <button className={styles.btnPrimary} onClick={() => setModal({ kind: 'view-all' })}>
                      <i className="fas fa-expand" /> View All
                    </button>
                  </div>
                </div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead>
                      <tr><th>Name</th><th>Rank</th><th>MOS</th><th>Section</th><th>Med</th><th>AFT</th><th></th></tr>
                    </thead>
                    <tbody>
                      {IPPSA_SOLDIERS.slice(0, 12).map(s => {
                        const med  = getMedStatus(s.edipi)
                        const dtms = getDtmsRecord(s.edipi)
                        return (
                          <tr key={s.edipi}>
                            <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                            <td>{s.rank}</td>
                            <td>{s.mos}</td>
                            <td>{s.section}</td>
                            <td>
                              <span className={shared.dot} style={{ background: STATUS_COLOR[med?.medStatus ?? ''] ?? '#555' }} />
                              {med?.medStatus ?? '—'}
                            </td>
                            <td style={{ color: dtms?.aftStatus === 'Pass' ? '#2d6a4f' : dtms?.aftStatus?.startsWith('Exempt') ? '#555' : '#c0392b' }}>
                              {dtms ? (dtms.aftScore > 0 ? `${dtms.aftScore} — ${dtms.aftStatus}` : dtms.aftStatus) : '—'}
                            </td>
                            <td><button className={styles.btnDetail} onClick={() => setModal({ kind: 'detail', slug: s.edipi })}>Detail</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {internalTab === 'readiness' && (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-shield-alt" /> ETS / DEROS Readiness (90-60-30 Window)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Section</th><th>ETS</th><th>Days Out</th><th>Window</th></tr>
                  </thead>
                  <tbody>
                    {getEtsDerosSoldiers().map(s => {
                      const flag = etsFlag(s.daysOut)
                      const color = flag === 'critical' ? '#e74c3c' : flag === 'warning' ? '#e67e22' : '#27ae60'
                      return (
                        <tr key={s.edipi}>
                          <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                          <td>{s.rank}</td><td>{s.mos}</td><td>{s.section}</td><td>{s.ets}</td>
                          <td style={{ fontWeight: 700, color }}>{s.daysOut}d</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{s.daysOut <= 30 ? '30-DAY' : s.daysOut <= 60 ? '60-DAY' : '90-DAY'}</span></td>
                        </tr>
                      )
                    })}
                    {getEtsDerosSoldiers().length === 0 && (
                      <tr><td colSpan={7} style={{ color: '#555', fontStyle: 'italic', textAlign: 'center' }}>No soldiers in ETS/DEROS window</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {internalTab === 'medical' && (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-heartbeat" /> Medical Readiness (Source: MEDPROS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Med Status</th><th>Dental</th><th>MRC Class</th><th>Restrictions</th></tr>
                  </thead>
                  <tbody>
                    {MEDPROS_SOLDIERS.map((m, i) => {
                      const color = STATUS_COLOR[m.medStatus] ?? '#555'
                      return (
                        <tr key={i}>
                          <td>{m.name}</td>
                          <td>{m.rank}</td>
                          <td>{m.section}</td>
                          <td>
                            <span className={shared.dot} style={{ background: color }} />
                            <span style={{ color }}>{m.medStatus}</span>
                          </td>
                          <td style={{ fontSize: 11, color: '#888' }}>{m.dental}</td>
                          <td style={{ fontSize: 11, color: '#888' }}>{m.mrcClass}</td>
                          <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{m.deployRestriction ?? '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {internalTab === 'fitness' && (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-running" /> Fitness Tracker (Source: DTMS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>AFT Score</th><th>AFT Status</th><th>AFT Date</th><th>CFT Grade</th></tr>
                  </thead>
                  <tbody>
                    {DTMS_SOLDIERS.map((d, i) => {
                      const pass = d.aftStatus === 'Pass'
                      const color = pass ? '#27ae60' : d.aftStatus?.startsWith('Exempt') ? '#555' : '#e74c3c'
                      return (
                        <tr key={i}>
                          <td>{d.name}</td>
                          <td>{d.rank}</td>
                          <td>{d.section}</td>
                          <td style={{ fontWeight: 700, color }}>{d.aftScore > 0 ? d.aftScore : '—'}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{d.aftStatus}</span></td>
                          <td style={{ fontSize: 10, color: '#888' }}>{d.aftDate}</td>
                          <td style={{ fontSize: 10, color: '#888' }}>{d.cftGrade}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {internalTab === 'admin-flags' && (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-flag" /> Admin Suspenses &amp; Flags (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {ADMIN_SUSPENSES.map((r, i) => {
                      const color = r.status === 'Overdue' ? '#e74c3c' : r.status === 'Pending' ? '#c9a227' : '#27ae60'
                      return (
                        <tr key={i}>
                          <td>{r.soldier}</td><td>{r.rank}</td><td>{r.section}</td>
                          <td style={{ fontWeight: 700 }}>{r.item}</td>
                          <td style={{ color: r.status === 'Overdue' ? '#e74c3c' : '#888', fontSize: 10 }}>{r.dueDate}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{r.status}</span></td>
                          <td>{r.poc}</td>
                          <td style={{ fontSize: 10, color: '#555', maxWidth: 220 }}>{r.notes}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {renderModals()}
      </>
    )
  }

  // ── REPORTS ───────────────────────────────────────────────────────────────
  if (subPage === 'reports') {
    const REPORT_FREQ: Record<string, string> = {
      perstat: 'daily',
      leave: 'weekly',
      manning: 'monthly',
      strength: 'monthly',
      awards: 'monthly',
    }
    const filteredReports = internalTab === 'summary' ? REPORTS : REPORTS.filter(r => REPORT_FREQ[r.id] === internalTab)
    const renderReportList = (rpts: typeof REPORTS) => (
      rpts.length === 0
        ? (
          <div className={shared.card}>
            <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555' }}>
              <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
              No records found for this category.
            </div>
          </div>
        )
        : (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-file-alt" /> S1 Standard Reports</div>
            {rpts.map(rpt => (
              <div key={rpt.id} className={styles.reportRow}>
                <div className={styles.reportInfo}>
                  <div className={styles.reportTitle}>{rpt.title}</div>
                  <div className={styles.reportDesc}>{rpt.desc}</div>
                </div>
                <div className={styles.reportActions}>
                  <button className={styles.btnSecondary} onClick={() => exportReport(rpt)}>
                    <i className="fas fa-download" /> Export
                  </button>
                  <button className={styles.btnPrimary} onClick={() => setModal({ kind: 'report', reportId: rpt.id })}>
                    <i className="fas fa-eye" /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
    )
    return (
      <>
        <div className={shared.page}>
          {pageHeader}
          {intTabBar([
            { key:'summary',   label:'All Reports', icon:'fa-list'          },
            { key:'daily',     label:'Daily',       icon:'fa-calendar-day'  },
            { key:'weekly',    label:'Weekly',      icon:'fa-calendar-week' },
            { key:'monthly',   label:'Monthly',     icon:'fa-calendar-alt'  },
            { key:'quarterly', label:'Quarterly',   icon:'fa-chart-bar'     },
            { key:'annual',    label:'Annual',      icon:'fa-calendar'      },
          ])}
          {renderReportList(filteredReports)}
        </div>

        {renderModals()}
      </>
    )
  }

  // ── TRACKERS ──────────────────────────────────────────────────────────────
  if (subPage === 'trackers') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',    label:'All',         icon:'fa-layer-group'    },
          { key:'suspenses',  label:'Suspenses',   icon:'fa-clock'          },
          { key:'leave',      label:'Leave',       icon:'fa-umbrella-beach' },
          { key:'ets-deros',  label:'ETS / DEROS', icon:'fa-sign-out-alt'   },
          { key:'clearances', label:'Clearances',  icon:'fa-user-shield'    },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-tasks" /> S1 Trackers</h2>
            </div>

            {/* Admin Suspenses Tracker */}
            <div className={shared.card} style={{ marginBottom: 16 }}>
              <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><i className="fas fa-calendar-exclamation" /> Admin Suspenses Tracker</span>
                <button className={styles.btnSecondary} onClick={() => exportCSV(['Soldier','Rank','Section','Item','Due Date','Status','POC','Notes'], ADMIN_SUSPENSES.map(r => [r.soldier,r.rank,r.section,r.item,r.dueDate,r.status,r.poc,r.notes]), 's1-suspenses.csv')}>
                  <i className="fas fa-download" /> Export
                </button>
              </div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {ADMIN_SUSPENSES.map((r, i) => (
                      <tr key={i}>
                        <td>{r.soldier}</td>
                        <td>{r.rank}</td>
                        <td style={{ fontWeight: 700 }}>{r.item}</td>
                        <td>{r.dueDate}</td>
                        <td>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                            background: r.status === 'Overdue' ? 'rgba(192,57,43,0.2)' : r.status === 'Pending' ? 'rgba(201,162,39,0.15)' : 'rgba(45,106,79,0.2)',
                            color:      r.status === 'Overdue' ? '#e74c3c'             : r.status === 'Pending' ? '#c9a227'                : '#27ae60',
                          }}>{r.status}</span>
                        </td>
                        <td>{r.poc}</td>
                        <td style={{ fontSize: 10, color: '#555', maxWidth: 240 }}>{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leave Tracker */}
            <div className={shared.card} style={{ marginBottom: 16 }}>
              <div className={shared.cardHeader}><i className="fas fa-umbrella-beach" /> Leave Tracker (Summary)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>Leave Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th><th>Approver</th></tr>
                  </thead>
                  <tbody>
                    {LEAVE_RECORDS.map((l, i) => (
                      <tr key={i}>
                        <td>{l.soldier}</td><td>{l.rank}</td><td>{l.type}</td>
                        <td>{l.start}</td><td>{l.end}</td>
                        <td>{l.days > 0 ? l.days : '—'}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: l.status === 'Approved' ? 'rgba(45,106,79,0.2)' : 'rgba(201,162,39,0.15)', color: l.status === 'Approved' ? '#27ae60' : '#c9a227' }}>{l.status}</span></td>
                        <td>{l.approver}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ETS / DEROS */}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-clock" /> ETS / DEROS (90-60-30 Window)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Section</th><th>ETS Date</th><th>Days Out</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {getEtsDerosSoldiers().map(s => {
                      const flag = etsFlag(s.daysOut)
                      const flagColor = flag === 'critical' ? '#e74c3c' : flag === 'warning' ? '#e67e22' : '#888'
                      return (
                        <tr key={s.edipi}>
                          <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                          <td>{s.rank}</td>
                          <td>{s.mos}</td>
                          <td>{s.section}</td>
                          <td>{s.ets}</td>
                          <td style={{ fontWeight: 700, color: flagColor }}>{s.daysOut}d</td>
                          <td>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: flagColor + '22', color: flagColor }}>
                              {s.daysOut <= 30 ? '30-DAY' : s.daysOut <= 60 ? '60-DAY' : '90-DAY'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {getEtsDerosSoldiers().length === 0 && (
                      <tr><td colSpan={7} style={{ color: '#555', fontStyle: 'italic', textAlign: 'center' }}>No soldiers in 180-day ETS/DEROS window</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {internalTab === 'suspenses' && (
          <div className={shared.card}>
            <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><i className="fas fa-clock" /> Admin Suspenses (Full)</span>
              <button className={styles.btnSecondary} onClick={() => exportCSV(['Soldier','Rank','Section','Item','Due Date','Status','POC','Notes'], ADMIN_SUSPENSES.map(r => [r.soldier,r.rank,r.section,r.item,r.dueDate,r.status,r.poc,r.notes]), 's1-suspenses.csv')}>
                <i className="fas fa-download" /> Export
              </button>
            </div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {ADMIN_SUSPENSES.map((r, i) => {
                    const color = r.status === 'Overdue' ? '#e74c3c' : r.status === 'Pending' ? '#c9a227' : '#27ae60'
                    return (
                      <tr key={i}>
                        <td>{r.soldier}</td><td>{r.rank}</td><td>{r.section}</td>
                        <td style={{ fontWeight: 700 }}>{r.item}</td>
                        <td style={{ color: r.status === 'Overdue' ? '#e74c3c' : '#888', fontSize: 10 }}>{r.dueDate}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{r.status}</span></td>
                        <td>{r.poc}</td>
                        <td style={{ fontSize: 10, color: '#555', maxWidth: 240 }}>{r.notes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'leave' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-umbrella-beach" /> Leave Records (Source: THREADS)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>Leave Type</th><th>Start</th><th>End</th><th>Days</th><th>Balance</th><th>Status</th><th>Approver</th></tr>
                </thead>
                <tbody>
                  {LEAVE_RECORDS.map((l, i) => (
                    <tr key={i}>
                      <td>{l.soldier}</td><td>{l.rank}</td><td>{l.type}</td>
                      <td>{l.start}</td><td>{l.end}</td>
                      <td>{l.days > 0 ? l.days : '—'}</td>
                      <td style={{ color: '#c9a227', fontWeight: 600 }}>{l.balance}d</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: l.status === 'Approved' ? 'rgba(45,106,79,0.2)' : l.status === 'Returned' ? '#1a1a1a' : 'rgba(201,162,39,0.15)', color: l.status === 'Approved' ? '#27ae60' : l.status === 'Returned' ? '#555' : '#c9a227' }}>{l.status}</span></td>
                      <td>{l.approver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'ets-deros' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-sign-out-alt" /> ETS / DEROS Tracker (Source: IPPSA)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Section</th><th>ETS</th><th>Days Out</th><th>Window</th></tr>
                </thead>
                <tbody>
                  {getEtsDerosSoldiers().map(s => {
                    const flag = etsFlag(s.daysOut)
                    const color = flag === 'critical' ? '#e74c3c' : flag === 'warning' ? '#e67e22' : '#27ae60'
                    return (
                      <tr key={s.edipi}>
                        <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                        <td>{s.rank}</td><td>{s.mos}</td><td>{s.section}</td><td>{s.ets}</td>
                        <td style={{ fontWeight: 700, color }}>{s.daysOut}d</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{s.daysOut <= 30 ? '30-DAY' : s.daysOut <= 60 ? '60-DAY' : '90-DAY'}</span></td>
                      </tr>
                    )
                  })}
                  {getEtsDerosSoldiers().length === 0 && (
                    <tr><td colSpan={7} style={{ color: '#555', fontStyle: 'italic', textAlign: 'center' }}>No soldiers in 180-day ETS/DEROS window</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'clearances' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-user-shield" /> Security Clearances (Source: DISS)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>Clearance Level</th><th>Investigation</th><th>Status</th><th>PR Due</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {DISS_SUBJECTS.map((d, i) => {
                    const isOverdue  = d.prStatus.startsWith('OVERDUE')
                    const isExpiring = d.prStatus.startsWith('EXPIRING')
                    const color = isOverdue ? '#e74c3c' : isExpiring ? '#e67e22' : '#27ae60'
                    return (
                      <tr key={i}>
                        <td>{d.lastName}, {d.firstName.charAt(0)}.</td>
                        <td>{d.rank}</td>
                        <td style={{ fontWeight: 700, color: '#c9a227' }}>{d.eligibilityLevel}</td>
                        <td style={{ fontSize: 10, color: '#888' }}>{d.investigationType}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{isOverdue ? 'OVERDUE' : isExpiring ? 'EXPIRING' : 'Current'}</span></td>
                        <td style={{ color: isOverdue || isExpiring ? color : '#888', fontSize: 11 }}>{d.prDueDate}</td>
                        <td style={{ fontSize: 11, color: '#555' }}>{d.derogInfo ? '⚠ Derog on file' : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── REQUESTS ──────────────────────────────────────────────────────────────
  if (subPage === 'requests') {
    const reqStats = [
      { label: 'Pending',       value: String(ADMIN_SUSPENSES.filter(a => a.status === 'Pending').length),  bg: '#2d2d2d' },
      { label: 'In-Review',     value: '—',                                                                  bg: '#2d2d2d' },
      { label: 'Completed MTD', value: '—',                                                                  bg: STATUS_COLOR.Green },
      { label: 'Returned',      value: '—',                                                                  bg: STATUS_COLOR.Red },
    ]
    const renderSuspenseTable = (rows: typeof ADMIN_SUSPENSES) =>
      rows.length === 0
        ? (
          <div className={shared.card}>
            <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555' }}>
              <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
              No records found for this category.
            </div>
          </div>
        )
        : (
          <div className={shared.card}>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Request</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const color = r.status === 'Overdue' ? '#e74c3c' : r.status === 'Pending' ? '#c9a227' : '#27ae60'
                    return (
                      <tr key={i}>
                        <td>{r.soldier}</td><td>{r.rank}</td><td>{r.section}</td>
                        <td style={{ fontWeight: 700 }}>{r.item}</td>
                        <td style={{ fontSize: 10, color: '#888' }}>{r.dueDate}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{r.status}</span></td>
                        <td>{r.poc}</td>
                        <td style={{ fontSize: 10, color: '#555', maxWidth: 220 }}>{r.notes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',   label:'All',        icon:'fa-list'            },
          { key:'pending',   label:'Pending',    icon:'fa-hourglass-half'  },
          { key:'in-review', label:'In Review',  icon:'fa-search'          },
          { key:'completed', label:'Completed',  icon:'fa-check-circle'    },
          { key:'returned',  label:'Returned',   icon:'fa-undo'            },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-inbox" /> Personnel Action Requests</h2>
            </div>
            <div className={shared.stats}>
              {reqStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><i className="fas fa-list-alt" /> Action Requests</span>
                <button className={styles.btnPrimary}>
                  <i className="fas fa-plus" /> Add Request
                </button>
              </div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Action Type</th><th>DA Form #</th><th>Submitted</th><th>Due</th><th>Status</th><th>S1 POC</th></tr>
                  </thead>
                  <tbody>
                    {[0,1,2,3].map(i => (
                      <tr key={i}>
                        <td><PI /></td><td><P /></td><td><P /></td><td><P /></td><td><P /></td><td><P /></td><td><P /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {internalTab === 'pending' && renderSuspenseTable(ADMIN_SUSPENSES.filter(a => a.status === 'Pending'))}
        {internalTab === 'in-review' && renderSuspenseTable(ADMIN_SUSPENSES.filter(a => a.status === 'Overdue'))}
        {internalTab === 'completed' && renderSuspenseTable(ADMIN_SUSPENSES.filter(a => a.status === 'Current'))}
        {internalTab === 'returned' && (
          <div className={shared.card}>
            <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555' }}>
              <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
              No returned requests at this time.
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── RESOURCES ─────────────────────────────────────────────────────────────
  if (subPage === 'resources') {
    const S1_FORMS = [
      { number:'DA 638',       name:'Recommendation for Award',                    link:'APD' },
      { number:'DA 31',        name:'Request and Authority for Leave',              link:'APD' },
      { number:'DA 4856',      name:'Developmental Counseling Form',               link:'APD' },
      { number:'DD 93',        name:'Record of Emergency Data',                    link:'milConnect' },
      { number:'SGLV 8286',    name:'SGLI Election',                               link:'milConnect' },
      { number:'DA 1059',      name:'Service School Academic Evaluation Report',   link:'APD' },
      { number:'DA 67-10-1',   name:'OER (Company Grade)',                         link:'APD' },
      { number:'DA 2166-9-1',  name:'NCOER (SSG-SGM)',                             link:'APD' },
      { number:'SF 600',       name:'Chronological Record of Medical Care',        link:'MEDPROS' },
      { number:'DD 2807-1',    name:'Report of Medical History',                   link:'APD' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',  label:'References', icon:'fa-book-open'      },
          { key:'contacts', label:'Contacts',   icon:'fa-address-book'   },
          { key:'planning', label:'Planning',   icon:'fa-clipboard-list' },
          { key:'forms',    label:'Forms',      icon:'fa-file-alt'       },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-book" /> S1 Resources &amp; References</h2>
            </div>
            <div className={shared.grid2}>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-bookmark" /> Quick Reference</div>
                <div className={shared.cardBody}>
                  <dl className={shared.dl}>
                    <dt>PERSTAT SOP</dt>       <dd><P /></dd>
                    <dt>Awards SOP</dt>        <dd><P /></dd>
                    <dt>Leave Policy</dt>      <dd><P /></dd>
                    <dt>IPPSA Access</dt>      <dd><P /></dd>
                    <dt>HR Connect Portal</dt> <dd><P /></dd>
                    <dt>Promotion Point Worksheet</dt><dd><P /></dd>
                  </dl>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-address-book" /> Key Contacts</div>
                <div className={shared.cardBody}>
                  <dl className={shared.dl}>
                    <dt>G1 POC</dt>           <dd><P /></dd>
                    <dt>HRC Contact</dt>      <dd><P /></dd>
                    <dt>Finance Officer</dt>  <dd><P /></dd>
                    <dt>JAG</dt>              <dd><P /></dd>
                    <dt>Retention NCO</dt>    <dd><P /></dd>
                  </dl>
                </div>
              </div>
            </div>
          </>
        )}

        {internalTab === 'contacts' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-address-book" /> External Contacts (Source: THREADS)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Org</th><th>POC</th><th>Role</th><th>Phone</th><th>Email</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {EXT_CONTACTS.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: '#ccc' }}>{c.org}</td>
                      <td>{c.poc}</td>
                      <td style={{ fontSize: 11, color: '#888' }}>{c.role}</td>
                      <td style={{ fontSize: 10, color: '#666' }}>{c.phone}</td>
                      <td style={{ fontSize: 10, color: '#555' }}>{c.email}</td>
                      <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{c.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'planning' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Planning Factors</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Factor</th><th>Detail</th><th>Impact Area</th></tr>
                </thead>
                <tbody>
                  {PLANNING_FACTORS.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: '#c9a227', whiteSpace: 'nowrap' }}>{p.factor}</td>
                      <td style={{ fontSize: 11, color: '#888', maxWidth: 360 }}>{p.detail}</td>
                      <td style={{ fontSize: 10, color: '#666' }}>{p.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'forms' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Common S1 Forms</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Form #</th><th>Name</th><th>Source System</th></tr>
                </thead>
                <tbody>
                  {S1_FORMS.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: '#c9a227', whiteSpace: 'nowrap' }}>{f.number}</td>
                      <td>{f.name}</td>
                      <td style={{ fontSize: 10, color: '#666' }}>{f.link}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── AWARDS ────────────────────────────────────────────────────────────────
  if (subPage === 'awards') {

    const SLA_DAYS: Record<string, number> = {
      'AAM':30,'AGCM':30,'ARCOM':45,'MSM':60,'BSM':75,'BSM (V)':90,'LOM':120,'DSM':150,
    }
    function getSla(award: string) { return SLA_DAYS[award] ?? SLA_DAYS[award.split(' ')[0]] ?? 45 }
    function daysSince(ds: string): number {
      if (!ds || ds === 'Pending' || ds === '—') return 0
      const MONTHS: Record<string,number> = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}
      const p = ds.split(' ')
      if (p.length === 3) {
        return Math.max(0, Math.floor((new Date(2026,5,18).getTime() - new Date(+p[2], MONTHS[p[1]]??0, +p[0]).getTime()) / 86400000))
      }
      return 0
    }
    function slaClass(d: number, sla: number): 'ok'|'warn'|'over' {
      if (d === 0) return 'ok'
      return d >= sla ? 'over' : d >= Math.floor(sla * 0.75) ? 'warn' : 'ok'
    }

    const AWARD_TABS = [
      { key:'summary',    label:'Summary',   icon:'fa-tachometer-alt' },
      { key:'all',        label:'All',        icon:'fa-list'           },
      { key:'pcs',        label:'PCS',        icon:'fa-truck-moving'   },
      { key:'ets',        label:'ETS',        icon:'fa-calendar-times' },
      { key:'retirement', label:'Retirement', icon:'fa-star'           },
      { key:'deployment', label:'Deployment', icon:'fa-globe-americas' },
      { key:'training',   label:'Training',   icon:'fa-graduation-cap' },
      { key:'merit',      label:'Merit',      icon:'fa-award'          },
      { key:'other',      label:'Other',      icon:'fa-ellipsis-h'     },
    ]
    const RANKS = ['PVT','PV2','PFC','SPC','CPL','SGT','SSG','SFC','MSG','1SG','SGM','CSM','2LT','1LT','CPT','MAJ','LTC','COL']
    const AWARD_OPTS = ['AAM','ARCOM','MSM','BSM','BSM (V)','LOM','AGCM','NDSM','GWOT-SM']
    const CAT_OPTS: AwardCategory[] = ['PCS','ETS','Retirement','Deployment','Training','Merit','Other']

    const AwardsPage = () => {
      const [aTab, setATab] = useState('summary')
      const [showModal, setShowModal] = useState(false)
      const [localAwards, setLocalAwards] = useState<typeof AWARDS_PIPELINE>([])
      const [form, setForm] = useState({
        soldier:'', rank:'SGT', section:'', award:'ARCOM',
        category:'Merit' as AwardCategory, actionPeriod:'', dueDate:'', actionOfficer:'',
      })

      const allAwards = [...AWARDS_PIPELINE, ...localAwards]
      const tabRows = (key: string) =>
        key === 'all' || key === 'summary' ? allAwards
          : allAwards.filter(a => a.category.toLowerCase() === key)
      const ippsaRows   = allAwards.filter(a => a.type === 'submitted')
      const threadsRows = allAwards.filter(a => a.type === 'nominated')
      const overdueCount = allAwards.filter(a => a.status.startsWith('OVERDUE')).length
      const slaRisk = allAwards.filter(a => { const d = daysSince(a.submitted); return d > 0 && slaClass(d, getSla(a.award)) !== 'ok' }).length

      function submitForm() {
        setLocalAwards(prev => [...prev, {
          soldier:form.soldier, rank:form.rank, section:form.section,
          award:form.award, type:'nominated', category:form.category,
          actionPeriod:form.actionPeriod||'—', submitted:'Pending',
          dueDate:form.dueDate||'—', status:'Nomination Pending',
          actionOfficer:form.actionOfficer||'—',
        }])
        setShowModal(false)
        setForm({ soldier:'', rank:'SGT', section:'', award:'ARCOM', category:'Merit', actionPeriod:'', dueDate:'', actionOfficer:'' })
      }

      function AwardTable({ rows, showCat }: { rows: typeof AWARDS_PIPELINE; showCat?: boolean }) {
        return (
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr>
                  <th>Source</th><th>Soldier</th><th>Rank</th><th>Section</th><th>Award</th>
                  {showCat && <th>Category</th>}
                  <th>Period</th><th>Submitted</th><th>Due Date</th><th>SLA</th><th>Status</th><th>Action Officer</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={showCat ? 12 : 11} style={{ textAlign:'center', color:'#333', padding:'20px 0', fontStyle:'italic', fontSize:11 }}>No awards in this category</td></tr>
                )}
                {rows.map((a, i) => {
                  const isIppsa = a.type === 'submitted'
                  const isOverdue = a.status.startsWith('OVERDUE')
                  const isPending = a.status.includes('Pending')
                  const sc_color = isOverdue ? '#e74c3c' : isPending ? '#c9a227' : a.status === 'Under Review' ? '#9b59b6' : '#27ae60'
                  const days = daysSince(a.submitted)
                  const sla  = getSla(a.award)
                  const sc   = slaClass(days, sla)
                  const slaColor = sc === 'over' ? '#e74c3c' : sc === 'warn' ? '#e67e22' : '#27ae60'
                  return (
                    <tr key={i}>
                      <td>
                        <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3, letterSpacing:'0.5px',
                          background: isIppsa ? 'rgba(45,120,60,0.15)' : 'rgba(90,150,220,0.1)',
                          color:      isIppsa ? '#27ae60'              : '#5a9adc' }}>
                          {isIppsa ? 'IPPSA' : 'THREADS'}
                        </span>
                      </td>
                      <td style={{ fontWeight:600 }}>{a.soldier}</td>
                      <td>{a.rank}</td>
                      <td style={{ color:'#666', fontSize:11 }}>{a.section}</td>
                      <td style={{ fontWeight:700, color:'#ccc' }}>{a.award}</td>
                      {showCat && <td style={{ fontSize:10, color:'#888' }}>{a.category}</td>}
                      <td style={{ fontSize:10, color:'#555', maxWidth:160 }}>{a.actionPeriod}</td>
                      <td style={{ fontSize:10, color:'#666' }}>{a.submitted}</td>
                      <td style={{ fontSize:10, color:'#888' }}>{a.dueDate}</td>
                      <td>
                        {days > 0 ? (
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:slaColor+'22', color:slaColor }}>{days}d / {sla}d</span>
                        ) : <span style={{ fontSize:10, color:'#333' }}>—</span>}
                      </td>
                      <td>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:sc_color+'22', color:sc_color }}>{a.status}</span>
                      </td>
                      <td style={{ fontSize:11, color:'#666' }}>{a.actionOfficer}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }

      const tabBtn = (key: string, label: string, icon: string) => {
        const count = key !== 'summary' ? tabRows(key).length : undefined
        return (
          <button key={key}
            className={`${styles.tabActionBtn} ${aTab === key ? styles.tabActionActive : ''}`}
            onClick={() => setATab(key)}>
            <i className={`fas ${icon}`} />
            {label}
            {count !== undefined && (
              <span style={{ fontSize:9, marginLeft:3, padding:'1px 4px', borderRadius:2,
                background: aTab === key ? 'rgba(201,162,39,0.2)' : '#1a1a1a',
                color: aTab === key ? '#c9a227' : '#444' }}>{count}</span>
            )}
          </button>
        )
      }

      const fld = (lbl: string, node: React.ReactNode) => (
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <label style={{ fontSize:10, fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'0.5px' }}>{lbl}</label>
          {node}
        </div>
      )
      const inp = (key: keyof typeof form, ph?: string) => (
        <input value={form[key]} placeholder={ph}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:3, padding:'6px 10px', fontSize:12, color:'#ccc', outline:'none' }} />
      )
      const sel = (key: keyof typeof form, opts: string[]) => (
        <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value as AwardCategory }))}
          style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:3, padding:'6px 10px', fontSize:12, color:'#ccc', outline:'none' }}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      )

      const exportRows = (rows: typeof AWARDS_PIPELINE) => rows.map(a => {
        const d = daysSince(a.submitted)
        return [a.type === 'submitted' ? 'IPPSA' : 'THREADS', a.soldier, a.rank, a.section, a.award, a.category, a.actionPeriod, a.submitted, a.dueDate, d > 0 ? `${d}d / ${getSla(a.award)}d` : '—', a.status, a.actionOfficer]
      })

      return (
        <>
          <div className={shared.page}>
            {pageHeader}

            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:'#ccc' }}>
                  <i className="fas fa-medal" style={{ marginRight:8, color:'#c9a227' }} />Awards &amp; Decorations
                </h2>
                <div style={{ fontSize:10, color:'#444', marginTop:3 }}>
                  Source: IPPSA (submitted actions) · THREADS (uninitiated nominations) · AR 600-8-22
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className={styles.btnSecondary}
                  onClick={() => exportCSV(['Source','Soldier','Rank','Section','Award','Category','Period','Submitted','Due Date','Days/SLA','Status','Action Officer'], exportRows(allAwards), 's1-awards.csv')}>
                  <i className="fas fa-download" /> Export
                </button>
                <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
                  <i className="fas fa-plus" /> Add Award
                </button>
              </div>
            </div>

            {/* SLA banner */}
            <div style={{ padding:'7px 14px', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:4, fontSize:11, color:'#555', marginBottom:12 }}>
              <i className="fas fa-info-circle" style={{ marginRight:6, color:'#333' }} />
              <strong style={{ color:'#444' }}>SLA (AR 600-8-22): </strong>
              AAM/ARCOM ≤ 45 days · MSM ≤ 60 days · BSM ≤ 75 days · LOM ≤ 120 days ·
              <span style={{ marginLeft:6 }}>IPPSA = status from system · THREADS = not yet initiated in IPPSA</span>
            </div>

            {/* Stats */}
            <div className={shared.stats} style={{ marginBottom:12 }}>
              {[
                { label:'Total Actions',        value:String(allAwards.length),    bg:'#2d2d2d' },
                { label:'THREADS Uninitiated',  value:String(threadsRows.length),  bg:'#111d2b', border:'rgba(90,150,220,0.25)', vc:'#5a9adc' },
                { label:'IPPSA Active',         value:String(ippsaRows.length),    bg:'#0e1e13' },
                { label:'SLA At Risk',          value:String(slaRisk),             bg:slaRisk > 0 ? STATUS_COLOR.Amber : '#2d2d2d' },
                { label:'Overdue',              value:String(overdueCount),        bg:overdueCount > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              ].map(s => (
                <div key={s.label} className={shared.stat} style={{ background:s.bg, border:s.border ? `1px solid ${s.border}` : undefined }}>
                  <div className={shared.statValue} style={{ color:s.vc }}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tab bar */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:16, padding:'8px 10px', background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:5 }}>
              {AWARD_TABS.map(t => tabBtn(t.key, t.label, t.icon))}
            </div>

            {/* Summary: IPPSA / THREADS split */}
            {aTab === 'summary' && (
              <>
                <div className={shared.card} style={{ marginBottom:14 }}>
                  <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span><i className="fas fa-database" style={{ color:'#27ae60', marginRight:6 }} />IPPSA — Submitted &amp; Active</span>
                    <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:3, background:'rgba(45,120,60,0.15)', color:'#27ae60', letterSpacing:'0.5px' }}>STATUS FROM IPPSA</span>
                  </div>
                  <AwardTable rows={ippsaRows} />
                </div>
                <div className={shared.card}>
                  <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span><i className="fas fa-pen" style={{ color:'#5a9adc', marginRight:6 }} />THREADS — Nominations Not Yet in IPPSA</span>
                    <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:3, background:'rgba(90,150,220,0.1)', color:'#5a9adc', letterSpacing:'0.5px' }}>THREADS TRACKED</span>
                  </div>
                  <AwardTable rows={threadsRows} />
                </div>
              </>
            )}

            {/* Filtered category / all view */}
            {aTab !== 'summary' && (
              <div className={shared.card}>
                <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span>
                    <i className="fas fa-medal" style={{ marginRight:6 }} />
                    {aTab === 'all' ? 'All Awards' : `${aTab.charAt(0).toUpperCase() + aTab.slice(1)} Awards`}
                    <span style={{ fontSize:10, color:'#444', marginLeft:8 }}>{tabRows(aTab).length} records</span>
                  </span>
                  <button className={styles.btnSecondary}
                    onClick={() => exportCSV(['Source','Soldier','Rank','Section','Award','Category','Period','Submitted','Due Date','Days/SLA','Status','Action Officer'], exportRows(tabRows(aTab)), `s1-awards-${aTab}.csv`)}>
                    <i className="fas fa-download" /> Export
                  </button>
                </div>
                <AwardTable rows={tabRows(aTab)} showCat />
              </div>
            )}
          </div>

          {/* Add Award Modal */}
          {showModal && (
            <div className={styles.overlay} onClick={() => setShowModal(false)}>
              <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3><i className="fas fa-plus" /> Add Award Action</h3>
                  <div className={styles.modalActions}>
                    <button className={styles.btnGhost} onClick={() => setShowModal(false)}>&times;</button>
                  </div>
                </div>
                <div className={styles.modalBody}>
                  <div style={{ padding:'6px 0 12px', fontSize:11, color:'#555', borderBottom:'1px solid #1a1a1a', marginBottom:14 }}>
                    <i className="fas fa-pen" style={{ color:'#5a9adc', marginRight:6 }} />
                    Creates a <strong style={{ color:'#5a9adc' }}>THREADS</strong> nomination — not yet in IPPSA. Once initiated in IPPSA, cross-reference status will update from the system.
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {fld('Soldier Name *', inp('soldier', 'Last, First M.'))}
                    {fld('Rank', sel('rank', RANKS))}
                    {fld('Section', inp('section', 'J1, S3...'))}
                    {fld('Award', sel('award', AWARD_OPTS))}
                    {fld('Category', sel('category', CAT_OPTS))}
                    {fld('Action Officer', inp('actionOfficer', 'SFC Garza'))}
                    {fld('Period of Service', inp('actionPeriod', 'Jan 2024 – Jun 2026'))}
                    {fld('Due Date', inp('dueDate', '01 Sep 2026'))}
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
                  <button className={styles.btnPrimary} onClick={submitForm} disabled={!form.soldier.trim()}>
                    <i className="fas fa-pen" /> Add to THREADS
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )
    }
    return <AwardsPage />
  }

  // ── CASUALTY ──────────────────────────────────────────────────────────────
  if (subPage === 'casualty') {
    const casStats = [
      { label: 'Active CASREPs',  value: '—', bg: '#e74c3c'            },
      { label: 'WIA YTD',         value: '—', bg: STATUS_COLOR.Amber   },
      { label: 'KIA YTD',         value: '—', bg: '#1a1a1a'            },
      { label: 'LOD Pending',     value: '—', bg: STATUS_COLOR.Red     },
    ]
    const casrepProcedures = [
      ['Initial Report',          'Submit initial CASREP within 4 hours of incident via S1 to higher headquarters.'],
      ['Follow-up',               'Submit follow-up reports at 24, 72 hours and upon status change.'],
      ['LOD Determination',       'Initiate Line of Duty investigation per AR 600-8-4 within 30 days.'],
      ['Survivor Benefits',       'Coordinate with Finance and HRC for survivor benefit processing.'],
      ['Next of Kin Notification','NOK notification is a command responsibility coordinated through casualty liaison.'],
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',    label:'Active',     icon:'fa-heartbeat'   },
          { key:'casereps',   label:'CASREPs',    icon:'fa-file-medical'},
          { key:'lod',        label:'LOD',        icon:'fa-gavel'       },
          { key:'procedures', label:'Procedures', icon:'fa-list-ol'     },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-heartbeat" /> Casualty Operations</h2>
            </div>
            <div className={shared.stats}>
              {casStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-ambulance" /> Active CASREPs</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Date</th><th>Soldier</th><th>Rank</th><th>Casualty Type</th><th>CASREP #</th><th>Status</th><th>Reporting Officer</th></tr>
                  </thead>
                  <tbody>{placeholderRows(3, 7)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {internalTab === 'casereps' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-file-medical" /> All CASREPs</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Date</th><th>Soldier</th><th>Rank</th><th>Casualty Type</th><th>CASREP #</th><th>Status</th><th>Reporting Officer</th></tr>
                </thead>
                <tbody>{placeholderRows(3, 7)}</tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'lod' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-gavel" /> Line of Duty (LOD) Tracker</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>Incident Date</th><th>LOD Type</th><th>Status</th><th>IO Assigned</th><th>SGLI Status</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><PI /></td><td><PI /></td>
                    <td><P /></td>
                    <td><span style={{ fontSize: 11, color: '#555' }}>Combat / Training / Duty</span></td>
                    <td><P /></td><td><P /></td>
                    <td><span style={{ fontSize: 11, color: '#555' }}>Active / Pending</span></td>
                    <td><P /></td>
                  </tr>
                  {placeholderRows(2, 8)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'procedures' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-list-ol" /> CASREP Quick Procedures</div>
            <div className={shared.cardBody}>
              {casrepProcedures.map(([title, note]) => (
                <div key={title as string} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ccc', width: 200, flexShrink: 0 }}>{title as string}</span>
                  <span style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{note as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── ACTIONS (Personnel Actions) ───────────────────────────────────────────
  if (subPage === 'actions') {
    const paStats = [
      { label: 'Pending',       value: String(ADMIN_SUSPENSES.filter(a => a.status === 'Pending').length), bg: '#2d2d2d'          },
      { label: 'Completed MTD', value: '—',                                                                 bg: STATUS_COLOR.Green },
      { label: 'Overdue',       value: String(ADMIN_SUSPENSES.filter(a => a.status === 'Overdue').length), bg: STATUS_COLOR.Red   },
      { label: 'Returned',      value: '—',                                                                 bg: STATUS_COLOR.Amber },
    ]
    const payIssueRows = getSoldiersWithPayIssues()
    const payIssueTable = (
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead>
            <tr><th>Soldier</th><th>Rank</th><th>Action Type</th><th>DA Form</th><th>Section</th><th>Status</th><th>S1 POC</th></tr>
          </thead>
          <tbody>
            {payIssueRows.map((s, i) => (
              <tr key={i}>
                <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                <td>{s.rank}</td>
                <td style={{ fontSize: 11, color: '#ccc', maxWidth: 280 }}>{s.issue}</td>
                <td style={{ fontSize: 10, color: '#555' }}>(THREADS)</td>
                <td>{s.section}</td>
                <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(201,162,39,0.15)', color: '#c9a227' }}>Pending</span></td>
                <td>CPT Phillips</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',   label:'All',            icon:'fa-list'          },
          { key:'pay-issues',label:'Pay Issues',     icon:'fa-dollar-sign'   },
          { key:'in-proc',   label:'In-Processing',  icon:'fa-sign-in-alt'   },
          { key:'records',   label:'Records',        icon:'fa-id-card'       },
          { key:'other',     label:'Other',          icon:'fa-ellipsis-h'    },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-file-signature" /> Personnel Actions</h2>
            </div>
            <div className={shared.stats}>
              {paStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-tasks" /> Actions Tracker</div>
              {payIssueTable}
            </div>
          </>
        )}

        {internalTab === 'pay-issues' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Pay Issues (Source: IPPSA)</div>
            {payIssueTable}
          </div>
        )}

        {internalTab === 'in-proc' && (() => {
          const rows = ADMIN_SUSPENSES.filter(a => a.status === 'Pending')
          return rows.length === 0
            ? (
              <div className={shared.card}>
                <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555' }}>
                  <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
                  No records found for this category.
                </div>
              </div>
            )
            : (
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-sign-in-alt" /> In-Processing Actions</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead>
                      <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Action</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                      {rows.map((a, i) => (
                        <tr key={i}>
                          <td>{a.soldier}</td><td>{a.rank}</td><td>{a.section}</td>
                          <td style={{ fontWeight: 700, color: '#c9a227' }}>{a.item}</td>
                          <td style={{ fontSize: 10, color: '#888' }}>{a.dueDate}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(201,162,39,0.15)', color: '#c9a227' }}>{a.status}</span></td>
                          <td>{a.poc}</td>
                          <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{a.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
        })()}

        {internalTab === 'records' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-id-card" /> Records (Source: IPPSA)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>ETS</th><th>Pay Issues</th></tr>
                </thead>
                <tbody>
                  {IPPSA_SOLDIERS.filter(s => s.payIssues.length > 0).map(s => (
                    <tr key={s.edipi}>
                      <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                      <td>{s.rank}</td>
                      <td>{s.mos}</td>
                      <td style={{ color: daysUntil(s.ets) < 365 ? '#e74c3c' : '#888', fontSize: 10 }}>{s.ets}</td>
                      <td style={{ fontSize: 11, color: '#c9a227' }}>{s.payIssues.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'other' && (() => {
          const rows = ADMIN_SUSPENSES.filter(a => a.status === 'Overdue')
          return rows.length === 0
            ? (
              <div className={shared.card}>
                <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555' }}>
                  <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
                  No records found for this category.
                </div>
              </div>
            )
            : (
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-ellipsis-h" /> Other Overdue Actions</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead>
                      <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                      {rows.map((a, i) => (
                        <tr key={i}>
                          <td>{a.soldier}</td><td>{a.rank}</td><td>{a.section}</td>
                          <td style={{ fontWeight: 700 }}>{a.item}</td>
                          <td style={{ fontSize: 10, color: '#e74c3c' }}>{a.dueDate}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#e74c3c22', color: '#e74c3c' }}>{a.status}</span></td>
                          <td>{a.poc}</td>
                          <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{a.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
        })()}
      </div>
    )
  }

  // ── PROMOTIONS ────────────────────────────────────────────────────────────
  if (subPage === 'promotions') {
    const promoStats = [
      { label: 'TIG Eligible',   value: '—', bg: '#2d2d2d'          },
      { label: 'Points Met',     value: '—', bg: STATUS_COLOR.Green },
      { label: 'Board Ready',    value: '—', bg: '#c9a227'          },
      { label: 'Promoted MTD',   value: '—', bg: STATUS_COLOR.Green },
    ]
    const BOARD_DATES = [
      { board:'SSG Semi-centralized Board', date:'15 Sep 2026', location:'Ft. Liberty', notes:'Packets due NLT 01 Aug 2026' },
      { board:'SFC (MSG) DA Board',         date:'Oct 2026',    location:'HRC',         notes:'Primary Zone and Below Zone lists' },
      { board:'CPT/MAJ Promotion Board',    date:'Jan 2027',    location:'HRC',         notes:'File closing date TBD' },
    ]
    function promoTable(grades: string[]) {
      const rows = IPPSA_SOLDIERS.filter(s => grades.includes(s.gradeCode))
      if (rows.length === 0) return (
        <div className={shared.card}>
          <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555' }}>
            <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
            No records found for this category.
          </div>
        </div>
      )
      return (
        <div className={shared.card}>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Section</th><th>PEBD</th><th>TIG (approx)</th><th>ETS</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {rows.map(s => (
                  <tr key={s.edipi}>
                    <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                    <td>{s.rank}</td><td>{s.mos}</td><td>{s.section}</td><td>{s.pebd}</td>
                    <td style={{ color: '#c9a227', fontWeight: 600 }}>{(() => {
                      const ms = Math.round((new Date('2026-06-18').getTime() - new Date(s.pebd).getTime()) / 2592000000)
                      const yrs = Math.floor(ms / 12), mos2 = ms % 12
                      return yrs > 0 ? `${yrs}y ${mos2}m` : `${mos2}m`
                    })()}</td>
                    <td style={{ color: daysUntil(s.ets) < 365 ? '#e74c3c' : '#888' }}>{s.ets}</td>
                    <td style={{ fontSize: 10, color: '#555' }}>{s.payIssues.length > 0 ? 'Action required' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',    label:'Summary',    icon:'fa-tachometer-alt'       },
          { key:'enlisted',   label:'Enlisted',   icon:'fa-chevron-circle-up'    },
          { key:'officer',    label:'Officer',    icon:'fa-star'                 },
          { key:'warrant',    label:'Warrant',    icon:'fa-cog'                  },
          { key:'board-info', label:'Board Info', icon:'fa-clipboard-list'       },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-chevron-up" /> Promotions</h2>
            </div>
            <div className={shared.stats}>
              {promoStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card} style={{ marginBottom: 16 }}>
              <div className={shared.cardHeader}><i className="fas fa-list-ol" /> Promotion Tracker (All)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Section</th><th>PEBD</th><th>TIG (approx)</th><th>ETS</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {IPPSA_SOLDIERS.filter(s => ['E4','E5','E6','E7'].includes(s.gradeCode)).map(s => (
                      <tr key={s.edipi}>
                        <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                        <td>{s.rank}</td><td>{s.mos}</td><td>{s.section}</td><td>{s.pebd}</td>
                        <td style={{ color: '#c9a227', fontWeight: 600 }}>{(() => {
                          const ms = Math.round((new Date('2026-06-18').getTime() - new Date(s.pebd).getTime()) / 2592000000)
                          const yrs = Math.floor(ms / 12), mos2 = ms % 12
                          return yrs > 0 ? `${yrs}y ${mos2}m` : `${mos2}m`
                        })()}</td>
                        <td style={{ color: daysUntil(s.ets) < 365 ? '#e74c3c' : '#888' }}>{s.ets}</td>
                        <td style={{ fontSize: 10, color: '#555' }}>{s.payIssues.length > 0 ? 'Action required' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-link" /> Promotion Point Resources</div>
              <div className={shared.cardBody}>
                <dl className={shared.dl}>
                  <dt>PPW</dt>         <dd><span style={{ fontSize: 11, color: '#555' }}>Promotion Point Worksheet — complete at unit and forward to S1 for validation</span></dd>
                  <dt>HRC Board Info</dt><dd><span style={{ fontSize: 11, color: '#555' }}>Check HRC.army.mil for current board dates and cutoff scores</span></dd>
                  <dt>TIG/TIS Req</dt> <dd><span style={{ fontSize: 11, color: '#555' }}>Time in Grade and Time in Service requirements per AR 600-8-19</span></dd>
                </dl>
              </div>
            </div>
          </>
        )}

        {internalTab === 'enlisted' && promoTable(['E4','E5','E6','E7'])}
        {internalTab === 'officer'  && promoTable(['O3','O4'])}
        {internalTab === 'warrant'  && promoTable(['W1','W2','W3','W4','W5'])}

        {internalTab === 'board-info' && (
          <>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Upcoming Board Dates</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Board</th><th>Date</th><th>Location</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {BOARD_DATES.map((b, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: '#ccc' }}>{b.board}</td>
                        <td style={{ color: '#c9a227' }}>{b.date}</td>
                        <td style={{ fontSize: 11, color: '#888' }}>{b.location}</td>
                        <td style={{ fontSize: 11, color: '#555' }}>{b.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-link" /> Promotion Point Resources</div>
              <div className={shared.cardBody}>
                <dl className={shared.dl}>
                  <dt>PPW</dt>         <dd><span style={{ fontSize: 11, color: '#555' }}>Promotion Point Worksheet — complete at unit and forward to S1 for validation</span></dd>
                  <dt>HRC Board Info</dt><dd><span style={{ fontSize: 11, color: '#555' }}>Check HRC.army.mil for current board dates and cutoff scores</span></dd>
                  <dt>TIG/TIS Req</dt> <dd><span style={{ fontSize: 11, color: '#555' }}>Time in Grade and Time in Service requirements per AR 600-8-19</span></dd>
                </dl>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── REASSIGNMENTS ─────────────────────────────────────────────────────────
  if (subPage === 'reassignments') {
    const reassignStats = [
      { label: 'Gains 30-Day',       value: '—', bg: STATUS_COLOR.Green },
      { label: 'Losses 30-Day',      value: '—', bg: STATUS_COLOR.Red   },
      { label: 'In-Processing',      value: String(ADMIN_SUSPENSES.filter(a => a.status === 'Pending').length), bg: '#2d2d2d' },
      { label: 'Out-Processing',     value: String(getEtsDerosSoldiers().filter(s => s.daysOut <= 180).length), bg: '#2d2d2d' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',  label:'Summary',        icon:'fa-tachometer-alt'   },
          { key:'gains',    label:'Gains',          icon:'fa-arrow-circle-down'},
          { key:'losses',   label:'Losses',         icon:'fa-arrow-circle-up'  },
          { key:'in-proc',  label:'In-Processing',  icon:'fa-sign-in-alt'      },
          { key:'out-proc', label:'Out-Processing', icon:'fa-sign-out-alt'     },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-exchange-alt" /> Reassignments</h2>
            </div>
            <div className={shared.stats}>
              {reassignStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card} style={{ marginBottom: 16 }}>
              <div className={shared.cardHeader}><i className="fas fa-arrow-down" /> Gains</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Losing Unit</th><th>Report Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>{placeholderRows(3, 6)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-arrow-up" /> Losses</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Gaining Unit</th><th>DEROS/ETS</th><th>Type</th><th>Status</th></tr>
                  </thead>
                  <tbody>{placeholderRows(3, 7)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {internalTab === 'gains' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-arrow-circle-down" /> Gains (Incoming Soldiers)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Losing Unit</th><th>Report Date</th><th>Status</th></tr>
                </thead>
                <tbody>{placeholderRows(3, 6)}</tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'losses' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-arrow-circle-up" /> Losses (Outgoing Soldiers)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Gaining Unit</th><th>DEROS/ETS</th><th>Type</th><th>Status</th></tr>
                </thead>
                <tbody>{placeholderRows(3, 7)}</tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'in-proc' && (() => {
          const rows = ADMIN_SUSPENSES.filter(a => a.status === 'Pending')
          return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-sign-in-alt" /> In-Processing Actions</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Action</th><th>Due Date</th><th>Status</th><th>POC</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((a, i) => (
                      <tr key={i}>
                        <td>{a.soldier}</td><td>{a.rank}</td><td>{a.section}</td>
                        <td style={{ fontWeight: 700, color: '#c9a227' }}>{a.item}</td>
                        <td style={{ fontSize: 10, color: '#888' }}>{a.dueDate}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(201,162,39,0.15)', color: '#c9a227' }}>{a.status}</span></td>
                        <td>{a.poc}</td>
                      </tr>
                    ))}
                    {rows.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#555', fontStyle: 'italic' }}>No pending in-processing actions</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}

        {internalTab === 'out-proc' && (() => {
          const rows = getEtsDerosSoldiers().filter(s => s.daysOut <= 180)
          return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-sign-out-alt" /> Out-Processing (within 180 days)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Section</th><th>ETS</th><th>Days Out</th><th>Window</th></tr>
                  </thead>
                  <tbody>
                    {rows.map(s => {
                      const flag = etsFlag(s.daysOut)
                      const color = flag === 'critical' ? '#e74c3c' : flag === 'warning' ? '#e67e22' : '#27ae60'
                      return (
                        <tr key={s.edipi}>
                          <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                          <td>{s.rank}</td><td>{s.mos}</td><td>{s.section}</td><td>{s.ets}</td>
                          <td style={{ fontWeight: 700, color }}>{s.daysOut}d</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{s.daysOut <= 30 ? '30-DAY' : s.daysOut <= 60 ? '60-DAY' : s.daysOut <= 90 ? '90-DAY' : '180-DAY'}</span></td>
                        </tr>
                      )
                    })}
                    {rows.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#555', fontStyle: 'italic' }}>No soldiers in 180-day out-processing window</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  // ── LEAVE ─────────────────────────────────────────────────────────────────
  if (subPage === 'leave') {
    const leaveStats = [
      { label: 'Currently on Leave', value: String(LEAVE_RECORDS.filter(l => l.status === 'Approved').length),  bg: '#2d2d2d'          },
      { label: 'Requests Pending',   value: '—',                                                                  bg: STATUS_COLOR.Amber },
      { label: 'Use/Lose Risk',      value: '—',                                                                  bg: STATUS_COLOR.Red   },
      { label: 'Avg Days Used',      value: LEAVE_RECORDS.filter(l => l.days > 0).length > 0
          ? String(Math.round(LEAVE_RECORDS.filter(l => l.days > 0).reduce((sum, l) => sum + l.days, 0) / LEAVE_RECORDS.filter(l => l.days > 0).length))
          : '—',                                                                                                   bg: '#2d2d2d'          },
    ]
    function leaveTable(rows: typeof LEAVE_RECORDS) {
      return rows.length === 0
        ? (
          <div className={shared.card}>
            <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555' }}>
              <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
              No records found for this category.
            </div>
          </div>
        )
        : (
          <div className={shared.card}>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>Leave Type</th><th>Start</th><th>End</th><th>Days</th><th>Balance</th><th>Status</th><th>Approver</th></tr>
                </thead>
                <tbody>
                  {rows.map((l, i) => (
                    <tr key={i}>
                      <td>{l.soldier}</td><td>{l.rank}</td><td>{l.type}</td>
                      <td>{l.start}</td><td>{l.end}</td>
                      <td>{l.days > 0 ? l.days : '—'}</td>
                      <td style={{ color: '#c9a227', fontWeight: 600 }}>{l.balance}d</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: l.status === 'Approved' ? 'rgba(45,106,79,0.2)' : l.status === 'Returned' ? '#1a1a1a' : 'rgba(201,162,39,0.15)', color: l.status === 'Approved' ? '#27ae60' : l.status === 'Returned' ? '#555' : '#c9a227' }}>{l.status}</span></td>
                      <td>{l.approver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
    }
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',   label:'All',       icon:'fa-list'                },
          { key:'annual',    label:'Annual',    icon:'fa-sun'                 },
          { key:'emergency', label:'Emergency', icon:'fa-ambulance'           },
          { key:'ptdy',      label:'PTDY',      icon:'fa-briefcase'           },
          { key:'rr',        label:'R&R',       icon:'fa-plane'               },
          { key:'use-lose',  label:'Use-Lose',  icon:'fa-exclamation-triangle'},
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-umbrella-beach" /> Leave Management</h2>
            </div>
            <div className={shared.stats}>
              {leaveStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><i className="fas fa-calendar-alt" /> Leave Roster</span>
                <button className={styles.btnSecondary} onClick={() => exportCSV(['Soldier','Rank','Leave Type','Start','End','Days','Balance','Status','Approver'], LEAVE_RECORDS.map(l => [l.soldier,l.rank,l.type,l.start,l.end,String(l.days),String(l.balance),l.status,l.approver]), 's1-leave.csv')}>
                  <i className="fas fa-download" /> Export CSV
                </button>
              </div>
              {leaveTable(LEAVE_RECORDS)}
            </div>
          </>
        )}

        {internalTab === 'annual'    && leaveTable(LEAVE_RECORDS.filter(l => l.type === 'Annual Leave'))}
        {internalTab === 'emergency' && leaveTable(LEAVE_RECORDS.filter(l => l.type === 'Emergency Leave'))}
        {internalTab === 'ptdy'      && leaveTable(LEAVE_RECORDS.filter(l => l.type.includes('PTDY')))}
        {internalTab === 'rr'        && leaveTable(LEAVE_RECORDS.filter(l => l.type.includes('R&R')))}

        {internalTab === 'use-lose' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-exclamation-triangle" /> Use-or-Lose Risk Tracker</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>ETS</th><th>Est. Use-or-Lose Days</th><th>Risk</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {IPPSA_SOLDIERS.slice(0, 5).map(s => (
                    <tr key={s.edipi}>
                      <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                      <td>{s.rank}</td>
                      <td style={{ fontSize: 10, color: '#888' }}>{s.ets}</td>
                      <td style={{ color: '#555', fontStyle: 'italic', fontSize: 11 }}>—</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#1a1a1a', color: '#555' }}>TBD</span></td>
                      <td style={{ fontSize: 11, color: '#555' }}>Review leave balance</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── EVALUATION (ORB / ERB / OER / NCOER) ────────────────────────────────
  if (subPage === 'evaluation') {
    const OER_RECORDS = [
      { soldier:'Phillips, Sarah T.', rank:'CPT', mos:'42B', period:'15 Jan 2026 – 14 Jan 2027', seniorRater:'MAJ Ortega', status:'Open', notes:'Support form signed' },
    ]
    const NCOER_RECORDS = [
      { soldier:'Garza, Roberto M.', rank:'SFC', mos:'42A', period:'01 Jun 2025 – 31 May 2026', rater:'CPT Phillips', status:'Pending Rating', notes:'Annual NCOER due Jul 2026' },
      { soldier:'Bynum, Keisha A.',  rank:'SGT', mos:'42A', period:'01 Mar 2026 – 28 Feb 2027', rater:'SFC Garza',    status:'Open',           notes:'Initial period — new gain' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',    label:'Summary',        icon:'fa-tachometer-alt' },
          { key:'oer',        label:'OER',            icon:'fa-star'           },
          { key:'ncoer',      label:'NCOER',          icon:'fa-chevron-up'     },
          { key:'due-cycle',  label:'Due This Cycle', icon:'fa-clock'          },
          { key:'completed',  label:'Completed',      icon:'fa-check-circle'   },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-id-card-alt" /> Evaluation Management</h2>
            </div>
            <div style={{ padding: '10px 14px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 5, fontSize: 11, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>
              <i className="fas fa-info-circle" style={{ marginRight: 6, color: '#555' }} />
              Officer Record Briefs (ORB) and Enlisted Record Briefs (ERB) must be reviewed and updated at least semi-annually.
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-user" /> Record Brief Status</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Brief Type</th><th>Last DA Photo</th><th>Last Updated</th><th>OMPF Status</th><th>Issues</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {[0,1,2,3].map(i => (
                      <tr key={i}>
                        <td><PI /></td><td><PI /></td><td><PI /></td>
                        <td><span style={{ fontSize: 11, color: '#555' }}>ORB / ERB</span></td>
                        <td><P /></td><td><P /></td>
                        <td><span style={{ fontSize: 11, color: '#555' }}>Current / Needs Update / Pending Scan</span></td>
                        <td><span style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>—</span></td>
                        <td><button className={styles.btnDetail}>Review</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {internalTab === 'oer' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-star" /> OER Tracker (Officer Evaluation Reports)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Rating Period</th><th>Senior Rater</th><th>Status</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {OER_RECORDS.map((r, i) => {
                    const color = r.status === 'Open' ? '#c9a227' : r.status === 'Completed' ? '#27ae60' : '#888'
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{r.soldier}</td>
                        <td>{r.rank}</td><td>{r.mos}</td>
                        <td style={{ fontSize: 10, color: '#888' }}>{r.period}</td>
                        <td style={{ fontSize: 11, color: '#666' }}>{r.seniorRater}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{r.status}</span></td>
                        <td style={{ fontSize: 11, color: '#555' }}>{r.notes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'ncoer' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-chevron-up" /> NCOER Tracker (NCO Evaluation Reports)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Rating Period</th><th>Rater</th><th>Status</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {NCOER_RECORDS.map((r, i) => {
                    const color = r.status === 'Open' ? '#c9a227' : r.status.includes('Pending') ? '#e67e22' : r.status === 'Completed' ? '#27ae60' : '#888'
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{r.soldier}</td>
                        <td>{r.rank}</td><td>{r.mos}</td>
                        <td style={{ fontSize: 10, color: '#888' }}>{r.period}</td>
                        <td style={{ fontSize: 11, color: '#666' }}>{r.rater}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{r.status}</span></td>
                        <td style={{ fontSize: 11, color: '#555' }}>{r.notes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'due-cycle' && (() => {
          const allEvals = [
            ...OER_RECORDS.filter(r => r.status !== 'Completed').map(r => ({ soldier: r.soldier, type: 'OER', rank: r.rank, period: r.period, status: r.status })),
            ...NCOER_RECORDS.filter(r => r.status !== 'Completed').map(r => ({ soldier: r.soldier, type: 'NCOER', rank: r.rank, period: r.period, status: r.status })),
          ]
          return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-clock" /> Due This Cycle</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead>
                    <tr><th>Soldier</th><th>Type</th><th>Rank</th><th>Period End</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {allEvals.map((r, i) => {
                      const color = r.status === 'Open' ? '#c9a227' : r.status.includes('Pending') ? '#e67e22' : '#888'
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{r.soldier}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: r.type === 'OER' ? 'rgba(90,150,220,0.1)' : 'rgba(45,106,79,0.15)', color: r.type === 'OER' ? '#5a9adc' : '#27ae60' }}>{r.type}</span></td>
                          <td>{r.rank}</td>
                          <td style={{ fontSize: 10, color: '#888' }}>{r.period.split('–')[1]?.trim() ?? '—'}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: color + '22', color }}>{r.status}</span></td>
                        </tr>
                      )
                    })}
                    {allEvals.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#555', fontStyle: 'italic' }}>No evaluations due this cycle</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}

        {internalTab === 'completed' && (
          <div className={shared.card}>
            <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555' }}>
              <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
              No completed evaluations on record yet.
            </div>
          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN SUB-PAGES (0–9)
  // ══════════════════════════════════════════════════════════════════════════

  // ── ADM-PEOPLE (0) ────────────────────────────────────────────────────────
  if (subPage === 'adm-people') {
    const admStats = [
      { label: 'Assigned',       value: String(seedTotal),                bg: '#2d2d2d'          },
      { label: 'Gains 30-Day',   value: '—',                              bg: STATUS_COLOR.Green },
      { label: 'Losses 30-Day',  value: '—',                              bg: STATUS_COLOR.Red   },
      { label: 'Non-Deployable', value: '—',                              bg: STATUS_COLOR.Amber },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <div style={{ padding: '6px 10px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 4, fontSize: 11, color: '#444', marginBottom: 12 }}>
          <i className="fas fa-link" style={{ marginRight: 6 }} />
          Links to Portfolio · People
        </div>

        <div className={shared.stats}>
          {admStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-address-book" /> S1 Shop Roster (Source: IPPSA)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Grade</th><th>Name</th><th>MOS</th><th>Position</th><th>Med</th><th>AFT</th><th>Admin Flags</th><th>ETS</th></tr>
              </thead>
              <tbody>
                {S1_SECTION_SOLDIERS.map(s => {
                  const med  = getMedStatus(s.edipi)
                  const dtms = getDtmsRecord(s.edipi)
                  const flags = ADMIN_SUSPENSES.filter(a => a.soldier.startsWith(s.lastName)).length
                  return (
                    <tr key={s.edipi}>
                      <td style={{ fontWeight: 700 }}>{s.gradeCode}</td>
                      <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                      <td>{s.mos}</td>
                      <td>{s.positionTitle}</td>
                      <td>
                        <span className={shared.dot} style={{ background: STATUS_COLOR[med?.medStatus ?? ''] ?? '#555' }} />
                        {med?.medStatus ?? '—'}
                      </td>
                      <td style={{ color: dtms?.aftScore ?? 0 > 0 ? '#2d6a4f' : '#555' }}>
                        {dtms ? (dtms.aftScore > 0 ? `${dtms.aftScore}` : dtms.aftStatus) : '—'}
                      </td>
                      <td>
                        {flags > 0
                          ? <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(192,57,43,0.2)', color: '#e74c3c' }}>{flags} overdue</span>
                          : <span style={{ color: '#555', fontSize: 11 }}>—</span>
                        }
                      </td>
                      <td style={{ color: daysUntil(s.ets) < 180 ? '#e74c3c' : '#888', fontSize: 11 }}>{s.ets}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  if (adminSubTab === 'roster') return (
    <div className={shared.card}>
      <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span><i className="fas fa-address-book" /> Full Unit Roster (Source: IPPSA)</span>
        <span style={{ fontSize:10, color:'#444' }}>{IPPSA_SOLDIERS.length} assigned</span>
      </div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Grade</th><th>Name</th><th>MOS</th><th>Position</th><th>Section</th><th>Med</th><th>AFT</th><th>ETS</th><th>Pay Issues</th></tr></thead>
          <tbody>
            {IPPSA_SOLDIERS.map(s => {
              const med = getMedStatus(s.edipi)
              const dtms = getDtmsRecord(s.edipi)
              const medC = STATUS_COLOR[med?.medStatus ?? ''] ?? '#555'
              return (
                <tr key={s.edipi}>
                  <td style={{ fontWeight:700 }}>{s.gradeCode}</td>
                  <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                  <td style={{ fontSize:10, color:'#666' }}>{s.mos}</td>
                  <td style={{ fontSize:11 }}>{s.positionTitle}</td>
                  <td style={{ fontSize:11, color:'#666' }}>{s.section}</td>
                  <td><span className={shared.dot} style={{ background:medC }} />{med?.medStatus ?? '—'}</td>
                  <td style={{ color:dtms && dtms.aftScore > 0 ? '#27ae60' : '#555' }}>{dtms ? (dtms.aftScore > 0 ? String(dtms.aftScore) : dtms.aftStatus) : '—'}</td>
                  <td style={{ fontSize:10, color: daysUntil(s.ets) < 180 ? '#e74c3c' : '#888' }}>{s.ets}</td>
                  <td>{s.payIssues.length > 0 ? <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(192,57,43,0.15)', color:'#e74c3c' }}>{s.payIssues.length}</span> : <span style={{ color:'#333', fontSize:11 }}>—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'counseling') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Counseling Records (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Soldier</th><th>Rank</th><th>Date</th><th>Type</th><th>Counselor</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {COUNSELING_RECORDS.map((c, i) => (
              <tr key={i}>
                <td style={{ fontWeight:600 }}>{c.soldier}</td>
                <td>{c.rank}</td>
                <td style={{ fontSize:10, color:'#666' }}>{c.date}</td>
                <td style={{ fontSize:11 }}>{c.type}</td>
                <td style={{ fontSize:11, color:'#666' }}>{c.counselor}</td>
                <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background: c.status.includes('Pending') ? 'rgba(201,162,39,0.15)' : 'rgba(45,106,79,0.15)', color: c.status.includes('Pending') ? '#c9a227' : '#27ae60' }}>{c.status}</span></td>
                <td style={{ fontSize:11, color:'#555', maxWidth:220 }}>{c.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'in-proc') {
    const inProcSoldiers = ADMIN_SUSPENSES.filter(a => a.status === 'Pending')
    return (
      <div className={shared.card}>
        <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span><i className="fas fa-sign-in-alt" /> In-Processing Actions (Source: THREADS + IPPSA)</span>
          <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:3, background:'rgba(90,150,220,0.1)', color:'#5a9adc' }}>{inProcSoldiers.length} OPEN</span>
        </div>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead><tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Action</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
            <tbody>
              {inProcSoldiers.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{a.soldier}</td>
                  <td>{a.rank}</td>
                  <td style={{ color:'#666', fontSize:11 }}>{a.section}</td>
                  <td style={{ fontWeight:700, color:'#c9a227' }}>{a.item}</td>
                  <td style={{ fontSize:10, color:'#888' }}>{a.dueDate}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(201,162,39,0.15)', color:'#c9a227' }}>{a.status}</span></td>
                  <td style={{ fontSize:11, color:'#666' }}>{a.poc}</td>
                  <td style={{ fontSize:11, color:'#555', maxWidth:220 }}>{a.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  if (adminSubTab === 'out-proc') {
    const etsSoldiers = getEtsDerosSoldiers()
    return (
      <div className={shared.card}>
        <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span><i className="fas fa-sign-out-alt" /> Out-Processing / ETS-DEROS Tracker (Source: IPPSA)</span>
          <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:3, background:'rgba(192,57,43,0.12)', color:'#e74c3c' }}>{etsSoldiers.filter(s => s.daysOut <= 90).length} WITHIN 90 DAYS</span>
        </div>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead><tr><th>Soldier</th><th>Rank</th><th>Section</th><th>MOS</th><th>ETS</th><th>Days Out</th><th>Window</th><th>Action</th></tr></thead>
            <tbody>
              {etsSoldiers.map(s => {
                const flag = etsFlag(s.daysOut)
                const flagColor = flag === 'critical' ? '#e74c3c' : flag === 'warning' ? '#e67e22' : '#27ae60'
                return (
                  <tr key={s.edipi}>
                    <td style={{ fontWeight:600 }}>{s.lastName}, {s.firstName.charAt(0)}.</td>
                    <td>{s.rank}</td>
                    <td style={{ color:'#666', fontSize:11 }}>{s.section}</td>
                    <td style={{ fontSize:10, color:'#555' }}>{s.mos}</td>
                    <td style={{ color: flagColor, fontWeight:700 }}>{s.ets}</td>
                    <td><span style={{ fontSize:11, fontWeight:800, color:flagColor }}>{s.daysOut}d</span></td>
                    <td><span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${flagColor}22`, color:flagColor }}>{s.daysOut <= 30 ? '30-DAY' : s.daysOut <= 60 ? '60-DAY' : s.daysOut <= 90 ? '90-DAY' : '180-DAY'}</span></td>
                    <td style={{ fontSize:11, color:'#555' }}>{s.daysOut <= 90 ? 'TAP / Out-proc checklist' : s.daysOut <= 180 ? 'Retention counseling due' : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  if (adminSubTab === 'awards') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-medal" /> Awards Pipeline (Source: IPPSA + THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Source</th><th>Soldier</th><th>Rank</th><th>Award</th><th>Category</th><th>Submitted</th><th>Due</th><th>Status</th><th>AO</th></tr></thead>
          <tbody>
            {AWARDS_PIPELINE.map((a, i) => {
              const isIppsa = a.type === 'submitted'
              const isOverdue = a.status.startsWith('OVERDUE')
              const sc = isOverdue ? '#e74c3c' : a.status.includes('Pending') ? '#c9a227' : '#27ae60'
              return (
                <tr key={i}>
                  <td><span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3, background: isIppsa ? 'rgba(45,120,60,0.15)' : 'rgba(90,150,220,0.1)', color: isIppsa ? '#27ae60' : '#5a9adc' }}>{isIppsa ? 'IPPSA' : 'THREADS'}</span></td>
                  <td style={{ fontWeight:600 }}>{a.soldier}</td>
                  <td>{a.rank}</td>
                  <td style={{ fontWeight:700, color:'#ccc' }}>{a.award}</td>
                  <td style={{ fontSize:10, color:'#888' }}>{a.category}</td>
                  <td style={{ fontSize:10, color:'#666' }}>{a.submitted}</td>
                  <td style={{ fontSize:10, color:'#888' }}>{a.dueDate}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{a.status}</span></td>
                  <td style={{ fontSize:11, color:'#666' }}>{a.actionOfficer}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'promotions') {
    const promoList = IPPSA_SOLDIERS.filter(s => ['E5','E6','E7','E8','O3','O4'].includes(s.gradeCode))
    return (
      <div className={shared.card}>
        <div className={shared.cardHeader}><i className="fas fa-arrow-circle-up" /> Promotion Eligibility (Source: IPPSA)</div>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead><tr><th>Soldier</th><th>Grade</th><th>Section</th><th>MOS</th><th>PEBD</th><th>TIG (months)</th><th>Min TIG Req</th><th>Board Eligible</th></tr></thead>
            <tbody>
              {promoList.map(s => {
                const pebd = new Date(s.pebd)
                const now = new Date('2026-06-18')
                const tigMonths = Math.floor((now.getTime() - pebd.getTime()) / (30.44 * 86400000))
                const minTig = PROMO_TIG_MONTHS[s.gradeCode] ?? 0
                const eligible = tigMonths >= minTig
                return (
                  <tr key={s.edipi}>
                    <td style={{ fontWeight:600 }}>{s.lastName}, {s.firstName.charAt(0)}.</td>
                    <td style={{ fontWeight:700 }}>{s.gradeCode}</td>
                    <td style={{ fontSize:11, color:'#666' }}>{s.section}</td>
                    <td style={{ fontSize:10, color:'#555' }}>{s.mos}</td>
                    <td style={{ fontSize:10, color:'#555' }}>{s.pebd}</td>
                    <td style={{ fontWeight:700, color: eligible ? '#27ae60' : '#888' }}>{tigMonths}m</td>
                    <td style={{ fontSize:11, color:'#555' }}>{minTig}m</td>
                    <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background: eligible ? 'rgba(45,106,79,0.2)' : '#1a1a1a', color: eligible ? '#27ae60' : '#444' }}>{eligible ? 'Eligible' : 'Not Yet'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  if (adminSubTab === 'leave') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-calendar-check" /> Leave Roster (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Soldier</th><th>Rank</th><th>Leave Type</th><th>Start</th><th>End</th><th>Days Charged</th><th>Leave Balance</th><th>Status</th><th>Approver</th></tr></thead>
          <tbody>
            {LEAVE_RECORDS.map((l, i) => (
              <tr key={i}>
                <td style={{ fontWeight:600 }}>{l.soldier}</td>
                <td>{l.rank}</td>
                <td style={{ fontSize:11 }}>{l.type}</td>
                <td style={{ fontSize:10, color:'#888' }}>{l.start}</td>
                <td style={{ fontSize:10, color:'#888' }}>{l.end}</td>
                <td style={{ textAlign:'center', color: l.days > 0 ? '#ccc' : '#555' }}>{l.days > 0 ? l.days : '—'}</td>
                <td style={{ color:'#c9a227', fontWeight:600 }}>{l.balance}d</td>
                <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background: l.status === 'Approved' ? 'rgba(45,106,79,0.2)' : l.status === 'Returned' ? '#1a1a1a' : 'rgba(201,162,39,0.15)', color: l.status === 'Approved' ? '#27ae60' : l.status === 'Returned' ? '#555' : '#c9a227' }}>{l.status}</span></td>
                <td style={{ fontSize:11, color:'#666' }}>{l.approver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  return null
})()}
      </div>
    )
  }

  // ── PAY ───────────────────────────────────────────────────────────────────
  if (subPage === 'pay') {
    const payStats = [
      { label: 'Pay Discrepancies', value: String(getSoldiersWithPayIssues().length), bg: STATUS_COLOR.Red   },
      { label: 'DTS Trips Open',    value: String(DTS_TRAVEL.filter(t => t.voucherStatus.includes('Pending') || t.voucherStatus.includes('Authorization')).length), bg: STATUS_COLOR.Amber },
      { label: 'Allotments Active', value: String(getAllAllotments().length),          bg: '#2d2d2d'          },
      { label: 'Resolved MTD',      value: '—',                                        bg: STATUS_COLOR.Green },
    ]
    const discrepanciesTable = (
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead>
            <tr><th>Soldier</th><th>Rank</th><th>Issue Type</th><th>Date Identified</th><th>Finance POC</th><th>Status</th><th>Resolved</th></tr>
          </thead>
          <tbody>
            {getSoldiersWithPayIssues().map((s, i) => (
              <tr key={i}>
                <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                <td>{s.rank}</td>
                <td style={{ fontSize: 11, color: '#ccc', maxWidth: 260 }}>{s.issue}</td>
                <td>18 Jun 2026</td>
                <td>CPT Phillips / Finance</td>
                <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(201,162,39,0.15)', color: '#c9a227' }}>Pending</span></td>
                <td>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    const dtsTable = (
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead>
            <tr><th>Auth #</th><th>Soldier</th><th>Purpose</th><th>Departure</th><th>Return</th><th>Est. Cost</th><th>Status</th></tr>
          </thead>
          <tbody>
            {DTS_TRAVEL.map((t, i) => {
              const isPending = t.voucherStatus.includes('Pending') || t.voucherStatus.includes('Authorization')
              const isDone = t.voucherStatus.includes('Approved') && !t.voucherStatus.includes('Pending')
              const statusColor = isDone ? '#27ae60' : isPending ? '#c9a227' : '#888'
              return (
                <tr key={i}>
                  <td style={{ fontSize: 10, color: '#555' }}>{t.authNumber}</td>
                  <td>{t.rank} {t.travelerName}</td>
                  <td style={{ fontSize: 11, maxWidth: 200 }}>{t.purpose}</td>
                  <td>{t.departure}</td>
                  <td>{t.returnDate}</td>
                  <td style={{ color: '#c9a227' }}>{t.estimatedCost > 0 ? `$${t.estimatedCost.toLocaleString()}` : '—'}</td>
                  <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statusColor + '22', color: statusColor }}>{t.voucherStatus}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
    const allotmentsTable = (
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead>
            <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Allotment Type</th><th>Monthly Amount</th><th>ETS</th></tr>
          </thead>
          <tbody>
            {getAllAllotments().map((a, i) => (
              <tr key={i}>
                <td>{a.soldier}</td><td>{a.rank}</td><td>{a.section}</td>
                <td>{a.allotmentType}</td>
                <td style={{ color: '#c9a227', fontWeight: 600 }}>${a.amount.toFixed(2)}</td>
                <td style={{ fontSize: 10, color: '#555' }}>{a.ets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar([
          { key:'summary',        label:'Summary',        icon:'fa-tachometer-alt'     },
          { key:'discrepancies',  label:'Discrepancies',  icon:'fa-exclamation-circle' },
          { key:'allotments',     label:'Allotments',     icon:'fa-list-ol'            },
          { key:'dts',            label:'DTS',            icon:'fa-plane'              },
          { key:'gtcc',           label:'GTCC',           icon:'fa-credit-card'        },
        ])}

        {internalTab === 'summary' && (
          <>
            <div className={shared.header}>
              <h2><i className="fas fa-dollar-sign" /> Pay Management</h2>
              <span className={shared.sub}>Finance coordination · DTS · pay actions · allotments</span>
            </div>
            <div className={shared.stats}>
              {payStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><i className="fas fa-exclamation-circle" /> Pay Discrepancies</span>
                <button className={styles.btnSecondary}><i className="fas fa-download" /> Export CSV</button>
              </div>
              {discrepanciesTable}
            </div>
            <div className={shared.grid2}>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-plane" /> DTS / Travel (Source: DTS)</div>
                {dtsTable}
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-credit-card" /> GTCC Status</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead>
                      <tr><th>Soldier</th><th>Card (last 4)</th><th>Status</th><th>Balance</th><th>Issues</th></tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan={5} style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', padding: '14px 0' }}>GTCC data — THREADS DB input required</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-list-ol" /> Allotments (Source: IPPSA)</div>
              {allotmentsTable}
            </div>
          </>
        )}

        {internalTab === 'discrepancies' && (
          <div className={shared.card}>
            <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><i className="fas fa-exclamation-circle" /> Pay Discrepancies (Source: IPPSA)</span>
              <button className={styles.btnSecondary}><i className="fas fa-download" /> Export CSV</button>
            </div>
            {discrepanciesTable}
          </div>
        )}

        {internalTab === 'allotments' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-list-ol" /> Allotments (Source: IPPSA)</div>
            {allotmentsTable}
          </div>
        )}

        {internalTab === 'dts' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-plane" /> DTS / Travel (Source: DTS)</div>
            {dtsTable}
          </div>
        )}

        {internalTab === 'gtcc' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-credit-card" /> GTCC Status</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Soldier</th><th>Card (last 4)</th><th>Status</th><th>Balance</th><th>Issues</th></tr>
                </thead>
                <tbody>
                  <tr><td colSpan={5} style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', padding: '14px 0' }}>GTCC data — THREADS DB input required</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── ADM-TASKS (1) ─────────────────────────────────────────────────────────
  if (subPage === 'adm-tasks') {
    const taskStats = [
      { label: 'Open',          value: '—', bg: '#2d2d2d'          },
      { label: 'Due This Week', value: '—', bg: STATUS_COLOR.Amber },
      { label: 'Overdue',       value: '—', bg: STATUS_COLOR.Red   },
      { label: 'Completed MTD', value: '—', bg: STATUS_COLOR.Green },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <div className={shared.header}>
          <h2><i className="fas fa-tasks" /> 1 — Tasks</h2>
        </div>

        <div className={shared.stats}>
          {taskStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-clipboard-check" /> Shop Tasks</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Task</th><th>Category</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {[0,1,2,3].map(i => (
                  <tr key={i}>
                    <td><P /></td>
                    <td><span style={{ fontSize: 11, color: '#555' }}>Admin / Awards / Leave / Reports / Training / Personnel Action</span></td>
                    <td><P /></td><td><P /></td><td><P /></td><td><P /></td><td><P /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  const filterFn = (t: typeof SHOP_TASKS[0]) => {
    if (adminSubTab === 'all-tasks') return true
    if (adminSubTab === 'my-tasks') return t.assignedTo === 'SFC Garza'
    if (adminSubTab === 'priority') return ['Critical','High'].includes(t.priority)
    if (adminSubTab === 'completed') return t.status === 'Completed'
    if (adminSubTab === 'new-task') return false
    return true
  }
  if (adminSubTab === 'new-task') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-plus" /> New Task</div>
      <div className={shared.cardBody} style={{ padding:'24px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['Task Description','text'],['Category','select:Admin,Awards,Leave,Reports,Training,Personnel Action,Security,Retention,Reporting'],['Assigned To','text'],['Priority','select:Critical,High,Medium,Routine'],['Due Date','text'],['Notes','text']].map(([lbl, tp]) => (
            <div key={String(lbl)} style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <label style={{ fontSize:10, fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'0.5px' }}>{lbl}</label>
              {String(tp).startsWith('select:') ? (
                <select style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:3, padding:'6px 10px', fontSize:12, color:'#ccc', outline:'none' }}>
                  {String(tp).slice(7).split(',').map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:3, padding:'6px 10px', fontSize:12, color:'#ccc', outline:'none' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button className={styles.btnPrimary}><i className="fas fa-plus" /> Create Task</button>
        </div>
      </div>
    </div>
  )
  const rows = SHOP_TASKS.filter(filterFn)
  return (
    <div className={shared.card}>
      <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span><i className="fas fa-list" /> {adminSubTab === 'all-tasks' ? 'All Tasks' : adminSubTab === 'my-tasks' ? 'My Tasks' : adminSubTab === 'priority' ? 'Priority Tasks' : 'Completed'}</span>
        <span style={{ fontSize:10, color:'#444' }}>{rows.length} tasks</span>
      </div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>ID</th><th>Task</th><th>Category</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center', color:'#333', padding:'20px 0', fontStyle:'italic', fontSize:11 }}>No tasks in this view</td></tr>}
            {rows.map((t, i) => {
              const priColor = t.priority === 'Critical' ? '#e74c3c' : t.priority === 'High' ? '#e67e22' : t.priority === 'Medium' ? '#c9a227' : '#27ae60'
              const stColor = t.status === 'Completed' ? '#27ae60' : t.status === 'In Progress' ? '#c9a227' : t.status === 'Open' ? '#e67e22' : '#555'
              return (
                <tr key={i}>
                  <td style={{ fontSize:10, color:'#444', fontFamily:'monospace' }}>{t.id}</td>
                  <td style={{ fontWeight:600, color:'#ccc', maxWidth:200 }}>{t.task}</td>
                  <td style={{ fontSize:10, color:'#666' }}>{t.category}</td>
                  <td style={{ fontSize:11, color:'#888' }}>{t.assignedTo}</td>
                  <td><span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${priColor}22`, color:priColor }}>{t.priority}</span></td>
                  <td style={{ fontSize:10, color:'#888' }}>{t.dueDate}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${stColor}22`, color:stColor }}>{t.status}</span></td>
                  <td style={{ fontSize:11, color:'#555', maxWidth:180 }}>{t.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})()}
      </div>
    )
  }

  // ── ADM-SECURITY (2) ──────────────────────────────────────────────────────
  if (subPage === 'adm-security') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <div className={shared.header}>
          <h2><i className="fas fa-shield-alt" /> 2 — Security</h2>
        </div>

        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Personnel Security (Source: DISS)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Soldier</th><th>Clearance</th><th>Investigation</th><th>Adjudicated</th><th>PR Due</th><th>Indoc</th><th>Status</th></tr>
              </thead>
              <tbody>
                {DISS_SUBJECTS.map((d, i) => {
                  const isOverdue  = d.prStatus.startsWith('OVERDUE')
                  const isExpiring = d.prStatus.startsWith('EXPIRING')
                  const statusColor = isOverdue ? '#e74c3c' : isExpiring ? '#e67e22' : '#27ae60'
                  return (
                    <tr key={i}>
                      <td>{d.rank} {d.lastName}, {d.firstName.charAt(0)}.</td>
                      <td style={{ fontWeight: 700, color: '#c9a227' }}>{d.eligibilityLevel}</td>
                      <td style={{ fontSize: 10 }}>{d.investigationType}</td>
                      <td style={{ fontSize: 10 }}>{d.adjudicationDate}</td>
                      <td style={{ color: isOverdue || isExpiring ? statusColor : '#888', fontSize: 11 }}>{d.prDueDate}</td>
                      <td style={{ fontSize: 10 }}>{d.indocDate}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statusColor + '22', color: statusColor }}>
                          {isOverdue ? 'OVERDUE' : isExpiring ? 'EXPIRING' : 'Current'}
                        </span>
                        {d.derogInfo && <span style={{ fontSize: 9, marginLeft: 5, color: '#e74c3c' }}>⚠ Derog</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-eye-slash" /> OPSEC Reminders</div>
          <div className={shared.cardBody}>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#666', lineHeight: 2 }}>
              <li>Do not discuss unit movement or personnel assignment on unsecured channels</li>
              <li>Verify recipient identity before transmitting PII or PII-adjacent records</li>
              <li>Personnel rosters containing DODID are FOUO — mark and handle accordingly</li>
              <li>Use encrypted email (S/MIME) for all personnel action transmissions</li>
              <li>Shred all PII documents; do not place in open-top recycling containers</li>
              <li>Lock workstations when leaving desk — CAC removal required policy in effect</li>
            </ul>
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  if (adminSubTab === 'clearances') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Personnel Security Clearances (Source: DISS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Soldier</th><th>Clearance</th><th>Investigation</th><th>Adjudicated</th><th>PR Due</th><th>Polygraph</th><th>Indoc Date</th><th>Status</th></tr></thead>
          <tbody>
            {DISS_SUBJECTS.map((d, i) => {
              const isOverdue = d.prStatus.startsWith('OVERDUE')
              const isExpiring = d.prStatus.startsWith('EXPIRING')
              const sc = isOverdue ? '#e74c3c' : isExpiring ? '#e67e22' : '#27ae60'
              return (
                <tr key={i}>
                  <td>{d.rank} {d.lastName}, {d.firstName.charAt(0)}.</td>
                  <td style={{ fontWeight:700, color:'#c9a227' }}>{d.eligibilityLevel}</td>
                  <td style={{ fontSize:10 }}>{d.investigationType}</td>
                  <td style={{ fontSize:10, color:'#555' }}>{d.adjudicationDate}</td>
                  <td style={{ color: isOverdue || isExpiring ? sc : '#888', fontSize:11 }}>{d.prDueDate}</td>
                  <td style={{ fontSize:10, color:'#555' }}>{d.polygraph}</td>
                  <td style={{ fontSize:10, color:'#555' }}>{d.indocDate}</td>
                  <td>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{isOverdue ? 'OVERDUE' : isExpiring ? 'EXPIRING' : 'Current'}</span>
                    {d.derogInfo && <span style={{ fontSize:9, marginLeft:5, color:'#e74c3c' }}>⚠ Derog</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'persec') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-user-shield" /> PERSEC — Admin Document Suspenses (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Document</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
          <tbody>
            {ADMIN_SUSPENSES.map((a, i) => {
              const sc = a.status === 'Overdue' ? '#e74c3c' : a.status === 'Pending' ? '#c9a227' : '#27ae60'
              return (
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{a.soldier}</td>
                  <td>{a.rank}</td>
                  <td style={{ color:'#666', fontSize:11 }}>{a.section}</td>
                  <td style={{ fontWeight:700, color:'#ccc' }}>{a.item}</td>
                  <td style={{ fontSize:10, color: a.status === 'Overdue' ? '#e74c3c' : '#888' }}>{a.dueDate}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{a.status}</span></td>
                  <td style={{ fontSize:11, color:'#666' }}>{a.poc}</td>
                  <td style={{ fontSize:11, color:'#555', maxWidth:220 }}>{a.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'opsec') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-eye-slash" /> OPSEC Requirements & Reminders</div>
      <div className={shared.cardBody}>
        {[
          ['Do not discuss unit movement or personnel assignment on unsecured channels', 'Critical'],
          ['Verify recipient identity before transmitting PII or PII-adjacent records', 'Critical'],
          ['Personnel rosters containing DODID are FOUO — mark and handle accordingly', 'High'],
          ['Use encrypted email (S/MIME) for all personnel action transmissions', 'High'],
          ['Shred all PII documents; do not place in open-top recycling containers', 'High'],
          ['Lock workstations when leaving desk — CAC removal required policy in effect', 'Medium'],
          ['Do not store personnel records on unclassified shared drives without FOUO marking', 'Medium'],
          ['Coordinate OPSEC review before any unit public affairs release referencing personnel', 'Routine'],
        ].map(([item, level], i) => {
          const lc = level === 'Critical' ? '#e74c3c' : level === 'High' ? '#e67e22' : level === 'Medium' ? '#c9a227' : '#27ae60'
          return (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'8px 0', borderBottom:'1px solid #141414' }}>
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${lc}22`, color:lc, flexShrink:0, marginTop:2 }}>{level}</span>
              <span style={{ fontSize:12, color:'#888', lineHeight:1.5 }}>{item}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
  if (adminSubTab === 'access-log') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-file-contract" /> System Access Log (Source: THREADS audit)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Date</th><th>User</th><th>Rank</th><th>Action</th><th>System</th><th>Classification</th><th>Authorized</th></tr></thead>
          <tbody>
            {ACCESS_LOG.map((a, i) => (
              <tr key={i}>
                <td style={{ fontSize:10, color:'#666' }}>{a.date}</td>
                <td style={{ fontWeight:600 }}>{a.soldier}</td>
                <td>{a.rank}</td>
                <td style={{ fontSize:11 }}>{a.action}</td>
                <td style={{ fontSize:10, color:'#c9a227', fontWeight:700 }}>{a.system}</td>
                <td style={{ fontSize:10, color:'#888' }}>{a.classification}</td>
                <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(45,106,79,0.2)', color:'#27ae60' }}>{a.authorized}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  return null
})()}
      </div>
    )
  }

  // ── ADM-OPERATIONS (3) ────────────────────────────────────────────────────
  if (subPage === 'adm-operations') {
    const BR_EVENTS = [
      // Daily
      { cadence: 'daily',     time: '0600', day: 'Daily',    event: 'PERSTAT Submission',         loc: 'S1 Office',         attendees: 'S1 NCOIC' },
      { cadence: 'daily',     time: '1600', day: 'Daily',    event: 'End of Day Accountability',  loc: 'Formation Area',    attendees: 'All S1 Personnel' },
      // Weekly
      { cadence: 'weekly',    time: '0900', day: 'Monday',   event: 'S1 Shop Sync',               loc: 'Conference Room',   attendees: 'S1 OIC, NCOIC, All Clerks' },
      { cadence: 'weekly',    time: '1400', day: 'Monday',   event: 'Admin Suspenses Review',     loc: 'S1 Office',         attendees: 'S1 NCOIC' },
      { cadence: 'weekly',    time: '1000', day: 'Wednesday',event: 'Awards Board Prep',          loc: 'Conference Room',   attendees: 'S1 OIC' },
      { cadence: 'weekly',    time: '1500', day: 'Friday',   event: 'End of Week Report',         loc: 'S1 Office',         attendees: 'S1 NCOIC' },
      { cadence: 'weekly',    time: '1300', day: 'Friday',   event: 'Leave Roster Reconciliation',loc: 'S1 Office',         attendees: 'Leave Clerk, NCOIC' },
      // Monthly
      { cadence: 'monthly',   time: '0800', day: '1st Mon',  event: 'Monthly Strength Report',    loc: 'S1 Office',         attendees: 'S1 OIC, NCOIC' },
      { cadence: 'monthly',   time: '1000', day: '1st Tue',  event: 'IPPSA Audit & Reconcile',    loc: 'S1 Office',         attendees: 'Senior Personnel Clerk' },
      { cadence: 'monthly',   time: '0900', day: '3rd Wed',  event: 'Unit Manning Report (UMR)',  loc: 'Conference Room',   attendees: 'S1 OIC, Commander' },
      { cadence: 'monthly',   time: '1400', day: '4th Fri',  event: 'ETS/DEROS 90-60-30 Review',  loc: 'S1 Office',         attendees: 'S1 NCOIC, Retention NCO' },
      // Quarterly
      { cadence: 'quarterly', time: '0800', day: 'Qtr Start',event: 'OER Senior Rater Profile',  loc: "Commander's Office", attendees: 'S1 OIC, Rater, SR' },
      { cadence: 'quarterly', time: '0900', day: 'Qtr Start',event: 'Records Brief Audit',       loc: 'S1 Office',         attendees: 'S1 NCOIC, All Clerks' },
      { cadence: 'quarterly', time: '1000', day: 'Qtr End',  event: 'SGLV/DD93 Spot Check',      loc: 'S1 Office',         attendees: 'Senior Personnel Clerk' },
      { cadence: 'quarterly', time: '1300', day: 'Qtr End',  event: 'Clearance Expiry Review',   loc: 'S1 Office',         attendees: 'S1 NCOIC, SARM' },
      // Annual
      { cadence: 'annual',    time: '0900', day: 'Jan',      event: 'Annual NCOER Cycle Brief',   loc: 'Conference Room',   attendees: 'All Raters/Rated NCOs' },
      { cadence: 'annual',    time: '0900', day: 'Mar/Sep',  event: 'ACFT Testing Window',        loc: 'Fitness Center',    attendees: 'All Assigned' },
      { cadence: 'annual',    time: '0800', day: 'Apr',      event: 'Command Climate Survey',     loc: 'Unit Area',         attendees: 'All Assigned' },
      { cadence: 'annual',    time: '0900', day: 'Jun',      event: 'Semi-Annual DD93/SGLV Review',loc: 'S1 Office',        attendees: 'All Assigned' },
      { cadence: 'annual',    time: '0900', day: 'Nov',      event: 'Promotion Board Packets Due', loc: 'S1 Office',        attendees: 'Eligible Soldiers, S1 NCOIC' },
    ]

    const CADENCE_TABS = [
      { key: 'all',       label: 'All',       icon: 'fa-layer-group' },
      { key: 'daily',     label: 'Daily',     icon: 'fa-sun' },
      { key: 'weekly',    label: 'Weekly',    icon: 'fa-calendar-week' },
      { key: 'monthly',   label: 'Monthly',   icon: 'fa-calendar-alt' },
      { key: 'quarterly', label: 'Quarterly', icon: 'fa-calendar' },
      { key: 'annual',    label: 'Annual',    icon: 'fa-calendar-check' },
    ]

    const CADENCE_COLORS: Record<string, string> = {
      daily:     '#2a6496',
      weekly:    '#2d6a4f',
      monthly:   '#6a3d2d',
      quarterly: '#5a2d82',
      annual:    '#8a6a00',
    }

    const WORK_PRIORITIES = [
      { priority: 1,  item: 'PERSTAT — daily submission by 0600',       category: 'Daily',    urgency: 'critical' },
      { priority: 2,  item: 'Award actions pending over 30 days',       category: 'Awards',   urgency: 'high'     },
      { priority: 3,  item: 'ETS soldiers within 90 days',              category: 'Retention',urgency: 'high'     },
      { priority: 4,  item: 'Admin suspenses (DD93/SGLV overdue)',       category: 'Admin',    urgency: 'high'     },
      { priority: 5,  item: 'In-processing soldiers — new gains',       category: 'Personnel',urgency: 'medium'   },
      { priority: 6,  item: 'Evaluation (ORB/ERB) updates due',         category: 'Records',  urgency: 'medium'   },
      { priority: 7,  item: 'Leave roster reconciliation',              category: 'Leave',    urgency: 'medium'   },
      { priority: 8,  item: 'Promotion packet preparation',             category: 'Promos',   urgency: 'routine'  },
      { priority: 9,  item: 'Monthly UMR preparation',                  category: 'Reporting',urgency: 'routine'  },
      { priority: 10, item: 'Clearance renewals in 90-day window',      category: 'Security', urgency: 'routine'  },
    ]

    const URGENCY_COLOR: Record<string, string> = {
      critical: '#c0392b',
      high:     '#e67e22',
      medium:   '#c9a227',
      routine:  '#2d6a4f',
    }

    const BattleRhythmSection = () => {
      const [brTab, setBrTab] = useState('all')
      const filtered = brTab === 'all' ? BR_EVENTS : BR_EVENTS.filter(e => e.cadence === brTab)

      return (
        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader}><i className="fas fa-drum" /> S1 Battle Rhythm</div>

          {/* Cadence tabs */}
          <div style={{ display: 'flex', gap: 4, padding: '8px 14px', borderBottom: '1px solid #1a1a1a', flexWrap: 'wrap' }}>
            {CADENCE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setBrTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 12px', borderRadius: 3, border: '1px solid',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: brTab === tab.key ? 'rgba(201,162,39,0.12)' : 'none',
                  borderColor: brTab === tab.key ? 'rgba(201,162,39,0.4)' : '#1e1e1e',
                  color: brTab === tab.key ? '#c9a227' : '#555',
                  transition: 'all 0.15s',
                }}
              >
                <i className={`fas ${tab.icon}`} style={{ fontSize: 9 }} />
                {tab.label}
                <span style={{
                  fontSize: 9, fontWeight: 800,
                  background: brTab === tab.key ? 'rgba(201,162,39,0.2)' : '#1a1a1a',
                  color: brTab === tab.key ? '#c9a227' : '#333',
                  padding: '1px 5px', borderRadius: 2,
                }}>
                  {tab.key === 'all' ? BR_EVENTS.length : BR_EVENTS.filter(e => e.cadence === tab.key).length}
                </span>
              </button>
            ))}
          </div>

          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr>
                  {brTab === 'all' && <th style={{ width: 90 }}>Cadence</th>}
                  <th>Time</th><th>Day / Period</th><th>Event</th><th>Location</th><th>Attendees</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={i}>
                    {brTab === 'all' && (
                      <td>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 6px',
                          borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.5px',
                          background: `${CADENCE_COLORS[e.cadence]}22`,
                          color: CADENCE_COLORS[e.cadence],
                          border: `1px solid ${CADENCE_COLORS[e.cadence]}44`,
                        }}>{e.cadence}</span>
                      </td>
                    )}
                    <td style={{ fontWeight: 700, color: '#ccc', whiteSpace: 'nowrap' }}>{e.time}</td>
                    <td style={{ color: '#888' }}>{e.day}</td>
                    <td style={{ color: '#ccc' }}>{e.event}</td>
                    <td style={{ color: '#666', fontSize: 11 }}>{e.loc}</td>
                    <td style={{ color: '#555', fontSize: 11 }}>{e.attendees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <BattleRhythmSection />

        {/* In-Shop Work Priorities */}
        <div className={shared.card}>
          <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><i className="fas fa-sort-amount-down" /> In-Shop Work Priorities</span>
            <span style={{ fontSize: 10, color: '#444', fontWeight: 600, letterSpacing: '0.5px' }}>S1 SECTION AUDIT</span>
          </div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th style={{ width: 40 }}>#</th><th>Work Item</th><th>Category</th><th>Urgency</th></tr>
              </thead>
              <tbody>
                {WORK_PRIORITIES.map(p => (
                  <tr key={p.priority}>
                    <td style={{ fontWeight: 800, color: '#444', fontSize: 12 }}>{p.priority}</td>
                    <td style={{ color: '#ccc' }}>{p.item}</td>
                    <td>
                      <span style={{ fontSize: 10, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {p.category}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        background: `${URGENCY_COLOR[p.urgency]}22`,
                        color: URGENCY_COLOR[p.urgency],
                        border: `1px solid ${URGENCY_COLOR[p.urgency]}44`,
                      }}>{p.urgency}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  if (adminSubTab === 'battle-rhythm') return <BattleRhythmSection />
  if (adminSubTab === 'priorities') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-sort-amount-down" /> In-Shop Work Priorities</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th style={{ width:40 }}>#</th><th>Work Item</th><th>Category</th><th>Urgency</th></tr></thead>
          <tbody>
            {WORK_PRIORITIES.map(p => {
              const uc = URGENCY_COLOR[p.urgency]
              return (
                <tr key={p.priority}>
                  <td style={{ fontWeight:800, color:'#444', fontSize:12 }}>{p.priority}</td>
                  <td style={{ color:'#ccc' }}>{p.item}</td>
                  <td><span style={{ fontSize:10, color:'#666', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{p.category}</span></td>
                  <td><span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:3, textTransform:'uppercase', letterSpacing:'0.5px', background:`${uc}22`, color:uc, border:`1px solid ${uc}44` }}>{p.urgency}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'suspenses') return (
    <div className={shared.card}>
      <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span><i className="fas fa-bell" /> Admin Suspenses (Source: THREADS)</span>
        <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:3, background:'rgba(192,57,43,0.12)', color:'#e74c3c' }}>{ADMIN_SUSPENSES.filter(a => a.status === 'Overdue').length} OVERDUE</span>
      </div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Soldier</th><th>Rank</th><th>Section</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
          <tbody>
            {ADMIN_SUSPENSES.map((a, i) => {
              const sc = a.status === 'Overdue' ? '#e74c3c' : a.status === 'Pending' ? '#c9a227' : '#27ae60'
              return (
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{a.soldier}</td>
                  <td>{a.rank}</td>
                  <td style={{ fontSize:11, color:'#666' }}>{a.section}</td>
                  <td style={{ fontWeight:700, color:'#ccc' }}>{a.item}</td>
                  <td style={{ fontSize:10, color: a.status === 'Overdue' ? '#e74c3c' : '#888' }}>{a.dueDate}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{a.status}</span></td>
                  <td style={{ fontSize:11, color:'#666' }}>{a.poc}</td>
                  <td style={{ fontSize:11, color:'#555', maxWidth:220 }}>{a.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'daily-ops') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-sun" /> Daily Operations Status</div>
      <div className={shared.cardBody}>
        {[
          { task:'PERSTAT submitted to BDE S1', time:'0600', status:'Complete', owner:'SFC Garza' },
          { task:'Awards pipeline reviewed', time:'0800', status:'Complete', owner:'CPT Phillips' },
          { task:'DD93 follow-up counseling scheduled (SFC Garza)', time:'0900', status:'Pending', owner:'CPT Phillips' },
          { task:'ETS tracker updated — Okonkwo/Ingram (Jun ETS)', time:'1000', status:'Pending', owner:'SFC Garza' },
          { task:'End of Day accountability', time:'1600', status:'Pending', owner:'All S1 Personnel' },
          { task:'Admin suspenses reconciliation', time:'1630', status:'Pending', owner:'SFC Garza' },
        ].map((item, i) => {
          const sc = item.status === 'Complete' ? '#27ae60' : '#c9a227'
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'9px 0', borderBottom:'1px solid #141414' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#c9a227', width:40, flexShrink:0 }}>{item.time}</span>
              <span style={{ flex:1, fontSize:12, color:'#ccc' }}>{item.task}</span>
              <span style={{ fontSize:11, color:'#555' }}>{item.owner}</span>
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:3, background:`${sc}22`, color:sc }}>{item.status}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
  return null
})()}
      </div>
    )
  }

  // ── ADM-SUSTAINMENT (4) ───────────────────────────────────────────────────
  if (subPage === 'adm-sustainment') {

    interface EquipItem {
      id: string; lin: string; nsn: string; nomenclature: string
      qtyAuth: number; qtyOnHand: number; condition: string
      lastInventory: string; readinessFlag: string
      form2062No: string; effectiveDate: string; expiresDate: string
      assignedTo: string; attachedFile: string | null
    }

    // Seed from GCSS + S1 shop items
    const INIT_EQUIP: EquipItem[] = [
      ...GCSS_EQUIPMENT.map(g => ({
        id: g.lineId, lin: g.lin, nsn: g.nsn, nomenclature: g.nomenclature,
        qtyAuth: g.qtyAuthorized, qtyOnHand: g.qtyOnHand,
        condition: g.condition, lastInventory: g.lastInventory, readinessFlag: g.readinessFlag,
        form2062No: '', effectiveDate: '', expiresDate: '', assignedTo: '', attachedFile: null,
      })),
      { id: 'S1-001', lin: 'E42100', nsn: '7021-01-555-1234', nomenclature: 'Desktop Computer, S1 Office', qtyAuth: 3, qtyOnHand: 3, condition: 'Serviceable', lastInventory: '15 Jun 2026', readinessFlag: 'Green', form2062No: '', effectiveDate: '', expiresDate: '', assignedTo: '', attachedFile: null },
      { id: 'S1-002', lin: 'P12345', nsn: '7025-01-612-3456', nomenclature: 'Printer / Scanner, MFC',        qtyAuth: 2, qtyOnHand: 2, condition: 'Serviceable', lastInventory: '15 Jun 2026', readinessFlag: 'Green', form2062No: '', effectiveDate: '', expiresDate: '', assignedTo: '', attachedFile: null },
      { id: 'S1-003', lin: 'V88890', nsn: '7490-01-441-9876', nomenclature: 'Shredder, Cross-Cut',           qtyAuth: 1, qtyOnHand: 1, condition: 'Serviceable', lastInventory: '15 Jun 2026', readinessFlag: 'Green', form2062No: '', effectiveDate: '', expiresDate: '', assignedTo: '', attachedFile: null },
      { id: 'S1-004', lin: 'Z11110', nsn: '7110-01-032-5432', nomenclature: 'Safe / Vault, GSA-Approved',    qtyAuth: 1, qtyOnHand: 1, condition: 'Serviceable', lastInventory: '15 Jun 2026', readinessFlag: 'Green', form2062No: '', effectiveDate: '', expiresDate: '', assignedTo: '', attachedFile: null },
    ]

    const DTS_HIERARCHY = [
      { role: 'Defense Travel Administrator (DTA)', name: 'SSG Simmons', section: 'S8',  phone: '(270) 798-0001', email: 'simmons.j.mil@army.mil' },
      { role: 'Authorizing Official (AO)',           name: 'MAJ Navarro', section: 'S8',  phone: '(270) 798-0002', email: 'navarro.c.mil@army.mil' },
      { role: 'Certifying Official (CO)',            name: 'CPT Hayes',   section: 'S7',  phone: '(270) 798-0003', email: 'hayes.b.mil@army.mil'   },
      { role: 'Travel Preparer (S1)',                name: 'SGT Bynum',   section: 'S1',  phone: '(270) 798-0004', email: 'bynum.k.mil@army.mil'   },
      { role: 'Travel Preparer (S8)',                name: 'SSG Simmons', section: 'S8',  phone: '(270) 798-0001', email: 'simmons.j.mil@army.mil' },
    ]

    // TraX = Army Learning Management System for DTS training
    // Courses are annual renewal requirements per DoDFMR Vol 9 Ch 2
    const TRAX_CERTS = [
      { soldier: 'Phillips, Sarah T.', rank: 'CPT', role: 'Order Approver',   course: 'DTS Order Approver',         completedDate: '01 Jun 2025', expiryDate: '01 Jun 2026', status: 'EXPIRED' },
      { soldier: 'Garza, Roberto M.',  rank: 'SFC', role: 'Order Preparer',   course: 'DTS Order Preparer',         completedDate: '15 Jan 2026', expiryDate: '15 Jan 2027', status: 'Current' },
      { soldier: 'Navarro, Carlos R.', rank: 'MAJ', role: 'Authorizing Official', course: 'DTS Authorizing Official', completedDate: '20 Feb 2026', expiryDate: '20 Feb 2027', status: 'Current' },
      { soldier: 'Simmons, James A.',  rank: 'SSG', role: 'DTA / Preparer',   course: 'DTS Defense Travel Admin',  completedDate: '10 Dec 2025', expiryDate: '10 Dec 2026', status: 'Current' },
      { soldier: 'Hayes, Brittany R.', rank: 'CPT', role: 'Certifying Official', course: 'DTS Certifying Official',  completedDate: '01 Mar 2025', expiryDate: '01 Mar 2026', status: 'EXPIRED' },
      { soldier: 'Bynum, Keisha A.',   rank: 'SGT', role: 'Travel Preparer',  course: 'DTS Order Preparer',         completedDate: '20 May 2026', expiryDate: '20 May 2027', status: 'Current' },
    ]

    // Per DoDFMR Vol 9, Ch 5 §050502: vouchers due within 5 business days of TDY return
    // Per DTS policy: authorizations must be approved before departure
    const DTS_SLA = { voucherDays: 5, authLeadDays: 1, overdueThreshold: 5 }

    const GTCC_CARDS = [
      { soldier: 'Phillips, Sarah T.', rank: 'CPT', section: 'S1', last4: '4421', status: 'Active',    missionCritical: true,  creditLimit: 7500,  balance: 0,      ao: 'MAJ Navarro', apc: 'SSG Simmons', trainingDate: '01 Mar 2026', trainingExpiry: '01 Mar 2027', souDate: '01 Mar 2026', delinquent: false },
      { soldier: 'Garza, Roberto M.',  rank: 'SFC', section: 'S1', last4: '8832', status: 'Active',    missionCritical: false, creditLimit: 5000,  balance: 142.50, ao: 'MAJ Navarro', apc: 'SSG Simmons', trainingDate: '15 Jan 2026', trainingExpiry: '15 Jan 2027', souDate: '15 Jan 2026', delinquent: false },
      { soldier: 'Navarro, Carlos R.', rank: 'MAJ', section: 'S8', last4: '6219', status: 'Active',    missionCritical: true,  creditLimit: 10000, balance: 0,      ao: 'LTC Bradley', apc: 'SSG Simmons', trainingDate: '20 Feb 2026', trainingExpiry: '20 Feb 2027', souDate: '20 Feb 2026', delinquent: false },
      { soldier: 'McKinley, Marcus T.',rank: 'CW3', section: 'S8', last4: '3344', status: 'Suspended', missionCritical: false, creditLimit: 5000,  balance: 890.00, ao: 'MAJ Navarro', apc: 'SSG Simmons', trainingDate: '01 Jan 2025', trainingExpiry: '01 Jan 2026', souDate: '01 Jan 2025', delinquent: true  },
      { soldier: 'Okafor, James A.',   rank: 'MAJ', section: 'S9', last4: '9901', status: 'Active',    missionCritical: false, creditLimit: 7500,  balance: 0,      ao: 'MAJ Navarro', apc: 'SSG Simmons', trainingDate: '15 Mar 2026', trainingExpiry: '15 Mar 2027', souDate: '15 Mar 2026', delinquent: false },
    ]

    const OCIE_RECORDS = [
      { soldier: 'Phillips, Sarah T.', rank: 'CPT', items: ['ACU (2)', 'IBAS w/ESAPI', 'IOTV', 'ACH', 'MOLLE II Ruck', 'Sleeping Bag'], lastSigned: '15 Jan 2026', nextDue: '15 Jan 2027', status: 'Current', form: 'DA 3645' },
      { soldier: 'Garza, Roberto M.',  rank: 'SFC', items: ['ACU (2)', 'IBAS w/ESAPI', 'IOTV', 'ACH', 'MOLLE II Ruck', 'Camelback'], lastSigned: '01 Feb 2026', nextDue: '01 Feb 2027', status: 'Current', form: 'DA 3645' },
      { soldier: 'Bynum, Keisha A.',   rank: 'SGT', items: ['ACU (2)', 'IBAS w/ESAPI', 'ACH', 'MOLLE II Ruck'], lastSigned: '—', nextDue: '18 Jun 2026', status: 'OVERDUE', form: 'DA 3645' },
    ]

    // PMCS intervals per DA Pam 750-8
    // PMCS schedule computed from shared NSN→TM interval table + GCSS equipment NSNs
    const S1_NSNS = INIT_EQUIP.map(e => e.nsn)
    const MAINT_SCHEDULE = computePmcsSchedule(S1_NSNS)
    const maintStats = getMaintStats(MAINT_SCHEDULE, WORK_ORDERS)

    function SustainmentPage() {
      const [sTab, setSTab] = useState('summary')
      const [equipment, setEquipment] = useState<EquipItem[]>(INIT_EQUIP)
      const [modal2062, setModal2062] = useState<EquipItem | null>(null)
      const [draft, setDraft] = useState({ form2062No: '', effectiveDate: '', assignedTo: '' })
      const [isDragging, setIsDragging] = useState(false)
      const [uploadedFile, setUploadedFile] = useState<string | null>(null)
      const [pbFilter, setPbFilter] = useState<'all'|'green'|'amber'|'red'|'shortfall'>('all')
      const [pbExpanded, setPbExpanded] = useState<string | null>(null)

      const memberList = IPPSA_SOLDIERS.map(s => `${s.rank} ${s.lastName}, ${s.firstName.charAt(0)}.`)

      function openModal(eq: EquipItem) {
        setModal2062(eq)
        setDraft({ form2062No: eq.form2062No, effectiveDate: eq.effectiveDate, assignedTo: eq.assignedTo })
        setUploadedFile(eq.attachedFile)
      }

      function calcExpiry(ed: string): string {
        if (!ed) return ''
        const d = new Date(ed); d.setDate(d.getDate() + 180)
        return d.toISOString().split('T')[0]
      }

      function expiryStatus(exp: string): { color: string; label: string } {
        if (!exp) return { color: '#444', label: '—' }
        const days = Math.floor((new Date(exp).getTime() - Date.now()) / 86400000)
        if (days < 0)   return { color: '#c0392b', label: `Expired ${Math.abs(days)}d ago` }
        if (days <= 30) return { color: '#e67e22', label: `${days}d remaining` }
        return { color: '#2d9e6b', label: `${days}d remaining` }
      }

      function save2062() {
        if (!modal2062) return
        setEquipment(prev => prev.map(e =>
          e.id === modal2062.id
            ? { ...e, form2062No: draft.form2062No, effectiveDate: draft.effectiveDate, expiresDate: calcExpiry(draft.effectiveDate), assignedTo: draft.assignedTo, attachedFile: uploadedFile }
            : e
        ))
        setModal2062(null)
      }

      function handleFileDrop(e: React.DragEvent) {
        e.preventDefault(); setIsDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) setUploadedFile(f.name)
      }

      function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]
        if (f) setUploadedFile(f.name)
      }

      const filteredEquip = equipment.filter(eq => {
        if (pbFilter === 'all')       return true
        if (pbFilter === 'shortfall') return eq.qtyOnHand < eq.qtyAuth
        return eq.readinessFlag.toLowerCase() === pbFilter
      })

      const draftExpiry = calcExpiry(draft.effectiveDate)

      // Sub-tab button style helper
      function stab(key: string, label: string, icon: string) {
        const active = sTab === key
        return (
          <button key={key} onClick={() => setSTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 4, border: '1px solid',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', cursor: 'pointer',
            background: active ? 'rgba(201,162,39,0.12)' : 'none',
            borderColor: active ? 'rgba(201,162,39,0.4)' : '#222',
            color: active ? '#c9a227' : '#555',
            transition: 'all 0.15s', textTransform: 'uppercase',
          }}>
            <i className={`fas ${icon}`} style={{ fontSize: 9 }} /> {label}
          </button>
        )
      }

      const STABS = [
        { key: 'summary',    label: 'Summary',      icon: 'fa-tachometer-alt' },
        { key: 'dts-admin',  label: 'DTS Admin',    icon: 'fa-sitemap'        },
        { key: 'dts-travel', label: 'DTS Travel',   icon: 'fa-plane'          },
        { key: 'gtcc-admin', label: 'GTCC Admin',   icon: 'fa-id-card'        },
        { key: 'gtcc-travel',label: 'GTCC Travel',  icon: 'fa-credit-card'    },
        { key: 'ocie',       label: 'OCIE',         icon: 'fa-vest'           },
        { key: 'propbook',     label: 'Property Book', icon: 'fa-boxes'       },
        { key: 'maintenance',  label: 'Maintenance',   icon: 'fa-tools'       },
      ]

      return (
        <>
          <div className={shared.page}>
            {/* Sub-tab bar */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, padding: '10px 14px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 5 }}>
              {STABS.map(t => stab(t.key, t.label, t.icon))}
            </div>

            {/* ── SUMMARY ── */}
            {sTab === 'summary' && (
              <>
                <div className={shared.stats} style={{ marginBottom: 16 }}>
                  {[
                    { label: 'Property Lines',   value: String(equipment.length),                                           bg: '#2d2d2d'          },
                    { label: 'On-Hand Shortfall', value: String(equipment.filter(e => e.qtyOnHand < e.qtyAuth).length),     bg: STATUS_COLOR.Red   },
                    { label: 'DTS Open Trips',   value: String(DTS_TRAVEL.filter(t => !t.voucherStatus.includes('Approved') || t.voucherStatus.includes('Pending')).length), bg: STATUS_COLOR.Amber },
                    { label: 'GTCC Delinquent',  value: String(GTCC_CARDS.filter(c => c.delinquent).length),               bg: STATUS_COLOR.Red   },
                    { label: 'OCIE Overdue',     value: String(OCIE_RECORDS.filter(o => o.status === 'OVERDUE').length),   bg: STATUS_COLOR.Amber },
                    { label: 'TraX Expired',     value: String(TRAX_CERTS.filter(c => c.status === 'EXPIRED').length),     bg: STATUS_COLOR.Red   },
                  ].map(s => (
                    <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                      <div className={shared.statValue}>{s.value}</div>
                      <div className={shared.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className={shared.grid2}>
                  <div className={shared.card}>
                    <div className={shared.cardHeader}><i className="fas fa-exclamation-triangle" /> Action Items</div>
                    <div className={shared.cardBody}>
                      {TRAX_CERTS.filter(c => c.status === 'EXPIRED').map(c => (
                        <div key={c.soldier} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'1px solid #141414', fontSize:12 }}>
                          <span style={{ color:'#e74c3c', fontSize:9 }}><i className="fas fa-times-circle" /></span>
                          <span style={{ color:'#ccc' }}>{c.rank} {c.soldier}</span>
                          <span style={{ color:'#555', marginLeft:'auto', fontSize:11 }}>TraX {c.role} expired {c.expiryDate}</span>
                        </div>
                      ))}
                      {GTCC_CARDS.filter(c => c.delinquent).map(c => (
                        <div key={c.soldier} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'1px solid #141414', fontSize:12 }}>
                          <span style={{ color:'#e74c3c', fontSize:9 }}><i className="fas fa-exclamation-circle" /></span>
                          <span style={{ color:'#ccc' }}>{c.rank} {c.soldier}</span>
                          <span style={{ color:'#e74c3c', marginLeft:'auto', fontSize:11 }}>GTCC delinquent — ${c.balance.toFixed(2)}</span>
                        </div>
                      ))}
                      {OCIE_RECORDS.filter(o => o.status === 'OVERDUE').map(o => (
                        <div key={o.soldier} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'1px solid #141414', fontSize:12 }}>
                          <span style={{ color:'#e67e22', fontSize:9 }}><i className="fas fa-clock" /></span>
                          <span style={{ color:'#ccc' }}>{o.rank} {o.soldier}</span>
                          <span style={{ color:'#e67e22', marginLeft:'auto', fontSize:11 }}>OCIE unsigned — overdue</span>
                        </div>
                      ))}
                      {equipment.filter(e => e.qtyOnHand < e.qtyAuth).map(e => (
                        <div key={e.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'1px solid #141414', fontSize:12 }}>
                          <span style={{ color:'#e74c3c', fontSize:9 }}><i className="fas fa-minus-circle" /></span>
                          <span style={{ color:'#ccc' }}>{e.nomenclature}</span>
                          <span style={{ color:'#e74c3c', marginLeft:'auto', fontSize:11 }}>Shortfall -{e.qtyAuth - e.qtyOnHand}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={shared.card}>
                    <div className={shared.cardHeader}><i className="fas fa-info-circle" /> SLA Reference</div>
                    <div className={shared.cardBody}>
                      {[
                        ['DTS Voucher Submission',    `Within ${DTS_SLA.voucherDays} business days of TDY return (DoDFMR Vol 9, Ch 5 §050502)`],
                        ['DTS Authorization Approval','Must be approved before departure — no retroactive approvals'],
                        ['GTCC Billing Cycle',        'Statement due within 30 days of closing; delinquent at 61+ days per GSA policy'],
                        ['GTCC Training Renewal',     'Annual completion required — TraX Army Learning Management System'],
                        ['GTCC SOU Renewal',          'Annual Statement of Understanding re-signature required per APC guidance'],
                        ['OCIE Annual Inventory',     'Annual inventory and signature required per AR 710-2 and CTA 50-900'],
                        ['DA 2062 Hand Receipt',      '180-day sub-hand receipt expiration — must renew or return property'],
                      ].map(([title, note]) => (
                        <div key={title as string} style={{ display:'flex', gap:10, padding:'7px 0', borderBottom:'1px solid #141414', fontSize:11 }}>
                          <span style={{ color:'#888', fontWeight:700, width:200, flexShrink:0 }}>{title as string}</span>
                          <span style={{ color:'#555', lineHeight:1.4 }}>{note as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── DTS ADMIN ── */}
            {sTab === 'dts-admin' && (
              <>
                <div className={shared.card} style={{ marginBottom: 16 }}>
                  <div className={shared.cardHeader}><i className="fas fa-sitemap" /> DTS Hierarchy (Source: DTS)</div>
                  <div className={shared.tableWrap}>
                    <table className={shared.table}>
                      <thead><tr><th>Role</th><th>Name</th><th>Section</th><th>Phone</th><th>NIPR Email</th></tr></thead>
                      <tbody>
                        {DTS_HIERARCHY.map((h, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight:700, color:'#ccc' }}>{h.role}</td>
                            <td>{h.name}</td>
                            <td style={{ color:'#666' }}>{h.section}</td>
                            <td style={{ fontFamily:'monospace', fontSize:10, color:'#555' }}>{h.phone}</td>
                            <td style={{ fontFamily:'monospace', fontSize:10, color:'#555' }}>{h.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={shared.card}>
                  <div className={shared.cardHeader}><i className="fas fa-graduation-cap" /> TraX DTS Certifications (Source: TraX / ALMS)</div>
                  <div style={{ padding:'8px 14px 4px', fontSize:10, color:'#444', borderBottom:'1px solid #1a1a1a' }}>
                    Annual renewal required. Courses: DTS Order Preparer, DTS Order Approver, DTS Authorizing Official, DTS Certifying Official.
                  </div>
                  <div className={shared.tableWrap}>
                    <table className={shared.table}>
                      <thead><tr><th>Soldier</th><th>DTS Role</th><th>Course</th><th>Completed</th><th>Expiry</th><th>Status</th></tr></thead>
                      <tbody>
                        {TRAX_CERTS.map((c, i) => {
                          const expired = c.status === 'EXPIRED'
                          return (
                            <tr key={i}>
                              <td>{c.rank} {c.soldier}</td>
                              <td style={{ color:'#888', fontSize:11 }}>{c.role}</td>
                              <td style={{ fontSize:11 }}>{c.course}</td>
                              <td style={{ fontSize:10, color:'#555' }}>{c.completedDate}</td>
                              <td style={{ color: expired ? '#e74c3c' : '#888', fontWeight: expired ? 700 : 400 }}>{c.expiryDate}</td>
                              <td>
                                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:3,
                                  background: expired ? 'rgba(192,57,43,0.2)' : 'rgba(45,106,79,0.2)',
                                  color:      expired ? '#e74c3c'             : '#27ae60' }}>
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── DTS TRAVEL ── */}
            {sTab === 'dts-travel' && (
              <>
                <div style={{ padding:'8px 14px', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:4, fontSize:11, color:'#555', marginBottom:12, display:'flex', gap:20 }}>
                  <span><i className="fas fa-gavel" style={{ marginRight:5, color:'#333' }} /><strong style={{ color:'#777' }}>Voucher SLA:</strong> {DTS_SLA.voucherDays} business days post-return (DoDFMR Vol 9, Ch 5 §050502)</span>
                  <span><i className="fas fa-ban" style={{ marginRight:5, color:'#333' }} /><strong style={{ color:'#777' }}>Auth SLA:</strong> Must approve before departure — no retroactive auth</span>
                </div>
                <div className={shared.stats} style={{ marginBottom:16 }}>
                  {[
                    { label: 'Open Authorizations', value: String(DTS_TRAVEL.filter(t => t.voucherStatus.includes('Authorization')).length), bg:'#2d2d2d' },
                    { label: 'Vouchers Pending',     value: String(DTS_TRAVEL.filter(t => t.voucherStatus.includes('Pending')).length),        bg: STATUS_COLOR.Amber },
                    { label: 'Overdue Vouchers',     value: String(DTS_TRAVEL.filter(t => t.voucherStatus.includes('Overdue')).length),         bg: STATUS_COLOR.Red   },
                    { label: 'Closed This Period',   value: String(DTS_TRAVEL.filter(t => t.voucherStatus.includes('Approved') && !t.voucherStatus.includes('Pending')).length), bg: STATUS_COLOR.Green },
                  ].map(s => (
                    <div key={s.label} className={shared.stat} style={{ background:s.bg }}>
                      <div className={shared.statValue}>{s.value}</div>
                      <div className={shared.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className={shared.card} style={{ marginBottom:16 }}>
                  <div className={shared.cardHeader}><i className="fas fa-list" /> Travel Authorizations & Vouchers (Source: DTS)</div>
                  <div className={shared.tableWrap}>
                    <table className={shared.table}>
                      <thead>
                        <tr><th>Auth #</th><th>Soldier</th><th>Purpose</th><th>Depart</th><th>Return</th><th>Est. Cost</th><th>Auth Status</th><th>Voucher Status</th></tr>
                      </thead>
                      <tbody>
                        {DTS_TRAVEL.map((t, i) => {
                          const authDone  = t.voucherStatus !== 'Authorization Pending'
                          const vchrDone  = t.voucherStatus.includes('Approved') && !t.voucherStatus.includes('Pending')
                          const vchrPend  = t.voucherStatus.includes('Pending') || t.voucherStatus.includes('Submitted')
                          const noVoucher = t.voucherStatus.includes('No Voucher')
                          return (
                            <tr key={i}>
                              <td style={{ fontFamily:'monospace', fontSize:10, color:'#555' }}>{t.authNumber}</td>
                              <td>{t.rank} {t.travelerName}</td>
                              <td style={{ fontSize:11, maxWidth:180 }}>{t.purpose}</td>
                              <td style={{ fontSize:10, color:'#888' }}>{t.departure}</td>
                              <td style={{ fontSize:10, color:'#888' }}>{t.returnDate}</td>
                              <td style={{ color:'#c9a227' }}>{t.estimatedCost > 0 ? `$${t.estimatedCost.toLocaleString()}` : '—'}</td>
                              <td>
                                <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3,
                                  background: authDone ? 'rgba(45,106,79,0.2)' : 'rgba(201,162,39,0.15)',
                                  color:      authDone ? '#27ae60'             : '#c9a227' }}>
                                  {authDone ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3,
                                  background: noVoucher ? '#1a1a1a' : vchrDone ? 'rgba(45,106,79,0.2)' : vchrPend ? 'rgba(201,162,39,0.15)' : '#1a1a1a',
                                  color:      noVoucher ? '#444'    : vchrDone ? '#27ae60'             : vchrPend ? '#c9a227'                 : '#555' }}>
                                  {t.voucherStatus}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── GTCC ADMIN ── */}
            {sTab === 'gtcc-admin' && (
              <>
                <div style={{ padding:'8px 14px', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:4, fontSize:11, color:'#555', marginBottom:12 }}>
                  <i className="fas fa-info-circle" style={{ marginRight:6, color:'#333' }} />
                  GTCC program managed by the Agency Program Coordinator (APC). Cards require annual training (TraX) and annual SOU signature. Mission-critical cards remain active during admin actions. APC manages all account changes, limits, and suspensions.
                </div>
                <div className={shared.card}>
                  <div className={shared.cardHeader}><i className="fas fa-id-card" /> GTCC Card Registry (Source: GTCC / GSA SmartPay)</div>
                  <div className={shared.tableWrap}>
                    <table className={shared.table}>
                      <thead>
                        <tr><th>Soldier</th><th>Last 4</th><th>AO</th><th>APC</th><th>Status</th><th>Mission Critical</th><th>Credit Limit</th><th>Training Expiry</th><th>SOU Date</th><th>Delinquent</th></tr>
                      </thead>
                      <tbody>
                        {GTCC_CARDS.map((c, i) => (
                          <tr key={i}>
                            <td>{c.rank} {c.soldier}</td>
                            <td style={{ fontFamily:'monospace', fontWeight:700 }}>···· {c.last4}</td>
                            <td style={{ fontSize:10, color:'#666' }}>{c.ao}</td>
                            <td style={{ fontSize:10, color:'#666' }}>{c.apc}</td>
                            <td>
                              <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3,
                                background: c.status === 'Active' ? 'rgba(45,106,79,0.2)' : 'rgba(192,57,43,0.2)',
                                color:      c.status === 'Active' ? '#27ae60'             : '#e74c3c' }}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ textAlign:'center', color: c.missionCritical ? '#c9a227' : '#444' }}>
                              {c.missionCritical ? <i className="fas fa-check" /> : '—'}
                            </td>
                            <td style={{ color:'#c9a227' }}>${c.creditLimit.toLocaleString()}</td>
                            <td>
                              <span style={{ fontSize:10, color: new Date(c.trainingExpiry) < new Date() ? '#e74c3c' : '#888' }}>{c.trainingExpiry}</span>
                            </td>
                            <td style={{ fontSize:10, color:'#888' }}>{c.souDate}</td>
                            <td>
                              {c.delinquent
                                ? <span style={{ fontSize:10, fontWeight:700, color:'#e74c3c' }}><i className="fas fa-exclamation-triangle" /> YES</span>
                                : <span style={{ fontSize:11, color:'#444' }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── GTCC TRAVEL ── */}
            {sTab === 'gtcc-travel' && (
              <>
                <div style={{ padding:'8px 14px', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:4, fontSize:11, color:'#555', marginBottom:12 }}>
                  <i className="fas fa-credit-card" style={{ marginRight:6, color:'#333' }} />
                  GTCC balances must be paid within 30 days of statement close. Delinquent at 61+ days outstanding. APC can suspend cards for non-payment. Data from GSA SmartPay — THREADS tracks balance snapshots.
                </div>
                <div className={shared.card}>
                  <div className={shared.cardHeader}><i className="fas fa-wallet" /> GTCC Account Balances (Source: GSA SmartPay / THREADS)</div>
                  <div className={shared.tableWrap}>
                    <table className={shared.table}>
                      <thead>
                        <tr><th>Soldier</th><th>Card</th><th>Current Balance</th><th>Credit Limit</th><th>Available</th><th>Statement Date</th><th>Due Date</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {GTCC_CARDS.map((c, i) => {
                          const available = c.creditLimit - c.balance
                          const pct = Math.round((c.balance / c.creditLimit) * 100)
                          return (
                            <tr key={i}>
                              <td>{c.rank} {c.soldier}</td>
                              <td style={{ fontFamily:'monospace' }}>···· {c.last4}</td>
                              <td style={{ fontWeight:700, color: c.balance > 0 ? '#e67e22' : '#2d9e6b' }}>
                                ${c.balance.toFixed(2)}
                                {c.balance > 0 && <span style={{ fontSize:9, marginLeft:6, color:'#555' }}>{pct}% utilized</span>}
                              </td>
                              <td style={{ color:'#555' }}>${c.creditLimit.toLocaleString()}</td>
                              <td style={{ color: available < c.creditLimit * 0.2 ? '#e67e22' : '#888' }}>${available.toFixed(2)}</td>
                              <td style={{ fontSize:10, color:'#555' }}>THREADS input</td>
                              <td style={{ fontSize:10, color:'#555' }}>THREADS input</td>
                              <td>
                                {c.delinquent
                                  ? <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(192,57,43,0.2)', color:'#e74c3c' }}>DELINQUENT</span>
                                  : c.balance > 0
                                    ? <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(201,162,39,0.15)', color:'#c9a227' }}>Balance Due</span>
                                    : <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(45,106,79,0.2)', color:'#27ae60' }}>Paid</span>}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── OCIE ── */}
            {sTab === 'ocie' && (
              <>
                <div style={{ padding:'8px 14px', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:4, fontSize:11, color:'#555', marginBottom:12 }}>
                  <i className="fas fa-info-circle" style={{ marginRight:6, color:'#333' }} />
                  OCIE (Organizational Clothing and Individual Equipment) — annual inventory and DA Form 3645 signature required per AR 710-2 §2-1 and CTA 50-900. S1 tracks last-signed date and schedules renewals. Signed copies filed in unit files.
                </div>
                <div className={shared.card}>
                  <div className={shared.cardHeader}><i className="fas fa-vest" /> OCIE Accountability (Source: DA 3645 / THREADS)</div>
                  <div className={shared.tableWrap}>
                    <table className={shared.table}>
                      <thead>
                        <tr><th>Soldier</th><th>Form</th><th>Items Issued</th><th>Last Signed</th><th>Next Due</th><th>Status</th><th></th></tr>
                      </thead>
                      <tbody>
                        {OCIE_RECORDS.map((o, i) => {
                          const overdue = o.status === 'OVERDUE'
                          return (
                            <tr key={i}>
                              <td>{o.rank} {o.soldier}</td>
                              <td style={{ fontSize:10, color:'#555' }}>{o.form}</td>
                              <td style={{ fontSize:10, color:'#888' }}>{o.items.join(', ')}</td>
                              <td style={{ color: overdue ? '#e74c3c' : '#888', fontWeight: overdue ? 700 : 400 }}>{o.lastSigned}</td>
                              <td style={{ color: overdue ? '#e74c3c' : '#888' }}>{o.nextDue}</td>
                              <td>
                                <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3,
                                  background: overdue ? 'rgba(192,57,43,0.2)' : 'rgba(45,106,79,0.2)',
                                  color:      overdue ? '#e74c3c'             : '#27ae60' }}>
                                  {o.status}
                                </span>
                              </td>
                              <td><button className={styles.btnDetail}>View / Sign</button></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── PROPERTY BOOK ── */}
            {sTab === 'propbook' && (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                  <span style={{ fontSize:10, color:'#555', fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase' }}>Filter:</span>
                  {(['all','green','amber','red','shortfall'] as const).map(f => (
                    <button key={f} onClick={() => setPbFilter(f)} style={{
                      padding:'4px 12px', borderRadius:3, border:'1px solid', fontSize:10, fontWeight:700, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.5px',
                      background: pbFilter === f ? (f==='green'?'rgba(45,106,79,0.2)':f==='amber'?'rgba(230,126,34,0.15)':f==='red'?'rgba(192,57,43,0.15)':f==='shortfall'?'rgba(192,57,43,0.12)':'rgba(201,162,39,0.1)') : 'none',
                      borderColor: pbFilter === f ? (f==='green'?'rgba(45,106,79,0.4)':f==='amber'?'rgba(230,126,34,0.3)':f==='red'?'rgba(192,57,43,0.3)':f==='shortfall'?'rgba(192,57,43,0.25)':'rgba(201,162,39,0.3)') : '#222',
                      color: pbFilter === f ? (f==='green'?'#27ae60':f==='amber'?'#e67e22':f==='red'?'#e74c3c':f==='shortfall'?'#e74c3c':'#c9a227') : '#555',
                    }}>{f === 'all' ? `All (${equipment.length})` : f === 'shortfall' ? `Shortfall (${equipment.filter(e=>e.qtyOnHand<e.qtyAuth).length})` : `${f.charAt(0).toUpperCase()+f.slice(1)} (${equipment.filter(e=>e.readinessFlag.toLowerCase()===f).length})`}</button>
                  ))}
                  <span style={{ marginLeft:'auto', fontSize:10, color:'#333', fontStyle:'italic' }}>
                    Sub-hand receipt editing requires property book write access — coordinate with PBO
                  </span>
                </div>
                <div className={shared.card}>
                  <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span><i className="fas fa-book" /> Digital Property Book (Source: GCSS-Army)</span>
                    <span style={{ fontSize:9, color:'#444', fontWeight:700, letterSpacing:'0.5px' }}>LIN ORDER · {filteredEquip.length} LINES</span>
                  </div>
                  <div className={shared.tableWrap}>
                    <table className={shared.table}>
                      <thead>
                        <tr><th></th><th>LIN</th><th>NSN</th><th>Nomenclature</th><th>Auth</th><th>On-Hand</th><th>Shortfall</th><th>Condition</th><th>Last Inventory</th><th>Flag</th><th>DA 2062</th></tr>
                      </thead>
                      <tbody>
                        {filteredEquip.map(eq => {
                          const flagColor = eq.readinessFlag === 'Green' ? '#27ae60' : eq.readinessFlag === 'Amber' ? '#e67e22' : '#e74c3c'
                          const short = eq.qtyOnHand < eq.qtyAuth
                          const expanded = pbExpanded === eq.id
                          return (
                            <>
                              <tr key={eq.id} style={{ cursor:'pointer' }} onClick={() => setPbExpanded(expanded ? null : eq.id)}>
                                <td style={{ width:24, textAlign:'center', color:'#555', fontSize:10 }}>
                                  <i className={`fas fa-chevron-${expanded ? 'down' : 'right'}`} />
                                </td>
                                <td style={{ fontFamily:'monospace', fontSize:10, color:'#555' }}>{eq.lin}</td>
                                <td style={{ fontFamily:'monospace', fontSize:10, color:'#444' }}>{eq.nsn}</td>
                                <td style={{ fontWeight:600, color:'#ccc' }}>{eq.nomenclature}</td>
                                <td style={{ textAlign:'center' }}>{eq.qtyAuth}</td>
                                <td style={{ textAlign:'center', color: short ? '#e67e22' : '#ccc' }}>{eq.qtyOnHand}</td>
                                <td style={{ textAlign:'center', color: short ? '#e74c3c' : '#444' }}>{short ? `-${eq.qtyAuth - eq.qtyOnHand}` : '—'}</td>
                                <td style={{ fontSize:11, color:'#888' }}>{eq.condition.length > 30 ? eq.condition.slice(0,30)+'…' : eq.condition}</td>
                                <td style={{ fontSize:10, color:'#555' }}>{eq.lastInventory}</td>
                                <td>
                                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:flagColor+'22', color:flagColor }}>
                                    {eq.readinessFlag}
                                  </span>
                                </td>
                                <td>
                                  {eq.form2062No
                                    ? <span style={{ fontSize:10, color:'#2d9e6b', fontWeight:700 }}><i className="fas fa-check-circle" style={{ marginRight:4 }} />{eq.form2062No}</span>
                                    : <span style={{ fontSize:10, color:'#333', fontStyle:'italic' }}>None</span>}
                                </td>
                              </tr>
                              {expanded && (
                                <tr key={`${eq.id}-expand`}>
                                  <td colSpan={11} style={{ background:'#0a0a0a', padding:'12px 20px 16px' }}>
                                    <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                                      <div style={{ flex:1 }}>
                                        <div style={{ fontSize:10, color:'#444', fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:8 }}>DA Form 2062 — Hand Receipt</div>
                                        {eq.form2062No ? (
                                          <div style={{ fontSize:11, color:'#666', lineHeight:2 }}>
                                            <div>Form #: <strong style={{ color:'#ccc' }}>{eq.form2062No}</strong></div>
                                            <div>Effective: <strong style={{ color:'#888' }}>{eq.effectiveDate}</strong></div>
                                            <div>Expires: <strong style={{ color: expiryStatus(eq.expiresDate).color }}>{expiryStatus(eq.expiresDate).label}</strong></div>
                                            <div>Assigned: <strong style={{ color:'#ccc' }}>{eq.assignedTo}</strong></div>
                                            {eq.attachedFile && <div>File: <strong style={{ color:'#c9a227' }}><i className="fas fa-paperclip" style={{ marginRight:4 }} />{eq.attachedFile}</strong></div>}
                                          </div>
                                        ) : (
                                          <div style={{ fontSize:11, color:'#444', fontStyle:'italic' }}>No DA 2062 attached</div>
                                        )}
                                      </div>
                                      <button
                                        onClick={e => { e.stopPropagation(); openModal(eq) }}
                                        style={{
                                          padding:'6px 16px', fontSize:10, fontWeight:700, borderRadius:3, cursor:'pointer', letterSpacing:'0.3px',
                                          background: eq.form2062No ? 'rgba(45,158,107,0.1)' : 'rgba(201,162,39,0.1)',
                                          border:`1px solid ${eq.form2062No ? 'rgba(45,158,107,0.3)' : 'rgba(201,162,39,0.3)'}`,
                                          color: eq.form2062No ? '#2d9e6b' : '#c9a227',
                                        }}
                                      >
                                        <i className="fas fa-paperclip" style={{ marginRight:5 }} />
                                        {eq.form2062No ? 'Edit 2062' : 'Attach 2062'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── MAINTENANCE ── */}
            {sTab === 'maintenance' && (
              <MaintenanceView schedule={MAINT_SCHEDULE} workOrders={WORK_ORDERS} stats={maintStats} contacts={MAINT_CONTACTS} />
            )}
          </div>

          {/* ── DA 2062 Modal (with drag-and-drop upload) ── */}
          {modal2062 && (
            <div
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => setModal2062(null)}
            >
              <div
                style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:6, width:520, maxHeight:'90vh', overflowY:'auto', padding:0, boxShadow:'0 8px 32px rgba(0,0,0,0.7)' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:'#fff', letterSpacing:'0.3px' }}>DA Form 2062 — Hand Receipt</div>
                    <div style={{ fontSize:11, color:'#555', marginTop:2 }}>{modal2062.nomenclature} · NSN {modal2062.nsn}</div>
                  </div>
                  <button onClick={() => setModal2062(null)} style={{ background:'none', border:'none', color:'#555', fontSize:18, cursor:'pointer', lineHeight:1 }}>×</button>
                </div>

                <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:16 }}>
                  {/* Form # */}
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#666', letterSpacing:'1px', textTransform:'uppercase', marginBottom:6 }}>DA 2062 Form #</label>
                    <input type="text" value={draft.form2062No}
                      onChange={e => setDraft(d => ({ ...d, form2062No: e.target.value }))}
                      placeholder="e.g. HR-2062-001"
                      style={{ width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#ccc', outline:'none', boxSizing:'border-box' }}
                    />
                  </div>

                  {/* Effective Date */}
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#666', letterSpacing:'1px', textTransform:'uppercase', marginBottom:6 }}>Effective Date</label>
                    <input type="date" value={draft.effectiveDate}
                      onChange={e => setDraft(d => ({ ...d, effectiveDate: e.target.value }))}
                      style={{ width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#ccc', outline:'none', boxSizing:'border-box', colorScheme:'dark' }}
                    />
                  </div>

                  {/* Auto-expiry */}
                  <div style={{ padding:'10px 14px', background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:11, color:'#555' }}><i className="fas fa-calculator" style={{ marginRight:6, color:'#333' }} />Expiration (180 days)</span>
                    <span style={{ fontSize:12, fontWeight:700, color: draftExpiry ? '#c9a227' : '#333' }}>{draftExpiry || 'Set effective date first'}</span>
                  </div>

                  {/* Assign To */}
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#666', letterSpacing:'1px', textTransform:'uppercase', marginBottom:6 }}>Assign To (Hand Receipt Holder)</label>
                    <select value={draft.assignedTo}
                      onChange={e => setDraft(d => ({ ...d, assignedTo: e.target.value }))}
                      style={{ width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:4, padding:'8px 12px', fontSize:12, color: draft.assignedTo ? '#ccc' : '#555', outline:'none', boxSizing:'border-box', colorScheme:'dark' }}>
                      <option value="">— Select service member —</option>
                      {memberList.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </div>

                  {/* Upload / Drag-and-Drop */}
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#666', letterSpacing:'1px', textTransform:'uppercase', marginBottom:6 }}>
                      Attach DA 2062 Document
                    </label>
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => document.getElementById('modal-file-upload')?.click()}
                      style={{
                        border:`2px dashed ${isDragging ? '#c9a227' : uploadedFile ? '#2d9e6b' : '#252525'}`,
                        borderRadius:4, padding:'18px 14px', textAlign:'center', cursor:'pointer',
                        background: isDragging ? 'rgba(201,162,39,0.05)' : uploadedFile ? 'rgba(45,158,107,0.05)' : '#0a0a0a',
                        transition:'all 0.15s',
                      }}
                    >
                      <input id="modal-file-upload" type="file" accept=".pdf,.doc,.docx,.jpg,.png"
                        style={{ display:'none' }} onChange={handleFileInput} />
                      <i className={`fas ${uploadedFile ? 'fa-check-circle' : 'fa-cloud-upload-alt'}`}
                        style={{ fontSize:22, color: isDragging ? '#c9a227' : uploadedFile ? '#2d9e6b' : '#2a2a2a', marginBottom:8, display:'block' }} />
                      <div style={{ fontSize:12, fontWeight:600, color: uploadedFile ? '#2d9e6b' : '#555', marginBottom:4 }}>
                        {uploadedFile ? uploadedFile : isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
                      </div>
                      <div style={{ fontSize:10, color:'#333' }}>PDF, DOC, JPG, PNG accepted</div>
                    </div>
                    {uploadedFile && (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
                        <span style={{ fontSize:11, color:'#2d9e6b' }}>
                          <i className="fas fa-paperclip" style={{ marginRight:5 }} />{uploadedFile}
                        </span>
                        <button onClick={() => setUploadedFile(null)}
                          style={{ background:'none', border:'none', color:'#555', fontSize:11, cursor:'pointer' }}>
                          <i className="fas fa-times" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding:'12px 20px', borderTop:'1px solid #1a1a1a', display:'flex', justifyContent:'flex-end', gap:8 }}>
                  <button onClick={() => setModal2062(null)}
                    style={{ padding:'6px 16px', background:'none', border:'1px solid #2a2a2a', borderRadius:3, color:'#666', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={save2062}
                    disabled={!draft.form2062No || !draft.effectiveDate || !draft.assignedTo}
                    style={{
                      padding:'6px 20px', borderRadius:3, fontSize:11, fontWeight:700, cursor:'pointer', letterSpacing:'0.3px',
                      background: (!draft.form2062No || !draft.effectiveDate || !draft.assignedTo) ? '#1a1a1a' : 'rgba(201,162,39,0.15)',
                      border:`1px solid ${(!draft.form2062No || !draft.effectiveDate || !draft.assignedTo) ? '#1a1a1a' : 'rgba(201,162,39,0.4)'}`,
                      color: (!draft.form2062No || !draft.effectiveDate || !draft.assignedTo) ? '#333' : '#c9a227',
                    }}>
                    <i className="fas fa-save" style={{ marginRight:6 }} />Save Hand Receipt
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )
    }

    return <SustainmentPage />
  }

  // ── ADM-PLANS (5) ─────────────────────────────────────────────────────────
  if (subPage === 'adm-plans') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <div className={shared.header}>
          <h2><i className="fas fa-map" /> 5 — Plans</h2>
        </div>

        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Long-Range Calendar (S1)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Month</th><th>Event</th><th>Type</th><th>Preparation Due</th><th>Owner</th></tr>
              </thead>
              <tbody>{placeholderRows(6, 5)}</tbody>
            </table>
          </div>
        </div>

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-redo" /> Recurring Annual Suspenses</div>
          <div className={shared.cardBody}>
            {[
              'NCOER rating cycle — initiate support forms 90 days prior to rating period end',
              'OER rating cycle — initiate senior rater profile review quarterly',
              'ACFT testing windows — coordinate with S3 for range availability',
              'Promotion boards — submit packets 45 days prior to board convening date',
              'Command Climate Survey — annual, coordinate with Commander and IG',
              'DD93 / SGLV review — semi-annual verification for all assigned personnel',
              'Records Brief (ORB/ERB) update — semi-annual, prior to any PCS or board',
              'SARM / clearance renewals — 90-day lead on expiring clearances',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: '1px solid #141414', fontSize: 12, color: '#666' }}>
                <i className="fas fa-dot-circle" style={{ color: '#333', fontSize: 8, marginTop: 4, flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  if (adminSubTab === 'lr-calendar') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Long-Range Calendar (S1)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Preparation Due</th><th>Owner</th></tr></thead>
          <tbody>
            {LR_CALENDAR.map((e, i) => (
              <tr key={i}>
                <td style={{ fontWeight:700, color:'#c9a227' }}>{e.month}</td>
                <td style={{ color:'#ccc' }}>{e.event}</td>
                <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'#1a1a1a', color:'#666' }}>{e.type}</span></td>
                <td style={{ fontSize:10, color:'#888' }}>{e.prepDue}</td>
                <td style={{ fontSize:11, color:'#555' }}>{e.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'annual-susp') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-redo" /> Recurring Annual Suspenses</div>
      <div className={shared.cardBody}>
        {[
          ['Jan',     'Annual NCOER cycle brief — initiate support forms 90 days prior to rating period end'],
          ['Mar/Sep', 'ACFT testing windows — coordinate with S3 for range availability and scorer certification'],
          ['Apr',     'Command Climate Survey — annual, coordinate with Commander and IG office'],
          ['Jun',     'Semi-annual DD93/SGLV review — verify all assigned personnel, document updates'],
          ['Jun',     'Semi-annual records brief (ORB/ERB) update — prior to any PCS or promotion board'],
          ['Q1/Q3',   'OER senior rater profile review — coordinate rating chain and profiles each quarter'],
          ['Ongoing', 'Promotion boards — submit packets 45 days prior to convening date each cycle'],
          ['Ongoing', 'SARM clearance renewals — initiate PRR 90 days before expiration date'],
        ].map(([period, item]) => (
          <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'8px 0', borderBottom:'1px solid #141414', fontSize:12 }}>
            <span style={{ fontSize:10, fontWeight:700, color:'#c9a227', width:60, flexShrink:0 }}>{period}</span>
            <span style={{ color:'#888', lineHeight:1.5 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
  if (adminSubTab === 'planning') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-project-diagram" /> S1 Planning Factors</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Factor</th><th>Detail</th><th>Impact Area</th></tr></thead>
          <tbody>
            {PLANNING_FACTORS.map((f, i) => (
              <tr key={i}>
                <td style={{ fontWeight:700, color:'#ccc', width:180 }}>{f.factor}</td>
                <td style={{ fontSize:11, color:'#888', lineHeight:1.5 }}>{f.detail}</td>
                <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(201,162,39,0.1)', color:'#c9a227' }}>{f.impact}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  return null
})()}
      </div>
    )
  }

  // ── ADM-COMMS (6) ─────────────────────────────────────────────────────────
  if (subPage === 'adm-comms') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <div className={shared.header}>
          <h2><i className="fas fa-satellite-dish" /> 6 — Comms</h2>
        </div>

        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><i className="fas fa-address-book" /> S1 Contact Roster</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`${styles.srcBadge} ${styles.srcIppsa}`}>IPPSA</span>
              <span className={`${styles.srcBadge} ${styles.srcThreads}`}>THREADS Profile</span>
            </div>
          </div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr>
                  <th>Grade <span className={`${styles.srcBadge} ${styles.srcIppsa}`}>IPPSA</span></th>
                  <th>Name <span className={`${styles.srcBadge} ${styles.srcIppsa}`}>IPPSA</span></th>
                  <th>MOS</th>
                  <th>Position</th>
                  <th>Phone <span className={`${styles.srcBadge} ${styles.srcThreads}`}>Profile</span></th>
                  <th>Email <span className={`${styles.srcBadge} ${styles.srcThreads}`}>Profile</span></th>
                </tr>
              </thead>
              <tbody>
                {S1_ROSTER_POSITIONS.map(pos => (
                  <tr key={pos.position}>
                    <td><span className={styles.srcPending}>IPPSA data input</span></td>
                    <td><span className={styles.srcPending}>IPPSA data input</span></td>
                    <td>{pos.mos}</td>
                    <td>{pos.position}</td>
                    <td><span className={styles.srcPending}>Profile data input</span></td>
                    <td><span className={styles.srcPending}>Profile data input</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-phone-alt" /> Key External Contacts</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Organization</th><th>POC</th><th>Role</th><th>Phone</th><th>Email</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {['G1 / Brigade S1','HRC Customer Service','Finance / DFAS','JAG Office','Retention NCO'].map(org => (
                  <tr key={org}>
                    <td style={{ fontWeight: 600, color: '#ccc' }}>{org}</td>
                    <td><P /></td><td><P /></td><td><P /></td><td><P /></td><td><P /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  if (adminSubTab === 'contact-roster') return (
    <div className={shared.card}>
      <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span><i className="fas fa-address-book" /> S1 Shop — Contact Roster (Source: IPPSA)</span>
        <span className={`${styles.srcBadge} ${styles.srcIppsa}`}>IPPSA</span>
      </div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Grade</th><th>Name</th><th>MOS</th><th>Position</th><th>Section</th><th>ETS</th></tr></thead>
          <tbody>
            {S1_SECTION_SOLDIERS.map(s => (
              <tr key={s.edipi}>
                <td style={{ fontWeight:700 }}>{s.gradeCode}</td>
                <td>{s.lastName}, {s.firstName.charAt(0)}.</td>
                <td style={{ fontSize:10, color:'#666' }}>{s.mos}</td>
                <td style={{ fontSize:11 }}>{s.positionTitle}</td>
                <td style={{ color:'#555', fontSize:11 }}>{s.section}</td>
                <td style={{ fontSize:10, color: daysUntil(s.ets) < 180 ? '#e74c3c' : '#888' }}>{s.ets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'ext-contacts') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-phone-alt" /> External Contacts (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Organization</th><th>POC</th><th>Role</th><th>Phone</th><th>Email</th><th>Notes</th></tr></thead>
          <tbody>
            {EXT_CONTACTS.map((c, i) => (
              <tr key={i}>
                <td style={{ fontWeight:700, color:'#ccc' }}>{c.org}</td>
                <td>{c.poc}</td>
                <td style={{ fontSize:11, color:'#666' }}>{c.role}</td>
                <td style={{ fontSize:10, color:'#888', fontFamily:'monospace' }}>{c.phone}</td>
                <td style={{ fontSize:10, color:'#5a9adc', fontFamily:'monospace' }}>{c.email}</td>
                <td style={{ fontSize:11, color:'#555' }}>{c.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'message-log') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-envelope" /> Message Log (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Date</th><th>From</th><th>Subject</th><th>Priority</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
          <tbody>
            {MESSAGE_LOG.map((m, i) => {
              const sc = m.priority === 'High' ? '#e74c3c' : m.priority === 'Medium' ? '#e67e22' : '#555'
              const stC = m.status === 'Action Required' ? '#e74c3c' : m.status === 'Pending Action' ? '#e67e22' : m.status === 'Acknowledged' ? '#c9a227' : '#555'
              return (
                <tr key={i}>
                  <td style={{ fontSize:10, color:'#666' }}>{m.date}</td>
                  <td style={{ fontWeight:600, color:'#ccc' }}>{m.from}</td>
                  <td style={{ fontSize:11, maxWidth:200 }}>{m.subject}</td>
                  <td><span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{m.priority}</span></td>
                  <td><span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${stC}22`, color:stC }}>{m.status}</span></td>
                  <td style={{ fontSize:11, color:'#555' }}>{m.poc}</td>
                  <td style={{ fontSize:11, color:'#555', maxWidth:200 }}>{m.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  return null
})()}
      </div>
    )
  }

  // ── ADM-TRAINING (7) ──────────────────────────────────────────────────────
  if (subPage === 'adm-training') {
    const trainStats = [
      { label: 'Current',    value: '—', bg: STATUS_COLOR.Green },
      { label: 'Due 30-Day', value: '—', bg: STATUS_COLOR.Amber },
      { label: 'Overdue',    value: '—', bg: STATUS_COLOR.Red   },
      { label: 'N/A',        value: '—', bg: '#2d2d2d'          },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <div className={shared.header}>
          <h2><i className="fas fa-graduation-cap" /> 7 — Training</h2>
        </div>

        <div className={shared.stats}>
          {trainStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> S1 Fitness & Training Status (Source: DTMS)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Soldier</th><th>Rank</th><th>Section</th><th>AFT Date</th><th>AFT Score</th><th>AFT Status</th><th>CFT Date</th><th>CFT Grade</th></tr>
              </thead>
              <tbody>
                {DTMS_SOLDIERS.map((d, i) => {
                  const aftFail  = d.aftStatus === 'Fail'
                  const cftFail  = d.cftGrade.startsWith('NO-GO')
                  const exempt   = d.aftStatus.startsWith('Exempt')
                  return (
                    <tr key={i}>
                      <td>{d.name}</td>
                      <td>{d.rank}</td>
                      <td>{d.section}</td>
                      <td style={{ fontSize: 10, color: '#555' }}>{d.aftDate}</td>
                      <td style={{ fontWeight: 700, color: d.aftScore > 0 ? '#27ae60' : '#555' }}>
                        {d.aftScore > 0 ? d.aftScore : '—'}
                      </td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                          background: aftFail ? 'rgba(192,57,43,0.2)' : exempt ? '#1a1a1a' : 'rgba(45,106,79,0.2)',
                          color:      aftFail ? '#e74c3c'             : exempt ? '#555'     : '#27ae60',
                        }}>{d.aftStatus}</span>
                      </td>
                      <td style={{ fontSize: 10, color: '#555' }}>{d.cftDate}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                          background: cftFail ? 'rgba(192,57,43,0.2)' : exempt ? '#1a1a1a' : 'rgba(45,106,79,0.2)',
                          color:      cftFail ? '#e74c3c'             : exempt ? '#555'     : '#27ae60',
                        }}>{d.cftGrade}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-crosshairs" /> METL Tasks (S1)</div>
          <div className={shared.cardBody}>
            {[
              'Maintain personnel accountability (PERSTAT)',
              'Conduct casualty operations (CASREP / LOD)',
              'Process personnel actions (promotions, awards, separations)',
              'Execute personnel readiness management',
              'Manage essential personnel services (EPS)',
              'Coordinate postal operations in garrison and deployed environments',
            ].map(task => (
              <div key={task} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: '1px solid #141414', fontSize: 12, color: '#666' }}>
                <i className="fas fa-chevron-right" style={{ color: '#333', fontSize: 9, marginTop: 3, flexShrink: 0 }} />
                {task}
              </div>
            ))}
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  if (adminSubTab === 'requirements') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Training Requirements — AFT & CFT (Source: DTMS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Soldier</th><th>Rank</th><th>Section</th><th>AFT Date</th><th>AFT Score</th><th>AFT Status</th><th>CFT Date</th><th>CFT Grade</th></tr></thead>
          <tbody>
            {DTMS_SOLDIERS.map((d, i) => {
              const aftFail = d.aftStatus === 'Fail'
              const cftFail = d.cftGrade.startsWith('NO-GO')
              const exempt = d.aftStatus.startsWith('Exempt')
              return (
                <tr key={i}>
                  <td>{d.name}</td>
                  <td>{d.rank}</td>
                  <td style={{ color:'#666', fontSize:11 }}>{d.section}</td>
                  <td style={{ fontSize:10, color:'#555' }}>{d.aftDate}</td>
                  <td style={{ fontWeight:700, color: d.aftScore > 0 ? '#27ae60' : '#555' }}>{d.aftScore > 0 ? d.aftScore : '—'}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background: aftFail ? 'rgba(192,57,43,0.2)' : exempt ? '#1a1a1a' : 'rgba(45,106,79,0.2)', color: aftFail ? '#e74c3c' : exempt ? '#555' : '#27ae60' }}>{d.aftStatus}</span></td>
                  <td style={{ fontSize:10, color:'#555' }}>{d.cftDate}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background: cftFail ? 'rgba(192,57,43,0.2)' : exempt ? '#1a1a1a' : 'rgba(45,106,79,0.2)', color: cftFail ? '#e74c3c' : exempt ? '#555' : '#27ae60' }}>{d.cftGrade}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'metl') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-crosshairs" /> S1 METL Tasks</div>
      <div className={shared.cardBody}>
        {[
          ['Maintain personnel accountability (PERSTAT)', 'T'],
          ['Conduct casualty operations (CASREP / LOD determination)', 'T'],
          ['Process personnel actions (promotions, awards, separations)', 'T'],
          ['Execute personnel readiness management (MEDPROS, deployability)', 'P'],
          ['Manage essential personnel services (EPS) in deployed environment', 'P'],
          ['Coordinate postal operations in garrison and deployed environments', 'P'],
        ].map(([task, rating]) => {
          const rc = rating === 'T' ? '#27ae60' : '#c9a227'
          return (
            <div key={task} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:'1px solid #141414' }}>
              <span style={{ fontSize:12, fontWeight:800, padding:'2px 7px', borderRadius:3, background:`${rc}22`, color:rc, flexShrink:0 }}>{rating}</span>
              <span style={{ fontSize:12, color:'#888', lineHeight:1.5 }}>{task}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
  if (adminSubTab === 'certs') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-certificate" /> Certifications & Qualifications (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Soldier</th><th>Rank</th><th>Certification</th><th>Completed</th><th>Expires</th><th>Status</th><th>Issuing Org</th></tr></thead>
          <tbody>
            {CERT_RECORDS.map((c, i) => {
              const sc = c.status === 'Current' ? '#27ae60' : c.status === 'Pending' ? '#c9a227' : '#e74c3c'
              return (
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{c.soldier}</td>
                  <td>{c.rank}</td>
                  <td style={{ fontSize:11 }}>{c.cert}</td>
                  <td style={{ fontSize:10, color:'#888' }}>{c.completedDate}</td>
                  <td style={{ fontSize:10, color:'#888' }}>{c.expiresDate}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{c.status}</span></td>
                  <td style={{ fontSize:11, color:'#555' }}>{c.issuingOrg}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  return null
})()}
      </div>
    )
  }

  // ── ADM-RESOURCES (8) ─────────────────────────────────────────────────────
  if (subPage === 'adm-resources') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <div className={shared.header}>
          <h2><i className="fas fa-coins" /> 8 — Resources</h2>
        </div>

        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Execution</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Program</th><th>Authorization</th><th>Obligated</th><th>Expended</th><th>Balance</th><th>%</th></tr>
              </thead>
              <tbody>{placeholderRows(4, 6)}</tbody>
            </table>
          </div>
        </div>

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-boxes" /> Property Book (Source: GCSS-Army)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Item</th><th>LIN</th><th>NSN</th><th>Auth</th><th>On-Hand</th><th>Shortfall</th><th>Condition</th><th>Last Inventory</th><th>Flag</th></tr>
              </thead>
              <tbody>
                {GCSS_EQUIPMENT.map((eq, i) => {
                  const flagColor = eq.readinessFlag === 'Green' ? '#27ae60' : eq.readinessFlag === 'Amber' ? '#e67e22' : '#e74c3c'
                  return (
                    <tr key={i}>
                      <td style={{ fontSize: 11 }}>{eq.nomenclature}</td>
                      <td style={{ fontSize: 10, color: '#555' }}>{eq.lin}</td>
                      <td style={{ fontSize: 10, color: '#555' }}>{eq.nsn}</td>
                      <td style={{ textAlign: 'center' }}>{eq.qtyAuthorized}</td>
                      <td style={{ textAlign: 'center', color: eq.qtyOnHand < eq.qtyAuthorized ? '#e67e22' : '#ccc' }}>{eq.qtyOnHand}</td>
                      <td style={{ textAlign: 'center', color: eq.qtyShortfall > 0 ? '#e74c3c' : '#555' }}>
                        {eq.qtyShortfall > 0 ? `-${eq.qtyShortfall}` : '—'}
                      </td>
                      <td style={{ fontSize: 11 }}>{eq.condition}</td>
                      <td style={{ fontSize: 10, color: '#555' }}>{eq.lastInventory}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: flagColor + '22', color: flagColor }}>
                          {eq.readinessFlag}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  if (adminSubTab === 'budget') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Execution (Source: DTS + THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Program</th><th>FY Period</th><th>Authorization</th><th>Obligated</th><th>Expended</th><th>Balance</th><th>Exec %</th></tr></thead>
          <tbody>
            {BUDGET_LINES.map((b, i) => {
              const pct = Math.round((b.expended / b.authorization) * 100)
              const balC = b.authorization - b.obligated < 500 ? '#e74c3c' : b.authorization - b.obligated < 2000 ? '#e67e22' : '#27ae60'
              return (
                <tr key={i}>
                  <td style={{ fontWeight:700, color:'#ccc' }}>{b.program}</td>
                  <td style={{ fontSize:10, color:'#555' }}>{b.fy}</td>
                  <td style={{ color:'#c9a227' }}>${b.authorization.toLocaleString()}</td>
                  <td>${b.obligated.toLocaleString()}</td>
                  <td>${b.expended.toLocaleString()}</td>
                  <td style={{ color:balC, fontWeight:700 }}>${(b.authorization - b.obligated).toLocaleString()}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${balC}22`, color:balC }}>{pct}%</span></td>
                </tr>
              )
            })}
            <tr style={{ borderTop:'2px solid #2a2a2a' }}>
              <td colSpan={2} style={{ fontWeight:800, color:'#ccc' }}>TOTAL</td>
              <td style={{ fontWeight:800, color:'#c9a227' }}>${BUDGET_LINES.reduce((a,b) => a + b.authorization, 0).toLocaleString()}</td>
              <td style={{ fontWeight:700 }}>${BUDGET_LINES.reduce((a,b) => a + b.obligated, 0).toLocaleString()}</td>
              <td style={{ fontWeight:700 }}>${BUDGET_LINES.reduce((a,b) => a + b.expended, 0).toLocaleString()}</td>
              <td style={{ fontWeight:800, color:'#27ae60' }}>${BUDGET_LINES.reduce((a,b) => a + (b.authorization - b.obligated), 0).toLocaleString()}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'property') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-boxes" /> Property Book (Source: GCSS-Army)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Item</th><th>LIN</th><th>NSN</th><th>Auth</th><th>On-Hand</th><th>Shortfall</th><th>Condition</th><th>Last Inv.</th><th>Flag</th></tr></thead>
          <tbody>
            {GCSS_EQUIPMENT.map((eq, i) => {
              const fc = eq.readinessFlag === 'Green' ? '#27ae60' : eq.readinessFlag === 'Amber' ? '#e67e22' : '#e74c3c'
              return (
                <tr key={i}>
                  <td style={{ fontSize:11 }}>{eq.nomenclature}</td>
                  <td style={{ fontSize:10, color:'#555' }}>{eq.lin}</td>
                  <td style={{ fontSize:10, color:'#444', fontFamily:'monospace' }}>{eq.nsn}</td>
                  <td style={{ textAlign:'center' }}>{eq.qtyAuthorized}</td>
                  <td style={{ textAlign:'center', color: eq.qtyOnHand < eq.qtyAuthorized ? '#e67e22' : '#ccc' }}>{eq.qtyOnHand}</td>
                  <td style={{ textAlign:'center', color: eq.qtyShortfall > 0 ? '#e74c3c' : '#333' }}>{eq.qtyShortfall > 0 ? `-${eq.qtyShortfall}` : '—'}</td>
                  <td style={{ fontSize:11, maxWidth:180 }}>{eq.condition}</td>
                  <td style={{ fontSize:10, color:'#555' }}>{eq.lastInventory}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${fc}22`, color:fc }}>{eq.readinessFlag}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'requests') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-file-invoice" /> Resource Requests (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Req #</th><th>Item</th><th>Type</th><th>Submitted</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
          <tbody>
            {RESOURCE_REQUESTS.map((r, i) => {
              const sc = r.status === 'Approved' ? '#27ae60' : r.status === 'Pending' ? '#c9a227' : '#e67e22'
              return (
                <tr key={i}>
                  <td style={{ fontSize:10, color:'#555', fontFamily:'monospace' }}>{r.reqNo}</td>
                  <td style={{ fontWeight:600, color:'#ccc' }}>{r.item}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:'#1a1a1a', color:'#666' }}>{r.type}</span></td>
                  <td style={{ fontSize:10, color:'#888' }}>{r.submittedDate}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{r.status}</span></td>
                  <td style={{ fontSize:11, color:'#555' }}>{r.poc}</td>
                  <td style={{ fontSize:11, color:'#555', maxWidth:220 }}>{r.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  return null
})()}
      </div>
    )
  }

  // ── ADM-COORD (9) ─────────────────────────────────────────────────────────
  if (subPage === 'adm-coord') {
    const coordStats = [
      { label: 'Open Coord Requests', value: '—', bg: '#2d2d2d'          },
      { label: 'Pending Response',    value: '—', bg: STATUS_COLOR.Amber },
      { label: 'Completed',           value: '—', bg: STATUS_COLOR.Green },
      { label: 'Overdue',             value: '—', bg: STATUS_COLOR.Red   },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        {adminSubTab === 'summary' && (
          <>
        <div className={shared.header}>
          <h2><i className="fas fa-handshake" /> 9 — Coordinations</h2>
        </div>

        <div className={shared.stats}>
          {coordStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader}><i className="fas fa-project-diagram" /> Coordination Tracker</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Date</th><th>Request</th><th>Requesting Unit</th><th>S1 POC</th><th>Status</th><th>Due Date</th><th>Notes</th></tr>
              </thead>
              <tbody>{placeholderRows(4, 7)}</tbody>
            </table>
          </div>
        </div>

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-users" /> Key Rep Contacts</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Organization</th><th>Rep Name</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr>
              </thead>
              <tbody>{placeholderRows(4, 5)}</tbody>
            </table>
          </div>
        </div>
          </>
        )}
        {adminSubTab !== 'summary' && (() => {
  if (adminSubTab === 'coord-tracker') return (
    <div className={shared.card}>
      <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span><i className="fas fa-project-diagram" /> Coordination Tracker (Source: THREADS)</span>
        <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:3, background:'rgba(201,162,39,0.1)', color:'#c9a227' }}>{COORD_TRACKER.filter(c => c.status !== 'Completed').length} OPEN</span>
      </div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Date</th><th>Request</th><th>Requesting Unit</th><th>POC</th><th>Status</th><th>Due</th><th>Notes</th></tr></thead>
          <tbody>
            {COORD_TRACKER.map((c, i) => {
              const sc = c.status === 'Completed' ? '#27ae60' : c.status === 'In Progress' ? '#c9a227' : c.status === 'Acknowledged' ? '#5a9adc' : '#e74c3c'
              return (
                <tr key={i}>
                  <td style={{ fontSize:10, color:'#666' }}>{c.date}</td>
                  <td style={{ fontWeight:600, color:'#ccc', maxWidth:200 }}>{c.request}</td>
                  <td style={{ fontSize:11, color:'#888' }}>{c.requestingUnit}</td>
                  <td style={{ fontSize:11, color:'#666' }}>{c.poc}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{c.status}</span></td>
                  <td style={{ fontSize:10, color:'#888' }}>{c.dueDate}</td>
                  <td style={{ fontSize:11, color:'#555', maxWidth:200 }}>{c.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'key-contacts') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-users" /> Key Representative Contacts (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Organization</th><th>Rep Name</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
          <tbody>
            {KEY_CONTACTS.map((c, i) => (
              <tr key={i}>
                <td style={{ fontWeight:700, color:'#ccc' }}>{c.org}</td>
                <td>{c.rep}</td>
                <td style={{ fontSize:11, color:'#666' }}>{c.role}</td>
                <td style={{ fontSize:10, color:'#888', fontFamily:'monospace' }}>{c.phone}</td>
                <td style={{ fontSize:10, color:'#555' }}>{c.lastContact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'deconflict') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-handshake" /> Deconfliction Log (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Date</th><th>Issue</th><th>Resolved By</th><th>Status</th><th>Action Taken</th></tr></thead>
          <tbody>
            {DECONFLICT_LOG.map((d, i) => {
              const sc = d.status === 'Resolved' ? '#27ae60' : '#e67e22'
              return (
                <tr key={i}>
                  <td style={{ fontSize:10, color:'#666' }}>{d.date}</td>
                  <td style={{ fontWeight:600, color:'#ccc', maxWidth:220 }}>{d.issue}</td>
                  <td style={{ fontSize:11, color:'#888' }}>{d.resolvedBy}</td>
                  <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:`${sc}22`, color:sc }}>{d.status}</span></td>
                  <td style={{ fontSize:11, color:'#555', maxWidth:220 }}>{d.action}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  if (adminSubTab === 'sync-log') return (
    <div className={shared.card}>
      <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
          <tbody>
            {SYNC_LOG.map((s, i) => (
              <tr key={i}>
                <td style={{ fontSize:10, color:'#666', whiteSpace:'nowrap' }}>{s.date}</td>
                <td style={{ fontWeight:700, color:'#ccc' }}>{s.meeting}</td>
                <td style={{ fontSize:11, color:'#888' }}>{s.attendees}</td>
                <td style={{ fontSize:11, color:'#555', maxWidth:200 }}>{s.keyItems}</td>
                <td style={{ fontSize:11, color:'#c9a227', maxWidth:200 }}>{s.actionItems}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
  return null
})()}
      </div>
    )
  }

  // ── DEFAULT FALLBACK ──────────────────────────────────────────────────────
  return (
    <div className={shared.page}>
      {pageHeader}
      <div className={shared.card}>
        <div className={shared.cardHeader}><i className="fas fa-tools" /> Under Construction</div>
        <div className={shared.cardBody}>
          <div className={shared.empty}>
            Page under construction — S1 / {subPage}
          </div>
        </div>
      </div>
    </div>
  )

  // ── MODAL RENDERER (used by overview, dashboard, reports) ─────────────────
  function renderModals() {
    if (modal === null) return null
    return (
      <div className={styles.overlay} onClick={closeModal}>
        <div
          className={`${styles.modal} ${modal.kind === 'detail' ? styles.modalSm : ''}`}
          onClick={e => e.stopPropagation()}
        >
          {/* VIEW ALL modal */}
          {modal.kind === 'view-all' && (
            <>
              <div className={styles.modalHeader}>
                <h3><i className="fas fa-users" /> All Personnel — S1 Section</h3>
                <div className={styles.modalActions}>
                  <button className={styles.btnSecondary} onClick={exportRoster}>
                    <i className="fas fa-download" /> Export CSV
                  </button>
                  <button className={styles.btnGhost} onClick={closeModal}>&times;</button>
                </div>
              </div>
              <div className={styles.modalBody}>
                {!hasSorData ? (
                  <div className={shared.empty}>Awaiting SOR data connection.</div>
                ) : (
                  <table className={shared.table} style={{ fontSize: 12 }}>
                    <thead>
                      <tr><th>Name</th><th>Rank</th><th>MOS</th><th>Position</th><th>Section</th><th>Med</th><th>ACFT</th><th></th></tr>
                    </thead>
                    <tbody>
                      {entries.map(([slug, s]) => (
                        <tr key={slug}>
                          <td>{s.name}</td>
                          <td>{s.rank}</td>
                          <td>{s.mos}</td>
                          <td>{s.position}</td>
                          <td>{s.section}</td>
                          <td>
                            <span className={shared.dot} style={{ background: STATUS_COLOR[String(s.medical?.status)] ?? '#555' }} />
                            {String(s.medical?.status ?? '—')}
                          </td>
                          <td>{String(s.acft?.score ?? '—')}</td>
                          <td>
                            <button
                              className={styles.btnDetail}
                              onClick={() => setModal({ kind: 'detail', slug })}
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className={styles.modalFooter}>
                <span style={{ fontSize: 11, color: '#444', marginRight: 'auto' }}>
                  {entries.length} personnel · Source: THREADS / pending IPPSA
                </span>
                <button className={styles.btnSecondary} onClick={closeModal}>Close</button>
              </div>
            </>
          )}

          {/* SOLDIER DETAIL modal */}
          {modal.kind === 'detail' && selSoldier && (
            <>
              <div className={styles.modalHeader}>
                <h3><i className="fas fa-id-card" /> Soldier Detail</h3>
                <button className={styles.btnGhost} onClick={closeModal}>&times;</button>
              </div>
              <div className={styles.modalBody}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  {selSoldier.rank} {selSoldier.name}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                  {selSoldier.position} · {selSoldier.mos} · {selSoldier.unit} / {selSoldier.section}
                </div>
                <dl className={shared.dl}>
                  <dt>DODID</dt>          <dd>{selSoldier.dodid}</dd>
                  <dt>Security</dt>       <dd>{selSoldier.security ?? '—'}</dd>
                  <dt>Medical</dt>        <dd>{String(selSoldier.medical?.status ?? '—')} · Dental {String(selSoldier.medical?.dental ?? '—')}</dd>
                  <dt>ACFT</dt>           <dd>{String(selSoldier.acft?.score ?? '—')} ({String(selSoldier.acft?.status ?? '—')})</dd>
                  <dt>Leave Balance</dt>  <dd>{selSoldier.leave?.balance ?? '—'} days ({selSoldier.leave?.useLose ?? 0} use/lose)</dd>
                  <dt>DD93 / SGLV</dt>   <dd>{selSoldier.dd93?.status ?? '—'} / {selSoldier.sglv?.status ?? '—'}</dd>
                  <dt>ETS</dt>            <dd>{selSoldier.ets}</dd>
                  <dt>Awards</dt>         <dd>{selSoldier.awards?.current?.join(', ') || '—'}</dd>
                </dl>
                <div style={{ marginTop: 16, padding: '10px 12px', background: '#0a0a0a', borderRadius: 4, fontSize: 11, color: '#333' }}>
                  <i className="fas fa-info-circle" style={{ marginRight: 6 }} />
                  Phone and email will display from THREADS Profile once integrated.
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.btnSecondary} onClick={closeModal}>Close</button>
              </div>
            </>
          )}

          {/* REPORT DETAIL modal */}
          {modal.kind === 'report' && selReport && (
            <>
              <div className={styles.modalHeader}>
                <h3><i className="fas fa-file-alt" /> {selReport.title}</h3>
                <div className={styles.modalActions}>
                  <button className={styles.btnSecondary} onClick={() => exportReport(selReport)}>
                    <i className="fas fa-download" /> Export CSV
                  </button>
                  <button className={styles.btnGhost} onClick={closeModal}>&times;</button>
                </div>
              </div>
              <div className={styles.modalBody}>
                <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>{selReport.desc}</p>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#444', textTransform: 'uppercase', marginBottom: 8 }}>
                  Report Fields &amp; Data Sources
                </div>
                <div className={styles.reportDetailGrid}>
                  {selReport.fields.map(([field, desc, src]) => (
                    <div key={field} className={styles.reportFieldRow}>
                      <span className={styles.reportFieldName}>{field}</span>
                      <span className={styles.reportFieldDesc}>{desc}</span>
                      <span className={styles.reportFieldSrc}>
                        <span className={`${styles.srcBadge} ${src === 'IPPSA' ? styles.srcIppsa : styles.srcThreads}`}>{src}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: '10px 12px', background: '#0a0a0a', borderRadius: 4, fontSize: 11, color: '#444' }}>
                  <i className="fas fa-plug" style={{ marginRight: 6 }} />
                  Live data populates once SOR connections are established. Export will include actual records when available.
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.btnSecondary} onClick={closeModal}>Close</button>
                <button className={styles.btnPrimary} onClick={() => exportReport(selReport)}>
                  <i className="fas fa-download" /> Export CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
}
