import type {
  AppData,
  SoldierRecord,
  UnitSection,
  SitrepEntry,
  StandupEvent,
  LeaderGroup,
} from '../types/army'

const BASE = '/api'

// Build-time injected (Vite inlines VITE_*). Required only if the api enforces
// API_KEY; sent on every request so mutations (PUT/POST/DELETE) authenticate.
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (API_KEY) headers['X-Api-Key'] = API_KEY
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  })
  const json = await res.json()
  if (!res.ok || !json.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
  return json as T
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
export async function fetchAppData(): Promise<AppData> {
  const json = await request<{ ok: true; data: AppData }>('/data')
  return json.data
}

// ── Soldiers ──────────────────────────────────────────────────────────────────
export async function updateSoldier(
  id: string,
  patch: Partial<SoldierRecord>,
): Promise<SoldierRecord> {
  const json = await request<{ ok: true; soldier: SoldierRecord }>(
    `/soldiers/${id}`,
    { method: 'PUT', body: JSON.stringify(patch) },
  )
  return json.soldier
}

// ── Unit Sections ─────────────────────────────────────────────────────────────
export async function fetchSections(unit: string): Promise<UnitSection[]> {
  const json = await request<{ ok: true; sections: UnitSection[] }>(
    `/sections/${unit}`,
  )
  return json.sections
}

export async function addSection(
  unit: string,
  section: Omit<UnitSection, 'color'> & { color?: string },
): Promise<UnitSection[]> {
  const json = await request<{ ok: true; sections: UnitSection[] }>(
    `/sections/${unit}`,
    { method: 'POST', body: JSON.stringify(section) },
  )
  return json.sections
}

export async function reorderSections(
  unit: string,
  sections: UnitSection[],
): Promise<UnitSection[]> {
  const json = await request<{ ok: true; sections: UnitSection[] }>(
    `/sections/${unit}`,
    { method: 'PUT', body: JSON.stringify({ sections }) },
  )
  return json.sections
}

// ── SITREP ────────────────────────────────────────────────────────────────────
export async function updateSitrep(
  index: number,
  patch: Partial<SitrepEntry>,
): Promise<SitrepEntry> {
  const json = await request<{ ok: true; sitrep: SitrepEntry }>(
    `/sitreps/${index}`,
    { method: 'PUT', body: JSON.stringify(patch) },
  )
  return json.sitrep
}

// ── Standup Events ────────────────────────────────────────────────────────────
export async function createEvent(
  event: Omit<StandupEvent, 'id'>,
): Promise<StandupEvent> {
  const json = await request<{ ok: true; event: StandupEvent }>(
    '/events',
    { method: 'POST', body: JSON.stringify(event) },
  )
  return json.event
}

export async function updateEvent(
  id: number,
  patch: Partial<StandupEvent>,
): Promise<StandupEvent> {
  const json = await request<{ ok: true; event: StandupEvent }>(
    `/events/${id}`,
    { method: 'PUT', body: JSON.stringify(patch) },
  )
  return json.event
}

export async function deleteEvent(id: number): Promise<void> {
  await request(`/events/${id}`, { method: 'DELETE' })
}

// ── Leader Locations ──────────────────────────────────────────────────────────
export async function updateLeaderLocation(
  leaderId: number | string,
  day: number | string,
  location: string,
): Promise<void> {
  await request('/locations', {
    method: 'PUT',
    body: JSON.stringify({ leaderId, day, location }),
  })
}

export async function updateCloseoutLocation(
  leaderId: number | string,
  day: number | string,
  location: string,
): Promise<void> {
  await request('/closeout-locations', {
    method: 'PUT',
    body: JSON.stringify({ leaderId, day, location }),
  })
}

// ── Leader Groups (used by Closeout) ──────────────────────────────────────────
export async function fetchLeaderGroups(): Promise<LeaderGroup[]> {
  const json = await request<{ ok: true; groups: LeaderGroup[] }>('/leader-groups')
  return json.groups
}
