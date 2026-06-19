import { useState } from 'react'
import { STATUS_COLOR } from '../util'
import shared from '../shared.module.css'
import styles from '../S1/S1Page.module.css'

// ── Types ──────────────────────────────────────────────────────────────────────
type ModalState = null | { kind: 'detail'; entityKey: string }

// ── SOR connections ────────────────────────────────────────────────────────────
const SS_SOR: { source: string; label: string; status: 'connected' | 'pending' | 'disconnected' }[] = [
  { source: 'IPPSA',   label: 'IPPSA',         status: 'pending'   },
  { source: 'MEDPROS', label: 'MEDPROS',        status: 'pending'   },
  { source: 'DTMS',    label: 'DTMS',           status: 'pending'   },
  { source: 'RCMS',    label: 'RCMS',           status: 'pending'   },
  { source: 'ASAP',    label: 'ASAP',           status: 'pending'   },
  { source: 'THREADS', label: 'THREADS Profile', status: 'connected' },
]

const SOR_CLS: Record<string, string> = {
  connected:    styles.sorConnected,
  pending:      styles.sorPending,
  disconnected: styles.sorDisconnect,
}

// ── Entity config ──────────────────────────────────────────────────────────────
interface SSEntity {
  key: string; label: string; icon: string; mos: string
  category: 'MEDICAL' | 'SAFETY' | 'EO' | 'ADMIN'
  categoryColor: string; charter: string; rank: string; incumbent: string
  phone: string
  responsibilities: { icon: string; title: string; desc: string }[]
}

const SS_ENTITIES: SSEntity[] = [
  {
    key: 'surgeon', label: 'Group Surgeon', icon: 'fa-stethoscope',
    mos: '60C / MC', category: 'MEDICAL', categoryColor: '#27ae60',
    charter: 'Advises the Group Commander on all medical matters affecting unit personnel and operations. Responsible for medical readiness, clinical oversight, and coordination with higher medical authorities to sustain the health and readiness of the force.',
    rank: 'MAJ', incumbent: 'Chen', phone: 'DSN 635-1420',
    responsibilities: [
      { icon: 'fa-heart',             title: 'Medical Readiness',       desc: 'Oversees MEDPROS compliance, deployment medical standards, and overall unit health metrics.' },
      { icon: 'fa-stethoscope',       title: 'Clinical Operations',      desc: 'Supervises sick call, clinical care standards, and medical personnel performance.' },
      { icon: 'fa-shield-virus',      title: 'Preventive Medicine',      desc: 'Manages immunization programs, field sanitation, and DNBI prevention.' },
      { icon: 'fa-brain',             title: 'BH Coordination',          desc: 'Coordinates behavioral health referrals, PDHRA, and combat stress management.' },
      { icon: 'fa-file-medical',      title: 'Medical Records',          desc: 'Ensures proper management of medical records per AR 40-66 and HIPAA.' },
      { icon: 'fa-ambulance',         title: 'MEDEVAC Coordination',     desc: 'Plans and coordinates medical evacuation support for training and deployed ops.' },
    ],
  },
  {
    key: 'pa', label: 'Physician Assistant', icon: 'fa-user-md',
    mos: '65D', category: 'MEDICAL', categoryColor: '#27ae60',
    charter: 'Provides mid-level clinical care, assists the Group/Battalion Surgeon, and serves as the primary clinical practitioner for routine and emergent soldier medical care.',
    rank: 'CPT', incumbent: 'Rodriguez', phone: 'DSN 635-1422',
    responsibilities: [
      { icon: 'fa-stethoscope',       title: 'Clinical Care',            desc: 'Provides diagnosis, treatment, and management of acute and chronic conditions.' },
      { icon: 'fa-syringe',           title: 'Immunizations',            desc: 'Administers immunizations and manages immunization records.' },
      { icon: 'fa-file-prescription', title: 'Medication Management',    desc: 'Prescribes and manages medications within scope of practice.' },
      { icon: 'fa-dna',               title: 'Physical Exams',           desc: 'Conducts PHAs, flight physicals, and deployment clearances.' },
      { icon: 'fa-hands-helping',     title: 'Sick Call Support',        desc: 'Augments sick call operations; manages overflow and follow-up care.' },
    ],
  },
  {
    key: 'safety', label: 'Safety Officer', icon: 'fa-hard-hat',
    mos: 'Any / Safety AOC', category: 'SAFETY', categoryColor: '#e67e22',
    charter: 'Advises the commander on risk management, accident prevention, and safety program compliance per AR 385-10. Responsible for developing and maintaining the unit safety program to protect personnel, equipment, and facilities.',
    rank: 'CPT', incumbent: 'Navarro', phone: 'DSN 635-1500',
    responsibilities: [
      { icon: 'fa-exclamation-triangle', title: 'Accident Prevention',   desc: 'Identifies and mitigates hazards; coordinates safety standdowns and training events.' },
      { icon: 'fa-clipboard-check',   title: 'Risk Assessment',          desc: 'Develops and reviews risk assessments for all training and operational activities.' },
      { icon: 'fa-chart-bar',         title: 'Safety Reporting',         desc: 'Submits DA Form 285 accident reports; maintains the unit accident and incident log.' },
      { icon: 'fa-chalkboard-teacher', title: 'Safety Training',         desc: 'Plans and tracks mandatory safety training per command guidance and AR 385-10.' },
      { icon: 'fa-tools',             title: 'Hazard Abatement',         desc: 'Tracks identified hazards from discovery through resolution and closure.' },
      { icon: 'fa-flask',             title: 'ASAP Coordination',        desc: 'Coordinates Army Substance Abuse Program referrals and follow-up actions.' },
    ],
  },
  {
    key: 'cbrn', label: 'CBRN Officer', icon: 'fa-biohazard',
    mos: '74A', category: 'SAFETY', categoryColor: '#e67e22',
    charter: 'Advises the commander on CBRN threats and defensive operations. Manages the unit CBRN defense program including equipment accountability, decontamination planning, and training.',
    rank: 'CPT', incumbent: 'Park', phone: 'DSN 635-1501',
    responsibilities: [
      { icon: 'fa-biohazard',         title: 'CBRN Threat Assessment',   desc: 'Monitors CBRN threat environment; integrates into operational planning.' },
      { icon: 'fa-box',               title: 'IPE Accountability',       desc: 'Manages individual protective equipment; conducts semi-annual inventories.' },
      { icon: 'fa-shower',            title: 'Decontamination Planning',  desc: 'Plans and rehearses unit decontamination operations for all CBRN scenarios.' },
      { icon: 'fa-chalkboard-teacher', title: 'CBRN Training',           desc: 'Coordinates CBRN training events; tracks completion per unit training plan.' },
      { icon: 'fa-radiation',         title: 'RADCON Planning',           desc: 'Develops radiation control procedures and nuclear/radiological response plans.' },
    ],
  },
  {
    key: 'bn-safety', label: 'Safety NCO', icon: 'fa-shield-alt',
    mos: 'Any', category: 'SAFETY', categoryColor: '#e67e22',
    charter: 'Executes the battalion safety program at the NCO level; assists the Safety Officer with risk assessment reviews, hazard tracking, and mandatory safety training compliance.',
    rank: 'SFC', incumbent: 'Torres', phone: 'DSN 635-1502',
    responsibilities: [
      { icon: 'fa-list-check',        title: 'Training Compliance',      desc: 'Tracks and enforces mandatory safety training completion across all sections.' },
      { icon: 'fa-exclamation',       title: 'Incident Reporting',       desc: 'Collects and processes near-miss and incident reports.' },
      { icon: 'fa-search',            title: 'Hazard Inspections',       desc: 'Conducts monthly safety inspections of facilities, motor pools, and training areas.' },
      { icon: 'fa-book',              title: 'Safety Records',           desc: 'Maintains safety records, DA 285 log, and regulatory compliance files.' },
    ],
  },
  {
    key: 'sharp', label: 'SHARP Team', icon: 'fa-shield-alt',
    mos: 'SARC / SHARP Advisor', category: 'EO', categoryColor: '#9b59b6',
    charter: 'Manages the Sexual Harassment/Assault Response and Prevention (SHARP) program per AR 600-20 Chapter 7. Coordinates victim advocacy, unrestricted and restricted reporting procedures, and annual SHARP training to eliminate sexual harassment and assault within the unit.',
    rank: 'CPT', incumbent: 'Reeves', phone: 'DSN 635-1602',
    responsibilities: [
      { icon: 'fa-life-ring',          title: 'Victim Advocacy',          desc: 'Coordinates victim advocacy services; ensures victims receive immediate support and referrals.' },
      { icon: 'fa-file-alt',           title: 'Reporting Procedures',     desc: 'Manages unrestricted and restricted reporting channels per SHARP SOP and AR 600-20.' },
      { icon: 'fa-chalkboard-teacher', title: 'SHARP Training',           desc: 'Plans and executes annual SHARP training requirement for all unit members.' },
      { icon: 'fa-poll',               title: 'Command Climate Surveys',  desc: 'Administers CCS; analyzes results and briefs commander on climate trends.' },
      { icon: 'fa-phone-alt',          title: 'Crisis Response',          desc: 'Coordinates 24/7 crisis response; liaises with MTF, CID, and SJA.' },
      { icon: 'fa-gavel',              title: 'Case Tracking',            desc: 'Tracks open SHARP cases; ensures timely referrals and administrative actions.' },
    ],
  },
  {
    key: 'at-team', label: 'AT Team', icon: 'fa-shield-alt',
    mos: 'AT Officer / ATFP NCO', category: 'EO', categoryColor: '#9b59b6',
    charter: 'Advises the commander on anti-terrorism and force protection matters per AR 525-13. Develops and maintains the unit anti-terrorism program, conducts vulnerability assessments, and coordinates security measures to protect personnel, facilities, and equipment from terrorist threats.',
    rank: 'CPT', incumbent: 'Hayes', phone: 'DSN 635-1605',
    responsibilities: [
      { icon: 'fa-shield-alt',          title: 'AT Program Management',      desc: 'Develops, coordinates, and maintains the unit AT program per AR 525-13 and DOD-O-2000.12-H.' },
      { icon: 'fa-search',              title: 'Vulnerability Assessments',  desc: 'Conducts and tracks physical security and vulnerability assessments of facilities and operations.' },
      { icon: 'fa-file-alt',            title: 'AT Plans & SOPs',            desc: 'Drafts and maintains AT plans, unit protection SOPs, and supporting annexes.' },
      { icon: 'fa-chalkboard-teacher',  title: 'AT Training',                desc: 'Plans and executes Level I AT awareness training and unit-specific threat briefings.' },
      { icon: 'fa-bell',                title: 'Threat Reporting',           desc: 'Monitors FPCON levels; coordinates reporting of suspicious activity and threat indicators.' },
      { icon: 'fa-users-cog',           title: 'AT Coordination',            desc: 'Coordinates with installation AT officer, MP, CID, and higher HQ AT elements.' },
    ],
  },
  {
    key: 'eo', label: 'EO Team', icon: 'fa-balance-scale',
    mos: 'Any / EO Collateral', category: 'EO', categoryColor: '#9b59b6',
    charter: 'Advises the commander on equal opportunity matters; ensures compliance with AR 600-20 by developing and implementing the unit EO program and coordinating with SHARP and EEO programs.',
    rank: 'CPT', incumbent: 'Davis', phone: 'DSN 635-1600',
    responsibilities: [
      { icon: 'fa-balance-scale',      title: 'EO Program Management',   desc: 'Plans, coordinates, and executes the unit EO program per AR 600-20.' },
      { icon: 'fa-file-alt',           title: 'Complaint Processing',     desc: 'Receives, processes, and tracks formal and informal EO complaints.' },
      { icon: 'fa-chalkboard-teacher', title: 'EO Training',             desc: 'Coordinates mandatory annual EO training for all unit members.' },
      { icon: 'fa-poll',               title: 'Command Climate Surveys',  desc: 'Administers and analyzes command climate surveys; briefs results to commander.' },
      { icon: 'fa-hands-helping',      title: 'SHARP Coordination',       desc: 'Integrates SHARP program into EO efforts; coordinates with SARC.' },
      { icon: 'fa-gavel',              title: 'Regulatory Compliance',    desc: 'Ensures unit EO posture complies with DoD and Army directives.' },
    ],
  },
  {
    key: 'eeo-teams', label: 'EEO Team', icon: 'fa-users',
    mos: 'Civilian / DA Civ', category: 'EO', categoryColor: '#9b59b6',
    charter: 'Ensures compliance with Title VII, the Rehabilitation Act, and EEOC regulations for civilian employees assigned to the command. Processes civilian EEO complaints, coordinates reasonable accommodation requests, and fosters a diverse and inclusive workplace.',
    rank: 'GS-12', incumbent: 'Morgan', phone: 'DSN 635-1603',
    responsibilities: [
      { icon: 'fa-user-tie',           title: 'Civilian EEO Complaints',  desc: 'Receives and processes civilian discrimination complaints per 29 CFR Part 1614.' },
      { icon: 'fa-universal-access',   title: 'Reasonable Accommodations', desc: 'Coordinates RA requests; liaises with HR and medical for approvals.' },
      { icon: 'fa-graduation-cap',     title: 'EEO Training',             desc: 'Delivers EEO awareness training for supervisors and civilian workforce.' },
      { icon: 'fa-chart-pie',          title: 'Diversity & Inclusion',    desc: 'Monitors workforce diversity metrics; advises leadership on D&I initiatives.' },
      { icon: 'fa-file-contract',      title: 'Regulatory Compliance',    desc: 'Ensures command EEO posture meets EEOC and HQDA requirements.' },
    ],
  },
  {
    key: 'as-team', label: 'AS Team', icon: 'fa-flask',
    mos: 'ASAP SAC / DA Civ', category: 'EO', categoryColor: '#9b59b6',
    charter: 'Manages the unit Army Substance Abuse Program (ASAP). Provides substance abuse prevention, assessment, referral, and treatment services. Advises the commander on alcohol and drug abuse trends and supports the unit\'s readiness through early intervention and rehabilitation.',
    rank: 'GS-9', incumbent: 'Calloway', phone: 'DSN 635-1610',
    responsibilities: [
      { icon: 'fa-user-shield',      title: 'Commander Referrals',      desc: 'Processes mandatory commander referrals for substance abuse assessment per AR 600-85.' },
      { icon: 'fa-share-square',     title: 'Self / Medical Referrals', desc: 'Accepts and processes voluntary self-referrals and medical provider referrals.' },
      { icon: 'fa-vial',             title: 'Drug Testing Coordination', desc: 'Coordinates unit urinalysis program; manages random selection and testing schedules.' },
      { icon: 'fa-hospital',         title: 'Treatment Management',      desc: 'Coordinates inpatient and outpatient treatment; tracks enrollment and discharge status.' },
      { icon: 'fa-chart-line',       title: 'Prevention Programs',       desc: 'Delivers ASAP prevention education; coordinates Risk Reduction Program activities.' },
      { icon: 'fa-clipboard-list',   title: 'Reporting & Compliance',    desc: 'Submits ASAP quarterly reports; ensures compliance with AR 600-85 and DA policy.' },
    ],
  },
  {
    key: 'finance', label: 'Finance Officer', icon: 'fa-dollar-sign',
    mos: '36A / 44A', category: 'ADMIN', categoryColor: '#3498db',
    charter: 'Provides financial management support to the command; ensures timely and accurate pay actions, travel voucher processing, and financial reporting per AR 37-104-4.',
    rank: 'CPT', incumbent: 'Phillips', phone: 'DSN 635-1700',
    responsibilities: [
      { icon: 'fa-money-check-alt',   title: 'Pay Action Processing',    desc: 'Initiates, tracks, and resolves pay actions; coordinates with DFAS and IPAC.' },
      { icon: 'fa-credit-card',       title: 'GTCC Management',          desc: 'Manages Government Travel Charge Card program; resolves delinquency issues.' },
      { icon: 'fa-plane',             title: 'DTS / Travel Vouchers',    desc: 'Oversees Defense Travel System usage; processes TDY and school vouchers.' },
      { icon: 'fa-file-invoice-dollar', title: 'Budget Execution',       desc: 'Tracks unit budget allocations, commitments, and expenditures.' },
      { icon: 'fa-calculator',        title: 'Audit & Reconciliation',   desc: 'Conducts monthly reconciliation of accounts; supports command finance audits.' },
      { icon: 'fa-hand-holding-usd',  title: 'SRB / Bonus Actions',      desc: 'Coordinates selective reenlistment bonus payments and bonus reconciliation.' },
    ],
  },
  {
    key: 'retention', label: 'Career Counselor', icon: 'fa-handshake',
    mos: '79V', category: 'ADMIN', categoryColor: '#3498db',
    charter: 'Advises the commander on retention objectives; manages the unit retention program and coordinates reenlistment actions, SRB management, and career counseling per AR 601-280.',
    rank: 'SFC', incumbent: 'Garza', phone: 'DSN 635-1701',
    responsibilities: [
      { icon: 'fa-handshake',         title: 'Reenlistment Processing',  desc: 'Processes reenlistment documents; coordinates ceremonies and SRB payments.' },
      { icon: 'fa-user-check',        title: 'Retention Counseling',     desc: 'Conducts career counseling with soldiers approaching ETS; maintains RCMS.' },
      { icon: 'fa-bullseye',          title: 'Retention Objectives',     desc: 'Tracks unit reenlistment objectives and reports progress to commander quarterly.' },
      { icon: 'fa-money-bill-wave',   title: 'SRB Management',           desc: 'Identifies SRB-eligible soldiers; coordinates bonus payments with finance.' },
      { icon: 'fa-calendar-check',    title: 'Retention Board Coord',    desc: 'Prepares and executes retention boards; documents results per AR 601-280.' },
      { icon: 'fa-clipboard-list',    title: 'ETS Tracking',             desc: 'Maintains the 18-month ETS tracker; coordinates with S1 on separation timelines.' },
    ],
  },
  {
    key: 'career-counselor', label: 'Career Counselor', icon: 'fa-user-graduate',
    mos: '79V', category: 'ADMIN', categoryColor: '#3498db',
    charter: 'Advises soldiers on career options, reenlistment eligibility, and Army programs. Coordinates with the retention NCO to align soldier career goals with Army needs, and provides counseling on MOS reclassification, civilian education incentives, and benefits.',
    rank: 'SFC', incumbent: 'Rivera', phone: 'DSN 635-1702',
    responsibilities: [
      { icon: 'fa-comments',           title: 'Career Counseling',        desc: 'Conducts individual counseling sessions to align soldier career goals with available Army options.' },
      { icon: 'fa-exchange-alt',       title: 'MOS Reclassification',     desc: 'Advises on and processes MOS reclassification requests per AR 614-200.' },
      { icon: 'fa-graduation-cap',     title: 'Education Programs',       desc: 'Briefs soldiers on Army Continuing Education, Green to Gold, and civilian education benefits.' },
      { icon: 'fa-list-alt',           title: 'Options Counseling',       desc: 'Identifies and briefs assignment options, special duty opportunities, and career broadening programs.' },
      { icon: 'fa-chart-line',         title: 'Career Tracking',          desc: 'Maintains counseling records and tracks follow-up actions for all counseled soldiers.' },
      { icon: 'fa-hand-holding-heart', title: 'Benefits Advisement',      desc: 'Advises on Army benefits, incentive programs, and quality-of-life resources.' },
    ],
  },
]

