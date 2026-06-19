import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlatformComponent } from '../../types/platform'
import styles from './ComponentTile.module.css'

interface Props {
  component: PlatformComponent
  parentId: string
  accent?: string
  index: number
}

export default function ComponentTile({ component, parentId: _parentId, accent, index }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const navigate = useNavigate()
  const imgId = component.imageId ?? component.url.replace('/', '')

  const handleClick = () => navigate(component.url)

  return (
    <div
      className={styles.tile}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      style={{
        '--accent': accent ?? '#fff',
        '--i': index,
      } as React.CSSProperties}
    >
      {!imgFailed && (
        <img
          className={styles.photo}
          src={`/images/tiles/${imgId}.jpg`}
          alt=""
          onError={() => setImgFailed(true)}
        />
      )}
      {component.badge && (
        <div className={`${styles.badge} ${styles[component.badge]}`}>
          {component.badge.toUpperCase()}
        </div>
      )}
      {/* (3) tile number hint */}
      <div className={styles.num}>0{index + 1}</div>
      <div className={styles.body}>
        <div className={styles.abbr}>{component.abbr}</div>
        <div className={styles.divider} />
        <div className={styles.name}>{component.name}</div>
        <div className={styles.cta}>OPEN PLATFORM &rarr;</div>
      </div>
    </div>
  )
}
