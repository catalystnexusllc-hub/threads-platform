/**
 * Shared PMCS / Maintenance seed data module.
 *
 * Sources:
 *   - NSN → TM interval mappings: equipment Technical Manuals (APD)
 *   - Governing policy: AR 750-1, DA Pam 750-8
 *   - Service due date computation: last-performed seed + interval days
 *   - Work orders: GCSS-Army / SAMS-E pattern
 *
 * Intended consumers: S1Page (A-4 Maintenance tab), StaffSection S4/S4 view
 */

export const EXTRACT_DATE = new Date('2026-06-18')


function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function pmcsStatus(lastPerformed: string, intervalDays: number): 'OVERDUE' | 'DUE' | 'Current' {
  const last = new Date(lastPerformed)
  const next = new Date(last)
  next.setDate(next.getDate() + intervalDays)
  const daysUntil = Math.floor((next.getTime() - EXTRACT_DATE.getTime()) / 86400000)
  if (daysUntil < 0)  return 'OVERDUE'
  if (daysUntil <= 7) return 'DUE'
  return 'Current'
}

// ── NSN → TM Interval lookup ──────────────────────────────────────────────────
// Keys are exact NSNs from GCSS_EQUIPMENT + common S1 shop items.
// TM refs from Army Publishing Directorate (APD). Intervals per PMCS tables.

export interface TmIntervalEntry {
  nomenclature: string
  tmRef: string
  governingRef: string
  maintenanceLevel: string
  intervals: { label: string; intervalLabel: string; days: number; performedBy: 'Operator' | 'Unit' | 'DS' }[]
}

