import { useArmyData } from '../../ArmyDataContext'
import shared from '../shared.module.css'

export default function CommandTeam() {
  const { data, loading, error } = useArmyData()

  if (loading) return <div className={shared.state}>Loading command team…</div>
  if (error) return <div className={shared.stateErr}>Failed to load data: {error}</div>
  if (!data) return null

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <h2><i className="fas fa-star" /> Command Team &amp; Staff Leadership</h2>
        <span className={shared.sub}>{data.leaderGroups.length} groups</span>
      </div>

      <div className={shared.cards}>
        {data.leaderGroups.map(g => (
          <div key={g.name} className={shared.card}>
            <div className={shared.cardHeader}>
              <i className={`fas ${g.icon ?? 'fa-star'}`} style={{ color: g.color ?? 'var(--gold)' }} /> {g.name}
            </div>
            <div className={shared.cardBody}>
              <dl className={shared.dl}>
                {g.leaders.map(l => (
                  <div key={l.id} style={{ display: 'contents' }}>
                    <dt style={{ textTransform: 'none' }}>{l.locations[0] ?? '—'}</dt>
                    <dd>{l.name}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
