// Seed data adapter for S1Page — all data inline from seed/datasets/
// Sources: IPPSA, MEDPROS, DISS, DTMS, DTS, GCSS-Army, j1-admin-stress, j8-awards-pipeline
// Extract date: 18 Jun 2026  (use this as "today" for computed fields)

const EXTRACT_DATE = new Date('2026-06-18')

// ── Date helpers ────────────────────────────────────────────────────────────
function parseDate(s: string): Date {
  return new Date(s)
}

export function daysUntil(dateStr: string): number {
  const target = parseDate(dateStr)
  return Math.round((target.getTime() - EXTRACT_DATE.getTime()) / 86_400_000)
}



export function etsFlag(daysOut: number): 'critical' | 'warning' | 'ok' {
  if (daysOut <= 30)  return 'critical'
  if (daysOut <= 60)  return 'warning'
  if (daysOut <= 90)  return 'warning'
  return 'ok'
}

// ── IPPSA — 2nd Bn, 5th SFG (Airborne) ─────────────────────────────────────
export interface IppsaRow {
  edipi: string
  rank: string
  lastName: string
  firstName: string
  gradeCode: string
  mos: string
  positionTitle: string
  section: string
  pebd: string
  ets: string
  bah: number
  bas: number
  sdap: number | null
  sglv: number
  tspPct: number
  allotments: { type: string; amount: number }[]
  payIssues: string[]
}

