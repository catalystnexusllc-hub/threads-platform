import styles from './ClassificationBanner.module.css'

interface Props {
  position: 'top' | 'bottom'
  rightText?: string
}

export default function ClassificationBanner({ position, rightText }: Props) {
  return (
    <div
      className={`${styles.banner} ${position === 'top' ? styles.top : styles.bottom}`}
      role={position === 'top' ? 'banner' : 'contentinfo'}
      aria-label="Classification marking"
    >
      <div className={styles.mark}>
        <span className={styles.pill}>PROPRIETARY</span>
        <span className={styles.sep}> // </span>
        FOR AUTHORIZED USE ONLY
        <span className={styles.sep}> // </span>
        NOT FOR PUBLIC RELEASE
      </div>
      <div className={styles.right}>
        {rightText ?? '© 2025 CatalystNexus. All Rights Reserved.'}
      </div>
    </div>
  )
}
