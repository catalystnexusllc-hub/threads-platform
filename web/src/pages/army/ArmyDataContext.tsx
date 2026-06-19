import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchAppData } from '../../api/client'
import type { AppData } from '../../types/army'

interface ArmyDataState {
  data: AppData | null
  loading: boolean
  error: string | null
  reload: () => void
}

const ArmyDataContext = createContext<ArmyDataState | null>(null)

export function ArmyDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    fetchAppData()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <ArmyDataContext.Provider value={{ data, loading, error, reload: load }}>
      {children}
    </ArmyDataContext.Provider>
  )
}

export function useArmyData(): ArmyDataState {
  const ctx = useContext(ArmyDataContext)
  if (!ctx) throw new Error('useArmyData must be used within ArmyDataProvider')
  return ctx
}
