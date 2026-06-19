import { useArmyData } from '../../ArmyDataContext'
import { scanFlags } from '../util'
import shared from '../shared.module.css'

const SEV_COLOR = { high: '#e74c3c', med: '#f39c12' }

export default function Suspenses() {
  const { data, loading, error } = useArmyData()

  if (loading) return <div className={shared.state}>Loading suspenses…</div>
  if (error) return <div className={shared.stateErr}>Failed to load data: {error}</div>
  if (!data) return null

  const flags = scanFlags(data.soldiers).sort((a, b) =>
    a.severity === b.severity ? 0 : a.severity === 'high' ? -1 : 1,
  )
  const high = flags.filter(f => f.severity === 'high').length

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <h2><i className="fas fa-bell" /> Suspenses &amp; Readiness Flags</h2>
        <span className={shared.sub}>Derived from live records</span>
      </div>

      <div className={shared.stats}>
        <div className={shared.stat}><div className={shared.statValue} style={{ color: SEV_COLOR.high }}>{high}</div><div className={shared.statLabel}>High</div></div>
        <div className={shared.stat}><div className={shared.statValue} style={{ color: SEV_COLOR.med }}>{flags.length - high}</div><div className={shared.statLabel}>Monitor</div></div>
        <div className={shared.stat}><div className={shared.statValue} style={{ color: '#fff' }}>{flags.length}</div><div className={shared.statLabel}>Total</div></div>
      </div>

      <div className={shared.card}>
        <div className={shared.cardHeader}><i className="fas fa-exclamation-triangle" /> Action Items</div>
        {flags.length === 0 ? (
          <div className={shared.empty}>No outstanding readiness flags. 🎯</div>
        ) : (
          <table className={shared.table}>
            <thead>
              <tr><th>Soldier</th><th>Item</th><th>Detail</th><th>Severity</th></tr>
            </thead>
            <tbody>
              {flags.map((f, i) => (
                <tr key={i}>
                  <td>{f.rank} {f.name}</td>
                  <td>{f.item}</td>
                  <td>{f.detail}</td>
                  <td><span className={shared.dot} style={{ background: SEV_COLOR[f.severity] }} />{f.severity === 'high' ? 'High' : 'Monitor'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
