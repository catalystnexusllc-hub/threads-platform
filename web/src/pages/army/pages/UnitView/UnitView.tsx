import { useState } from 'react'
import { useArmyData } from '../../ArmyDataContext'
import { STATUS_COLOR } from '../util'
import shared from '../shared.module.css'

export default function UnitView() {
  const { data, loading, error } = useArmyData()
  const [unit, setUnit] = useState('')

  if (loading) return <div className={shared.state}>Loading unit…</div>
  if (error) return <div className={shared.stateErr}>Failed to load data: {error}</div>
  if (!data) return null

  const units = [...new Set(Object.values(data.soldiers).map(s => String(s.unit)))].sort()
  const active = unit || units[0] || ''
  const list = Object.entries(data.soldiers).filter(([, s]) => String(s.unit) === active)
  const sections = data.unitSections[active.toLowerCase()] ?? []

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <h2><i className="fas fa-sitemap" /> Unit — {active}</h2>
        <div className={shared.spacer} />
        <select className={shared.select} value={active} onChange={e => setUnit(e.target.value)}>
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {sections.length > 0 && (
        <div className={shared.stats}>
          {sections.map(sec => (
            <div key={sec.key} className={shared.stat}>
              <div className={shared.statValue} style={{ color: sec.color }}>{sec.name}</div>
              <div className={shared.statLabel}>{sec.key}</div>
            </div>
          ))}
        </div>
      )}

      <div className={shared.card}>
        <div className={shared.cardHeader}><i className="fas fa-users" /> {active} Roster ({list.length})</div>
        {list.length === 0 ? (
          <div className={shared.empty}>No soldiers in {active}.</div>
        ) : (
          <table className={shared.table}>
            <thead>
              <tr><th>Name</th><th>Rank</th><th>Section</th><th>MOS</th><th>Med</th></tr>
            </thead>
            <tbody>
              {list.map(([slug, s]) => (
                <tr key={slug}>
                  <td>{s.name}</td>
                  <td>{s.rank}</td>
                  <td>{s.section}</td>
                  <td>{s.mos}</td>
                  <td><span className={shared.dot} style={{ background: STATUS_COLOR[String(s.medical?.status)] ?? '#555' }} />{String(s.medical?.status ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
