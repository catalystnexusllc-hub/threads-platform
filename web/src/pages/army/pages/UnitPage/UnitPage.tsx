import { useState } from 'react'
import shared from '../shared.module.css'
import styles from '../S1/S1Page.module.css'

const FUNCTIONS_NAV = [
  { key: 'train', label: 'Train', icon: 'fa-chalkboard-teacher' },
  { key: 'man',   label: 'Man',   icon: 'fa-users'              },
  { key: 'equip', label: 'Equip', icon: 'fa-tools'             },
]

const OPS_NAV = [
  { key: 'cop',    label: 'COP',    icon: 'fa-map-marked-alt'  },
  { key: 'sitrep', label: 'SITREP', icon: 'fa-broadcast-tower' },
]

// ── Function sub-tab actions ───────────────────────────────────────────────────
const FN_TAB_ACTIONS: Record<string, Array<{ key: string; icon: string; label: string }>> = {
  train: [
    { key: 'schedule',   icon: 'fa-calendar-alt',        label: 'Schedule'      },
    { key: 'metl',       icon: 'fa-crosshairs',          label: 'METL'          },
    { key: 'aar',        icon: 'fa-file-alt',            label: 'AAR'           },
    { key: 'certs',      icon: 'fa-certificate',         label: 'Certs'         },
    { key: 'dtms',       icon: 'fa-laptop',              label: 'DTMS'          },
  ],
  man: [
    { key: 'roster',     icon: 'fa-address-book',        label: 'Roster'        },
    { key: 'billets',    icon: 'fa-th-list',             label: 'Billets'       },
    { key: 'pipeline',   icon: 'fa-exchange-alt',        label: 'Pipeline'      },
    { key: 'counseling', icon: 'fa-file-alt',            label: 'Counseling'    },
  ],
  equip: [
    { key: 'pmcs',        icon: 'fa-tools',              label: 'PMCS'          },
    { key: 'property',    icon: 'fa-clipboard-list',     label: 'Property Book' },
    { key: 'work-orders', icon: 'fa-wrench',             label: 'Work Orders'   },
    { key: 'shortfalls',  icon: 'fa-exclamation-triangle', label: 'Shortfalls' },
  ],
  cop: [
    { key: 'situation',  icon: 'fa-binoculars',          label: 'Situation'     },
    { key: 'forces',     icon: 'fa-chess',               label: 'Forces'        },
    { key: 'tasks',      icon: 'fa-list-ol',             label: 'Tasks'         },
    { key: 'graphics',   icon: 'fa-map',                 label: 'Graphics'      },
  ],
  sitrep: [
    { key: 'current',    icon: 'fa-clock',               label: 'Current'       },
    { key: 'history',    icon: 'fa-history',             label: 'History'       },
    { key: 'format',     icon: 'fa-align-left',          label: 'Format'        },
    { key: 'submit',     icon: 'fa-paper-plane',         label: 'Submit'        },
  ],
}

// ── Admin sub-tab actions (mirrors S1) ─────────────────────────────────────────
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
    { key: 'clearances', icon: 'fa-id-badge',      label: 'Clearances' },
    { key: 'persec',     icon: 'fa-user-shield',   label: 'PERSEC'     },
    { key: 'opsec',      icon: 'fa-eye-slash',     label: 'OPSEC'      },
    { key: 'access-log', icon: 'fa-file-contract', label: 'Access Log' },
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

const P = () => <span style={{ color: '#333', fontStyle: 'italic', fontSize: 10 }}>Pending</span>

function placeholderRows(count: number, cols: number) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={i}>{Array.from({ length: cols }, (__, j) => <td key={j}><P /></td>)}</tr>
  ))
}

function EmptyTableState({ cols, icon, label, hint }: { cols: number; icon: string; label: string; hint: string }) {
  return (
    <tr>
      <td colSpan={cols}>
        <div style={{ padding: '36px 20px', textAlign: 'center' }}>
          <i className={`fas ${icon}`} style={{ fontSize: 22, display: 'block', marginBottom: 8, color: '#252525' }} />
          <strong style={{ display: 'block', color: '#444', marginBottom: 3, fontSize: 11 }}>{label}</strong>
          <span style={{ fontSize: 10, color: '#3a3a3a' }}>{hint}</span>
        </div>
      </td>
    </tr>
  )
}

function getUnitMeta(key: string): { short: string; accent: string } {
  const accent =
    key.startsWith('unit-1bn') ? '#c9a227' :
    key.startsWith('unit-2bn') ? '#2980b9' :
    key.startsWith('unit-3bn') ? '#c0392b' :
    key.startsWith('unit-gsb') ? '#27ae60' : '#888'
  const shortMap: Record<string, string> = {
    'unit-grp-hhc': 'GRP HHC',
    'unit-1bn': '1/5 SFG',    'unit-1bn-hhd': '1/5 HHD', 'unit-1bn-a': 'A/1-5', 'unit-1bn-b': 'B/1-5', 'unit-1bn-c': 'C/1-5', 'unit-1bn-spt': 'SPT/1-5',
    'unit-2bn': '2/5 SFG',    'unit-2bn-hhd': '2/5 HHD', 'unit-2bn-a': 'A/2-5', 'unit-2bn-b': 'B/2-5', 'unit-2bn-c': 'C/2-5', 'unit-2bn-spt': 'SPT/2-5',
    'unit-3bn': '3/5 SFG',    'unit-3bn-hhd': '3/5 HHD', 'unit-3bn-a': 'A/3-5', 'unit-3bn-b': 'B/3-5', 'unit-3bn-c': 'C/3-5', 'unit-3bn-spt': 'SPT/3-5',
    'unit-gsb': 'GSB',        'unit-gsb-hhc': 'GSB HHC', 'unit-gsb-svc': 'GSB Svc', 'unit-gsb-fsc': 'GSB FSC',
  }
  return { short: shortMap[key] ?? key.replace('unit-', '').toUpperCase(), accent }
}