export const IPPSA_SOLDIERS: IppsaRow[] = [
  { edipi:'5051001001', rank:'LTC', lastName:'Bradley',    firstName:'Michael', gradeCode:'O5', mos:'18A', positionTitle:'Battalion Commander',         section:'Command',  pebd:'1998-06-01', ets:'2031-12-31', bah:2800, bas:286.68, sdap:450,  sglv:25.00,  tspPct:10, allotments:[{type:'USAA Life',amount:150},{type:'USAA Savings',amount:500}], payIssues:[] },
  { edipi:'5051001002', rank:'MAJ', lastName:'Ortega',     firstName:'James',   gradeCode:'O4', mos:'18A', positionTitle:'Battalion Executive Officer',  section:'Command',  pebd:'2003-05-01', ets:'2031-05-01', bah:2650, bas:286.68, sdap:450,  sglv:25.00,  tspPct:5,  allotments:[{type:'USAA Mortgage',amount:1200}], payIssues:[] },
  { edipi:'5051002001', rank:'CPT', lastName:'Phillips',   firstName:'Sarah',   gradeCode:'O3', mos:'42H', positionTitle:'S1 Personnel Officer',         section:'S1',       pebd:'2015-06-01', ets:'2029-06-01', bah:1850, bas:286.68, sdap:null, sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051002002', rank:'SFC', lastName:'Garza',      firstName:'Roberto', gradeCode:'E7', mos:'42A', positionTitle:'S1 NCOIC',                     section:'S1',       pebd:'2004-01-01', ets:'2026-12-31', bah:1720, bas:286.68, sdap:null, sglv:20.00,  tspPct:10, allotments:[{type:'AAFES Star Card',amount:50}], payIssues:['DD93 beneficiary update pending — deployment gap 2024; S1 action required'] },
  { edipi:'5051002005', rank:'SGT', lastName:'Bynum',      firstName:'Keisha',  gradeCode:'E5', mos:'42A', positionTitle:'Personnel Actions NCO',        section:'S1',       pebd:'2021-05-15', ets:'2027-05-14', bah:1240, bas:286.68, sdap:null, sglv:20.00,  tspPct:3,  allotments:[], payIssues:['New gain — SGLV beneficiary update pending in-processing','DD93 not on file — in-processing action item'] },
  { edipi:'5051003001', rank:'CPT', lastName:'Hassan',     firstName:'Kareem',  gradeCode:'O3', mos:'35D', positionTitle:'S2 Intelligence Officer',       section:'S2',       pebd:'2014-06-01', ets:'2030-06-01', bah:1850, bas:286.68, sdap:null, sglv:25.00,  tspPct:5,  allotments:[{type:'USAA Savings',amount:300}], payIssues:[] },
  { edipi:'5051003002', rank:'SFC', lastName:'Okafor',     firstName:'Emeka',   gradeCode:'E7', mos:'35L', positionTitle:'S2 NCOIC',                     section:'S2',       pebd:'2005-09-01', ets:'2028-08-31', bah:1720, bas:286.68, sdap:null, sglv:20.00,  tspPct:8,  allotments:[], payIssues:[] },
  { edipi:'5051004001', rank:'MAJ', lastName:'Vasquez',    firstName:'Carlos',  gradeCode:'O4', mos:'18A', positionTitle:'S3 Operations Officer',         section:'S3',       pebd:'2005-05-01', ets:'2033-04-30', bah:2650, bas:286.68, sdap:450,  sglv:25.00,  tspPct:5,  allotments:[{type:'USAA Savings',amount:400}], payIssues:[] },
  { edipi:'5051004002', rank:'MSG', lastName:'Perkins',    firstName:'James',   gradeCode:'E8', mos:'18Z', positionTitle:'S3 NCOIC',                     section:'S3',       pebd:'1999-06-01', ets:'2029-05-30', bah:1850, bas:286.68, sdap:450,  sglv:20.00,  tspPct:10, allotments:[{type:'Army Emergency Relief',amount:25}], payIssues:[] },
  { edipi:'5051005001', rank:'MAJ', lastName:'Morrison',   firstName:'David',   gradeCode:'O4', mos:'92A', positionTitle:'S4 Logistics Officer',          section:'S4',       pebd:'2006-06-01', ets:'2034-06-01', bah:2650, bas:286.68, sdap:null, sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051005002', rank:'SFC', lastName:'Delgado',    firstName:'Maria',   gradeCode:'E7', mos:'92Y', positionTitle:'S4 NCOIC / Property Book NCO', section:'S4',       pebd:'2007-03-01', ets:'2029-02-28', bah:1720, bas:286.68, sdap:null, sglv:20.00,  tspPct:5,  allotments:[], payIssues:['PRR (Periodic Reinvestigation) overdue — clearance review pending'] },
  { edipi:'5051006001', rank:'MAJ', lastName:'Donovan',    firstName:'Patrick', gradeCode:'O4', mos:'38A', positionTitle:'S5 Plans Officer',              section:'S5',       pebd:'2006-06-01', ets:'2033-05-31', bah:2650, bas:286.68, sdap:null, sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051007001', rank:'CPT', lastName:'Kowalczyk',  firstName:'Michael', gradeCode:'O3', mos:'25A', positionTitle:'S6 Signal / Network OIC',       section:'S6',       pebd:'2017-06-01', ets:'2031-06-01', bah:1850, bas:286.68, sdap:null, sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051008001', rank:'CPT', lastName:'Hayes',      firstName:'Brittany',gradeCode:'O3', mos:'18A', positionTitle:'S7 Training Officer',           section:'S7',       pebd:'2016-06-01', ets:'2030-06-01', bah:1850, bas:286.68, sdap:null, sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051008002', rank:'SFC', lastName:'Warren',     firstName:'Daniel',  gradeCode:'E7', mos:'18Z', positionTitle:'S7 NCOIC',                     section:'S7',       pebd:'2001-03-01', ets:'2029-02-28', bah:1720, bas:286.68, sdap:450,  sglv:20.00,  tspPct:10, allotments:[{type:'Navy Federal Savings',amount:200}], payIssues:[] },
  { edipi:'5051009001', rank:'MAJ', lastName:'Navarro',    firstName:'Carlos',  gradeCode:'O4', mos:'36A', positionTitle:'S8 Finance Officer',            section:'S8',       pebd:'2006-01-01', ets:'2032-12-31', bah:2650, bas:286.68, sdap:null, sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051009002', rank:'CW3', lastName:'McKinley',   firstName:'Marcus',  gradeCode:'W3', mos:'360A',positionTitle:'Finance Technician',            section:'S8',       pebd:'2008-01-01', ets:'2028-08-31', bah:1850, bas:286.68, sdap:null, sglv:20.00,  tspPct:8,  allotments:[{type:'USAA Life',amount:200}], payIssues:['PRR overdue — dental Amber; clearance downgrade risk'] },
  { edipi:'5051010001', rank:'MAJ', lastName:'Okafor',     firstName:'James',   gradeCode:'O4', mos:'38A', positionTitle:'S9 Civil Affairs Officer',      section:'S9',       pebd:'2007-05-01', ets:'2034-05-31', bah:2650, bas:286.68, sdap:null, sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051011001', rank:'CPT', lastName:'Thompson',   firstName:'Marcus',  gradeCode:'O3', mos:'18A', positionTitle:'Alpha Company Commander',       section:'Alpha Co', pebd:'2015-09-01', ets:'2031-09-30', bah:1850, bas:286.68, sdap:450,  sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051011002', rank:'CPT', lastName:'Harris',     firstName:'Brenda',  gradeCode:'O3', mos:'18A', positionTitle:'Bravo Company Commander',       section:'Bravo Co', pebd:'2016-01-01', ets:'2030-06-01', bah:1850, bas:286.68, sdap:450,  sglv:25.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051012001', rank:'SFC', lastName:'Guerrero',   firstName:'Roberto', gradeCode:'E7', mos:'18Z', positionTitle:'Team Sergeant ODA-5211',       section:'ODA',      pebd:'2010-01-01', ets:'2027-12-31', bah:1720, bas:286.68, sdap:600,  sglv:20.00,  tspPct:8,  allotments:[], payIssues:[] },
  { edipi:'5051012002', rank:'SFC', lastName:'Okonkwo',    firstName:'Chidi',   gradeCode:'E7', mos:'18Z', positionTitle:'Team Sergeant ODA-5221',       section:'ODA',      pebd:'2009-06-01', ets:'2027-06-30', bah:1720, bas:286.68, sdap:600,  sglv:20.00,  tspPct:5,  allotments:[], payIssues:['Medical hold — shoulder; PT in progress. SDAP review pending.'] },
  { edipi:'5051013001', rank:'MSG', lastName:'Ingram',     firstName:'Tyrone',  gradeCode:'E8', mos:'92Y', positionTitle:'Support Co First Sergeant',    section:'Spt Co',   pebd:'2003-01-01', ets:'2027-06-30', bah:1850, bas:286.68, sdap:null, sglv:20.00,  tspPct:10, allotments:[{type:'Army Emergency Relief',amount:30}], payIssues:['DD93 beneficiary update pending — PCS gap 2025'] },
  { edipi:'5051014001', rank:'SFC', lastName:'Riley',      firstName:'Marcus',  gradeCode:'E7', mos:'18F', positionTitle:'S3 / WTU MEB Soldier',         section:'WTU',      pebd:'2011-01-01', ets:'2028-05-31', bah:1720, bas:286.68, sdap:null, sglv:20.00,  tspPct:5,  allotments:[], payIssues:['MEB IN PROGRESS — SDAP suspended; BAMC coordination ongoing; WTU admin required'] },
  { edipi:'5051015001', rank:'SFC', lastName:'Moreno',     firstName:'Elena',   gradeCode:'E7', mos:'68W', positionTitle:'Medical Section NCOIC',        section:'Medical',  pebd:'2011-04-01', ets:'2028-03-31', bah:1720, bas:286.68, sdap:null, sglv:20.00,  tspPct:5,  allotments:[], payIssues:[] },
  { edipi:'5051016001', rank:'SSG', lastName:'Washington', firstName:'James',   gradeCode:'E6', mos:'18D', positionTitle:'S7 Training NCO / WTU MEB',    section:'WTU',      pebd:'2015-01-01', ets:'2029-02-28', bah:1600, bas:286.68, sdap:null, sglv:20.00,  tspPct:5,  allotments:[], payIssues:['MEB IN PROGRESS — combat knee injury; WTU admin; VA rating pending'] },
  { edipi:'5051017001', rank:'SFC', lastName:'Diallo',     firstName:'Aminata', gradeCode:'E7', mos:'38B', positionTitle:'S9 CA NCOIC',                  section:'S9',       pebd:'2010-07-01', ets:'2029-07-31', bah:1720, bas:286.68, sdap:null, sglv:20.00,  tspPct:5,  allotments:[], payIssues:[] },
]

// ── MEDPROS — medical readiness ──────────────────────────────────────────────
export interface MedprosRow {
  dodid: string
  name: string
  rank: string
  section: string
  medStatus: 'Green' | 'Amber' | 'Red'
  mrcClass: string
  dental: string
  dentalDate: string
  immunizations: string
  lastPHA: string
  phaDue: string
  pulhes: string
  deployable: boolean
  deployRestriction: string | null
}

export const MEDPROS_SOLDIERS: MedprosRow[] = [
  { dodid:'5051001001', name:'Bradley, Michael K.', rank:'LTC', section:'Command',  medStatus:'Green', mrcClass:'Class 1', dental:'Class 1', dentalDate:'15 Jan 2026', immunizations:'Current', lastPHA:'15 Jan 2026', phaDue:'15 Jan 2027', pulhes:'111111', deployable:true,  deployRestriction:null },
  { dodid:'5051001002', name:'Ortega, James F.',    rank:'MAJ', section:'Command',  medStatus:'Green', mrcClass:'Class 1', dental:'Class 1', dentalDate:'20 Feb 2026', immunizations:'Current', lastPHA:'20 Feb 2026', phaDue:'20 Feb 2027', pulhes:'111111', deployable:true,  deployRestriction:null },
  { dodid:'5051002001', name:'Phillips, Sarah T.',  rank:'CPT', section:'S1',       medStatus:'Green', mrcClass:'Class 1', dental:'Class 1', dentalDate:'10 Mar 2026', immunizations:'Current', lastPHA:'10 Mar 2026', phaDue:'10 Mar 2027', pulhes:'111111', deployable:true,  deployRestriction:null },
  { dodid:'5051002002', name:'Garza, Roberto M.',   rank:'SFC', section:'S1',       medStatus:'Amber', mrcClass:'Class 2', dental:'Class 3', dentalDate:'01 Jun 2024', immunizations:'Current', lastPHA:'01 Jun 2024', phaDue:'01 Jun 2025', pulhes:'111111', deployable:true,  deployRestriction:'Dental Class 3 — repair scheduled Jun 2026; PHA overdue 12 months' },
  { dodid:'5051002005', name:'Bynum, Keisha A.',    rank:'SGT', section:'S1',       medStatus:'Amber', mrcClass:'Class 3', dental:'Class 2', dentalDate:'14 Apr 2026', immunizations:'Pending', lastPHA:'14 Apr 2026', phaDue:'14 Apr 2027', pulhes:'111121', deployable:false, deployRestriction:'Immunizations pending — Typhoid and Yellow Fever required; profile T2 (temp profile, knee)' },
  { dodid:'5051003001', name:'Hassan, Kareem J.',   rank:'CPT', section:'S2',       medStatus:'Green', mrcClass:'Class 1', dental:'Class 1', dentalDate:'15 Feb 2026', immunizations:'Current', lastPHA:'15 Feb 2026', phaDue:'15 Feb 2027', pulhes:'111111', deployable:true,  deployRestriction:null },
  { dodid:'5051004001', name:'Vasquez, Carlos R.',  rank:'MAJ', section:'S3',       medStatus:'Green', mrcClass:'Class 1', dental:'Class 1', dentalDate:'01 Mar 2026', immunizations:'Current', lastPHA:'01 Mar 2026', phaDue:'01 Mar 2027', pulhes:'111111', deployable:true,  deployRestriction:null },
  { dodid:'5051005002', name:'Delgado, Maria C.',   rank:'SFC', section:'S4',       medStatus:'Amber', mrcClass:'Class 2', dental:'Class 2', dentalDate:'15 Nov 2025', immunizations:'Current', lastPHA:'10 Jan 2026', phaDue:'10 Jan 2027', pulhes:'121111', deployable:true,  deployRestriction:'Dental Class 2 — monitoring required; lower back L3 (non-limiting)' },
  { dodid:'5051009002', name:'McKinley, Marcus T.', rank:'CW3', section:'S8',       medStatus:'Amber', mrcClass:'Class 2', dental:'Class 3', dentalDate:'01 May 2025', immunizations:'Current', lastPHA:'01 Jun 2025', phaDue:'01 Jun 2026', pulhes:'111111', deployable:true,  deployRestriction:'Dental Class 3 — PRR overdue; clearance action required' },
  { dodid:'5051012002', name:'Okonkwo, Chidi A.',   rank:'SFC', section:'ODA',      medStatus:'Red',   mrcClass:'Class 3', dental:'Class 1', dentalDate:'10 Jan 2026', immunizations:'Current', lastPHA:'15 Dec 2025', phaDue:'15 Dec 2026', pulhes:'211111', deployable:false, deployRestriction:'Profile P2 — shoulder; PT in progress; SDAP review pending; non-deployable until cleared' },
  { dodid:'5051014001', name:'Riley, Marcus E.',    rank:'SFC', section:'WTU',      medStatus:'Red',   mrcClass:'Class 4', dental:'Class 1', dentalDate:'01 Apr 2026', immunizations:'Current', lastPHA:'01 Apr 2026', phaDue:'01 Apr 2027', pulhes:'211111', deployable:false, deployRestriction:'MEB in progress — profile P3; WTU assignment; non-deployable' },
  { dodid:'5051016001', name:'Washington, James A.',rank:'SSG', section:'WTU',      medStatus:'Red',   mrcClass:'Class 4', dental:'Class 2', dentalDate:'01 Mar 2026', immunizations:'Current', lastPHA:'01 Mar 2026', phaDue:'01 Mar 2027', pulhes:'211111', deployable:false, deployRestriction:'MEB in progress — combat knee injury; VA rating pending; WTU' },
]

// ── DISS — security clearances ───────────────────────────────────────────────
export interface DissRow {
  edipi: string
  rank: string
  lastName: string
  firstName: string
  eligibilityLevel: string
  eligibilityStatus: string
  investigationType: string
  adjudicationDate: string
  prDueDate: string
  prStatus: string
  polygraph: string
  indocDate: string
  derogInfo: boolean
}

export const DISS_SUBJECTS: DissRow[] = [
  { edipi:'5051001001', rank:'LTC', lastName:'Bradley',   firstName:'Michael', eligibilityLevel:'TS/SCI', eligibilityStatus:'Eligible', investigationType:'Tier 5 — PR',          adjudicationDate:'18 Jun 2022', prDueDate:'12 Mar 2027', prStatus:'Current',                              polygraph:'Full Scope (DIA) — 10 Mar 2022', indocDate:'01 Jul 2022', derogInfo:false },
  { edipi:'5051001002', rank:'MAJ', lastName:'Ortega',    firstName:'James',   eligibilityLevel:'TS/SCI', eligibilityStatus:'Eligible', investigationType:'Tier 5 — PR',          adjudicationDate:'15 Nov 2020', prDueDate:'03 Sep 2025', prStatus:'OVERDUE — PR initiated 01 Oct 2025; pending',  polygraph:'Full Scope (NSA) — 01 Sep 2020',  indocDate:'01 Dec 2020', derogInfo:false },
  { edipi:'5051003001', rank:'CPT', lastName:'Hassan',    firstName:'Kareem',  eligibilityLevel:'TS/SCI', eligibilityStatus:'Eligible', investigationType:'Tier 5 — Initial',     adjudicationDate:'10 Mar 2021', prDueDate:'01 Jan 2026', prStatus:'EXPIRING SOON — initiate PR now',polygraph:'Full Scope (DIA) — 01 Feb 2021',  indocDate:'01 May 2021', derogInfo:false },
  { edipi:'5051003002', rank:'SFC', lastName:'Okafor',    firstName:'Emeka',   eligibilityLevel:'TS/SCI', eligibilityStatus:'Eligible', investigationType:'Tier 5 — PR',          adjudicationDate:'01 Aug 2023', prDueDate:'15 Jul 2028', prStatus:'Current',                              polygraph:'Full Scope (NSA) — 01 Jul 2023',  indocDate:'15 Sep 2023', derogInfo:false },
  { edipi:'5051004001', rank:'MAJ', lastName:'Vasquez',   firstName:'Carlos',  eligibilityLevel:'TS/SCI', eligibilityStatus:'Eligible', investigationType:'Tier 5 — PR',          adjudicationDate:'01 Jan 2022', prDueDate:'01 Jan 2027', prStatus:'Current',                              polygraph:'Full Scope (DIA) — 01 Dec 2021',  indocDate:'01 Mar 2022', derogInfo:false },
  { edipi:'5051005002', rank:'SFC', lastName:'Delgado',   firstName:'Maria',   eligibilityLevel:'TS/SCI', eligibilityStatus:'Eligible', investigationType:'Tier 5 — PR',          adjudicationDate:'15 May 2022', prDueDate:'10 May 2027', prStatus:'Current',                              polygraph:'Full Scope (NSA) — 10 Apr 2022',  indocDate:'01 Jun 2022', derogInfo:false },
  { edipi:'5051006001', rank:'MAJ', lastName:'Donovan',   firstName:'Patrick', eligibilityLevel:'TS/SCI', eligibilityStatus:'Eligible', investigationType:'Tier 5 — Initial',     adjudicationDate:'01 Jun 2022', prDueDate:'01 Jun 2027', prStatus:'Current',                              polygraph:'Full Scope (DIA) — 15 May 2022',  indocDate:'15 Jul 2022', derogInfo:false },
  { edipi:'5051009002', rank:'CW3', lastName:'McKinley',  firstName:'Marcus',  eligibilityLevel:'TS/SCI', eligibilityStatus:'Eligible', investigationType:'Tier 5 — PR',          adjudicationDate:'01 Dec 2020', prDueDate:'01 Dec 2025', prStatus:'OVERDUE — PRR dental flag; CAF review required', polygraph:'Full Scope (DIA) — 01 Nov 2020', indocDate:'15 Jan 2021', derogInfo:true  },
]

// ── DTMS — AFT & CFT fitness results ─────────────────────────────────────────
export interface DtmsRow {
  dodid: string
  name: string
  rank: string
  section: string
  aftDate: string
  aftStatus: string
  aftScore: number
  cftDate: string
  cftGrade: string
}

export const DTMS_SOLDIERS: DtmsRow[] = [
  { dodid:'5051001001', name:'Bradley, Michael K.', rank:'LTC', section:'Command', aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:516, cftDate:'20 May 2026', cftGrade:'GO'    },
  { dodid:'5051001002', name:'Ortega, James F.',    rank:'MAJ', section:'Command', aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:492, cftDate:'20 May 2026', cftGrade:'GO'    },
  { dodid:'5051002001', name:'Phillips, Sarah T.',  rank:'CPT', section:'S1',      aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:478, cftDate:'20 May 2026', cftGrade:'GO'    },
  { dodid:'5051002002', name:'Garza, Roberto M.',   rank:'SFC', section:'S1',      aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:463, cftDate:'20 May 2026', cftGrade:'GO'    },
  { dodid:'5051002005', name:'Bynum, Keisha A.',    rank:'SGT', section:'S1',      aftDate:'N/A',         aftStatus:'Exempt (Profile)', aftScore:0, cftDate:'N/A', cftGrade:'Exempt' },
  { dodid:'5051003001', name:'Hassan, Kareem J.',   rank:'CPT', section:'S2',      aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:501, cftDate:'20 May 2026', cftGrade:'GO'    },
  { dodid:'5051004001', name:'Vasquez, Carlos R.',  rank:'MAJ', section:'S3',      aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:523, cftDate:'20 May 2026', cftGrade:'GO'    },
  { dodid:'5051004002', name:'Perkins, James W.',   rank:'MSG', section:'S3',      aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:487, cftDate:'20 May 2026', cftGrade:'GO'    },
  { dodid:'5051005002', name:'Delgado, Maria C.',   rank:'SFC', section:'S4',      aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:456, cftDate:'20 May 2026', cftGrade:'GO'    },
  { dodid:'5051009002', name:'McKinley, Marcus T.', rank:'CW3', section:'S8',      aftDate:'15 Mar 2026', aftStatus:'Pass', aftScore:441, cftDate:'20 May 2026', cftGrade:'NO-GO (Ruck)' },
  { dodid:'5051012002', name:'Okonkwo, Chidi A.',   rank:'SFC', section:'ODA',     aftDate:'N/A',         aftStatus:'Exempt (Medical Hold)', aftScore:0, cftDate:'N/A', cftGrade:'Exempt' },
  { dodid:'5051014001', name:'Riley, Marcus E.',    rank:'SFC', section:'WTU',     aftDate:'N/A',         aftStatus:'Exempt (MEB)',  aftScore:0, cftDate:'N/A', cftGrade:'Exempt' },
  { dodid:'5051016001', name:'Washington, James A.',rank:'SSG', section:'WTU',     aftDate:'N/A',         aftStatus:'Exempt (MEB)',  aftScore:0, cftDate:'N/A', cftGrade:'Exempt' },
]

// ── DTS — travel authorizations ──────────────────────────────────────────────
export interface DtsRow {
  authNumber: string
  travelerName: string
  rank: string
  section: string
  purpose: string
  departure: string
  returnDate: string
  destination: string
  estimatedCost: number
  voucherStatus: string
}

export const DTS_TRAVEL: DtsRow[] = [
  { authNumber:'DTS-26-001-0055', travelerName:'Okafor, James A.',   rank:'MAJ', section:'S9', purpose:'USSOCOM Tampa — CENTCOM CA Coordination',          departure:'01 Jun 2026', returnDate:'05 Jun 2026', destination:'MacDill AFB, Tampa FL',     estimatedCost:1885, voucherStatus:'Submitted — Approved' },
  { authNumber:'DTS-26-001-0057', travelerName:'Vasquez, Carlos R.', rank:'MAJ', section:'S3', purpose:'SOCOM JNTC Exercise Planning — Fort Liberty NC',   departure:'15 May 2026', returnDate:'19 May 2026', destination:'Fort Liberty, NC',          estimatedCost:1640, voucherStatus:'Submitted — Under Review' },
  { authNumber:'DTS-26-001-0059', travelerName:'Hassan, Kareem J.',  rank:'CPT', section:'S2', purpose:'DIA HUMINT Conference — Bolling AFB DC',            departure:'10 Jun 2026', returnDate:'13 Jun 2026', destination:'Bolling AFB, Washington DC', estimatedCost:2100, voucherStatus:'Submitted — Pending Cert' },
  { authNumber:'DTS-26-001-0062', travelerName:'McKinley, Marcus T.',rank:'CW3', section:'S8', purpose:'DFAS Finance Manager Training — Indianapolis IN',   departure:'23 Jun 2026', returnDate:'27 Jun 2026', destination:'DFAS Indianapolis, IN',     estimatedCost:1420, voucherStatus:'Authorization Pending' },
  { authNumber:'DTS-26-001-0065', travelerName:'Phillips, Sarah T.', rank:'CPT', section:'S1', purpose:'S1 Leadership Course — Fort Jackson SC',            departure:'07 Jul 2026', returnDate:'18 Jul 2026', destination:'Fort Jackson, SC',          estimatedCost:2890, voucherStatus:'Authorization Approved' },
  { authNumber:'DTS-26-001-0048', travelerName:'Bradley, Michael K.',rank:'LTC', section:'Cmd', purpose:'5th SFG Group CDR Conference — Fort Campbell KY', departure:'01 Jun 2026', returnDate:'03 Jun 2026', destination:'Fort Campbell, KY (local)', estimatedCost:0,    voucherStatus:'No Voucher Required (Local)' },
]

// ── j1-admin-stress — S1 shop admin suspenses ────────────────────────────────
export interface AdminSuspenseRow {
  soldier: string
  rank: string
  section: string
  item: 'DD93' | 'SGLV' | 'PRR'
  dueDate: string
  status: 'Current' | 'Overdue' | 'Pending'
  poc: string
  notes: string
}

export const ADMIN_SUSPENSES: AdminSuspenseRow[] = [
  // From IPPSA payIssues + j1-admin-stress
  { soldier:'Garza, Roberto M.',   rank:'SFC', section:'S1',  item:'DD93', dueDate:'01 Jun 2025', status:'Overdue', poc:'CPT Phillips', notes:'Beneficiary update pending — deployment gap 2024' },
  { soldier:'Bynum, Keisha A.',    rank:'SGT', section:'S1',  item:'DD93', dueDate:'18 Jun 2026', status:'Pending', poc:'CPT Phillips', notes:'New gain — not on file; in-processing action item' },
  { soldier:'Bynum, Keisha A.',    rank:'SGT', section:'S1',  item:'SGLV', dueDate:'18 Jun 2026', status:'Pending', poc:'CPT Phillips', notes:'New gain — beneficiary update pending in-processing' },
  { soldier:'Delgado, Maria C.',   rank:'SFC', section:'S4',  item:'PRR',  dueDate:'10 May 2025', status:'Overdue', poc:'S1 NCOIC',     notes:'PRR overdue — clearance review pending; coordinate w/ S2 SARM' },
  { soldier:'McKinley, Marcus T.', rank:'CW3', section:'S8',  item:'PRR',  dueDate:'01 Dec 2025', status:'Overdue', poc:'S1 NCOIC',     notes:'PRR overdue — dental Amber flag; CAF review required' },
  { soldier:'Ingram, Tyrone D.',   rank:'MSG', section:'Spt', item:'DD93', dueDate:'01 Jun 2025', status:'Overdue', poc:'CPT Phillips', notes:'Beneficiary update pending — PCS gap 2025' },
  { soldier:'Okafor, Emmanuel C.', rank:'SGT', section:'J1',  item:'DD93', dueDate:'01 Jun 2025', status:'Overdue', poc:'SFC Garza',    notes:'Missed in-processing window — overdue 12+ months' },
  { soldier:'Okafor, Emmanuel C.', rank:'SGT', section:'J1',  item:'SGLV', dueDate:'01 Jun 2025', status:'Overdue', poc:'SFC Garza',    notes:'Not submitted — initiate SGLV action immediately' },
  { soldier:'Foster, Patricia M.', rank:'MSG', section:'J1',  item:'DD93', dueDate:'15 Jan 2026', status:'Overdue', poc:'SFC Garza',    notes:'Expired — renewal required, missed annual update' },
  { soldier:'Hall, Trevor B.',     rank:'PV2', section:'J1',  item:'DD93', dueDate:'01 Mar 2026', status:'Overdue', poc:'SFC Garza',    notes:'New soldier — initial DD93 not completed' },
  { soldier:'Hall, Trevor B.',     rank:'PV2', section:'J1',  item:'SGLV', dueDate:'01 Mar 2026', status:'Overdue', poc:'SFC Garza',    notes:'SGLV not submitted — in-processing incomplete' },
]

// ── j8-awards-pipeline — pending awards actions ──────────────────────────────
export type AwardCategory = 'PCS' | 'ETS' | 'Retirement' | 'Deployment' | 'Training' | 'Merit' | 'Other'

export interface AwardRow {
  soldier: string
  rank: string
  section: string
  award: string
  type: 'submitted' | 'nominated'
  category: AwardCategory
  actionPeriod: string
  submitted: string
  dueDate: string
  status: string
  actionOfficer: string
}

export const AWARDS_PIPELINE: AwardRow[] = [
  { soldier:'Bishop, Reginald A.',  rank:'SSG', section:'J3', award:'MSM',             type:'submitted', category:'PCS',        actionPeriod:'May 2022 – Apr 2026', submitted:'01 May 2026', dueDate:'01 Jul 2026', status:'Submitted',          actionOfficer:'SFC Garza'    },
  { soldier:'Bishop, Reginald A.',  rank:'SSG', section:'J3', award:'BSM (V)',          type:'nominated', category:'Deployment', actionPeriod:'Combat action 2025',   submitted:'Pending',     dueDate:'01 Aug 2026', status:'Nomination Pending',  actionOfficer:'CPT Phillips' },
  { soldier:'Hunt, Jerome D.',      rank:'SFC', section:'J3', award:'BSM',             type:'submitted', category:'Merit',      actionPeriod:'Jan 2024 – Jan 2026',  submitted:'15 Apr 2026', dueDate:'15 Jun 2026', status:'Under Review',        actionOfficer:'CPT Phillips' },
  { soldier:'Ali, Fatima Z.',       rank:'SGT', section:'J3', award:'ARCOM (2nd OLC)', type:'submitted', category:'Merit',      actionPeriod:'Jun 2024 – Jun 2026',  submitted:'10 May 2026', dueDate:'01 Jul 2026', status:'Submitted',           actionOfficer:'SFC Garza'    },
  { soldier:'Hensley, Tonya R.',    rank:'MSG', section:'J1', award:'BSM',             type:'submitted', category:'Merit',      actionPeriod:'Jan 2023 – Jan 2026',  submitted:'20 Mar 2026', dueDate:'20 May 2026', status:'OVERDUE — returned',  actionOfficer:'SFC Garza'    },
  { soldier:'Hensley, Tonya R.',    rank:'MSG', section:'J1', award:'LOM',             type:'nominated', category:'Retirement', actionPeriod:'Retirement packet',    submitted:'Pending',     dueDate:'01 Sep 2026', status:'Nomination Pending',  actionOfficer:'CPT Phillips' },
  { soldier:'Pierce, Vanessa R.',   rank:'CPT', section:'J5', award:'MSM (2nd OLC)',   type:'nominated', category:'PCS',        actionPeriod:'Aug 2022 – Aug 2025',  submitted:'Pending',     dueDate:'01 Aug 2026', status:'Nomination Pending',  actionOfficer:'CPT Phillips' },
  { soldier:'Stone, Derek M.',      rank:'SPC', section:'S1', award:'AAM',             type:'nominated', category:'Training',   actionPeriod:'Mar 2025 – Mar 2026',  submitted:'Pending',     dueDate:'01 Sep 2026', status:'Nomination Pending',  actionOfficer:'SFC Garza'    },
]

// ── GCSS-Army — equipment (top lines) ────────────────────────────────────────
export interface GcssRow {
  lineId: string
  lin: string
  nsn: string
  nomenclature: string
  qtyAuthorized: number
  qtyOnHand: number
  qtyShortfall: number
  condition: string
  lastInventory: string
  readinessFlag: 'Green' | 'Amber' | 'Red'
  notes: string | null
}

export const GCSS_EQUIPMENT: GcssRow[] = [
  { lineId:'PB-001', lin:'E52499', nsn:'1005-01-547-5660', nomenclature:'Rifle, 5.56MM, M4A1 Carbine',        qtyAuthorized:210, qtyOnHand:210, qtyShortfall:0,  condition:'Serviceable',                    lastInventory:'15 Jun 2026', readinessFlag:'Green', notes:null },
  { lineId:'PB-002', lin:'M16000', nsn:'1005-01-631-1209', nomenclature:'Machine Gun, 5.56MM, M249 SAW',      qtyAuthorized:36,  qtyOnHand:36,  qtyShortfall:0,  condition:'Mixed — 4 barrels NMC',          lastInventory:'15 Jun 2026', readinessFlag:'Amber', notes:'Req# 260502-001 submitted for 4 NMC barrels. EDD 30 Jun 2026.' },
  { lineId:'PB-003', lin:'C68693', nsn:'5855-01-534-5931', nomenclature:'Night Vision, AN/PVS-14',            qtyAuthorized:75,  qtyOnHand:62,  qtyShortfall:13, condition:'FMC 62/62 on-hand',              lastInventory:'15 Jun 2026', readinessFlag:'Amber', notes:'Shortfall 13: 8 in GCSS depot repair; 5 on requisition (EDD Sep 2026)' },
  { lineId:'PB-004', lin:'S52993', nsn:'5855-01-629-7267', nomenclature:'AN/PRC-163 IOFR Radio',              qtyAuthorized:21,  qtyOnHand:21,  qtyShortfall:0,  condition:'FMC 20/21; 1 NMC (battery issue)',lastInventory:'15 Jun 2026', readinessFlag:'Green', notes:'1 NMC — awaiting battery module replacement. EDD 25 Jun 2026.' },
  { lineId:'PB-005', lin:'S52990', nsn:'5820-01-659-2721', nomenclature:'AN/PRC-152A Multiband Radio',        qtyAuthorized:30,  qtyOnHand:30,  qtyShortfall:0,  condition:'FMC — 30/30',                    lastInventory:'15 Jun 2026', readinessFlag:'Green', notes:null },
  { lineId:'PB-006', lin:'T36009', nsn:'8340-01-620-8428', nomenclature:'HMMWV M1165A1 (Uparmored)',          qtyAuthorized:9,   qtyOnHand:9,   qtyShortfall:0,  condition:'FMC 8/9; 1 NMC (drivetrain)',     lastInventory:'10 Jun 2026', readinessFlag:'Amber', notes:'1 NMC — drivetrain replacement Req# 260601-003; EDD Jul 2026.' },
  { lineId:'PB-007', lin:'G90390', nsn:'1370-01-629-9980', nomenclature:'Mortar System, 60MM, M224A1',        qtyAuthorized:6,   qtyOnHand:6,   qtyShortfall:0,  condition:'FMC — 6/6',                      lastInventory:'15 Jun 2026', readinessFlag:'Green', notes:null },
  { lineId:'PB-008', lin:'L25890', nsn:'5180-01-603-0018', nomenclature:'DAGR GPS Receiver',                  qtyAuthorized:42,  qtyOnHand:38,  qtyShortfall:4,  condition:'FMC 38/38 on-hand',              lastInventory:'15 Jun 2026', readinessFlag:'Amber', notes:'Shortfall 4 — requisition submitted 10 May 2026; EDD Aug 2026.' },
]

// ── Derived helpers ───────────────────────────────────────────────────────────

/** Soldiers from IPPSA with ETS within 180 days, sorted soonest first */
export function getEtsDerosSoldiers(): (IppsaRow & { daysOut: number })[] {
  return IPPSA_SOLDIERS
    .map(s => ({ ...s, daysOut: daysUntil(s.ets) }))
    .filter(s => s.daysOut <= 180)
    .sort((a, b) => a.daysOut - b.daysOut)
}

/** All IPPSA soldiers with pay issues */
export function getSoldiersWithPayIssues(): (IppsaRow & { issue: string })[] {
  return IPPSA_SOLDIERS.flatMap(s =>
    s.payIssues.map(issue => ({ ...s, issue }))
  )
}

/** All IPPSA allotments */
export function getAllAllotments() {
  return IPPSA_SOLDIERS.flatMap(s =>
    s.allotments.map(a => ({
      soldier: `${s.lastName}, ${s.firstName.charAt(0)}.`,
      rank: s.rank,
      section: s.section,
      allotmentType: a.type,
      amount: a.amount,
      ets: s.ets,
    }))
  )
}

/** S1 section soldiers only */
export const S1_SECTION_SOLDIERS = IPPSA_SOLDIERS.filter(s => s.section === 'S1')

/** MEDPROS lookup by dodid */
export function getMedStatus(dodid: string): MedprosRow | undefined {
  return MEDPROS_SOLDIERS.find(m => m.dodid === dodid)
}

/** DTMS lookup by dodid */
export function getDtmsRecord(dodid: string): DtmsRow | undefined {
  return DTMS_SOLDIERS.find(d => d.dodid === dodid)
}
