import styles from './SectionSidebar.module.css'
import { useUser } from '../../UserContext'

interface Props {
  sectionKey: string
  sectionLabel: string
  subPage: string
  onNavigate: (page: string) => void
}

interface NavItem { key: string; label: string }

const EXTERNAL_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'reports',   label: 'Reports'   },
  { key: 'trackers',  label: 'Trackers'  },
  { key: 'requests',  label: 'Requests'  },
  { key: 'resources', label: 'Resources' },
]

const ADMIN_ITEMS: (NavItem & { num: string })[] = [
  { num: '0', key: 'adm-people',      label: 'People'        },
  { num: '1', key: 'adm-tasks',       label: 'Tasks'         },
  { num: '2', key: 'adm-security',    label: 'Security'      },
  { num: '3', key: 'adm-operations',  label: 'Operations'    },
  { num: '4', key: 'adm-sustainment', label: 'Sustainment'   },
  { num: '5', key: 'adm-plans',       label: 'Plans'         },
  { num: '6', key: 'adm-comms',       label: 'Comms'         },
  { num: '7', key: 'adm-training',    label: 'Training'      },
  { num: '8', key: 'adm-resources',   label: 'Resources'     },
  { num: '9', key: 'adm-coord',       label: 'Coordinations' },
]

// Internal functions per section type — these are the core shop functions
const INTERNAL_FUNCTIONS: Record<string, NavItem[]> = {
  j1: [
    { key: 'awards',        label: 'Awards'        },
    { key: 'casualty',      label: 'Casualty'      },
    { key: 'actions',       label: 'Actions'       },
    { key: 'promotions',    label: 'Promotions'    },
    { key: 'reassignments', label: 'Reassignments' },
    { key: 'leave',         label: 'Leave'         },
    { key: 'evaluation',    label: 'Evaluation'    },
    { key: 'pay',           label: 'Pay'           },
  ],
  j2: [
    { key: 'clearances',        label: 'Clearances'        },
    { key: 'foreign-travel',    label: 'Foreign Travel'    },
    { key: 'security-training', label: 'Security Training' },
    { key: 'physical-security', label: 'Physical Security' },
    { key: 'ci-awareness',      label: 'CI Awareness'      },
    { key: 'comsec',            label: 'COMSEC'            },
  ],
  j3: [
    { key: 'orders',        label: 'Plans & Orders'        },
    { key: 'opord',         label: 'OPORD Development'     },
    { key: 'battle-staff',  label: 'Battle Staff'          },
    { key: 'readiness',     label: 'Readiness'             },
    { key: 'risk-mgmt',     label: 'Risk Management'       },
  ],
  j4: [
    { key: 'supply',        label: 'Supply Operations'     },
    { key: 'maintenance',   label: 'Maintenance'           },
    { key: 'transportation',label: 'Transportation'        },
    { key: 'property-book', label: 'Property Book'         },
    { key: 'class-requests',label: 'Class Requests'        },
  ],
  j5: [
    { key: 'campaign-plan', label: 'Campaign Planning'     },
    { key: 'conplan',       label: 'CONPLAN'               },
    { key: 'mdmp',          label: 'MDMP'                  },
    { key: 'long-range',    label: 'Long-Range Calendar'   },
  ],
  j6: [
    { key: 'netops',        label: 'Network Operations'    },
    { key: 'comsec',        label: 'COMSEC / Crypto'       },
    { key: 'systems',       label: 'Systems Management'    },
    { key: 'equip-acct',    label: 'Equipment Accountability' },
    { key: 'help-desk',     label: 'Help Desk'             },
  ],
  j7: [
    { key: 'metl',          label: 'METL Assessment'       },
    { key: 'trng-schedule', label: 'Training Schedule'     },
    { key: 'aar',           label: 'After Action Reviews'  },
    { key: 'collective',    label: 'Collective Training'   },
    { key: 'individual',    label: 'Individual Training'   },
  ],
  j8: [
    { key: 'budget-exec',   label: 'Budget Execution'      },
    { key: 'pay-actions',   label: 'Pay Actions'           },
    { key: 'travel-dts',    label: 'Travel (DTS)'          },
    { key: 'audit',         label: 'Audit / Reconciliation'},
  ],
  j9: [
    { key: 'ca-ops',        label: 'CA Operations'         },
    { key: 'cmoc',          label: 'CMOC'                  },
    { key: 'ngo-coord',     label: 'NGO Coordination'      },
    { key: 'kle',           label: 'Key Leader Engagement' },
  ],
  med: [
    { key: 'sick-call',     label: 'Sick Call / Patient Care'  },
    { key: 'prev-med',      label: 'Preventive Medicine'       },
    { key: 'med-readiness', label: 'Medical Readiness'         },
    { key: 'aid-station',   label: 'Aid Station Operations'    },
    { key: 'immunizations', label: 'Immunizations'             },
  ],
  ss: [
    { key: 'surgeon',    label: 'Group Surgeon'    },
    { key: 'bn-surgeon', label: 'Bn Surgeon'       },
    { key: 'pa',         label: 'Physician Asst'   },
    { key: 'safety',     label: 'Safety Officer'   },
    { key: 'cbrn',       label: 'CBRN'             },
    { key: 'bn-safety',  label: 'Safety NCO'       },
    { key: 'sharp',      label: 'SHARP'            },
    { key: 'eo',         label: 'EO'               },
    { key: 'eeo-teams',  label: 'EEO Teams'        },
    { key: 'finance',    label: 'Finance'          },
    { key: 'retention',  label: 'Career Counselor' },
  ],
  'unit-command': [
    { key: 'cmd-readiness',  label: 'Readiness'           },
    { key: 'cmd-maint',      label: 'Maintenance'         },
    { key: 'cmd-supply',     label: 'Supply / Property'   },
    { key: 'cmd-training',   label: 'Training'            },
    { key: 'cmd-formations', label: 'Formations'          },
  ],
}

