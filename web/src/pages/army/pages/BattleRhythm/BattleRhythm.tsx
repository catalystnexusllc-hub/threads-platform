import { useArmyData } from '../../ArmyDataContext'
import styles from './BattleRhythm.module.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const CATEGORY_COLOR: Record<string, string> = {
  jcu: '#c9a227', jsoc: '#8e44ad', scs: '#1e8449', hsts: '#2980b9', suspense: '#e74c3c',
}

function fmtTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function BattleRhythm() {
  const { data, loading, error } = useArmyData()

  if (loading) return <div className={styles.state}>Loading battle rhythm…</div>
  if (error) return <div className={styles.stateErr}>Failed to load data: {error}</div>
  if (!data) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2><i className="fas fa-calendar-alt" /> Battle Rhythm</h2>
        <span className={styles.sub}>{data.standupEvents.length} recurring events · {data.sitrepData.length} SITREP cycles</span>
      </div>

      <div className={styles.week}>
        {DAYS.map((day, i) => {
          const dayEvents = data.standupEvents
            .filter(e => e.day === i)
            .sort((a, b) => a.start - b.start)
          return (
            <div key={day} className={styles.col}>
              <div className={styles.colHead}>{day}</div>
              <div className={styles.colBody}>
                {dayEvents.length === 0 && <div className={styles.noEvents}>—</div>}
                {dayEvents.map(e => (
                  <div key={e.id} className={styles.event} style={{ borderLeftColor: CATEGORY_COLOR[e.category] ?? '#555' }}>
                    <div className={styles.eventTime}>{fmtTime(e.start)} · {e.duration}m</div>
                    <div className={styles.eventTitle}>{e.title}</div>
                    <div className={styles.eventMeta}>{e.location ?? ''}{e.opr ? ` · ${e.opr}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}><i className="fas fa-file-alt" /> SITREP Schedule</div>
        <table className={styles.table}>
          <thead>
            <tr><th>Month</th><th>CDR Review</th><th>JCU</th><th>JSOC</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.sitrepData.map((s, i) => (
              <tr key={i}>
                <td>{s.month}</td><td>{s.cdrReview}</td><td>{s.jcu}</td><td>{s.jsoc}</td>
                <td><span className={styles.statusPill}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
