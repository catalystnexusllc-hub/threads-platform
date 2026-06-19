import { useState } from 'react'
import shared from '../shared.module.css'
import styles from '../S1/S1Page.module.css'
import { STATUS_COLOR } from '../util'
import {
  S2_SECTION_SOLDIERS, CLEARANCE_ROSTER, FOREIGN_TRAVEL, SECURITY_TRAINING,
  ACCESS_LOG, CLASSIFIED_DOCS, CI_REPORTS, INSIDER_THREAT_LOG, COMSEC_ITEMS,
  S2_TASKS, S2_BATTLE_RHYTHM, S2_CONTACTS,
} from './s2SeedData'

// ── Inline report definitions ─────────────────────────────────────────────────
const S2_REPORTS = [
  { id:'sr-01', title:'Monthly Security Manager Report',       desc:'Monthly summary to CDR: clearance status, training compliance, foreign travel, CI indicators.',  freq:'Monthly',     owner:'CPT Morrison'  },
  { id:'sr-02', title:'PRR Status Report',                     desc:'Current status of all periodic reinvestigations — submitted, pending adj., action required.',      freq:'Monthly',     owner:'CW3 Nakashima' },
  { id:'sr-03', title:'Foreign Travel Briefing Log',           desc:'Log of all pre/post-travel briefs conducted in the reporting period.',                             freq:'Weekly',      owner:'CPT Morrison'  },
  { id:'sr-04', title:'Security Training Compliance Report',   desc:'Unit-wide training compliance: annual security, derivative classification, insider threat, OPSEC.', freq:'Monthly',    owner:'SSG Torres'    },
  { id:'sr-05', title:'CI Awareness / Suspicious Contact Log', desc:'All CI referrals and suspicious contact reports submitted to INSCOM.',                             freq:'As Required', owner:'CW3 Nakashima' },
  { id:'sr-06', title:'COMSEC Account Inventory Report',       desc:'Monthly COMSEC inventory reconciliation per CMS 1-CF-011.',                                        freq:'Monthly',     owner:'CW3 Nakashima' },
  { id:'sr-07', title:'Physical Security Inspection Report',   desc:'Quarterly SCIF/vault inspection results and discrepancy remediation.',                             freq:'Quarterly',   owner:'CPT Morrison'  },
]

// ── Inline request definitions ────────────────────────────────────────────────
const S2_REQUESTS = [
  { id:'S2R-001', soldier:'CPT Walsh, T.',    type:'Security Clearance Upgrade (TS)', submitted:'01 Apr 2026', priority:'High',    status:'Pending Adj.',  notes:'eApp complete; awaiting CAF determination'       },
  { id:'S2R-002', soldier:'SPC Patel, R.',    type:'TS/SCI Access (Upgrade from S)',  submitted:'15 Apr 2026', priority:'High',    status:'Pending Adj.',  notes:'Interim SECRET; upgrade in CAF queue'            },
  { id:'S2R-003', soldier:'SSG Rivera, M.',   type:'COMSEC Access Request',           submitted:'10 Jun 2026', priority:'Routine', status:'Approved',      notes:'Access granted; SF-700 filed'                    },
  { id:'S2R-004', soldier:'SGT Okonkwo, C.',  type:'Foreign Travel Approval — Japan', submitted:'17 Jun 2026', priority:'High',    status:'Pending Brief', notes:'Brief not yet scheduled — due NLT 10 Jul 2026'   },
  { id:'S2R-005', soldier:'PFC Nguyen, L.',   type:'Annual Security Training Waiver', submitted:'15 Jun 2026', priority:'Routine', status:'Returned',      notes:'No waiver authority at unit level — complete training' },
]

// ── Annual plans calendar ─────────────────────────────────────────────────────
const S2_ANNUAL_CALENDAR = [
  { month:'Jul 2026', event:'Annual security training deadline (FY end)',  type:'Training',   owner:'SSG Torres',    notes:'All soldiers current by 30 Sep'         },
  { month:'Aug 2026', event:'PRR batch submission — overdue packets',      type:'Clearances', owner:'CW3 Nakashima', notes:'LTC Hughes, CPT Morrison, CW3 Nakashima' },
  { month:'Sep 2026', event:'COMSEC annual account audit (G6)',            type:'COMSEC',     owner:'CW3 Nakashima', notes:'CMS 1-CF-011 compliance check'           },
  { month:'Oct 2026', event:'SCIF quarterly inspection (Q4)',              type:'Phys Sec',   owner:'CPT Morrison',  notes:'AR 380-5; remediation 30-day window'     },
  { month:'Nov 2026', event:'Monthly security manager report',             type:'Reporting',  owner:'CPT Morrison',  notes:'CDR brief NLT 15 Nov'                    },
  { month:'Dec 2026', event:'FY close — clear all FT debriefs',           type:'FT Program', owner:'CPT Morrison',  notes:'All debrief paperwork filed'              },
]

// ── Overview nav cards ────────────────────────────────────────────────────────
const OVERVIEW_NAV = [
  { key:'clearances',        label:'Clearances',        icon:'fa-id-badge'      },
  { key:'foreign-travel',    label:'Foreign Travel',    icon:'fa-plane'         },
  { key:'security-training', label:'Sec Training',      icon:'fa-chalkboard-teacher' },
  { key:'physical-security', label:'Physical Security', icon:'fa-lock'          },
  { key:'ci-awareness',      label:'CI Awareness',      icon:'fa-user-secret'   },
  { key:'comsec',            label:'COMSEC',            icon:'fa-key'           },
]

// ── Admin tab quick-nav definitions ───────────────────────────────────────────
const ADM_TAB_ACTIONS: Record<string, Array<{ key:string; icon:string; label:string }>> = {
  'adm-people':      [{ key:'roster',       icon:'fa-list',              label:'Roster'        }, { key:'clearances',  icon:'fa-id-badge',      label:'Clearances'   }, { key:'in-proc',    icon:'fa-sign-in-alt',    label:'In-Proc'    }, { key:'out-proc',   icon:'fa-sign-out-alt',  label:'Out-Proc'   }],
  'adm-tasks':       [{ key:'open',         icon:'fa-exclamation-circle',label:'Open'          }, { key:'in-progress', icon:'fa-spinner',        label:'In Progress'  }, { key:'completed',  icon:'fa-check-double',   label:'Completed'  }],
  'adm-security':    [{ key:'unit-clear',   icon:'fa-id-badge',          label:'Unit Clear.'   }, { key:'foreign-trvl',icon:'fa-plane',          label:'Foreign Trvl' }, { key:'ci-log',     icon:'fa-user-secret',    label:'CI Log'     }],
  'adm-operations':  [{ key:'battle-rhythm',icon:'fa-drum',              label:'Battle Rhythm' }, { key:'suspenses',   icon:'fa-bell',           label:'Suspenses'    }, { key:'calendar',   icon:'fa-calendar-alt',   label:'Calendar'   }],
  'adm-sustainment': [{ key:'comsec-equip', icon:'fa-key',               label:'COMSEC Equip.' }, { key:'systems',     icon:'fa-server',         label:'Systems'      }, { key:'maint',      icon:'fa-tools',          label:'Maintenance'}],
  'adm-plans':       [{ key:'annual-cal',   icon:'fa-calendar-alt',      label:'Annual Cal.'   }, { key:'long-range',  icon:'fa-binoculars',     label:'Long Range'   }, { key:'policy-rev', icon:'fa-file-alt',       label:'Policy Rev.' }],
  'adm-comms':       [{ key:'contacts',     icon:'fa-address-book',      label:'Contacts'      }, { key:'message-log', icon:'fa-envelope',       label:'Message Log'  }, { key:'dist',       icon:'fa-share-alt',      label:'Distribution'}],
  'adm-training':    [{ key:'requirements', icon:'fa-chalkboard-teacher',label:'Requirements'  }, { key:'sere',        icon:'fa-mountain',       label:'SERE'         }, { key:'metl',       icon:'fa-crosshairs',     label:'METL'       }],
  'adm-resources':   [{ key:'references',   icon:'fa-book',              label:'References'    }, { key:'forms',       icon:'fa-file-alt',       label:'Forms'        }, { key:'budget',     icon:'fa-dollar-sign',    label:'Budget'     }],
  'adm-coord':       [{ key:'coord-tracker',icon:'fa-project-diagram',   label:'Coord Tracker' }, { key:'bde-sync',    icon:'fa-sync',           label:'BDE S2 Sync'  }, { key:'higher-hq',  icon:'fa-sitemap',        label:'Higher HQ'  }],
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(s: string): string {
  if (s === 'Due' || s === 'Overdue' || s.includes('Overdue')) return STATUS_COLOR.Red
  if (s === 'Expiring' || s === 'Upcoming' || s === 'Pending Brief') return STATUS_COLOR.Amber
  if (s === 'Current' || s === 'Active' || s === 'Complete' || s === 'Approved' || s === 'Filed') return STATUS_COLOR.Green
  return '#888'
}

function pill(label: string) {
  return <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background: `${statusColor(label)}22`, color: statusColor(label), fontWeight:700 }}>{label}</span>
}

