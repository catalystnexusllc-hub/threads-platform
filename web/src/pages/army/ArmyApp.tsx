import { useState } from 'react'
import ClassificationBanner from '../../components/ClassificationBanner/ClassificationBanner'
import NavBar from './components/NavBar/NavBar'
import Sidebar from './components/Sidebar/Sidebar'
import HomePage from './pages/HomePage/HomePage'
import CommandDashboard from './pages/CommandDashboard/CommandDashboard'
import BattleRhythm from './pages/BattleRhythm/BattleRhythm'
import Portfolio from './pages/Portfolio/Portfolio'
import DigitalSyncs from './pages/DigitalSyncs/DigitalSyncs'
import StaffSection from './pages/StaffSection/StaffSection'
import S1Page from './pages/S1/S1Page'
import S2Page from './pages/S2/S2Page'
import UnitView from './pages/UnitView/UnitView'
import UnitPage from './pages/UnitPage/UnitPage'
import Suspenses from './pages/Suspenses/Suspenses'
import CommandTeam from './pages/CommandTeam/CommandTeam'
import MedStaff from './pages/MedStaff/MedStaff'
import SpecialStaffPage from './pages/SpecialStaff/SpecialStaffPage'
import ThreadsAI from './pages/ThreadsAI/ThreadsAI'
import Settings from './pages/Settings/Settings'
import SectionSidebar from './components/SectionSidebar/SectionSidebar'
import { ArmyDataProvider } from './ArmyDataContext'
import { UserProvider } from './UserContext'
import styles from './ArmyApp.module.css'

const SECTION_LABELS: Record<string, string> = {
  j1: 'S1 — Personnel',
  j2: 'S2 — Intelligence',
  j3: 'S3 — Operations',
  j4: 'S4 — Logistics',
  j5: 'S5 — Plans',
  j6: 'S6 — Communications',
  j7: 'S7 — Training',
  j8: 'S8 — Finance',
  j9: 'S9 — Civil Affairs',
  'digital-syncs': 'Digital Syncs',
  ss: 'Special Staff',
  'unit-command': 'Alpha Company',
  med: 'Medical Section',
  'unit-grp-hhc': 'HHC — Group HQ',
  'unit-1bn': '1st BN, 5th SFG',
  'unit-1bn-hhd': '1/5 — HHD',
  'unit-1bn-a': '1/5 — Alpha Company',
  'unit-1bn-b': '1/5 — Bravo Company',
  'unit-1bn-c': '1/5 — Charlie Company',
  'unit-1bn-spt': '1/5 — Support Company',
  'unit-2bn': '2nd BN, 5th SFG',
  'unit-2bn-hhd': '2/5 — HHD',
  'unit-2bn-a': '2/5 — Alpha Company',
  'unit-2bn-b': '2/5 — Bravo Company',
  'unit-2bn-c': '2/5 — Charlie Company',
  'unit-2bn-spt': '2/5 — Support Company',
  'unit-3bn': '3rd BN, 5th SFG',
  'unit-3bn-hhd': '3/5 — HHD',
  'unit-3bn-a': '3/5 — Alpha Company',
  'unit-3bn-b': '3/5 — Bravo Company',
  'unit-3bn-c': '3/5 — Charlie Company',
  'unit-3bn-spt': '3/5 — Support Company',
  'unit-gsb': 'Group Support Bn (GSB)',
  'unit-gsb-hhc': 'GSB — HHC',
  'unit-gsb-svc': 'GSB — Svc & Spt Co',
  'unit-gsb-fsc': 'GSB — Forward Spt Co',
}

const UNIT_SECTION_KEYS = new Set([
  'unit-grp-hhc',
  'unit-1bn', 'unit-1bn-hhd', 'unit-1bn-a', 'unit-1bn-b', 'unit-1bn-c', 'unit-1bn-spt',
  'unit-2bn', 'unit-2bn-hhd', 'unit-2bn-a', 'unit-2bn-b', 'unit-2bn-c', 'unit-2bn-spt',
  'unit-3bn', 'unit-3bn-hhd', 'unit-3bn-a', 'unit-3bn-b', 'unit-3bn-c', 'unit-3bn-spt',
  'unit-gsb', 'unit-gsb-hhc', 'unit-gsb-svc', 'unit-gsb-fsc',
])

