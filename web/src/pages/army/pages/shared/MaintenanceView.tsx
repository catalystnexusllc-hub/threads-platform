import shared from '../shared.module.css'
import { STATUS_COLOR } from '../util'
import type { PmcsRow, WorkOrderRow } from './pmcsSeedData'
import { NSN_TM_INTERVALS } from './pmcsSeedData'

interface MaintStats {
  overdue: number; due: number; current: number
  openWOs: number; nmcItems: number; partsOnOrder: number
}

interface MaintContact {
  role: string; name: string; section: string; phone: string; email: string
}

interface Props {
  schedule:   PmcsRow[]
  workOrders: WorkOrderRow[]
  stats:      MaintStats
  contacts:   MaintContact[]
  showTmRef?: boolean
}

export default function MaintenanceView({ schedule, workOrders, stats, contacts, showTmRef = false }: Props) {
  const statTiles = [
    { label: 'PMCS Overdue',      value: stats.overdue,      bg: stats.overdue > 0      ? STATUS_COLOR.Red   : '#2d2d2d' },
    { label: 'PMCS Due (7 days)', value: stats.due,          bg: stats.due > 0          ? STATUS_COLOR.Amber : '#2d2d2d' },
    { label: 'PMCS Current',      value: stats.current,      bg: STATUS_COLOR.Green                                       },
    { label: 'NMC Items',         value: stats.nmcItems,     bg: stats.nmcItems > 0     ? STATUS_COLOR.Red   : '#2d2d2d' },
    { label: 'Open Work Orders',  value: stats.openWOs,      bg: stats.openWOs > 0      ? STATUS_COLOR.Amber : '#2d2d2d' },
    { label: 'Parts on Order',    value: stats.partsOnOrder, bg: '#2d2d2d'                                                },
  ]

  // Build unique TM reference list for the reference panel
  const tmRefs = Array.from(
    new Map(schedule.map(r => [r.nsn, { nsn: r.nsn, nomenclature: r.nomenclature, tmRef: r.tmRef, maintenanceLevel: r.maintenanceLevel }])).values()
  )

  return (
    <>
      <div style={{ padding:'8px 14px', background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:4, fontSize:11, color:'#555', marginBottom:12 }}>
        <i className="fas fa-info-circle" style={{ marginRight:6, color:'#333' }} />
        PMCS per DA Pam 750-8 / AR 750-1. Schedule computed from NSN→TM interval table (APD) + last-performed dates from GCSS-Army.
        FMC = Fully Mission Capable · PMC = Partially Mission Capable · NMC = Non-Mission Capable (deadlined).
      </div>

      <div className={shared.stats} style={{ marginBottom:16 }}>
        {statTiles.map(s => (
          <div key={s.label} className={shared.stat} style={{ background:s.bg }}>
            <div className={shared.statValue}>{s.value}</div>
            <div className={shared.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* PMCS Schedule */}
      <div className={shared.card} style={{ marginBottom:16 }}>
        <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span><i className="fas fa-calendar-alt" /> PMCS Schedule (Source: APD TM Intervals + GCSS-Army)</span>
          <span style={{ fontSize:9, color:'#444', fontWeight:700, letterSpacing:'0.5px' }}>DA PAM 750-8 · AR 750-1</span>
        </div>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>NSN</th>
                {showTmRef && <th>TM Reference</th>}
                <th>Service Type</th>
                <th>Interval</th>
                <th>Maint Level</th>
                <th>Last Performed</th>
                <th>Next Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((m, i) => {
                const overdue = m.status === 'OVERDUE'
                const due     = m.status === 'DUE'
                const color   = overdue ? '#e74c3c' : due ? '#e67e22' : '#27ae60'
                return (
                  <tr key={i}>
                    <td style={{ fontWeight:600, color:'#ccc' }}>{m.nomenclature}</td>
                    <td style={{ fontFamily:'monospace', fontSize:10, color:'#444' }}>{m.nsn}</td>
                    {showTmRef && <td style={{ fontSize:10, color:'#555' }}>{m.tmRef}</td>}
                    <td style={{ fontSize:11 }}>{m.serviceType}</td>
                    <td style={{ fontSize:10, color:'#666' }}>{m.interval}</td>
                    <td style={{ fontSize:10, color:'#555' }}>{m.maintenanceLevel}</td>
                    <td style={{ fontSize:10, color:'#888' }}>{m.lastPerformed}</td>
                    <td style={{ color, fontWeight:(overdue||due) ? 700 : 400 }}>{m.nextDue}</td>
                    <td>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3,
                        background: overdue ? 'rgba(192,57,43,0.2)' : due ? 'rgba(230,126,34,0.15)' : 'rgba(45,106,79,0.2)',
                        color }}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Orders */}
      <div className={shared.card} style={{ marginBottom:16 }}>
        <div className={shared.cardHeader} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span><i className="fas fa-clipboard-list" /> Work Orders — DA Form 5988-E (Source: GCSS-Army / SAMS-E)</span>
          <span style={{ fontSize:9, color:'#444', fontWeight:700, letterSpacing:'0.5px' }}>NMC = DEADLINED</span>
        </div>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr><th>WO #</th><th>Equipment</th><th>Fault Description</th><th>Priority</th><th>NMC</th><th>Opened</th><th>Est. Completion</th><th>Shop</th><th>Status</th></tr>
            </thead>
            <tbody>
              {workOrders.map((w, i) => {
                const closed  = w.status === 'Closed'
                const urgent  = w.priority === 'URGENT'
                const pri     = w.priority === 'Priority'
                const statusBg = closed ? 'rgba(45,106,79,0.15)' : w.status === 'In Progress' ? 'rgba(201,162,39,0.1)' : w.status === 'Parts on Order' ? 'rgba(90,30,150,0.15)' : '#1a1a1a'
                const statusColor = closed ? '#27ae60' : w.status === 'In Progress' ? '#c9a227' : w.status === 'Parts on Order' ? '#9b59b6' : '#555'
                return (
                  <tr key={i}>
                    <td style={{ fontFamily:'monospace', fontSize:10, color:'#555' }}>{w.woNumber}</td>
                    <td style={{ fontWeight:600, color:'#ccc' }}>{w.nomenclature}</td>
                    <td style={{ fontSize:11, color:'#888', maxWidth:240 }}>{w.fault}</td>
                    <td>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3,
                        background: urgent ? 'rgba(192,57,43,0.2)' : pri ? 'rgba(201,162,39,0.1)' : '#1a1a1a',
                        color:      urgent ? '#e74c3c'             : pri ? '#c9a227'              : '#666' }}>
                        {w.priority}
                      </span>
                    </td>
                    <td style={{ textAlign:'center', color: w.nmc && !closed ? '#e74c3c' : '#444', fontWeight:700, fontSize:11 }}>
                      {w.nmc && !closed ? <i className="fas fa-times-circle" /> : '—'}
                    </td>
                    <td style={{ fontSize:10, color:'#555' }}>{w.opened}</td>
                    <td style={{ fontSize:10, color: closed ? '#555' : '#888' }}>{w.estCompletion}</td>
                    <td style={{ fontSize:11, color:'#666' }}>{w.shop}</td>
                    <td>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3, background:statusBg, color:statusColor }}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={shared.grid2}>
        {/* TM Reference panel */}
        <div className={shared.card}>
          <div className={shared.cardHeader}><i className="fas fa-book" /> TM Reference by NSN (Source: APD)</div>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead><tr><th>NSN</th><th>Nomenclature</th><th>TM Reference</th><th>Governing Reg</th><th>Maint Level</th></tr></thead>
              <tbody>
                {tmRefs.map((r, i) => {
                  const entry = NSN_TM_INTERVALS[r.nsn]
                  return (
                    <tr key={i}>
                      <td style={{ fontFamily:'monospace', fontSize:10, color:'#555' }}>{r.nsn}</td>
                      <td style={{ fontWeight:600, color:'#ccc', fontSize:11 }}>{r.nomenclature}</td>
                      <td style={{ fontSize:10, color:'#c9a227' }}>{r.tmRef}</td>
                      <td style={{ fontSize:10, color:'#555' }}>{entry?.governingRef ?? '—'}</td>
                      <td style={{ fontSize:10, color:'#666' }}>{r.maintenanceLevel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance contacts */}
        {contacts.length > 0 && (
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-users" /> Maintenance Contacts</div>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead><tr><th>Role</th><th>Name</th><th>Section</th><th>Phone</th><th>NIPR Email</th></tr></thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:700, color:'#ccc', fontSize:11 }}>{c.role}</td>
                      <td>{c.name}</td>
                      <td style={{ color:'#666', fontSize:10 }}>{c.section}</td>
                      <td style={{ fontFamily:'monospace', fontSize:10, color:'#555' }}>{c.phone}</td>
                      <td style={{ fontFamily:'monospace', fontSize:10, color:'#555' }}>{c.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