function Empty() {
  return <p style={{ color:'#555', padding:24, textAlign:'center' }}>No records.</p>
}

function intTabBar(
  tabs: Array<{ key:string; label:string }>,
  active: string,
  setActive: (k:string) => void,
) {
  return (
    <div className={shared.tabs} style={{ marginBottom:16 }}>
      {tabs.map(t => (
        <button
          key={t.key}
          className={`${shared.tab} ${active === t.key ? shared.tabActive : ''}`}
          onClick={() => setActive(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Derived stats ─────────────────────────────────────────────────────────────
const prrsOverdue       = CLEARANCE_ROSTER.filter(r => r.prrStatus.includes('Overdue')).length
const ftActive          = FOREIGN_TRAVEL.filter(r => r.status === 'Traveling' || r.status === 'Upcoming').length
const trainingDue       = SECURITY_TRAINING.filter(r => r.annualSec === 'Due' || r.derivClass === 'Due' || r.insiderThreat === 'Due' || r.opsec === 'Due').length
const openTasks         = S2_TASKS.filter(r => r.status === 'Open' || r.status === 'In Progress').length

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function S2Page({
  subPage = 'overview',
  onNavigate,
}: {
  subPage?: string
  onNavigate?: (page: string) => void
}) {
  const [internalTab, setInternalTab] = useState('summary')
  const [adminSubTab, setAdminSubTab] = useState('summary')

  const [prevPage, setPrevPage] = useState(subPage)
  if (prevPage !== subPage) {
    setPrevPage(subPage)
    setInternalTab('summary')
    setAdminSubTab('summary')
  }

  // ── Admin quick-nav bar ──────────────────────────────────────────────────
  const isAdmPage = subPage.startsWith('adm-')
  const currentTabActions = ADM_TAB_ACTIONS[subPage] ?? []
  const adminQuickNav = isAdmPage ? (
    <div className={styles.adminNav}>
      <button
        className={`${styles.tabActionBtn} ${adminSubTab === 'summary' ? styles.tabActionActive : ''}`}
        onClick={() => setAdminSubTab('summary')}
      >
        <i className="fas fa-tachometer-alt" /> Summary
      </button>
      {currentTabActions.map(btn => (
        <button
          key={btn.key}
          className={`${styles.tabActionBtn} ${adminSubTab === btn.key ? styles.tabActionActive : ''}`}
          onClick={() => setAdminSubTab(btn.key)}
        >
          <i className={`fas ${btn.icon}`} /> {btn.label}
        </button>
      ))}
    </div>
  ) : null

  // ── Page header ──────────────────────────────────────────────────────────
  const pageHeader = (
    <div className={shared.header}>
      <h2><i className="fas fa-shield-alt" /> S2 Section — Unit Security Manager</h2>
      <span className={shared.sub}>Personnel security · foreign travel · COMSEC · physical security · CI awareness</span>
    </div>
  )

  // ── Stat row helper ──────────────────────────────────────────────────────
  function statRow(stats: Array<{ label:string; value:string|number; bg:string }>) {
    return (
      <div className={shared.stats}>
        {stats.map(s => (
          <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
            <div className={shared.statValue}>{s.value}</div>
            <div className={shared.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // OVERVIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (subPage === 'overview') {
    return (
      <div className={shared.page}>
        {pageHeader}

        <div className={shared.navCards} style={{ marginBottom:20 }}>
          {OVERVIEW_NAV.map(n => (
            <button key={n.key} className={shared.navCard} onClick={() => onNavigate?.(`j2-${n.key}`)}>
              <i className={`fas ${n.icon}`} />
              {n.label}
            </button>
          ))}
        </div>

        {statRow([
          { label:'PRRs Overdue',          value: prrsOverdue, bg: STATUS_COLOR.Red   },
          { label:'Foreign Travel Active', value: ftActive,    bg: '#2d2d2d'          },
          { label:'Training Due',          value: trainingDue, bg: STATUS_COLOR.Amber },
          { label:'Open Tasks',            value: openTasks,   bg: '#2d2d2d'          },
        ])}

        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-info-circle" /> S2 Section Charter</div>
          <div className={shared.cardBody}>
            <p style={{ fontSize:13, color:'#888', lineHeight:1.65, margin:0 }}>
              The S2 serves as the Unit Security Manager, responsible for all aspects of personnel,
              physical, and information security within the command. The S2 administers the security
              clearance program, manages the foreign travel program, ensures security training compliance,
              controls access to classified areas, and maintains the command's COMSEC account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  if (subPage === 'dashboard') {
    const DASH_TABS = [
      { key:'summary',          label:'Summary'          },
      { key:'clearance-status', label:'Clearance Status' },
      { key:'training-status',  label:'Training Status'  },
      { key:'tasks',            label:'Tasks'            },
    ]
    const highTasks = S2_TASKS.filter(t => t.priority === 'Critical' || t.priority === 'High')
    return (
      <div className={shared.page}>
        {pageHeader}
        {statRow([
          { label:'PRRs Overdue',          value: prrsOverdue, bg: STATUS_COLOR.Red   },
          { label:'Foreign Travel Active', value: ftActive,    bg: '#2d2d2d'          },
          { label:'Training Items Due',    value: trainingDue, bg: STATUS_COLOR.Amber },
          { label:'Open Tasks',            value: openTasks,   bg: '#2d2d2d'          },
        ])}
        {intTabBar(DASH_TABS, internalTab, setInternalTab)}

        {internalTab === 'summary' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-exclamation-triangle" /> Priority Tasks</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>ID</th><th>Task</th><th>Category</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {highTasks.map(t => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.task}</td>
                      <td>{t.category}</td>
                      <td>{t.assignedTo}</td>
                      <td>{pill(t.priority)}</td>
                      <td>{t.dueDate}</td>
                      <td>{pill(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'clearance-status' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Clearance Roster</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>Soldier</th><th>Rank</th><th>Clearance</th><th>PRR Due</th><th>PRR Status</th><th>Eligibility</th><th>Notes</th>
                </tr></thead>
                <tbody>
                  {CLEARANCE_ROSTER.map(r => (
                    <tr key={r.edipi} style={r.prrStatus.includes('Overdue') ? { background:'rgba(231,76,60,0.07)' } : {}}>
                      <td>{r.lastName}, {r.firstName}</td>
                      <td>{r.rank}</td>
                      <td>{r.clearance}</td>
                      <td>{r.prrDue}</td>
                      <td>{pill(r.prrStatus)}</td>
                      <td>{r.elig}</td>
                      <td style={{ color:'#777', fontSize:11 }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'training-status' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Security Training Status</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>Soldier</th><th>Rank</th><th>Annual Sec</th><th>Deriv Class</th><th>Insider Threat</th><th>OPSEC</th><th>SERE</th>
                </tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td>
                      <td>{r.rank}</td>
                      <td style={{ color: r.annualSec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.annualSec}</td>
                      <td style={{ color: r.derivClass === 'Due' ? STATUS_COLOR.Amber : r.derivClass === 'N/A' ? '#888' : STATUS_COLOR.Green }}>{r.derivClass}</td>
                      <td style={{ color: r.insiderThreat === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.insiderThreat}</td>
                      <td style={{ color: r.opsec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.opsec}</td>
                      <td>{r.sere}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'tasks' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-tasks" /> All Tasks</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>ID</th><th>Task</th><th>Category</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {S2_TASKS.map(t => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.task}</td>
                      <td>{t.category}</td>
                      <td>{t.assignedTo}</td>
                      <td>{pill(t.priority)}</td>
                      <td>{t.dueDate}</td>
                      <td>{pill(t.status)}</td>
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

  // ══════════════════════════════════════════════════════════════════════════
  // REPORTS
  // ══════════════════════════════════════════════════════════════════════════
  if (subPage === 'reports') {
    const REPORT_TABS = [
      { key:'all',       label:'All'              },
      { key:'security',  label:'Security Reports' },
      { key:'prr',       label:'PRR Reports'      },
      { key:'training',  label:'Training Reports' },
    ]
    const visibleReports = internalTab === 'all' ? S2_REPORTS
      : internalTab === 'security' ? S2_REPORTS.filter(r => ['sr-01','sr-05','sr-07'].includes(r.id))
      : internalTab === 'prr'      ? S2_REPORTS.filter(r => ['sr-01','sr-02'].includes(r.id))
      : S2_REPORTS.filter(r => ['sr-04'].includes(r.id))

    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar(REPORT_TABS, internalTab, setInternalTab)}
        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Security Reports</div>
          {visibleReports.length === 0 ? <Empty /> : visibleReports.map(r => (
            <div key={r.id} className={styles.reportRow}>
              <div className={styles.reportInfo}>
                <div className={styles.reportTitle}>{r.title}</div>
                <div className={styles.reportDesc}>{r.desc}</div>
              </div>
              <div className={styles.reportActions}>
                <span style={{ fontSize:10, color:'#555' }}>{r.freq}</span>
                <span style={{ fontSize:10, color:'#888', marginLeft:8 }}>{r.owner}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRACKERS
  // ══════════════════════════════════════════════════════════════════════════
  if (subPage === 'trackers') {
    const TRACKER_TABS = [
      { key:'all',            label:'All'            },
      { key:'clearances',     label:'Clearances'     },
      { key:'foreign-travel', label:'Foreign Travel' },
      { key:'training',       label:'Training'       },
      { key:'comsec',         label:'COMSEC'         },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar(TRACKER_TABS, internalTab, setInternalTab)}

        {(internalTab === 'all' || internalTab === 'clearances') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Clearance Roster</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>Soldier</th><th>Rank</th><th>Clearance</th><th>PRR Due</th><th>PRR Status</th><th>Elig</th><th>Notes</th>
                </tr></thead>
                <tbody>
                  {CLEARANCE_ROSTER.map(r => (
                    <tr key={r.edipi} style={r.prrStatus.includes('Overdue') ? { background:'rgba(231,76,60,0.07)' } : {}}>
                      <td>{r.lastName}, {r.firstName}</td>
                      <td>{r.rank}</td>
                      <td>{r.clearance}</td>
                      <td>{r.prrDue}</td>
                      <td>{pill(r.prrStatus)}</td>
                      <td>{r.elig}</td>
                      <td style={{ color:'#777', fontSize:11 }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(internalTab === 'all' || internalTab === 'foreign-travel') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-plane" /> Foreign Travel Log</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>ID</th><th>Soldier</th><th>Destination</th><th>Depart</th><th>Return</th><th>Brief</th><th>Debrief</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {FOREIGN_TRAVEL.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td>{r.soldier}</td><td>{r.destination}</td>
                      <td>{r.departDate}</td><td>{r.returnDate}</td>
                      <td style={{ color: r.briefDate === '—' ? STATUS_COLOR.Amber : '#aaa' }}>{r.briefDate}</td>
                      <td style={{ color: r.debriefDate === '—' ? '#777' : STATUS_COLOR.Green }}>{r.debriefDate}</td>
                      <td>{pill(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(internalTab === 'all' || internalTab === 'training') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Security Training</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>Soldier</th><th>Rank</th><th>Annual Sec</th><th>Deriv Class</th><th>Insider Threat</th><th>OPSEC</th><th>SERE</th>
                </tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ color: r.annualSec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.annualSec}</td>
                      <td style={{ color: r.derivClass === 'Due' ? STATUS_COLOR.Amber : r.derivClass === 'N/A' ? '#888' : STATUS_COLOR.Green }}>{r.derivClass}</td>
                      <td style={{ color: r.insiderThreat === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.insiderThreat}</td>
                      <td style={{ color: r.opsec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.opsec}</td>
                      <td>{r.sere}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(internalTab === 'all' || internalTab === 'comsec') && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-key" /> COMSEC Account</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>SKU</th><th>Item</th><th>Classification</th><th>Custodian</th><th>Issued</th><th>Expires</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {COMSEC_ITEMS.map(r => (
                    <tr key={r.sku} style={r.status === 'Expiring' ? { background:'rgba(243,156,18,0.07)' } : {}}>
                      <td>{r.sku}</td><td>{r.item}</td><td>{r.classification}</td>
                      <td>{r.custodian}</td><td>{r.issued}</td><td>{r.expires}</td>
                      <td>{pill(r.status)}</td>
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

  // ══════════════════════════════════════════════════════════════════════════
  // REQUESTS
  // ══════════════════════════════════════════════════════════════════════════
  if (subPage === 'requests') {
    const REQ_TABS = [
      { key:'all',      label:'All'      },
      { key:'pending',  label:'Pending'  },
      { key:'approved', label:'Approved' },
      { key:'returned', label:'Returned' },
    ]
    const filtered = internalTab === 'all'      ? S2_REQUESTS
      : internalTab === 'pending'  ? S2_REQUESTS.filter(r => r.status.startsWith('Pending') || r.status === 'Pending Adj.' || r.status === 'Pending Brief')
      : internalTab === 'approved' ? S2_REQUESTS.filter(r => r.status === 'Approved')
      : S2_REQUESTS.filter(r => r.status === 'Returned')
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar(REQ_TABS, internalTab, setInternalTab)}
        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-inbox" /> Security Requests</div>
          {filtered.length === 0 ? <Empty /> : (
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>ID</th><th>Soldier</th><th>Type</th><th>Submitted</th><th>Priority</th><th>Status</th><th>Notes</th>
                </tr></thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td>{r.soldier}</td><td>{r.type}</td>
                      <td>{r.submitted}</td>
                      <td>{pill(r.priority)}</td>
                      <td>{pill(r.status)}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RESOURCES
  // ══════════════════════════════════════════════════════════════════════════
  if (subPage === 'resources') {
    const RES_TABS = [
      { key:'references', label:'References' },
      { key:'contacts',   label:'Contacts'   },
      { key:'forms',      label:'Forms'      },
      { key:'policy',     label:'Policy'     },
    ]
    const REFERENCES = [
      { title:'AR 380-5',         desc:'Department of the Army Information Security Program — classified document control, storage, marking, destruction.',  link:'https://armypubs.army.mil' },
      { title:'DODI 5200.02',     desc:'DoD Personnel Security Program — procedures for granting and revoking security clearances.',                          link:'https://www.esd.whs.mil' },
      { title:'DODI 5240.06',     desc:'Reporting Requirements for DoD Components — CI awareness, suspicious activity, and foreign contact reporting.',       link:'https://www.esd.whs.mil' },
      { title:'SF-86 / eApp Guide',desc:'Instructions for completing the Standard Form 86 (Questionnaire for National Security Positions) via NBIS eApp.', link:'https://nbis.opm.gov' },
      { title:'Foreign Travel Guide',desc:'Unit foreign travel program procedures: country clearance requests, pre-travel briefs, and debriefs.',             link:'#' },
    ]
    const FORMS_LIST = [
      { form:'SF-86',         title:'Questionnaire for National Security Positions',   use:'New investigation or periodic reinvestigation (PRR)' },
      { form:'SF-700',        title:'Security Container Information',                  use:'Combination record for safes and vaults' },
      { form:'SF-701',        title:'Activity Security Checklist',                     use:'End-of-day security inspection checklist' },
      { form:'SF-702',        title:'Security Container Check Sheet',                  use:'Daily open/close log for security containers' },
      { form:'FT Brief Form', title:'Foreign Travel Pre-/Post-Brief Record',           use:'Document pre-travel brief and debrief details' },
      { form:'CI Referral',   title:'CI Referral Form (DASA CI format)',               use:'Refer suspicious contacts to INSCOM CI element' },
      { form:'SCR',           title:'Suspicious Contact Report',                       use:'Document and report suspicious activity per AR 381-12' },
    ]
    const POLICY = [
      { ref:'AR 380-5',    title:'Information Security Program',         scope:'Document classification, storage, control, destruction'       },
      { ref:'DODI 5200.02',title:'Personnel Security Program',           scope:'Clearance adjudication, PRR requirements, eligibility'        },
      { ref:'DODI 5240.06',title:'CI Awareness Reporting',              scope:'Suspicious contacts, foreign travel, insider threat indicators' },
      { ref:'AR 380-40',   title:'Safeguarding and Controlling COMSEC', scope:'Key material handling, SF-700/701/702, custodian duties'       },
      { ref:'AR 530-1',    title:'Operations Security (OPSEC)',          scope:'OPSEC program, training requirements, critical info lists'     },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {intTabBar(RES_TABS, internalTab, setInternalTab)}

        {internalTab === 'references' && (
          <div className={shared.cards}>
            {REFERENCES.map(r => (
              <div key={r.title} className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-book-open" /> {r.title}</div>
                <div className={shared.cardBody}>
                  <p style={{ fontSize:12, color:'#888', lineHeight:1.6, margin:0 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {internalTab === 'contacts' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-address-book" /> Key Security Contacts</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr>
                  <th>Organization</th><th>POC</th><th>Role</th><th>Phone</th><th>Email</th><th>Notes</th>
                </tr></thead>
                <tbody>
                  {S2_CONTACTS.map(r => (
                    <tr key={r.org}>
                      <td>{r.org}</td><td>{r.poc}</td><td>{r.role}</td>
                      <td>{r.phone}</td><td style={{ fontSize:11 }}>{r.email}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'forms' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Common Security Forms</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Form</th><th>Title</th><th>Use</th></tr></thead>
                <tbody>
                  {FORMS_LIST.map(f => (
                    <tr key={f.form}>
                      <td style={{ fontWeight:700 }}>{f.form}</td>
                      <td>{f.title}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{f.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'policy' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-gavel" /> Key Policy References</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Reference</th><th>Title</th><th>Scope</th></tr></thead>
                <tbody>
                  {POLICY.map(p => (
                    <tr key={p.ref}>
                      <td style={{ fontWeight:700, whiteSpace:'nowrap' }}>{p.ref}</td>
                      <td>{p.title}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{p.scope}</td>
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

  // ══════════════════════════════════════════════════════════════════════════
  // INTERNAL FUNCTION PAGES
  // ══════════════════════════════════════════════════════════════════════════

  // ── CLEARANCES ────────────────────────────────────────────────────────────
  if (subPage === 'clearances') {
    const CLR_TABS = [
      { key:'summary',   label:'Summary'         },
      { key:'full',      label:'Full Roster'     },
      { key:'prr',       label:'PRR Tracker'     },
      { key:'interim',   label:'Interim'         },
      { key:'upgrades',  label:'Upgrade Requests'},
    ]
    const overdueRows     = CLEARANCE_ROSTER.filter(r => r.prrStatus.includes('Overdue'))
    const interimRows     = CLEARANCE_ROSTER.filter(r => r.elig === 'Interim')
    const upgradeRequests = S2_REQUESTS.filter(r => r.type.toLowerCase().includes('upgrade'))
    const tsSci           = CLEARANCE_ROSTER.filter(r => r.clearance === 'TS/SCI').length
    const interimCount    = CLEARANCE_ROSTER.filter(r => r.elig === 'Interim').length

    return (
      <div className={shared.page}>
        {pageHeader}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>Personnel Security — Clearance Management</h3>
        {statRow([
          { label:'Total Clearances',    value: CLEARANCE_ROSTER.length, bg:'#2d2d2d'         },
          { label:'TS/SCI',              value: tsSci,                    bg:'#2d2d2d'         },
          { label:'PRRs Overdue',        value: prrsOverdue,              bg: STATUS_COLOR.Red },
          { label:'Interims / Pending',  value: interimCount,             bg: STATUS_COLOR.Amber },
        ])}
        {intTabBar(CLR_TABS, internalTab, setInternalTab)}

        {internalTab === 'summary' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-exclamation-circle" /> Overdue PRRs</div>
            {overdueRows.length === 0 ? <Empty /> : (
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>Clearance</th><th>PRR Due</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>
                    {overdueRows.map(r => (
                      <tr key={r.edipi} style={{ background:'rgba(231,76,60,0.07)' }}>
                        <td>{r.lastName}, {r.firstName}</td><td>{r.rank}</td><td>{r.clearance}</td>
                        <td style={{ color: STATUS_COLOR.Red }}>{r.prrDue}</td>
                        <td>{pill(r.prrStatus)}</td>
                        <td style={{ fontSize:11, color:'#777' }}>{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {(internalTab === 'full' || internalTab === 'prr') && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-list" /> {internalTab === 'prr' ? 'PRR Tracker' : 'Full Clearance Roster'}</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Clearance</th><th>PRR Due</th><th>PRR Status</th><th>Elig</th><th>Notes</th></tr></thead>
                <tbody>
                  {CLEARANCE_ROSTER.map(r => (
                    <tr key={r.edipi} style={r.prrStatus.includes('Overdue') ? { background:'rgba(231,76,60,0.07)' } : {}}>
                      <td>{r.lastName}, {r.firstName}</td><td>{r.rank}</td><td>{r.clearance}</td>
                      <td style={{ color: r.prrStatus.includes('Overdue') ? STATUS_COLOR.Red : '#aaa' }}>{r.prrDue}</td>
                      <td>{pill(r.prrStatus)}</td><td>{r.elig}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'interim' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-hourglass-half" /> Interim Clearances</div>
            {interimRows.length === 0 ? <Empty /> : (
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>Clearance</th><th>PRR Due</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>
                    {interimRows.map(r => (
                      <tr key={r.edipi}>
                        <td>{r.lastName}, {r.firstName}</td><td>{r.rank}</td><td>{r.clearance}</td>
                        <td>{r.prrDue}</td><td>{pill(r.prrStatus)}</td>
                        <td style={{ fontSize:11, color:'#777' }}>{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {internalTab === 'upgrades' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-arrow-circle-up" /> Upgrade Requests</div>
            {upgradeRequests.length === 0 ? <Empty /> : (
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>ID</th><th>Soldier</th><th>Type</th><th>Submitted</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>
                    {upgradeRequests.map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td><td>{r.soldier}</td><td>{r.type}</td>
                        <td>{r.submitted}</td><td>{pill(r.status)}</td>
                        <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── FOREIGN TRAVEL ────────────────────────────────────────────────────────
  if (subPage === 'foreign-travel') {
    const FT_TABS = [
      { key:'summary',    label:'Summary'    },
      { key:'active',     label:'Active Travel' },
      { key:'upcoming',   label:'Upcoming'   },
      { key:'brief-log',  label:'Brief Log'  },
      { key:'debrief',    label:'Debrief Log'},
    ]
    const traveling     = FOREIGN_TRAVEL.filter(r => r.status === 'Traveling')
    const upcoming      = FOREIGN_TRAVEL.filter(r => r.status === 'Upcoming')
    const briefsDue     = FOREIGN_TRAVEL.filter(r => r.status === 'Upcoming' && r.briefDate === '—').length
    const debriefsDue   = FOREIGN_TRAVEL.filter(r => r.status === 'Traveling' && r.debriefDate === '—').length
    const briefLog      = FOREIGN_TRAVEL.filter(r => r.briefDate !== '—')
    const debriefLog    = FOREIGN_TRAVEL.filter(r => r.status === 'Complete')

    const ftTable = (rows: typeof FOREIGN_TRAVEL) => (
      <div className={shared.tableWrap}>
        <table className={shared.table}>
          <thead><tr><th>ID</th><th>Soldier</th><th>Destination</th><th>Depart</th><th>Return</th><th>Brief</th><th>Debrief</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td><td>{r.soldier}</td><td>{r.destination}</td>
                <td>{r.departDate}</td><td>{r.returnDate}</td>
                <td style={{ color: r.briefDate === '—' ? STATUS_COLOR.Amber : '#aaa' }}>{r.briefDate}</td>
                <td style={{ color: r.debriefDate === '—' ? '#777' : STATUS_COLOR.Green }}>{r.debriefDate}</td>
                <td>{pill(r.status)}</td>
                <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

    return (
      <div className={shared.page}>
        {pageHeader}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>Foreign Travel Program</h3>
        {statRow([
          { label:'Currently Traveling',         value: traveling.length,   bg:'#2d2d2d'          },
          { label:'Upcoming (brief needed)',      value: upcoming.length,    bg:'#2d2d2d'          },
          { label:'Briefs Due',                  value: briefsDue,          bg: STATUS_COLOR.Amber },
          { label:'Debriefs Due',                value: debriefsDue,        bg: STATUS_COLOR.Amber },
        ])}
        {intTabBar(FT_TABS, internalTab, setInternalTab)}

        {internalTab === 'summary' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-globe" /> All Foreign Travel</div>
            {ftTable(FOREIGN_TRAVEL)}
          </div>
        )}
        {internalTab === 'active' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-plane-departure" /> Currently Traveling</div>
            {traveling.length === 0 ? <Empty /> : ftTable(traveling)}
          </div>
        )}
        {internalTab === 'upcoming' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Upcoming Travel</div>
            {upcoming.length === 0 ? <Empty /> : ftTable(upcoming)}
          </div>
        )}
        {internalTab === 'brief-log' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-check" /> Brief Log</div>
            {briefLog.length === 0 ? <Empty /> : ftTable(briefLog)}
          </div>
        )}
        {internalTab === 'debrief' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Debrief Log</div>
            {debriefLog.length === 0 ? <Empty /> : ftTable(debriefLog)}
          </div>
        )}
      </div>
    )
  }

  // ── SECURITY TRAINING ─────────────────────────────────────────────────────
  if (subPage === 'security-training') {
    const TRNG_TABS = [
      { key:'summary',      label:'Summary'       },
      { key:'annual',       label:'Annual Security'},
      { key:'deriv-class',  label:'Deriv Class'   },
      { key:'insider',      label:'Insider Threat' },
      { key:'opsec',        label:'OPSEC'          },
      { key:'sere',         label:'SERE'           },
    ]
    const annualDue      = SECURITY_TRAINING.filter(r => r.annualSec === 'Due').length
    const derivDue       = SECURITY_TRAINING.filter(r => r.derivClass === 'Due').length
    const insiderDue     = SECURITY_TRAINING.filter(r => r.insiderThreat === 'Due').length

    return (
      <div className={shared.page}>
        {pageHeader}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>Security Training Requirements</h3>
        {statRow([
          { label:'Total Soldiers',      value: SECURITY_TRAINING.length, bg:'#2d2d2d'          },
          { label:'Annual Sec Due',      value: annualDue,                bg: STATUS_COLOR.Amber },
          { label:'Deriv Class Due',     value: derivDue,                 bg: STATUS_COLOR.Amber },
          { label:'Insider Threat Due',  value: insiderDue,               bg: STATUS_COLOR.Amber },
        ])}
        {intTabBar(TRNG_TABS, internalTab, setInternalTab)}

        {internalTab === 'summary' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-graduation-cap" /> Full Training Matrix</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Annual Sec</th><th>Deriv Class</th><th>Insider Threat</th><th>OPSEC</th><th>SERE</th></tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ color: r.annualSec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.annualSec}</td>
                      <td style={{ color: r.derivClass === 'Due' ? STATUS_COLOR.Amber : r.derivClass === 'N/A' ? '#888' : STATUS_COLOR.Green }}>{r.derivClass}</td>
                      <td style={{ color: r.insiderThreat === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.insiderThreat}</td>
                      <td style={{ color: r.opsec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.opsec}</td>
                      <td>{r.sere}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'annual' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-shield-alt" /> Annual Security Training</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Status</th><th>Due</th></tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ color: r.annualSec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.annualSec}</td>
                      <td>{r.annualSecDue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'deriv-class' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-file-contract" /> Derivative Classification</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Status</th><th>Due</th></tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ color: r.derivClass === 'Due' ? STATUS_COLOR.Amber : r.derivClass === 'N/A' ? '#888' : STATUS_COLOR.Green }}>{r.derivClass}</td>
                      <td>{r.derivClassDue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'insider' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-user-secret" /> Insider Threat Training</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Status</th><th>Due</th></tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ color: r.insiderThreat === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.insiderThreat}</td>
                      <td>{r.insiderThreatDue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'opsec' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-eye-slash" /> OPSEC Training</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Status</th><th>Due</th></tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ color: r.opsec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.opsec}</td>
                      <td>{r.opsecDue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'sere' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-mountain" /> SERE Training</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>SERE Level</th><th>Completed</th></tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ fontWeight:700 }}>{r.sere}</td>
                      <td>{r.sereCompleted}</td>
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

  // ── PHYSICAL SECURITY ─────────────────────────────────────────────────────
  if (subPage === 'physical-security') {
    const PHYS_TABS = [
      { key:'summary',   label:'Summary'        },
      { key:'access',    label:'Access Log'     },
      { key:'class-docs',label:'Classified Docs'},
      { key:'key-ctrl',  label:'Key Control'    },
      { key:'inspect',   label:'Inspections'    },
    ]
    const denied30   = ACCESS_LOG.filter(r => !r.authorized).length
    const docsOut    = CLASSIFIED_DOCS.filter(r => r.status === 'Out').length
    const ciCount    = CI_REPORTS.length

    return (
      <div className={shared.page}>
        {pageHeader}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>Physical Security</h3>
        {statRow([
          { label:'Access Events (30d)',  value: ACCESS_LOG.length, bg:'#2d2d2d'         },
          { label:'Denied Attempts',      value: denied30,          bg: STATUS_COLOR.Red },
          { label:'Classified Docs Out',  value: docsOut,           bg: STATUS_COLOR.Amber },
          { label:'CI Incidents',         value: ciCount,           bg:'#2d2d2d'         },
        ])}
        {intTabBar(PHYS_TABS, internalTab, setInternalTab)}

        {(internalTab === 'summary' || internalTab === 'access') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-door-open" /> Access Control Log</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>ID</th><th>Date</th><th>Person</th><th>Area</th><th>Action</th><th>Authorized</th><th>Escort</th><th>Notes</th></tr></thead>
                <tbody>
                  {(internalTab === 'summary' ? ACCESS_LOG.slice(0,5) : ACCESS_LOG).map(r => (
                    <tr key={r.id} style={!r.authorized ? { background:'rgba(231,76,60,0.07)' } : {}}>
                      <td>{r.id}</td><td>{r.date}</td><td>{r.person}</td><td>{r.area}</td>
                      <td>{r.action}</td>
                      <td style={{ color: r.authorized ? STATUS_COLOR.Green : STATUS_COLOR.Red }}>
                        {r.authorized ? 'Yes' : 'No'}
                      </td>
                      <td>{r.escort}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(internalTab === 'summary' || internalTab === 'class-docs') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-file-lock" style={{ marginRight:8 }} />Classified Document Control</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>ID</th><th>Classification</th><th>Title</th><th>Custodian</th><th>Issued</th><th>Due</th><th>Returned</th><th>Status</th></tr></thead>
                <tbody>
                  {CLASSIFIED_DOCS.map(r => (
                    <tr key={r.id} style={r.status === 'Out' ? { background:'rgba(243,156,18,0.05)' } : {}}>
                      <td>{r.id}</td>
                      <td style={{ fontSize:10, fontWeight:700 }}>{r.classification}</td>
                      <td>{r.title}</td><td>{r.custodian}</td>
                      <td>{r.issued}</td><td>{r.due}</td><td>{r.returned}</td>
                      <td>{pill(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'key-ctrl' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-key" /> Key Control Register</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize:13, color:'#888', lineHeight:1.65 }}>
                Key control records are maintained in the SF-700 binder held in the S2 office. Each issued key
                is logged with the recipient name, date issued, key number, and return date. The binder is
                audited monthly and during each SCIF inspection. Contact SSG Torres for current key status.
              </p>
            </div>
          </div>
        )}

        {internalTab === 'inspect' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-check" /> Inspection Schedule</div>
            <div className={shared.cardBody}>
              <div className={shared.dl}>
                <dt>Last SCIF Inspection</dt><dd>14 Apr 2026 — Passed (2 minor discrepancies; remediated)</dd>
                <dt>Next Inspection</dt><dd>Oct 2026 (Q4 — Quarterly AR 380-5 compliance inspection)</dd>
                <dt>Inspector</dt><dd>CPT Morrison / BDE S2 representative</dd>
                <dt>Checklist</dt><dd>AR 380-5 Appendix B physical security inspection checklist</dd>
                <dt>Discrepancy Log</dt><dd>Maintained in S2 security binder; copies to BDE S2 on request</dd>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── CI AWARENESS ──────────────────────────────────────────────────────────
  if (subPage === 'ci-awareness') {
    const CI_TABS = [
      { key:'summary',       label:'Summary'         },
      { key:'contacts',      label:'Contact Reports' },
      { key:'insider',       label:'Insider Threat'  },
      { key:'referrals',     label:'Referrals'       },
    ]
    const referred30  = CI_REPORTS.filter(r => r.status === 'Referred').length
    const itFlags     = INSIDER_THREAT_LOG.filter(r => r.status === 'Under Review').length
    const underReview = CI_REPORTS.filter(r => r.status === 'Under Review').length

    return (
      <div className={shared.page}>
        {pageHeader}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>CI Awareness &amp; Insider Threat</h3>
        {statRow([
          { label:'Reports (30d)',          value: CI_REPORTS.length, bg:'#2d2d2d'          },
          { label:'Referred to INSCOM',     value: referred30,        bg: STATUS_COLOR.Amber },
          { label:'Insider Threat Flags',   value: itFlags,           bg: STATUS_COLOR.Red  },
          { label:'Under Review',           value: underReview,       bg: STATUS_COLOR.Amber },
        ])}
        {intTabBar(CI_TABS, internalTab, setInternalTab)}

        {(internalTab === 'summary' || internalTab === 'contacts') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Suspicious Contact Reports</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>ID</th><th>Date</th><th>Soldier</th><th>Type</th><th>Description</th><th>Action</th><th>Status</th><th>Referred To</th></tr></thead>
                <tbody>
                  {CI_REPORTS.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td>{r.date}</td><td>{r.soldier}</td><td>{r.type}</td>
                      <td style={{ fontSize:11, color:'#888', maxWidth:220 }}>{r.description}</td>
                      <td style={{ fontSize:11, color:'#888' }}>{r.action}</td>
                      <td>{pill(r.status)}</td>
                      <td style={{ fontSize:11 }}>{r.referredTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(internalTab === 'summary' || internalTab === 'insider') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-user-secret" /> Insider Threat Log</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>ID</th><th>Date</th><th>Category</th><th>Reporter</th><th>Subject</th><th>Status</th><th>Referral</th><th>Notes</th></tr></thead>
                <tbody>
                  {INSIDER_THREAT_LOG.map(r => (
                    <tr key={r.id} style={r.status === 'Under Review' ? { background:'rgba(231,76,60,0.07)' } : {}}>
                      <td>{r.id}</td><td>{r.date}</td><td>{r.category}</td>
                      <td>{r.reporter}</td><td>{r.subject}</td>
                      <td>{pill(r.status)}</td><td>{r.referral}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'referrals' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-share-square" /> INSCOM Referrals</div>
            {CI_REPORTS.filter(r => r.status === 'Referred').length === 0 ? <Empty /> : (
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>ID</th><th>Date</th><th>Soldier</th><th>Type</th><th>Referred To</th><th>Status</th></tr></thead>
                  <tbody>
                    {CI_REPORTS.filter(r => r.status === 'Referred').map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td><td>{r.date}</td><td>{r.soldier}</td><td>{r.type}</td>
                        <td>{r.referredTo}</td><td>{pill(r.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── COMSEC ────────────────────────────────────────────────────────────────
  if (subPage === 'comsec') {
    const COMSEC_TABS = [
      { key:'summary',   label:'Summary'     },
      { key:'inventory', label:'Inventory'   },
      { key:'key-status',label:'Key Status'  },
      { key:'sf700',     label:'SF-700 Log'  },
      { key:'audit',     label:'Account Audit'},
    ]
    const cciCount    = COMSEC_ITEMS.filter(r => r.classification === 'CCI').length
    const keyActive   = COMSEC_ITEMS.filter(r => r.status === 'Active').length
    const expiring30  = COMSEC_ITEMS.filter(r => r.status === 'Expiring').length
    const sf700Filed  = COMSEC_ITEMS.filter(r => r.sf700 === 'Filed').length

    return (
      <div className={shared.page}>
        {pageHeader}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>COMSEC Account Management</h3>
        {statRow([
          { label:'CCI Items',       value: cciCount,   bg:'#2d2d2d'          },
          { label:'Key Material Active',value: keyActive, bg: STATUS_COLOR.Green },
          { label:'Expiring (30d)',   value: expiring30, bg: STATUS_COLOR.Amber },
          { label:'SF-700 Filed',     value: sf700Filed, bg: STATUS_COLOR.Green },
        ])}
        {intTabBar(COMSEC_TABS, internalTab, setInternalTab)}

        {(internalTab === 'summary' || internalTab === 'inventory') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-boxes" /> COMSEC Inventory</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>SKU</th><th>Item</th><th>Classification</th><th>Custodian</th><th>Issued</th><th>Expires</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>
                  {COMSEC_ITEMS.map(r => (
                    <tr key={r.sku} style={r.status === 'Expiring' ? { background:'rgba(243,156,18,0.07)' } : {}}>
                      <td>{r.sku}</td><td>{r.item}</td><td style={{ fontSize:10, fontWeight:700 }}>{r.classification}</td>
                      <td>{r.custodian}</td><td>{r.issued}</td>
                      <td style={{ color: r.status === 'Expiring' ? STATUS_COLOR.Amber : '#aaa' }}>{r.expires}</td>
                      <td>{pill(r.status)}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'key-status' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-key" /> Key Material Status</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>SKU</th><th>Item</th><th>Custodian</th><th>Expires</th><th>Status</th><th>Action Required</th></tr></thead>
                <tbody>
                  {COMSEC_ITEMS.filter(r => r.classification === 'CRYPTO' || r.status === 'Expiring').map(r => (
                    <tr key={r.sku} style={{ background:'rgba(243,156,18,0.07)' }}>
                      <td>{r.sku}</td><td>{r.item}</td><td>{r.custodian}</td>
                      <td style={{ color: STATUS_COLOR.Amber }}>{r.expires}</td>
                      <td>{pill(r.status)}</td>
                      <td style={{ fontSize:11, color: STATUS_COLOR.Amber }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'sf700' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-file-contract" /> SF-700 Log</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>SKU</th><th>Item</th><th>Custodian</th><th>SF-700 Status</th><th>Notes</th></tr></thead>
                <tbody>
                  {COMSEC_ITEMS.map(r => (
                    <tr key={r.sku}>
                      <td>{r.sku}</td><td>{r.item}</td><td>{r.custodian}</td>
                      <td style={{ color: r.sf700 === 'Filed' ? STATUS_COLOR.Green : STATUS_COLOR.Red }}>{r.sf700}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {internalTab === 'audit' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-check" /> COMSEC Account Audit</div>
            <div className={shared.cardBody}>
              <div className={shared.dl}>
                <dt>Last Audit Date</dt><dd>15 Jan 2026 — Passed (no discrepancies)</dd>
                <dt>Next Scheduled</dt><dd>Sep 2026 (Annual — coordinated with G6 COMSEC Custodian)</dd>
                <dt>Custodian</dt><dd>CW3 Nakashima, Kenji (Primary) / SGT Okonkwo, Chidi (Alternate)</dd>
                <dt>Authority</dt><dd>CMS 1-CF-011; AR 380-40</dd>
                <dt>Inventory Status</dt><dd>All items accounted for as of 17 Jun 2026</dd>
                <dt>Discrepancy Log</dt><dd>None open — previous discrepancies cleared Jan 2026</dd>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN PAGES
  // ══════════════════════════════════════════════════════════════════════════

  // ── ADM-PEOPLE ────────────────────────────────────────────────────────────
  if (subPage === 'adm-people') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-0 Personnel</h3>

        {adminSubTab === 'summary' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-users" /> S2 Section Roster</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Rank</th><th>Name</th><th>MOS</th><th>Position</th><th>Clearance</th><th>PRR Due</th><th>PRR Status</th><th>SERE</th><th>DEROS</th></tr></thead>
                <tbody>
                  {S2_SECTION_SOLDIERS.map(s => (
                    <tr key={s.edipi}>
                      <td>{s.rank}</td><td>{s.lastName}, {s.firstName}</td>
                      <td>{s.mos}</td><td>{s.positionTitle}</td><td>{s.clearance}</td>
                      <td>{s.prrDue}</td>
                      <td style={{ color: s.prrStatus.includes('Overdue') ? STATUS_COLOR.Red : '#aaa' }}>{s.prrStatus}</td>
                      <td>{s.sere}</td><td>{s.deros}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'roster' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-list" /> Full Roster</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Rank</th><th>Name</th><th>MOS</th><th>Position</th><th>DEROS</th></tr></thead>
                <tbody>
                  {S2_SECTION_SOLDIERS.map(s => (
                    <tr key={s.edipi}>
                      <td>{s.rank}</td><td>{s.lastName}, {s.firstName}</td>
                      <td>{s.mos}</td><td>{s.positionTitle}</td><td>{s.deros}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'clearances' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Section Clearance Status</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Rank</th><th>Name</th><th>Clearance</th><th>PRR Due</th><th>PRR Status</th></tr></thead>
                <tbody>
                  {S2_SECTION_SOLDIERS.map(s => (
                    <tr key={s.edipi} style={s.prrStatus.includes('Overdue') ? { background:'rgba(231,76,60,0.07)' } : {}}>
                      <td>{s.rank}</td><td>{s.lastName}, {s.firstName}</td>
                      <td>{s.clearance}</td><td>{s.prrDue}</td>
                      <td style={{ color: s.prrStatus.includes('Overdue') ? STATUS_COLOR.Red : '#aaa' }}>{s.prrStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(adminSubTab === 'in-proc' || adminSubTab === 'out-proc') && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className={`fas fa-sign-${adminSubTab === 'in-proc' ? 'in' : 'out'}-alt`} /> {adminSubTab === 'in-proc' ? 'In-Processing' : 'Out-Processing'}</div>
            <div className={shared.cardBody}><Empty /></div>
          </div>
        )}
      </div>
    )
  }

  // ── ADM-TASKS ─────────────────────────────────────────────────────────────
  if (subPage === 'adm-tasks') {
    const filtered = adminSubTab === 'summary' ? S2_TASKS.filter(t => t.priority === 'Critical' || t.priority === 'High')
      : adminSubTab === 'open'        ? S2_TASKS.filter(t => t.status === 'Open')
      : adminSubTab === 'in-progress' ? S2_TASKS.filter(t => t.status === 'In Progress')
      : S2_TASKS.filter(t => t.status === 'Completed' || t.status === 'Upcoming')

    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-1 Tasks</h3>
        {adminSubTab === 'summary' && statRow([
          { label:'Open',        value: S2_TASKS.filter(t => t.status === 'Open').length,        bg:'#2d2d2d'          },
          { label:'In Progress', value: S2_TASKS.filter(t => t.status === 'In Progress').length, bg: STATUS_COLOR.Amber },
          { label:'Critical',    value: S2_TASKS.filter(t => t.priority === 'Critical').length,  bg: STATUS_COLOR.Red  },
          { label:'Total',       value: S2_TASKS.length,                                         bg:'#2d2d2d'          },
        ])}
        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-tasks" /> {adminSubTab === 'summary' ? 'Priority Tasks' : `${adminSubTab.charAt(0).toUpperCase()}${adminSubTab.slice(1).replace('-',' ')} Tasks`}</div>
          {filtered.length === 0 ? <Empty /> : (
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>ID</th><th>Task</th><th>Category</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td>{t.id}</td><td>{t.task}</td><td>{t.category}</td>
                      <td>{t.assignedTo}</td><td>{pill(t.priority)}</td>
                      <td>{t.dueDate}</td><td>{pill(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── ADM-SECURITY ──────────────────────────────────────────────────────────
  if (subPage === 'adm-security') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-2 Security Oversight</h3>
        {statRow([
          { label:'Total Clearances',  value: CLEARANCE_ROSTER.length, bg:'#2d2d2d'          },
          { label:'PRRs Overdue',      value: prrsOverdue,              bg: STATUS_COLOR.Red  },
          { label:'Travel In Progress',value: FOREIGN_TRAVEL.filter(r => r.status === 'Traveling').length, bg:'#2d2d2d' },
          { label:'CI Reports',        value: CI_REPORTS.length,        bg: STATUS_COLOR.Amber },
        ])}

        {adminSubTab === 'summary' && (
          <div className={shared.cards}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Clearance Summary</div>
              <div className={shared.cardBody} style={{ fontSize:13, color:'#888', lineHeight:1.7 }}>
                <p>Total clearances: <strong style={{ color:'#ccc' }}>{CLEARANCE_ROSTER.length}</strong></p>
                <p>PRRs overdue: <strong style={{ color: STATUS_COLOR.Red }}>{prrsOverdue}</strong> — immediate action required</p>
                <p>Interims: <strong style={{ color: STATUS_COLOR.Amber }}>{CLEARANCE_ROSTER.filter(r => r.elig === 'Interim').length}</strong></p>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-plane" /> Foreign Travel Summary</div>
              <div className={shared.cardBody} style={{ fontSize:13, color:'#888', lineHeight:1.7 }}>
                <p>Currently traveling: <strong style={{ color:'#ccc' }}>{FOREIGN_TRAVEL.filter(r => r.status === 'Traveling').length}</strong></p>
                <p>Upcoming: <strong style={{ color:'#ccc' }}>{FOREIGN_TRAVEL.filter(r => r.status === 'Upcoming').length}</strong></p>
                <p>Pending briefs: <strong style={{ color: STATUS_COLOR.Amber }}>{FOREIGN_TRAVEL.filter(r => r.briefDate === '—' && r.status !== 'Complete').length}</strong></p>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-user-secret" /> CI Summary</div>
              <div className={shared.cardBody} style={{ fontSize:13, color:'#888', lineHeight:1.7 }}>
                <p>Reports (30d): <strong style={{ color:'#ccc' }}>{CI_REPORTS.length}</strong></p>
                <p>Referred to INSCOM: <strong style={{ color: STATUS_COLOR.Amber }}>{CI_REPORTS.filter(r => r.status === 'Referred').length}</strong></p>
                <p>Under review: <strong style={{ color: STATUS_COLOR.Red }}>{CI_REPORTS.filter(r => r.status === 'Under Review').length}</strong></p>
              </div>
            </div>
          </div>
        )}

        {adminSubTab === 'unit-clear' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Unit Clearance Roster</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Clearance</th><th>PRR Due</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>
                  {CLEARANCE_ROSTER.map(r => (
                    <tr key={r.edipi} style={r.prrStatus.includes('Overdue') ? { background:'rgba(231,76,60,0.07)' } : {}}>
                      <td>{r.lastName}, {r.firstName}</td><td>{r.rank}</td><td>{r.clearance}</td>
                      <td style={{ color: r.prrStatus.includes('Overdue') ? STATUS_COLOR.Red : '#aaa' }}>{r.prrDue}</td>
                      <td>{pill(r.prrStatus)}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'foreign-trvl' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-plane" /> Foreign Travel Log</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>ID</th><th>Soldier</th><th>Destination</th><th>Depart</th><th>Return</th><th>Status</th></tr></thead>
                <tbody>
                  {FOREIGN_TRAVEL.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td>{r.soldier}</td><td>{r.destination}</td>
                      <td>{r.departDate}</td><td>{r.returnDate}</td><td>{pill(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'ci-log' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-user-secret" /> CI Report Log</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>ID</th><th>Date</th><th>Soldier</th><th>Type</th><th>Status</th><th>Referred To</th></tr></thead>
                <tbody>
                  {CI_REPORTS.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td>{r.date}</td><td>{r.soldier}</td><td>{r.type}</td>
                      <td>{pill(r.status)}</td><td style={{ fontSize:11 }}>{r.referredTo}</td>
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

  // ── ADM-OPERATIONS ────────────────────────────────────────────────────────
  if (subPage === 'adm-operations') {
    const suspenses = [...S2_TASKS].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-3 Operations</h3>

        {adminSubTab === 'summary' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-tachometer-alt" /> Operations Summary</div>
            <div className={shared.cardBody} style={{ fontSize:13, color:'#888', lineHeight:1.7 }}>
              <p>Battle rhythm events: <strong style={{ color:'#ccc' }}>{S2_BATTLE_RHYTHM.length}</strong></p>
              <p>Open suspenses: <strong style={{ color: STATUS_COLOR.Red }}>{S2_TASKS.filter(t => t.status === 'Open').length}</strong></p>
              <p>In-progress tasks: <strong style={{ color: STATUS_COLOR.Amber }}>{S2_TASKS.filter(t => t.status === 'In Progress').length}</strong></p>
            </div>
          </div>
        )}

        {adminSubTab === 'battle-rhythm' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-drum" /> Battle Rhythm</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Event</th><th>Time</th><th>Cadence</th><th>Owner</th><th>Notes</th></tr></thead>
                <tbody>
                  {S2_BATTLE_RHYTHM.map(r => (
                    <tr key={r.event}>
                      <td style={{ fontWeight:600 }}>{r.event}</td>
                      <td>{r.time}</td><td>{r.cadence}</td><td>{r.owner}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'suspenses' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-bell" /> Suspenses (by due date)</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>ID</th><th>Task</th><th>Category</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {suspenses.map(t => (
                    <tr key={t.id}>
                      <td>{t.id}</td><td>{t.task}</td><td>{t.category}</td>
                      <td>{t.assignedTo}</td><td>{pill(t.priority)}</td>
                      <td>{t.dueDate}</td><td>{pill(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'calendar' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Annual Calendar</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Owner</th><th>Notes</th></tr></thead>
                <tbody>
                  {S2_ANNUAL_CALENDAR.map(r => (
                    <tr key={r.month + r.event}>
                      <td style={{ fontWeight:600, whiteSpace:'nowrap' }}>{r.month}</td>
                      <td>{r.event}</td><td>{r.type}</td><td>{r.owner}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
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

  // ── ADM-SUSTAINMENT ───────────────────────────────────────────────────────
  if (subPage === 'adm-sustainment') {
    const SYSTEMS = [
      { system:'DISS',          fullName:'Defense Information System for Security', role:'Clearance submission, PRR initiation, adjudication tracking' },
      { system:'eApp / NBIS',   fullName:'National Background Investigation Services eApp', role:'SF-86 submission; investigation portal' },
      { system:'SWFT',          fullName:'Security Workforce and Force Tracker',  role:'Security training completion recording' },
      { system:'JPAS (legacy)', fullName:'Joint Personnel Adjudication System',   role:'Legacy reference — superseded by DISS' },
      { system:'SIPR / JWICS',  fullName:'Secret/TS network access',              role:'SCI access management; user accounts' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-4 Equipment &amp; Systems</h3>

        {(adminSubTab === 'summary' || adminSubTab === 'comsec-equip') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-key" /> COMSEC Equipment</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>SKU</th><th>Item</th><th>Class.</th><th>Custodian</th><th>Status</th><th>SF-700</th><th>Notes</th></tr></thead>
                <tbody>
                  {COMSEC_ITEMS.map(r => (
                    <tr key={r.sku} style={r.status === 'Expiring' ? { background:'rgba(243,156,18,0.07)' } : {}}>
                      <td>{r.sku}</td><td>{r.item}</td><td style={{ fontSize:10, fontWeight:700 }}>{r.classification}</td>
                      <td>{r.custodian}</td><td>{pill(r.status)}</td>
                      <td style={{ color: r.sf700 === 'Filed' ? STATUS_COLOR.Green : STATUS_COLOR.Red }}>{r.sf700}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(adminSubTab === 'summary' || adminSubTab === 'systems') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-server" /> Security Systems</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>System</th><th>Full Name</th><th>Role</th></tr></thead>
                <tbody>
                  {SYSTEMS.map(s => (
                    <tr key={s.system}>
                      <td style={{ fontWeight:700 }}>{s.system}</td>
                      <td>{s.fullName}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{s.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'maint' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-tools" /> Maintenance Log</div>
            <div className={shared.cardBody}><Empty /></div>
          </div>
        )}
      </div>
    )
  }

  // ── ADM-PLANS ─────────────────────────────────────────────────────────────
  if (subPage === 'adm-plans') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-5 Plans</h3>

        {(adminSubTab === 'summary' || adminSubTab === 'annual-cal') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Annual Security Calendar</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Owner</th><th>Notes</th></tr></thead>
                <tbody>
                  {S2_ANNUAL_CALENDAR.map(r => (
                    <tr key={r.month + r.event}>
                      <td style={{ fontWeight:600, whiteSpace:'nowrap' }}>{r.month}</td>
                      <td>{r.event}</td><td>{r.type}</td><td>{r.owner}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'long-range' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-binoculars" /> Long-Range Planning</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize:13, color:'#888', lineHeight:1.65 }}>
                Long-range planning factors: PRR renewal cycles (5-year for TS/SCI), annual training windows (FY Q4 deadline),
                COMSEC semi-annual rotations, SCIF quarterly inspections, and CDR briefing schedule. Coordinate with BDE S2
                for policy changes and adjudication timelines.
              </p>
            </div>
          </div>
        )}

        {adminSubTab === 'policy-rev' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Policy Review Schedule</div>
            <div className={shared.cardBody}>
              <p style={{ fontSize:13, color:'#888', lineHeight:1.65 }}>
                Unit security SOP reviewed annually (NLT Oct each FY). AR 380-5 and DODI 5200.02 revisions tracked
                via BDE S2 policy distribution. Next SOP review: Oct 2026.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── ADM-COMMS ─────────────────────────────────────────────────────────────
  if (subPage === 'adm-comms') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-6 Communications</h3>

        {(adminSubTab === 'summary' || adminSubTab === 'contacts') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-address-book" /> Key Security Contacts</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Organization</th><th>POC</th><th>Role</th><th>Phone</th><th>Email</th><th>Notes</th></tr></thead>
                <tbody>
                  {S2_CONTACTS.map(r => (
                    <tr key={r.org}>
                      <td>{r.org}</td><td>{r.poc}</td><td>{r.role}</td>
                      <td>{r.phone}</td><td style={{ fontSize:11 }}>{r.email}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(adminSubTab === 'message-log' || adminSubTab === 'dist') && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-envelope" /> {adminSubTab === 'dist' ? 'Distribution' : 'Message Log'}</div>
            <div className={shared.cardBody}><Empty /></div>
          </div>
        )}
      </div>
    )
  }

  // ── ADM-TRAINING ──────────────────────────────────────────────────────────
  if (subPage === 'adm-training') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-7 Training</h3>

        {(adminSubTab === 'summary' || adminSubTab === 'requirements') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Training Requirements Matrix</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Annual Sec</th><th>Deriv Class</th><th>Insider Threat</th><th>OPSEC</th><th>SERE</th></tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ color: r.annualSec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.annualSec}</td>
                      <td style={{ color: r.derivClass === 'Due' ? STATUS_COLOR.Amber : r.derivClass === 'N/A' ? '#888' : STATUS_COLOR.Green }}>{r.derivClass}</td>
                      <td style={{ color: r.insiderThreat === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.insiderThreat}</td>
                      <td style={{ color: r.opsec === 'Due' ? STATUS_COLOR.Amber : STATUS_COLOR.Green }}>{r.opsec}</td>
                      <td>{r.sere}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'sere' && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-mountain" /> SERE Tracking</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>SERE Level</th><th>Completed</th></tr></thead>
                <tbody>
                  {SECURITY_TRAINING.map(r => (
                    <tr key={r.soldier}>
                      <td>{r.soldier}</td><td>{r.rank}</td>
                      <td style={{ fontWeight:700 }}>{r.sere}</td><td>{r.sereCompleted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'metl' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-crosshairs" /> METL</div>
            <div className={shared.cardBody}><Empty /></div>
          </div>
        )}
      </div>
    )
  }

  // ── ADM-RESOURCES ─────────────────────────────────────────────────────────
  if (subPage === 'adm-resources') {
    const FORMS_LIST = [
      { form:'SF-86',   title:'Questionnaire for National Security Positions',  use:'PRR / new investigation' },
      { form:'SF-700',  title:'Security Container Information',                 use:'Safe combination record' },
      { form:'SF-701',  title:'Activity Security Checklist',                    use:'End-of-day inspection'   },
      { form:'SF-702',  title:'Security Container Check Sheet',                 use:'Daily open/close log'    },
      { form:'CI Ref.', title:'CI Referral Form',                               use:'INSCOM CI referral'      },
      { form:'SCR',     title:'Suspicious Contact Report',                      use:'AR 381-12 compliance'    },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-8 Resources</h3>

        {(adminSubTab === 'summary' || adminSubTab === 'references') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-book" /> Security References</div>
            <div className={shared.cardBody} style={{ fontSize:13, color:'#888', lineHeight:1.8 }}>
              <p><strong style={{ color:'#ccc' }}>AR 380-5</strong> — Information Security Program</p>
              <p><strong style={{ color:'#ccc' }}>DODI 5200.02</strong> — DoD Personnel Security Program</p>
              <p><strong style={{ color:'#ccc' }}>DODI 5240.06</strong> — CI Awareness Reporting Requirements</p>
              <p><strong style={{ color:'#ccc' }}>AR 380-40</strong> — Safeguarding and Controlling COMSEC</p>
              <p><strong style={{ color:'#ccc' }}>AR 530-1</strong> — Operations Security</p>
            </div>
          </div>
        )}

        {(adminSubTab === 'summary' || adminSubTab === 'forms') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Common Forms</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Form</th><th>Title</th><th>Use</th></tr></thead>
                <tbody>
                  {FORMS_LIST.map(f => (
                    <tr key={f.form}>
                      <td style={{ fontWeight:700 }}>{f.form}</td>
                      <td>{f.title}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{f.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminSubTab === 'budget' && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget</div>
            <div className={shared.cardBody}><Empty /></div>
          </div>
        )}
      </div>
    )
  }

  // ── ADM-COORD ─────────────────────────────────────────────────────────────
  if (subPage === 'adm-coord') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {adminQuickNav}
        <h3 style={{ fontSize:14, fontWeight:700, color:'#ccc', marginBottom:12 }}>A-9 Coordination</h3>

        {(adminSubTab === 'summary' || adminSubTab === 'bde-sync') && (
          <div className={shared.card} style={{ marginBottom:16 }}>
            <div className={shared.cardHeader}><i className="fas fa-sync" /> BDE S2 Sync Events</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Event</th><th>Cadence</th><th>Owner</th><th>Notes</th></tr></thead>
                <tbody>
                  {S2_BATTLE_RHYTHM.filter(r => r.cadence === 'Weekly' || r.cadence === 'Monthly').map(r => (
                    <tr key={r.event}>
                      <td>{r.event}</td><td>{r.cadence}</td><td>{r.owner}</td>
                      <td style={{ fontSize:11, color:'#777' }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(adminSubTab === 'coord-tracker' || adminSubTab === 'higher-hq') && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-project-diagram" /> {adminSubTab === 'higher-hq' ? 'Higher HQ Coordination' : 'Coordination Tracker'}</div>
            <div className={shared.cardBody}><Empty /></div>
          </div>
        )}
      </div>
    )
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  return (
    <div className={shared.page}>
      {pageHeader}
      <div className={shared.card}>
        <div className={shared.cardBody}>
          <p style={{ color:'#555', textAlign:'center', padding:40 }}>
            Page not found: <code>{subPage}</code>
          </p>
        </div>
      </div>
    </div>
  )
}
