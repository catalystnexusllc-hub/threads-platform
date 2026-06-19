import { useState } from 'react'
import { useUser } from '../../UserContext'
import {
  MEDPROS_SOLDIERS, DTMS_SOLDIERS,
  ADMIN_SUSPENSES, AWARDS_PIPELINE, DTS_TRAVEL,
  S1_SECTION_SOLDIERS, daysUntil,
} from '../S1/s1SeedData'
import styles from './Portfolio.module.css'

// ── Current-user seed record (SSG John Smith, 42A, Group HQ S1) ──────────────
const ME = {
  edipi:         '5051002010',
  initials:      'JS',
  rank:          'SSG',
  name:          'Smith, John R.',
  mos:           '42A10',
  positionTitle: 'S1 NCOIC',
  section:       'S1',
  unit:          '1/3 BN, 5th SFG (A)',
  unitLabel:     '5th SFG — Group HQ',
  pebd:          '2012-08-15',
  ets:           '2028-08-14',
  tisLabel:      '13y 10m',
  security:      'TS/SCI',
  deployable:    true,
  // medical
  medStatus:     'Green' as const,
  dental:        'Class 1',
  pulhes:        '111111',
  phaDue:        '10 Mar 2027',
  // ACFT
  acftScore:     492,
  acftDate:      '15 Mar 2026',
  acftStatus:    'Pass',
  // training
  cyber:         'Complete — 15 Jan 2026',
  aup:           'Complete — 10 Feb 2026',
  sharp:         'Complete — 05 Mar 2026',
  suicide:       'Complete — 01 Dec 2025',
  // leave
  leaveBalance:  45,
  useLose:       15,
  useLoseDate:   '30 Sep 2026',
  // pay
  bah:           1_620,
  bas:           286.68,
  tspPct:        5,
  sglvPay:       20.00,
  allotments:    [
    { type: 'USAA Life Insurance',  amount: 85  },
    { type: 'TSP (5%)',             amount: 213 },
  ],
  gtcc:          'Active — No delinquencies',
  // awards
  awards: [
    'Army Commendation Medal (3 OLC)',
    'Army Achievement Medal (4 OLC)',
    'Army Good Conduct Medal (3rd Award)',
    'National Defense Service Medal',
    'Global War on Terrorism Service Medal',
    'Afghanistan Campaign Medal',
    'Army Service Ribbon',
    'Overseas Service Ribbon (2)',
  ],
  // career / eval
  assignments: [
    { from: '2012', to: '2015', unit: '3rd ID — Fort Stewart, GA',       role: 'Personnel Clerk, S1'            },
    { from: '2015', to: '2019', unit: '82nd ABN — Fort Bragg, NC',        role: 'Personnel Actions NCO'          },
    { from: '2019', to: '2023', unit: '10th SFG — Fort Carson, CO',       role: 'Senior Personnel NCO'           },
    { from: '2023', to: 'Now',  unit: '5th SFG — Fort Campbell, KY',      role: 'S1 NCOIC (Current)'             },
  ],
  ncoerType:    'Annual NCOER',
  ncoerThru:    'Jul 2026',
  ncoerDue:     '01 Sep 2026',
  ncoerStatus:  'Due in 75 days',
  slcComplete:  '2021',
  ancoc:        '2019',
  ssd3:         '2020',
  // admin
  dd93:   { status: 'Current', updated: '15 Jan 2026', notes: 'Beneficiary on file' },
  sglv:   { status: 'Current', updated: '15 Jan 2026', notes: '$500,000 coverage'    },
  prr:    { status: 'Submitted', updated: '01 Jun 2026', notes: 'Awaiting HRC update' },
  flagging: { status: 'None', notes: 'No flags or restrictions on file'               },
}

// ── Individual nav tabs ───────────────────────────────────────────────────────
const INDIV_TABS = [
  { num: '0', key: 'i-0', label: 'Profile'    },
  { num: '1', key: 'i-1', label: 'Readiness'  },
  { num: '2', key: 'i-2', label: 'Career'     },
  { num: '3', key: 'i-3', label: 'Leave & Pay'},
  { num: '4', key: 'i-4', label: 'Awards'     },
  { num: '5', key: 'i-5', label: 'Admin'      },
]

const INDIV_ACTIONS: Record<string, Array<{ key: string; icon: string; label: string }>> = {
  'i-0': [
    { key: 'identity',   icon: 'fa-id-card',        label: 'Identity'          },
    { key: 'contact',    icon: 'fa-phone',           label: 'Contact Info'      },
    { key: 'emergency',  icon: 'fa-ambulance',       label: 'Emergency Contact' },
    { key: 'dependents', icon: 'fa-users',           label: 'Dependents'        },
  ],
  'i-1': [
    { key: 'medical',    icon: 'fa-heartbeat',       label: 'MEDPROS'           },
    { key: 'acft',       icon: 'fa-running',         label: 'ACFT'              },
    { key: 'training',   icon: 'fa-chalkboard',      label: 'DTMS Training'     },
    { key: 'clearance',  icon: 'fa-id-badge',        label: 'Clearance'         },
    { key: 'profile',    icon: 'fa-notes-medical',   label: 'Physical Profile'  },
  ],
  'i-2': [
    { key: 'assignments',icon: 'fa-map-marker-alt',  label: 'Assignments'       },
    { key: 'ncoer',      icon: 'fa-file-signature',  label: 'OER / NCOER'      },
    { key: 'pme',        icon: 'fa-graduation-cap',  label: 'PME'               },
    { key: 'skills',     icon: 'fa-star',            label: 'Skill Identifiers' },
  ],
  'i-3': [
    { key: 'leave',      icon: 'fa-calendar-check',  label: 'Leave Balance'     },
    { key: 'allotments', icon: 'fa-money-check-alt', label: 'Allotments'        },
    { key: 'dts',        icon: 'fa-plane',           label: 'DTS / Travel'      },
    { key: 'gtcc',       icon: 'fa-credit-card',     label: 'GTCC'              },
  ],
  'i-4': [
    { key: 'rack',       icon: 'fa-medal',           label: 'Awards Rack'       },
    { key: 'submitted',  icon: 'fa-paper-plane',     label: 'Submitted'         },
    { key: 'pending',    icon: 'fa-hourglass-half',  label: 'Pending'           },
  ],
  'i-5': [
    { key: 'dd93',       icon: 'fa-file-alt',        label: 'DD 93'             },
    { key: 'sglv',       icon: 'fa-shield-alt',      label: 'SGLV'             },
    { key: 'prr',        icon: 'fa-clipboard-list',  label: 'PRR'               },
    { key: 'flagging',   icon: 'fa-flag',            label: 'Flagging'          },
  ],
}

