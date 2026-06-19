import styles from './IntegrationMap.module.css'

interface SorEntry {
  key: string
  label: string
  fullName: string
  description: string
  dataFields: string[]
  status: 'connected' | 'pending' | 'planned'
  url?: string
}

interface SorGroup {
  section: string
  title: string
  icon: string
  systems: SorEntry[]
}

const SOR_GROUPS: SorGroup[] = [
  {
    section: 'S1',
    title: 'S1 — Personnel',
    icon: 'fa-id-card',
    systems: [
      {
        key: 'ippsa',
        label: 'IPPS-A',
        fullName: 'Integrated Personnel & Pay System — Army',
        description: 'Master SOR for all Army personnel actions, pay records, and leave management. DA Form 31 processed within IPPS-A.',
        dataFields: ['Grade / Rank', 'MOS / Duty Position', 'BASD / PEBD / ETS', 'Leave Balances', 'Pay Data', 'DD93 / SGLV', 'Eval Status'],
        status: 'pending',
      },
      {
        key: 'iperms',
        label: 'iPERMS',
        fullName: 'Interactive Personnel Electronic Records Management System',
        description: 'Official repository for military personnel records: ORB, ERB, DA Forms, evaluation reports, and award documents.',
        dataFields: ['ORB / ERB', 'Evaluation Reports (OER/NCOER)', 'Awards & Decorations', 'Training Certificates', 'DA Form 4651 (Request for Reserve Component Assignment)'],
        status: 'planned',
      },
      {
        key: 'hr_connect',
        label: 'HR Connect',
        fullName: 'HR Connect / Human Resources Command Portal',
        description: 'HRC portal for officer/enlisted assignments, promotion boards, and personnel actions requiring HRC adjudication.',
        dataFields: ['Assignment Orders', 'Promotion Status', 'Branch Preferences', 'Talent Profile', 'Command Selection List'],
        status: 'pending',
      },
      {
        key: 'rcms',
        label: 'RCMS',
        fullName: 'Retention Control and Management System',
        description: 'Manages reenlistment eligibility windows, SRB entitlements, and retention counseling actions.',
        dataFields: ['Reenlistment Eligibility Date', 'SRB Option', 'Career Counselor Actions', 'Retention Window Status'],
        status: 'pending',
      },
    ],
  },
  {
    section: 'S2',
    title: 'S2 — Intelligence / Security',
    icon: 'fa-shield-alt',
    systems: [
      {
        key: 'diss',
        label: 'DISS',
        fullName: 'Defense Information System for Security',
        description: 'DoD SOR for security clearance adjudications, investigations, and access management. Replaced JPAS in 2021.',
        dataFields: ['Clearance Level & Status', 'Investigation Type & Date', 'Adjudication Date', 'SCI / SAP Access', 'Incident Reports'],
        status: 'planned',
      },
      {
        key: 'eapp',
        label: 'eApp',
        fullName: 'Electronic Application (SF-86 Portal)',
        description: 'OPM portal for submitting and updating SF-86 background investigation packages.',
        dataFields: ['SF-86 Submission Status', 'Periodic Reinvestigation Date', 'Continuous Vetting Flags'],
        status: 'planned',
      },
      {
        key: 'stepp',
        label: 'STEPP',
        fullName: 'Security Training, Education, and Professionalization Portal',
        description: 'CI and security awareness training tracking for Army personnel requiring counterintelligence certifications.',
        dataFields: ['CI Awareness Training', 'OPSEC Certification', 'SERE Training Level', 'Security Course Completions'],
        status: 'planned',
      },
    ],
  },
  {
    section: 'S3',
    title: 'S3 — Operations',
    icon: 'fa-crosshairs',
    systems: [
      {
        key: 'atrrs',
        label: 'ATRRS',
        fullName: 'Army Training Requirements and Resources System',
        description: 'Army-wide course catalog, school seat requisition, and quota management for institutional training.',
        dataFields: ['School Seat Reservations', 'Course Completion Records', 'Training Quotas by MOS', 'DA Form 1059 (Service School Academic Report)'],
        status: 'planned',
      },
      {
        key: 'dtms',
        label: 'DTMS',
        fullName: 'Digital Training Management System',
        description: 'Unit-level training management: task scheduling, Army Fitness Test (AFT) scores, training status tracking. AFT data lives here — not in a separate ACFT database.',
        dataFields: ['Army Fitness Test (AFT) Scores', 'METL Tasks & Proficiency', 'Training Schedule', 'Individual Task Completion', 'Range / Resource Requests'],
        status: 'pending',
      },
      {
        key: 'jko',
        label: 'JKO',
        fullName: 'Joint Knowledge Online',
        description: 'DISA-managed e-learning platform for mandatory and elective online training courses across all services.',
        dataFields: ['Mandatory Course Completions', 'Law of War Training', 'SHARP / EO Training', 'Anti-Terrorism Training', 'OPSEC Certification'],
        status: 'planned',
      },
    ],
  },
  {
    section: 'S4',
    title: 'S4 — Logistics',
    icon: 'fa-boxes',
    systems: [
      {
        key: 'gcss',
        label: 'GCSS-Army',
        fullName: 'Global Combat Support System — Army',
        description: 'SAP-based ERP for Army logistics: property book, unit supply, maintenance management, and equipment accountability.',
        dataFields: ['Property Book Items', 'Hand Receipt / Sub-Hand Receipt', 'Equipment Readiness (FMC/NMC)', 'PMCS Schedules', 'Work Orders', 'Supply Requests (MILSTRIP)'],
        status: 'pending',
      },
      {
        key: 'sams_e',
        label: 'SAMS-E',
        fullName: 'Standard Army Maintenance System — Enhanced',
        description: 'Unit-level equipment maintenance records, work order management, and DA Form 5988-E (PMCS) scheduling.',
        dataFields: ['Equipment Maintenance History', 'PMCS Intervals', 'Work Order Status', 'Parts on Order', 'DA Form 2404 (Equipment Inspection)'],
        status: 'planned',
      },
      {
        key: 'dts',
        label: 'DTS',
        fullName: 'Defense Travel System',
        description: 'DoD travel management for TDY orders, travel reimbursements, and per diem. Source for leader tracker TDY status.',
        dataFields: ['TDY Orders', 'Travel Vouchers', 'Per Diem Entitlements', 'Traveler Status (en route / at destination)', 'Government Travel Card'],
        status: 'planned',
      },
      {
        key: 'fmsweb',
        label: 'FMSWeb',
        fullName: 'Force Management System Web',
        description: 'DA-managed portal for FY-approved MTOEs, TDAs, and equipment authorizations by para/line with LIN/NSN detail.',
        dataFields: ['MTOE Authorizations by Para/Line', 'Grade/MOS Requirements', 'Equipment LIN/NSN Authorizations', 'FY Approval Status', 'Organizational Structure'],
        status: 'pending',
      },
      {
        key: 'liw',
        label: 'LIW',
        fullName: 'Logistics Information Warehouse',
        description: 'Consolidated logistics data warehouse including FEDLOG (Federal Logistics Data), national inventory, and supply catalog.',
        dataFields: ['NSN / LIN Lookup (FEDLOG)', 'National Stock Number Data', 'Authorized Stockage List', 'Requisition History'],
        status: 'planned',
      },
    ],
  },
  {
    section: 'S6',
    title: 'S6 — Communications',
    icon: 'fa-broadcast-tower',
    systems: [
      {
        key: 'army365',
        label: 'Army 365',
        fullName: 'Army 365 (Microsoft 365 for Army)',
        description: 'NIPR collaboration platform: Outlook email, Teams, SharePoint. Source for calendar integration in leader tracker.',
        dataFields: ['Calendar Events', 'Email / Contact Directory', 'Teams Channels', 'SharePoint Sites'],
        status: 'planned',
      },
      {
        key: 'atcts',
        label: 'ATCTS',
        fullName: 'Army Training Certification Tracking System',
        description: 'Tracks mandatory DoD 8570 / 8140 IA training and certification compliance for Army IT users.',
        dataFields: ['IA Training Completion', 'Certification Level (IAT/IAM)', 'Computer-Based Training Records'],
        status: 'planned',
      },
    ],
  },
  {
    section: 'S7',
    title: 'S7 — Training Management',
    icon: 'fa-chalkboard-teacher',
    systems: [
      {
        key: 'trax',
        label: 'TraX',
        fullName: 'Army Training Management System (TraX)',
        description: 'Army learning management system for tracking distributed learning, resident course waivers, and unit-level training event records.',
        dataFields: ['Distributed Learning Completions', 'Resident Course Equivalencies', 'Training Event Records', 'MOS Qualification Training Status'],
        status: 'planned',
      },
    ],
  },
  {
    section: 'MED',
    title: 'Medical — MEDCOM',
    icon: 'fa-heartbeat',
    systems: [
      {
        key: 'medpros',
        label: 'MEDPROS',
        fullName: 'Medical Protection System',
        description: 'Army medical readiness tracking: immunizations, PHA status, dental class, PULHES profile, and deployability.',
        dataFields: ['Medical Readiness Class (MRC)', 'PHA Completion Date', 'Immunization Record', 'Dental Classification', 'PULHES Profile', 'Deployability Status', 'Profile / MEB Status'],
        status: 'pending',
      },
      {
        key: 'mhs_genesis',
        label: 'MHS GENESIS',
        fullName: 'Military Health System GENESIS (EHR)',
        description: 'DoD electronic health record replacing AHLTA. Source for medical history, prescriptions, and clinical encounter data.',
        dataFields: ['Medical History', 'Prescriptions', 'Lab Results', 'Clinical Encounters', 'Referrals'],
        status: 'planned',
      },
    ],
  },
  {
    section: 'FIN',
    title: 'Finance — DFAS',
    icon: 'fa-dollar-sign',
    systems: [
      {
        key: 'mypay',
        label: 'myPay',
        fullName: 'myPay (DFAS Self-Service Pay Portal)',
        description: 'DFAS portal for LES retrieval, allotment management, TSP contributions, and W-2 tax documents.',
        dataFields: ['Leave and Earnings Statement (LES)', 'Pay Allotments', 'TSP Contribution Rate', 'Direct Deposit Info', 'W-2 / Tax Withholding'],
        status: 'planned',
      },
    ],
  },
  {
    section: 'INT',
    title: 'THREADS — Internal',
    icon: 'fa-layer-group',
    systems: [
      {
        key: 'threads',
        label: 'THREADS Profile',
        fullName: 'THREADS Internal Data & Profiles',
        description: 'THREADS-native data: user profiles, contact details, duty titles, battle rhythm events, and leader tracker aggregation.',
        dataFields: ['User Profile (phone, email, title)', 'Battle Rhythm Events', 'Leader Tracker (aggregated)', 'Portfolio Data', 'Notification Preferences'],
        status: 'connected',
      },
    ],
  },
]