function parseSectionCtx(page: string): { key: string; subPage: string; label: string } | null {
  // First try j1–j9, unit-command (legacy), or med
  const staffMatch = page.match(/^(j[1-9]|unit-command|med|digital-syncs|ss)(?:-(.+))?$/)
  if (staffMatch) {
    const key = staffMatch[1]
    const subPage = staffMatch[2] || 'overview'
    const label = SECTION_LABELS[key] ?? key
    return { key, subPage, label }
  }
  // Try known unit section keys — longest match first to handle unit-1bn-a vs unit-1bn
  for (const unitKey of [...UNIT_SECTION_KEYS].sort((a, b) => b.length - a.length)) {
    if (page === unitKey || page.startsWith(unitKey + '-')) {
      const subPage = page === unitKey ? 'overview' : page.slice(unitKey.length + 1)
      const label = SECTION_LABELS[unitKey] ?? unitKey
      return { key: unitKey, subPage, label }
    }
  }
  return null
}

export default function ArmyApp() {
  const [currentPage, setCurrentPage] = useState('home')

  function renderPage() {
    // Staff sections j1–j9, company sub-pages, and medical — section sidebar handles nav
    const sectionCtx = parseSectionCtx(currentPage)
    if (sectionCtx) {
      const { key, subPage } = sectionCtx
      if (key === 'digital-syncs') return <DigitalSyncs subPage={subPage} onNavigate={setCurrentPage} />
      if (key === 'j1') return <S1Page subPage={subPage} onNavigate={setCurrentPage} />
      if (key === 'j2') return <S2Page subPage={subPage} onNavigate={setCurrentPage} />
      if (key === 'ss') return <SpecialStaffPage subPage={subPage} onNavigate={setCurrentPage} />
      if (key === 'med') {
        const tabMap: Record<string, 'overview' | 'roster' | 'aid-station' | 'readiness'> = {
          overview: 'overview', roster: 'roster',
          'aid-station': 'aid-station', readiness: 'readiness',
        }
        return <MedStaff initialTab={tabMap[subPage] ?? 'overview'} onNavigate={setCurrentPage} />
      }
      const num = key.match(/^j([2-9])/)?.[1]
      if (num) return <StaffSection section={`S${num}`} subPage={subPage} sectionKey={key} onNavigate={setCurrentPage} />
      // All unit-* section keys route to UnitPage
      if (key.startsWith('unit-')) return <UnitPage subPage={subPage} unitKey={key} unitLabel={sectionCtx.label} onNavigate={setCurrentPage} />
      return <UnitPage subPage={subPage} unitKey={key} unitLabel={sectionCtx.label} onNavigate={setCurrentPage} />
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'command-dashboard':
        return <CommandDashboard />
      case 'battle-rhythm':
        return <BattleRhythm />
      case 'your-portfolio':
      case 'dd93':
        return <Portfolio />
      case 'suspenses':
        return <Suspenses />
      case 'settings':
        return <Settings />
      case 'threads-ai':
      case 'digital-staff-officer':
        return <ThreadsAI />
      case 'cmd-commander':
      case 'cmd-warrant':
        return <CommandTeam />
      case 'unit-command': // legacy direct link — redirect to section ctx
        return <UnitView />
      default:
        return (
          <div className={styles.placeholder}>
            <i className="fas fa-tools" />
            <p>{currentPage}</p>
            <span>Page under construction</span>
          </div>
        )
    }
  }

  return (
    <UserProvider>
    <ArmyDataProvider>
      <div className={styles.root}>
        <ClassificationBanner position="top" />
        <NavBar onNavigate={setCurrentPage} currentPage={currentPage} />

        <div className={styles.body}>
          {(() => {
            const ctx = parseSectionCtx(currentPage)
            return ctx
              ? <SectionSidebar
                  sectionKey={ctx.key}
                  sectionLabel={ctx.label}
                  subPage={ctx.subPage}
                  onNavigate={setCurrentPage}
                />
              : <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          })()}
          <main className={styles.main}>
            <div className={styles.scroll}>
              {renderPage()}
            </div>
          </main>
        </div>

        <ClassificationBanner position="bottom" />
      </div>
    </ArmyDataProvider>
    </UserProvider>
  )
}
