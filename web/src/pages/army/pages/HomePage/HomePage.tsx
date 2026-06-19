import { useState } from 'react'
import styles from './HomePage.module.css'

interface Props {
  onNavigate: (page: string) => void
}

const QUICK_ACTIONS = [
  { icon: 'fa-clipboard-check', label: 'Readiness',     page: 'your-portfolio'         },
  { icon: 'fa-file-signature',  label: 'DD93',          page: 'dd93'                   },
  { icon: 'fa-graduation-cap',  label: 'Training',      page: 'your-portfolio'         },
  { icon: 'fa-bell',            label: 'Suspenses',     page: 'sync-daily-admin'       },
  { icon: 'fa-calendar-alt',    label: 'Battle Rhythm', page: 'digital-syncs-overview' },
  { icon: 'fa-users',           label: 'Staff',         page: 'j1-overview'            },
  { icon: 'fa-robot',           label: 'AI Tools',      page: 'digital-staff-officer'  },
  { icon: 'fa-tachometer-alt',  label: 'Dashboard',     page: 'command-dashboard'      },
]

const SUSPENSES = [
  { label: 'Update SGLV',        status: 'OVERDUE',   color: '#e74c3c' },
  { label: 'Cyber Awareness',    status: 'Tomorrow',  color: '#f39c12' },
  { label: 'PHA Appointment',    status: '3 Days',    color: '#f39c12' },
  { label: 'Travel Voucher',     status: '5 Days',    color: '#27ae60' },
]

const ACTIVITY = [
  { dot: '#27ae60', text: 'Completed', strong: 'Cyber Awareness',  time: '0823'      },
  { dot: '#c9a227', text: 'Updated',   strong: 'DD93 Form',        time: 'Yesterday' },
  { dot: '#c9a227', text: 'Viewed',    strong: 'S1 Dashboard',     time: 'Yesterday' },
  { dot: '#c9a227', text: 'Submitted', strong: 'Leave Request',    time: '08 Jan'    },
  { dot: '#c9a227', text: 'Attended',  strong: 'Weekly Stand Up',  time: '06 Jan'    },
]

const CORE_MODULES = [
  { icon: 'fa-sync-alt',     title: 'Digital Syncs',   sub: 'Battle rhythm',      page: 'digital-syncs-overview' },
  { icon: 'fa-user',         title: 'Your Portfolio',  sub: 'Personal dashboard', page: 'your-portfolio'         },
  { icon: 'fa-users',        title: 'Staff Sections',  sub: 'J1–J9 dashboards',   page: 'j1-overview'            },
  { icon: 'fa-star',         title: 'Command View',    sub: 'Executive support',  page: 'command-dashboard'      },
]

const ECHELONS = [
  { label: 'COCOM/SOCOM', bg: '#1a1a1a', color: '#c9a227' },
  { label: 'Corps/Division', bg: '#333', color: '#fff' },
  { label: 'BDE/Group', bg: '#555', color: '#fff' },
  { label: 'BN/Company', bg: '#777', color: '#fff' },
  { label: 'PLT/Team', bg: '#999', color: '#fff' },
]

const SYSTEMS = [
  { name: 'DTMS',    ok: true  },
  { name: 'iPERMS',  ok: true  },
  { name: 'MEDPROS', ok: true  },
  { name: 'GCSS',    ok: false },
  { name: 'GFEBS',   ok: true  },
  { name: 'DTS',     ok: true  },
]

const ORG_STATS = [
  { value: '96%', label: 'Manning',    color: '#c9a227' },
  { value: '247', label: 'Personnel',  color: '#fff'    },
  { value: '58',  label: 'Overdue',    color: '#e74c3c' },
  { value: '69',  label: 'Due 30d',    color: '#f39c12' },
  { value: '94%', label: 'Readiness',  color: '#27ae60' },
]

