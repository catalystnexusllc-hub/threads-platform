import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './NavBar.module.css'
import { useUser, DEMO_PROFILES } from '../../UserContext'
import IntegrationMap from './IntegrationMap'

interface Props {
  onNavigate: (page: string) => void
  currentPage: string
}

// Battalion: S5/S7/S9 roll under S3; S8 rolls under S4
const BN_STAFF_SECTIONS = [
  { key: 'j1', label: 'S1', name: 'Personnel' },
  { key: 'j2', label: 'S2', name: 'Intelligence' },
  { key: 'j3', label: 'S3', name: 'Operations · incl. S5/S7/S9' },
  { key: 'j4', label: 'S4', name: 'Logistics · incl. S8' },
  { key: 'j6', label: 'S6', name: 'Communications' },
]

// Group: S8 is standalone; S5/S7/S9 remain under S3
const GRP_STAFF_SECTIONS = [
  { key: 'j1', label: 'S1', name: 'Personnel' },
  { key: 'j2', label: 'S2', name: 'Intelligence' },
  { key: 'j3', label: 'S3', name: 'Operations · incl. S5/S7/S9' },
  { key: 'j4', label: 'S4', name: 'Logistics' },
  { key: 'j6', label: 'S6', name: 'Communications' },
  { key: 'j8', label: 'S8', name: 'Finance' },
]

const BN_COMPANIES = ['hhd', 'a', 'b', 'c', 'spt'] as const
const BN_COMPANY_NAMES: Record<string, string> = {
  hhd: 'HHD',
  a: 'Alpha Company',
  b: 'Bravo Company',
  c: 'Charlie Company',
  spt: 'Support Company',
}
const BATTALIONS = [
  { key: '1bn', label: '1ST BATTALION, 5TH SFG', short: '1/5' },
  { key: '2bn', label: '2ND BATTALION, 5TH SFG', short: '2/5' },
  { key: '3bn', label: '3RD BATTALION, 5TH SFG', short: '3/5' },
]
const GSB_COMPANIES = ['hhc', 'svc', 'fsc'] as const
const GSB_COMPANY_NAMES: Record<string, string> = {
  hhc: 'HHC (GSB)',
  svc: 'Service & Support Co',
  fsc: 'Forward Support Co (FSC)',
}