// ── Seed data ──────────────────────────────────────────────────────────────────
const SAFETY_INCIDENTS = [
  { date: '12 Jun 2026', type: 'Vehicle Mishap',   unit: '1/5 Alpha',   severity: 'Class C',   status: 'Closed', daysOpen: 0,  report: 'DA 285-B', notes: 'Rear-end collision, no injuries. PL counseled.' },
  { date: '05 Jun 2026', type: 'Training Injury',  unit: '2/5 Bravo',   severity: 'Class D',   status: 'Open',   daysOpen: 13, report: 'DA 285',   notes: 'Ankle sprain during ruck march. Profile issued.' },
  { date: '28 May 2026', type: 'Near Miss',        unit: '3/5 Charlie',  severity: 'Near Miss', status: 'Closed', daysOpen: 0,  report: 'Informal', notes: 'Misfired blank adapter; no injury.' },
  { date: '15 May 2026', type: 'Training Injury',  unit: 'GSB FSC',      severity: 'Class C',   status: 'Open',   daysOpen: 34, report: 'DA 285',   notes: 'Shoulder injury during combatives. Under review.' },
  { date: '03 May 2026', type: 'Property Damage',  unit: 'J4 Section',   severity: 'Class C',   status: 'Closed', daysOpen: 0,  report: 'DA 285-B', notes: 'Forklift struck wall panel — $2,200 damage.' },
]

const MED_READINESS = [
  { section: 'J1',  total: 6,  green: 5, amber: 1, red: 0 },
  { section: 'J2',  total: 8,  green: 7, amber: 1, red: 0 },
  { section: 'J3',  total: 12, green: 10, amber: 2, red: 0 },
  { section: 'J4',  total: 10, green: 8,  amber: 1, red: 1 },
  { section: 'J5',  total: 6,  green: 6,  amber: 0, red: 0 },
  { section: 'J6',  total: 8,  green: 7,  amber: 1, red: 0 },
  { section: 'J7',  total: 5,  green: 4,  amber: 1, red: 0 },
  { section: 'J8',  total: 4,  green: 3,  amber: 1, red: 0 },
  { section: 'J9',  total: 5,  green: 5,  amber: 0, red: 0 },
  { section: 'MED', total: 8,  green: 8,  amber: 0, red: 0 },
  { section: 'SS',  total: 6,  green: 5,  amber: 0, red: 1 },
]

const IPE_STATUS = [
  { section: 'J1',  total: 6,  svc: 6,  unsvc: 0, missing: 0 },
  { section: 'J2',  total: 8,  svc: 7,  unsvc: 1, missing: 0 },
  { section: 'J3',  total: 12, svc: 12, unsvc: 0, missing: 0 },
  { section: 'J4',  total: 10, svc: 9,  unsvc: 1, missing: 0 },
  { section: 'J5',  total: 6,  svc: 6,  unsvc: 0, missing: 0 },
  { section: 'J6',  total: 8,  svc: 8,  unsvc: 0, missing: 0 },
  { section: 'MED', total: 8,  svc: 8,  unsvc: 0, missing: 0 },
  { section: 'SS',  total: 6,  svc: 5,  unsvc: 1, missing: 0 },
]

const SHARP_CASES = [
  { id: 'SHARP-2026-001', type: 'Sexual Harassment', reporting: 'Unrestricted', status: 'Under Investigation', daysOpen: 22, sarc: 'CPT Reeves', notes: 'CID notified; victim advocacy in progress.' },
  { id: 'SHARP-2026-002', type: 'Sexual Assault',    reporting: 'Restricted',   status: 'Active',              daysOpen: 8,  sarc: 'CPT Reeves', notes: 'Restricted — advocacy and safety plan established.' },
  { id: 'SHARP-2026-003', type: 'Sexual Harassment', reporting: 'Unrestricted', status: 'Closed — Unsubst.',  daysOpen: 60, sarc: 'CPT Reeves', notes: 'Investigation complete; command action taken.' },
]

const EO_COMPLAINTS = [
  { id: 'EO-2026-001', type: 'Harassment',     formal: true,  status: 'Under Investigation', daysOpen: 18, lead: 'CPT Davis'   },
  { id: 'EO-2026-002', type: 'Discrimination', formal: true,  status: 'Closed — Unfounded',  daysOpen: 45, lead: 'CPT Davis'   },
  { id: 'EO-2026-003', type: 'Hostile Env.',   formal: false, status: 'Informal Resolution',  daysOpen: 7,  lead: 'CPT Davis'   },
]

const EEO_CASES = [
  { id: 'EEO-2026-001', type: 'Disability Discrim.', employee: 'DA Civ (Redacted)', status: 'Counseling Phase', daysOpen: 12, lead: 'Morgan' },
  { id: 'EEO-2026-002', type: 'RA Request',           employee: 'DA Civ (Redacted)', status: 'Approved',         daysOpen: 45, lead: 'Morgan' },
  { id: 'EEO-2026-003', type: 'Race Discrimination',  employee: 'DA Civ (Redacted)', status: 'Formal Complaint', daysOpen: 30, lead: 'Morgan' },
]

const EO_TRAINING = [
  { section: 'J1',  total: 6,  complete: 6,  due: '01 Oct 2026' },
  { section: 'J2',  total: 8,  complete: 7,  due: '01 Oct 2026' },
  { section: 'J3',  total: 12, complete: 12, due: '01 Oct 2026' },
  { section: 'J4',  total: 10, complete: 9,  due: '01 Oct 2026' },
  { section: 'J5',  total: 6,  complete: 6,  due: '01 Oct 2026' },
  { section: 'MED', total: 8,  complete: 8,  due: '01 Oct 2026' },
]

const FINANCE_ACTIONS = [
  { soldier: 'SGT Williams, D.', type: 'DTS Voucher',      amount: '$234.50',  status: 'Pending',     submitted: '10 Jun', due: '20 Jun' },
  { soldier: 'SSG Martinez, R.', type: 'BAH Correction',   amount: '$400/mo',  status: 'Processing',  submitted: '01 Jun', due: '15 Jun' },
  { soldier: 'CPT Henderson, T.', type: 'TDY Advance',     amount: '$1,200',   status: 'Approved',    submitted: '28 May', due: '05 Jun' },
  { soldier: 'SPC Johnson, K.',   type: 'GTCC Issue',       amount: '$89.40',   status: 'Overdue',     submitted: '15 May', due: '01 Jun' },
  { soldier: 'SFC Thompson, B.', type: 'Pay Discrepancy',  amount: '$156.00',  status: 'Open',        submitted: '20 May', due: '10 Jun' },
]

const RETENTION_TRACKER = [
  { soldier: 'SGT Williams',  ets: '15 Sep 2026', daysOut: 89,  status: 'Counseled',     srbEligible: true,  notes: 'Considering re-up — Zone A' },
  { soldier: 'SSG Martinez',  ets: '01 Oct 2026', daysOut: 105, status: 'Not Contacted', srbEligible: false, notes: 'Medical profile — may extend' },
  { soldier: 'SPC Johnson',   ets: '20 Nov 2026', daysOut: 155, status: 'Not Contacted', srbEligible: false, notes: '—' },
  { soldier: 'SFC Robinson',  ets: '01 Jan 2027', daysOut: 197, status: 'Not Contacted', srbEligible: true,  notes: 'SRB Zone A eligible' },
]

// ── Admin tab nav (mirrored from S1) ──────────────────────────────────────────
const ADMIN_NAV_ITEMS = [
  { num: '0', key: 'adm-people',     label: 'People'        },
  { num: '1', key: 'adm-tasks',      label: 'Tasks'         },
  { num: '2', key: 'adm-security',   label: 'Security'      },
  { num: '3', key: 'adm-operations', label: 'Operations'    },
  { num: '4', key: 'adm-sustainment',label: 'Sustainment'   },
  { num: '5', key: 'adm-plans',      label: 'Plans'         },
  { num: '6', key: 'adm-comms',      label: 'Comms'         },
  { num: '7', key: 'adm-training',   label: 'Training'      },
  { num: '8', key: 'adm-resources',  label: 'Resources'     },
  { num: '9', key: 'adm-coord',      label: 'Coordinations' },
]

const OVERVIEW_NAV = [
  { key: 'ss-dashboard',  label: 'Dashboard',  icon: 'fa-tachometer-alt' },
  { key: 'ss-reports',    label: 'Reports',    icon: 'fa-file-alt'       },
  { key: 'ss-trackers',   label: 'Trackers',   icon: 'fa-tasks'          },
  { key: 'ss-requests',   label: 'Requests',   icon: 'fa-inbox'          },
  { key: 'ss-resources',  label: 'Resources',  icon: 'fa-book'           },
]

const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  MEDICAL: { label: 'Medical',            color: '#27ae60', icon: 'fa-heartbeat'     },
  SAFETY:  { label: 'Readiness & Safety', color: '#e67e22', icon: 'fa-hard-hat'      },
  EO:      { label: 'Army Programs',       color: '#9b59b6', icon: 'fa-shield-alt'   },
  ADMIN:   { label: 'Admin Support',      color: '#3498db', icon: 'fa-dollar-sign'   },
}

// ── Shared placeholders ────────────────────────────────────────────────────────
const P = () => <span className={styles.srcPending}>Pending</span>