// SS entities for the overview sidebar — defined separately so it can evolve
// independently of INTERNAL_FUNCTIONS (which is shared with other rendering logic).
const SS_OVERVIEW_ENTITIES: NavItem[] = [
  { key: 'surgeon',          label: 'Group Surgeon'    },
  { key: 'pa',               label: 'Physician Asst'   },
  { key: 'safety',           label: 'Safety Officer'   },
  { key: 'cbrn',             label: 'CBRN'             },
  { key: 'bn-safety',        label: 'Safety NCO'       },
  { key: 'sharp',            label: 'SHARP'            },
  { key: 'at-team',          label: 'AT Team'          },
  { key: 'eo',               label: 'EO'               },
  { key: 'as-team',          label: 'AS Team'          },
  { key: 'eeo-teams',        label: 'EEO Team'         },
  { key: 'finance',          label: 'Finance'          },
  { key: 'retention',        label: 'Retention'        },
  { key: 'career-counselor', label: 'Career Counselor' },
]

const DEFAULT_INTERNAL: NavItem[] = [
  { key: 'functions', label: 'Functions' },
]

const SS_ENTITY_KEYS = ['career-counselor', 'eeo-teams', 'bn-safety', 'retention', 'as-team', 'at-team', 'surgeon', 'finance', 'safety', 'sharp', 'cbrn', 'pa', 'eo']

const SS_ENTITY_FUNCTIONS: Record<string, NavItem[]> = {
  surgeon:      [{ key: 'sick-call', label: 'Sick Call' }, { key: 'med-ready', label: 'Med Readiness' }, { key: 'profiles', label: 'Profiles' }, { key: 'bh-referrals', label: 'BH Referrals' }, { key: 'medevac', label: 'MEDEVAC' }],
  pa:           [{ key: 'sick-call', label: 'Sick Call' }, { key: 'profiles', label: 'Profiles' }, { key: 'immunize', label: 'Immunizations' }, { key: 'prev-med', label: 'Prev Medicine' }],
  safety:       [{ key: 'risk-assess', label: 'Risk Assess' }, { key: 'incidents', label: 'Incidents' }, { key: 'inspections', label: 'Inspections' }, { key: 'hazards', label: 'Hazards' }],
  cbrn:         [{ key: 'ipe-acct', label: 'IPE Acct' }, { key: 'cbrn-trng', label: 'CBRN Trng' }, { key: 'decon-plan', label: 'Decon Plan' }, { key: 'radcon', label: 'RADCON' }],
  'bn-safety':  [{ key: 'da285', label: 'DA 285 Log' }, { key: 'safety-trng', label: 'Safety Trng' }, { key: 'inspection', label: 'Inspections' }],
  sharp:             [{ key: 'case-mgmt', label: 'Case Mgmt' }, { key: 'advocacy', label: 'Advocacy' }, { key: 'sharp-trng', label: 'SHARP Trng' }, { key: 'ccs', label: 'CCS Results' }],
  'at-team':         [{ key: 'at-brief', label: 'AT Briefings' }, { key: 'vuln-assess', label: 'Vuln Assess' }, { key: 'at-plan', label: 'AT Plan' }, { key: 'incident-rpt', label: 'Incident Rpt' }],
  eo:                [{ key: 'complaints', label: 'EO Complaints' }, { key: 'eo-trng', label: 'EO Training' }, { key: 'cmd-climate', label: 'Cmd Climate' }, { key: 'annual-rpt', label: 'Annual Rpt' }],
  'as-team':         [{ key: 'case-log', label: 'Case Log' }, { key: 'referrals', label: 'Referrals' }, { key: 'testing', label: 'Drug Testing' }, { key: 'treatment', label: 'Treatment Status' }],
  'eeo-teams':       [{ key: 'eeo-cases', label: 'EEO Cases' }, { key: 'ra-requests', label: 'RA Requests' }, { key: 'md715', label: 'MD-715' }, { key: 'workforce', label: 'Workforce Data' }],
  finance:           [{ key: 'pay-actions', label: 'Pay Actions' }, { key: 'dts', label: 'DTS / Travel' }, { key: 'gtcc', label: 'GTCC' }, { key: 'budget', label: 'Budget Exec' }],
  retention:         [{ key: 'ets-tracker', label: 'ETS Tracker' }, { key: 'srb', label: 'SRB Eligible' }, { key: 'counseling', label: 'Counseling Log' }, { key: 'ret-board', label: 'Ret Board' }],
  'career-counselor':[{ key: 'counseling', label: 'Counseling' }, { key: 'reenlist', label: 'Reenlistment' }, { key: 'mos-options', label: 'MOS Options' }, { key: 'stats', label: 'Statistics' }],
}

