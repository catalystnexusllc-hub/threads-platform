import { useState } from 'react'
import shared from '../shared.module.css'
import styles from './DigitalSyncs.module.css'
import {
  STANDUP_DAYS, CLOSEOUT_DAYS, locColor,
  UPCOMING_SYNCS, ACTION_ITEMS, SECTION_STATUSES, ODA_READINESS,
  PERSONNEL_ACCOUNTABILITY, CRITICAL_ITEMS, ADMIN_CHECKLIST, PENDING_ACTIONS, NEW_SUSPENSES,
  CAL_TODAY, CAL_TOMORROW, CAL_CHANGES, EXTERNAL_TASKINGS, INTERNAL_TASKS, DUE_OUTS,
  type SectionLight, type PrepStatus, type ItemStatus, type Cadence,
  type UrgencyLevel, type CalChangeType,
} from './syncSeedData'

interface Props {
  subPage?: string
  onNavigate?: (page: string) => void
}

// ── Drill data types ──────────────────────────────────────────────────────────
interface DrillAgendaItem {
  time?: string
  topic: string
  owner: string
  minutes: number
  highlight?: boolean
}

interface DrillOutput {
  product: string
  owner: string
  due: string
  type: 'Decision' | 'Product' | 'Action' | 'Coordination'
}

interface InputSection {
  section: string
  contribution: string
  status: PrepStatus
}

// ── Chip helpers ──────────────────────────────────────────────────────────────
function PrepChip({ status }: { status: PrepStatus }) {
  const cfg: Record<PrepStatus, { bg: string; color: string }> = {
    'Ready':       { bg: 'rgba(39,174,96,0.12)',  color: '#27ae60' },
    'In Progress': { bg: 'rgba(230,156,60,0.12)', color: '#e69c3c' },
    'Pending':     { bg: 'rgba(150,150,150,0.12)',color: '#888'    },
  }
  const c = cfg[status]
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
      background: c.bg, color: c.color, border: `1px solid ${c.color}44`, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

function ItemChip({ status }: { status: ItemStatus }) {
  const cfg: Record<ItemStatus, { bg: string; color: string }> = {
    'Open':        { bg: 'rgba(150,150,150,0.1)', color: '#888'    },
    'In Progress': { bg: 'rgba(41,128,185,0.12)', color: '#2980b9' },
    'Complete':    { bg: 'rgba(39,174,96,0.12)',  color: '#27ae60' },
    'Overdue':     { bg: 'rgba(231,76,60,0.12)',  color: '#e74c3c' },
  }
  const c = cfg[status]
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
      background: c.bg, color: c.color, border: `1px solid ${c.color}44`, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

function CadenceChip({ cadence }: { cadence: Cadence }) {
  const colors: Record<Cadence, string> = {
    Daily: '#c9a227', Weekly: '#2980b9', Monthly: '#8e44ad', Quarterly: '#27ae60', Annual: '#e74c3c',
  }
  const c = colors[cadence]
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3,
      background: `${c}18`, color: c, border: `1px solid ${c}44`, letterSpacing: 0.4 }}>
      {cadence}
    </span>
  )
}

function TrafficDot({ status }: { status: SectionLight }) {
  const c = status === 'Green' ? '#27ae60' : status === 'Amber' ? '#e69c3c' : '#e74c3c'
  return <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }} />
}

function OdaStatusChip({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    'Mission Ready':    { bg: 'rgba(39,174,96,0.12)',  color: '#27ae60' },
    'Deployment Ready': { bg: 'rgba(41,128,185,0.12)', color: '#2980b9' },
    'Training':         { bg: 'rgba(230,156,60,0.12)', color: '#e69c3c' },
    'Stand Down':       { bg: 'rgba(150,150,150,0.1)', color: '#888'    },
  }
  const c = cfg[status] ?? { bg: 'rgba(150,150,150,0.1)', color: '#888' }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3,
      background: c.bg, color: c.color, border: `1px solid ${c.color}44`, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
function SCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className={styles.scard}>
      <div className={styles.scardHeader}>
        <i className={`fas ${icon}`} style={{ color: '#c9a227', marginRight: 8 }} />{title}
      </div>
      <div className={styles.scardBody}>{children}</div>
    </div>
  )
}

// ── Sync mission strip ────────────────────────────────────────────────────────
function SyncMission({ icon, title, cadence, bluf, time, location, chair,
  classification = 'UNCLASSIFIED', prepPct }: {
  icon: string; title: string; cadence: Cadence; bluf: string
  time: string; location: string; chair: string
  classification?: string; prepPct: number
}) {
  const pctColor = prepPct >= 80 ? '#27ae60' : prepPct >= 50 ? '#e69c3c' : '#e74c3c'
  return (
    <div className={styles.syncMission}>
      <div className={styles.syncMissionTop}>
        <i className={`fas ${icon}`} style={{ color: '#c9a227', fontSize: 22, flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div className={styles.syncMissionTitle}>{title}</div>
          <div className={styles.syncBluf}>{bluf}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <CadenceChip cadence={cadence} />
          <span className={styles.classLabel}>{classification}</span>
        </div>
      </div>
      <div className={styles.syncMissionMeta}>
        <span><i className="fas fa-clock" />{time}</span>
        <span><i className="fas fa-map-marker-alt" />{location}</span>
        <span><i className="fas fa-user-tie" />{chair}</span>
        <div className={styles.prepTrack}>
          <span style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Prep</span>
          <div className={styles.prepBarWrap}>
            <div className={styles.prepBarFill} style={{ width: `${prepPct}%`, background: pctColor }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: pctColor }}>{prepPct}%</span>
        </div>
      </div>
    </div>
  )
}

// ── Drill panel ───────────────────────────────────────────────────────────────
function DrillPanel({ label, icon, accent, children }: {
  label: string; icon: string; accent: string; children: React.ReactNode
}) {
  return (
    <div className={styles.drillPanel}>
      <div className={styles.drillPanelLabel} style={{ color: accent }}>
        <i className={`fas ${icon}`} />{label}
      </div>
      <div className={styles.drillPanelContent}>{children}</div>
    </div>
  )
}

// ── Input metric tile ─────────────────────────────────────────────────────────
function InputMetric({ label, value, sub, color = '#222' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className={styles.inputMetric}>
      <div className={styles.inputMetricValue} style={{ color }}>{value}</div>
      <div className={styles.inputMetricLabel}>{label}</div>
      {sub && <div className={styles.inputMetricSub}>{sub}</div>}
    </div>
  )
}

// ── Input section contribution list ──────────────────────────────────────────
function InputBlock({ title, rows }: { title: string; rows: InputSection[] }) {
  return (
    <div className={styles.inputBlock}>
      <div className={styles.inputBlockTitle}>{title}</div>
      {rows.map((r, i) => (
        <div key={i} className={styles.inputBlockRow}>
          <span className={styles.inputBlockCode}>{r.section}</span>
          <span className={styles.inputBlockText}>{r.contribution}</span>
          <PrepChip status={r.status} />
        </div>
      ))}
    </div>
  )
}

// ── Timed agenda row ──────────────────────────────────────────────────────────
function AgendaRow({ item, idx }: { item: DrillAgendaItem; idx: number }) {
  const dur = item.minutes
  const dColor = dur <= 5 ? '#444' : dur <= 10 ? '#2980b9' : '#c9a227'
  return (
    <div className={`${styles.drillAgendaRow} ${item.highlight ? styles.drillAgendaDecision : ''}`}>
      <span className={styles.drillAgendaTime}>{item.time ?? ''}</span>
      <span className={styles.drillAgendaIdx}>{idx + 1}</span>
      <div className={styles.drillAgendaTopic}>
        <span className={styles.drillAgendaTopicText}>{item.topic}</span>
        <span className={styles.drillAgendaOwner}>{item.owner}</span>
      </div>
      <span className={styles.drillAgendaDur} style={{ color: dColor, borderColor: `${dColor}55` }}>
        {dur}m
      </span>
    </div>
  )
}

// ── Output card ───────────────────────────────────────────────────────────────
function OutputCard({ item }: { item: DrillOutput }) {
  const typeColors: Record<string, string> = {
    Decision: '#e74c3c', Product: '#2980b9', Action: '#c9a227', Coordination: '#27ae60',
  }
  const c = typeColors[item.type] ?? '#666'
  return (
    <div className={styles.drillOutputCard}>
      <span className={styles.drillOutputType} style={{ color: c, borderColor: `${c}44`, background: `${c}10` }}>
        {item.type}
      </span>
      <div className={styles.drillOutputProduct}>{item.product}</div>
      <div className={styles.drillOutputMeta}>
        <span>{item.owner}</span>
        <span style={{ color: '#ddd' }}>·</span>
        <span>{item.due}</span>
      </div>
    </div>
  )
}

// ── View button ───────────────────────────────────────────────────────────────
function ViewBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.viewBtn} onClick={onClick}>View</button>
  )
}

// ── Calendar change chip ──────────────────────────────────────────────────────
function CalChip({ type }: { type: CalChangeType }) {
  const cfg: Record<CalChangeType, { bg: string; color: string }> = {
    ADDED:    { bg: '#27ae60', color: '#fff' },
    MOVED:    { bg: '#e69c3c', color: '#fff' },
    CANCELED: { bg: '#e74c3c', color: '#fff' },
    UPDATED:  { bg: '#e8e8e8', color: '#555' },
  }
  const c = cfg[type]
  return (
    <span className={styles.calChangeChip} style={{ background: c.bg, color: c.color }}>
      {type}
    </span>
  )
}

// ── Status style helpers ──────────────────────────────────────────────────────
function urgencyStyle(urgency: UrgencyLevel): { background: string; color: string } {
  switch (urgency) {
    case 'today':   return { background: '#e74c3c', color: '#fff' }
    case 'expired': return { background: '#c0392b', color: '#fff' }
    case '2days':   return { background: '#e69c3c', color: '#fff' }
    case '7days':   return { background: '#d4851a', color: '#fff' }
    default:        return { background: '#e8e8e8', color: '#777' }
  }
}

function paStatusStyle(status: string): { background: string; color: string } {
  switch (status) {
    case 'In Progress': return { background: '#f3f4f6',   color: '#374151' }
    case 'Complete':    return { background: '#27ae6022', color: '#27ae60' }
    case 'Overdue':     return { background: '#e74c3c22', color: '#e74c3c' }
    default:            return { background: '#e69c3c22', color: '#e69c3c' }
  }
}

