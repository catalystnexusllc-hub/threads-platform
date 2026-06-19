import { useState } from 'react'
import styles from './Sidebar.module.css'

interface Props {
  currentPage: string
  onNavigate: (page: string) => void
}

interface NavItem {
  icon: string
  label: string
  page: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: 'fa-home',          label: 'Home',           page: 'home'                   },
  { icon: 'fa-user',          label: 'My Portfolio',   page: 'your-portfolio'         },
  { icon: 'fa-sync-alt',      label: 'Digital Syncs',  page: 'digital-syncs-overview' },
  { icon: 'fa-robot',         label: 'THREADS AI',     page: 'digital-staff-officer'  },
  { icon: 'fa-tachometer-alt',label: 'Dashboard',      page: 'command-dashboard'      },
  { icon: 'fa-calendar-alt',  label: 'Battle Rhythm',  page: 'battle-rhythm'          },
  { icon: 'fa-bell',          label: 'Suspenses',      page: 'suspenses'              },
  { icon: 'fa-cog',           label: 'Settings',       page: 'settings'               },
]

export default function Sidebar({ currentPage, onNavigate }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
      </button>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.page}
            className={`${styles.navItem} ${currentPage === item.page ? styles.active : ''}`}
            onClick={() => onNavigate(item.page)}
            title={collapsed ? item.label : undefined}
          >
            <i className={`fas ${item.icon}`} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