// ── Component ──────────────────────────────────────────────────────────────────
export default function SpecialStaffPage({
  subPage = 'overview',
  onNavigate,
}: {
  subPage?: string
  onNavigate?: (page: string) => void
}) {
  const [modal, setModal] = useState<ModalState>(null)
  const [admSubTab, setAdmSubTab] = useState('summary')
  const [prevPage, setPrevPage] = useState(subPage)
  if (prevPage !== subPage) { setPrevPage(subPage); setAdmSubTab('summary') }

  // ── Shared page header ─────────────────────────────────────────────────────
  const pageHeader = (
    <>
      <div className={shared.header}>
        <h2><i className="fas fa-users-cog" /> Special Staff</h2>
        <span className={shared.sub}>Surgeon · Safety · EO · Finance · Retention</span>
      </div>
      <div className={styles.sorBar}>
        <span className={styles.sorBarLabel}>Data Sources</span>
        {SS_SOR.map(c => (
          <div key={c.source} className={`${styles.sorPill} ${SOR_CLS[c.status] ?? styles.sorPending}`}>
            <span className={styles.sorDot} />
            {c.label}
          </div>
        ))}
      </div>
    </>
  )

  // ── Admin sub-tab nav bar ──────────────────────────────────────────────────
  const isAdmPage = subPage.startsWith('adm-')
  const adminQuickNav = isAdmPage ? (
    <div className={styles.adminNav}>
      <button
        className={`${styles.tabActionBtn} ${admSubTab === 'summary' ? styles.tabActionActive : ''}`}
        onClick={() => setAdmSubTab('summary')}
      >
        <i className="fas fa-tachometer-alt" /> Summary
      </button>
    </div>
  ) : null

  // ── OVERVIEW ───────────────────────────────────────────────────────────────
  if (subPage === 'overview') {
    const categories = ['MEDICAL', 'SAFETY', 'EO', 'ADMIN'] as const
    return (
      <div className={shared.page}>
        {pageHeader}

        <div className={shared.navCards} style={{ marginBottom: 20 }}>
          {OVERVIEW_NAV.map(n => (
            <button key={n.key} className={shared.navCard} onClick={() => onNavigate?.(n.key)}>
              <i className={`fas ${n.icon}`} />
              {n.label}
            </button>
          ))}
        </div>

        <div className={shared.card} style={{ marginBottom: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-info-circle" /> Special Staff Charter</div>
          <div className={shared.cardBody}>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.65, margin: 0 }}>
              Special Staff officers and NCOs are directly subordinate to the commander and provide
              specialized expertise across medical, safety, equal opportunity, financial, and retention
              domains. Each special staff member advises the commander within their functional area
              and coordinates with coordinating staff sections to integrate their programs across the command.
            </p>
          </div>
        </div>

        {categories.map(cat => {
          const meta = CATEGORY_META[cat]
          const entities = SS_ENTITIES.filter(e => e.category === cat)
          return (
            <div key={cat} className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}>
                <i className={`fas ${meta.icon}`} style={{ color: meta.color, marginRight: 8 }} />
                {meta.label}
              </div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {entities.map((e, i) => (
                  <div
                    key={e.key}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: i < entities.length - 1 ? '1px solid #141414' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 4,
                        background: `${e.categoryColor}15`,
                        border: `1px solid ${e.categoryColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <i className={`fas ${e.icon}`} style={{ color: e.categoryColor, fontSize: 13 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc' }}>{e.label}</div>
                        <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>
                          {e.rank} {e.incumbent} · {e.mos} · {e.phone}
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.btnSecondary}
                      onClick={() => onNavigate?.(`ss-${e.key}`)}
                      style={{ fontSize: 10, padding: '4px 12px' }}
                    >
                      <i className="fas fa-arrow-right" /> Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {modal?.kind === 'detail' && (() => {
          const e = SS_ENTITIES.find(x => x.key === modal.entityKey)
          if (!e) return null
          return (
            <div className={styles.overlay} onClick={() => setModal(null)}>
              <div className={`${styles.modal} ${styles.modalSm}`} onClick={ev => ev.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3><i className={`fas ${e.icon}`} /> {e.label}</h3>
                  <div className={styles.modalActions}>
                    <button className={styles.btnGhost} onClick={() => setModal(null)}>&times;</button>
                  </div>
                </div>
                <div className={styles.modalBody}>
                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 16 }}>{e.charter}</p>
                  {e.responsibilities.map(r => (
                    <div key={r.title} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                      <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.btnSecondary} onClick={() => setModal(null)}>Close</button>
                  <button className={styles.btnPrimary} onClick={() => { setModal(null); onNavigate?.(`ss-${e.key}`) }}>
                    <i className="fas fa-arrow-right" /> Open Page
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  // ── MEDICAL ENTITIES ───────────────────────────────────────────────────────
  if (['surgeon', 'pa'].includes(subPage)) {
    const entity = SS_ENTITIES.find(e => e.key === subPage)!
    const totalAssigned = MED_READINESS.reduce((s, r) => s + r.total, 0)
    const totalGreen    = MED_READINESS.reduce((s, r) => s + r.green, 0)
    const totalAmber    = MED_READINESS.reduce((s, r) => s + r.amber, 0)
    const totalRed      = MED_READINESS.reduce((s, r) => s + r.red, 0)
    const readyPct      = totalAssigned > 0 ? Math.round((totalGreen / totalAssigned) * 100) : 0

    const medStats = [
      { label: 'Assigned',         value: String(totalAssigned), bg: '#2d2d2d' },
      { label: 'Med Ready',        value: `${readyPct}%`,        bg: STATUS_COLOR.Green },
      { label: 'Amber Flags',      value: String(totalAmber),    bg: STATUS_COLOR.Amber },
      { label: 'Non-Deployable',   value: String(totalRed),      bg: totalRed > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
      { label: 'Sick Call / Wk',   value: '—',                   bg: '#2d2d2d' },
    ]

    return (
      <div className={shared.page}>
        {pageHeader}

        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(39,174,96,0.07)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 4, marginBottom: 12 }}>
          <i className="fas fa-lock" style={{ color: '#27ae60', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}><strong style={{ color: '#27ae60' }}>FOUO — MEDICAL / HIPAA PROTECTED.</strong> Patient health information is protected under the Privacy Act (5 U.S.C. § 552a) and HIPAA. Access is restricted to the treatment team and authorized personnel with a need to know. Do not reproduce, transmit, or disclose outside authorized channels.</span>
        </div>

        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {medStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Medical Staff</div>
              <div className={shared.cardBody}>
                {[
                  { title: 'Group Surgeon',        name: 'MAJ Chen',      status: 'Green' },
                  { title: 'Battalion Surgeon',    name: 'CPT Morrison',  status: 'Green' },
                  { title: 'Physician Assistant',  name: 'CPT Rodriguez', status: 'Green' },
                  { title: 'Senior Medic (68W)',   name: 'SFC Williams',  status: 'Green' },
                  { title: 'Med Platoon Sergeant', name: 'SSG Parker',    status: 'Amber' },
                ].map((p, i, arr) => (
                  <div key={p.title} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{p.title}</span>
                    <span className={styles.leadershipName} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.name}
                      <span className={shared.dot} style={{ background: STATUS_COLOR[p.status] ?? '#555' }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Key Reports</div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {[
                  { title: 'Medical Readiness Report',   desc: 'Weekly MEDPROS summary to commander' },
                  { title: 'Sick Call Log',              desc: 'Daily patient encounter summary' },
                  { title: 'Immunization Status Report', desc: 'Monthly currency and compliance tracker' },
                  { title: 'BH Referral Tracker',        desc: 'Open behavioral health referrals' },
                  { title: 'DA Form 3349',               desc: 'Physical profile management' },
                ].map((r, i, arr) => (
                  <div key={r.title} className={styles.reportRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>{r.title}</div>
                      <div className={styles.reportDesc}>{r.desc}</div>
                    </div>
                    <div className={styles.reportActions}>
                      <button className={styles.btnSecondary}><i className="fas fa-eye" /> View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-chart-bar" /> Medical Readiness by Section (MEDPROS)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr>
                  <th>Section</th><th>Assigned</th>
                  <th style={{ color: STATUS_COLOR.Green }}>Green</th>
                  <th style={{ color: STATUS_COLOR.Amber }}>Amber</th>
                  <th style={{ color: STATUS_COLOR.Red }}>Red</th>
                  <th>Ready %</th>
                </tr>
              </thead>
              <tbody>
                {MED_READINESS.map(r => {
                  const pct = r.total > 0 ? Math.round((r.green / r.total) * 100) : 0
                  const pctColor = pct >= 90 ? STATUS_COLOR.Green : pct >= 75 ? STATUS_COLOR.Amber : STATUS_COLOR.Red
                  return (
                    <tr key={r.section}>
                      <td style={{ fontWeight: 700 }}>{r.section}</td>
                      <td>{r.total}</td>
                      <td style={{ color: STATUS_COLOR.Green }}>{r.green}</td>
                      <td style={{ color: STATUS_COLOR.Amber }}>{r.amber}</td>
                      <td style={{ color: r.red > 0 ? STATUS_COLOR.Red : '#333' }}>{r.red}</td>
                      <td style={{ fontWeight: 700, color: pctColor }}>{pct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── SAFETY & CBRN ENTITIES ─────────────────────────────────────────────────
  if (['safety', 'cbrn', 'bn-safety'].includes(subPage)) {
    const entity = SS_ENTITIES.find(e => e.key === subPage)!
    const open   = SAFETY_INCIDENTS.filter(i => i.status === 'Open').length
    const closed = SAFETY_INCIDENTS.filter(i => i.status === 'Closed').length

    const safetyStats = [
      { label: 'Incidents MTD',    value: String(SAFETY_INCIDENTS.length), bg: SAFETY_INCIDENTS.length > 3 ? STATUS_COLOR.Amber : '#2d2d2d' },
      { label: 'Open',             value: String(open),                     bg: open > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
      { label: 'Closed MTD',       value: String(closed),                   bg: STATUS_COLOR.Green },
      { label: 'Days Since LTA',   value: '18',                              bg: '#2d2d2d' },
      { label: 'ASAP Referrals',   value: '—',                               bg: '#2d2d2d' },
    ]

    const ipeTotal = IPE_STATUS.reduce((s, r) => s + r.total, 0)
    const ipeSvc   = IPE_STATUS.reduce((s, r) => s + r.svc, 0)

    return (
      <div className={shared.page}>
        {pageHeader}

        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>

        {subPage !== 'cbrn' && (
          <div className={shared.stats} style={{ marginBottom: 14 }}>
            {safetyStats.map(s => (
              <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                <div className={shared.statValue}>{s.value}</div>
                <div className={shared.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {subPage === 'cbrn' && (
          <div className={shared.stats} style={{ marginBottom: 14 }}>
            {[
              { label: 'IPE Total',       value: String(ipeTotal), bg: '#2d2d2d' },
              { label: 'Serviceable',     value: String(ipeSvc),   bg: STATUS_COLOR.Green },
              { label: 'Unserviceable',   value: String(ipeTotal - ipeSvc), bg: ipeTotal - ipeSvc > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              { label: 'CBRN Trng Due',   value: '—',              bg: '#2d2d2d' },
              { label: 'Decon Rehearsal', value: '—',              bg: '#2d2d2d' },
            ].map(s => (
              <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                <div className={shared.statValue}>{s.value}</div>
                <div className={shared.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Safety Section</div>
              <div className={shared.cardBody}>
                {[
                  { title: 'Safety Officer',  name: 'CPT Navarro' },
                  { title: 'CBRN Officer',    name: 'CPT Park'    },
                  { title: 'Safety NCO',      name: 'SFC Torres'  },
                ].map((p, i, arr) => (
                  <div key={p.title} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{p.title}</span>
                    <span className={styles.leadershipName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Key Reports / Docs</div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {(subPage === 'cbrn'
                  ? [
                    { title: 'IPE Accountability Report', desc: 'Semi-annual inventory by section' },
                    { title: 'CBRN Training Tracker',     desc: 'Annual CBRN training completion' },
                    { title: 'Decon SOP',                 desc: 'Unit decontamination procedures' },
                    { title: 'RADCON Plan',               desc: 'Radiological control measures' },
                  ]
                  : [
                    { title: 'Accident / Incident Log',   desc: 'DA 285 submissions — MTD / YTD' },
                    { title: 'Safety Training Tracker',   desc: 'Mandatory safety training by section' },
                    { title: 'Hazard Register',           desc: 'Open hazards and abatement actions' },
                    { title: 'Monthly Safety Report',     desc: 'Commander safety brief — monthly' },
                    { title: 'Risk Assessment Matrix',    desc: 'Ops / training residual risk log' },
                  ]
                ).map((r, i, arr) => (
                  <div key={r.title} className={styles.reportRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>{r.title}</div>
                      <div className={styles.reportDesc}>{r.desc}</div>
                    </div>
                    <div className={styles.reportActions}>
                      <button className={styles.btnSecondary}><i className="fas fa-eye" /> View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {subPage !== 'cbrn' && (
          <div className={shared.card} style={{ marginTop: 14 }}>
            <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><i className="fas fa-exclamation-triangle" /> Safety Incident Log (MTD)</span>
              <span style={{ fontSize: 10, color: '#555' }}>Source: DA 285 / THREADS</span>
            </div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Unit</th><th>Severity</th><th>Report</th><th>Days Open</th><th>Status</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {SAFETY_INCIDENTS.map((inc, i) => {
                    const isOpen    = inc.status === 'Open'
                    const sevColor  = inc.severity === 'Class C' ? STATUS_COLOR.Amber : inc.severity === 'Class D' ? STATUS_COLOR.Red : '#555'
                    const statColor = isOpen ? STATUS_COLOR.Red : STATUS_COLOR.Green
                    return (
                      <tr key={i}>
                        <td style={{ whiteSpace: 'nowrap' }}>{inc.date}</td>
                        <td>{inc.type}</td>
                        <td style={{ fontSize: 10, color: '#666' }}>{inc.unit}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sevColor + '22', color: sevColor }}>{inc.severity}</span></td>
                        <td style={{ fontSize: 10, color: '#555' }}>{inc.report}</td>
                        <td style={{ fontWeight: 700, color: isOpen && inc.daysOpen > 20 ? STATUS_COLOR.Red : '#888' }}>{isOpen ? `${inc.daysOpen}d` : '—'}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statColor + '22', color: statColor }}>{inc.status}</span></td>
                        <td style={{ fontSize: 10, color: '#555', maxWidth: 240 }}>{inc.notes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {subPage === 'cbrn' && (
          <div className={shared.card} style={{ marginTop: 14 }}>
            <div className={shared.cardHeader}><i className="fas fa-box" /> IPE Accountability by Section</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr><th>Section</th><th>Total</th><th style={{ color: STATUS_COLOR.Green }}>Serviceable</th><th style={{ color: STATUS_COLOR.Red }}>Unserviceable</th><th>Missing</th><th>Rate</th></tr>
                </thead>
                <tbody>
                  {IPE_STATUS.map(r => {
                    const pct = r.total > 0 ? Math.round((r.svc / r.total) * 100) : 0
                    return (
                      <tr key={r.section}>
                        <td style={{ fontWeight: 700 }}>{r.section}</td>
                        <td>{r.total}</td>
                        <td style={{ color: STATUS_COLOR.Green }}>{r.svc}</td>
                        <td style={{ color: r.unsvc > 0 ? STATUS_COLOR.Red : '#333' }}>{r.unsvc}</td>
                        <td style={{ color: r.missing > 0 ? STATUS_COLOR.Red : '#333' }}>{r.missing}</td>
                        <td style={{ fontWeight: 700, color: pct >= 90 ? STATUS_COLOR.Green : STATUS_COLOR.Amber }}>{pct}%</td>
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

  // ── SHARP ─────────────────────────────────────────────────────────────────
  if (subPage === 'sharp') {
    const entity = SS_ENTITIES.find(e => e.key === 'sharp')!
    const openCases   = SHARP_CASES.filter(c => !c.status.startsWith('Closed')).length
    const restricted  = SHARP_CASES.filter(c => c.reporting === 'Restricted').length
    const eoTotalSoldiers = EO_TRAINING.reduce((s, r) => s + r.total, 0)
    const eoTotalComplete = EO_TRAINING.reduce((s, r) => s + r.complete, 0)
    const trainingPct = eoTotalSoldiers > 0 ? Math.round((eoTotalComplete / eoTotalSoldiers) * 100) : 0

    const sharpStats = [
      { label: 'Cases YTD',       value: String(SHARP_CASES.length),           bg: '#2d2d2d' },
      { label: 'Open',            value: String(openCases),                     bg: openCases > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
      { label: 'Restricted',      value: String(restricted),                    bg: '#2d2d2d' },
      { label: 'SHARP Training',  value: `${trainingPct}%`,                     bg: trainingPct >= 90 ? STATUS_COLOR.Green : STATUS_COLOR.Amber },
      { label: 'CCS Status',      value: '—',                                   bg: '#2d2d2d' },
    ]

    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: 'rgba(231,76,60,0.07)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 4, marginBottom: 12 }}>
          <i className="fas fa-shield-alt" style={{ color: '#e74c3c', flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}><strong style={{ color: '#e74c3c' }}>NEED TO KNOW — RESTRICTED / LEGAL PRIVILEGE.</strong> SHARP case information — particularly Restricted Reports — is legally privileged and confidential under 10 U.S.C. § 1044(c), AR 600-20 Ch 7, and DoDD 6495.01. Unauthorized disclosure is prohibited and may constitute a criminal offense. Access is limited to the SARC, victim advocate, SJA, and commander as required.</span>
        </div>

        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {sharpStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> SHARP Staff</div>
              <div className={shared.cardBody}>
                {[
                  { title: 'SARC',                 name: 'CPT Reeves'  },
                  { title: 'Victim Advocate (VA)',  name: <P />         },
                  { title: 'EO Officer (coord)',    name: 'CPT Davis'   },
                  { title: 'SJA Liaison',           name: <P />         },
                ].map((p, i, arr) => (
                  <div key={p.title} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{p.title}</span>
                    <span className={styles.leadershipName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Key Reports</div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {[
                  { title: 'SHARP Case Log',          desc: 'Sanitized case tracker — restricted/unrestricted' },
                  { title: 'SHARP Training Report',   desc: 'Annual training completion by section' },
                  { title: 'Command Climate Survey',  desc: 'CCS results and trend analysis' },
                  { title: 'Victim Advocacy Log',     desc: 'Services provided and referral status' },
                ].map((r, i, arr) => (
                  <div key={r.title} className={styles.reportRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>{r.title}</div>
                      <div className={styles.reportDesc}>{r.desc}</div>
                    </div>
                    <div className={styles.reportActions}>
                      <button className={styles.btnSecondary}><i className="fas fa-eye" /> View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-lock" /> SHARP Case Tracker (Sanitized)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Case #</th><th>Type</th><th>Reporting</th><th>Status</th><th>Days Open</th><th>SARC</th><th>Notes</th></tr></thead>
              <tbody>
                {SHARP_CASES.map(c => {
                  const isClosed   = c.status.startsWith('Closed')
                  const statColor  = isClosed ? '#27ae60' : c.daysOpen > 14 ? STATUS_COLOR.Red : STATUS_COLOR.Amber
                  const reptColor  = c.reporting === 'Restricted' ? '#9b59b6' : '#3498db'
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{c.id}</td>
                      <td>{c.type}</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: reptColor + '22', color: reptColor }}>{c.reporting}</span></td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statColor + '22', color: statColor }}>{c.status}</span></td>
                      <td style={{ fontWeight: 700, color: !isClosed && c.daysOpen > 14 ? STATUS_COLOR.Red : '#888' }}>{isClosed ? '—' : `${c.daysOpen}d`}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{c.sarc}</td>
                      <td style={{ fontSize: 10, color: '#555', maxWidth: 220 }}>{c.notes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> SHARP Training Tracker (Annual)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Section</th><th>Assigned</th><th>Complete</th><th>Remaining</th><th>Rate</th><th>Due Date</th></tr></thead>
              <tbody>
                {EO_TRAINING.map(r => {
                  const pct = r.total > 0 ? Math.round((r.complete / r.total) * 100) : 0
                  const pctColor = pct >= 90 ? STATUS_COLOR.Green : pct >= 75 ? STATUS_COLOR.Amber : STATUS_COLOR.Red
                  return (
                    <tr key={r.section}>
                      <td style={{ fontWeight: 700 }}>{r.section}</td>
                      <td>{r.total}</td>
                      <td style={{ color: STATUS_COLOR.Green }}>{r.complete}</td>
                      <td style={{ color: r.total - r.complete > 0 ? STATUS_COLOR.Amber : '#333' }}>{r.total - r.complete}</td>
                      <td style={{ fontWeight: 700, color: pctColor }}>{pct}%</td>
                      <td style={{ fontSize: 10, color: '#555' }}>{r.due}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── EO ────────────────────────────────────────────────────────────────────
  if (subPage === 'eo') {
    const entity = SS_ENTITIES.find(e => e.key === 'eo')!
    const openComplaints  = EO_COMPLAINTS.filter(c => !c.status.startsWith('Closed')).length
    const eoTotalSoldiers = EO_TRAINING.reduce((s, r) => s + r.total, 0)
    const eoTotalComplete = EO_TRAINING.reduce((s, r) => s + r.complete, 0)
    const eoTrainingPct   = eoTotalSoldiers > 0 ? Math.round((eoTotalComplete / eoTotalSoldiers) * 100) : 0

    const eoStats = [
      { label: 'Complaints YTD',   value: String(EO_COMPLAINTS.length), bg: '#2d2d2d' },
      { label: 'Open Complaints',  value: String(openComplaints),       bg: openComplaints > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
      { label: 'EO Training',      value: `${eoTrainingPct}%`,          bg: eoTrainingPct >= 90 ? STATUS_COLOR.Green : STATUS_COLOR.Amber },
      { label: 'CCS Status',       value: '—',                           bg: '#2d2d2d' },
    ]

    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: 'rgba(155,89,182,0.07)', border: '1px solid rgba(155,89,182,0.25)', borderRadius: 4, marginBottom: 12 }}>
          <i className="fas fa-lock" style={{ color: '#9b59b6', flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}><strong style={{ color: '#9b59b6' }}>NEED TO KNOW — EO COMPLAINT INFORMATION / PII PROTECTED.</strong> EO complaint details — including complainant, respondent, and witness identities — are confidential under AR 600-20 and DoDD 1020.02E. Disclosure is limited to authorized personnel with a legitimate need to know.</span>
        </div>

        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {eoStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> EO Staff</div>
              <div className={shared.cardBody}>
                {[
                  { title: 'EO Officer',    name: 'CPT Davis'  },
                  { title: 'SARC (coord)',  name: 'CPT Reeves' },
                  { title: 'EEO Lead',      name: 'GS-12 Morgan' },
                ].map((p, i, arr) => (
                  <div key={p.title} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{p.title}</span>
                    <span className={styles.leadershipName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Key Reports</div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {[
                  { title: 'EO Complaint Log',       desc: 'Formal and informal complaint tracker' },
                  { title: 'EO Training Report',     desc: 'Annual training completion by section' },
                  { title: 'Command Climate Survey', desc: 'CCS results and trend analysis' },
                  { title: 'Annual EO Report',       desc: 'Command EO metrics — fiscal year' },
                ].map((r, i, arr) => (
                  <div key={r.title} className={styles.reportRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>{r.title}</div>
                      <div className={styles.reportDesc}>{r.desc}</div>
                    </div>
                    <div className={styles.reportActions}>
                      <button className={styles.btnSecondary}><i className="fas fa-eye" /> View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-file-contract" /> EO Complaint Tracker (Sanitized)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Case #</th><th>Type</th><th>Formal</th><th>Status</th><th>Days Open</th><th>Lead</th></tr></thead>
              <tbody>
                {EO_COMPLAINTS.map(c => {
                  const isClosed = c.status.startsWith('Closed')
                  const statColor = isClosed ? '#27ae60' : c.daysOpen > 14 ? STATUS_COLOR.Red : STATUS_COLOR.Amber
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{c.id}</td>
                      <td>{c.type}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: c.formal ? 'rgba(231,76,60,0.1)' : 'rgba(201,162,39,0.1)', color: c.formal ? '#e74c3c' : '#c9a227' }}>
                          {c.formal ? 'Formal' : 'Informal'}
                        </span>
                      </td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statColor + '22', color: statColor }}>{c.status}</span></td>
                      <td style={{ fontWeight: 700, color: !isClosed && c.daysOpen > 14 ? STATUS_COLOR.Red : '#888' }}>{isClosed ? '—' : `${c.daysOpen}d`}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{c.lead}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> EO Training Tracker (Annual)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Section</th><th>Assigned</th><th>Complete</th><th>Remaining</th><th>Rate</th><th>Due Date</th></tr></thead>
              <tbody>
                {EO_TRAINING.map(r => {
                  const pct = r.total > 0 ? Math.round((r.complete / r.total) * 100) : 0
                  const pctColor = pct >= 90 ? STATUS_COLOR.Green : pct >= 75 ? STATUS_COLOR.Amber : STATUS_COLOR.Red
                  return (
                    <tr key={r.section}>
                      <td style={{ fontWeight: 700 }}>{r.section}</td>
                      <td>{r.total}</td>
                      <td style={{ color: STATUS_COLOR.Green }}>{r.complete}</td>
                      <td style={{ color: r.total - r.complete > 0 ? STATUS_COLOR.Amber : '#333' }}>{r.total - r.complete}</td>
                      <td style={{ fontWeight: 700, color: pctColor }}>{pct}%</td>
                      <td style={{ fontSize: 10, color: '#555' }}>{r.due}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── EEO TEAMS ─────────────────────────────────────────────────────────────
  if (subPage === 'eeo-teams') {
    const entity = SS_ENTITIES.find(e => e.key === 'eeo-teams')!
    const openCases   = EEO_CASES.filter(c => c.status !== 'Closed' && c.status !== 'Approved').length
    const eeoStats = [
      { label: 'Cases YTD',     value: String(EEO_CASES.length), bg: '#2d2d2d' },
      { label: 'Open',          value: String(openCases),         bg: openCases > 0 ? STATUS_COLOR.Amber : '#2d2d2d' },
      { label: 'RA Requests',   value: String(EEO_CASES.filter(c => c.type === 'RA Request').length), bg: '#2d2d2d' },
      { label: 'Formal Complaints', value: String(EEO_CASES.filter(c => c.status === 'Formal Complaint').length), bg: '#2d2d2d' },
    ]

    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: 'rgba(155,89,182,0.07)', border: '1px solid rgba(155,89,182,0.25)', borderRadius: 4, marginBottom: 12 }}>
          <i className="fas fa-lock" style={{ color: '#9b59b6', flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}><strong style={{ color: '#9b59b6' }}>NEED TO KNOW — EEO CASE INFORMATION / PII PROTECTED.</strong> EEO complaint and case information is strictly confidential under 29 C.F.R. Part 1614 and the Privacy Act (5 U.S.C. § 552a). Unauthorized disclosure outside the EEO process is prohibited without explicit EEO Officer authorization.</span>
        </div>

        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {eeoStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> EEO Staff</div>
              <div className={shared.cardBody}>
                {[
                  { title: 'EEO Officer (GS-12)',   name: 'Morgan'   },
                  { title: 'EEO Counselor',          name: <P />      },
                  { title: 'HR Liaison',             name: <P />      },
                ].map((p, i, arr) => (
                  <div key={p.title} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{p.title}</span>
                    <span className={styles.leadershipName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Key Reports</div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {[
                  { title: 'EEO Complaint Log',      desc: 'Civilian complaint tracker — counseling to formal' },
                  { title: 'RA Tracker',              desc: 'Reasonable accommodation requests and status' },
                  { title: 'Workforce Diversity Rpt', desc: 'Annual diversity metrics vs. CLF benchmarks' },
                  { title: 'EEO MD-715 Report',       desc: 'Annual program status report to EEOC' },
                ].map((r, i, arr) => (
                  <div key={r.title} className={styles.reportRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>{r.title}</div>
                      <div className={styles.reportDesc}>{r.desc}</div>
                    </div>
                    <div className={styles.reportActions}>
                      <button className={styles.btnSecondary}><i className="fas fa-eye" /> View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-file-contract" /> EEO Case Tracker (Sanitized)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Case #</th><th>Type</th><th>Employee</th><th>Status</th><th>Days Open</th><th>Lead</th></tr></thead>
              <tbody>
                {EEO_CASES.map(c => {
                  const isClosed  = c.status === 'Closed' || c.status === 'Approved'
                  const statColor = isClosed ? '#27ae60' : c.daysOpen > 30 ? STATUS_COLOR.Red : STATUS_COLOR.Amber
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{c.id}</td>
                      <td>{c.type}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{c.employee}</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statColor + '22', color: statColor }}>{c.status}</span></td>
                      <td style={{ fontWeight: 700, color: !isClosed && c.daysOpen > 30 ? STATUS_COLOR.Red : '#888' }}>{isClosed ? '—' : `${c.daysOpen}d`}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{c.lead}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── AS TEAM (ASAP) ────────────────────────────────────────────────────────
  if (subPage === 'as-team') {
    const entity = SS_ENTITIES.find(e => e.key === 'as-team')!
    const ASAP_CASES = [
      { id: 'ASAP-2026-001', type: 'Alcohol',  source: 'Commander',  status: 'In Treatment',  enrolled: '10 Apr', daysOpen: 69,  counselor: 'Calloway' },
      { id: 'ASAP-2026-002', type: 'Drug',     source: 'Self',       status: 'Assessment',    enrolled: '02 Jun', daysOpen: 16,  counselor: 'Calloway' },
      { id: 'ASAP-2026-003', type: 'Alcohol',  source: 'Medical',    status: 'Aftercare',     enrolled: '15 Jan', daysOpen: 154, counselor: 'Calloway' },
      { id: 'ASAP-2026-004', type: 'Drug',     source: 'Commander',  status: 'Closed — Complete', enrolled: '12 Nov 2025', daysOpen: 0, counselor: 'Calloway' },
    ]
    const openCases  = ASAP_CASES.filter(c => !c.status.startsWith('Closed')).length
    const inTx       = ASAP_CASES.filter(c => c.status === 'In Treatment').length
    const cmdRef     = ASAP_CASES.filter(c => c.source === 'Commander').length
    const selfRef    = ASAP_CASES.filter(c => c.source === 'Self').length
    const asapStats  = [
      { label: 'Cases YTD',   value: String(ASAP_CASES.length), bg: '#2d2d2d' },
      { label: 'Open',        value: String(openCases),          bg: openCases > 0 ? STATUS_COLOR.Amber : '#2d2d2d' },
      { label: 'In Treatment',value: String(inTx),               bg: '#2d2d2d' },
      { label: 'Cmd Referrals', value: String(cmdRef),           bg: '#2d2d2d' },
      { label: 'Self Referrals', value: String(selfRef),         bg: '#2d2d2d' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: 'rgba(39,174,96,0.07)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 4, marginBottom: 12 }}>
          <i className="fas fa-lock" style={{ color: '#27ae60', flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}><strong style={{ color: '#27ae60' }}>FOUO — ASAP / MEDICAL / HIPAA PROTECTED.</strong> Substance abuse case records are protected under the Privacy Act (5 U.S.C. § 552a), HIPAA, and 42 C.F.R. Part 2. Access strictly limited to the ASAP counselor, commander, and authorized medical personnel.</span>
        </div>

        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {asapStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> ASAP Staff</div>
              <div className={shared.cardBody}>
                {[
                  { title: 'ASAP Program Manager (GS-9)', name: 'Calloway' },
                  { title: 'Substance Abuse Counselor',   name: <P /> },
                  { title: 'Risk Reduction NCO',           name: <P /> },
                ].map((p, i, arr) => (
                  <div key={p.title} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{p.title}</span>
                    <span className={styles.leadershipName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Key Reports</div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {[
                  { title: 'ASAP Case Log',            desc: 'Active and closed substance abuse cases — sanitized' },
                  { title: 'Referral Source Report',   desc: 'Commander, self, and medical referral breakdown' },
                  { title: 'Drug Testing Log',         desc: 'Urinalysis schedule and positive result tracking' },
                  { title: 'ASAP Quarterly Report',    desc: 'Program metrics submitted to higher HQ per AR 600-85' },
                ].map((r, i, arr) => (
                  <div key={r.title} className={styles.reportRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>{r.title}</div>
                      <div className={styles.reportDesc}>{r.desc}</div>
                    </div>
                    <div className={styles.reportActions}>
                      <button className={styles.btnSecondary}><i className="fas fa-eye" /> View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-folder-open" /> ASAP Case Log (Sanitized)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Case #</th><th>Type</th><th>Referral Source</th><th>Enrolled</th><th>Status</th><th>Days Open</th><th>Counselor</th></tr></thead>
              <tbody>
                {ASAP_CASES.map(c => {
                  const isClosed  = c.status.startsWith('Closed')
                  const statColor = isClosed ? '#27ae60' : c.status === 'In Treatment' ? '#9b59b6' : c.status === 'Aftercare' ? STATUS_COLOR.Amber : STATUS_COLOR.Amber
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{c.id}</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: c.type === 'Drug' ? 'rgba(231,76,60,0.12)' : 'rgba(201,162,39,0.12)', color: c.type === 'Drug' ? STATUS_COLOR.Red : STATUS_COLOR.Amber }}>{c.type}</span></td>
                      <td style={{ fontSize: 11 }}>{c.source}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{c.enrolled}</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statColor + '22', color: statColor }}>{c.status}</span></td>
                      <td style={{ fontWeight: 700, color: !isClosed && c.daysOpen > 60 ? STATUS_COLOR.Red : '#888' }}>{isClosed ? '—' : `${c.daysOpen}d`}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{c.counselor}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── AT TEAM ────────────────────────────────────────────────────────────────
  if (subPage === 'at-team') {
    const entity = SS_ENTITIES.find(e => e.key === 'at-team')!
    const atStats = [
      { label: 'FPCON Level',        value: 'BRAVO',  bg: STATUS_COLOR.Amber },
      { label: 'Open Findings',      value: '3',      bg: '#2d2d2d' },
      { label: 'Assessments YTD',    value: '2',      bg: STATUS_COLOR.Green },
      { label: 'AT Briefs YTD',      value: '8',      bg: '#2d2d2d' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>
        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {atStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-shield-alt" /> AT Program Status</div>
            <div className={shared.cardBody}>
              {[
                { label: 'FPCON Level',         value: 'BRAVO — Increased/General Threat',  color: STATUS_COLOR.Amber },
                { label: 'AT Plan Version',      value: 'Ver 3.1 — Approved Jun 2026',        color: STATUS_COLOR.Green },
                { label: 'Level I Training',     value: '94% Complete (Unit-wide)',           color: STATUS_COLOR.Green },
                { label: 'Open Vuln Findings',   value: '3 — Under Corrective Action',        color: STATUS_COLOR.Amber },
                { label: 'Last Assessment',      value: 'Mar 2026 — Facility & Access Ctrl', color: '#888' },
                { label: 'Next Scheduled',       value: 'Sep 2026 — Physical Security',       color: '#888' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ fontSize: 12, color: '#888' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── FINANCE ────────────────────────────────────────────────────────────────
  if (subPage === 'finance') {
    const entity = SS_ENTITIES.find(e => e.key === 'finance')!
    const overdue   = FINANCE_ACTIONS.filter(a => a.status === 'Overdue').length
    const pending   = FINANCE_ACTIONS.filter(a => a.status === 'Pending' || a.status === 'Open').length
    const approved  = FINANCE_ACTIONS.filter(a => a.status === 'Approved').length

    const finStats = [
      { label: 'Total Actions',    value: String(FINANCE_ACTIONS.length), bg: '#2d2d2d' },
      { label: 'Pending',          value: String(pending),   bg: '#2d2d2d' },
      { label: 'Approved',         value: String(approved),  bg: STATUS_COLOR.Green },
      { label: 'Overdue',          value: String(overdue),   bg: overdue > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
      { label: 'GTCC Delinquent',  value: '—',               bg: '#2d2d2d' },
    ]

    return (
      <div className={shared.page}>
        {pageHeader}

        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>

        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {finStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Finance Section</div>
              <div className={shared.cardBody}>
                {[
                  { title: 'Finance OIC',  name: 'CPT Phillips' },
                  { title: 'Finance NCO',  name: <P />          },
                  { title: 'Pay Tech',     name: <P />          },
                ].map((p, i, arr) => (
                  <div key={p.title} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{p.title}</span>
                    <span className={styles.leadershipName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Key Reports</div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {[
                  { title: 'Finance Action Log',  desc: 'Pay actions — MTD / YTD' },
                  { title: 'GTCC Status Report',  desc: 'Delinquency tracker by soldier' },
                  { title: 'DTS Voucher Tracker', desc: 'Open and pending vouchers' },
                  { title: 'Budget Execution',    desc: 'Commitment / obligation report' },
                ].map((r, i, arr) => (
                  <div key={r.title} className={styles.reportRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>{r.title}</div>
                      <div className={styles.reportDesc}>{r.desc}</div>
                    </div>
                    <div className={styles.reportActions}>
                      <button className={styles.btnSecondary}><i className="fas fa-eye" /> View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><i className="fas fa-tasks" /> Finance Actions Tracker</span>
            <button className={styles.btnPrimary}><i className="fas fa-plus" /> Add Action</button>
          </div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Soldier</th><th>Action Type</th><th>Amount</th><th>Submitted</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {FINANCE_ACTIONS.map((a, i) => {
                  const statColor = a.status === 'Overdue' ? STATUS_COLOR.Red : a.status === 'Approved' ? STATUS_COLOR.Green : a.status === 'Processing' ? '#9b59b6' : STATUS_COLOR.Amber
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{a.soldier}</td>
                      <td>{a.type}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{a.amount}</td>
                      <td style={{ fontSize: 10, color: '#666' }}>{a.submitted}</td>
                      <td style={{ fontSize: 10, color: a.status === 'Overdue' ? STATUS_COLOR.Red : '#666' }}>{a.due}</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statColor + '22', color: statColor }}>{a.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── RETENTION ──────────────────────────────────────────────────────────────
  if (subPage === 'retention') {
    const entity = SS_ENTITIES.find(e => e.key === 'retention')!
    const ets90  = RETENTION_TRACKER.filter(r => r.daysOut <= 90).length
    const srbElig = RETENTION_TRACKER.filter(r => r.srbEligible).length
    const counseled = RETENTION_TRACKER.filter(r => r.status === 'Counseled').length

    const retStats = [
      { label: 'ETS in 180d',     value: String(RETENTION_TRACKER.length), bg: '#2d2d2d' },
      { label: 'ETS in 90d',      value: String(ets90),    bg: ets90 > 0 ? STATUS_COLOR.Amber : '#2d2d2d' },
      { label: 'SRB Eligible',    value: String(srbElig),  bg: '#2d2d2d' },
      { label: 'Counseled',       value: String(counseled), bg: STATUS_COLOR.Green },
      { label: 'Reenlistments QTD', value: '—',             bg: '#2d2d2d' },
    ]

    return (
      <div className={shared.page}>
        {pageHeader}

        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>

        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {retStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Retention Staff</div>
              <div className={shared.cardBody}>
                {[
                  { title: 'Career Counselor (79V)', name: 'SFC Garza' },
                  { title: 'Retention Board Recorder', name: <P />     },
                ].map((p, i, arr) => (
                  <div key={p.title} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{p.title}</span>
                    <span className={styles.leadershipName}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-link" /> Systems</div>
              <div className={shared.cardBody}>
                {[
                  { label: 'RCMS',   status: 'pending'   },
                  { label: 'IPPSA',  status: 'pending'   },
                  { label: 'THREADS', status: 'connected' },
                ].map((c, i, arr) => (
                  <div key={c.label} className={styles.leadershipRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <span className={styles.leadershipTitle}>{c.label}</span>
                    <span className={`${styles.sorPill} ${SOR_CLS[c.status]}`} style={{ fontSize: 9 }}>
                      <span className={styles.sorDot} />
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Key Reports</div>
              <div className={shared.cardBody} style={{ padding: 0 }}>
                {[
                  { title: 'ETS Tracker (18-month)',      desc: 'Soldiers approaching separation or rotation' },
                  { title: 'Reenlistment Objective Rpt',  desc: 'Quarterly objective vs. actual' },
                  { title: 'Retention Board Minutes',     desc: 'Board results and counseling log' },
                  { title: 'SRB Tracker',                 desc: 'SRB-eligible soldiers and payment status' },
                ].map((r, i, arr) => (
                  <div key={r.title} className={styles.reportRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>{r.title}</div>
                      <div className={styles.reportDesc}>{r.desc}</div>
                    </div>
                    <div className={styles.reportActions}>
                      <button className={styles.btnSecondary}><i className="fas fa-eye" /> View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={shared.card} style={{ marginTop: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-clock" /> ETS Tracker (180-Day Window)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr><th>Soldier</th><th>ETS Date</th><th>Days Out</th><th>SRB Eligible</th><th>Status</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {RETENTION_TRACKER.map((r, i) => {
                  const flag = r.daysOut <= 30 ? '30-DAY' : r.daysOut <= 60 ? '60-DAY' : r.daysOut <= 90 ? '90-DAY' : '180-DAY'
                  const flagColor = r.daysOut <= 30 ? STATUS_COLOR.Red : r.daysOut <= 60 ? STATUS_COLOR.Amber : r.daysOut <= 90 ? '#e67e22' : '#888'
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.soldier}</td>
                      <td>{r.ets}</td>
                      <td><span style={{ fontWeight: 700, fontSize: 11, padding: '2px 6px', borderRadius: 3, background: flagColor + '22', color: flagColor }}>{flag}</span></td>
                      <td>
                        {r.srbEligible
                          ? <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR.Green }}>Yes</span>
                          : <span style={{ fontSize: 10, color: '#444' }}>No</span>}
                      </td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: r.status === 'Counseled' ? 'rgba(39,174,96,0.15)' : 'rgba(201,162,39,0.12)', color: r.status === 'Counseled' ? '#27ae60' : '#c9a227' }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 10, color: '#555' }}>{r.notes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── CAREER COUNSELOR ──────────────────────────────────────────────────────
  if (subPage === 'career-counselor') {
    const entity = SS_ENTITIES.find(e => e.key === 'career-counselor')!
    const ccStats = [
      { label: 'Sessions MTD',    value: '14',  bg: '#2d2d2d' },
      { label: 'MOS Reclass',     value: '3',   bg: '#2d2d2d' },
      { label: 'Reenlistments',   value: '6',   bg: STATUS_COLOR.Green },
      { label: 'Pending F/U',     value: '5',   bg: STATUS_COLOR.Amber },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 12 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
            {entity.label}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${entity.categoryColor}15`, color: entity.categoryColor, border: `1px solid ${entity.categoryColor}30`, marginLeft: 4 }}>
              {entity.mos}
            </span>
          </h2>
          <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone}</span>
        </div>
        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {ccStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Charter &amp; Responsibilities</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>{entity.charter}</p>
              {entity.responsibilities.map((r, i) => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < entity.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-user-graduate" /> Counselor Activity</div>
            <div className={shared.cardBody}>
              {[
                { label: 'Sessions MTD',         value: '14',                    color: '#ccc' },
                { label: 'Sessions YTD',          value: '87',                    color: '#ccc' },
                { label: 'MOS Reclass YTD',       value: '3 submitted / 2 approved', color: STATUS_COLOR.Green },
                { label: 'Reenlistments QTD',     value: '6',                    color: STATUS_COLOR.Green },
                { label: 'Pending Follow-Up',     value: '5 soldiers',            color: STATUS_COLOR.Amber },
                { label: 'ACAP Referrals YTD',    value: '4',                    color: '#888' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ fontSize: 12, color: '#888' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── DASHBOARD (external nav) ───────────────────────────────────────────────
  if (subPage === 'dashboard') {
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header}><h2><i className="fas fa-tachometer-alt" /> Special Staff Dashboard</h2></div>
        <div className={shared.stats}>
          {[
            { label: 'Medical Ready', value: '87%', bg: STATUS_COLOR.Green },
            { label: 'Safety Incidents MTD', value: String(SAFETY_INCIDENTS.length), bg: STATUS_COLOR.Amber },
            { label: 'EO Complaints Open', value: String(EO_COMPLAINTS.filter(c => !c.status.startsWith('Closed')).length), bg: '#2d2d2d' },
            { label: 'Finance Actions Pending', value: String(FINANCE_ACTIONS.filter(a => a.status !== 'Approved').length), bg: '#2d2d2d' },
            { label: 'ETS in 90d', value: String(RETENTION_TRACKER.filter(r => r.daysOut <= 90).length), bg: '#2d2d2d' },
          ].map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-users-cog" /> Special Staff Status</div>
          <div className={shared.cardBody} style={{ padding: 0 }}>
            {SS_ENTITIES.map((e, i) => (
              <div key={e.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < SS_ENTITIES.length - 1 ? '1px solid #141414' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className={`fas ${e.icon}`} style={{ color: e.categoryColor, width: 14, textAlign: 'center' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ccc' }}>{e.label}</span>
                  <span style={{ fontSize: 10, color: '#555' }}>{e.rank} {e.incumbent}</span>
                </div>
                <button className={styles.btnDetail} onClick={() => onNavigate?.(`ss-${e.key}`)}>Open</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── ENTITY FUNCTION PAGES (e.g. ss-surgeon-sick-call) ────────────────────
  {
    const SS_FN_ENTITY_KEYS = ['career-counselor', 'eeo-teams', 'bn-safety', 'retention', 'as-team', 'at-team', 'surgeon', 'finance', 'safety', 'sharp', 'cbrn', 'pa', 'eo']
    const matchedEK = SS_FN_ENTITY_KEYS.find(k => subPage.startsWith(k + '-'))
    if (matchedEK) {
      const entity = SS_ENTITIES.find(e => e.key === matchedEK)
      const fnKey  = subPage.slice(matchedEK.length + 1)
      const FN_META: Record<string, Record<string, { label: string; icon: string; desc: string; items: string[] }>> = {
        surgeon:     { 'sick-call': { label: 'Sick Call Log', icon: 'fa-stethoscope', desc: 'Daily patient encounter log — diagnoses, dispositions, referrals.', items: ['Patient encounter entries', 'Diagnosis category breakdown', 'Referral tracking to MTF', 'Duty status and profile flags'] }, 'med-ready': { label: 'Medical Readiness', icon: 'fa-heartbeat', desc: 'MEDPROS compliance by section — green / amber / red dashboard.', items: ['Section-level MEDPROS status', 'Expiring items 30/60/90 day', 'Non-deployable flags', 'Weekly readiness trend'] }, 'profiles': { label: 'Profiles (DA 3349)', icon: 'fa-file-medical', desc: 'Active temporary and permanent medical profiles.', items: ['Active profile roster', 'Temporary vs permanent split', 'MOS-limiting profiles', 'Expiration tracking'] }, 'bh-referrals': { label: 'BH Referrals', icon: 'fa-brain', desc: 'Behavioral health referral pipeline and PDHRA results.', items: ['Open BH referral log', 'PDHRA completion tracking', 'Combat stress indicators', 'SRP / deployment clearances'] }, 'medevac': { label: 'MEDEVAC Coord', icon: 'fa-ambulance', desc: 'MEDEVAC requests, coordination actions, and after-action notes.', items: ['MEDEVAC request log', 'Landing zone coordination', 'Hand-off documentation', 'After-action entries'] } },
        pa:          { 'sick-call': { label: 'Sick Call', icon: 'fa-stethoscope', desc: 'Daily sick call encounters — diagnosis, treatment, disposition.', items: ['Daily encounter log', 'Diagnosis categories', 'Prescribed treatments', 'Follow-up scheduling'] }, 'profiles': { label: 'Profiles', icon: 'fa-file-medical', desc: 'DA 3349 issuance and tracking for assigned soldiers.', items: ['Active profile list', 'Issued by type / duration', 'Expiration alerts', 'Commander notifications'] }, 'immunize': { label: 'Immunizations', icon: 'fa-syringe', desc: 'Immunization currency tracking — administered and expiring.', items: ['Soldier immunization roster', 'Expiring within 30 / 60 days', 'Administration log', 'MEDPROS reconciliation'] }, 'prev-med': { label: 'Prev Medicine', icon: 'fa-shield-virus', desc: 'Field sanitation, DNBI prevention, and force health protection.', items: ['Field sanitation inspection log', 'DNBI case tracking', 'Pest control coordination', 'Water sanitation status'] } },
        safety:      { 'risk-assess': { label: 'Risk Assessments', icon: 'fa-clipboard-check', desc: 'Training event and operational risk assessments.', items: ['Open risk assessment log', 'Approved / pending / rejected', 'Residual risk matrix', 'Event calendar'] }, 'incidents': { label: 'Incidents', icon: 'fa-exclamation-circle', desc: 'DA 285 submissions — accidents, incidents, near misses.', items: ['Incident entries MTD / YTD', 'Class A–D breakdown', 'Root cause analysis', 'Corrective action tracking'] }, 'inspections': { label: 'Inspections', icon: 'fa-search', desc: 'Safety inspections — facilities, ranges, equipment.', items: ['Inspection schedule', 'Open findings', 'Corrective actions', 'Closure log'] }, 'hazards': { label: 'Hazards', icon: 'fa-radiation', desc: 'Open hazards from identification through abatement.', items: ['Hazard log — open / closed', 'Risk rating (RAC)', 'Abatement actions', 'Commander acceptance log'] } },
        cbrn:        { 'ipe-acct': { label: 'IPE Accountability', icon: 'fa-box', desc: 'Semi-annual IPE inventory by section.', items: ['IPE inventory by section', 'Serviceable vs unserviceable', 'Replacement requests', 'Next inspection date'] }, 'cbrn-trng': { label: 'CBRN Training', icon: 'fa-graduation-cap', desc: 'Annual CBRN training completion rates by section.', items: ['Training completion tracker', 'Overdue qualifications', 'DTMS sync status', 'Certification expiration'] }, 'decon-plan': { label: 'Decon Planning', icon: 'fa-broom', desc: 'Decontamination plans for training and operational scenarios.', items: ['Decon plan library', 'Site selection records', 'Equipment preposition plan', 'SOP reference'] }, 'radcon': { label: 'RADCON', icon: 'fa-radiation-alt', desc: 'Radiological control documentation and exposure tracking.', items: ['Dosimeter issue log', 'Cumulative exposure tracking', 'RADCON authority', 'Threshold alerts'] } },
        'bn-safety': { 'da285': { label: 'DA 285 Log', icon: 'fa-file-alt', desc: 'Battalion-level accident reporting and DA 285 submissions.', items: ['DA 285 submission log', 'Status of each submission', 'Supplemental reports', 'Command endorsement tracking'] }, 'safety-trng': { label: 'Safety Training', icon: 'fa-graduation-cap', desc: 'Mandatory safety training completion by unit.', items: ['Training matrix', 'Completion rates by company', 'Overdue soldiers', 'DTMS sync'] }, 'inspection': { label: 'Inspections', icon: 'fa-search', desc: 'Unit-level safety inspections and findings.', items: ['Inspection log', 'Open findings', 'Corrective actions', 'Re-inspection schedule'] } },
        sharp:       { 'case-mgmt': { label: 'Case Management', icon: 'fa-folder-open', desc: 'Sanitized SHARP case log — restricted and unrestricted.', items: ['Case index (sanitized)', 'Restricted vs unrestricted split', 'Days-open tracker', 'Status per case'] }, 'advocacy': { label: 'Advocacy', icon: 'fa-hands-helping', desc: 'Services provided, referral status, MTF / SJA / CID coordination.', items: ['Advocacy service log', 'Referral pipeline', 'Safety plan status', 'Follow-up schedule'] }, 'sharp-trng': { label: 'SHARP Training', icon: 'fa-graduation-cap', desc: 'Annual SHARP training completion rates by section.', items: ['Training completion matrix', 'Overdue units', 'DTMS reconciliation', 'Commander certification log'] }, 'ccs': { label: 'CCS Results', icon: 'fa-chart-bar', desc: 'Command Climate Survey administration and trend analysis.', items: ['CCS cycle status', 'Response rate by unit', 'Trend comparison', 'Commander action items'] } },
        eo:          { 'complaints': { label: 'EO Complaints', icon: 'fa-balance-scale', desc: 'Formal and informal EO complaint log — sanitized.', items: ['Complaint index (sanitized)', 'Formal vs informal split', 'Days-open tracker', 'Investigation status'] }, 'eo-trng': { label: 'EO Training', icon: 'fa-graduation-cap', desc: 'Annual EO training completion rates by section.', items: ['Training matrix', 'Completion rates', 'Overdue personnel', 'DTMS reconciliation'] }, 'cmd-climate': { label: 'Cmd Climate', icon: 'fa-cloud-sun', desc: 'CCS results and DEOCS cycle management.', items: ['Active CCS cycle', 'Response rates', 'Prior year results', 'Action item tracker'] }, 'annual-rpt': { label: 'Annual Report', icon: 'fa-file-alt', desc: 'Fiscal year EO metrics report submitted to higher HQ.', items: ['Draft / final report status', 'Key metrics summary', 'Commander signature block', 'Submission log'] } },
        'at-team':   { 'at-brief': { label: 'AT Briefings', icon: 'fa-shield-alt', desc: 'Unit and threat-specific AT briefings — FPCON and travel.', items: ['Current FPCON status', 'Theater threat briefs', 'Travel advisory log', 'Commander brief schedule'] }, 'vuln-assess': { label: 'Vuln Assess', icon: 'fa-search', desc: 'Physical security and vulnerability assessment records.', items: ['Assessment log', 'Open findings', 'Corrective actions', 'Closure tracking'] }, 'at-plan': { label: 'AT Plan', icon: 'fa-file-alt', desc: 'Unit anti-terrorism plan and annex status.', items: ['Current AT plan version', 'Review / update schedule', 'Commander approval log', 'Supporting annexes'] }, 'incident-rpt': { label: 'Incident Rpt', icon: 'fa-bell', desc: 'Suspicious activity and AT incident report log.', items: ['Incident entries MTD / YTD', 'SAPR submission status', 'Higher HQ coordination', 'Commander notification log'] } },
        'as-team':   { 'case-log': { label: 'Case Log', icon: 'fa-folder-open', desc: 'ASAP case log — all referrals, assessments, and outcomes.', items: ['Commander referral log', 'Self / medical referral log', 'Assessment status', 'Outcome / disposition tracking'] }, 'referrals': { label: 'Referrals', icon: 'fa-share-square', desc: 'Inbound referral pipeline — source, type, and status.', items: ['Referral source breakdown', 'Assessment scheduled / complete', 'Commander notification log', 'Days-to-assessment tracker'] }, 'testing': { label: 'Drug Testing', icon: 'fa-vial', desc: 'Unit urinalysis schedule, results, and positive case actions.', items: ['Testing schedule (random / unit)', 'Specimen submission log', 'Positive test notification', 'Commander action tracking'] }, 'treatment': { label: 'Treatment Status', icon: 'fa-hospital', desc: 'Active and completed treatment enrollments.', items: ['Inpatient enrollment log', 'Outpatient sessions tracker', 'Aftercare plan status', 'Return-to-duty notifications'] } },
        'eeo-teams': { 'eeo-cases': { label: 'EEO Cases', icon: 'fa-folder-open', desc: 'EEO complaint log — counseling through formal complaint.', items: ['Case index (sanitized)', 'Phase breakdown', 'Days-open tracker', 'Counselor assignments'] }, 'ra-requests': { label: 'RA Requests', icon: 'fa-universal-access', desc: 'Reasonable accommodation requests — status and HR coordination.', items: ['RA request log', 'Approval / denial tracking', 'HR coordination notes', 'Implementation status'] }, 'md715': { label: 'MD-715 Report', icon: 'fa-file-alt', desc: 'Annual EEO program status report submitted to EEOC.', items: ['Report draft status', 'Workforce data inputs', 'Barrier analysis', 'Submission log'] }, 'workforce': { label: 'Workforce Data', icon: 'fa-users', desc: 'Civilian workforce diversity metrics and trend analysis.', items: ['Demographic breakdown', 'Year-over-year trend', 'Representation vs benchmark', 'Grade / series breakdown'] } },
        finance:     { 'pay-actions': { label: 'Pay Actions', icon: 'fa-dollar-sign', desc: 'IPPS-A / DFAS pay actions — submission and tracking.', items: ['Action submission log', 'Pending vs processed', 'Error resolution', 'DFAS response tracking'] }, 'dts': { label: 'DTS / Travel', icon: 'fa-plane', desc: 'DTS voucher tracking — submitted, pending, paid.', items: ['Voucher log', 'Overdue submissions', 'Pending authorizations', 'Delinquency flags'] }, 'gtcc': { label: 'GTCC', icon: 'fa-credit-card', desc: 'Government Travel Charge Card issuance and delinquency tracking.', items: ['GTCC holder list', 'Delinquency tracker', 'Suspension alerts', 'New card requests'] }, 'budget': { label: 'Budget Exec', icon: 'fa-chart-pie', desc: 'Unit budget commitments, obligations, and expenditures.', items: ['Budget vs actuals', 'Commitment log', 'Obligation rate', 'Year-end projection'] } },
        retention:         { 'ets-tracker': { label: 'ETS Tracker', icon: 'fa-clock', desc: '18-month ETS window — counseling status and separation actions.', items: ['ETS roster (18-month)', 'Counseling status', 'Separation action initiation', 'Days-out flag'] }, 'srb': { label: 'SRB Eligible', icon: 'fa-star', desc: 'SRB eligibility windows and payment coordination.', items: ['SRB eligibility list', 'Zone A / B / C', 'Payment status', 'Window expiration alerts'] }, 'counseling': { label: 'Counseling Log', icon: 'fa-comments', desc: 'DA 4856 retention counseling records and follow-up schedule.', items: ['Counseling log', 'Follow-up schedule', 'Outcomes', 'Commander review dates'] }, 'ret-board': { label: 'Retention Board', icon: 'fa-gavel', desc: 'Board results, minutes, and commander endorsements.', items: ['Board schedule', 'Approved / disapproved', 'Minutes library', 'Commander signature tracking'] } },
        'career-counselor': { 'counseling': { label: 'Counseling Sessions', icon: 'fa-comments', desc: 'Individual career counseling sessions and follow-up log.', items: ['Session log by soldier', 'Topic / goal documented', 'Follow-up actions', 'Outcome tracking'] }, 'reenlist': { label: 'Reenlistment', icon: 'fa-handshake', desc: 'Reenlistment actions, ceremony schedule, and SRB coordination.', items: ['Reenlistment action log', 'Ceremony schedule', 'SRB coordination', 'RCMS submissions'] }, 'mos-options': { label: 'MOS Options', icon: 'fa-exchange-alt', desc: 'MOS reclassification requests and available options briefed.', items: ['Reclass request log', 'Options briefed per soldier', 'ACAP / SOCM enrollment', 'Approval status'] }, 'stats': { label: 'Statistics', icon: 'fa-chart-bar', desc: 'Career counseling activity metrics and trends.', items: ['Sessions MTD / YTD', 'Reenlistment rate', 'MOS reclass volume', 'Counselor workload'] } },
      }
      const isPii = ['surgeon', 'pa', 'sharp', 'eo', 'eeo-teams', 'as-team'].includes(matchedEK)
      const piiColors: Record<string, string> = { surgeon: '#27ae60', pa: '#27ae60', sharp: '#e74c3c', eo: '#9b59b6', 'eeo-teams': '#9b59b6', 'as-team': '#27ae60' }
      const piiTexts: Record<string, string> = {
        surgeon:     'FOUO — MEDICAL / HIPAA PROTECTED. Patient health information is protected under the Privacy Act and HIPAA. Access restricted to treatment team and authorized personnel.',
        pa:          'FOUO — MEDICAL / HIPAA PROTECTED. Patient health information is protected under the Privacy Act and HIPAA. Access restricted to treatment team and authorized personnel.',
        sharp:       'NEED TO KNOW — RESTRICTED / LEGAL PRIVILEGE. SHARP case information is legally privileged under 10 U.S.C. § 1044(c) and AR 600-20 Ch 7. Unauthorized disclosure is prohibited.',
        eo:          'NEED TO KNOW — EO COMPLAINT INFORMATION / PII PROTECTED. Complaint details are confidential under AR 600-20 and DoDD 1020.02E. Disclosure limited to authorized personnel.',
        'eeo-teams': 'NEED TO KNOW — EEO CASE INFORMATION / PII PROTECTED. Strictly confidential under 29 C.F.R. Part 1614 and the Privacy Act. Unauthorized disclosure is prohibited.',
        'as-team':   'FOUO — ASAP / MEDICAL / HIPAA PROTECTED. Substance abuse case records are protected under the Privacy Act (5 U.S.C. § 552a), HIPAA, and 42 C.F.R. Part 2. Access strictly limited to the ASAP counselor, commander, and authorized medical personnel.',
      }
      // ── SURGEON REPORTS ─────────────────────────────────────────────────────
      if (matchedEK === 'surgeon' && fnKey === 'reports') {
        const SICK_CALL = [
          { date: '18 Jun', soldier: 'SPC Torres, A.',   unit: '1/5 Alpha',  dx: 'Upper Respiratory Infection', disposition: 'RTD', profile: false, referral: false },
          { date: '18 Jun', soldier: 'SGT Kim, J.',       unit: '2/5 HHC',    dx: 'Ankle Sprain (Grade II)',     disposition: 'Profile', profile: true,  referral: false },
          { date: '17 Jun', soldier: 'PFC Nguyen, L.',   unit: '3/5 Bravo',  dx: 'Low Back Pain',               disposition: 'Profile', profile: true,  referral: false },
          { date: '17 Jun', soldier: 'SSG Williams, D.', unit: 'GSB FSC',    dx: 'Migraine',                    disposition: 'RTD w/ Meds', profile: false, referral: false },
          { date: '16 Jun', soldier: 'CPL Ahmed, R.',    unit: 'J4 Section', dx: 'Knee Pain (Patellar)',         disposition: 'Ortho Referral', profile: true,  referral: true },
          { date: '16 Jun', soldier: 'SPC Chavez, M.',  unit: '1/5 Charlie', dx: 'Skin Infection',              disposition: 'RTD w/ Meds', profile: false, referral: false },
          { date: '15 Jun', soldier: 'SGT Park, H.',     unit: '2/5 Alpha',  dx: 'Heat Illness (Mild)',         disposition: 'Profile 24h',  profile: true,  referral: false },
          { date: '14 Jun', soldier: 'PV2 Morris, T.',   unit: 'J1 Section', dx: 'Anxiety / BH Concern',        disposition: 'BH Referral',  profile: false, referral: true  },
        ]
        const ACTIVE_PROFILES = [
          { soldier: 'SGT Kim, J.',       unit: '1/5 Alpha', type: 'T3',  condition: 'Ankle Sprain',        issued: '18 Jun', expires: '25 Jun', mos: '18B', limiter: false },
          { soldier: 'PFC Nguyen, L.',   unit: '3/5 Bravo', type: 'T3',  condition: 'Low Back Pain',       issued: '17 Jun', expires: '24 Jun', mos: '18C', limiter: false },
          { soldier: 'CPL Ahmed, R.',    unit: 'J4 Section', type: 'T3', condition: 'Knee Pain',            issued: '16 Jun', expires: '30 Jun', mos: '92A', limiter: false },
          { soldier: 'SGT Park, H.',     unit: '2/5 Alpha', type: 'T2',  condition: 'Shoulder Instability', issued: '01 Jun', expires: '01 Aug', mos: '18D', limiter: true  },
          { soldier: 'SSG Martinez, R.', unit: 'GSB FSC',   type: 'P3',  condition: 'Chronic Knee (Post-Op)',issued: '15 Apr', expires: 'Perm',   mos: '91B', limiter: true  },
        ]
        const BH_REFERRALS = [
          { soldier: 'PV2 Morris, T.',   unit: 'J1 Section', referredBy: 'Surgeon', type: 'BH Eval',   referred: '14 Jun', status: 'Scheduled',  appt: '22 Jun', pdhra: 'Complete' },
          { soldier: 'SGT Okafor, E.',   unit: '1/5 HHC',    referredBy: 'Surgeon', type: 'PDHRA F/U', referred: '05 Jun', status: 'Complete',   appt: '12 Jun', pdhra: 'Complete' },
          { soldier: 'SPC Denton, C.',   unit: '3/5 Charlie', referredBy: 'PA',      type: 'BH Eval',   referred: '28 May', status: 'In Tx',      appt: 'Ongoing', pdhra: 'Pending' },
        ]
        const IMMUN_EXPIRING = [
          { soldier: 'SSG Williams, D.', unit: 'GSB FSC',   vaccine: 'Influenza',      expires: '01 Jul 2026', daysOut: 13 },
          { soldier: 'PFC Nguyen, L.',   unit: '3/5 Bravo', vaccine: 'Hep A (Series)', expires: '15 Jul 2026', daysOut: 27 },
          { soldier: 'SGT Torres, R.',   unit: '2/5 Alpha', vaccine: 'Typhoid',         expires: '20 Jul 2026', daysOut: 32 },
          { soldier: 'CPL Ahmed, R.',    unit: 'J4 Section', vaccine: 'Yellow Fever',   expires: '01 Aug 2026', daysOut: 44 },
          { soldier: 'SPC Chavez, M.',  unit: '1/5 Charlie', vaccine: 'Anthrax (Dose 4)', expires: '10 Aug 2026', daysOut: 53 },
        ]
        const totalAssigned = MED_READINESS.reduce((s, r) => s + r.total, 0)
        const totalGreen    = MED_READINESS.reduce((s, r) => s + r.green, 0)
        const readyPct      = Math.round((totalGreen / totalAssigned) * 100)
        const nonDeployable = ACTIVE_PROFILES.filter(p => p.limiter).length
        return (
          <div className={shared.page}>
            {pageHeader}
            <div className={shared.header} style={{ marginBottom: 12 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-stethoscope" style={{ color: '#27ae60' }} />
                Group Surgeon
                <i className="fas fa-chevron-right" style={{ fontSize: 10, color: '#444', margin: '0 2px' }} />
                <span style={{ color: '#ccc' }}>Reports</span>
              </h2>
              <span className={shared.sub}>MAJ Chen · DSN 635-1420 · Medical readiness, sick call, profiles, BH, immunizations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: 'rgba(39,174,96,0.07)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 4, marginBottom: 14 }}>
              <i className="fas fa-lock" style={{ color: '#27ae60', flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 10, color: '#666', lineHeight: 1.5 }}>FOUO — MEDICAL / HIPAA PROTECTED. Patient health information is protected under the Privacy Act (5 U.S.C. § 552a) and HIPAA. Access restricted to the treatment team and authorized personnel with a need to know.</span>
            </div>

            {/* Stats bar */}
            <div className={shared.stats} style={{ marginBottom: 14 }}>
              {[
                { label: 'Assigned',     value: String(totalAssigned),              bg: '#1a1a1a' },
                { label: 'Med Ready',    value: `${readyPct}%`,                     bg: readyPct >= 90 ? STATUS_COLOR.Green : STATUS_COLOR.Amber },
                { label: 'Non-Deploy',   value: String(nonDeployable),              bg: nonDeployable > 0 ? STATUS_COLOR.Amber : '#1a1a1a' },
                { label: 'Active Profiles', value: String(ACTIVE_PROFILES.length), bg: '#1a1a1a' },
                { label: 'BH Referrals', value: String(BH_REFERRALS.filter(r => r.status !== 'Complete').length), bg: '#1a1a1a' },
                { label: 'Sick Call MTD', value: String(SICK_CALL.length),          bg: '#1a1a1a' },
              ].map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Medical Readiness */}
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><i className="fas fa-heartbeat" style={{ color: '#27ae60', marginRight: 8 }} />Medical Readiness — MEDPROS Summary</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#444' }}>Source: MEDPROS</span>
                  <span style={{ fontSize: 10, color: '#555', fontStyle: 'italic' }}>Updated: Weekly</span>
                  <button className={styles.btnSecondary} style={{ fontSize: 10, padding: '3px 8px' }}><i className="fas fa-download" /> Export</button>
                </div>
              </div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Section</th><th>Assigned</th><th style={{ color: STATUS_COLOR.Green }}>Green</th><th style={{ color: STATUS_COLOR.Amber }}>Amber</th><th style={{ color: STATUS_COLOR.Red }}>Red</th><th>Ready %</th><th>Trend</th></tr></thead>
                  <tbody>
                    {MED_READINESS.map(r => {
                      const pct = r.total > 0 ? Math.round((r.green / r.total) * 100) : 0
                      const pctColor = pct >= 90 ? STATUS_COLOR.Green : pct >= 75 ? STATUS_COLOR.Amber : STATUS_COLOR.Red
                      return (
                        <tr key={r.section}>
                          <td style={{ fontWeight: 700 }}>{r.section}</td>
                          <td>{r.total}</td>
                          <td style={{ color: STATUS_COLOR.Green, fontWeight: 600 }}>{r.green}</td>
                          <td style={{ color: r.amber > 0 ? STATUS_COLOR.Amber : '#333', fontWeight: r.amber > 0 ? 600 : 400 }}>{r.amber}</td>
                          <td style={{ color: r.red > 0 ? STATUS_COLOR.Red : '#333', fontWeight: r.red > 0 ? 700 : 400 }}>{r.red}</td>
                          <td><span style={{ fontWeight: 700, color: pctColor }}>{pct}%</span></td>
                          <td style={{ fontSize: 10, color: '#333' }}>{pct >= 90 ? <span style={{ color: STATUS_COLOR.Green }}>▲ Steady</span> : pct >= 75 ? <span style={{ color: STATUS_COLOR.Amber }}>▼ Declining</span> : <span style={{ color: STATUS_COLOR.Red }}>▼ Critical</span>}</td>
                        </tr>
                      )
                    })}
                    <tr style={{ borderTop: '1px solid #222', background: '#0d0d0d' }}>
                      <td style={{ fontWeight: 700, color: '#888' }}>TOTAL</td>
                      <td style={{ fontWeight: 700 }}>{totalAssigned}</td>
                      <td style={{ color: STATUS_COLOR.Green, fontWeight: 700 }}>{totalGreen}</td>
                      <td style={{ color: STATUS_COLOR.Amber, fontWeight: 700 }}>{MED_READINESS.reduce((s, r) => s + r.amber, 0)}</td>
                      <td style={{ color: STATUS_COLOR.Red, fontWeight: 700 }}>{MED_READINESS.reduce((s, r) => s + r.red, 0)}</td>
                      <td><span style={{ fontWeight: 700, color: readyPct >= 90 ? STATUS_COLOR.Green : STATUS_COLOR.Amber }}>{readyPct}%</span></td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sick Call Log + Active Profiles */}
            <div className={shared.grid2} style={{ marginBottom: 14 }}>
              <div className={shared.card}>
                <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><i className="fas fa-stethoscope" style={{ color: '#27ae60', marginRight: 8 }} />Sick Call Log (Last 7 Days)</span>
                  <button className={styles.btnSecondary} style={{ fontSize: 10, padding: '3px 8px' }}><i className="fas fa-download" /> Export</button>
                </div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Date</th><th>Soldier</th><th>Unit</th><th>Dx</th><th>Disp.</th><th style={{ width: 60 }}>Flags</th></tr></thead>
                    <tbody>
                      {SICK_CALL.map((e, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 10, color: '#666', whiteSpace: 'nowrap' }}>{e.date}</td>
                          <td style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{e.soldier}</td>
                          <td style={{ fontSize: 10, color: '#555' }}>{e.unit}</td>
                          <td style={{ fontSize: 11 }}>{e.dx}</td>
                          <td style={{ fontSize: 10, color: '#888' }}>{e.disposition}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {e.profile  && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(201,162,39,0.15)', color: STATUS_COLOR.Amber }}>PRF</span>}
                              {e.referral && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(155,89,182,0.15)', color: '#9b59b6' }}>REF</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><i className="fas fa-file-medical" style={{ color: '#27ae60', marginRight: 8 }} />Active Profiles (DA 3349)</span>
                  <button className={styles.btnSecondary} style={{ fontSize: 10, padding: '3px 8px' }}><i className="fas fa-download" /> Export</button>
                </div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Soldier</th><th>Unit</th><th>Type</th><th>Condition</th><th>Issued</th><th>Expires</th><th>MOS Lmt</th></tr></thead>
                    <tbody>
                      {ACTIVE_PROFILES.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.soldier}</td>
                          <td style={{ fontSize: 10, color: '#555' }}>{p.unit}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: p.type.startsWith('P') ? 'rgba(231,76,60,0.12)' : 'rgba(201,162,39,0.12)', color: p.type.startsWith('P') ? STATUS_COLOR.Red : STATUS_COLOR.Amber }}>{p.type}</span></td>
                          <td style={{ fontSize: 11 }}>{p.condition}</td>
                          <td style={{ fontSize: 10, color: '#666' }}>{p.issued}</td>
                          <td style={{ fontSize: 10, color: p.expires === 'Perm' ? STATUS_COLOR.Red : '#666', fontWeight: p.expires === 'Perm' ? 700 : 400 }}>{p.expires}</td>
                          <td style={{ textAlign: 'center' }}>{p.limiter ? <span style={{ color: STATUS_COLOR.Red, fontWeight: 700, fontSize: 11 }}>YES</span> : <span style={{ color: '#333', fontSize: 11 }}>No</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BH Referrals + Immunizations Expiring */}
            <div className={shared.grid2}>
              <div className={shared.card}>
                <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><i className="fas fa-brain" style={{ color: '#27ae60', marginRight: 8 }} />BH Referrals &amp; PDHRA</span>
                  <button className={styles.btnSecondary} style={{ fontSize: 10, padding: '3px 8px' }}><i className="fas fa-download" /> Export</button>
                </div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Soldier</th><th>Unit</th><th>Type</th><th>Referred</th><th>Status</th><th>Appt</th><th>PDHRA</th></tr></thead>
                    <tbody>
                      {BH_REFERRALS.map((r, i) => {
                        const sc = r.status === 'Complete' ? STATUS_COLOR.Green : r.status === 'In Tx' ? '#9b59b6' : STATUS_COLOR.Amber
                        return (
                          <tr key={i}>
                            <td style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.soldier}</td>
                            <td style={{ fontSize: 10, color: '#555' }}>{r.unit}</td>
                            <td style={{ fontSize: 10 }}>{r.type}</td>
                            <td style={{ fontSize: 10, color: '#666' }}>{r.referred}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: sc + '22', color: sc }}>{r.status}</span></td>
                            <td style={{ fontSize: 10, color: '#666' }}>{r.appt}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, color: r.pdhra === 'Complete' ? STATUS_COLOR.Green : STATUS_COLOR.Amber }}>{r.pdhra}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><i className="fas fa-syringe" style={{ color: '#27ae60', marginRight: 8 }} />Immunizations Expiring (60 Days)</span>
                  <button className={styles.btnSecondary} style={{ fontSize: 10, padding: '3px 8px' }}><i className="fas fa-download" /> Export</button>
                </div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Soldier</th><th>Unit</th><th>Vaccine</th><th>Expires</th><th>Days Out</th></tr></thead>
                    <tbody>
                      {IMMUN_EXPIRING.map((im, i) => {
                        const urgColor = im.daysOut <= 14 ? STATUS_COLOR.Red : im.daysOut <= 30 ? STATUS_COLOR.Amber : '#888'
                        return (
                          <tr key={i}>
                            <td style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{im.soldier}</td>
                            <td style={{ fontSize: 10, color: '#555' }}>{im.unit}</td>
                            <td style={{ fontSize: 11 }}>{im.vaccine}</td>
                            <td style={{ fontSize: 10, color: '#666' }}>{im.expires}</td>
                            <td><span style={{ fontWeight: 700, color: urgColor }}>{im.daysOut}d</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      }

      const fnMeta = FN_META[matchedEK]?.[fnKey]
      return (
        <div className={shared.page}>
          {pageHeader}
          {entity && (
            <div className={shared.header} style={{ marginBottom: 12 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className={`fas ${entity.icon}`} style={{ color: entity.categoryColor }} />
                {entity.label}
                <i className="fas fa-chevron-right" style={{ fontSize: 10, color: '#444', margin: '0 2px' }} />
                <span style={{ color: '#ccc' }}>{fnMeta?.label ?? fnKey}</span>
              </h2>
              <span className={shared.sub}>{entity.rank} {entity.incumbent} · {entity.phone} · {fnMeta?.desc ?? 'Function page'}</span>
            </div>
          )}
          {isPii && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: piiColors[matchedEK] + '12', border: `1px solid ${piiColors[matchedEK]}40`, borderRadius: 4, marginBottom: 12 }}>
              <i className="fas fa-lock" style={{ color: piiColors[matchedEK], flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 10, color: '#666', lineHeight: 1.5 }}>{piiTexts[matchedEK]}</span>
            </div>
          )}
          {fnMeta ? (
            <div className={shared.grid2}>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className={`fas ${fnMeta.icon}`} style={{ marginRight: 8 }} />{fnMeta.label} — Scope</div>
                <div className={shared.cardBody}>
                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: 16 }}>{fnMeta.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {fnMeta.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#111', borderRadius: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#333', width: 20, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 12, color: '#666' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-tools" style={{ marginRight: 8 }} /> Under Development</div>
                <div className={shared.cardBody} style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <i className="fas fa-hammer" style={{ fontSize: 28, color: '#2d2d2d', display: 'block', marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#555', marginBottom: 8 }}>{fnMeta.label}</div>
                  <div style={{ fontSize: 11, color: '#333' }}>Function page scoped — content in development.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={shared.card}><div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#555' }}>Function not found — <strong style={{ color: '#ccc' }}>{fnKey}</strong></div></div>
          )}
        </div>
      )
    }
  }

  // ── REPORTS ────────────────────────────────────────────────────────────────
  if (subPage === 'reports') {
    const REPORT_GROUPS = [
      { category: 'Medical', color: '#27ae60', icon: 'fa-heartbeat', reports: [
        { title: 'Medical Readiness Report',  freq: 'Weekly',      source: 'MEDPROS',       owner: 'Group Surgeon',  desc: 'MEDPROS compliance summary by section — green / amber / red.' },
        { title: 'Sick Call Log',             freq: 'Daily',       source: 'THREADS',       owner: 'Physician Asst', desc: 'Daily patient encounter log; tracks diagnosis categories and referrals.' },
        { title: 'Immunization Status',       freq: 'Monthly',     source: 'MEDPROS',       owner: 'Physician Asst', desc: 'Currency of all immunizations; flags expiring within 30 days.' },
        { title: 'BH Referral Tracker',       freq: 'Monthly',     source: 'THREADS',       owner: 'Group Surgeon',  desc: 'Open behavioral health referrals, PDHRA results, combat stress cases.' },
        { title: 'Physical Profile (DA 3349)',freq: 'As Needed',   source: 'MEDPROS',       owner: 'Physician Asst', desc: 'Active temporary and permanent profiles; deployment impact.' },
        { title: 'MEDEVAC Coordination Log', freq: 'Event',       source: 'THREADS',       owner: 'Group Surgeon',  desc: 'MEDEVAC support requests, coordination actions, after-action notes.' },
      ]},
      { category: 'Safety & CBRN', color: '#e67e22', icon: 'fa-hard-hat', reports: [
        { title: 'Accident / Incident Log',   freq: 'Monthly',     source: 'DA 285',        owner: 'Safety Officer', desc: 'All DA 285 submissions — Class A–D and near misses — MTD and YTD.' },
        { title: 'Safety Training Tracker',   freq: 'Monthly',     source: 'DTMS',          owner: 'Safety NCO',     desc: 'Mandatory safety training completion by section.' },
        { title: 'Hazard Register',           freq: 'Monthly',     source: 'THREADS',       owner: 'Safety Officer', desc: 'Open hazards from identification through abatement and closure.' },
        { title: 'Risk Assessment Matrix',    freq: 'Event',       source: 'THREADS',       owner: 'Safety Officer', desc: 'Residual risk log for training events and operational activities.' },
        { title: 'IPE Accountability Report', freq: 'Semi-Annual', source: 'THREADS',       owner: 'CBRN Officer',   desc: 'Individual protective equipment inventory — serviceable / unserviceable.' },
        { title: 'CBRN Training Tracker',     freq: 'Annual',      source: 'DTMS',          owner: 'CBRN Officer',   desc: 'Annual CBRN training completion rates; flags overdue qualifications.' },
      ]},
      { category: 'Army Programs', color: '#9b59b6', icon: 'fa-shield-alt', reports: [
        { title: 'SHARP Case Log',            freq: 'Monthly',     source: 'THREADS',       owner: 'SHARP / SARC',   desc: 'Sanitized case tracker — restricted and unrestricted; status and SARC notes.' },
        { title: 'SHARP Training Report',     freq: 'Annual',      source: 'DTMS',          owner: 'SHARP / SARC',   desc: 'Annual SHARP training completion by section.' },
        { title: 'Command Climate Survey',    freq: 'Annual',      source: 'DEOCS',         owner: 'EO / SHARP',     desc: 'CCS results — trend analysis and commander action items.' },
        { title: 'EO Complaint Log',          freq: 'Monthly',     source: 'THREADS',       owner: 'EO Officer',     desc: 'Formal and informal EO complaints — sanitized tracker with days-open flag.' },
        { title: 'EO Training Report',        freq: 'Annual',      source: 'DTMS',          owner: 'EO Officer',     desc: 'Annual EO training completion by section.' },
        { title: 'EEO Complaint Log',         freq: 'Monthly',     source: 'THREADS',       owner: 'EEO Teams',      desc: 'Civilian EEO complaints — counseling phase through formal complaint.' },
        { title: 'RA Tracker',                freq: 'Monthly',     source: 'THREADS',       owner: 'EEO Teams',      desc: 'Reasonable accommodation requests — status and HR coordination.' },
      ]},
      { category: 'Admin Support', color: '#3498db', icon: 'fa-dollar-sign', reports: [
        { title: 'Finance Action Log',        freq: 'Monthly',     source: 'IPPS-A / DFAS', owner: 'Finance',        desc: 'Pay actions, DTS vouchers, GTCC status — MTD and YTD tracking.' },
        { title: 'DTS Voucher Tracker',       freq: 'Weekly',      source: 'DTS',           owner: 'Finance',        desc: 'Open and pending DTS vouchers — flags overdue for submission.' },
        { title: 'GTCC Delinquency Report',   freq: 'Monthly',     source: 'CITIBANK',      owner: 'Finance',        desc: 'Government Travel Charge Card delinquency tracker by soldier.' },
        { title: 'ETS Tracker (18-Month)',    freq: 'Monthly',     source: 'RCMS',          owner: 'Retention',      desc: '18-month ETS window — counseling status and separation actions.' },
        { title: 'Reenlistment Objective',    freq: 'Quarterly',   source: 'RCMS',          owner: 'Retention',      desc: 'Quarterly reenlistment objectives vs. actuals; trend analysis.' },
      ]},
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 16 }}>
          <h2><i className="fas fa-file-alt" /> Special Staff Reports</h2>
          <span className={shared.sub}>{REPORT_GROUPS.reduce((s, g) => s + g.reports.length, 0)} reports across all special staff functions</span>
        </div>
        {REPORT_GROUPS.map(group => (
          <div key={group.category} className={shared.card} style={{ marginBottom: 14 }}>
            <div className={shared.cardHeader}><i className={`fas ${group.icon}`} style={{ color: group.color, marginRight: 8 }} />{group.category}</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Report</th><th>Description</th><th>Frequency</th><th>Source</th><th>Owner</th><th style={{ width: 120 }}>Actions</th></tr></thead>
                <tbody>
                  {group.reports.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, whiteSpace: 'nowrap', color: '#ccc' }}>{r.title}</td>
                      <td style={{ fontSize: 11, color: '#666', maxWidth: 280 }}>{r.desc}</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#1e1e1e', color: '#888', whiteSpace: 'nowrap' }}>{r.freq}</span></td>
                      <td style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap' }}>{r.source}</td>
                      <td style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap' }}>{r.owner}</td>
                      <td><div style={{ display: 'flex', gap: 4 }}>
                        <button className={styles.btnSecondary} style={{ fontSize: 10, padding: '3px 8px' }}><i className="fas fa-download" /> Export</button>
                        <button className={styles.btnPrimary} style={{ fontSize: 10, padding: '3px 8px' }}><i className="fas fa-eye" /> View</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── TRACKERS ───────────────────────────────────────────────────────────────
  if (subPage === 'trackers') {
    const totalAssigned = MED_READINESS.reduce((s, r) => s + r.total, 0)
    const totalGreen    = MED_READINESS.reduce((s, r) => s + r.green, 0)
    const readyPct      = totalAssigned > 0 ? Math.round((totalGreen / totalAssigned) * 100) : 0
    const openIncidents = SAFETY_INCIDENTS.filter(i => i.status === 'Open').length
    const openSharp     = SHARP_CASES.filter(c => !c.status.startsWith('Closed')).length
    const openEo        = EO_COMPLAINTS.filter(c => !c.status.startsWith('Closed')).length
    const openFinance   = FINANCE_ACTIONS.filter(a => a.status !== 'Approved').length
    const ets90         = RETENTION_TRACKER.filter(r => r.daysOut <= 90).length
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 14 }}><h2><i className="fas fa-tasks" /> Special Staff Trackers</h2><span className={shared.sub}>Cross-functional readiness snapshot — all special staff programs</span></div>
        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {[
            { label: 'Med Ready', value: `${readyPct}%`, bg: readyPct >= 90 ? STATUS_COLOR.Green : STATUS_COLOR.Amber },
            { label: 'Safety Open', value: String(openIncidents), bg: openIncidents > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
            { label: 'SHARP Open', value: String(openSharp), bg: openSharp > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
            { label: 'EO Open', value: String(openEo), bg: openEo > 0 ? STATUS_COLOR.Amber : '#2d2d2d' },
            { label: 'Finance Pending', value: String(openFinance), bg: openFinance > 2 ? STATUS_COLOR.Amber : '#2d2d2d' },
            { label: 'ETS ≤ 90d', value: String(ets90), bg: ets90 > 0 ? STATUS_COLOR.Amber : '#2d2d2d' },
          ].map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className={shared.card} style={{ marginBottom: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-heartbeat" style={{ color: '#27ae60', marginRight: 8 }} />Medical Readiness (MEDPROS)</div>
          <div className={shared.tableWrap}><table className={shared.table}>
            <thead><tr><th>Section</th><th>Assigned</th><th style={{ color: STATUS_COLOR.Green }}>Green</th><th style={{ color: STATUS_COLOR.Amber }}>Amber</th><th style={{ color: STATUS_COLOR.Red }}>Red</th><th>Ready %</th></tr></thead>
            <tbody>{MED_READINESS.map(r => { const pct = r.total > 0 ? Math.round((r.green / r.total) * 100) : 0; const pctColor = pct >= 90 ? STATUS_COLOR.Green : pct >= 75 ? STATUS_COLOR.Amber : STATUS_COLOR.Red; return (<tr key={r.section}><td style={{ fontWeight: 700 }}>{r.section}</td><td>{r.total}</td><td style={{ color: STATUS_COLOR.Green }}>{r.green}</td><td style={{ color: STATUS_COLOR.Amber }}>{r.amber}</td><td style={{ color: r.red > 0 ? STATUS_COLOR.Red : '#333' }}>{r.red}</td><td style={{ fontWeight: 700, color: pctColor }}>{pct}%</td></tr>) })}</tbody>
          </table></div>
        </div>
        <div className={shared.grid2} style={{ marginBottom: 14 }}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-exclamation-triangle" style={{ color: '#e67e22', marginRight: 8 }} />Safety Incidents (MTD)</div>
            <div className={shared.tableWrap}><table className={shared.table}>
              <thead><tr><th>Date</th><th>Type</th><th>Unit</th><th>Severity</th><th>Status</th></tr></thead>
              <tbody>{SAFETY_INCIDENTS.map((inc, i) => { const sevColor = inc.severity === 'Class C' ? STATUS_COLOR.Amber : inc.severity === 'Class D' ? STATUS_COLOR.Red : '#555'; const statColor = inc.status === 'Open' ? STATUS_COLOR.Red : STATUS_COLOR.Green; return (<tr key={i}><td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{inc.date}</td><td style={{ fontSize: 11 }}>{inc.type}</td><td style={{ fontSize: 10, color: '#666' }}>{inc.unit}</td><td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: sevColor + '22', color: sevColor }}>{inc.severity}</span></td><td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: statColor + '22', color: statColor }}>{inc.status}</span></td></tr>) })}</tbody>
            </table></div>
          </div>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-box" style={{ color: '#e67e22', marginRight: 8 }} />IPE Accountability (CBRN)</div>
            <div className={shared.tableWrap}><table className={shared.table}>
              <thead><tr><th>Section</th><th>Total</th><th style={{ color: STATUS_COLOR.Green }}>Svc</th><th style={{ color: STATUS_COLOR.Red }}>Unsvc</th><th>Rate</th></tr></thead>
              <tbody>{IPE_STATUS.map(r => { const pct = r.total > 0 ? Math.round((r.svc / r.total) * 100) : 0; return (<tr key={r.section}><td style={{ fontWeight: 700 }}>{r.section}</td><td>{r.total}</td><td style={{ color: STATUS_COLOR.Green }}>{r.svc}</td><td style={{ color: r.unsvc > 0 ? STATUS_COLOR.Red : '#333' }}>{r.unsvc}</td><td style={{ fontWeight: 700, color: pct >= 90 ? STATUS_COLOR.Green : STATUS_COLOR.Amber }}>{pct}%</td></tr>) })}</tbody>
            </table></div>
          </div>
        </div>
        <div className={shared.grid2} style={{ marginBottom: 14 }}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-shield-alt" style={{ color: '#9b59b6', marginRight: 8 }} />SHARP Cases (YTD — Sanitized)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(231,76,60,0.06)', borderBottom: '1px solid rgba(231,76,60,0.15)' }}><i className="fas fa-lock" style={{ color: '#e74c3c', fontSize: 10 }} /><span style={{ fontSize: 10, color: '#555' }}>RESTRICTED — Need to Know / Legal Privilege only</span></div>
            <div className={shared.tableWrap}><table className={shared.table}>
              <thead><tr><th>Case #</th><th>Type</th><th>Reporting</th><th>Status</th><th>Days Open</th></tr></thead>
              <tbody>{SHARP_CASES.map(c => { const isClosed = c.status.startsWith('Closed'); const statColor = isClosed ? '#27ae60' : c.daysOpen > 14 ? STATUS_COLOR.Red : STATUS_COLOR.Amber; const reptColor = c.reporting === 'Restricted' ? '#9b59b6' : '#3498db'; return (<tr key={c.id}><td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{c.id}</td><td style={{ fontSize: 11 }}>{c.type}</td><td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: reptColor + '22', color: reptColor }}>{c.reporting}</span></td><td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: statColor + '22', color: statColor }}>{c.status}</span></td><td style={{ fontWeight: 700, color: !isClosed && c.daysOpen > 14 ? STATUS_COLOR.Red : '#888' }}>{isClosed ? '—' : `${c.daysOpen}d`}</td></tr>) })}</tbody>
            </table></div>
          </div>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-balance-scale" style={{ color: '#9b59b6', marginRight: 8 }} />EO Complaints (YTD — Sanitized)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(155,89,182,0.06)', borderBottom: '1px solid rgba(155,89,182,0.15)' }}><i className="fas fa-lock" style={{ color: '#9b59b6', fontSize: 10 }} /><span style={{ fontSize: 10, color: '#555' }}>RESTRICTED — Need to Know only; complaint info is confidential</span></div>
            <div className={shared.tableWrap}><table className={shared.table}>
              <thead><tr><th>Case #</th><th>Type</th><th>Formal</th><th>Status</th><th>Days Open</th></tr></thead>
              <tbody>{EO_COMPLAINTS.map(c => { const isClosed = c.status.startsWith('Closed'); const statColor = isClosed ? '#27ae60' : c.daysOpen > 14 ? STATUS_COLOR.Red : STATUS_COLOR.Amber; return (<tr key={c.id}><td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{c.id}</td><td style={{ fontSize: 11 }}>{c.type}</td><td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: c.formal ? 'rgba(231,76,60,0.12)' : 'rgba(201,162,39,0.12)', color: c.formal ? '#e74c3c' : '#c9a227' }}>{c.formal ? 'Formal' : 'Informal'}</span></td><td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: statColor + '22', color: statColor }}>{c.status}</span></td><td style={{ fontWeight: 700, color: !isClosed && c.daysOpen > 14 ? STATUS_COLOR.Red : '#888' }}>{isClosed ? '—' : `${c.daysOpen}d`}</td></tr>) })}</tbody>
            </table></div>
          </div>
        </div>
        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-dollar-sign" style={{ color: '#3498db', marginRight: 8 }} />Finance Actions</div>
            <div className={shared.tableWrap}><table className={shared.table}>
              <thead><tr><th>Soldier</th><th>Type</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>{FINANCE_ACTIONS.map((a, i) => { const sc = a.status === 'Overdue' ? STATUS_COLOR.Red : a.status === 'Approved' ? STATUS_COLOR.Green : a.status === 'Processing' ? '#9b59b6' : STATUS_COLOR.Amber; return (<tr key={i}><td style={{ fontWeight: 600, fontSize: 11 }}>{a.soldier}</td><td style={{ fontSize: 11 }}>{a.type}</td><td style={{ fontFamily: 'monospace', fontSize: 11 }}>{a.amount}</td><td style={{ fontSize: 10, color: a.status === 'Overdue' ? STATUS_COLOR.Red : '#666' }}>{a.due}</td><td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: sc + '22', color: sc }}>{a.status}</span></td></tr>) })}</tbody>
            </table></div>
          </div>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clock" style={{ color: '#3498db', marginRight: 8 }} />Retention — ETS Tracker (180-Day)</div>
            <div className={shared.tableWrap}><table className={shared.table}>
              <thead><tr><th>Soldier</th><th>ETS</th><th>Days Out</th><th>SRB</th><th>Status</th></tr></thead>
              <tbody>{RETENTION_TRACKER.map((r, i) => { const fc = r.daysOut <= 30 ? STATUS_COLOR.Red : r.daysOut <= 90 ? STATUS_COLOR.Amber : '#888'; return (<tr key={i}><td style={{ fontWeight: 600, fontSize: 11 }}>{r.soldier}</td><td style={{ fontSize: 11 }}>{r.ets}</td><td style={{ fontWeight: 700, color: fc }}>{r.daysOut}d</td><td style={{ fontSize: 10, color: r.srbEligible ? STATUS_COLOR.Green : '#444' }}>{r.srbEligible ? 'Yes' : 'No'}</td><td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: r.status === 'Counseled' ? 'rgba(39,174,96,0.15)' : 'rgba(201,162,39,0.12)', color: r.status === 'Counseled' ? '#27ae60' : '#c9a227' }}>{r.status}</span></td></tr>) })}</tbody>
            </table></div>
          </div>
        </div>
      </div>
    )
  }

  // ── REQUESTS ───────────────────────────────────────────────────────────────
  const SS_REQUESTS = [
    { id:'SS-REQ-001', soldier:'SSG Rivera, M.', type:'Training Request',   directedTo:'SGS',     submitted:'10 Jun 2026', priority:'Routine', status:'Approved',    notes:'SERE Level C — approved, slot confirmed'         },
    { id:'SS-REQ-002', soldier:'CPT Walsh, T.',   type:'Medical Waiver',      directedTo:'Surgeon', submitted:'12 Jun 2026', priority:'High',    status:'In Review',  notes:'Deployment medical waiver — pending CDR review'   },
    { id:'SS-REQ-003', soldier:'SFC Dumas, K.',   type:'Legal Assistance',    directedTo:'JAG',     submitted:'14 Jun 2026', priority:'Routine', status:'Pending',    notes:'Power of attorney requested before deployment'    },
    { id:'SS-REQ-004', soldier:'MSG Torres, A.',  type:'Chaplain Counseling', directedTo:'Chaplain',submitted:'15 Jun 2026', priority:'Urgent',  status:'Active',     notes:'Urgent — personal crisis; CDR notified'           },
    { id:'SS-REQ-005', soldier:'SGT Park, J.',    type:'Safety Incident Rpt', directedTo:'Safety',  submitted:'16 Jun 2026', priority:'High',    status:'In Review',  notes:'Near-miss during range operations — under review'  },
    { id:'SS-REQ-006', soldier:'PFC Nguyen, L.',  type:'Legal Assistance',    directedTo:'JAG',     submitted:'08 Jun 2026', priority:'Routine', status:'Complete',   notes:'Consumer protection issue resolved'               },
    { id:'SS-REQ-007', soldier:'CW2 Banks, R.',   type:'Medical Consult',     directedTo:'Surgeon', submitted:'05 Jun 2026', priority:'Routine', status:'Complete',   notes:'Pre-deployment medical screening complete'        },
    { id:'SS-REQ-008', soldier:'SSG Collins, D.', type:'Training Request',    directedTo:'SGS',     submitted:'17 Jun 2026', priority:'High',    status:'Overdue',    notes:'Jump school slot — coord deadline passed'         },
  ]
  if (subPage === 'requests') {
    const priorityColor = (p: string) => p === 'Urgent' ? STATUS_COLOR.Red : p === 'High' ? STATUS_COLOR.Amber : '#555'
    const statusColor   = (s: string) => s === 'Complete' || s === 'Approved' ? STATUS_COLOR.Green : s === 'Overdue' || s === 'Active' ? STATUS_COLOR.Red : s === 'In Review' || s === 'Under Review' ? '#9b59b6' : STATUS_COLOR.Amber
    const overdue = SS_REQUESTS.filter(r => r.status === 'Overdue').length
    const urgent  = SS_REQUESTS.filter(r => r.priority === 'Urgent').length
    const complete = SS_REQUESTS.filter(r => r.status === 'Complete' || r.status === 'Approved').length
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 14 }}><h2><i className="fas fa-inbox" /> Special Staff Requests</h2><span className={shared.sub}>All inbound requests directed to special staff functions</span></div>
        <div className={shared.stats} style={{ marginBottom: 14 }}>
          {[
            { label: 'Total', value: String(SS_REQUESTS.length), bg: '#2d2d2d' },
            { label: 'Urgent', value: String(urgent), bg: urgent > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
            { label: 'Overdue', value: String(overdue), bg: overdue > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
            { label: 'Complete', value: String(complete), bg: STATUS_COLOR.Green },
          ].map(s => (<div key={s.label} className={shared.stat} style={{ background: s.bg }}><div className={shared.statValue}>{s.value}</div><div className={shared.statLabel}>{s.label}</div></div>))}
        </div>
        <div className={shared.card}>
          <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><i className="fas fa-list-alt" /> Request Log</span>
            <button className={styles.btnPrimary}><i className="fas fa-plus" /> New Request</button>
          </div>
          <div className={shared.tableWrap}><table className={shared.table}>
            <thead><tr><th>ID</th><th>Soldier</th><th>Request Type</th><th>Directed To</th><th>Submitted</th><th>Priority</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>{SS_REQUESTS.map(r => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#888' }}>{r.id}</td>
                <td style={{ fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{r.soldier}</td>
                <td style={{ fontSize: 11 }}>{r.type}</td>
                <td style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap' }}>{r.directedTo}</td>
                <td style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap' }}>{r.submitted}</td>
                <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: priorityColor(r.priority) + '22', color: priorityColor(r.priority) }}>{r.priority}</span></td>
                <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: statusColor(r.status) + '22', color: statusColor(r.status) }}>{r.status}</span></td>
                <td style={{ fontSize: 10, color: '#555', maxWidth: 220 }}>{r.notes}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
    )
  }

  // ── RESOURCES ──────────────────────────────────────────────────────────────
  if (subPage === 'resources') {
    const RES_GROUPS = [
      { label: 'Medical', color: '#27ae60', icon: 'fa-heartbeat',
        regs: [{ ref: 'AR 40-66', title: 'Medical Records Administration' }, { ref: 'AR 40-501', title: 'Standards of Medical Fitness' }, { ref: 'FM 4-02', title: 'Army Health System' }, { ref: 'DA Pam 40-502', title: 'Medical Readiness Procedures' }],
        systems: [{ label: 'MEDPROS', desc: 'Medical Readiness tracking', status: 'pending' }, { label: 'MHS Genesis', desc: 'Electronic Health Record', status: 'pending' }, { label: 'THREADS', desc: 'Unit readiness integration', status: 'connected' }],
        contacts: [{ label: 'Blanchfield ACH', value: 'DSN 635-7000' }, { label: 'MEDCOE', value: 'DSN 429-6301' }, { label: 'MEDEVAC Coord', value: 'Unit SOP' }],
      },
      { label: 'Safety & CBRN', color: '#e67e22', icon: 'fa-hard-hat',
        regs: [{ ref: 'AR 385-10', title: 'Army Safety Program' }, { ref: 'DA Pam 385-10', title: 'Risk Management' }, { ref: 'AR 385-63', title: 'Range Safety' }, { ref: 'ATP 3-11.32', title: 'CBRN Multi-Service Doctrine' }],
        systems: [{ label: 'ASIMS', desc: 'Army Safety Info Mgmt System', status: 'pending' }, { label: 'DTMS', desc: 'Digital Training Mgmt System', status: 'pending' }, { label: 'THREADS', desc: 'Incident and IPE tracking', status: 'connected' }],
        contacts: [{ label: 'Brigade Safety', value: 'Pending' }, { label: 'USACRC', value: '1-800-RDY-ARMY' }, { label: 'CBRN School', value: 'DSN 676-0111' }],
      },
      { label: 'Army Programs (EO / SHARP / EEO)', color: '#9b59b6', icon: 'fa-shield-alt',
        regs: [{ ref: 'AR 600-20', title: 'Army Command Policy (EO & SHARP, Ch 6–7)' }, { ref: '29 CFR Part 1614', title: 'Federal Sector EEO Complaint Procedures' }, { ref: 'DoDD 1020.02E', title: 'Diversity Management and Equal Opportunity' }],
        systems: [{ label: 'DEOCS', desc: 'Defense Organizational Climate Survey', status: 'pending' }, { label: 'SafeHelpline', desc: 'DoD SHARP crisis — 1-877-995-5247', status: 'connected' }, { label: 'THREADS', desc: 'EO, SHARP, EEO case integration', status: 'connected' }],
        contacts: [{ label: 'DoD Safe Helpline', value: '1-877-995-5247' }, { label: 'CID', value: 'DSN 635-7676' }, { label: 'SJA / JAG', value: 'DSN 635-4700' }, { label: 'EEOC', value: '1-800-669-4000' }],
      },
      { label: 'Admin Support (Finance & Retention)', color: '#3498db', icon: 'fa-dollar-sign',
        regs: [{ ref: 'AR 37-104-4', title: 'Military Pay and Allowances Policy' }, { ref: 'AR 601-280', title: 'Army Retention Program' }, { ref: 'JTR Vol 1', title: 'Joint Travel Regulations — Military' }],
        systems: [{ label: 'IPPS-A', desc: 'Integrated Personnel & Pay System', status: 'pending' }, { label: 'DTS', desc: 'Defense Travel System', status: 'pending' }, { label: 'RCMS', desc: 'Retention and Career Mgmt System', status: 'pending' }, { label: 'THREADS', desc: 'Finance and retention integration', status: 'connected' }],
        contacts: [{ label: 'DFAS', value: '1-888-332-7411' }, { label: 'HRC Retention', value: 'DSN 221-8500' }, { label: 'IPAC / Finance', value: 'DSN 635-1700' }],
      },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.header} style={{ marginBottom: 16 }}><h2><i className="fas fa-book" /> Special Staff Resources</h2><span className={shared.sub}>Regulations, systems, and contacts for all special staff functions</span></div>
        {RES_GROUPS.map(group => (
          <div key={group.label} className={shared.card} style={{ marginBottom: 14 }}>
            <div className={shared.cardHeader}><i className={`fas ${group.icon}`} style={{ color: group.color, marginRight: 8 }} />{group.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '1px solid #1a1a1a' }}>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Regulations / Doctrine</div>
                {group.regs.map((r, i) => (<div key={i} style={{ padding: '6px 0', borderBottom: i < group.regs.length - 1 ? '1px solid #141414' : 'none' }}><span style={{ fontSize: 11, fontWeight: 700, color: group.color, display: 'block' }}>{r.ref}</span><span style={{ fontSize: 10, color: '#555' }}>{r.title}</span></div>))}
              </div>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Systems / Portals</div>
                {group.systems.map((s, i) => (<div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: i < group.systems.length - 1 ? '1px solid #141414' : 'none' }}><div><div style={{ fontSize: 11, fontWeight: 700, color: '#ccc' }}>{s.label}</div><div style={{ fontSize: 10, color: '#555' }}>{s.desc}</div></div><span className={`${styles.sorPill} ${SOR_CLS[s.status]}`} style={{ fontSize: 9, flexShrink: 0 }}><span className={styles.sorDot} />{s.status}</span></div>))}
              </div>
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Key Contacts</div>
                {group.contacts.map((c, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < group.contacts.length - 1 ? '1px solid #141414' : 'none' }}><span style={{ fontSize: 11, color: '#888' }}>{c.label}</span><span style={{ fontSize: 11, fontWeight: 700, color: c.value === 'Pending' ? '#333' : '#ccc' }}>{c.value}</span></div>))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  // ── ADMIN SUB-PAGES ────────────────────────────────────────────────────────
  if (subPage.startsWith('adm-')) {
    const admLabel = ADMIN_NAV_ITEMS.find(a => a.key === subPage)?.label ?? subPage
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <div className={shared.card}>
          <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
            <i className="fas fa-tools" style={{ fontSize: 28, display: 'block', marginBottom: 12, color: '#333' }} />
            <strong style={{ color: '#ccc', display: 'block', marginBottom: 6 }}>{admLabel}</strong>
            <span style={{ color: '#555', fontSize: 11 }}>Admin section under construction</span>
          </div>
        </div>
      </div>
    )
  }

  // ── FALLBACK ───────────────────────────────────────────────────────────────
  return (
    <div className={shared.page}>
      {pageHeader}
      <div className={shared.card}>
        <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#555', fontSize: 13 }}>
          <i className="fas fa-tools" style={{ fontSize: 28, display: 'block', marginBottom: 12, color: '#333' }} />
          <span>Page under construction — <strong style={{ color: '#ccc' }}>{subPage}</strong></span>
        </div>
      </div>
    </div>
  )
}