const STATUS_CONFIG = {
  connected: { label: 'Connected', color: '#2ecc71', icon: 'fa-check-circle' },
  pending:   { label: 'Pending',   color: '#f39c12', icon: 'fa-clock'        },
  planned:   { label: 'Planned',   color: '#5d6d7e', icon: 'fa-circle'       },
}

interface Props {
  onClose: () => void
}

export default function IntegrationMap({ onClose }: Props) {
  const connectedCount = SOR_GROUPS.flatMap(g => g.systems).filter(s => s.status === 'connected').length
  const pendingCount   = SOR_GROUPS.flatMap(g => g.systems).filter(s => s.status === 'pending').length
  const plannedCount   = SOR_GROUPS.flatMap(g => g.systems).filter(s => s.status === 'planned').length
  const total          = connectedCount + pendingCount + plannedCount

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <i className="fas fa-project-diagram" />
            <div>
              <div className={styles.title}>Integration Map</div>
              <div className={styles.subtitle}>Army Systems of Record — 5th Special Forces Group (Airborne)</div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.statPill} style={{ borderColor: STATUS_CONFIG.connected.color, color: STATUS_CONFIG.connected.color }}>
              <i className={`fas ${STATUS_CONFIG.connected.icon}`} /> {connectedCount} Connected
            </div>
            <div className={styles.statPill} style={{ borderColor: STATUS_CONFIG.pending.color, color: STATUS_CONFIG.pending.color }}>
              <i className={`fas ${STATUS_CONFIG.pending.icon}`} /> {pendingCount} Pending
            </div>
            <div className={styles.statPill} style={{ borderColor: STATUS_CONFIG.planned.color, color: STATUS_CONFIG.planned.color }}>
              <i className={`fas ${STATUS_CONFIG.planned.icon}`} /> {plannedCount} Planned
            </div>
            <div className={styles.statPill} style={{ borderColor: '#888', color: '#888' }}>
              {total} Total SOR
            </div>
            <button className={styles.closeBtn} onClick={onClose}><i className="fas fa-times" /></button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {SOR_GROUPS.map(group => (
            <div key={group.section} className={styles.group}>
              <div className={styles.groupHeader}>
                <i className={`fas ${group.icon}`} />
                <span>{group.title}</span>
                <span className={styles.groupCount}>{group.systems.length} system{group.systems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className={styles.systemGrid}>
                {group.systems.map(sys => {
                  const cfg = STATUS_CONFIG[sys.status]
                  return (
                    <div key={sys.key} className={styles.systemCard}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardLabel}>{sys.label}</div>
                        <div className={styles.statusBadge} style={{ color: cfg.color, borderColor: cfg.color }}>
                          <i className={`fas ${cfg.icon}`} /> {cfg.label}
                        </div>
                      </div>
                      <div className={styles.cardFullName}>{sys.fullName}</div>
                      <div className={styles.cardDesc}>{sys.description}</div>
                      <div className={styles.cardFields}>
                        {sys.dataFields.map(f => (
                          <span key={f} className={styles.fieldTag}>{f}</span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <i className="fas fa-info-circle" />
          <span>
            <strong>Connected</strong> — live data flowing into THREADS &nbsp;|&nbsp;
            <strong>Pending</strong> — integration built, awaiting API credentials &nbsp;|&nbsp;
            <strong>Planned</strong> — integration scoped for future development
          </span>
        </div>
      </div>
    </div>
  )
}
