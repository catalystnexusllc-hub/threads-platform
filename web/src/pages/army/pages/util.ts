import type { SoldierRecord } from '../../../types/army'

export const STATUS_COLOR: Record<string, string> = {
  Green: '#27ae60', Amber: '#f39c12', Red: '#e74c3c',
}

export interface Flag {
  slug: string
  name: string
  rank: string
  item: string
  detail: string
  severity: 'high' | 'med'
}

const DOC_LABELS: Array<['dd93' | 'sglv' | 'prr', string]> = [
  ['dd93', 'DD93'], ['sglv', 'SGLV'], ['prr', 'PRR'],
]
const TRAINING_LABELS: Array<['cyber' | 'aup' | 'sharp', string]> = [
  ['cyber', 'Cyber Awareness'], ['aup', 'AUP'], ['sharp', 'SHARP'],
]

/** Derive readiness flags (suspenses) across the roster from the live record. */
export function scanFlags(soldiers: Record<string, SoldierRecord>): Flag[] {
  const out: Flag[] = []
  for (const [slug, s] of Object.entries(soldiers)) {
    const base = { slug, name: s.name, rank: s.rank }
    for (const [key, label] of DOC_LABELS) {
      if (s[key]?.status === 'Overdue') out.push({ ...base, item: label, detail: 'Overdue', severity: 'high' })
    }
    const med = String(s.medical?.status ?? '')
    if (med === 'Red') out.push({ ...base, item: 'Medical', detail: 'Red — not ready', severity: 'high' })
    else if (med === 'Amber') out.push({ ...base, item: 'Medical', detail: 'Amber — at risk', severity: 'med' })
    const acft = String(s.acft?.status ?? '')
    if (acft === 'Fail') out.push({ ...base, item: 'ACFT', detail: 'Fail', severity: 'high' })
    else if (acft === 'Required') out.push({ ...base, item: 'ACFT', detail: 'Required', severity: 'med' })
    for (const [key, label] of TRAINING_LABELS) {
      if (s.training?.[key] === 'Overdue') out.push({ ...base, item: label, detail: 'Overdue', severity: 'high' })
    }
  }
  return out
}
