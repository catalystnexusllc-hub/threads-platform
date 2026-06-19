import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ClassificationBanner from '../../components/ClassificationBanner/ClassificationBanner'
import Sidebar from '../army/components/Sidebar/Sidebar'
import { BRANCH_CONFIGS } from './branchConfig'
import styles from './BranchApp.module.css'

interface Props {
  branchId: string
}

const QUICK_ACTIONS = [
  { icon: 'fa-user',          label: 'My Portfolio'  },
  { icon: 'fa-sync-alt',      label: 'Digital Syncs' },
  { icon: 'fa-bell',          label: 'Suspenses'     },
  { icon: 'fa-robot',         label: 'THREADS AI'    },
  { icon: 'fa-tachometer-alt',label: 'Dashboard'     },
  { icon: 'fa-calendar-alt',  label: 'Battle Rhythm' },
  { icon: 'fa-file-alt',      label: 'Reports'       },
  { icon: 'fa-cog',           label: 'Settings'      },
]

const MODULES = [
  { icon: 'fa-user',          title: 'My Portfolio',      sub: 'Personal records & forms'   },
  { icon: 'fa-tachometer-alt',title: 'Command Dashboard', sub: 'Unit readiness overview'    },
  { icon: 'fa-calendar-alt',  title: 'Battle Rhythm',     sub: 'Events & milestones'        },
  { icon: 'fa-robot',         title: 'THREADS AI',        sub: 'Digital staff officer'      },
  { icon: 'fa-sync-alt',      title: 'Digital Syncs',     sub: 'Meetings & collaboration'   },
  { icon: 'fa-bell',          title: 'Suspenses',         sub: 'Tasks & deadlines'          },
  { icon: 'fa-users',         title: 'Command Team',      sub: 'Leadership directory'       },
  { icon: 'fa-sitemap',       title: 'Unit View',         sub: 'Organizational chart'       },
]

const COMING_SOON = [
  'Command Dashboard', 'Digital Syncs', 'Battle Rhythm',
  'My Portfolio', 'THREADS AI', 'Suspenses Tracker',
]

