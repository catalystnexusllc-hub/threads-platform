import { useState } from 'react'
import { useArmyData } from '../../ArmyDataContext'
import styles from './CommandDashboard.module.css'

const STATUS_COLOR: Record<string, string> = {
  Green: '#27ae60', Amber: '#f39c12', Red: '#e74c3c',
}

export default function CommandDashboard() {
  const { data, loading, error } = useArmyData()
  const [selected, setSelected] = useState<string | null>(null)

  if (loading) return <div className={styles.state}>Loading roster…</div>
  if (error) return <div className={styles.stateErr}>Failed to load data: {error}</div>
  if (!data) return null

  const entries = Object.entries(data.soldiers)
  const total = entries.length
  const med = { Green: 0, Amber: 0, Red: 0 } as Record<string, number>
  let acftPass = 0
  let overdue = 0
  for (const [, s] of entries) {
    const st = String(s.medical?.status ?? '')
    if (st in med) med[st] += 1
    if (s.acft?.status === 'Pass') acftPass += 1
    if ([s.dd93?.status, s.sglv?.status, s.prr?.status].includes('Overdue')) overdue += 1
  }

  const stats = [
    { value: String(total), label: 'Personnel', bg: '#2d2d2d' },
    { value: String(med.Green), label: 'Med Ready', bg: STATUS_COLOR.Green },
    { value: String(med.Amber + med.Red), label: 'Med Flags', bg: STATUS_COLOR.Amber },
    { value: `${total ? Math.round((acftPass / total) * 100) : 0}%`, label: 'ACFT Pass', bg: '#c9a227' },
    { value: String(overdue), label: 'Admin Overdue', bg: STATUS_COLOR.Red },
  ]

  const sel = selected ? data.soldiers[selected] : null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2><i className="fas fa-tachometer-alt" /> Command Dashboard</h2>
        <span className={styles.sub}>Live readiness — {total} soldiers</span>
      </div>

      <div className={styles.stats}>
        {stats.map(s => (
          <div key={s.label} className={styles.stat} style={{ background: s.bg }}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}><i className="fas fa-users" /> Personnel Roster</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Rank</th><th>Unit</th><th>MOS</th><th>Med</th><th>ACFT</th></tr>
              </thead>
              <tbody>
                {entries.map(([slug, s]) => (
                  <tr
                    key={slug}
                    className={slug === selected ? styles.activeRow : ''}
                    onClick={() => setSelected(slug)}
                  >
                    <td>{s.name}</td>
                    <td>{s.rank}</td>
                    <td>{s.unit}<span className={styles.dim}> / {s.section}</span></td>
                    <td>{s.mos}</td>
                    <td>
                      <span className={styles.dot} style={{ background: STATUS_COLOR[String(s.medical?.status)] ?? '#555' }} />
                      {String(s.medical?.status ?? '—')}
                    </td>
                    <td>{String(s.acft?.score ?? '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}><i className="fas fa-id-card" /> Soldier Detail</div>
          {!sel ? (
            <div className={styles.empty}>Select a soldier from the roster</div>
          ) : (
            <div className={styles.detail}>
              <div className={styles.detailName}>{sel.rank} {sel.name}</div>
              <div className={styles.detailRole}>{sel.position} · {sel.mos} · {sel.unit}/{sel.section}</div>
              <dl className={styles.dl}>
                <dt>DODID</dt><dd>{sel.dodid}</dd>
                <dt>Security</dt><dd>{sel.security ?? '—'}</dd>
                <dt>Medical</dt><dd>{String(sel.medical?.status ?? '—')} · Dental {String(sel.medical?.dental ?? '—')}</dd>
                <dt>ACFT</dt><dd>{String(sel.acft?.score ?? '—')} ({String(sel.acft?.status ?? '—')})</dd>
                <dt>Leave</dt><dd>{sel.leave?.balance ?? '—'} days ({sel.leave?.useLose ?? 0} use/lose)</dd>
                <dt>DD93 / SGLV</dt><dd>{sel.dd93?.status ?? '—'} / {sel.sglv?.status ?? '—'}</dd>
                <dt>Awards</dt><dd>{sel.awards?.current?.join(', ') || '—'}</dd>
                <dt>ETS</dt><dd>{sel.ets}</dd>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