// ── Organization nav tabs ─────────────────────────────────────────────────────
const ORG_TABS = [
  { num: '0', key: 'o-0', label: 'Overview'   },
  { num: '1', key: 'o-1', label: 'Manning'    },
  { num: '2', key: 'o-2', label: 'Readiness'  },
  { num: '3', key: 'o-3', label: 'Operations' },
  { num: '4', key: 'o-4', label: 'Training'   },
  { num: '5', key: 'o-5', label: 'Resources'  },
]

const ORG_ACTIONS: Record<string, Array<{ key: string; icon: string; label: string }>> = {
  'o-0': [
    { key: 'status',     icon: 'fa-traffic-light',   label: 'Status Board'  },
    { key: 'alerts',     icon: 'fa-bell',            label: 'Alerts'        },
    { key: 'metrics',    icon: 'fa-chart-bar',       label: 'Key Metrics'   },
  ],
  'o-1': [
    { key: 'roster',     icon: 'fa-address-book',    label: 'Roster'        },
    { key: 'vacancies',  icon: 'fa-user-slash',      label: 'Vacancies'     },
    { key: 'deros',      icon: 'fa-calendar-times',  label: 'DEROS Pipeline'},
    { key: 'gains-loss', icon: 'fa-exchange-alt',    label: 'Gains / Losses'},
  ],
  'o-2': [
    { key: 'med',        icon: 'fa-heartbeat',       label: 'Medical'       },
    { key: 'acft',       icon: 'fa-running',         label: 'ACFT'          },
    { key: 'overall',    icon: 'fa-shield-alt',      label: 'Overall'       },
  ],
  'o-3': [
    { key: 'rhythm',     icon: 'fa-drum',            label: 'Battle Rhythm' },
    { key: 'priorities', icon: 'fa-list-ol',         label: 'Priorities'    },
    { key: 'suspenses',  icon: 'fa-bell',            label: 'Suspenses'     },
    { key: 'taskings',   icon: 'fa-tasks',           label: 'Taskings'      },
  ],
  'o-4': [
    { key: 'metl',       icon: 'fa-crosshairs',      label: 'METL'          },
    { key: 'schedule',   icon: 'fa-calendar-alt',    label: 'Schedule'      },
    { key: 'acft-data',  icon: 'fa-running',         label: 'ACFT Data'     },
    { key: 'reqs',       icon: 'fa-clipboard-check', label: 'Requirements'  },
  ],
  'o-5': [
    { key: 'budget',     icon: 'fa-dollar-sign',     label: 'Budget'        },
    { key: 'property',   icon: 'fa-boxes',           label: 'Property'      },
    { key: 'equip',      icon: 'fa-tools',           label: 'Equipment'     },
    { key: 'requests',   icon: 'fa-file-invoice',    label: 'Requests'      },
  ],
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function Dot({ color }: { color: string }) {
  return <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:color, marginRight:6, flexShrink:0 }} />
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    'Green': styles.badgeGreen, 'Pass': styles.badgeGreen, 'Current': styles.badgeGreen,
    'Amber': styles.badgeAmber, 'Pending': styles.badgeAmber, 'Due': styles.badgeAmber,
    'Red': 'background:rgba(231,76,60,0.1)',  'Overdue': styles.badgeAmber,
    'TS/SCI': styles.badgeBlue,  'Submitted': styles.badgeBlue,
    'Active': styles.badgeGreen, 'None': styles.badgeGray,
  }
  const cls = cfg[status] ?? styles.badgeGray
  return <span className={`${styles.badge} ${cls}`}>{status}</span>
}

function SCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}><i className={`fas ${icon}`} />{title}</div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  )
}

