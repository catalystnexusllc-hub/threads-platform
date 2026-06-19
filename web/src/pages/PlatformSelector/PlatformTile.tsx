import { useState } from 'react'
import type { Platform } from '../../types/platform'
import styles from './PlatformTile.module.css'

interface Props {
  platform: Platform
  index: number
  onClick: () => void
}

const ACCENT: Record<string, string> = {
  osd:      '#6b6b6b',
  army:     '#5a7a3a',
  navy:     '#1e4d8c',
  airforce: '#1a6db5',
  jcs:      '#6b3fa0',
}

export default function PlatformTile({ platform, index, onClick }: Props) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div
      className={styles.tile}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{
        '--accent': ACCENT[platform.id] ?? '#fff',
        '--i': index,
      } as React.CSSProperties}
    >
      {!imgFailed && (
        <img
          className={styles.photo}
          src={`/images/tiles/${platform.id}.jpg`}
          alt=""
          onError={() => setImgFailed(true)}
        />
      )}
      {/* (3) tile number hint */}
      <div className={styles.num}>0{index + 1}</div>
      <div className={styles.body}>
        <div className={styles.abbr}>{platform.abbr}</div>
        <div className={styles.divider} />
        <div className={styles.name}>
          {platform.name.split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </div>
        <div className={styles.cta}>ENTER PLATFORM &rarr;</div>
      </div>
    </div>
  )
}