const BN_SUBORDINATES: Record<string, Array<{ key: string; label: string }>> = {
  'unit-1bn': [
    { key: 'unit-1bn-hhd', label: 'HHD'         },
    { key: 'unit-1bn-a',   label: 'Alpha Co'     },
    { key: 'unit-1bn-b',   label: 'Bravo Co'     },
    { key: 'unit-1bn-c',   label: 'Charlie Co'   },
    { key: 'unit-1bn-spt', label: 'Support Co'   },
  ],
  'unit-2bn': [
    { key: 'unit-2bn-hhd', label: 'HHD'         },
    { key: 'unit-2bn-a',   label: 'Alpha Co'     },
    { key: 'unit-2bn-b',   label: 'Bravo Co'     },
    { key: 'unit-2bn-c',   label: 'Charlie Co'   },
    { key: 'unit-2bn-spt', label: 'Support Co'   },
  ],
  'unit-3bn': [
    { key: 'unit-3bn-hhd', label: 'HHD'         },
    { key: 'unit-3bn-a',   label: 'Alpha Co'     },
    { key: 'unit-3bn-b',   label: 'Bravo Co'     },
    { key: 'unit-3bn-c',   label: 'Charlie Co'   },
    { key: 'unit-3bn-spt', label: 'Support Co'   },
  ],
  'unit-gsb': [
    { key: 'unit-gsb-hhc', label: 'HHC'             },
    { key: 'unit-gsb-svc', label: 'Svc & Spt Co'    },
    { key: 'unit-gsb-fsc', label: 'Forward Spt Co'  },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UnitPage({
  subPage = 'overview',
  unitKey = 'unit-1bn-a',
  unitLabel = 'Alpha Company',
  onNavigate,
}: {
  subPage?: string
  unitKey?: string
  unitLabel?: string
  onNavigate?: (page: string) => void
}) {
  const [fnSubTab, setFnSubTab] = useState('summary')
  const [prevPage, setPrevPage] = useState(subPage)
  if (prevPage !== subPage) {
    setPrevPage(subPage)
    setFnSubTab('summary')
  }

  const isFnPage  = ['train', 'man', 'equip', 'cop', 'sitrep'].includes(subPage)
  const isAdmPage = subPage.startsWith('adm-')
  const isActivePage = isFnPage || isAdmPage

  const currentTabActions = isFnPage
    ? (FN_TAB_ACTIONS[subPage] ?? [])
    : (ADM_TAB_ACTIONS[subPage] ?? [])

  const isBattalion = /^unit-(\dbn|gsb)$/.test(unitKey)
  const { short, accent } = getUnitMeta(unitKey)

  const pageHeader = (
    <div className={shared.header}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="fas fa-shield-alt" style={{ color: accent }} />
        {unitLabel}
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, background: `${accent}22`, color: accent, padding: '2px 8px', borderRadius: 3 }}>{short}</span>
      </h2>
      <span className={shared.sub}>Train · Man · Equip</span>
    </div>
  )

  const quickNav = isActivePage ? (
    <div className={styles.adminNav}>
      <button
        className={`${styles.tabActionBtn} ${fnSubTab === 'summary' ? styles.tabActionActive : ''}`}
        onClick={() => setFnSubTab('summary')}
      >
        <i className="fas fa-tachometer-alt" /> Summary
      </button>
      {currentTabActions.map(btn => (
        <button
          key={btn.key}
          className={`${styles.tabActionBtn} ${fnSubTab === btn.key ? styles.tabActionActive : ''}`}
          onClick={() => setFnSubTab(btn.key)}
        >
          <i className={`fas ${btn.icon}`} /> {btn.label}
        </button>
      ))}
    </div>
  ) : null

  const subStub = fnSubTab !== 'summary' ? (
    <div className={shared.card}>
      <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
        <i className="fas fa-tools" style={{ fontSize: 28, display: 'block', marginBottom: 12, color: '#333' }} />
        <strong style={{ color: '#ccc', display: 'block', marginBottom: 6 }}>
          {currentTabActions.find(t => t.key === fnSubTab)?.label ?? fnSubTab}
        </strong>
        <span style={{ color: '#555', fontSize: 11 }}>Section under construction</span>
      </div>
    </div>
  ) : null

  // ── OVERVIEW ──────────────────────────────────────────────────────────────
  if (subPage === 'overview') {
    const readinessStats = [
      { label: 'Assigned',      value: '—', bg: '#2d2d2d' },
      { label: 'Present',       value: '—', bg: '#2d2d2d' },
      { label: 'Train Ready',   value: '—', bg: '#0e1e13' },
      { label: 'Equip FMC',     value: '—', bg: '#0e1e13' },
      { label: 'Admin Overdue', value: '—', bg: '#1e0e0e' },
    ]
    const fnSubtitles: Record<string, string> = {
      train: '— METL T  ·  — events',
      man:   '— assigned  ·  — vacancies',
      equip: '— FMC  ·  — open WOs',
    }
    const opsSubtitles: Record<string, string> = {
      cop:    'Situation · Forces · Tasks',
      sitrep: 'Current · History · Submit',
    }
    const subordinates = BN_SUBORDINATES[unitKey] ?? []

    return (
      <div className={shared.page}>
        {pageHeader}

        <div className={shared.stats} style={{ marginBottom: 16 }}>
          {readinessStats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {FUNCTIONS_NAV.map(n => (
            <button
              key={n.key}
              className={shared.navCard}
              style={{ flex: 1, background: '#0a1a0a', border: '1px solid #1a3a1a' }}
              onClick={() => onNavigate?.(`${unitKey}-${n.key}`)}
            >
              <i className={`fas ${n.icon}`} style={{ color: '#27ae60' }} />
              <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.8, color: '#ccc' }}>{n.label}</span>
              <span style={{ fontSize: 10, color: '#3a6a3a', fontWeight: 400, letterSpacing: 0 }}>{fnSubtitles[n.key]}</span>
            </button>
          ))}
          {OPS_NAV.map(n => (
            <button
              key={n.key}
              className={shared.navCard}
              style={{ flex: 1, background: '#0a0a1e', border: '1px solid #1a1a3a' }}
              onClick={() => onNavigate?.(`${unitKey}-${n.key}`)}
            >
              <i className={`fas ${n.icon}`} style={{ color: '#5a9adc' }} />
              <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.8, color: '#ccc' }}>{n.label}</span>
              <span style={{ fontSize: 10, color: '#2a4a6a', fontWeight: 400, letterSpacing: 0 }}>{opsSubtitles[n.key]}</span>
            </button>
          ))}
        </div>

        <div className={shared.card} style={{ marginBottom: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-list-ol" /> Commander's Priorities</div>
          <div className={shared.cardBody}>
            {[
              'Maintain individual and collective training readiness at or above T standard',
              'Sustain 90%+ equipment FMC rate across all organic systems',
              'Zero overdue counseling, awards, and promotion actions',
              'Complete all required administrative suspenses on time',
              'Maintain accountability of all personnel and equipment 100% of the time',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '8px 0', borderBottom: '1px solid #141414', fontSize: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: accent, width: 24, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ color: '#888', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {isBattalion && subordinates.length > 0 ? (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-sitemap" /> Subordinate Unit Status</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Assigned</th>
                    <th>METL Ready</th>
                    <th>Equip FMC</th>
                    <th>Admin Overdue</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subordinates.map(co => (
                    <tr key={co.key} style={{ cursor: 'pointer' }} onClick={() => onNavigate?.(co.key)}>
                      <td style={{ fontWeight: 700, color: '#ccc' }}>{co.label}</td>
                      <td><P /></td>
                      <td><P /></td>
                      <td><P /></td>
                      <td><P /></td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#333' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={shared.grid2}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Training Readiness</div>
              <div className={shared.cardBody}>
                <dl className={shared.dl}>
                  <dt>METL — T Tasks</dt>               <dd><P /></dd>
                  <dt>METL — P Tasks</dt>               <dd><P /></dd>
                  <dt>METL — U Tasks</dt>               <dd><P /></dd>
                  <dt>Collective Events (MTD)</dt>       <dd><P /></dd>
                  <dt>Individual Training Compliance</dt><dd><P /></dd>
                </dl>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-tools" /> Equipment Readiness</div>
              <div className={shared.cardBody}>
                <dl className={shared.dl}>
                  <dt>PMCS Compliance</dt> <dd><P /></dd>
                  <dt>FMC Rate</dt>        <dd><P /></dd>
                  <dt>NMC / Deadline</dt>  <dd><P /></dd>
                  <dt>Open Work Orders</dt><dd><P /></dd>
                  <dt>Shortfalls</dt>      <dd><P /></dd>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  if (subPage === 'dashboard') {
    const tier1Stats = [
      { label: 'Authorized',     value: '—', bg: '#2d2d2d' },
      { label: 'Assigned',       value: '—', bg: '#2d2d2d' },
      { label: 'Present',        value: '—', bg: '#2d2d2d' },
      { label: 'Non-Deployable', value: '—', bg: '#1e1a0e' },
      { label: 'Train Ready',    value: '—', bg: '#0e1e13' },
      { label: 'Equip FMC',      value: '—', bg: '#0e1e13' },
    ]
    const METRIC_DOMAINS = [
      {
        icon: 'fa-users', title: 'Manning',
        metrics: [
          { label: 'Fill Rate',        sub: 'Assigned / Authorized',      value: '—%' },
          { label: 'Key Billet Fill',  sub: 'Critical positions',          value: '—%' },
          { label: 'ND Rate',          sub: 'Non-deployable %',            value: '—%' },
          { label: 'Gains (90-day)',   sub: 'Projected inbound pipeline',  value: '—'  },
          { label: 'Losses (90-day)', sub: 'ETS / PCS pending',           value: '—'  },
        ],
      },
      {
        icon: 'fa-chalkboard-teacher', title: 'Training',
        metrics: [
          { label: 'METL — T',         sub: 'Tasks rated Trained',         value: '—'  },
          { label: 'METL — P',         sub: 'Needs Practice',              value: '—'  },
          { label: 'METL — U',         sub: 'Tasks rated Untrained',       value: '—'  },
          { label: 'DTMS Compliance',  sub: 'Individual trng current',     value: '—%' },
          { label: 'Events MTD',       sub: 'Collective events executed',  value: '—'  },
        ],
      },
      {
        icon: 'fa-tools', title: 'Equipment',
        metrics: [
          { label: 'FMC Rate',         sub: 'Fully Mission Capable',       value: '—%' },
          { label: 'NMC / Deadline',   sub: 'Non-mission capable items',   value: '—'  },
          { label: 'Open Work Orders', sub: 'Active maintenance actions',  value: '—'  },
          { label: 'PMCS Compliance',  sub: 'Scheduled PMCS complete',     value: '—%' },
          { label: 'Shortfalls',       sub: 'Equipment vs authorization',  value: '—'  },
        ],
      },
    ]
    const ADMIN_METRICS = [
      { label: 'Overdue Suspenses',  value: '—', icon: 'fa-bell',           color: '#c9a227' },
      { label: 'Counseling Overdue', value: '—', icon: 'fa-file-alt',       color: '#c9a227' },
      { label: 'Awards Pending',     value: '—', icon: 'fa-medal',          color: '#27ae60' },
      { label: 'Clearance Expiring', value: '—', icon: 'fa-id-badge',       color: '#2980b9' },
      { label: 'Leave Requests',     value: '—', icon: 'fa-calendar-check', color: '#666'    },
      { label: 'SGLV / DD93 Due',    value: '—', icon: 'fa-file-contract',  color: '#c9a227' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}

        <div className={shared.stats} style={{ marginBottom: 16 }}>
          {tier1Stats.map(s => (
            <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
              <div className={shared.statValue}>{s.value}</div>
              <div className={shared.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          {METRIC_DOMAINS.map(domain => (
            <div key={domain.title} className={shared.card}>
              <div className={shared.cardHeader}><i className={`fas ${domain.icon}`} /> {domain.title}</div>
              <div className={shared.cardBody}>
                {domain.metrics.map(m => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #141414' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#888' }}>{m.label}</div>
                      <div style={{ fontSize: 9, color: '#3a3a3a', marginTop: 1 }}>{m.sub}</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#555', flexShrink: 0, marginLeft: 8 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={shared.card} style={{ marginBottom: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-clipboard-check" /> Admin Health</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {ADMIN_METRICS.map((m, i) => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < 3 ? '1px solid #111' : undefined, borderRight: i % 3 !== 2 ? '1px solid #111' : undefined }}>
                <i className={`fas ${m.icon}`} style={{ color: m.color, fontSize: 16, width: 18, textAlign: 'center', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#666', lineHeight: 1 }}>{m.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isBattalion && (BN_SUBORDINATES[unitKey] ?? []).length > 0 && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-sitemap" /> Subordinate Unit Readiness</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Assigned</th>
                    <th>Fill %</th>
                    <th>ND</th>
                    <th>METL T</th>
                    <th>FMC %</th>
                    <th>DTMS %</th>
                    <th>Admin !</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(BN_SUBORDINATES[unitKey] ?? []).map(co => (
                    <tr key={co.key} style={{ cursor: 'pointer' }} onClick={() => onNavigate?.(co.key)}>
                      <td style={{ fontWeight: 700, color: '#ccc' }}>{co.label}</td>
                      <td><P /></td><td><P /></td><td><P /></td><td><P /></td>
                      <td><P /></td><td><P /></td><td><P /></td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#333' }} />
                      </td>
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

  // ── REPORTS ───────────────────────────────────────────────────────────────
  if (subPage === 'reports') {
    const UNIT_REPORTS = [
      { id: 'perstat',    title: 'PERSTAT',                   desc: 'Daily personnel accountability report submitted to higher.' },
      { id: 'msr',        title: 'Manning Status Report',      desc: 'Authorized vs. assigned fill by position (UMR).' },
      { id: 'mcsr',       title: "Commander's Strength Report", desc: 'Monthly strength report submitted to higher HQ.' },
      { id: 'da2406',     title: 'DA 2406 Equipment Status',   desc: 'PMCS and equipment readiness by line number.' },
      { id: 'trng-sched', title: 'Training Schedule',          desc: '8-week training schedule and METL task coverage.' },
      { id: 'sitrep',     title: 'SITREP',                    desc: 'Periodic situation report to higher headquarters.' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Unit Standard Reports</div>
          {UNIT_REPORTS.map(rpt => (
            <div key={rpt.id} className={styles.reportRow}>
              <div className={styles.reportInfo}>
                <div className={styles.reportTitle}>{rpt.title}</div>
                <div className={styles.reportDesc}>{rpt.desc}</div>
              </div>
              <div className={styles.reportActions}>
                <button className={styles.btnSecondary}><i className="fas fa-download" /> Export</button>
                <button className={styles.btnPrimary}><i className="fas fa-eye" /> View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── TRACKERS ──────────────────────────────────────────────────────────────
  if (subPage === 'trackers') {
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader}><i className="fas fa-calendar-exclamation" /> Admin Suspenses</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Soldier</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th></tr></thead>
              <tbody>{placeholderRows(5, 5)}</tbody>
            </table>
          </div>
        </div>
        <div className={shared.card} style={{ marginBottom: 16 }}>
          <div className={shared.cardHeader}><i className="fas fa-umbrella-beach" /> Leave Tracker</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Soldier</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th></tr></thead>
              <tbody>{placeholderRows(3, 6)}</tbody>
            </table>
          </div>
        </div>
        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-clock" /> ETS / DEROS (90-60-30 Window)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Soldier</th><th>Rank</th><th>ETS Date</th><th>Days Out</th><th>Status</th></tr></thead>
              <tbody>{placeholderRows(3, 5)}</tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── REQUESTS ──────────────────────────────────────────────────────────────
  if (subPage === 'requests') {
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.card}>
          <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><i className="fas fa-list-alt" /> Pending Requests</span>
            <button className={styles.btnPrimary}><i className="fas fa-plus" /> Add Request</button>
          </div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>Soldier</th><th>Request Type</th><th>Submitted</th><th>Due</th><th>Status</th><th>POC</th></tr></thead>
              <tbody>{placeholderRows(4, 6)}</tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── RESOURCES ─────────────────────────────────────────────────────────────
  if (subPage === 'resources') {
    return (
      <div className={shared.page}>
        {pageHeader}
        <div className={shared.grid2}>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-bookmark" /> Quick Reference</div>
            <div className={shared.cardBody}>
              <dl className={shared.dl}>
                <dt>Unit SOP</dt>          <dd><P /></dd>
                <dt>Training Calendar</dt> <dd><P /></dd>
                <dt>Equipment SOP</dt>     <dd><P /></dd>
                <dt>Comms Plan</dt>        <dd><P /></dd>
                <dt>Recall Roster</dt>     <dd><P /></dd>
              </dl>
            </div>
          </div>
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-address-book" /> Key Contacts</div>
            <div className={shared.cardBody}>
              <dl className={shared.dl}>
                <dt>Commander</dt> <dd><P /></dd>
                <dt>XO</dt>       <dd><P /></dd>
                <dt>1SG</dt>      <dd><P /></dd>
                <dt>S3 POC</dt>   <dd><P /></dd>
                <dt>S4 POC</dt>   <dd><P /></dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── TRAIN ─────────────────────────────────────────────────────────────────
  if (subPage === 'train') {
    const trainStats = [
      { label: 'METL Tasks (T)',    value: '—', bg: '#0e1e13' },
      { label: 'METL Tasks (P)',    value: '—', bg: '#1e1a0e' },
      { label: 'METL Tasks (U)',    value: '—', bg: '#1e0e0e' },
      { label: 'Events (MTD)',      value: '—', bg: '#2d2d2d' },
      { label: 'DTMS Compliance',   value: '—', bg: '#2d2d2d' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {subStub ?? (
          <>
            <div className={shared.stats}>
              {trainStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-crosshairs" /> METL Status</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Task #</th><th>Task Title</th><th>Standard</th><th>Last Assessed</th><th>Rating</th></tr></thead>
                  <tbody><EmptyTableState cols={5} icon="fa-link" label="DTMS not connected" hint="Connect DTMS to populate METL tasks" /></tbody>
                </table>
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Upcoming Training Events</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Tasks Trained</th><th>Resources</th><th>Status</th></tr></thead>
                  <tbody><EmptyTableState cols={6} icon="fa-calendar" label="No events scheduled" hint="Training events appear here once imported from the training schedule" /></tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── MAN ───────────────────────────────────────────────────────────────────
  if (subPage === 'man') {
    const manStats = [
      { label: 'Authorized', value: '—', bg: '#2d2d2d' },
      { label: 'Assigned',   value: '—', bg: '#2d2d2d' },
      { label: 'Fill Rate',  value: '—', bg: '#2d2d2d' },
      { label: 'Key Billets',value: '—', bg: '#2d2d2d' },
      { label: 'Vacancies',  value: '—', bg: '#1e0e0e' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {subStub ?? (
          <>
            <div className={shared.stats}>
              {manStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-th-list" /> Key Billet Fill</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Position</th><th>Grade</th><th>MOS</th><th>Assigned</th><th>Status</th></tr></thead>
                  <tbody><EmptyTableState cols={5} icon="fa-link" label="IPPSA not connected" hint="Connect IPPSA to populate billet fill data" /></tbody>
                </table>
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-users" /> Personnel Roster</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Name</th><th>Rank</th><th>MOS</th><th>Position</th><th>Med</th><th>ETS</th></tr></thead>
                  <tbody><EmptyTableState cols={6} icon="fa-address-book" label="Roster not yet imported" hint="Personnel appear here once IPPSA sync is established" /></tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── EQUIP ─────────────────────────────────────────────────────────────────
  if (subPage === 'equip') {
    const equipStats = [
      { label: 'LINs on Hand',  value: '—', bg: '#2d2d2d' },
      { label: 'FMC',           value: '—', bg: '#0e1e13' },
      { label: 'NMC',           value: '—', bg: '#1e0e0e' },
      { label: 'Open Work Orders', value: '—', bg: '#1e1a0e' },
      { label: 'PMCS Overdue',  value: '—', bg: '#2d2d2d' },
    ]
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {subStub ?? (
          <>
            <div className={shared.stats}>
              {equipStats.map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-tools" /> Equipment Readiness (DA 2406)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>NSN / LIN</th><th>Nomenclature</th><th>Qty Auth</th><th>Qty OH</th><th>FMC</th><th>NMC</th><th>Status</th></tr></thead>
                  <tbody><EmptyTableState cols={7} icon="fa-link" label="GCSS-Army not connected" hint="Equipment readiness data populates once GCSS-Army sync is established" /></tbody>
                </table>
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-wrench" /> Open Work Orders</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>WO #</th><th>Equipment</th><th>Fault</th><th>Opened</th><th>Priority</th><th>Status</th></tr></thead>
                  <tbody><EmptyTableState cols={6} icon="fa-check-circle" label="No open work orders" hint="Active maintenance work orders appear here" /></tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── COP ───────────────────────────────────────────────────────────────────
  if (subPage === 'cop') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {subStub ?? (
          <>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-map-marked-alt" /> Common Operating Picture</div>
              <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#555', fontSize: 13 }}>
                <i className="fas fa-map" style={{ fontSize: 40, display: 'block', marginBottom: 12, color: '#1a1a1a' }} />
                <strong style={{ color: '#333', display: 'block', marginBottom: 6 }}>Map / Situation Layer</strong>
                <span style={{ fontSize: 11 }}>COP display pending data integration</span>
              </div>
            </div>

            <div className={shared.grid2}>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-chess" /> Friendly Forces</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Element</th><th>Location</th><th>Status</th><th>Mission</th></tr></thead>
                    <tbody>{placeholderRows(4, 4)}</tbody>
                  </table>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-list-ol" /> Current Tasks</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Task</th><th>Assigned</th><th>Purpose</th><th>Status</th></tr></thead>
                    <tbody>{placeholderRows(4, 4)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── SITREP ────────────────────────────────────────────────────────────────
  if (subPage === 'sitrep') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {subStub ?? (
          <>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><i className="fas fa-broadcast-tower" /> Current SITREP</span>
                <button className={styles.btnPrimary}><i className="fas fa-paper-plane" /> Submit SITREP</button>
              </div>
              <div className={shared.cardBody}>
                {([
                  ['DTG',              'Date-time group of report'],
                  ['Unit',             'Reporting unit designation and UIC'],
                  ['Location',         'Current unit location / grid'],
                  ['Situation (BLUE)', 'Friendly situation, tasks, and status'],
                  ['Situation (RED)',  'Enemy / threat situation'],
                  ['Personnel Status', 'PERSTAT — assigned / present / casualties'],
                  ['Equipment Status', 'FMC / NMC count and critical shortfalls'],
                  ['Training Status',  'Current METL rating and upcoming events'],
                  ['Logistics',        'Class I/III/V status, resupply requirements'],
                  ["Commander's Intent", "Current commander's intent and priorities"],
                ] as [string, string][]).map(([field, desc]) => (
                  <div key={field} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '7px 0', borderBottom: '1px solid #1a1a1a' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ccc', width: 180, flexShrink: 0 }}>{field}</span>
                    <span style={{ fontSize: 11, color: '#444', lineHeight: 1.4 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-history" /> SITREP History</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>DTG</th><th>Submitted By</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{placeholderRows(5, 4)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── ADM-PEOPLE (0) ────────────────────────────────────────────────────────
  if (subPage === 'adm-people') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.stats} style={{ marginBottom: 16 }}>
              {[
                { label: 'Assigned',       value: '—', bg: '#2d2d2d' },
                { label: 'Gains 30-Day',   value: '—', bg: '#0e1e13' },
                { label: 'Losses 30-Day',  value: '—', bg: '#1e0e0e' },
                { label: 'Non-Deployable', value: '—', bg: '#1e1a0e' },
              ].map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-address-book" /> Unit Roster (Source: IPPSA)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Grade</th><th>Name</th><th>MOS</th><th>Position</th><th>Med</th><th>AFT</th><th>ETS</th></tr></thead>
                  <tbody>{placeholderRows(10, 7)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'roster') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-address-book" /> Full Unit Roster (Source: IPPSA)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Grade</th><th>Name</th><th>MOS</th><th>Position</th><th>Section</th><th>Med</th><th>AFT</th><th>ETS</th></tr></thead>
                  <tbody>{placeholderRows(12, 8)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'counseling') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-alt" /> Counseling Records (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Type</th><th>Date</th><th>Counselor</th><th>Status</th><th>Next Due</th></tr></thead>
                  <tbody>{placeholderRows(8, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'in-proc') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-sign-in-alt" /> In-Processing Pipeline (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>Report Date</th><th>Step</th><th>Status</th><th>POC</th></tr></thead>
                  <tbody>{placeholderRows(4, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'out-proc') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-sign-out-alt" /> Out-Processing / ETS Tracker (Source: IPPSA)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>ETS / DEROS</th><th>Type</th><th>Step</th><th>Status</th><th>POC</th></tr></thead>
                  <tbody>{placeholderRows(4, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'awards') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-medal" /> Awards Pipeline (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Award</th><th>Submitted</th><th>Approver</th><th>Status</th><th>Est. Presentation</th></tr></thead>
                  <tbody>{placeholderRows(5, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'promotions') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-arrow-circle-up" /> Promotion Eligibility (Source: IPPSA)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>MOS</th><th>TIS</th><th>TIG</th><th>Eligible</th><th>Board</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(6, 8)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'leave') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-calendar-check" /> Leave Records (Source: IPPSA)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th><th>Approver</th></tr></thead>
                  <tbody>{placeholderRows(8, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          return null
        })()}
      </div>
    )
  }

  // ── ADM-TASKS (1) ─────────────────────────────────────────────────────────
  if (subPage === 'adm-tasks') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.stats} style={{ marginBottom: 16 }}>
              {[
                { label: 'Open Tasks',    value: '—', bg: '#2d2d2d' },
                { label: 'Due This Week', value: '—', bg: '#1e1a0e' },
                { label: 'Overdue',       value: '—', bg: '#1e0e0e' },
                { label: 'Completed MTD', value: '—', bg: '#0e1e13' },
              ].map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-tasks" /> Unit Task List (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Priority</th><th>Task</th><th>Owner</th><th>Due</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(8, 6)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'new-task') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-plus" /> New Task</div>
              <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555', fontSize: 12 }}>
                <i className="fas fa-edit" style={{ fontSize: 24, display: 'block', marginBottom: 10, color: '#2a2a2a' }} />
                Task creation form — pending THREADS integration
              </div>
            </div>
          )
          if (fnSubTab === 'my-tasks') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-user-check" /> My Tasks (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Priority</th><th>Task</th><th>Assigned By</th><th>Due</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(5, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'all-tasks') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-list" /> All Tasks (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Priority</th><th>Task</th><th>Owner</th><th>Due</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(10, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'priority') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-exclamation-triangle" /> Priority Tasks (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Priority</th><th>Task</th><th>Owner</th><th>Due</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(4, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'completed') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-check-double" /> Completed Tasks (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Task</th><th>Owner</th><th>Completed</th><th>Verified By</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(6, 5)}</tbody>
                </table>
              </div>
            </div>
          )
          return null
        })()}
      </div>
    )
  }

  // ── ADM-SECURITY (2) ──────────────────────────────────────────────────────
  if (subPage === 'adm-security') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Clearance Status (Source: DISS / SARM)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>Clearance</th><th>Granted</th><th>Expires</th><th>Status</th></tr></thead>
                  <tbody>{placeholderRows(10, 6)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-eye-slash" /> OPSEC Reminders</div>
              <div className={shared.cardBody}>
                {[
                  'No unauthorized disclosure of unit location, manning, or equipment to uncleared personnel',
                  'Verify clearance before discussing classified material — use DISS / JPAS to confirm',
                  'Encrypt all sensitive PII transmitted via email (CAC-signed or S/MIME)',
                  'Report suspected security violations to the unit SSO and chain of command immediately',
                  'Social media: no unit photos, grid coordinates, mission timelines, or force packages',
                  'Annual OPSEC training requirement tracked in DTMS — report compliance to S2',
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
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'clearances') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Clearance Detail (Source: DISS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>Clearance</th><th>Access</th><th>Granted</th><th>PR Due</th><th>Status</th><th>Adjudicated By</th></tr></thead>
                  <tbody>{placeholderRows(10, 8)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'persec') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-user-shield" /> PERSEC Suspenses (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(6, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'opsec') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-eye-slash" /> OPSEC Indicators (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Severity</th><th>Indicator</th><th>Identified By</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>{placeholderRows(5, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'access-log') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-contract" /> Access Log (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Date</th><th>Soldier</th><th>Clearance</th><th>Area</th><th>Action</th><th>Auth By</th></tr></thead>
                  <tbody>{placeholderRows(8, 6)}</tbody>
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
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-drum" /> Battle Rhythm (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Event</th><th>Cadence</th><th>Owner</th><th>Next Date</th><th>Location</th><th>Purpose</th></tr></thead>
                  <tbody>{placeholderRows(6, 6)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-list-ol" /> Work Priorities</div>
              <div className={shared.cardBody}>
                {[
                  'Maintain individual and collective training readiness at or above T standard',
                  'Sustain 90%+ equipment FMC rate across all organic systems',
                  'Zero overdue counseling, awards, and promotion actions',
                  'Complete all required administrative suspenses on time',
                  'Maintain accountability of all personnel and equipment 100% of the time',
                ].map((item, i) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '8px 0', borderBottom: '1px solid #141414', fontSize: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#c9a227', width: 24, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ color: '#888', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'battle-rhythm') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-drum" /> Battle Rhythm (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Event</th><th>Cadence</th><th>Owner</th><th>Next Date</th><th>Location</th><th>Purpose</th><th>Classification</th></tr></thead>
                  <tbody>{placeholderRows(8, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'priorities') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-list-ol" /> Commander's Priorities</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>#</th><th>Priority</th><th>Metric</th><th>Current</th><th>Target</th><th>Owner</th></tr></thead>
                  <tbody>{placeholderRows(5, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'suspenses') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-bell" /> Admin Suspenses (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(8, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'daily-ops') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-sun" /> Daily Operations Status</div>
              <div className={shared.cardBody}>
                {[
                  { task: 'PERSTAT submitted to BN S1',     time: '0600', status: 'Pending', owner: '1SG / PSG'  },
                  { task: 'Morning formation accountability', time: '0630', status: 'Pending', owner: 'PLT LDRs'  },
                  { task: 'Equipment readiness report',       time: '0800', status: 'Pending', owner: 'Motor Sgt' },
                  { task: 'Training schedule execution',      time: '0900', status: 'Pending', owner: 'PSGs'      },
                  { task: 'End of day formation',             time: '1630', status: 'Pending', owner: 'All PLT'   },
                  { task: 'Admin suspense review',            time: '1700', status: 'Pending', owner: '1SG'       },
                ].map((item, i) => {
                  const sc = item.status === 'Complete' ? '#27ae60' : '#c9a227'
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: '1px solid #141414' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', width: 40, flexShrink: 0 }}>{item.time}</span>
                      <span style={{ flex: 1, fontSize: 12, color: '#ccc' }}>{item.task}</span>
                      <span style={{ fontSize: 11, color: '#555' }}>{item.owner}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: `${sc}22`, color: sc }}>{item.status}</span>
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
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.stats} style={{ marginBottom: 16 }}>
              {[
                { label: 'Property Lines',   value: '—', bg: '#2d2d2d' },
                { label: 'FMC Rate',         value: '—', bg: '#0e1e13' },
                { label: 'Open Work Orders', value: '—', bg: '#1e1a0e' },
                { label: 'OCIE Overdue',     value: '—', bg: '#1e0e0e' },
              ].map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-boxes" /> Property Book (Source: GCSS-Army)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>LIN</th><th>NSN</th><th>Nomenclature</th><th>Auth</th><th>On-Hand</th><th>Shortfall</th><th>Condition</th><th>Flag</th></tr></thead>
                  <tbody>{placeholderRows(8, 8)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-info-circle" /> Sustainment SLA Reference</div>
              <div className={shared.cardBody}>
                {[
                  ['DTS Voucher',          'Within 5 business days of TDY return (DoDFMR Vol 9, Ch 5 §050502)'],
                  ['OCIE Inventory',       'Annual signature required per AR 710-2 and CTA 50-900'],
                  ['DA 2062 Hand Receipt', '180-day sub-hand receipt expiration — must renew or return property'],
                  ['GTCC Training',        'Annual renewal via TraX ALMS — APC manages account changes'],
                  ['PMCS Schedule',        'Per DA Pam 750-8 — before, during, after operations + weekly/monthly'],
                ].map(([title, note]) => (
                  <div key={title as string} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #141414', fontSize: 11 }}>
                    <span style={{ color: '#888', fontWeight: 700, width: 200, flexShrink: 0 }}>{title as string}</span>
                    <span style={{ color: '#555', lineHeight: 1.4 }}>{note as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'dts-travel') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-plane" /> DTS Travel Authorizations (Source: DTS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Auth #</th><th>Soldier</th><th>Purpose</th><th>Depart</th><th>Return</th><th>Est. Cost</th><th>Auth Status</th><th>Voucher Status</th></tr></thead>
                  <tbody>{placeholderRows(5, 8)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'gtcc') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-credit-card" /> GTCC Card Registry (Source: GSA SmartPay)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Last 4</th><th>Status</th><th>Balance</th><th>Training Expiry</th><th>SOU Date</th><th>Delinquent</th></tr></thead>
                  <tbody>{placeholderRows(6, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'equipment') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-tools" /> Equipment / Property Book (Source: GCSS-Army)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>LIN</th><th>NSN</th><th>Nomenclature</th><th>Auth</th><th>On-Hand</th><th>Shortfall</th><th>Condition</th><th>Last Inventory</th><th>Flag</th></tr></thead>
                  <tbody>{placeholderRows(10, 9)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'da-2062') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> DA Form 2062 — Hand Receipts (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Form #</th><th>Nomenclature</th><th>Assigned To</th><th>Effective</th><th>Expires</th><th>Status</th><th>Attached File</th></tr></thead>
                  <tbody>{placeholderRows(8, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          return null
        })()}
      </div>
    )
  }

  // ── ADM-PLANS (5) ─────────────────────────────────────────────────────────
  if (subPage === 'adm-plans') {
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Training Long-Range Calendar</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Prep Due</th><th>Owner</th></tr></thead>
                  <tbody>{placeholderRows(6, 5)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-redo" /> Recurring Annual Suspenses</div>
              <div className={shared.cardBody}>
                {[
                  'NCOER rating cycle — initiate support forms 90 days prior to rating period end',
                  'ACFT testing windows — coordinate with higher for range and scorer availability',
                  'Annual Weapons Qualification — ammunition request due 60 days prior',
                  'Command Climate Survey — annual, coordinate with Commander and IG',
                  'DD93 / SGLV review — semi-annual verification for all assigned personnel',
                  'Records Brief (ORB/ERB) — semi-annual update prior to any PCS or board',
                  'SARM / clearance renewals — initiate PR 90 days before expiration date',
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
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'lr-calendar') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Long-Range Calendar (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Prep Due</th><th>Owner</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(8, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'annual-susp') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-redo" /> Recurring Annual Suspenses</div>
              <div className={shared.cardBody}>
                {[
                  ['Jan',     'NCOER rating cycle brief — initiate support forms 90 days prior to rating period end'],
                  ['Mar/Sep', 'ACFT testing windows — coordinate with higher HQ for range and certification'],
                  ['Apr',     'Command Climate Survey — annual, coordinate with Commander and IG'],
                  ['Jun',     'Semi-annual DD93/SGLV review — verify all assigned personnel'],
                  ['Jun',     'Semi-annual records brief (ORB/ERB) update — prior to any PCS or board'],
                  ['Ongoing', 'SARM clearance renewals — initiate PR 90 days before expiration'],
                  ['Ongoing', 'Weapons qualification — ammunition request 60 days prior to window'],
                ].map(([period, item]) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '8px 0', borderBottom: '1px solid #141414', fontSize: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#c9a227', width: 60, flexShrink: 0 }}>{period}</span>
                    <span style={{ color: '#888', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )
          if (fnSubTab === 'planning') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-project-diagram" /> Unit Planning Factors</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Factor</th><th>Detail</th><th>Impact Area</th></tr></thead>
                  <tbody>{placeholderRows(6, 3)}</tbody>
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
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-address-book" /> Unit Contact Roster (Source: IPPSA / THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Grade</th><th>Name</th><th>MOS</th><th>Position</th><th>Phone</th><th>Email</th></tr></thead>
                  <tbody>{placeholderRows(8, 6)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-phone-alt" /> Key External Contacts</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Organization</th><th>POC</th><th>Role</th><th>Phone</th><th>Email</th><th>Notes</th></tr></thead>
                  <tbody>
                    {['BN S1 / Higher S1', 'Group S3', 'Brigade Fire Support', 'MEDIC / BAS', 'Maintenance Control'].map(org => (
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
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'contact-roster') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-address-book" /> Unit Contact Roster (Source: IPPSA)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Grade</th><th>Name</th><th>MOS</th><th>Position</th><th>Phone</th><th>Email</th><th>ETS</th></tr></thead>
                  <tbody>{placeholderRows(12, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'ext-contacts') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-phone-alt" /> External Contacts (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Organization</th><th>POC</th><th>Role</th><th>Phone</th><th>Email</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(8, 6)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'message-log') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-envelope" /> Message Log (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Date</th><th>From</th><th>Subject</th><th>Priority</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(8, 7)}</tbody>
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
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.stats} style={{ marginBottom: 16 }}>
              {[
                { label: 'Current',    value: '—', bg: '#0e1e13' },
                { label: 'Due 30-Day', value: '—', bg: '#1e1a0e' },
                { label: 'Overdue',    value: '—', bg: '#1e0e0e' },
                { label: 'N/A',        value: '—', bg: '#2d2d2d' },
              ].map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Unit Training Status (Source: DTMS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>AFT Date</th><th>AFT Score</th><th>AFT Status</th><th>CFT Date</th><th>CFT Grade</th></tr></thead>
                  <tbody>{placeholderRows(10, 7)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-crosshairs" /> Unit METL Tasks</div>
              <div className={shared.cardBody}>
                {[
                  'Conduct direct action operations (CT, SR, DA, FID, COIN)',
                  'Execute foreign internal defense with partner force',
                  'Plan and conduct special reconnaissance missions',
                  'Conduct personnel recovery operations',
                  'Execute unconventional warfare activities',
                  'Maintain individual MOS-T / weapons qualifications',
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
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'requirements') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Training Requirements — AFT & CFT (Source: DTMS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>AFT Date</th><th>AFT Score</th><th>AFT Status</th><th>CFT Date</th><th>CFT Grade</th></tr></thead>
                  <tbody>{placeholderRows(12, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'metl') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-crosshairs" /> Unit METL Assessment</div>
              <div className={shared.cardBody}>
                {[
                  ['Conduct direct action operations', 'T'],
                  ['Execute foreign internal defense with partner force', 'P'],
                  ['Plan and conduct special reconnaissance', 'T'],
                  ['Conduct personnel recovery', 'P'],
                  ['Execute unconventional warfare', 'U'],
                  ['Maintain individual MOS qualifications', 'T'],
                ].map(([task, rating]) => {
                  const rc = rating === 'T' ? '#27ae60' : rating === 'P' ? '#c9a227' : '#e74c3c'
                  return (
                    <div key={task} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid #141414' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 7px', borderRadius: 3, background: `${rc}22`, color: rc, flexShrink: 0 }}>{rating}</span>
                      <span style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{task}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
          if (fnSubTab === 'certs') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-certificate" /> Certifications & Qualifications (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Soldier</th><th>Rank</th><th>Certification</th><th>Completed</th><th>Expires</th><th>Status</th><th>Issuing Org</th></tr></thead>
                  <tbody>{placeholderRows(10, 7)}</tbody>
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
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Execution (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Program</th><th>Authorization</th><th>Obligated</th><th>Expended</th><th>Balance</th><th>%</th></tr></thead>
                  <tbody>{placeholderRows(4, 6)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-boxes" /> Property Book (Source: GCSS-Army)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Item</th><th>LIN</th><th>NSN</th><th>Auth</th><th>On-Hand</th><th>Shortfall</th><th>Condition</th><th>Last Inventory</th><th>Flag</th></tr></thead>
                  <tbody>{placeholderRows(8, 9)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'budget') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Execution (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Program</th><th>FY Period</th><th>Authorization</th><th>Obligated</th><th>Expended</th><th>Balance</th><th>Exec %</th></tr></thead>
                  <tbody>{placeholderRows(5, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'property') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-boxes" /> Property Book (Source: GCSS-Army)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Item</th><th>LIN</th><th>NSN</th><th>Auth</th><th>On-Hand</th><th>Shortfall</th><th>Condition</th><th>Last Inv.</th><th>Flag</th></tr></thead>
                  <tbody>{placeholderRows(10, 9)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'requests') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-file-invoice" /> Resource Requests (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Req #</th><th>Item</th><th>Type</th><th>Submitted</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(5, 7)}</tbody>
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
    return (
      <div className={shared.page}>
        {pageHeader}
        {quickNav}
        {fnSubTab === 'summary' && (
          <>
            <div className={shared.stats} style={{ marginBottom: 16 }}>
              {[
                { label: 'Open Coord Requests', value: '—', bg: '#2d2d2d' },
                { label: 'Pending Response',     value: '—', bg: '#1e1a0e' },
                { label: 'Completed',            value: '—', bg: '#0e1e13' },
                { label: 'Overdue',              value: '—', bg: '#1e0e0e' },
              ].map(s => (
                <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                  <div className={shared.statValue}>{s.value}</div>
                  <div className={shared.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-project-diagram" /> Coordination Tracker (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Date</th><th>Request</th><th>Requesting Element</th><th>POC</th><th>Status</th><th>Due Date</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(4, 7)}</tbody>
                </table>
              </div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-users" /> Key Rep Contacts (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Organization</th><th>Rep Name</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
                  <tbody>{placeholderRows(4, 5)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {fnSubTab !== 'summary' && (() => {
          if (fnSubTab === 'coord-tracker') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-project-diagram" /> Coordination Tracker (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Date</th><th>Request</th><th>Requesting Element</th><th>POC</th><th>Status</th><th>Due</th><th>Notes</th></tr></thead>
                  <tbody>{placeholderRows(8, 7)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'key-contacts') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-users" /> Key Representative Contacts (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Organization</th><th>Rep Name</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
                  <tbody>{placeholderRows(6, 5)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'deconflict') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-handshake" /> Deconfliction Log (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Date</th><th>Issue</th><th>Resolved By</th><th>Status</th><th>Action Taken</th></tr></thead>
                  <tbody>{placeholderRows(5, 5)}</tbody>
                </table>
              </div>
            </div>
          )
          if (fnSubTab === 'sync-log') return (
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
              <div className={shared.tableWrap}>
                <table className={shared.table}>
                  <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                  <tbody>{placeholderRows(5, 5)}</tbody>
                </table>
              </div>
            </div>
          )
          return null
        })()}
      </div>
    )
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  return (
    <div className={shared.page}>
      {pageHeader}
      <div className={shared.card}>
        <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#555' }}>
          <i className="fas fa-hard-hat" style={{ fontSize: 28, display: 'block', marginBottom: 12, color: '#1a1a1a' }} />
          <span style={{ fontSize: 12 }}>{subPage} — under construction</span>
        </div>
      </div>
    </div>
  )
}