const UNIT_FUNCTION_ITEMS: NavItem[] = [
  { key: 'train', label: 'Train' },
  { key: 'man',   label: 'Man'   },
  { key: 'equip', label: 'Equip' },
]

const UNIT_OPS_ITEMS: NavItem[] = [
  { key: 'cop',    label: 'COP'    },
  { key: 'sitrep', label: 'SITREP' },
]

const DIGITAL_SYNCS_NAV: { cadence: string; items: NavItem[] }[] = [
  { cadence: 'DAILY',     items: [
    { key: 'admin-review',      label: 'Admin Review'       },
    { key: 'operations-review', label: 'Operations Review'  },
  ]},
  { cadence: 'WEEKLY',    items: [
    { key: 'stand-up',   label: 'Stand Up'   },
    { key: 'close-out',  label: 'Close Out'  },
  ]},
  { cadence: 'MONTHLY',   items: [
    { key: 'operations-sync',  label: 'Operations Sync'     },
    { key: 'resource-sync',    label: 'Resource Sync'       },
    { key: 'staff-deep-dives', label: 'Staff Deep Dives'    },
    { key: 'working-group',    label: 'Working Group Forum' },
    { key: 'decision-forum',   label: 'Decision Forum'      },
  ]},
  { cadence: 'QUARTERLY', items: [
    { key: 'strategy-review',  label: 'Strategy Review'          },
    { key: 'leader-dev-forum', label: 'Leader Development Forum' },
  ]},
  { cadence: 'ANNUAL',    items: [
    { key: 'campaign-workshop', label: 'Campaign Workshop' },
    { key: 'budget-review',     label: 'Budget Review'     },
    { key: 'manning-review',    label: 'Manning Review'    },
  ]},
]

function getSectionPrefix(key: string): string {
  const m = key.match(/^j([1-9])$/)
  if (m) return `S${m[1]}`
  if (key === 'med') return 'MED'
  if (key === 'ss') return 'SS'
  if (key === 'unit-command') return 'CO'
  if (key === 'unit-grp-hhc') return 'HHC'
  if (key === 'unit-gsb') return 'GSB'
  if (key.startsWith('unit-gsb-')) return key.replace('unit-gsb-', 'GSB/').toUpperCase()
  if (key.match(/^unit-[123]bn$/)) return key.replace('unit-', '').toUpperCase()
  if (key.match(/^unit-[123]bn-/)) {
    return key.split('-')[2].toUpperCase()
  }
  return key.toUpperCase()
}

