import { useState } from 'react'
import shared from '../shared.module.css'

interface Toggle { key: string; label: string; desc: string; on: boolean }

const INITIAL: Toggle[] = [
  { key: 'notif', label: 'Suspense Notifications', desc: 'Alert me when a readiness item goes overdue.', on: true },
  { key: 'digest', label: 'Daily Readiness Digest', desc: 'Email a morning roll-up of unit status.', on: true },
  { key: 'classmark', label: 'Classification Banners', desc: 'Show the proprietary marking top & bottom.', on: true },
  { key: 'compact', label: 'Compact Tables', desc: 'Denser roster rows.', on: false },
]

export default function Settings() {
  const [toggles, setToggles] = useState(INITIAL)

  function flip(key: string) {
    setToggles(ts => ts.map(t => (t.key === key ? { ...t, on: !t.on } : t)))
  }

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <h2><i className="fas fa-cog" /> Settings</h2>
        <span className={shared.sub}>Preferences are local to this session</span>
      </div>

      <div className={shared.card}>
        <div className={shared.cardHeader}><i className="fas fa-sliders-h" /> Preferences</div>
        <div className={shared.cardBody}>
          {toggles.map(t => (
            <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid #141414' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#ddd', fontSize: 14, fontWeight: 600 }}>{t.label}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{t.desc}</div>
              </div>
              <button
                onClick={() => flip(t.key)}
                aria-pressed={t.on}
                style={{
                  width: 46, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: t.on ? 'var(--gold)' : '#333', position: 'relative', transition: 'background .15s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: t.on ? 25 : 3, width: 18, height: 18,
                  borderRadius: '50%', background: '#0a0a0a', transition: 'left .15s',
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