function Stub({ label }: { label: string }) {
  return (
    <div className={styles.stub}>
      <i className="fas fa-tools" />
      <strong>{label}</strong>
      <span>Section under construction</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── INDIVIDUAL TAB SUMMARIES ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function IndivI0() {
  return (
    <div className={styles.grid2}>
      <SCard title="Identity" icon="fa-id-card">
        <dl className={styles.dl}>
          <dt>Name</dt>       <dd><strong>{ME.rank} {ME.name}</strong></dd>
          <dt>MOS / ASI</dt>  <dd style={{color:'#aaa'}}>{ME.mos}</dd>
          <dt>Position</dt>   <dd style={{color:'#aaa'}}>{ME.positionTitle}</dd>
          <dt>Section</dt>    <dd style={{color:'#aaa'}}>{ME.section}</dd>
          <dt>Unit</dt>       <dd style={{color:'#aaa'}}>{ME.unit}</dd>
          <dt>EDIPI</dt>      <dd style={{color:'#666'}}>{ME.edipi}</dd>
          <dt>PEBD</dt>       <dd style={{color:'#aaa'}}>{ME.pebd}</dd>
          <dt>ETS</dt>        <dd style={{color:'#aaa'}}>{ME.ets}</dd>
          <dt>TIS</dt>        <dd style={{color:'#aaa'}}>{ME.tisLabel}</dd>
          <dt>Security</dt>   <dd><StatusBadge status={ME.security} /></dd>
          <dt>Deployable</dt> <dd><StatusBadge status={ME.deployable ? 'Active' : 'Non-Deploy'} /></dd>
        </dl>
      </SCard>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <SCard title="Contact Info" icon="fa-phone">
          <dl className={styles.dl}>
            <dt>Cell</dt>       <dd style={{color:'#888'}}>(270) 555-0142</dd>
            <dt>DSN</dt>        <dd style={{color:'#888'}}>635-4210</dd>
            <dt>Work Email</dt> <dd style={{color:'#888'}}>john.r.smith2.mil@mail.mil</dd>
            <dt>AKO / CAC</dt>  <dd style={{color:'#888'}}>john.r.smith2</dd>
          </dl>
        </SCard>
        <SCard title="Emergency Contact" icon="fa-ambulance">
          <dl className={styles.dl}>
            <dt>Name</dt>     <dd style={{color:'#aaa'}}>Maria Smith (Spouse)</dd>
            <dt>Phone</dt>    <dd style={{color:'#888'}}>(270) 555-0198</dd>
            <dt>Address</dt>  <dd style={{color:'#666', fontSize:11}}>214 Ranger Ave, Clarksville, TN 37040</dd>
            <dt>DD 93</dt>    <dd><StatusBadge status="Current" /></dd>
          </dl>
        </SCard>
      </div>
    </div>
  )
}

function IndivI1() {
  const tiles = [
    { label: 'MEDPROS',         value: 'Green',        sub: 'Class 1 — Fully Deployable',     color: '#27ae60' },
    { label: 'ACFT Score',      value: String(ME.acftScore), sub: `Pass — ${ME.acftDate}`,    color: '#2980b9' },
    { label: 'Dental',          value: ME.dental,      sub: 'Next due: Jan 2027',              color: '#27ae60' },
    { label: 'PHA Due',         value: ME.phaDue,      sub: 'Annual Physical Health Assessment',color: '#888'  },
    { label: 'Security',        value: ME.security,    sub: 'No adverse info',                 color: '#2980b9' },
    { label: 'PULHES',          value: ME.pulhes,      sub: 'No physical profile',             color: '#27ae60' },
  ]
  return (
    <div>
      <div className={styles.readinessGrid}>
        {tiles.map(t => (
          <div key={t.label} className={styles.readinessTile}>
            <div className={styles.readinessTileLabel}>{t.label}</div>
            <div className={styles.readinessTileValue} style={{ color: t.color }}>{t.value}</div>
            <div className={styles.readinessTileSub}>{t.sub}</div>
          </div>
        ))}
      </div>
      <SCard title="Mandatory Training Status" icon="fa-chalkboard">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Course</th><th>Status</th><th>Completed</th><th>Next Due</th></tr></thead>
            <tbody>
              {[
                { course: 'Cyber Awareness',           status: 'Complete', completed: '15 Jan 2026', due: 'Jan 2027' },
                { course: 'Acceptable Use Policy (AUP)', status: 'Complete', completed: '10 Feb 2026', due: 'Feb 2027' },
                { course: 'SHARP / SAPR',               status: 'Complete', completed: '05 Mar 2026', due: 'Mar 2027' },
                { course: 'Suicide Prevention (ASIST)', status: 'Complete', completed: '01 Dec 2025', due: 'Dec 2026' },
                { course: 'iWATCH Army (OPSEC)',        status: 'Complete', completed: '20 Jan 2026', due: 'Jan 2027' },
              ].map(r => (
                <tr key={r.course}>
                  <td style={{color:'#aaa'}}>{r.course}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{fontSize:11}}>{r.completed}</td>
                  <td style={{fontSize:11, color:'#666'}}>{r.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>
    </div>
  )
}

function IndivI2() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <SCard title="Assignment History" icon="fa-map-marker-alt">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Period</th><th>Unit / Location</th><th>Role</th></tr></thead>
            <tbody>
              {ME.assignments.map((a, i) => (
                <tr key={i}>
                  <td style={{color:'#666', whiteSpace:'nowrap', fontSize:11}}>{a.from} – {a.to}</td>
                  <td style={{color:'#aaa'}}>{a.unit}</td>
                  <td style={{color:'#888', fontStyle: a.to === 'Now' ? 'normal' : 'italic', fontWeight: a.to === 'Now' ? 600 : 400}}>{a.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>
      <div className={styles.grid2}>
        <SCard title="Evaluation Status" icon="fa-file-signature">
          <dl className={styles.dl}>
            <dt>Type</dt>       <dd style={{color:'#aaa'}}>{ME.ncoerType}</dd>
            <dt>Thru Date</dt>  <dd style={{color:'#aaa'}}>{ME.ncoerThru}</dd>
            <dt>Due</dt>        <dd style={{color:'#e69c3c'}}>{ME.ncoerDue}</dd>
            <dt>Status</dt>     <dd><span className={`${styles.badge} ${styles.badgeAmber}`}>{ME.ncoerStatus}</span></dd>
            <dt>Rated By</dt>   <dd style={{color:'#666'}}>CPT Phillips (Rater)</dd>
            <dt>SR</dt>         <dd style={{color:'#666'}}>MAJ Ortega (Sr Rater)</dd>
          </dl>
        </SCard>
        <SCard title="PME / Education" icon="fa-graduation-cap">
          <dl className={styles.dl}>
            <dt>SLC</dt>          <dd style={{color:'#aaa'}}>Complete — {ME.slcComplete}</dd>
            <dt>ANCOC / BLC</dt>  <dd style={{color:'#aaa'}}>Complete — {ME.ancoc}</dd>
            <dt>SSD III</dt>      <dd style={{color:'#aaa'}}>Complete — {ME.ssd3}</dd>
            <dt>Next PME</dt>     <dd style={{color:'#666'}}>MSG Board — eligible FY27</dd>
            <dt>Degree</dt>       <dd style={{color:'#666'}}>AA — Human Resources Mgmt</dd>
            <dt>TA Credits</dt>   <dd style={{color:'#666'}}>60 credits completed</dd>
          </dl>
        </SCard>
      </div>
    </div>
  )
}

function IndivI3() {
  const daysToUseLose = daysUntil(ME.useLoseDate)
  return (
    <div className={styles.grid2}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <SCard title="Leave Balance" icon="fa-calendar-check">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div className={styles.readinessTile}>
              <div className={styles.readinessTileLabel}>Balance</div>
              <div className={styles.readinessTileValue} style={{color:'#2980b9'}}>{ME.leaveBalance} days</div>
              <div className={styles.readinessTileSub}>as of 18 Jun 2026</div>
            </div>
            <div className={styles.readinessTile}>
              <div className={styles.readinessTileLabel}>Use-or-Lose</div>
              <div className={styles.readinessTileValue} style={{color:'#e69c3c'}}>{ME.useLose} days</div>
              <div className={styles.readinessTileSub}>by {ME.useLoseDate}</div>
            </div>
          </div>
          {daysToUseLose <= 60 && (
            <div className={`${styles.alert} ${styles.alertAmber}`} style={{marginBottom:0}}>
              <i className="fas fa-exclamation-triangle" />
              {ME.useLose} days use-or-lose — {daysToUseLose} days until {ME.useLoseDate}
            </div>
          )}
        </SCard>
        <SCard title="Allotments" icon="fa-money-check-alt">
          <table className={styles.table}>
            <thead><tr><th>Type</th><th style={{textAlign:'right'}}>Amount / Mo</th></tr></thead>
            <tbody>
              {ME.allotments.map((a, i) => (
                <tr key={i}>
                  <td style={{color:'#aaa'}}>{a.type}</td>
                  <td style={{textAlign:'right', color:'#888'}}>${a.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SCard>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <SCard title="Pay Summary" icon="fa-dollar-sign">
          <dl className={styles.dl}>
            <dt>Grade</dt>    <dd style={{color:'#aaa'}}>E-6 (SSG)</dd>
            <dt>Base Pay</dt> <dd style={{color:'#aaa'}}>$4,254 / mo</dd>
            <dt>BAH</dt>      <dd style={{color:'#aaa'}}>${ME.bah.toLocaleString()} / mo</dd>
            <dt>BAS</dt>      <dd style={{color:'#aaa'}}>${ME.bas.toFixed(2)} / mo</dd>
            <dt>TSP</dt>      <dd style={{color:'#888'}}>{ME.tspPct}% contributing</dd>
            <dt>SGLV</dt>     <dd style={{color:'#888'}}>${ME.sglvPay}/mo — $500k coverage</dd>
          </dl>
        </SCard>
        <SCard title="DTS / Travel" icon="fa-plane">
          {(() => {
            const myTravel = DTS_TRAVEL.filter(t => t.section === 'S1').slice(0, 3)
            return myTravel.length ? (
              <table className={styles.table}>
                <thead><tr><th>Trip</th><th>Departs</th><th>Status</th></tr></thead>
                <tbody>
                  {myTravel.map((t, i) => (
                    <tr key={i}>
                      <td style={{color:'#aaa', fontSize:11}}>{t.purpose.split('—')[0].trim()}</td>
                      <td style={{fontSize:11, color:'#666'}}>{t.departure}</td>
                      <td><span className={`${styles.badge} ${styles.badgeGray}`} style={{fontSize:9}}>{t.voucherStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{fontSize:12, color:'#555', margin:0}}>No active travel authorizations.</p>
            )
          })()}
        </SCard>
      </div>
    </div>
  )
}

function IndivI4() {
  const myAwards = AWARDS_PIPELINE.filter(a => a.section === 'S1').slice(0, 4)
  return (
    <div className={styles.grid2}>
      <SCard title="Awards & Decorations" icon="fa-medal">
        <div className={styles.awardsList}>
          {ME.awards.map((a, i) => (
            <div key={i} className={styles.awardsItem}>
              <i className="fas fa-ribbon" />
              {a}
            </div>
          ))}
        </div>
      </SCard>
      <SCard title="Awards Pipeline" icon="fa-paper-plane">
        {myAwards.length ? (
          <table className={styles.table}>
            <thead><tr><th>Soldier</th><th>Award</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>
              {myAwards.map((a, i) => (
                <tr key={i}>
                  <td style={{color:'#aaa', fontSize:11}}>{a.soldier.split(',')[0]}</td>
                  <td style={{color:'#888', fontSize:11}}>{a.award}</td>
                  <td><span className={`${styles.badge} ${styles.badgeGray}`} style={{fontSize:9}}>{a.status}</span></td>
                  <td style={{fontSize:11, color:'#666'}}>{a.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{fontSize:12, color:'#555', margin:0}}>No awards pending for this section.</p>
        )}
      </SCard>
    </div>
  )
}

function IndivI5() {
  const docs = [
    { label: 'DD 93',    status: ME.dd93.status,  updated: ME.dd93.updated,  notes: ME.dd93.notes  },
    { label: 'SGLV',     status: (ME.sglv as any).status,   updated: (ME.sglv as any).updated,   notes: (ME.sglv as any).notes   },
    { label: 'PRR',      status: ME.prr.status,   updated: ME.prr.updated,   notes: ME.prr.notes   },
    { label: 'Flagging', status: ME.flagging.status, updated: '—',           notes: ME.flagging.notes },
  ]
  const statusColor: Record<string, string> = {
    Current: '#27ae60', Submitted: '#2980b9', None: '#555', Pending: '#e69c3c', Overdue: '#e74c3c',
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div className={styles.docTiles}>
        {docs.map(d => (
          <div key={d.label} className={styles.docTile}>
            <div className={styles.docTileLabel}>{d.label}</div>
            <div className={styles.docTileStatus} style={{ color: statusColor[d.status] ?? '#888', marginTop:4 }}>{d.status}</div>
            <div style={{ fontSize:10, color:'#444', marginTop:6 }}>{d.notes}</div>
            {d.updated !== '—' && <div style={{ fontSize:9, color:'#333', marginTop:4 }}>Updated {d.updated}</div>}
          </div>
        ))}
      </div>
      <SCard title="Admin Suspenses" icon="fa-bell">
        {(() => {
          const mySusp = ADMIN_SUSPENSES.filter(s => s.section === 'S1')
          return mySusp.length ? (
            <table className={styles.table}>
              <thead><tr><th>Soldier</th><th>Item</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {mySusp.map((s, i) => (
                  <tr key={i}>
                    <td style={{color:'#aaa', fontSize:11}}>{s.soldier.split(',')[0]}</td>
                    <td style={{color:'#888'}}>{s.item}</td>
                    <td style={{fontSize:11, color: s.status === 'Overdue' ? '#e74c3c' : '#666'}}>{s.dueDate}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={{fontSize:12, color:'#555', margin:0}}>No open suspenses.</p>
        })()}
      </SCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ORGANIZATION TAB SUMMARIES ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function OrgO0() {
  const total      = S1_SECTION_SOLDIERS.length + 1 // +1 for current user
  const medReady   = MEDPROS_SOLDIERS.filter(m => m.section === 'S1' && m.medStatus === 'Green').length
  const overdue    = ADMIN_SUSPENSES.filter(s => s.section === 'S1' && s.status === 'Overdue').length
  const pending    = ADMIN_SUSPENSES.filter(s => s.section === 'S1' && s.status === 'Pending').length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div className={styles.alertBar}>
        {overdue > 0 && (
          <div className={`${styles.alert} ${styles.alertRed}`}>
            <i className="fas fa-exclamation-circle" />
            {overdue} admin suspense{overdue > 1 ? 's' : ''} overdue
          </div>
        )}
        {pending > 0 && (
          <div className={`${styles.alert} ${styles.alertAmber}`}>
            <i className="fas fa-clock" />
            {pending} item{pending > 1 ? 's' : ''} pending action
          </div>
        )}
        <div className={`${styles.alert} ${styles.alertGreen}`}>
          <i className="fas fa-users" />
          {medReady}/{total} personnel medically ready
        </div>
      </div>
      <div className={styles.grid3}>
        {[
          { label: 'Assigned',    value: total,    color: '#2980b9', icon: 'fa-users'              },
          { label: 'Med Ready',   value: medReady, color: '#27ae60', icon: 'fa-heartbeat'          },
          { label: 'Suspenses',   value: overdue + pending, color: overdue > 0 ? '#e74c3c' : '#e69c3c', icon: 'fa-bell' },
        ].map(s => (
          <div key={s.label} className={styles.readinessTile} style={{ textAlign:'center', alignItems:'center' }}>
            <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: 22, marginBottom: 6 }} />
            <div className={styles.readinessTileValue} style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
            <div className={styles.readinessTileLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      <SCard title="Section Quick Status" icon="fa-traffic-light">
        <table className={styles.table}>
          <thead><tr><th>Area</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {[
              { area:'Manning',  status:'Amber', notes:`${total}/4 positions filled — 1 vacancy (Personnel Clerk)`  },
              { area:'Medical',  status:'Green', notes:`${medReady}/${total} medically ready — no NMC soldiers`     },
              { area:'Training', status:'Amber', notes:'NCOER due Jul 2026 — SFC Garza; Bynum in-processing'        },
              { area:'Admin',    status:'Red',   notes:`${overdue} overdue suspense(s) — SFC Garza DD93`             },
            ].map(r => {
              const c = r.status === 'Green' ? '#27ae60' : r.status === 'Amber' ? '#e69c3c' : '#e74c3c'
              return (
                <tr key={r.area}>
                  <td style={{color:'#aaa', fontWeight:600}}>{r.area}</td>
                  <td>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:c }}>
                      <Dot color={c} />{r.status}
                    </span>
                  </td>
                  <td style={{fontSize:11, color:'#666'}}>{r.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </SCard>
    </div>
  )
}

function OrgO1() {
  const roster = [
    { rank:'CPT',  name:'Phillips, Sarah T.',  mos:'42H', position:'S1 Personnel Officer', ets:'Jun 2029', status:'Assigned' },
    { rank:'SSG',  name:'Smith, John R.',       mos:'42A', position:'S1 NCOIC',             ets:'Aug 2028', status:'Assigned' },
    { rank:'SFC',  name:'Garza, Roberto M.',    mos:'42A', position:'Personnel NCOIC',      ets:'Dec 2026', status:'ETS Risk' },
    { rank:'SGT',  name:'Bynum, Keisha A.',     mos:'42A', position:'Personnel Actions NCO',ets:'May 2027', status:'In-Proc'  },
    { rank:'—',    name:'VACANT',               mos:'42A', position:'Personnel Clerk',      ets:'—',        status:'Vacant'   },
  ]
  const statusColor: Record<string, string> = {
    Assigned: '#27ae60', 'In-Proc': '#2980b9', 'ETS Risk': '#e69c3c', Vacant: '#e74c3c',
  }
  return (
    <SCard title="S1 Section Roster" icon="fa-address-book">
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Rank</th><th>Name</th><th>MOS</th><th>Position</th><th>ETS</th><th>Status</th></tr>
          </thead>
          <tbody>
            {roster.map((s, i) => (
              <tr key={i}>
                <td style={{fontWeight:700, color:'#888', fontSize:11}}>{s.rank}</td>
                <td style={{color: s.status === 'Vacant' ? '#333' : '#ccc', fontWeight:600, fontStyle: s.status === 'Vacant' ? 'italic' : 'normal'}}>{s.name}</td>
                <td style={{fontSize:11, color:'#666'}}>{s.mos}</td>
                <td style={{fontSize:11, color:'#888'}}>{s.position}</td>
                <td style={{fontSize:11, color: s.status === 'ETS Risk' ? '#e69c3c' : '#666'}}>{s.ets}</td>
                <td>
                  <span style={{ fontSize:10, fontWeight:700, color: statusColor[s.status] ?? '#888' }}>
                    <Dot color={statusColor[s.status] ?? '#555'} />{s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SCard>
  )
}

function OrgO2() {
  const s1Med = MEDPROS_SOLDIERS.filter(m => m.section === 'S1')
  const s1Dtms = DTMS_SOLDIERS.filter(d => d.section === 'S1')
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <SCard title="Medical Readiness (MEDPROS)" icon="fa-heartbeat">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Soldier</th><th>Med Status</th><th>PHA Due</th><th>Dental</th><th>Deployable</th></tr></thead>
            <tbody>
              {s1Med.map((m, i) => {
                const c = m.medStatus === 'Green' ? '#27ae60' : m.medStatus === 'Amber' ? '#e69c3c' : '#e74c3c'
                return (
                  <tr key={i}>
                    <td style={{color:'#aaa'}}>{m.name.split(',')[0]}</td>
                    <td><span style={{color:c, fontWeight:700, fontSize:11}}><Dot color={c}/>{m.medStatus}</span></td>
                    <td style={{fontSize:11, color:'#666'}}>{m.phaDue}</td>
                    <td style={{fontSize:11, color:'#888'}}>{m.dental}</td>
                    <td><span style={{fontSize:11, color: m.deployable ? '#27ae60' : '#e74c3c', fontWeight:600}}>{m.deployable ? 'Yes' : 'No'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SCard>
      <SCard title="Physical Fitness (ACFT)" icon="fa-running">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Soldier</th><th>ACFT Status</th><th>Score</th><th>Test Date</th><th>CFT</th></tr></thead>
            <tbody>
              {s1Dtms.map((d, i) => (
                <tr key={i}>
                  <td style={{color:'#aaa'}}>{d.name.split(',')[0]}</td>
                  <td><span style={{fontSize:11, fontWeight:700, color: d.aftStatus === 'Pass' ? '#27ae60' : d.aftStatus.startsWith('Exempt') ? '#555' : '#e74c3c'}}>{d.aftStatus}</span></td>
                  <td style={{fontSize:11, color:'#aaa'}}>{d.aftScore > 0 ? d.aftScore : '—'}</td>
                  <td style={{fontSize:11, color:'#666'}}>{d.aftDate}</td>
                  <td style={{fontSize:11, color: d.cftGrade === 'GO' ? '#27ae60' : '#e69c3c'}}>{d.cftGrade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>
    </div>
  )
}

function OrgO3() {
  const susp = ADMIN_SUSPENSES.filter(s => s.section === 'S1')
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <SCard title="Section Priorities" icon="fa-list-ol">
        {[
          '1. Close out SFC Garza DD93 — overdue since Jun 2025; escalation to CDR if not resolved by 25 Jun',
          '2. Complete SGT Bynum in-processing — DD93 and SGLV pending',
          '3. Prepare NCOER for SFC Garza — thru date Sep 2026; initiate counseling by 01 Jul',
          '4. Fill Personnel Clerk vacancy — submit requisition to HRC NLT 01 Jul 2026',
          '5. Coordinate DTS travel for CPT Phillips — SLC departs 07 Jul 2026',
        ].map((p, i) => (
          <div key={i} style={{ fontSize:12, color:'#777', padding:'8px 0', borderBottom:'1px solid #111', lineHeight:1.5 }}>
            {p}
          </div>
        ))}
      </SCard>
      <SCard title="Open Admin Suspenses" icon="fa-bell">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Soldier</th><th>Item</th><th>Due</th><th>POC</th><th>Status</th></tr></thead>
            <tbody>
              {susp.map((s, i) => (
                <tr key={i}>
                  <td style={{color:'#aaa', fontSize:11}}>{s.soldier.split(',')[0]}</td>
                  <td style={{color:'#888'}}>{s.item}</td>
                  <td style={{fontSize:11, color: s.status === 'Overdue' ? '#e74c3c' : '#666'}}>{s.dueDate}</td>
                  <td style={{fontSize:11, color:'#555'}}>{s.poc}</td>
                  <td><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>
    </div>
  )
}

function OrgO4() {
  const s1Dtms = DTMS_SOLDIERS.filter(d => d.section === 'S1')
  const passCount = s1Dtms.filter(d => d.aftStatus === 'Pass').length
  return (
    <SCard title="Section Training Status" icon="fa-chalkboard">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:14 }}>
        {[
          { label:'ACFT Pass Rate',  value:`${Math.round((passCount/s1Dtms.length)*100)}%`,          color:'#27ae60' },
          { label:'CFT GO Rate',     value:`${s1Dtms.filter(d=>d.cftGrade==='GO').length}/${s1Dtms.length}`, color:'#2980b9' },
          { label:'Soldiers Tested', value:`${s1Dtms.filter(d=>d.aftScore>0).length}/${s1Dtms.length}`,      color:'#888'    },
        ].map(t => (
          <div key={t.label} className={styles.readinessTile} style={{textAlign:'center',alignItems:'center'}}>
            <div className={styles.readinessTileValue} style={{color:t.color}}>{t.value}</div>
            <div className={styles.readinessTileLabel}>{t.label}</div>
          </div>
        ))}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Soldier</th><th>ACFT</th><th>Score</th><th>Last Test</th><th>Next Window</th></tr></thead>
          <tbody>
            {s1Dtms.map((d, i) => (
              <tr key={i}>
                <td style={{color:'#aaa'}}>{d.name?.split(',')[0] ?? '—'}</td>
                <td><span style={{fontWeight:700,fontSize:11,color:d.aftStatus==='Pass'?'#27ae60':'#e74c3c'}}>{d.aftStatus}</span></td>
                <td style={{color:'#aaa'}}>{d.aftScore ?? '—'}</td>
                <td style={{fontSize:11,color:'#666'}}>{d.aftDate}</td>
                <td style={{fontSize:11,color:'#555'}}>Sep 2026</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SCard>
  )
}

function OrgO5() {
  const s1Travel = DTS_TRAVEL.filter(t => t.section === 'S1')
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div className={styles.grid2}>
        <SCard title="Budget" icon="fa-dollar-sign">
          <dl className={styles.dl}>
            <dt>FY26 Allotment</dt>   <dd style={{color:'#aaa'}}>$12,400</dd>
            <dt>Obligated</dt>         <dd style={{color:'#e69c3c'}}>$7,850</dd>
            <dt>Available</dt>         <dd style={{color:'#27ae60'}}>$4,550</dd>
            <dt>Pending Auth</dt>      <dd style={{color:'#2980b9'}}>$2,890 (CPT Phillips TDY)</dd>
            <dt>% Executed</dt>        <dd style={{color:'#aaa'}}>63%</dd>
          </dl>
        </SCard>
        <SCard title="Property / Equipment" icon="fa-boxes">
          <dl className={styles.dl}>
            <dt>Computers</dt>     <dd style={{color:'#aaa'}}>5 / 5 on hand</dd>
            <dt>Printers</dt>      <dd style={{color:'#aaa'}}>2 / 2 on hand</dd>
            <dt>SIPR Workstat.</dt><dd style={{color:'#aaa'}}>2 / 2 on hand</dd>
            <dt>CAC Readers</dt>   <dd style={{color:'#aaa'}}>6 / 6 on hand</dd>
            <dt>Hand Receipts</dt> <dd style={{color:'#27ae60'}}>Current — signed Jan 2026</dd>
          </dl>
        </SCard>
      </div>
      <SCard title="DTS / Travel" icon="fa-plane">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Traveler</th><th>Purpose</th><th>Departs</th><th>Cost</th><th>Status</th></tr></thead>
            <tbody>
              {s1Travel.length ? s1Travel.map((t, i) => (
                <tr key={i}>
                  <td style={{color:'#aaa', fontSize:11}}>{t.travelerName.split(',')[0]}</td>
                  <td style={{fontSize:11, color:'#888'}}>{t.purpose.split('—')[0].trim()}</td>
                  <td style={{fontSize:11, color:'#666'}}>{t.departure}</td>
                  <td style={{fontSize:11, color:'#aaa'}}>${t.estimatedCost.toLocaleString()}</td>
                  <td><span className={`${styles.badge} ${styles.badgeGray}`} style={{fontSize:9}}>{t.voucherStatus}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{color:'#444', textAlign:'center', fontSize:12}}>No active travel.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type View = 'individual' | 'org'

export default function Portfolio() {
  const { profile } = useUser()
  const [view,      setView]      = useState<View>('individual')
  const [indivTab,  setIndivTab]  = useState('i-0')
  const [indivSub,  setIndivSub]  = useState('summary')
  const [orgTab,    setOrgTab]    = useState('o-0')
  const [orgSub,    setOrgSub]    = useState('summary')

  const isIndiv   = view === 'individual'
  const activeTab = isIndiv ? indivTab : orgTab
  const activeSub = isIndiv ? indivSub : orgSub
  const setTab    = isIndiv ? (k: string) => { setIndivTab(k); setIndivSub('summary') }
                            : (k: string) => { setOrgTab(k);   setOrgSub('summary')   }
  const setSub    = isIndiv ? setIndivSub : setOrgSub
  const navTabs   = isIndiv ? INDIV_TABS : ORG_TABS
  const actions   = isIndiv ? (INDIV_ACTIONS[indivTab] ?? []) : (ORG_ACTIONS[orgTab] ?? [])
  const navPrefix = isIndiv ? 'I' : 'O'

  // ── Summary content router ──────────────────────────────────────────────────
  function renderSummary() {
    if (isIndiv) {
      if (indivTab === 'i-0') return <IndivI0 />
      if (indivTab === 'i-1') return <IndivI1 />
      if (indivTab === 'i-2') return <IndivI2 />
      if (indivTab === 'i-3') return <IndivI3 />
      if (indivTab === 'i-4') return <IndivI4 />
      if (indivTab === 'i-5') return <IndivI5 />
    } else {
      if (orgTab === 'o-0') return <OrgO0 />
      if (orgTab === 'o-1') return <OrgO1 />
      if (orgTab === 'o-2') return <OrgO2 />
      if (orgTab === 'o-3') return <OrgO3 />
      if (orgTab === 'o-4') return <OrgO4 />
      if (orgTab === 'o-5') return <OrgO5 />
    }
    return null
  }

  const actionLabel = actions.find(a => a.key === activeSub)?.label

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Profile hero ── */}
      <div className={styles.profileHero}>
        <div className={styles.avatar}>{profile.rank.slice(0,1)}{profile.name.split(' ').pop()?.slice(0,1)}</div>
        <div>
          <div className={styles.profileName}>{profile.rank} {profile.name}</div>
          <div className={styles.profileMeta}>
            <strong>{ME.mos}</strong> · {ME.positionTitle} · {ME.section} Section · {profile.unitLabel}
          </div>
          <div className={styles.profileBadges}>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>
              <i className="fas fa-check-circle" style={{marginRight:4}} />Deployable
            </span>
            <span className={`${styles.badge} ${styles.badgeBlue}`}>{ME.security}</span>
            <span className={`${styles.badge} ${styles.badgeGray}`}>TIS: {ME.tisLabel}</span>
            <span className={`${styles.badge} ${styles.badgeAmber}`}>
              <i className="fas fa-exclamation-triangle" style={{marginRight:4}} />15 days Use-or-Lose
            </span>
            <span className={`${styles.badge} ${styles.badgeAmber}`}>NCOER due Sep 2026</span>
          </div>
        </div>
        <div className={styles.heroSpacer} />
        <div className={styles.heroStats}>
          {[
            { value: String(ME.leaveBalance), label: 'Leave Days' },
            { value: String(ME.acftScore),    label: 'ACFT Score' },
            { value: ME.tisLabel,             label: 'TIS'        },
          ].map(s => (
            <div key={s.label} className={styles.heroStat}>
              <div className={styles.heroStatValue}>{s.value}</div>
              <div className={styles.heroStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── View toggle ── */}
      <div className={styles.viewToggle}>
        <span className={styles.viewToggleLabel}>View</span>
        <button
          className={`${styles.viewBtn} ${isIndiv ? styles.viewBtnActive : ''}`}
          onClick={() => setView('individual')}
        >
          <i className="fas fa-user" />Individual
        </button>
        <div className={styles.viewDivider} />
        <button
          className={`${styles.viewBtn} ${!isIndiv ? styles.viewBtnActive : ''}`}
          onClick={() => setView('org')}
        >
          <i className="fas fa-sitemap" />Organization
        </button>
        <div style={{flex:1}} />
        <span style={{fontSize:10, color:'#333', fontWeight:700, letterSpacing:0.5}}>
          {isIndiv ? `${profile.rank} ${profile.name} · ${ME.positionTitle}` : `${ME.section} Section · ${profile.unitLabel}`}
        </span>
      </div>

      {/* ── Tab nav bar ── */}
      <div className={styles.tabNav}>
        {navTabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tabNavBtn} ${activeTab === tab.key ? styles.tabNavActive : ''}`}
            onClick={() => setTab(tab.key)}
          >
            <span className={styles.tabNavNum}>{navPrefix}-{tab.num}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Action button bar ── */}
      <div className={styles.actionBar}>
        <button
          className={`${styles.actionBtn} ${activeSub === 'summary' ? styles.actionBtnActive : ''}`}
          onClick={() => setSub('summary')}
        >
          <i className="fas fa-tachometer-alt" />Summary
        </button>
        {actions.map(btn => (
          <button
            key={btn.key}
            className={`${styles.actionBtn} ${activeSub === btn.key ? styles.actionBtnActive : ''}`}
            onClick={() => setSub(btn.key)}
          >
            <i className={`fas ${btn.icon}`} />{btn.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {activeSub === 'summary'
        ? renderSummary()
        : <div className={styles.card}><Stub label={actionLabel ?? activeSub} /></div>
      }
    </div>
  )
}