export default function NavBar({ onNavigate, currentPage }: Props) {
  const navigate = useNavigate()
  const { profile, setProfile } = useUser()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [showIntMap, setShowIntMap] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(menu: string) {
    setOpenMenu(prev => (prev === menu ? null : menu))
  }

  function go(page: string) {
    onNavigate(page)
    setOpenMenu(null)
  }

  return (
    <header className={styles.header} ref={navRef}>
      {/* Left: brand + controls */}
      <div className={styles.left}>
        <button className={styles.brand} onClick={() => go('home')}>THREADS</button>
        <div className={styles.branchPill}>
          <i className="fas fa-shield-alt" />
          <span>ARMY</span>
        </div>
        <button className={styles.controlBtn} onClick={() => navigate('/')}>
          <i className="fas fa-home" />
          &ensp;PLATFORM SELECT
        </button>
        <button className={styles.controlBtn} onClick={() => setShowIntMap(true)}>
          <i className="fas fa-project-diagram" />
          &ensp;INTEGRATION MAP
        </button>
      </div>

      {/* Center: search */}
      <div className={styles.center}>
        <div className={styles.search}>
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="Search pages, forms, reports..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
        </div>
      </div>

      {/* Right: help + user */}
      <div className={styles.right}>
        <button className={styles.iconBtn} title="Help"><i className="fas fa-question-circle" /></button>
        <button className={styles.iconBtn} title="Notifications"><i className="fas fa-bell" /></button>
        <div className={`${styles.userChip} ${openMenu === 'user' ? styles.open : ''}`}
          onClick={() => toggle('user')}>
          <div className={styles.avatar}>{profile.rank[0]}{profile.name.split(' ').pop()![0]}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{profile.rank} {profile.name}</span>
            <span className={styles.userSub}>{profile.mos} · {profile.unitLabel}</span>
          </div>
          <i className="fas fa-chevron-down" />
          {openMenu === 'user' && (
            <div className={styles.dropdown}>
              <button onClick={() => go('your-portfolio')}><i className="fas fa-user" /> My Portfolio</button>
              <button onClick={() => go('settings')}><i className="fas fa-cog" /> Settings</button>
              <div className={styles.dropDivider} />
              <div style={{ padding: '4px 8px 2px', fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Demo Profile</div>
              {DEMO_PROFILES.map(p => (
                <button
                  key={p.unitKey}
                  onClick={() => { setProfile(p); setOpenMenu(null) }}
                  style={{ opacity: profile.unitKey === p.unitKey ? 1 : 0.5 }}
                >
                  <i className="fas fa-user-tag" />
                  {p.rank} {p.name} — {p.unitLabel}
                </button>
              ))}
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
          className={`${styles.navLink} ${currentPage === 'your-portfolio' ? styles.navActive : ''}`}
          onClick={() => go('your-portfolio')}
        >
          YOUR PORTFOLIO
        </button>

        <button
          className={`${styles.navLink} ${currentPage === 'digital-syncs' ? styles.navActive : ''}`}
          onClick={() => go('digital-syncs')}
        >
          DIGITAL SYNCS
        </button>

        <button
          className={`${styles.navLink} ${currentPage === 'threads-ai' ? styles.navActive : ''}`}
          onClick={() => go('threads-ai')}
        >
          THREADS AI
        </button>

        {/* Command Team dropdown */}
        <div className={styles.navDropdown}>
          <button className={styles.navLink} onClick={() => toggle('command')}>
            COMMAND TEAM <i className="fas fa-chevron-down" style={{ fontSize: '8px' }} />
          </button>
          {openMenu === 'command' && (
            <div className={styles.navMenu} style={{ minWidth: 220 }}>
              <div className={styles.menuLabel}>COMMAND</div>
              <button onClick={() => go('cmd-commander')}>Commander</button>
              <button onClick={() => go('cmd-xo')}>Executive Officer (XO)</button>
              <button onClick={() => go('cmd-csm')}>Command Sergeant Major</button>
              <div className={styles.menuLabel}>WARRANT OFFICER</div>
              <button onClick={() => go('cmd-cwo')}>Cmd Chief Warrant (180A)</button>
              <button onClick={() => go('cmd-wo-intel')}>Intel Warrant (350F)</button>
              <button onClick={() => go('cmd-wo-signal')}>Signal Warrant (255A)</button>
              <div className={styles.menuLabel}>PERSONAL STAFF</div>
              <button onClick={() => go('ps-chaplain')}>Chaplain</button>
              <button onClick={() => go('ps-ig')}>Inspector General (IG)</button>
              <button onClick={() => go('ps-jag')}>Judge Advocate (JAG)</button>
              <button onClick={() => go('ps-pao')}>Public Affairs (PAO)</button>
            </div>
          )}
        </div>

        {/* Units dropdown */}
        <div className={styles.navDropdown}>
          <button className={styles.navLink} onClick={() => toggle('units')}>
            UNITS <i className="fas fa-chevron-down" style={{ fontSize: '8px' }} />
          </button>
          {openMenu === 'units' && (
            <div className={styles.navMenu} style={{ minWidth: 200, maxHeight: '80vh', overflowY: 'auto' }}>
              {profile.level !== 'group' && (
                <>
                  <div className={styles.menuLabel}>GROUP STAFF</div>
                  <button onClick={() => go('j1')}>View Group Staff</button>
                  <div className={styles.menuLabel}>{
                    profile.level === 'battalion'
                      ? BATTALIONS.find(b => b.key === profile.battalion)?.label ?? 'MY BATTALION'
                      : `${BATTALIONS.find(b => b.key === profile.battalion)?.label ?? 'MY BATTALION'}`
                  }</div>
                  {profile.level === 'battalion' && (
                    <>
                      <button onClick={() => go(`unit-${profile.battalion}`)}>Battalion Overview</button>
                      {BN_COMPANIES.map(co => (
                        <button key={co} onClick={() => go(`unit-${profile.battalion}-${co}`)}>
                          {BN_COMPANY_NAMES[co]}
                        </button>
                      ))}
                    </>
                  )}
                  {profile.level === 'company' && (
                    <>
                      <button onClick={() => go(`unit-${profile.battalion}`)}>Battalion Overview</button>
                      {BN_COMPANIES.map(co => (
                        <button key={co} onClick={() => go(`unit-${profile.battalion}-${co}`)}>
                          {BN_COMPANY_NAMES[co]}
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}
              {profile.level === 'group' && (
                <>
                  <div className={styles.menuLabel}>GROUP HEADQUARTERS</div>
                  <button onClick={() => go('unit-grp-hhc')}>Group HQ</button>
                  {BATTALIONS.map(bn => (
                    <div key={bn.key}>
                      <div className={styles.menuLabel}>{bn.label}</div>
                      <button onClick={() => go(`unit-${bn.key}`)}>Battalion Overview</button>
                      {BN_COMPANIES.map(co => (
                        <button key={co} onClick={() => go(`unit-${bn.key}-${co}`)}>
                          {BN_COMPANY_NAMES[co]}
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className={styles.menuLabel}>GROUP SUPPORT BATTALION (GSB)</div>
                  <button onClick={() => go('unit-gsb')}>GSB Overview</button>
                  {GSB_COMPANIES.map(co => (
                    <button key={co} onClick={() => go(`unit-gsb-${co}`)}>
                      {GSB_COMPANY_NAMES[co]}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Coordinating Staff dropdown */}
        <div className={styles.navDropdown}>
          <button className={styles.navLink} onClick={() => toggle('staff')}>
            COORDINATING STAFF <i className="fas fa-chevron-down" style={{ fontSize: '8px' }} />
          </button>
          {openMenu === 'staff' && (
            <div className={styles.navMenu}>
              {(profile.level === 'group' ? GRP_STAFF_SECTIONS : BN_STAFF_SECTIONS).map(s => (
                <button key={s.key} onClick={() => go(s.key)}>
                  {s.label} — {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Special Staff dropdown */}
        <div className={styles.navDropdown}>
          <button className={styles.navLink} onClick={() => toggle('special')}>
            SPECIAL STAFF <i className="fas fa-chevron-down" style={{ fontSize: '8px' }} />
          </button>
          {openMenu === 'special' && (
            <div className={styles.navMenu} style={{ minWidth: 220 }}>
              <button onClick={() => go('ss')}>Overview</button>
              <div className={styles.menuLabel}>MEDICAL</div>
              <button onClick={() => go('ss-surgeon')}>Group Surgeon</button>
              <button onClick={() => go('ss-pa')}>Physician Asst</button>
              <button onClick={() => go('med-overview')}>Medical Section</button>
              <div className={styles.menuLabel}>READINESS & SAFETY</div>
              <button onClick={() => go('ss-safety')}>Safety</button>
              <button onClick={() => go('ss-cbrn')}>CBRN</button>
              <button onClick={() => go('ss-bn-safety')}>Safety NCO</button>
              <div className={styles.menuLabel}>ARMY PROGRAMS</div>
              <button onClick={() => go('ss-sharp')}>SHARP Team</button>
              <button onClick={() => go('ss-at-team')}>AT Team</button>
              <button onClick={() => go('ss-eo')}>EO Team</button>
              <button onClick={() => go('ss-as-team')}>AS Team</button>
              <button onClick={() => go('ss-eeo-teams')}>EEO Team</button>
              <div className={styles.menuLabel}>ADMIN SUPPORT</div>
              <button onClick={() => go('ss-finance')}>Finance</button>
              <button onClick={() => go('ss-retention')}>Retention</button>
              <button onClick={() => go('ss-career-counselor')}>Career Counselor</button>
            </div>
          )}
        </div>
      </nav>

      {/* Demo unit crumb */}
      <div className={styles.demoCrumb}>
        <i className="fas fa-chevron-right" />
        <span>
          {profile.level === 'group'
            ? '5th Special Forces Group (Airborne) — Fort Campbell, KY'
            : profile.level === 'battalion'
            ? `${BATTALIONS.find(b => b.key === profile.battalion)?.label ?? ''} · 5th SFG — Fort Campbell, KY`
            : `${profile.unitLabel} · ${BATTALIONS.find(b => b.key === profile.battalion)?.label ?? ''} · 5th SFG`
          }
        </span>
      </div>

      {showIntMap && <IntegrationMap onClose={() => setShowIntMap(false)} />}
    </header>
  )
}