export default function BranchApp({ branchId }: Props) {
  const config = BRANCH_CONFIGS[branchId]
  const [currentPage, setCurrentPage] = useState('home')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const navigate = useNavigate()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  if (!config) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#fff' }}>
        Unknown branch: {branchId}
      </div>
    )
  }

  function toggleMenu(key: string) {
    setOpenMenu(prev => (prev === key ? null : key))
  }

  function renderPage() {
    if (currentPage !== 'home') {
      return (
        <div className={styles.placeholder}>
          <i className="fas fa-tools" />
          <p>{currentPage}</p>
          <span>Page under construction</span>
        </div>
      )
    }

    return (
      <div className={styles.page}>
        {/* Welcome banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeLeft}>
            <div className={styles.welcomeGreeting}>THREADS — {config.fullName}</div>
            <div className={styles.divider} />
            <div className={styles.welcomeSub}>PLATFORM IN DEVELOPMENT · {config.abbr}</div>
            <div className={styles.welcomeMission}>
              This platform is being configured for {config.fullName} operations.
            </div>
          </div>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left" /> PLATFORM SELECT
          </button>
        </div>

        {/* Quick actions */}
        <div className={styles.quickActions}>
          {QUICK_ACTIONS.map(a => (
            <div key={a.label} className={`${styles.quickBtn} ${styles.disabled}`}>
              <i className={`fas ${a.icon}`} />
              {a.label}
            </div>
          ))}
        </div>

        {/* Two-col cards */}
        <div className={styles.twoCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3><i className="fas fa-tools" /> COMING SOON</h3>
              <span className={styles.cardMeta}>IN DEVELOPMENT</span>
            </div>
            <div className={styles.featureList}>
              {COMING_SOON.map(f => (
                <div key={f} className={styles.featureItem}>
                  <i className="fas fa-clock" />
                  <span>{f}</span>
                  <span className={styles.featureBadge}>PENDING</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3><i className="fas fa-info-circle" /> PLATFORM INFO</h3>
            </div>
            <div className={styles.infoList}>
              {[
                ['Branch',         config.fullName],
                ['Abbreviation',   config.abbr],
                ['Platform ID',    config.id.toUpperCase()],
                ['Status',         'In Development'],
                ['Classification', 'UNCLASSIFIED // FOUO'],
              ].map(([label, val]) => (
                <div key={label} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{label}</span>
                  <span className={`${styles.infoVal} ${label === 'Status' ? styles.statusDev : ''}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module grid */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3><i className="fas fa-th" /> PLATFORM MODULES</h3>
            <span className={styles.cardMeta}>PENDING ACTIVATION</span>
          </div>
          <div className={styles.modulesGrid}>
            {MODULES.map(m => (
              <div key={m.title} className={`${styles.moduleItem} ${styles.modulePending}`}>
                <div className={styles.moduleIcon}>
                  <i className={`fas ${m.icon}`} />
                </div>
                <div>
                  <div className={styles.moduleTitle}>{m.title}</div>
                  <div className={styles.moduleSub}>{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <strong>THREADS</strong>
            <span className={styles.unclass}>UNCLASSIFIED // FOUO</span>
          </div>
          <div className={styles.footerRight}>
            <a href="/"><i className="fas fa-question-circle" /> Help</a>
            <a href="/"><i className="fas fa-shield-alt" /> Privacy</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <ClassificationBanner position="top" />

      <header className={styles.header} ref={navRef}>
        {/* Top bar */}
        <div className={styles.left}>
          <button className={styles.brand} onClick={() => setCurrentPage('home')}>THREADS</button>
          <div className={styles.branchPill}>
            <i className={`fas ${config.icon}`} />
            <span>{config.abbr}</span>
          </div>
          <button className={styles.controlBtn} onClick={() => navigate('/')}>
            <i className="fas fa-home" />&ensp;PLATFORM SELECT
          </button>
        </div>

        <div className={styles.center}>
          <div className={styles.search}>
            <i className="fas fa-search" />
            <input type="text" placeholder="Search pages, forms, reports..." />
          </div>
        </div>

        <div className={styles.right}>
          <button className={styles.iconBtn} title="Help"><i className="fas fa-question-circle" /></button>
          <button className={styles.iconBtn} title="Notifications"><i className="fas fa-bell" /></button>
          <div
            className={`${styles.userChip} ${openMenu === 'user' ? styles.open : ''}`}
            onClick={() => toggleMenu('user')}
          >
            <div className={styles.avatar}>JS</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>SSG John Smith</span>
              <span className={styles.userSub}>42A · HQ Section</span>
            </div>
            <i className="fas fa-chevron-down" />
            {openMenu === 'user' && (
              <div className={styles.dropdown}>
                <button onClick={() => { setCurrentPage('portfolio'); setOpenMenu(null) }}>
                  <i className="fas fa-user" /> My Portfolio
                </button>
                <button onClick={() => { setCurrentPage('settings'); setOpenMenu(null) }}>
                  <i className="fas fa-cog" /> Settings
                </button>
                <div className={styles.dropDivider} />
                <button className={styles.signOut} onClick={() => navigate('/')}>
                  <i className="fas fa-sign-out-alt" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nav row */}
        <nav className={styles.nav}>
          <button
            className={`${styles.navLink} ${currentPage === 'home' ? styles.navActive : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            HOME
          </button>
          <button className={styles.navLink} onClick={() => setCurrentPage('portfolio')}>
            YOUR PORTFOLIO
          </button>
          <button className={styles.navLink} onClick={() => setCurrentPage('digital-syncs')}>
            DIGITAL SYNCS
          </button>
          <button className={styles.navLink} onClick={() => setCurrentPage('threads-ai')}>
            THREADS AI
          </button>
          <button className={styles.navLink} onClick={() => setCurrentPage('command')}>
            COMMAND TEAM
          </button>
          <button className={styles.navLink} onClick={() => setCurrentPage('staff')}>
            STAFF
          </button>
        </nav>

        {/* Crumb */}
        <div className={styles.demoCrumb}>
          <i className="fas fa-chevron-right" />
          <span>{config.fullName} — Platform Under Development</span>
        </div>
      </header>

      <div className={styles.body}>
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className={styles.main}>
          <div className={styles.scroll}>
            {renderPage()}
          </div>
        </main>
      </div>

      <ClassificationBanner position="bottom" />
    </div>
  )
}