export const NSN_TM_INTERVALS: Record<string, TmIntervalEntry> = {
  '1005-01-547-5660': {
    nomenclature:     'Rifle, 5.56MM, M4A1 Carbine',
    tmRef:            'TM 9-1005-319-10 / -20',
    governingRef:     'AR 750-1 · DA Pam 750-8',
    maintenanceLevel: 'Operator (O) / Unit (F)',
    intervals: [
      { label: 'Before Operations Check', intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'After Operations Clean',  intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'Weekly Function Check',   intervalLabel: 'Weekly',     days: 7,   performedBy: 'Operator' },
      { label: 'Semi-Annual Service',     intervalLabel: 'Semi-Annual',days: 182, performedBy: 'Unit'     },
    ],
  },
  '1005-01-631-1209': {
    nomenclature:     'Machine Gun, 5.56MM, M249 SAW',
    tmRef:            'TM 9-1005-201-10 / -20',
    governingRef:     'AR 750-1 · DA Pam 750-8',
    maintenanceLevel: 'Operator (O) / Unit (F)',
    intervals: [
      { label: 'Before Operations Check', intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'After Operations Clean',  intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'Quarterly Service',       intervalLabel: 'Quarterly',  days: 91,  performedBy: 'Unit'     },
      { label: 'Semi-Annual Inspection',  intervalLabel: 'Semi-Annual',days: 182, performedBy: 'Unit'     },
    ],
  },
  '5855-01-534-5931': {
    nomenclature:     'Night Vision Device, AN/PVS-14',
    tmRef:            'TM 11-5855-306-10 / -23&P',
    governingRef:     'AR 750-1 · TB 43-0001-39 (optics)',
    maintenanceLevel: 'Operator (O) / Unit (F)',
    intervals: [
      { label: 'Before Operations Check',   intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'Monthly Lens/Housing Check', intervalLabel: 'Monthly',   days: 30,  performedBy: 'Operator' },
      { label: 'Semi-Annual Boresight',      intervalLabel: 'Semi-Annual',days: 182, performedBy: 'Unit'    },
      { label: 'Annual Depot Calibration',   intervalLabel: 'Annual',    days: 365, performedBy: 'DS'       },
    ],
  },
  '5855-01-629-7267': {
    nomenclature:     'AN/PRC-163 IOFR Radio',
    tmRef:            'TM 11-5820-1210-10 / -23&P',
    governingRef:     'AR 750-1 · AR 25-2 (COMSEC)',
    maintenanceLevel: 'Operator (O) / Unit (F)',
    intervals: [
      { label: 'Before Operations BIT Check', intervalLabel: 'Before Ops', days: 1,  performedBy: 'Operator' },
      { label: 'Weekly Battery Check',         intervalLabel: 'Weekly',    days: 7,  performedBy: 'Operator' },
      { label: 'Quarterly Comms Check',        intervalLabel: 'Quarterly', days: 91, performedBy: 'Unit'     },
      { label: 'Annual Calibration / COMSEC',  intervalLabel: 'Annual',    days: 365,performedBy: 'DS'       },
    ],
  },
  '5820-01-659-2721': {
    nomenclature:     'AN/PRC-152A Multiband Radio',
    tmRef:            'TM 11-5820-1072-10 / -23&P',
    governingRef:     'AR 750-1 · AR 25-2 (COMSEC)',
    maintenanceLevel: 'Operator (O) / Unit (F)',
    intervals: [
      { label: 'Before Operations BIT Check',  intervalLabel: 'Before Ops', days: 1,  performedBy: 'Operator' },
      { label: 'Weekly Battery/Connector Check',intervalLabel: 'Weekly',    days: 7,  performedBy: 'Operator' },
      { label: 'Quarterly Service',             intervalLabel: 'Quarterly', days: 91, performedBy: 'Unit'     },
      { label: 'Annual Calibration / COMSEC',   intervalLabel: 'Annual',    days: 365,performedBy: 'DS'       },
    ],
  },
  // NSN 8340-01-620-8428 is tagged as HMMWV M1165A1 in GCSS seed; using vehicle TM
  '8340-01-620-8428': {
    nomenclature:     'HMMWV M1165A1 (Uparmored)',
    tmRef:            'TM 9-2320-387-10 / -20P',
    governingRef:     'AR 750-1 · DA Pam 750-8 · PMCS tables Fig 3-1',
    maintenanceLevel: 'Operator (O) / Unit (F)',
    intervals: [
      { label: 'Before Operations PMCS',    intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'Weekly PMCS',               intervalLabel: 'Weekly',     days: 7,   performedBy: 'Operator' },
      { label: 'Monthly PMCS',              intervalLabel: 'Monthly',    days: 30,  performedBy: 'Operator' },
      { label: '3,000-Mile / Quarterly Svc',intervalLabel: 'Quarterly',  days: 91,  performedBy: 'Unit'     },
      { label: '6,000-Mile / Semi-Annual Svc',intervalLabel:'Semi-Annual',days: 182, performedBy: 'Unit'    },
      { label: '12,000-Mile / Annual Svc',  intervalLabel: 'Annual',     days: 365, performedBy: 'Unit'     },
    ],
  },
  '1370-01-629-9980': {
    nomenclature:     'Mortar System, 60MM, M224A1',
    tmRef:            'TM 9-1010-232-10 / -20',
    governingRef:     'AR 750-1 · DA Pam 750-8',
    maintenanceLevel: 'Operator (O) / Unit (F)',
    intervals: [
      { label: 'Before Operations Check',   intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'After Operations Clean',    intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'Quarterly Inspection',      intervalLabel: 'Quarterly',  days: 91,  performedBy: 'Unit'     },
      { label: 'Semi-Annual Service',       intervalLabel: 'Semi-Annual',days: 182, performedBy: 'Unit'     },
    ],
  },
  '5180-01-603-0018': {
    nomenclature:     'DAGR GPS Receiver',
    tmRef:            'TM 11-5825-298-10 / -23&P',
    governingRef:     'AR 750-1',
    maintenanceLevel: 'Operator (O) / Unit (F)',
    intervals: [
      { label: 'Before Operations Check',  intervalLabel: 'Before Ops', days: 1,   performedBy: 'Operator' },
      { label: 'Monthly Battery Inspect',  intervalLabel: 'Monthly',    days: 30,  performedBy: 'Operator' },
      { label: 'Annual Calibration Check', intervalLabel: 'Annual',     days: 365, performedBy: 'DS'       },
    ],
  },
  // ── S1 Shop / Admin equipment (non-TM items, vendor SOP / AR 25-1) ─────────
  '7021-01-555-1234': {
    nomenclature:     'Desktop Computer',
    tmRef:            'AR 25-1 / Vendor SOP',
    governingRef:     'AR 25-1 (Army Information Technology)',
    maintenanceLevel: 'Unit (F)',
    intervals: [
      { label: 'Weekly Dust/Connection Check', intervalLabel: 'Weekly',  days: 7,   performedBy: 'Operator' },
      { label: 'Annual PM / Imaging',          intervalLabel: 'Annual',  days: 365, performedBy: 'Unit'     },
    ],
  },
  '7025-01-612-3456': {
    nomenclature:     'Printer / Scanner, MFC',
    tmRef:            'Vendor SOP',
    governingRef:     'AR 25-1',
    maintenanceLevel: 'Unit (F)',
    intervals: [
      { label: 'Quarterly Drum/Roller Clean', intervalLabel: 'Quarterly', days: 91, performedBy: 'Operator' },
      { label: 'Annual Vendor PM',            intervalLabel: 'Annual',    days: 365,performedBy: 'Unit'     },
    ],
  },
  '7490-01-441-9876': {
    nomenclature:     'Shredder, Cross-Cut',
    tmRef:            'Vendor SOP / AR 25-2',
    governingRef:     'AR 25-2 (Information Assurance)',
    maintenanceLevel: 'Operator (O)',
    intervals: [
      { label: 'Monthly Oiling / Jam Check',  intervalLabel: 'Monthly',    days: 30,  performedBy: 'Operator' },
      { label: 'Annual Blade Inspection',     intervalLabel: 'Annual',     days: 365, performedBy: 'Unit'     },
    ],
  },
  '7110-01-032-5432': {
    nomenclature:     'Safe / Vault, GSA-Approved',
    tmRef:            'GSA FSS Spec FF-L-2740 / Locksmith SOP',
    governingRef:     'AR 190-13 (Physical Security) · AR 380-5 (INFOSEC)',
    maintenanceLevel: 'Unit (F) / Contracted Locksmith',
    intervals: [
      { label: 'Monthly Lock/Seal Inspection', intervalLabel: 'Monthly', days: 30,  performedBy: 'Operator' },
      { label: 'Annual Combination Change',    intervalLabel: 'Annual',  days: 365, performedBy: 'Unit'     },
      { label: 'Annual GSA Locksmith Inspect', intervalLabel: 'Annual',  days: 365, performedBy: 'DS'       },
    ],
  },
}