export default function SectionSidebar({ sectionKey, sectionLabel, subPage, onNavigate }: Props) {
  const internalFns = INTERNAL_FUNCTIONS[sectionKey] ?? DEFAULT_INTERNAL
  const prefix      = getSectionPrefix(sectionKey)

  const ssEntityKey  = sectionKey === 'ss' ? SS_ENTITY_KEYS.find(k => subPage === k || subPage.startsWith(k + '-')) : undefined
  const ssEntityFns  = ssEntityKey ? SS_ENTITY_FUNCTIONS[ssEntityKey] : undefined
  const ssEntityFnKey = ssEntityKey && subPage !== ssEntityKey ? subPage.slice(ssEntityKey.length + 1) : 'overview'

  function go(sub: string) {
    const page = sub === 'overview' ? sectionKey : `${sectionKey}-${sub}`
    onNavigate(page)
  }

  function active(sub: string) {
    return subPage === sub
  }

  if (sectionKey === 'digital-syncs') {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sectionTitle}>Digital Syncs</div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${active('overview') ? styles.active : ''}`}
            onClick={() => go('overview')}
          >
            Overview
          </button>
          {DIGITAL_SYNCS_NAV.map(group => (
            <div key={group.cadence}>
              <div className={styles.groupLabel}>{group.cadence}</div>
              {group.items.map(item => (
                <button
                  key={item.key}
                  className={`${styles.navItem} ${styles.sub} ${active(item.key) ? styles.active : ''}`}
                  onClick={() => go(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    )
  }

  if (sectionKey === 'ss' && ssEntityKey && ssEntityFns) {
    const entityLabel = SS_OVERVIEW_ENTITIES.find(e => e.key === ssEntityKey)?.label ?? ssEntityKey
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sectionTitle}>{sectionLabel}</div>
        <nav className={styles.nav}>
          <button className={styles.navItem} onClick={() => onNavigate('ss')}>
            <i className="fas fa-chevron-left" style={{ fontSize: 9, marginRight: 6, opacity: 0.5 }} />
            All Entities
          </button>
          <button
            className={`${styles.navItem} ${ssEntityFnKey === 'overview' ? styles.active : ''}`}
            onClick={() => onNavigate(`ss-${ssEntityKey}`)}
          >
            {entityLabel}
          </button>
          <div className={styles.groupLabel}>External</div>
          {EXTERNAL_ITEMS.map(item => (
            <button
              key={item.key}
              className={`${styles.navItem} ${styles.sub} ${subPage === `${ssEntityKey}-${item.key}` ? styles.active : ''}`}
              onClick={() => onNavigate(`ss-${ssEntityKey}-${item.key}`)}
            >
              {item.label}
            </button>
          ))}
          <div className={styles.groupLabel}>Functions</div>
          {ssEntityFns.map((item, i) => (
            <button
              key={item.key}
              className={`${styles.navItem} ${styles.sub} ${ssEntityFnKey === item.key ? styles.active : ''}`}
              onClick={() => onNavigate(`ss-${ssEntityKey}-${item.key}`)}
            >
              <span className={styles.numPrefix}>SS-{i}</span> {item.label}
            </button>
          ))}
        </nav>
      </aside>
    )
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sectionTitle}>{sectionLabel}</div>

      <nav className={styles.nav}>
        {/* ── OVERVIEW ── */}
        <button
          className={`${styles.navItem} ${active('overview') ? styles.active : ''}`}
          onClick={() => go('overview')}
        >
          Overview
        </button>

        {/* ── EXTERNAL ── */}
        <div className={styles.groupLabel}>External</div>
        {EXTERNAL_ITEMS.map(item => (
          <button
            key={item.key}
            className={`${styles.navItem} ${styles.sub} ${active(item.key) ? styles.active : ''}`}
            onClick={() => go(item.key)}
          >
            {item.label}
          </button>
        ))}

        {/* ── INTERNAL / FUNCTIONS ── */}
        {sectionKey.startsWith('unit-') ? (
          <>
            <div className={styles.groupLabel}>Functions</div>
            {UNIT_FUNCTION_ITEMS.map((item, i) => (
              <button
                key={item.key}
                className={`${styles.navItem} ${styles.sub} ${active(item.key) ? styles.active : ''}`}
                onClick={() => go(item.key)}
              >
                <span className={styles.numPrefix}>{prefix}-{i}</span> {item.label}
              </button>
            ))}
            <div className={styles.groupLabel}>Ops</div>
            {UNIT_OPS_ITEMS.map(item => (
              <button
                key={item.key}
                className={`${styles.navItem} ${styles.sub} ${active(item.key) ? styles.active : ''}`}
                onClick={() => go(item.key)}
              >
                {item.label}
              </button>
            ))}
          </>
        ) : (
          <>
            <div className={styles.groupLabel}>Internal</div>
            {(sectionKey === 'ss' ? SS_OVERVIEW_ENTITIES : internalFns).map((item, i) => (
              <button
                key={item.key}
                className={`${styles.navItem} ${styles.sub} ${active(item.key) ? styles.active : ''}`}
                onClick={() => go(item.key)}
              >
                <span className={styles.numPrefix}>{prefix}-{i}</span> {item.label}
              </button>
            ))}
          </>
        )}

        {/* ── ADMIN ── */}
        <div className={styles.groupLabel}>Admin</div>
        {ADMIN_ITEMS.map(item => (
          <button
            key={item.key}
            className={`${styles.navItem} ${styles.sub} ${active(item.key) ? styles.active : ''}`}
            onClick={() => go(item.key)}
          >
            <span className={styles.numPrefix}>A-{item.num}</span> {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
