import styles from './SiteHeader.module.css'

interface Props {
  centerLabel?: string
  centerTitle?: string
  version?: string
}

export default function SiteHeader({
  centerLabel = 'United States Department of Defense',
  centerTitle = 'Platform Selection',
  version = 'v2.4.1',
}: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>T</div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>THREADS</span>
          <span className={styles.logoSub}>
            Tactical Hub for Readiness, Execution, Administration, Data &amp; Sync
          </span>
        </div>
      </div>
      <div className={styles.center}>
        <div className={styles.centerLabel}>{centerLabel}</div>
        <div className={styles.centerTitle}>{centerTitle}</div>
      </div>
      <div className={styles.version}>
        {version}
      </div>
    </header>
  )
}