// ── Last-performed seed dates (simulates GCSS-Army last service record) ───────
// Keyed by `${nsn}::${intervalLabel}` for per-interval tracking

const LAST_PERFORMED: Record<string, string> = {
  '1005-01-547-5660::Before Ops':   '2026-06-17',
  '1005-01-547-5660::Weekly':       '2026-06-14',
  '1005-01-547-5660::Semi-Annual':  '2026-01-15',
  '1005-01-631-1209::Before Ops':   '2026-06-17',
  '1005-01-631-1209::Quarterly':    '2026-03-01',
  '1005-01-631-1209::Semi-Annual':  '2026-01-10',
  '5855-01-534-5931::Before Ops':   '2026-06-17',
  '5855-01-534-5931::Monthly':      '2026-06-01',
  '5855-01-534-5931::Semi-Annual':  '2026-01-20',
  '5855-01-534-5931::Annual':       '2025-06-18', // exactly 1 year ago → OVERDUE
  '5855-01-629-7267::Before Ops':   '2026-06-17',
  '5855-01-629-7267::Weekly':       '2026-06-14',
  '5855-01-629-7267::Quarterly':    '2026-04-01',
  '5855-01-629-7267::Annual':       '2025-12-01',
  '5820-01-659-2721::Before Ops':   '2026-06-17',
  '5820-01-659-2721::Weekly':       '2026-06-11', // 7 days ago → DUE
  '5820-01-659-2721::Quarterly':    '2026-03-15',
  '5820-01-659-2721::Annual':       '2025-11-01',
  '8340-01-620-8428::Before Ops':   '2026-06-17',
  '8340-01-620-8428::Weekly':       '2026-06-10',
  '8340-01-620-8428::Monthly':      '2026-05-20',
  '8340-01-620-8428::Quarterly':    '2026-03-01', // 109 days ago → OVERDUE
  '8340-01-620-8428::Semi-Annual':  '2026-01-05',
  '8340-01-620-8428::Annual':       '2025-06-01',
  '1370-01-629-9980::Before Ops':   '2026-06-17',
  '1370-01-629-9980::Quarterly':    '2026-04-10',
  '1370-01-629-9980::Semi-Annual':  '2026-01-15',
  '5180-01-603-0018::Before Ops':   '2026-06-17',
  '5180-01-603-0018::Monthly':      '2026-06-01',
  '5180-01-603-0018::Annual':       '2026-01-10',
  '7021-01-555-1234::Weekly':       '2026-06-11', // DUE
  '7021-01-555-1234::Annual':       '2025-09-01',
  '7025-01-612-3456::Quarterly':    '2026-04-01',
  '7025-01-612-3456::Annual':       '2026-01-15',
  '7490-01-441-9876::Monthly':      '2026-05-15',
  '7490-01-441-9876::Annual':       '2025-07-01',
  '7110-01-032-5432::Monthly':      '2026-06-01',
  '7110-01-032-5432::Annual':       '2025-06-10', // OVERDUE
}