export default function HomePage({ onNavigate }: Props) {
  const [bannerVisible, setBannerVisible] = useState(true)

  return (
    <div className={styles.page}>

      {/* Welcome banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeLeft}>
          <div className={styles.welcomeGreeting}>Welcome back, SSG Smith</div>
          <div className={styles.welcomeSub}>Soldier · U.S. Army</div>
          <div className={styles.divider} />
          <div className={styles.welcomeMission}>
            Our Mission: Reduce admin burdens • Restore time to mission
          </div>
        </div>
        <button className={styles.getStartedBtn}>
          <i className="fas fa-play-circle" /> GET STARTED
        </button>
      </div>

      {/* What's New */}
      {bannerVisible && (
        <div className={styles.whatsNew}>
          <div className={styles.whatsNewLeft}>
            <i className="fas fa-bullhorn" />
            <span><strong>What&apos;s New:</strong>{' '}
              <span className={styles.whatsNewDetail}>
                Campaign Workshop • Annual Manning Review • THREADS rebrand
              </span>
            </span>
          </div>
          <div className={styles.whatsNewRight}>
            <button className={styles.detailsBtn}>Details</button>
            <button className={styles.closeBtn} onClick={() => setBannerVisible(false)}>×</button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        {QUICK_ACTIONS.map(a => (
          <button key={a.label} className={styles.quickBtn} onClick={() => onNavigate(a.page)}>
            <i className={`fas ${a.icon}`} />
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Two-col: Suspenses + Activity */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3><i className="fas fa-clock" /> My Suspenses</h3>
            <span className={styles.cardMeta}>Next 7 days</span>
          </div>
          <div className={styles.suspenseList}>
            {SUSPENSES.map(s => (
              <div key={s.label} className={styles.suspenseItem} style={{ borderLeftColor: s.color }}>
                <span className={styles.suspenseLabel}>{s.label}</span>
                <span className={styles.suspenseStatus} style={{ color: s.color }}>{s.status}</span>
              </div>
            ))}
          </div>
          <button className={styles.viewAllBtn} onClick={() => onNavigate('your-portfolio')}>
            View All →
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3><i className="fas fa-history" /> Recent Activity</h3>
          </div>
          <div className={styles.activityList}>
            {ACTIVITY.map((a, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: a.dot }} />
                <span>{a.text} <strong>{a.strong}</strong></span>
                <span className={styles.activityTime}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Modules */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3><i className="fas fa-th-large" /> Core Modules</h3>
        </div>
        <div className={styles.modulesGrid}>
          {CORE_MODULES.map(m => (
            <div key={m.title} className={styles.moduleItem} onClick={() => onNavigate(m.page)}>
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

      {/* Echelons + System Status */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3><i className="fas fa-layer-group" /> Scales Across Echelons</h3>
          </div>
          <div className={styles.echelonRow}>
            {ECHELONS.map(e => (
              <span key={e.label} className={styles.echelonTag}
                style={{ background: e.bg, color: e.color }}>
                {e.label}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3><i className="fas fa-server" /> System Status</h3>
          </div>
          <div className={styles.systemRow}>
            {SYSTEMS.map(s => (
              <span key={s.name} className={styles.systemTag}>
                {s.name}{' '}
                <i className={`fas ${s.ok ? 'fa-check' : 'fa-exclamation'}`}
                  style={{ color: s.ok ? '#27ae60' : '#f39c12' }} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Org Status Bar */}
      <div className={styles.orgBar}>
        <div className={styles.orgBarLeft}>
          <i className="fas fa-tachometer-alt" />
          <span className={styles.orgBarTitle}>Org Status</span>
          <span className={styles.orgBarDate}>10 Jan 2026</span>
        </div>
        <div className={styles.orgStats}>
          {ORG_STATS.map(s => (
            <div key={s.label} className={styles.orgStat}>
              <div className={styles.orgStatVal} style={{ color: s.color }}>{s.value}</div>
              <div className={styles.orgStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span><strong>THREADS</strong> v2.4.1</span>
          <span>•</span>
          <span>10 Jan 2026</span>
          <span>•</span>
          <span className={styles.unclass}>UNCLASSIFIED</span>
        </div>
        <div className={styles.footerRight}>
          <a href="#feedback"><i className="fas fa-comment" /> Feedback</a>
          <a href="#about"><i className="fas fa-info-circle" /> About</a>
        </div>
      </div>

    </div>
  )
}
