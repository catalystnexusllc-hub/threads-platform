import { createContext, useContext, useState, type ReactNode } from 'react'

export type UnitLevel = 'group' | 'battalion' | 'company'

export interface UserProfile {
  name: string
  rank: string
  mos: string
  role: string                // e.g. 'S1', 'S2', 'Commander'
  level: UnitLevel
  battalion: string | null    // '1bn' | '2bn' | '3bn' | 'gsb' | null (group level)
  company: string | null      // 'a' | 'b' | 'c' | 'hhd' | 'spt' | null
  unitKey: string             // e.g. 'unit-3bn', 'unit-3bn-a', 'unit-grp-hhc'
  unitLabel: string
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'John Smith',
  rank: 'SSG',
  mos: '42A',
  role: 'S1',
  level: 'group',
  battalion: null,
  company: null,
  unitKey: 'unit-grp-hhc',
  unitLabel: '5th SFG — Group HQ',
}

interface UserCtx {
  profile: UserProfile
  setProfile: (p: UserProfile) => void
}

const UserContext = createContext<UserCtx>({
  profile: DEFAULT_PROFILE,
  setProfile: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}

export const DEMO_PROFILES: UserProfile[] = [
  {
    name: 'John Smith', rank: 'SSG', mos: '42A', role: 'S1',
    level: 'group', battalion: null, company: null,
    unitKey: 'unit-grp-hhc', unitLabel: '5th SFG — Group HQ',
  },
  {
    name: 'Jane Doe', rank: 'SFC', mos: '18Z', role: 'S3',
    level: 'battalion', battalion: '3bn', company: null,
    unitKey: 'unit-3bn', unitLabel: '3rd BN, 5th SFG',
  },
  {
    name: 'Mike Torres', rank: 'SGT', mos: '18B', role: 'Team Leader',
    level: 'company', battalion: '3bn', company: 'a',
    unitKey: 'unit-3bn-a', unitLabel: '3/5 — Alpha Company',
  },
]