// ── Computed PMCS schedule ────────────────────────────────────────────────────

export interface PmcsRow {
  nsn: string
  nomenclature: string
  tmRef: string
  serviceType: string
  interval: string
  lastPerformed: string
  nextDue: string
  performedBy: string
  maintenanceLevel: string
  status: 'OVERDUE' | 'DUE' | 'Current'
}

export function computePmcsSchedule(nsns: string[]): PmcsRow[] {
  const rows: PmcsRow[] = []
  // Deduplicate NSNs (a unit may have 210 M4s but one PMCS row covers all)
  const seen = new Set<string>()
  for (const nsn of nsns) {
    if (seen.has(nsn)) continue
    seen.add(nsn)
    const entry = NSN_TM_INTERVALS[nsn]
    if (!entry) continue
    for (const iv of entry.intervals) {
      const key = `${nsn}::${iv.intervalLabel}`
      const lastPerformed = LAST_PERFORMED[key] ?? '2026-01-01'
      const status = pmcsStatus(lastPerformed, iv.days)
      const nextDue = addDays(lastPerformed, iv.days)
      rows.push({
        nsn,
        nomenclature:     entry.nomenclature,
        tmRef:            entry.tmRef,
        serviceType:      iv.label,
        interval:         iv.intervalLabel,
        lastPerformed:    new Date(lastPerformed).toLocaleDateString('en-US', { day:'2-digit', month:'short', year:'numeric' }),
        nextDue,
        performedBy:      iv.performedBy,
        maintenanceLevel: entry.maintenanceLevel,
        status,
      })
    }
  }
  // Sort: OVERDUE first, then DUE, then Current; within each group by nextDue
  const order = { OVERDUE: 0, DUE: 1, Current: 2 }
  return rows.sort((a, b) => order[a.status] - order[b.status] || a.nextDue.localeCompare(b.nextDue))
}

// ── Standard work orders (GCSS-Army / SAMS-E pattern, DA Form 5988-E) ────────

export interface WorkOrderRow {
  woNumber:      string
  nsn:           string
  nomenclature:  string
  fault:         string
  priority:      'URGENT' | 'Priority' | 'Routine'
  opened:        string
  estCompletion: string
  shop:          string
  status:        'Open' | 'In Progress' | 'Parts on Order' | 'Closed'
  nmc:           boolean
}

