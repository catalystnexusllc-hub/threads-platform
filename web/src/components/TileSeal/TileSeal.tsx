import { useState } from 'react'
import styles from './TileSeal.module.css'

interface Props {
  id: string
  icon: string
  size?: number
}

export default function TileSeal({ id, icon, size = 130 }: Props) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div
      className={styles.seal}
      style={{ width: size, height: size }}
    >
      {!imgFailed ? (
        <img
          src={`/images/seals/${id}.png`}
          alt={id}
          onError={() => setImgFailed(true)}
          className={styles.sealImg}
        />
      ) : (
        <div className={styles.fallback}>
          <i className={`fas ${icon}`} />
        </div>
      )}
    </div>
  )
}
