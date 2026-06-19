import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ClassificationBanner from '../../components/ClassificationBanner/ClassificationBanner'
import SiteHeader from '../../components/SiteHeader/SiteHeader'
import PlatformTile from './PlatformTile'
import ComponentTile from './ComponentTile'
import { PLATFORMS } from '../../data/platforms'
import type { Platform } from '../../types/platform'
import styles from './PlatformSelector.module.css'

type Screen = 'main' | 'components'

// (2) branch accent colors — matches PlatformTile.tsx
const ACCENT: Record<string, string> = {
  osd:      '#6b6b6b',
  army:     '#5a7a3a',
  navy:     '#1e4d8c',
  airforce: '#1a6db5',
  jcs:      '#6b3fa0',
}

export default function PlatformSelector() {
  const [screen, setScreen] = useState<Screen>('main')
  const [selected, setSelected] = useState<Platform | null>(null)
  const [sliding, setSliding] = useState(false)
  const navigate = useNavigate()

  function openPlatform(platform: Platform) {
    if (platform.components.length === 1) {
      navigate(platform.components[0].url)
      return
    }
    setSliding(true)
    setTimeout(() => {
      setSelected(platform)
      setScreen('components')
      setSliding(false)
    }, 200)
  }

  function goBack() {
    setScreen('main')
    setSelected(null)
  }

  return (
    <div className={styles.root}>
      <ClassificationBanner position="top" />
      <SiteHeader
        centerTitle={screen === 'components' && selected ? selected.name.replace('\n', ' ') : 'Platform Selection'}
      />

      {/* Screen 1 — main tiles */}
      <div className={`${styles.screen} ${screen === 'main' ? styles.active : ''} ${sliding ? styles.slideOut : ''}`}>
        {/* (3) single eyebrow line only — dropped subheading */}
        <div className={styles.selectLabel}>
          <div className={styles.eyebrow}>Select a department or command</div>
        </div>
        <div className={styles.tilesRow}>
          {PLATFORMS.map((p, i) => (
            <PlatformTile key={p.id} platform={p} index={i} onClick={() => openPlatform(p)} />
          ))}
        </div>
      </div>

      {/* Screen 2 — component tiles */}
      <div className={`${styles.screen} ${screen === 'components' ? styles.active : ''}`}>
        <div className={styles.backBar}>
          <button className={styles.backBtn} onClick={goBack}>
            <i className="fas fa-chevron-left" /> Back
          </button>
          <div className={styles.crumb}>
            <span className={styles.crumbDept}>Dept. of Defense</span>
            &nbsp;›&nbsp;
            <span className={styles.crumbName}>{selected?.name.replace('\n', ' ')}</span>
          </div>
        </div>
        <div className={styles.componentsSub}>Select a component to open its platform</div>
        <div className={styles.componentsRow}>
          {selected?.components.map((c, i) => (
            <ComponentTile
              key={c.abbr}
              component={c}
              parentId={selected.id}
              accent={ACCENT[selected.id]}
              index={i}
            />
          ))}
        </div>
      </div>

      <ClassificationBanner
        position="bottom"
        rightText="THREADS — Tactical Hub for Readiness, Execution, Administration, Data & Sync · © 2025 CatalystNexus. All Rights Reserved."
      />
    </div>
  )
}
