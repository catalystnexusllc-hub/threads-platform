import { useState } from 'react'
import { useArmyData } from '../../ArmyDataContext'
import { STATUS_COLOR } from '../util'
import shared from '../shared.module.css'

type Tab = 'overview' | 'roster' | 'aid-station' | 'readiness'

interface Props {
  initialTab?: Tab
  onNavigate?: (page: string) => void
}

const EXTERNAL_NAV = [
  { key: 'med-dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
  { key: 'med-reports',   label: 'Reports',   icon: 'fa-file-alt'       },
  { key: 'med-tracker',   label: 'Tracker',   icon: 'fa-tasks'          },
  { key: 'med-requests',  label: 'Requests',  icon: 'fa-inbox'          },
  { key: 'med-resources', label: 'Resources', icon: 'fa-folder-open'    },
]

const MED_MOS_PREFIXES = ['68', '60', '65']

const AID_STATIONS = [
  { name: 'Main Aid Station',      location: 'Bldg 1234 — Fort Campbell, KY', status: 'Operational', capacity: '12 beds', staffed: true  },
  { name: 'Forward Aid Station A', location: 'Range Complex, Area 12',         status: 'Standby',     capacity: '4 beds',  staffed: false },
  { name: 'Forward Aid Station B', location: 'Training Area 7',                status: 'Offline',     capacity: '4 beds',  staffed: false },
]

const STATION_COLOR: Record<string, string> = {
  Operational: '#27ae60',
  Standby:     '#e69c3c',
  Offline:     '#e74c3c',
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview',    label: 'Overview',    icon: 'fa-heartbeat'   },
  { key: 'roster',      label: 'Personnel',   icon: 'fa-user-md'     },
  { key: 'aid-station', label: 'Aid Station', icon: 'fa-plus-square' },
  { key: 'readiness',   label: 'Readiness',   icon: 'fa-chart-bar'   },
]

export default function MedStaff({ initialTab = 'overview', onNavigate }: Props) {
  const { data, loading, error } = useArmyData()
  const [tab, setTab] = useState<Tab>(initialTab)

  if (loading) return <div className={shared.state}>Loading medical staff…</div>
  if (error)   return <div className={shared.stateErr}>Failed to load data: {error}</div>
  if (!data)   return null

  const allSoldiers = Object.entries(data.soldiers)

  const medPersonnel = allSoldiers.filter(([, s]) => {
    if (String(s.section).toUpperCase() === 'MED') return true
    return MED_MOS_PREFIXES.some(p => String(s.mos ?? '').startsWith(p))
  })

  const medGreen = medPersonnel.filter(([, s]) => s.medical?.status === 'Green').length
  const medAmber = medPersonnel.filter(([, s]) => s.medical?.status === 'Amber').length
  const medRed   = medPersonnel.filter(([, s]) => s.medical?.status === 'Red').length

  const unitGreen = allSoldiers.filter(([, s]) => s.medical?.status === 'Green').length
  const unitAmber = allSoldiers.filter(([, s]) => s.medical?.status === 'Amber').length
  const unitRed   = allSoldiers.filter(([, s]) => s.medical?.status === 'Red').length
  const unitTotal = allSoldiers.length

  // Section-level readiness breakdown
  const bySection = allSoldiers.reduce<Record<string, { total: number; green: number; amber: number; red: number }>>(
    (acc, [, s]) => {
      const sec = String(s.section ?? 'Unknown')
      if (!acc[sec]) acc[sec] = { total: 0, green: 0, amber: 0, red: 0 }
      acc[sec].total++
      const st = String(s.medical?.status ?? '')
      if (st === 'Green') acc[sec].green++
      if (st === 'Amber') acc[sec].amber++
      if (st === 'Red')   acc[sec].red++
      return acc
    }, {}
  )

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <h2><i className="fas fa-heartbeat" /> Medical Staff</h2>
        <span className={shared.sub}>
          {medPersonnel.length} medical personnel · {unitTotal} unit total
        </span>
      </div>

      <div className={shared.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${shared.tab} ${tab === t.key ? shared.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            <i className={`fas ${t.icon}`} style={{ marginRight: 6 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────── */}
      {tab === 'overview' && (
        <>
          {onNavigate && (
            <div className={shared.navCards}>
              {EXTERNAL_NAV.map(item => (
                <button
                  key={item.key}
                  className={shared.navCard}
                  onClick={() => onNavigate(item.key)}
                >
                  <i className={`fas ${item.icon}`} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <div className={shared.stats}>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: '#fff' }}>{medPersonnel.length}</div>
              <div className={shared.statLabel}>Med Personnel</div>
            </div>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: STATUS_COLOR.Green }}>{medGreen}</div>
              <div className={shared.statLabel}>Fully Ready</div>
            </div>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: STATUS_COLOR.Amber }}>{medAmber}</div>
              <div className={shared.statLabel}>Limited Duty</div>
            </div>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: STATUS_COLOR.Red }}>{medRed}</div>
              <div className={shared.statLabel}>Non-Deployable</div>
            </div>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: '#fff' }}>
                {unitTotal > 0 ? Math.round((unitGreen / unitTotal) * 100) : 0}%
              </div>
              <div className={shared.statLabel}>Unit Med Rate</div>
            </div>
          </div>

          <div className={shared.grid2}>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-user-md" /> Medical OIC / NCOIC</div>
              <div className={shared.cardBody}>
                <dl className={shared.dl}>
                  <dt>Battalion Surgeon</dt><dd>MAJ Chen</dd>
                  <dt>Physician Assistant</dt><dd>CPT Morrison</dd>
                  <dt>Medical OIC</dt><dd>CPT Rodriguez</dd>
                  <dt>Senior Medic (68W)</dt><dd>SFC Williams</dd>
                  <dt>Med Platoon Sergeant</dt><dd>SSG Parker</dd>
                </dl>
              </div>
            </div>

            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-plus-square" /> Aid Station Status</div>
              <div className={shared.cardBody}>
                {AID_STATIONS.map(st => (
                  <div key={st.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span className={shared.dot} style={{ background: STATION_COLOR[st.status] }} />
                    <div>
                      <div style={{ fontSize: 13, color: '#ccc', fontWeight: 600 }}>{st.name}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{st.status} · {st.capacity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ROSTER ────────────────────────────────────────────── */}
      {tab === 'roster' && (
        <div className={shared.card}>
          <div className={shared.cardHeader}>
            <i className="fas fa-user-md" /> Medical Personnel Roster
          </div>
          {medPersonnel.length === 0 ? (
            <div className={shared.empty}>No medical MOS personnel found in unit data.</div>
          ) : (
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Rank</th><th>MOS</th><th>Position</th><th>Section</th><th>Med Status</th>
                  </tr>
                </thead>
                <tbody>
                  {medPersonnel.map(([slug, s]) => (
                    <tr key={slug}>
                      <td>{s.name}</td>
                      <td>{s.rank}</td>
                      <td>{s.mos}</td>
                      <td>{s.position}</td>
                      <td>{s.section}</td>
                      <td>
                        <span
                          className={shared.dot}
                          style={{ background: STATUS_COLOR[String(s.medical?.status)] ?? '#555' }}
                        />
                        {String(s.medical?.status ?? '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── AID STATION ──────────────────────────────────────── */}
      {tab === 'aid-station' && (
        <div className={shared.cards}>
          {AID_STATIONS.map(st => (
            <div key={st.name} className={shared.card}>
              <div className={shared.cardHeader}>
                <span className={shared.dot} style={{ background: STATION_COLOR[st.status] }} />
                {st.name}
              </div>
              <div className={shared.cardBody}>
                <dl className={shared.dl}>
                  <dt>Status</dt>
                  <dd style={{ color: STATION_COLOR[st.status], fontWeight: 700 }}>{st.status}</dd>
                  <dt>Location</dt><dd>{st.location}</dd>
                  <dt>Capacity</dt><dd>{st.capacity}</dd>
                  <dt>Staffed</dt><dd>{st.staffed ? 'Yes' : 'No'}</dd>
                </dl>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── READINESS ─────────────────────────────────────────── */}
      {tab === 'readiness' && (
        <>
          <div className={shared.stats}>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: STATUS_COLOR.Green }}>{unitGreen}</div>
              <div className={shared.statLabel}>Green</div>
            </div>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: STATUS_COLOR.Amber }}>{unitAmber}</div>
              <div className={shared.statLabel}>Amber</div>
            </div>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: STATUS_COLOR.Red }}>{unitRed}</div>
              <div className={shared.statLabel}>Red</div>
            </div>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: '#fff' }}>{unitTotal}</div>
              <div className={shared.statLabel}>Total</div>
            </div>
            <div className={shared.stat}>
              <div className={shared.statValue} style={{ color: '#fff' }}>
                {unitTotal > 0 ? Math.round((unitGreen / unitTotal) * 100) : 0}%
              </div>
              <div className={shared.statLabel}>Ready Rate</div>
            </div>
          </div>

          <div className={shared.card}>
            <div className={shared.cardHeader}>
              <i className="fas fa-chart-bar" /> Medical Readiness by Section
            </div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th>Section</th><th>Assigned</th>
                    <th style={{ color: STATUS_COLOR.Green }}>Green</th>
                    <th style={{ color: STATUS_COLOR.Amber }}>Amber</th>
                    <th style={{ color: STATUS_COLOR.Red   }}>Red</th>
                    <th>Ready %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bySection)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([sec, c]) => (
                      <tr key={sec}>
                        <td>{sec}</td>
                        <td>{c.total}</td>
                        <td style={{ color: STATUS_COLOR.Green }}>{c.green}</td>
                        <td style={{ color: STATUS_COLOR.Amber }}>{c.amber}</td>
                        <td style={{ color: STATUS_COLOR.Red   }}>{c.red}</td>
                        <td>
                          {c.total > 0 ? Math.round((c.green / c.total) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