export const WORK_ORDERS: WorkOrderRow[] = [
  { woNumber:'WO-2026-0441', nsn:'7110-01-032-5432', nomenclature:'Safe / Vault (GSA)',    fault:'Combination lock stiff — annual inspection overdue; combination change required',         priority:'Routine', opened:'10 Jun 2026', estCompletion:'25 Jun 2026', shop:'S4 / GSA Locksmith',  status:'Open',        nmc:false },
  { woNumber:'WO-2026-0388', nsn:'8340-01-620-8428', nomenclature:'HMMWV M1165A1',         fault:'Engine oil leak at valve cover gasket; vehicle deadlined NMC',                            priority:'URGENT',  opened:'01 Jun 2026', estCompletion:'20 Jun 2026', shop:'BN Maint Shop',       status:'In Progress', nmc:true  },
  { woNumber:'WO-2026-0371', nsn:'1005-01-631-1209', nomenclature:'M249 SAW (4 barrels)',  fault:'4x barrels NMC — excessive headspace/timing; replacement requisition submitted',          priority:'Priority',opened:'28 May 2026', estCompletion:'30 Jun 2026', shop:'DS Armorer / SSA',    status:'Parts on Order',nmc:true  },
  { woNumber:'WO-2026-0344', nsn:'5855-01-629-7267', nomenclature:'AN/PRC-163 (×1)',       fault:'Battery module failure — transmit/receive intermittent; replaced battery, retesting',      priority:'Priority',opened:'22 May 2026', estCompletion:'25 Jun 2026', shop:'S6 Comms Shop',       status:'In Progress', nmc:true  },
  { woNumber:'WO-2026-0301', nsn:'7025-01-612-3456', nomenclature:'Printer / Scanner',    fault:'Paper feed jam — intermittent; feed roller worn',                                          priority:'Routine', opened:'20 May 2026', estCompletion:'05 Jun 2026', shop:'CIF / OEM Vendor',    status:'Closed',      nmc:false },
  { woNumber:'WO-2026-0277', nsn:'5820-01-659-2721', nomenclature:'AN/PRC-152A (×1)',      fault:'Transmit function inoperative — suspect PA module; returned to DS',                        priority:'URGENT',  opened:'15 May 2026', estCompletion:'30 Jun 2026', shop:'S6 Comms Shop',       status:'In Progress', nmc:true  },
  { woNumber:'WO-2026-0201', nsn:'5855-01-534-5931', nomenclature:'AN/PVS-14 (8 units)',  fault:'Optics depot repair — 8 units returned for lens/intensifier tube replacement',             priority:'Routine', opened:'01 Apr 2026', estCompletion:'30 Sep 2026', shop:'Depot / TACOM',       status:'Parts on Order',nmc:true  },
  { woNumber:'WO-2026-0188', nsn:'5180-01-603-0018', nomenclature:'DAGR GPS (4 units)',   fault:'4x units shortfall — on requisition awaiting depot issue; no fault on on-hand items',      priority:'Routine', opened:'10 May 2026', estCompletion:'31 Aug 2026', shop:'SSA / Depot',         status:'Parts on Order',nmc:false },
]

// ── Maintenance contacts (S4 / maintenance shop chain) ────────────────────────

export const MAINT_CONTACTS = [
  { role: 'S4 Officer',               name: 'CPT Ramos',    section: 'S4',       phone: '(270) 798-0010', email: 'ramos.e.mil@army.mil'    },
  { role: 'Maintenance Officer',      name: 'WO2 Torres',   section: 'S4',       phone: '(270) 798-0011', email: 'torres.m.mil@army.mil'   },
  { role: 'Motor Sergeant (NCOIC)',   name: 'SSG Reeves',   section: 'S4',       phone: '(270) 798-0012', email: 'reeves.d.mil@army.mil'   },
  { role: 'Armorer',                  name: 'SPC Wallace',  section: 'S4',       phone: '(270) 798-0013', email: 'wallace.t.mil@army.mil'  },
  { role: 'BN Maintenance Shop OIC',  name: 'WO3 Pham',     section: 'BN S4',    phone: '(270) 798-0020', email: 'pham.h.mil@army.mil'     },
  { role: 'S6 Comms Shop (COMSEC)',   name: 'SSG Griffith', section: 'S6',       phone: '(270) 798-0030', email: 'griffith.r.mil@army.mil' },
]

// ── Summary stats helper ───────────────────────────────────────────────────────

export function getMaintStats(rows: PmcsRow[], wos: WorkOrderRow[]) {
  return {
    overdue:      rows.filter(r => r.status === 'OVERDUE').length,
    due:          rows.filter(r => r.status === 'DUE').length,
    current:      rows.filter(r => r.status === 'Current').length,
    openWOs:      wos.filter(w => w.status !== 'Closed').length,
    nmcItems:     wos.filter(w => w.nmc && w.status !== 'Closed').length,
    partsOnOrder: wos.filter(w => w.status === 'Parts on Order').length,
  }
}