function calEventColor(status: string): string {
  switch (status) {
    case 'Complete':    return '#27ae60'
    case 'In Progress': return '#e69c3c'
    case 'Current':     return '#c9a227'
    case 'Suspense':    return '#e74c3c'
    default:            return '#555'
  }
}

function taskingStatusStyle(status: string): { background: string; color: string } {
  switch (status) {
    case 'In Progress': return { background: '#f3f4f6',   color: '#374151' }
    case 'Resourced':   return { background: '#27ae6022', color: '#27ae60' }
    case 'Complete':    return { background: '#27ae6022', color: '#27ae60' }
    case 'Overdue':     return { background: '#e74c3c22', color: '#e74c3c' }
    default:            return { background: '#e69c3c22', color: '#e69c3c' }
  }
}

function internalTaskStyle(status: string): { background: string; color: string } {
  switch (status) {
    case 'Scheduled':   return { background: '#27ae6022', color: '#27ae60' }
    case 'In Progress': return { background: '#f3f4f6',   color: '#374151' }
    case 'Complete':    return { background: '#27ae6022', color: '#27ae60' }
    default:            return { background: '#e69c3c22', color: '#e69c3c' }
  }
}

function dueOutStyle(status: string): { background: string; color: string } {
  switch (status) {
    case 'Overdue':     return { background: '#e74c3c', color: '#fff' }
    case 'Tomorrow':    return { background: '#e69c3c', color: '#fff' }
    case 'In Progress': return { background: '#f3f4f6', color: '#374151' }
    default:            return { background: '#f5f5f5', color: '#777' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── OVERVIEW PAGE ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TODAY_MISSIONS = [
  {
    time: '0700 Daily', title: 'Admin Review',
    bluf: 'Resolve suspenses, capture section status, and surface pending CDR decisions.',
    page: 'digital-syncs-admin-review', cadence: 'Daily' as Cadence,
  },
  {
    time: '1600 Daily', title: 'Operations Review',
    bluf: 'Synchronize ODA readiness and identify risks to mission execution within 72 hours.',
    page: 'digital-syncs-operations-review', cadence: 'Daily' as Cadence,
  },
  {
    time: '0900 Monday', title: 'Weekly Stand-Up',
    bluf: 'Account for all leaders, confirm the week\'s battle rhythm, and assign emerging taskings.',
    page: 'digital-syncs-stand-up', cadence: 'Weekly' as Cadence,
  },
]

function OverviewPage({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const STATS = [
    { label: "Today's Syncs",    value: 3,  bg: '#f0fdf4', accent: '#27ae60', icon: 'fa-calendar-day'   },
    { label: 'This Week',        value: 5,  bg: '#eff6ff', accent: '#2980b9', icon: 'fa-calendar-week'  },
    { label: 'Pending Decisions',value: 8,  bg: '#faf5ff', accent: '#8e44ad', icon: 'fa-gavel'          },
    { label: 'Action Items',     value: 12, bg: '#fffbeb', accent: '#c9a227', icon: 'fa-tasks'          },
  ]

  const CADENCE_CARDS = [
    { cadence: 'Daily',     count: 2, icon: 'fa-sun',            color: '#c9a227', sub: 'Admin & Ops Review',    firstPage: 'digital-syncs-admin-review'    },
    { cadence: 'Weekly',    count: 2, icon: 'fa-calendar-week',  color: '#2980b9', sub: 'Stand Up & Close Out',  firstPage: 'digital-syncs-stand-up'        },
    { cadence: 'Monthly',   count: 5, icon: 'fa-calendar-alt',   color: '#8e44ad', sub: '5 Sync Types',          firstPage: 'digital-syncs-operations-sync' },
    { cadence: 'Quarterly', count: 2, icon: 'fa-chart-line',     color: '#27ae60', sub: 'Strategy & Leadership', firstPage: 'digital-syncs-strategy-review' },
    { cadence: 'Annual',    count: 3, icon: 'fa-flag-checkered', color: '#e74c3c', sub: 'Campaign & Budget',     firstPage: 'digital-syncs-campaign-workshop'},
  ]

  return (
    <div className={styles.overviewPage}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, color: '#111', fontWeight: 700, margin: '0 0 4px' }}>
          <i className="fas fa-sync-alt" style={{ color: '#c9a227', marginRight: 8 }} />Digital Syncs
        </h2>
        <div style={{ fontSize: 11, color: '#888' }}>Meeting Preparation & Decision Support Dashboard — 1/3 BN, 5th SFG</div>
      </div>

      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.5, color: '#444', textTransform: 'uppercase', marginBottom: 8 }}>
        <i className="fas fa-sun" style={{ marginRight: 6, color: '#c9a227' }} />Today's Syncs
      </div>
      <div className={styles.todayMissions}>
        {TODAY_MISSIONS.map(m => (
          <div key={m.page} className={styles.todayMissionCard} onClick={() => onNavigate?.(m.page)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={styles.todayMissionTime}>{m.time}</span>
              <CadenceChip cadence={m.cadence} />
            </div>
            <div className={styles.todayMissionTitle}>{m.title}</div>
            <div className={styles.todayMissionBluf}>{m.bluf}</div>
          </div>
        ))}
      </div>

      <div className={styles.statsRow}>
        {STATS.map(s => (
          <div key={s.label} className={styles.statCard} style={{ background: s.bg, borderColor: `${s.accent}33` }}>
            <i className={`fas ${s.icon}`} style={{ color: s.accent, fontSize: 18, marginBottom: 6 }} />
            <div style={{ fontSize: 32, fontWeight: 800, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: `${s.accent}bb`, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.cadenceRow}>
        {CADENCE_CARDS.map(c => (
          <button key={c.cadence} className={styles.cadenceCard} onClick={() => onNavigate?.(c.firstPage)}>
            <i className={`fas ${c.icon}`} style={{ fontSize: 20, color: c.color, marginBottom: 8 }} />
            <div style={{ fontSize: 12, fontWeight: 800, color: '#222', letterSpacing: 0.5 }}>{c.cadence}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{c.sub}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.color, marginTop: 6 }}>{c.count}</div>
          </button>
        ))}
      </div>

      <div className={styles.tablesGrid}>
        <SCard title="Upcoming Syncs" icon="fa-calendar-check">
          <div className={shared.tableWrap}>
            <table className={styles.syncTable}>
              <thead>
                <tr><th>Date / Time</th><th>Sync</th><th>Cadence</th><th>Prep</th><th style={{ width: 60 }}>Action</th></tr>
              </thead>
              <tbody>
                {UPCOMING_SYNCS.map(s => (
                  <tr key={s.id}>
                    <td style={{ whiteSpace: 'nowrap', color: '#444', fontSize: 11 }}>
                      <strong style={{ color: '#111' }}>{s.dateLabel}</strong> {s.time}
                    </td>
                    <td style={{ fontWeight: 600, color: '#222' }}>{s.title}</td>
                    <td><CadenceChip cadence={s.cadence} /></td>
                    <td><PrepChip status={s.prepStatus} /></td>
                    <td><ViewBtn onClick={() => onNavigate?.(`digital-syncs-${s.subPage}`)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SCard>

        <SCard title="Active Action Items" icon="fa-tasks">
          <div className={shared.tableWrap}>
            <table className={styles.syncTable}>
              <thead>
                <tr><th>Action Item</th><th style={{ width: 36 }}>OPR</th><th style={{ width: 65 }}>Due</th><th style={{ width: 90 }}>Status</th></tr>
              </thead>
              <tbody>
                {ACTION_ITEMS.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#222', fontSize: 12 }}>{a.item}</div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{a.sync}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#666', fontSize: 11 }}>{a.opr}</td>
                    <td style={{ fontSize: 11, color: a.status === 'Overdue' ? '#e74c3c' : '#666' }}>{a.due}</td>
                    <td><ItemChip status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SCard>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ADMIN REVIEW (DAILY) ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const ADMIN_AGENDA: DrillAgendaItem[] = [
  { time: '0700', topic: 'Roll call & attendance',               owner: 'XO',  minutes: 2  },
  { time: '0702', topic: 'Battle rhythm & schedule updates',     owner: 'J3',  minutes: 3  },
  { time: '0705', topic: 'Section status lights (J1–J9)',        owner: 'All', minutes: 18 },
  { time: '0723', topic: 'Open action item review',              owner: 'XO',  minutes: 10 },
  { time: '0733', topic: 'CDR pending decisions',                owner: 'CDR', minutes: 10, highlight: true },
  { time: '0743', topic: 'Suspenses due today',                  owner: 'J1',  minutes: 5  },
  { time: '0748', topic: 'Announcements & dismissal',            owner: 'XO',  minutes: 5  },
]

const ADMIN_OUTPUTS: DrillOutput[] = [
  { product: 'CDR decision record',           owner: 'J1',  due: 'End of sync', type: 'Decision'     },
  { product: 'Updated action log',            owner: 'XO',  due: 'NLT 1000',   type: 'Product'      },
  { product: 'Suspenses resolved / extended', owner: 'J1',  due: 'Same day',    type: 'Action'       },
  { product: 'Section suspense closures',     owner: 'All', due: 'NLT 1200',   type: 'Coordination' },
]

function AdminReviewPage() {
  const greenCount = SECTION_STATUSES.filter(s => s.status === 'Green').length
  const amberCount = SECTION_STATUSES.filter(s => s.status === 'Amber').length
  const prepPct    = Math.round((greenCount / SECTION_STATUSES.length) * 100)
  const totalMins  = ADMIN_AGENDA.reduce((s, a) => s + a.minutes, 0)
  const pax        = PERSONNEL_ACCOUNTABILITY
  const paxTotal   = pax.present + pax.leave + pax.tdy + pax.medical + pax.pass
  const presPct    = Math.round((pax.present / paxTotal) * 100)

  const pendingDecisions = [
    { id: 'pd1', issue: 'Authority to flag — SSG Garza (AWOL, 3 days)',         section: 'J1', priority: 'High'   },
    { id: 'pd2', issue: 'Approve DTS blanket order — J9 TDY (6 personnel)',     section: 'J9', priority: 'Medium' },
    { id: 'pd3', issue: 'Approve ACFT retest window for Bravo Co (2 soldiers)', section: 'J7', priority: 'Low'    },
  ]

  return (
    <div className={styles.syncPage}>
      <SyncMission
        icon="fa-clipboard-list" title="Admin Review" cadence="Daily"
        bluf="Review section status lights, clear open suspenses, and surface pending CDR decisions before start of business — no slides, no brief, data only."
        time="0700 Daily" location="Admin Conference Room, Bldg 1320"
        chair="XO (MAJ Ortega)" prepPct={prepPct}
      />

      {/* ── Hero tiles ── */}
      <div className={styles.heroGrid}>
        <div className={styles.heroTile} style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
          <div className={styles.heroTileNum} style={{ color: '#e74c3c' }}>{CRITICAL_ITEMS.length}</div>
          <div className={styles.heroTileLabel} style={{ color: '#e74c3c' }}>Critical Items</div>
        </div>
        <div className={styles.heroTile} style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
          <div className={styles.heroTileNum} style={{ color: '#e69c3c' }}>{PENDING_ACTIONS.length}</div>
          <div className={styles.heroTileLabel} style={{ color: '#e69c3c' }}>Pending Actions</div>
        </div>
        <div className={styles.heroTile} style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
          <div className={styles.heroTileNum} style={{ color: '#27ae60' }}>{presPct}%</div>
          <div className={styles.heroTileLabel} style={{ color: '#27ae60' }}>Personnel Present</div>
        </div>
        <div className={styles.heroTile} style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div className={styles.heroTileNum} style={{ color: '#334155' }}>{NEW_SUSPENSES.length}</div>
          <div className={styles.heroTileLabel} style={{ color: '#64748b' }}>New Suspenses</div>
        </div>
      </div>

      {/* ── 3-panel drill ── */}
      <div className={styles.drillLayout}>
        <DrillPanel label="Inputs" icon="fa-database" accent="#2980b9">
          <div className={styles.inputMetricsGrid}>
            <InputMetric label="Green"    value={greenCount}            color="#27ae60" sub="sections" />
            <InputMetric label="Amber"    value={amberCount}            color="#e69c3c" sub="sections" />
            <InputMetric label="Critical" value={CRITICAL_ITEMS.length} color="#e74c3c" sub="items"    />
            <InputMetric label="Pending"  value={PENDING_ACTIONS.length} color="#c9a227" sub="actions" />
          </div>
          <div className={styles.inputBlock}>
            <div className={styles.inputBlockTitle}>Section Status Feed</div>
            {SECTION_STATUSES.map(s => {
              const c = s.status === 'Green' ? '#27ae60' : s.status === 'Amber' ? '#e69c3c' : '#e74c3c'
              return (
                <div key={s.section} className={styles.inputBlockRow}>
                  <span className={styles.inputBlockCode}>{s.section}</span>
                  <span className={styles.inputBlockText} style={{ fontSize: 10 }}>
                    <span style={{ color: c, fontWeight: 800, marginRight: 5 }}>●</span>
                    {s.update.split('—')[0].trim()}
                  </span>
                </div>
              )
            })}
          </div>
        </DrillPanel>

        <DrillPanel label="Agenda" icon="fa-list-ol" accent="#c9a227">
          {ADMIN_AGENDA.map((item, i) => <AgendaRow key={i} item={item} idx={i} />)}
          <div className={styles.drillAgendaTotal}>Total: {totalMins} min</div>
        </DrillPanel>

        <DrillPanel label="Outputs" icon="fa-arrow-right" accent="#27ae60">
          {ADMIN_OUTPUTS.map((o, i) => <OutputCard key={i} item={o} />)}
        </DrillPanel>
      </div>

      {/* ── Personnel Accountability ── */}
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.5, color: '#444', textTransform: 'uppercase', marginBottom: 8 }}>
        <i className="fas fa-users" style={{ marginRight: 6, color: '#c9a227' }} />Personnel Accountability
      </div>
      <div className={styles.paxGrid}>
        {[
          { label: 'Present',     val: pax.present,     color: '#27ae60', hi: false },
          { label: 'Leave',       val: pax.leave,       color: '#8e44ad', hi: false },
          { label: 'TDY',         val: pax.tdy,         color: '#2980b9', hi: false },
          { label: 'Medical',     val: pax.medical,     color: pax.medical > 0 ? '#e74c3c' : '#555', hi: pax.medical > 0 },
          { label: 'Pass',        val: pax.pass,        color: '#888',    hi: false },
          { label: 'Unaccounted', val: pax.unaccounted, color: pax.unaccounted > 0 ? '#e74c3c' : '#555', hi: false },
        ].map(cell => (
          <div key={cell.label} className={`${styles.paxCell} ${cell.hi ? styles.paxCellHighlight : ''}`}>
            <div className={styles.paxNum} style={{ color: cell.color }}>{cell.val}</div>
            <div className={styles.paxLabel}>{cell.label}</div>
          </div>
        ))}
      </div>

      {/* ── Critical Items + Admin Checklist ── */}
      <div className={styles.twoCol} style={{ marginBottom: 16 }}>
        <SCard title={`Critical Items  ${CRITICAL_ITEMS.length}`} icon="fa-exclamation-triangle">
          <div className={styles.criticalList}>
            {CRITICAL_ITEMS.map(ci => (
              <div key={ci.id} className={styles.criticalItem}>
                <div className={styles.criticalItemBody}>
                  <div className={styles.criticalItemTitle}>{ci.title}</div>
                  <div className={styles.criticalItemDetail}>{ci.detail}</div>
                </div>
                <span className={styles.urgencyBadge} style={urgencyStyle(ci.urgency)}>{ci.urgencyLabel}</span>
              </div>
            ))}
          </div>
        </SCard>

        <SCard title="Admin Checklist" icon="fa-check-square">
          <div>
            {ADMIN_CHECKLIST.map(ac => (
              <div key={ac.id} className={styles.checklistRow}>
                <span className={styles.checklistLabel}>{ac.label}</span>
                {ac.status === 'complete'
                  ? <span className={styles.checklistStatus} style={{ color: '#27ae60' }}><i className="fas fa-check" /></span>
                  : <span className={styles.checklistStatus} style={{ color: ac.status === 'due' ? '#e74c3c' : '#e69c3c' }}>{ac.note}</span>
                }
              </div>
            ))}
          </div>
        </SCard>
      </div>

      {/* ── Pending Actions ── */}
      <SCard title={`Pending Actions  ${PENDING_ACTIONS.length}`} icon="fa-tasks">
        <div className={shared.tableWrap}>
          <table className={styles.syncTable}>
            <thead>
              <tr><th>Action Item</th><th style={{ width: 55 }}>OPR</th><th>Description</th><th style={{ width: 65 }}>Due</th><th style={{ width: 100 }}>Status</th></tr>
            </thead>
            <tbody>
              {PENDING_ACTIONS.map(pa => {
                const ss = paStatusStyle(pa.status)
                return (
                  <tr key={pa.id}>
                    <td style={{ fontWeight: 700, color: '#222' }}>{pa.item}</td>
                    <td style={{ fontWeight: 700, color: '#666', fontSize: 11 }}>{pa.opr}</td>
                    <td style={{ fontSize: 11, color: '#555' }}>{pa.description}</td>
                    <td style={{ fontSize: 11, color: '#666' }}>{pa.due}</td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 4,
                        background: ss.background, color: ss.color, letterSpacing: 0.5 }}>
                        {pa.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SCard>

      {/* ── New Suspenses ── */}
      <div style={{ marginTop: 16 }}>
        <SCard title={`New Suspenses  ${NEW_SUSPENSES.length}`} icon="fa-bell">
          <div className={shared.tableWrap}>
            <table className={styles.syncTable}>
              <thead>
                <tr><th>Suspense</th><th style={{ width: 100 }}>Source</th><th>Description</th><th style={{ width: 70 }}>Received</th></tr>
              </thead>
              <tbody>
                {NEW_SUSPENSES.map(ns => (
                  <tr key={ns.id}>
                    <td style={{ fontWeight: 700, color: '#222' }}>{ns.suspense}</td>
                    <td style={{ fontWeight: 600, color: '#666', fontSize: 11 }}>{ns.source}</td>
                    <td style={{ fontSize: 11, color: '#555' }}>{ns.description}</td>
                    <td style={{ fontSize: 11, color: '#777' }}>{ns.received}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SCard>
      </div>

      {/* ── Section Status + CDR Decisions ── */}
      <div className={styles.twoCol} style={{ marginTop: 16 }}>
        <SCard title="Section Status" icon="fa-traffic-light">
          <div className={styles.sectionGrid}>
            {SECTION_STATUSES.map(s => (
              <div key={s.section} className={styles.sectionRow}>
                <div className={styles.sectionLeft}>
                  <TrafficDot status={s.status} />
                  <span className={styles.sectionCode}>{s.section}</span>
                  <span className={styles.sectionLabel}>{s.label}</span>
                </div>
                <div className={styles.sectionUpdate}>{s.update}</div>
                {s.actions > 0 && (
                  <div className={styles.sectionActions}>
                    <span className={styles.actionBadge}>{s.actions}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SCard>

        <SCard title="Pending CDR Decisions" icon="fa-gavel">
          {pendingDecisions.map(d => (
            <div key={d.id} className={styles.decisionCard}>
              <div className={styles.decisionHeader}>
                <span className={styles.decisionSection}>{d.section}</span>
                <span className={styles.decisionPriority}
                  style={{ color: d.priority === 'High' ? '#e74c3c' : d.priority === 'Medium' ? '#e69c3c' : '#888' }}>
                  {d.priority}
                </span>
              </div>
              <div className={styles.decisionText}>{d.issue}</div>
            </div>
          ))}
        </SCard>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── OPERATIONS REVIEW (DAILY) ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const OPS_AGENDA: DrillAgendaItem[] = [
  { time: '1600', topic: 'Roll call & CCIR update',         owner: 'J3',  minutes: 2  },
  { time: '1602', topic: 'Current ops status',              owner: 'J3',  minutes: 5  },
  { time: '1607', topic: 'ODA readiness matrix',            owner: 'J3',  minutes: 10 },
  { time: '1617', topic: 'Intelligence & threat update',    owner: 'J2',  minutes: 7  },
  { time: '1624', topic: 'Logistics & maintenance',         owner: 'J4',  minutes: 5  },
  { time: '1629', topic: 'Next 72 hours battle rhythm',     owner: 'J3',  minutes: 8  },
  { time: '1637', topic: 'Risk assessment & mitigations',   owner: 'J3',  minutes: 5  },
  { time: '1642', topic: 'CDR guidance & decisions',        owner: 'CDR', minutes: 8, highlight: true },
  { time: '1650', topic: 'Action items captured',           owner: 'XO',  minutes: 5  },
]

const OPS_OUTPUTS: DrillOutput[] = [
  { product: 'CDR decisions on risk items',       owner: 'CDR', due: 'End of sync', type: 'Decision'     },
  { product: 'Updated 72-hr battle rhythm',       owner: 'J3',  due: 'NLT 1730',   type: 'Product'      },
  { product: 'FRAGORD fragments (if required)',    owner: 'J3',  due: 'NLT 1800',   type: 'Action'       },
  { product: 'Updated readiness report to Group', owner: 'J1',  due: 'NLT 1700',   type: 'Coordination' },
]

function OpsReviewPage() {
  const [showAllTasks, setShowAllTasks] = useState(false)
  const missionReady = ODA_READINESS.filter(o => o.status === 'Mission Ready').length
  const deployReady  = ODA_READINESS.filter(o => o.status === 'Deployment Ready').length
  const training     = ODA_READINESS.filter(o => o.status === 'Training').length
  const standDown    = ODA_READINESS.filter(o => o.status === 'Stand Down').length
  const prepPct      = Math.round(((missionReady + deployReady) / ODA_READINESS.length) * 100)
  const totalMins    = OPS_AGENDA.reduce((s, a) => s + a.minutes, 0)
  const visibleTasks = showAllTasks ? INTERNAL_TASKS : INTERNAL_TASKS.slice(0, 6)

  const risks = [
    { level: 'Med', item: '2 vehicles deadline — impacts mobility if parts delayed beyond 22 Jun' },
    { level: 'Low', item: 'ODA-5223 at 10/12 strength — return from TDY dependent on transport'   },
    { level: 'Low', item: 'ACFT retest failure could affect Bravo Co deployment eligibility'       },
  ]

  return (
    <div className={styles.syncPage}>
      <SyncMission
        icon="fa-shield-alt" title="Operations Review" cadence="Daily"
        bluf="Synchronize ODA readiness across the battalion, assess the threat picture, surface risks to mission, and provide CDR a clear decision advantage before end of day."
        time="1600 Daily" location="Operations Center, Bldg 1310 (SIPR)"
        chair="CDR (LTC Bradley)" prepPct={prepPct}
      />

      {/* ── Hero tiles ── */}
      <div className={styles.heroGrid}>
        <div className={styles.heroTile} style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
          <div className={styles.heroTileNum} style={{ color: '#e74c3c' }}>{EXTERNAL_TASKINGS.length}</div>
          <div className={styles.heroTileLabel} style={{ color: '#e74c3c' }}>External Taskings</div>
        </div>
        <div className={styles.heroTile} style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
          <div className={styles.heroTileNum} style={{ color: '#e69c3c' }}>{INTERNAL_TASKS.length}</div>
          <div className={styles.heroTileLabel} style={{ color: '#e69c3c' }}>Internal Tasks</div>
        </div>
        <div className={styles.heroTile} style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div className={styles.heroTileNum} style={{ color: '#334155' }}>{CAL_CHANGES.length}</div>
          <div className={styles.heroTileLabel} style={{ color: '#64748b' }}>Calendar Changes</div>
        </div>
        <div className={styles.heroTile} style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div className={styles.heroTileNum} style={{ color: '#334155' }}>{DUE_OUTS.length}</div>
          <div className={styles.heroTileLabel} style={{ color: '#64748b' }}>Due Outs</div>
        </div>
      </div>

      {/* ── 3-panel drill ── */}
      <div className={styles.drillLayout}>
        <DrillPanel label="Inputs" icon="fa-database" accent="#2980b9">
          <div className={styles.inputMetricsGrid}>
            <InputMetric label="Mission Ready" value={missionReady} color="#27ae60" sub="ODAs" />
            <InputMetric label="Dep. Ready"    value={deployReady}  color="#2980b9" sub="ODAs" />
            <InputMetric label="Training"      value={training}     color="#e69c3c" sub="ODAs" />
            <InputMetric label="Stand Down"    value={standDown}    color="#888"    sub="ODAs" />
          </div>
          <div className={styles.inputBlock}>
            <div className={styles.inputBlockTitle}>Risk Items</div>
            {risks.map((r, i) => (
              <div key={i} className={styles.inputBlockRow}>
                <span className={styles.inputBlockCode}
                  style={{ color: r.level === 'High' ? '#e74c3c' : r.level === 'Med' ? '#e69c3c' : '#888' }}>
                  {r.level}
                </span>
                <span className={styles.inputBlockText}>{r.item}</span>
              </div>
            ))}
          </div>
        </DrillPanel>

        <DrillPanel label="Agenda" icon="fa-list-ol" accent="#c9a227">
          {OPS_AGENDA.map((item, i) => <AgendaRow key={i} item={item} idx={i} />)}
          <div className={styles.drillAgendaTotal}>Total: {totalMins} min</div>
        </DrillPanel>

        <DrillPanel label="Outputs" icon="fa-arrow-right" accent="#27ae60">
          {OPS_OUTPUTS.map((o, i) => <OutputCard key={i} item={o} />)}
        </DrillPanel>
      </div>

      {/* ── Calendar Updates ── */}
      <SCard title={`Calendar Updates  ${CAL_CHANGES.length} Changes`} icon="fa-calendar-alt">
        <div className={styles.calColumns}>
          <div>
            <div className={styles.calDayHeader}>Today — 18 JUN</div>
            {CAL_TODAY.map((e, i) => (
              <div key={i} className={styles.calEventRow}>
                <span className={styles.calEventTime}>{e.time}</span>
                <span className={styles.calEventTitle}>{e.title}</span>
                <span className={styles.calEventStatus} style={{ color: calEventColor(e.status) }}>
                  {e.status === 'Complete' ? '✓ Complete' : e.status}
                </span>
              </div>
            ))}
          </div>
          <div>
            <div className={styles.calDayHeader}>Tomorrow — 19 JUN</div>
            {CAL_TOMORROW.map((e, i) => (
              <div key={i} className={styles.calEventRow}>
                <span className={styles.calEventTime}>{e.time}</span>
                <span className={styles.calEventTitle}>{e.title}</span>
                <span className={styles.calEventStatus} style={{ color: calEventColor(e.status) }}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 8 }}>Recent Calendar Changes</div>
        <div className={shared.tableWrap}>
          <table className={styles.syncTable}>
            <thead>
              <tr><th style={{ width: 90 }}>Change</th><th>Event</th><th>Original</th><th>Updated</th><th>Attendees Affected</th><th style={{ width: 75 }}>Notified</th></tr>
            </thead>
            <tbody>
              {CAL_CHANGES.map(cc => (
                <tr key={cc.id}>
                  <td><CalChip type={cc.type} /></td>
                  <td style={{ fontWeight: 600, color: '#222' }}>{cc.event}</td>
                  <td style={{ fontSize: 11, color: '#777' }}>{cc.original}</td>
                  <td style={{ fontSize: 11, color: '#444' }}>{cc.updated}</td>
                  <td style={{ fontSize: 11, color: '#555' }}>{cc.affected}</td>
                  <td style={{ fontSize: 11, color: cc.notified ? '#27ae60' : '#e69c3c', fontWeight: 700 }}>
                    {cc.notified ? '✓' : 'Pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>

      {/* ── External Taskings ── */}
      <div style={{ marginTop: 16 }}>
        <SCard title={`External Taskings  ${EXTERNAL_TASKINGS.length}`} icon="fa-external-link-alt">
          <div className={shared.tableWrap}>
            <table className={styles.syncTable}>
              <thead>
                <tr><th>Tasking</th><th style={{ width: 90 }}>Source</th><th>Description</th><th style={{ width: 36 }}>OPR</th><th style={{ width: 65 }}>Due</th><th style={{ width: 110 }}>Status</th></tr>
              </thead>
              <tbody>
                {EXTERNAL_TASKINGS.map(et => {
                  const ss = taskingStatusStyle(et.status)
                  return (
                    <tr key={et.id}>
                      <td style={{ fontWeight: 700, color: et.urgent ? '#e74c3c' : '#222' }}>{et.tasking}</td>
                      <td style={{ fontSize: 11, color: '#555' }}>{et.source}</td>
                      <td style={{ fontSize: 11, color: '#555' }}>{et.description}</td>
                      <td style={{ fontWeight: 700, color: '#666', fontSize: 11 }}>{et.opr}</td>
                      <td style={{ fontSize: 11, color: et.urgent ? '#e74c3c' : '#666', fontWeight: et.urgent ? 800 : 400 }}>{et.due}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 4,
                          background: ss.background, color: ss.color, letterSpacing: 0.5 }}>
                          {et.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SCard>
      </div>

      {/* ── Internal Tasks ── */}
      <div style={{ marginTop: 16 }}>
        <SCard title={`Internal Tasks  ${INTERNAL_TASKS.length}`} icon="fa-list-check">
          <div className={shared.tableWrap}>
            <table className={styles.syncTable}>
              <thead>
                <tr><th>Task</th><th style={{ width: 80 }}>Section</th><th>Description</th><th style={{ width: 100 }}>Assigned</th><th style={{ width: 65 }}>Due</th><th style={{ width: 110 }}>Status</th></tr>
              </thead>
              <tbody>
                {visibleTasks.map(it => {
                  const ss = internalTaskStyle(it.status)
                  return (
                    <tr key={it.id}>
                      <td style={{ fontWeight: 700, color: '#222' }}>{it.task}</td>
                      <td style={{ fontSize: 11, color: '#555' }}>{it.section}</td>
                      <td style={{ fontSize: 11, color: '#555' }}>{it.description}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{it.assigned}</td>
                      <td style={{ fontSize: 11, color: '#666' }}>{it.due}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 4,
                          background: ss.background, color: ss.color, letterSpacing: 0.5 }}>
                          {it.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {INTERNAL_TASKS.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button onClick={() => setShowAllTasks(!showAllTasks)} style={{
                padding: '6px 16px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 4,
                fontSize: 11, fontWeight: 700, color: '#777', cursor: 'pointer',
              }}>
                {showAllTasks ? 'Show Less' : `Show All ${INTERNAL_TASKS.length} Tasks`}
              </button>
            </div>
          )}
        </SCard>
      </div>

      {/* ── Due Outs ── */}
      <div style={{ marginTop: 16 }}>
        <SCard title={`Due Outs from Syncs & Touchpoints  ${DUE_OUTS.length}`} icon="fa-arrow-circle-right">
          <div className={shared.tableWrap}>
            <table className={styles.syncTable}>
              <thead>
                <tr><th>Due Out</th><th>Source Sync</th><th>Description</th><th style={{ width: 36 }}>OPR</th><th style={{ width: 70 }}>Due</th><th style={{ width: 110 }}>Status</th></tr>
              </thead>
              <tbody>
                {DUE_OUTS.map(d => {
                  const ss = dueOutStyle(d.status)
                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 700, color: '#222' }}>{d.dueOut}</td>
                      <td style={{ fontSize: 11, color: '#777' }}>{d.sourceSync}</td>
                      <td style={{ fontSize: 11, color: '#555' }}>{d.description}</td>
                      <td style={{ fontWeight: 700, color: '#666', fontSize: 11 }}>{d.opr}</td>
                      <td style={{ fontSize: 11, color: d.status === 'Overdue' ? '#e74c3c' : '#666', fontWeight: d.status === 'Overdue' ? 800 : 400 }}>{d.due}</td>
                      <td>
                        <span className={styles.dueOutStatus} style={{ background: ss.background, color: ss.color }}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SCard>
      </div>

      {/* ── ODA Readiness ── */}
      <div style={{ marginTop: 16 }}>
        <SCard title="ODA Readiness Status" icon="fa-users">
          <div className={shared.tableWrap}>
            <table className={styles.syncTable}>
              <thead>
                <tr><th>Team</th><th>Company</th><th>Status</th><th style={{ width: 70 }}>Personnel</th><th style={{ width: 60 }}>Equip</th><th>Next Event</th></tr>
              </thead>
              <tbody>
                {ODA_READINESS.map(o => (
                  <tr key={o.team}>
                    <td style={{ fontWeight: 700, color: '#111' }}>{o.team}</td>
                    <td style={{ fontSize: 11, color: '#555' }}>{o.company}</td>
                    <td><OdaStatusChip status={o.status} /></td>
                    <td style={{ fontWeight: 600, color: '#444', fontSize: 12 }}>{o.personnel}</td>
                    <td style={{ fontSize: 11, color: Number(o.equip.replace('%','')) < 90 ? '#e69c3c' : '#666' }}>{o.equip}</td>
                    <td style={{ fontSize: 11, color: '#555' }}>{o.nextEvent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SCard>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── WEEKLY STAND-UP ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const STANDUP_AGENDA: DrillAgendaItem[] = [
  { time: '0900', topic: 'Roll call & overview',               owner: 'XO',  minutes: 2  },
  { time: '0902', topic: 'CDR intent for the week',            owner: 'CDR', minutes: 3  },
  { time: '0905', topic: 'Leader location accountability',     owner: 'All', minutes: 15 },
  { time: '0920', topic: 'Training schedule confirmation',     owner: 'J7',  minutes: 5  },
  { time: '0925', topic: 'Open action items status',           owner: 'XO',  minutes: 5  },
  { time: '0930', topic: 'Emerging taskings / announcements',  owner: 'XO',  minutes: 5  },
  { time: '0935', topic: 'CDR remarks & dismissal',            owner: 'CDR', minutes: 3, highlight: true },
]

const STANDUP_OUTPUTS: DrillOutput[] = [
  { product: 'Leader location roster confirmed',   owner: 'XO',  due: 'End of sync', type: 'Product'  },
  { product: 'Training schedule locked for week',  owner: 'J7',  due: 'NLT 1000',   type: 'Product'  },
  { product: 'New taskings assigned',              owner: 'CDR', due: 'End of sync', type: 'Decision' },
  { product: 'Open actions re-confirmed / closed', owner: 'XO',  due: 'NLT 1200',   type: 'Action'   },
]

function StandUpPage() {
  const [selectedDay, setSelectedDay] = useState('monday')
  const activeDayId = STANDUP_DAYS.some(d => d.id === selectedDay) ? selectedDay : STANDUP_DAYS[0]?.id ?? ''
  const day = STANDUP_DAYS.find(d => d.id === activeDayId) ?? STANDUP_DAYS[0]
  const totalMins = STANDUP_AGENDA.reduce((s, a) => s + a.minutes, 0)

  const hqCount   = day?.leaders.filter(l => l.location === 'HQ').length ?? 0
  const awayCount = (day?.leaders.length ?? 0) - hqCount

  return (
    <div className={styles.syncPage}>
      <SyncMission
        icon="fa-users" title="Weekly Stand-Up" cadence="Weekly"
        bluf="Account for all leaders, lock the week's battle rhythm, confirm training schedule, and assign emerging taskings — one source of truth for where everybody is."
        time="0900 Monday" location="BN Conference Room, Bldg 1320"
        chair="XO (MAJ Ortega)" prepPct={75}
      />

      <div className={styles.drillLayout}>
        <DrillPanel label="Inputs" icon="fa-database" accent="#2980b9">
          <div className={styles.inputMetricsGrid}>
            <InputMetric label="At HQ"        value={hqCount}   color="#27ae60" sub="leaders" />
            <InputMetric label="Away"          value={awayCount} color="#e69c3c" sub="TDY/Leave/PDY" />
            <InputMetric label="Open Actions"  value={ACTION_ITEMS.filter(a => a.status !== 'Complete').length} color="#c9a227" sub="items" />
            <InputMetric label="Overdue"       value={ACTION_ITEMS.filter(a => a.status === 'Overdue').length} color="#e74c3c" sub="items" />
          </div>
          <div className={styles.inputBlock}>
            <div className={styles.inputBlockTitle}>Location Legend</div>
            {[
              { code: 'HQ',    label: 'Present at HQ',    color: '#27ae60' },
              { code: 'PDY',   label: 'Present for Duty', color: '#f39c12' },
              { code: 'Range', label: 'Range / Field',    color: '#f39c12' },
              { code: 'TDY-*', label: 'Temporary Duty',   color: '#2980b9' },
              { code: 'Leave', label: 'Approved Leave',   color: '#8e44ad' },
              { code: 'Med',   label: 'Medical Appt',     color: '#e74c3c' },
            ].map(l => (
              <div key={l.code} className={styles.inputBlockRow}>
                <span className={styles.inputBlockCode} style={{ color: l.color }}>{l.code}</span>
                <span className={styles.inputBlockText}>{l.label}</span>
              </div>
            ))}
          </div>
        </DrillPanel>

        <DrillPanel label="Agenda" icon="fa-list-ol" accent="#c9a227">
          {STANDUP_AGENDA.map((item, i) => <AgendaRow key={i} item={item} idx={i} />)}
          <div className={styles.drillAgendaTotal}>Total: {totalMins} min</div>
        </DrillPanel>

        <DrillPanel label="Outputs" icon="fa-arrow-right" accent="#27ae60">
          {STANDUP_OUTPUTS.map((o, i) => <OutputCard key={i} item={o} />)}
        </DrillPanel>
      </div>

      <div className={styles.dayTabRow}>
        {STANDUP_DAYS.map(d => (
          <button key={d.id}
            className={`${styles.dayTabBtn} ${activeDayId === d.id ? styles.dayTabBtnActive : ''}`}
            onClick={() => setSelectedDay(d.id)}>
            {d.label}
            <span className={styles.dayCount}>{d.leaders.length}</span>
          </button>
        ))}
      </div>

      <div className={styles.legendBar}>
        {[
          { label: 'HQ', color: '#27ae60' }, { label: 'PDY', color: '#f39c12' },
          { label: 'Range', color: '#f39c12' }, { label: 'Leave', color: '#8e44ad' },
          { label: 'TDY', color: '#2980b9' }, { label: 'Medical', color: '#e74c3c' },
        ].map(l => (
          <span key={l.label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: l.color }} />{l.label}
          </span>
        ))}
      </div>

      {day && (
        <SCard title={`${day.label} — ${day.leaders.length} Leaders`} icon="fa-calendar-day">
          <div className={shared.tableWrap}>
            <table className={styles.syncTable}>
              <thead>
                <tr><th style={{ width: 60 }}>Rank</th><th>Name</th><th>Role</th><th style={{ width: 110 }}>Location</th><th>Notes / Activity</th></tr>
              </thead>
              <tbody>
                {day.leaders.map(l => (
                  <tr key={l.dodid}>
                    <td style={{ fontWeight: 700, color: '#666', fontSize: 11 }}>{l.rank}</td>
                    <td style={{ fontWeight: 600, color: '#222' }}>{l.name}</td>
                    <td style={{ fontSize: 11, color: '#555' }}>{l.role}</td>
                    <td>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: '2px 8px',
                        borderRadius: 3, background: `${locColor(l.location)}18`,
                        border: `1px solid ${locColor(l.location)}44`, color: locColor(l.location),
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>{l.location}</span>
                    </td>
                    <td style={{ fontSize: 11, color: '#777', fontStyle: 'italic' }}>{l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SCard>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── WEEKLY CLOSE-OUT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const CLOSEOUT_AGENDA: DrillAgendaItem[] = [
  { time: '1500', topic: 'Roll call & setting conditions',        owner: 'XO',  minutes: 2  },
  { time: '1502', topic: 'Week\'s accomplishments (all sections)', owner: 'All', minutes: 20 },
  { time: '1522', topic: 'Overdue items & suspenses',             owner: 'XO',  minutes: 8  },
  { time: '1530', topic: 'Next week top 5 priorities',            owner: 'CDR', minutes: 10, highlight: true },
  { time: '1540', topic: 'CDR weekly notes & guidance',           owner: 'CDR', minutes: 8,  highlight: true },
  { time: '1548', topic: 'Safety brief & dismissal',              owner: 'XO',  minutes: 5  },
]

const CLOSEOUT_OUTPUTS: DrillOutput[] = [
  { product: 'CDR weekly notes published',         owner: 'CDR', due: 'End of sync', type: 'Product'      },
  { product: 'Top 5 priorities next week',          owner: 'XO',  due: 'End of sync', type: 'Decision'     },
  { product: 'Overdue items escalated / extended',  owner: 'XO',  due: 'Same day',    type: 'Action'       },
  { product: 'Weekly status report to Group',       owner: 'J3',  due: 'NLT 1700',   type: 'Product'      },
  { product: 'Updated action log (closed items)',   owner: 'XO',  due: 'NLT 1600',   type: 'Coordination' },
]

function CloseOutPage() {
  const [selectedDay, setSelectedDay] = useState('friday_co')
  const activeDayId = CLOSEOUT_DAYS.some(d => d.id === selectedDay) ? selectedDay : CLOSEOUT_DAYS[0]?.id ?? ''
  const day = CLOSEOUT_DAYS.find(d => d.id === activeDayId) ?? CLOSEOUT_DAYS[0]
  const totalMins = CLOSEOUT_AGENDA.reduce((s, a) => s + a.minutes, 0)

  const accomplishments = [
    'ODA-5213 CQB Certification completed — 12/12 pass rate',
    'CENTCOM CA Annex submitted to Group on time',
    'ACFT test window closed — B Co 91.2% pass rate',
    'FLPP audit complete — zero discrepancies',
    'Targeting package submitted to Group SIPR',
  ]
  const nextWeek = [
    'ODA-5213 Pre-Deployment Brief (Mon 0700)',
    'Monthly Operations Sync (Thu 0900)',
    'ODA-5221 ACFT Retest — 2 soldiers',
    'Submit Wk 28 Training Schedule (OVERDUE — J7 action)',
    'Resource Sync prep — J4 and J8 prepare slides',
  ]
  const overdueItems = ACTION_ITEMS.filter(a => a.status === 'Overdue')

  return (
    <div className={styles.syncPage}>
      <SyncMission
        icon="fa-moon" title="Weekly Close-Out" cadence="Weekly"
        bluf="Close the week with CDR: assess accomplishments, own the overdue items, set priorities for next week, and publish CDR guidance — the week doesn't end until this is done."
        time="1500 Friday" location="BN Conference Room, Bldg 1320"
        chair="CDR (LTC Bradley)" prepPct={60}
      />

      <div className={styles.drillLayout}>
        <DrillPanel label="Inputs" icon="fa-database" accent="#2980b9">
          <div className={styles.inputMetricsGrid}>
            <InputMetric label="Accomplishments" value={accomplishments.length} color="#27ae60" sub="this week" />
            <InputMetric label="Overdue Items"   value={overdueItems.length}   color={overdueItems.length > 0 ? '#e74c3c' : '#555'} sub="actions" />
            <InputMetric label="Open Actions"    value={ACTION_ITEMS.filter(a => a.status !== 'Complete').length} color="#c9a227" sub="total" />
            <InputMetric label="Next Week Prep"  value="60%" color="#e69c3c" sub="items ready" />
          </div>
          <div className={styles.inputBlock}>
            <div className={styles.inputBlockTitle}>Overdue Items Requiring CDR Visibility</div>
            {overdueItems.length > 0 ? overdueItems.map((a, i) => (
              <div key={i} className={styles.inputBlockRow}>
                <span className={styles.inputBlockCode} style={{ color: '#e74c3c' }}>{a.opr}</span>
                <span className={styles.inputBlockText}>{a.item}</span>
              </div>
            )) : (
              <div className={styles.inputBlockRow}>
                <span className={styles.inputBlockText} style={{ color: '#27ae60' }}>No overdue items this week.</span>
              </div>
            )}
          </div>
        </DrillPanel>

        <DrillPanel label="Agenda" icon="fa-list-ol" accent="#c9a227">
          {CLOSEOUT_AGENDA.map((item, i) => <AgendaRow key={i} item={item} idx={i} />)}
          <div className={styles.drillAgendaTotal}>Total: {totalMins} min</div>
        </DrillPanel>

        <DrillPanel label="Outputs" icon="fa-arrow-right" accent="#27ae60">
          {CLOSEOUT_OUTPUTS.map((o, i) => <OutputCard key={i} item={o} />)}
        </DrillPanel>
      </div>

      <div className={styles.dayTabRow}>
        {CLOSEOUT_DAYS.map(d => (
          <button key={d.id}
            className={`${styles.dayTabBtn} ${activeDayId === d.id ? styles.dayTabBtnActive : ''}`}
            onClick={() => setSelectedDay(d.id)}>
            {d.label}
          </button>
        ))}
      </div>

      <div className={styles.twoCol}>
        <div className={styles.colMain}>
          {day && (
            <SCard title={`${day.label} — Section Closeout Roster`} icon="fa-calendar-check">
              <div className={shared.tableWrap}>
                <table className={styles.syncTable}>
                  <thead>
                    <tr><th style={{ width: 60 }}>Rank</th><th>Name</th><th>Role</th><th>Closeout Notes</th></tr>
                  </thead>
                  <tbody>
                    {day.leaders.map(l => (
                      <tr key={l.dodid}>
                        <td style={{ fontWeight: 700, color: '#666', fontSize: 11 }}>{l.rank}</td>
                        <td style={{ fontWeight: 600, color: '#222' }}>{l.name}</td>
                        <td style={{ fontSize: 11, color: '#555' }}>{l.role}</td>
                        <td style={{ fontSize: 11, color: '#777', fontStyle: 'italic' }}>{l.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SCard>
          )}
        </div>

        <div className={styles.colSide}>
          <SCard title="Week's Accomplishments" icon="fa-check-double">
            <div className={styles.bulletList}>
              {accomplishments.map((a, i) => (
                <div key={i} className={styles.bulletItem}>
                  <i className="fas fa-check" style={{ color: '#27ae60', fontSize: 10, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#555' }}>{a}</span>
                </div>
              ))}
            </div>
          </SCard>
          <SCard title="Next Week's Top 5" icon="fa-arrow-right">
            <div className={styles.bulletList}>
              {nextWeek.map((n, i) => (
                <div key={i} className={styles.bulletItem}>
                  <i className="fas fa-chevron-right" style={{ color: '#c9a227', fontSize: 9, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: n.includes('OVERDUE') ? '#e74c3c' : '#555' }}>{n}</span>
                </div>
              ))}
            </div>
          </SCard>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── GENERIC SYNC CONFIGS (Monthly / Quarterly / Annual) ───────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

interface GenericSyncConfig {
  title: string; cadence: Cadence; icon: string; bluf: string
  time: string; location: string; chair: string; classification?: string
  totalMinutes: number
  agenda: DrillAgendaItem[]
  outputs: DrillOutput[]
  inputSections: InputSection[]
}

const SYNC_CONFIGS: Record<string, GenericSyncConfig> = {
  'operations-sync': {
    title: 'Operations Sync', cadence: 'Monthly', icon: 'fa-cogs', bluf:
      'Synchronize BN readiness and deployment pipeline across all sections; align priorities and surface CDR decisions for the month ahead.',
    time: 'Monthly — 3rd Thursday, 0900', location: 'Operations Center, Bldg 1310 (SIPR)', chair: 'CDR (LTC Bradley)',
    totalMinutes: 120,
    agenda: [
      { time: '0900', topic: 'Welcome, purpose & ground rules',      owner: 'CDR', minutes: 3  },
      { time: '0903', topic: 'Current readiness overview',           owner: 'J3',  minutes: 15 },
      { time: '0918', topic: 'ODA deployment & training pipeline',   owner: 'J3',  minutes: 15 },
      { time: '0933', topic: 'Intelligence picture',                 owner: 'J2',  minutes: 10 },
      { time: '0943', topic: 'Logistics readiness (J4)',             owner: 'J4',  minutes: 10 },
      { time: '0953', topic: 'Communications & networks status',     owner: 'J6',  minutes: 8  },
      { time: '1001', topic: 'Personnel & training (J1 / J7)',       owner: 'J1',  minutes: 15 },
      { time: '1016', topic: 'Upcoming events & deconfliction',      owner: 'All', minutes: 14 },
      { time: '1030', topic: 'CDR guidance & decisions',             owner: 'CDR', minutes: 15, highlight: true },
      { time: '1045', topic: 'Action items captured & close',        owner: 'XO',  minutes: 5  },
    ],
    outputs: [
      { product: 'Monthly priority order',   owner: 'CDR', due: 'End of sync', type: 'Decision'     },
      { product: 'Updated BN action log',    owner: 'XO',  due: 'NLT 1300',   type: 'Product'      },
      { product: 'Battle rhythm adjustments',owner: 'J3',  due: 'NLT 1600',   type: 'Action'       },
      { product: 'Group SITREP update',      owner: 'J3',  due: 'NLT 1700',   type: 'Coordination' },
    ],
    inputSections: [
      { section: 'J3', contribution: 'Readiness status (current cycle) — ODA matrix, deployment pipeline', status: 'In Progress' },
      { section: 'J2', contribution: 'Monthly threat summary — SIGINT, HUMINT picture, emerging threats',  status: 'Pending'     },
      { section: 'J4', contribution: 'Logistics status — motor pool readiness, deadline vehicles, parts',  status: 'Pending'     },
      { section: 'J1', contribution: 'Personnel readiness — manning vs. MTOE, medical/ACFT readiness',    status: 'Pending'     },
      { section: 'J7', contribution: 'Training metrics — ACFT, DTMS completion, METL ratings',            status: 'Pending'     },
      { section: 'J6', contribution: 'Network status — NIPR/SIPR/comms health, AUP compliance',           status: 'Ready'       },
    ],
  },

  'resource-sync': {
    title: 'Resource Sync', cadence: 'Monthly', icon: 'fa-boxes', bluf:
      'Align budget execution, property accountability, and personnel resource requests — ensure the BN stays on track for fiscal and property obligations.',
    time: 'Monthly — 4th Friday, 1300', location: 'Admin Conference Room, Bldg 1320', chair: 'XO (MAJ Ortega)',
    totalMinutes: 90,
    agenda: [
      { time: '1300', topic: 'Budget execution status',              owner: 'J8',  minutes: 12 },
      { time: '1312', topic: 'Property accountability review',       owner: 'J4',  minutes: 12 },
      { time: '1324', topic: 'Travel / DTS status & approvals',      owner: 'J1',  minutes: 10 },
      { time: '1334', topic: 'Equipment deadline review',            owner: 'J4',  minutes: 10 },
      { time: '1344', topic: 'Manning vs. MTOE authorization',       owner: 'J1',  minutes: 12 },
      { time: '1356', topic: 'Pending resource requests / actions',  owner: 'All', minutes: 12 },
      { time: '1408', topic: 'XO decisions & action assignments',    owner: 'XO',  minutes: 10, highlight: true },
      { time: '1418', topic: 'Close',                                owner: 'XO',  minutes: 2  },
    ],
    outputs: [
      { product: 'Budget allocations confirmed',    owner: 'J8',  due: 'End of sync', type: 'Decision' },
      { product: 'Property discrepancies actioned', owner: 'J4',  due: 'NLT D+5',    type: 'Action'   },
      { product: 'Updated resource report',         owner: 'J8',  due: 'NLT D+3',    type: 'Product'  },
      { product: 'Travel priorities approved',      owner: 'XO',  due: 'End of sync', type: 'Decision' },
    ],
    inputSections: [
      { section: 'J8',  contribution: 'Budget execution report — % obligated, remaining, pending auth',    status: 'Pending' },
      { section: 'J4',  contribution: 'Property book update — hand receipts, deadlines, shortage annexes', status: 'Pending' },
      { section: 'J1',  contribution: 'Manning status vs. MTOE — vacancies, gains/losses pipeline',       status: 'Pending' },
      { section: 'All', contribution: 'Open resource requests submitted to XO NLT D-5',                   status: 'Pending' },
    ],
  },

  'staff-deep-dives': {
    title: 'Staff Deep Dives', cadence: 'Monthly', icon: 'fa-search', bluf:
      'One section per month provides a comprehensive, data-backed deep dive into their functional area — no sugar-coating, problems and solutions on the table for CDR decision.',
    time: 'Monthly — 2nd Wednesday, 1300', location: 'CDR Conference Room', chair: 'CDR (LTC Bradley)',
    totalMinutes: 75,
    agenda: [
      { time: '1300', topic: 'Presenting section overview',        owner: 'Section OIC', minutes: 5  },
      { time: '1305', topic: 'Current state assessment',           owner: 'Section',     minutes: 15 },
      { time: '1320', topic: 'Problem sets & capability gaps',     owner: 'Section',     minutes: 15 },
      { time: '1335', topic: 'Proposed solutions & requirements',  owner: 'Section',     minutes: 15 },
      { time: '1350', topic: 'Q&A from staff',                     owner: 'All',         minutes: 5  },
      { time: '1355', topic: 'CDR guidance & decisions',           owner: 'CDR',         minutes: 10, highlight: true },
      { time: '1405', topic: 'Action items captured & close',      owner: 'XO',          minutes: 5  },
    ],
    outputs: [
      { product: 'CDR decisions on section gaps',   owner: 'CDR', due: 'End of sync', type: 'Decision'     },
      { product: 'Resource / personnel requests',   owner: 'OIC', due: 'NLT D+3',    type: 'Action'       },
      { product: 'Section improvement plan',        owner: 'OIC', due: 'NLT D+10',   type: 'Product'      },
      { product: 'Cross-section coordination items',owner: 'XO',  due: 'NLT D+5',    type: 'Coordination' },
    ],
    inputSections: [
      { section: 'Presenting', contribution: 'Comprehensive functional brief — current state, gaps, solutions', status: 'Pending' },
      { section: 'All',        contribution: 'Cross-section input to presenting section (NLT D-7)',             status: 'Pending' },
      { section: 'J1',         contribution: 'Manning data relevant to presenting section',                     status: 'Ready'   },
      { section: 'J8',         contribution: 'Budget data relevant to presenting section',                      status: 'Ready'   },
    ],
  },

  'working-group': {
    title: 'Working Group Forum', cadence: 'Monthly', icon: 'fa-people-arrows', bluf:
      'Cross-functional working groups brief status, surface issues, and receive CDR guidance — ensuring mandatory programs are resourced and functioning across the BN.',
    time: 'Monthly — 1st Tuesday, 1400', location: 'Admin Conference Room', chair: 'XO (MAJ Ortega)',
    totalMinutes: 90,
    agenda: [
      { time: '1400', topic: 'Purpose & ground rules',             owner: 'XO',   minutes: 2  },
      { time: '1402', topic: 'Safety Working Group status',        owner: 'SGT',  minutes: 12 },
      { time: '1414', topic: 'Equal Opportunity status',           owner: 'EOA',  minutes: 12 },
      { time: '1426', topic: 'SHARP / SAPR update',                owner: 'SARC', minutes: 12 },
      { time: '1438', topic: 'Suicide Prevention (ASIST)',          owner: 'Chap', minutes: 10 },
      { time: '1448', topic: 'Physical Security update',           owner: 'S2',   minutes: 10 },
      { time: '1458', topic: 'CDR remarks, guidance & decisions',  owner: 'CDR',  minutes: 10, highlight: true },
      { time: '1508', topic: 'Actions captured & dismissal',       owner: 'XO',   minutes: 5  },
    ],
    outputs: [
      { product: 'Program health assessment (all WGs)',  owner: 'XO',  due: 'End of sync', type: 'Product'      },
      { product: 'CDR guidance to WG leads',             owner: 'CDR', due: 'End of sync', type: 'Decision'     },
      { product: 'Resource requests from working groups',owner: 'WGs', due: 'NLT D+5',    type: 'Action'       },
      { product: 'Compliance tracking update',           owner: 'XO',  due: 'NLT D+3',    type: 'Coordination' },
    ],
    inputSections: [
      { section: 'Safety', contribution: 'Safety metrics, incidents, training completion', status: 'Pending' },
      { section: 'EOA',    contribution: 'EO complaint status, training compliance',       status: 'Pending' },
      { section: 'SARC',   contribution: 'SHARP reporting metrics, training completion',   status: 'Pending' },
      { section: 'Chap',   contribution: 'Suicide prevention metrics, outreach programs',  status: 'Pending' },
      { section: 'CSM',    contribution: 'NCO program input across all working groups',    status: 'Pending' },
    ],
  },

  'decision-forum': {
    title: 'Decision Forum', cadence: 'Monthly', icon: 'fa-gavel', bluf:
      'Staffed decision packages reach CDR authority — every item enters as a recommendation, leaves as a decision with an owner and a due date.',
    time: 'Monthly — Last Thursday, 1300', location: 'CDR Conference Room', chair: 'CDR (LTC Bradley)',
    totalMinutes: 75,
    agenda: [
      { time: '1300', topic: 'Purpose & decision queue overview',  owner: 'XO',  minutes: 3  },
      { time: '1303', topic: 'Decision 1 — staffed by sponsor',    owner: 'J3',  minutes: 12, highlight: true },
      { time: '1315', topic: 'Decision 2 — staffed by sponsor',    owner: 'J1',  minutes: 12, highlight: true },
      { time: '1327', topic: 'Decision 3 — staffed by sponsor',    owner: 'J8',  minutes: 12, highlight: true },
      { time: '1339', topic: 'CDR decision(s) recorded',           owner: 'CDR', minutes: 10, highlight: true },
      { time: '1349', topic: 'Action assignments & suspenses',      owner: 'XO',  minutes: 10 },
      { time: '1359', topic: 'Close',                              owner: 'XO',  minutes: 2  },
    ],
    outputs: [
      { product: 'CDR decision record (all items)',  owner: 'J1',  due: 'NLT EOD', type: 'Decision'     },
      { product: 'Action assignments with suspenses',owner: 'XO',  due: 'NLT EOD', type: 'Action'       },
      { product: 'Staffed items returned for action',owner: 'OPR', due: 'NLT D+1', type: 'Product'      },
      { product: 'Group notification (if required)', owner: 'J5',  due: 'NLT D+3', type: 'Coordination' },
    ],
    inputSections: [
      { section: 'All', contribution: 'Decision requests submitted to XO NLT D-5 for staffing',  status: 'Pending' },
      { section: 'J3',  contribution: 'Operational decision packages (briefed to staff NLT D-3)', status: 'Pending' },
      { section: 'J1',  contribution: 'Personnel action decision packages',                       status: 'Pending' },
      { section: 'J8',  contribution: 'Resource / financial decision packages',                   status: 'Pending' },
    ],
  },

  'strategy-review': {
    title: 'Strategy Review', cadence: 'Quarterly', icon: 'fa-chart-line', bluf:
      'Evaluate BN performance against the campaign plan, assess the strategic environment, and adjust priorities for the next quarter — the CDR makes the call on what matters most.',
    time: 'Quarterly — End of quarter, 0800', location: 'Group Conference Room (SIPR)', chair: 'CDR (LTC Bradley)',
    totalMinutes: 180,
    agenda: [
      { time: '0800', topic: 'Campaign Plan assessment',            owner: 'J5',  minutes: 30 },
      { time: '0830', topic: 'METL ratings update',                 owner: 'J7',  minutes: 20 },
      { time: '0850', topic: 'Strategic intelligence assessment',   owner: 'J2',  minutes: 20 },
      { time: '0910', topic: 'Readiness vs. requirement',           owner: 'J3',  minutes: 20 },
      { time: '0930', topic: 'Resource alignment (J8 / J4)',        owner: 'J8',  minutes: 20 },
      { time: '0950', topic: 'Priority adjustments for Qtr+1',     owner: 'CDR', minutes: 25, highlight: true },
      { time: '1015', topic: 'Action items & campaign plan update', owner: 'J5',  minutes: 15 },
    ],
    outputs: [
      { product: 'Updated campaign plan priorities',    owner: 'J5',  due: 'NLT D+7',  type: 'Product'      },
      { product: 'METL assessment updated',             owner: 'J7',  due: 'NLT D+5',  type: 'Product'      },
      { product: 'CDR quarterly guidance memo',         owner: 'CDR', due: 'NLT D+3',  type: 'Decision'     },
      { product: 'Resource reallocation (if required)', owner: 'J8',  due: 'NLT D+10', type: 'Action'       },
    ],
    inputSections: [
      { section: 'J5',  contribution: 'Campaign Plan assessment vs. objectives (% complete, adjustments)', status: 'Pending' },
      { section: 'J7',  contribution: 'METL assessment — T/P/U ratings for collective tasks',              status: 'Pending' },
      { section: 'J2',  contribution: 'Quarterly threat assessment — strategic environment changes',        status: 'Pending' },
      { section: 'J3',  contribution: 'Readiness assessment vs. mission requirement',                      status: 'Pending' },
      { section: 'All', contribution: 'Section input to J5 NLT D-14',                                     status: 'Pending' },
    ],
  },

  'leader-dev-forum': {
    title: 'Leader Development Forum', cadence: 'Quarterly', icon: 'fa-graduation-cap', bluf:
      'Invest in NCO and officer professional development — books, cases, counseling status, PME — the CDR and CSM set the tone for how leaders grow in this battalion.',
    time: 'Quarterly — Mid-quarter, 1300', location: 'BN Conference Room', chair: 'CSM (CSM Robinson)',
    totalMinutes: 120,
    agenda: [
      { time: '1300', topic: 'CDR vision & developmental tone',    owner: 'CDR',     minutes: 15 },
      { time: '1315', topic: 'Leader book reviews (selected)',      owner: 'Leaders', minutes: 30 },
      { time: '1345', topic: 'Case study discussion',              owner: 'All',     minutes: 20 },
      { time: '1405', topic: 'OER / NCOER counseling status',      owner: 'J1',      minutes: 10 },
      { time: '1415', topic: 'PME completion & enrollment status', owner: 'J7',      minutes: 10 },
      { time: '1425', topic: 'CSM remarks & guidance',             owner: 'CSM',     minutes: 10, highlight: true },
      { time: '1435', topic: 'Actions & close',                    owner: 'XO',      minutes: 5  },
    ],
    outputs: [
      { product: 'CDR / CSM developmental guidance',        owner: 'CDR', due: 'Published D+3', type: 'Product'      },
      { product: 'OER/NCOER counseling deficiencies fixed', owner: 'J1',  due: 'NLT D+10',     type: 'Action'       },
      { product: 'Next LDF book / case study selected',     owner: 'CSM', due: 'End of forum',  type: 'Decision'     },
      { product: 'PME gaps actioned',                       owner: 'J7',  due: 'NLT D+7',      type: 'Coordination' },
    ],
    inputSections: [
      { section: 'J1',  contribution: 'OER/NCOER counseling completion status by section',    status: 'Pending' },
      { section: 'J7',  contribution: 'PME enrollment and completion data — all ranks',       status: 'Pending' },
      { section: 'CDR', contribution: 'Book / case study selected for discussion (NLT D-14)', status: 'Pending' },
      { section: 'CSM', contribution: 'NCO professional development agenda items',            status: 'Ready'   },
    ],
  },

  'campaign-workshop': {
    title: 'Campaign Workshop', cadence: 'Annual', icon: 'fa-map-marked-alt', bluf:
      'Three days off-garrison to set BN priorities, objectives, and training focus for the coming year — this is where the CDR\'s intent becomes the campaign plan.',
    time: 'Annual — January, 3-day offsite', location: 'JSOC Training Annex, Fort Bragg', chair: 'CDR (LTC Bradley)',
    totalMinutes: 1440,
    agenda: [
      { time: 'Day 1 AM',  topic: 'CDR intent, priorities & guidance',      owner: 'CDR', minutes: 120 },
      { time: 'Day 1 PM',  topic: 'Environmental assessment (J2 / J5)',     owner: 'J2',  minutes: 180 },
      { time: 'Day 2 AM',  topic: 'Mission analysis & COA development',     owner: 'J3',  minutes: 240, highlight: true },
      { time: 'Day 2 PM',  topic: 'Wargame & COA comparison',               owner: 'All', minutes: 240 },
      { time: 'Day 3 AM',  topic: 'Campaign plan draft review',             owner: 'J5',  minutes: 180, highlight: true },
      { time: 'Day 3 PM',  topic: 'Resource alignment & tasking',           owner: 'XO',  minutes: 120 },
      { time: 'Day 3 Eve', topic: 'Final CDR guidance & publication plan',  owner: 'CDR', minutes: 60, highlight: true },
    ],
    outputs: [
      { product: 'BN Campaign Plan (draft)',       owner: 'J5',  due: 'D+14', type: 'Product'      },
      { product: 'Annual priorities published',    owner: 'CDR', due: 'D+7',  type: 'Decision'     },
      { product: 'Section tasking orders',         owner: 'XO',  due: 'D+10', type: 'Action'       },
      { product: 'Training focus areas for FY',    owner: 'J7',  due: 'D+10', type: 'Coordination' },
      { product: 'Resource plan (POM submission)', owner: 'J8',  due: 'D+21', type: 'Product'      },
    ],
    inputSections: [
      { section: 'J5', contribution: 'Previous year AAR & lessons learned — what worked, what didn\'t', status: 'Pending' },
      { section: 'J2', contribution: 'Annual strategic intelligence estimate — threat environment',       status: 'Pending' },
      { section: 'J3', contribution: 'Readiness baseline assessment — where the BN stands today',        status: 'Pending' },
      { section: 'J7', contribution: 'Training gap analysis — METL vs. current proficiency',             status: 'Pending' },
      { section: 'J8', contribution: 'Resource projection (POM cycle) — what we need vs. what we have', status: 'Pending' },
    ],
  },

  'budget-review': {
    title: 'Budget Review', cadence: 'Annual', icon: 'fa-dollar-sign', bluf:
      'Distribute the annual operating budget, establish FY spending priorities by section, and set the conditions for the BN to execute its mission without running out of money.',
    time: 'Annual — October (FY start)', location: 'Admin Conference Room, Bldg 1320', chair: 'XO (MAJ Ortega)',
    totalMinutes: 180,
    agenda: [
      { time: '0800', topic: 'Prior FY execution overview',        owner: 'J8',  minutes: 30 },
      { time: '0830', topic: 'New FY allocation presentation',     owner: 'J8',  minutes: 20 },
      { time: '0850', topic: 'Section budget requests (J1–J9)',    owner: 'All', minutes: 60 },
      { time: '0950', topic: 'Prioritization & adjudication',      owner: 'XO',  minutes: 25, highlight: true },
      { time: '1015', topic: 'CDR decisions on allocation',        owner: 'CDR', minutes: 15, highlight: true },
      { time: '1030', topic: 'Section budget execution plans',     owner: 'All', minutes: 10 },
      { time: '1040', topic: 'Close',                              owner: 'XO',  minutes: 5  },
    ],
    outputs: [
      { product: 'FY budget allocation by section', owner: 'J8',  due: 'D+3',  type: 'Decision'     },
      { product: 'Section execution plans',         owner: 'All', due: 'D+10', type: 'Product'      },
      { product: 'Unfunded requirement list',       owner: 'XO',  due: 'D+5',  type: 'Product'      },
      { product: 'Budget tracking system updated',  owner: 'J8',  due: 'D+3',  type: 'Coordination' },
    ],
    inputSections: [
      { section: 'J8',  contribution: 'Prior FY execution report — % used, savings, carryover', status: 'Pending' },
      { section: 'All', contribution: 'Section budget requests submitted NLT Sep 15',           status: 'Pending' },
      { section: 'J4',  contribution: 'Maintenance / equipment cost projections',               status: 'Pending' },
      { section: 'J7',  contribution: 'Training resource requirements for FY',                  status: 'Pending' },
    ],
  },

  'manning-review': {
    title: 'Manning Review', cadence: 'Annual', icon: 'fa-users-cog', bluf:
      'Review BN manning against MTOE, surface critical shortfalls and key leader vacancies, and plan HRC requisitions to keep the BN at fighting strength through the year.',
    time: 'Annual — February', location: 'CDR Conference Room', chair: 'CDR (LTC Bradley)',
    totalMinutes: 135,
    agenda: [
      { time: '0800', topic: 'MTOE vs. assigned strength',         owner: 'J1',  minutes: 20 },
      { time: '0820', topic: 'Critical MOS shortfalls',            owner: 'J1',  minutes: 15 },
      { time: '0835', topic: 'Key leader vacancies & succession',  owner: 'J1',  minutes: 15 },
      { time: '0850', topic: 'DEROS pipeline (next 12 months)',    owner: 'J1',  minutes: 15 },
      { time: '0905', topic: 'HRC requisition status',             owner: 'J1',  minutes: 10 },
      { time: '0915', topic: 'Retention / reenlistment outlook',   owner: 'J1',  minutes: 10 },
      { time: '0925', topic: 'CDR decisions & HRC priorities',     owner: 'CDR', minutes: 15, highlight: true },
      { time: '0940', topic: 'Action items & close',               owner: 'XO',  minutes: 5  },
    ],
    outputs: [
      { product: 'CDR manning priorities (to HRC)',    owner: 'J1',  due: 'D+5',  type: 'Decision'     },
      { product: 'Requisition package (priority MOS)', owner: 'J1',  due: 'D+10', type: 'Product'      },
      { product: 'Retention target list',              owner: 'J1',  due: 'D+7',  type: 'Action'       },
      { product: 'DEROS / departure board updated',    owner: 'J1',  due: 'D+3',  type: 'Coordination' },
    ],
    inputSections: [
      { section: 'J1',  contribution: 'Full manning analysis — MTOE vs. assigned vs. available', status: 'Pending' },
      { section: 'J1',  contribution: 'DEROS and departure projections (12-month look)',         status: 'Pending' },
      { section: 'J7',  contribution: 'MOS-qualified strength vs. requirement',                 status: 'Pending' },
      { section: 'CDR', contribution: 'CDR priority MOS list (submit to J1 NLT D-7)',           status: 'Pending' },
    ],
  },
}

function GenericSyncPage({ syncKey }: { syncKey: string }) {
  const cfg = SYNC_CONFIGS[syncKey]
  if (!cfg) return (
    <div className={styles.syncPage}>
      <div style={{ padding: 20, color: '#888' }}>Sync "{syncKey}" not found.</div>
    </div>
  )

  const readyCount = cfg.inputSections.filter(s => s.status === 'Ready').length
  const prepPct    = Math.round((readyCount / cfg.inputSections.length) * 100)
  const totalMins  = cfg.agenda.reduce((s, a) => s + a.minutes, 0)

  return (
    <div className={styles.syncPage}>
      <SyncMission
        icon={cfg.icon} title={cfg.title} cadence={cfg.cadence} bluf={cfg.bluf}
        time={cfg.time} location={cfg.location} chair={cfg.chair}
        classification={cfg.classification} prepPct={prepPct}
      />

      <div className={styles.drillLayout}>
        <DrillPanel label="Inputs" icon="fa-database" accent="#2980b9">
          <div className={styles.inputMetricsGrid}>
            <InputMetric label="Total Items"  value={cfg.inputSections.length}                              color="#222"    sub="expected"  />
            <InputMetric label="Ready"        value={readyCount}                                            color="#27ae60" sub="submitted" />
            <InputMetric label="Pending"      value={cfg.inputSections.filter(s => s.status === 'Pending').length} color="#e69c3c" sub="awaited" />
            <InputMetric label="Meeting Time" value={`${totalMins}m`}                                      color="#888"    sub="budgeted"  />
          </div>
          <InputBlock title="Section Contributions" rows={cfg.inputSections} />
        </DrillPanel>

        <DrillPanel label="Agenda" icon="fa-list-ol" accent="#c9a227">
          {cfg.agenda.map((item, i) => <AgendaRow key={i} item={item} idx={i} />)}
          <div className={styles.drillAgendaTotal}>Total: {totalMins} min</div>
        </DrillPanel>

        <DrillPanel label="Outputs" icon="fa-arrow-right" accent="#27ae60">
          {cfg.outputs.map((o, i) => <OutputCard key={i} item={o} />)}
        </DrillPanel>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function DigitalSyncs({ subPage = 'overview', onNavigate }: Props) {
  switch (subPage) {
    case 'overview':            return <OverviewPage onNavigate={onNavigate} />
    case 'admin-review':        return <AdminReviewPage />
    case 'operations-review':   return <OpsReviewPage />
    case 'stand-up':            return <StandUpPage />
    case 'close-out':           return <CloseOutPage />
    case 'operations-sync':
    case 'resource-sync':
    case 'staff-deep-dives':
    case 'working-group':
    case 'decision-forum':
    case 'strategy-review':
    case 'leader-dev-forum':
    case 'campaign-workshop':
    case 'budget-review':
    case 'manning-review':      return <GenericSyncPage syncKey={subPage} />
    default:                    return <OverviewPage onNavigate={onNavigate} />
  }
}
