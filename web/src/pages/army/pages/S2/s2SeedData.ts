// ── Personnel / clearance roster (S2 section soldiers) ───────────────────────
export const S2_SECTION_SOLDIERS = [
  { edipi:'S2-001', rank:'CPT', lastName:'Morrison',  firstName:'James',  mos:'35D',  positionTitle:'S2 / Unit Security Manager', clearance:'TS/SCI', prrDue:'2026-03-01', prrStatus:'Overdue',         sere:'C', annualTraining:'Current', foreignTravel:false, ft:'—',         deros:'2028-06-01' },
  { edipi:'S2-002', rank:'CW3', lastName:'Nakashima', firstName:'Kenji',  mos:'351L', positionTitle:'S2X / CI Warrant',            clearance:'TS/SCI', prrDue:'2026-01-15', prrStatus:'Overdue',         sere:'C', annualTraining:'Current', foreignTravel:true,  ft:'Thailand', deros:'2027-12-01' },
  { edipi:'S2-003', rank:'SSG', lastName:'Torres',    firstName:'Maria',  mos:'35F',  positionTitle:'Security NCO',                clearance:'TS/SCI', prrDue:'2027-08-01', prrStatus:'Current',         sere:'B', annualTraining:'Current', foreignTravel:false, ft:'—',         deros:'2026-09-01' },
  { edipi:'S2-004', rank:'SGT', lastName:'Okonkwo',   firstName:'Chidi',  mos:'35N',  positionTitle:'SIGINT NCO',                  clearance:'TS/SCI', prrDue:'2027-06-01', prrStatus:'Current',         sere:'B', annualTraining:'Due',     foreignTravel:false, ft:'—',         deros:'2027-03-01' },
  { edipi:'S2-005', rank:'SPC', lastName:'Patel',     firstName:'Riya',   mos:'35G',  positionTitle:'Imagery Analyst',             clearance:'SECRET', prrDue:'—',          prrStatus:'Upgrade Pending', sere:'A', annualTraining:'Current', foreignTravel:false, ft:'—',         deros:'2026-12-01' },
]

// Unit-wide clearance tracking (all assigned soldiers)
export const CLEARANCE_ROSTER = [
  { edipi:'001', rank:'LTC', lastName:'Hughes',    firstName:'Thomas',  clearance:'TS/SCI', prrDue:'2025-11-01', prrStatus:'Overdue',           elig:'Active',   notes:'PRR packet submitted to DISS; awaiting adj.'    },
  { edipi:'002', rank:'MAJ', lastName:'Reyes',     firstName:'Carlos',  clearance:'TS/SCI', prrDue:'2027-03-15', prrStatus:'Current',           elig:'Active',   notes:''                                               },
  { edipi:'003', rank:'CPT', lastName:'Morrison',  firstName:'James',   clearance:'TS/SCI', prrDue:'2026-03-01', prrStatus:'Overdue',           elig:'Active',   notes:'PRR overdue — initiate immediately'             },
  { edipi:'004', rank:'CPT', lastName:'Walsh',     firstName:'Timothy', clearance:'SECRET', prrDue:'2028-06-01', prrStatus:'Current',           elig:'Active',   notes:''                                               },
  { edipi:'005', rank:'CW3', lastName:'Nakashima', firstName:'Kenji',   clearance:'TS/SCI', prrDue:'2026-01-15', prrStatus:'Overdue',           elig:'Active',   notes:'PRR overdue — packet being prepared'            },
  { edipi:'006', rank:'SSG', lastName:'Torres',    firstName:'Maria',   clearance:'TS/SCI', prrDue:'2027-08-01', prrStatus:'Current',           elig:'Active',   notes:''                                               },
  { edipi:'007', rank:'SGT', lastName:'Okonkwo',   firstName:'Chidi',   clearance:'TS/SCI', prrDue:'2027-06-01', prrStatus:'Current',           elig:'Active',   notes:'Annual training due'                            },
  { edipi:'008', rank:'SPC', lastName:'Patel',     firstName:'Riya',    clearance:'SECRET', prrDue:'—',          prrStatus:'TS Upgrade Pending', elig:'Interim',  notes:'eApp submitted Apr 2026; awaiting CAF adj.'     },
  { edipi:'009', rank:'SSG', lastName:'Rivera',    firstName:'Marco',   clearance:'SECRET', prrDue:'2029-01-01', prrStatus:'Current',           elig:'Active',   notes:''                                               },
  { edipi:'010', rank:'PFC', lastName:'Nguyen',    firstName:'Linh',    clearance:'SECRET', prrDue:'2030-03-01', prrStatus:'Current',           elig:'Active',   notes:''                                               },
]

// Foreign travel log
export const FOREIGN_TRAVEL = [
  { id:'FT-2026-001', soldier:'CW3 Nakashima, K.', destination:'Thailand', purpose:'Leave / personal',     departDate:'15 Jun 2026', returnDate:'29 Jun 2026', briefDate:'10 Jun 2026', debriefDate:'—',           status:'Traveling', countryCleared:true,  notes:'Pre-travel brief complete; debrief NLT 3 Jul 2026' },
  { id:'FT-2026-002', soldier:'SSG Torres, M.',     destination:'Mexico',   purpose:'Leave / family visit', departDate:'04 Jul 2026', returnDate:'11 Jul 2026', briefDate:'—',           debriefDate:'—',           status:'Upcoming',  countryCleared:false, notes:'Brief not yet conducted — schedule NLT 01 Jul 2026' },
  { id:'FT-2026-003', soldier:'CPT Walsh, T.',      destination:'Germany',  purpose:'TDY / partner nation', departDate:'22 May 2026', returnDate:'05 Jun 2026', briefDate:'18 May 2026', debriefDate:'06 Jun 2026', status:'Complete',  countryCleared:true,  notes:'Debrief complete — no reportable contact'           },
  { id:'FT-2026-004', soldier:'SGT Okonkwo, C.',    destination:'Japan',    purpose:'Leave / personal',     departDate:'10 Aug 2026', returnDate:'20 Aug 2026', briefDate:'—',           debriefDate:'—',           status:'Upcoming',  countryCleared:false, notes:'90-day prior brief required — due NLT 10 Jul 2026'  },
]

// Annual security training tracking
export const SECURITY_TRAINING = [
  { soldier:'Hughes, Thomas',   rank:'LTC', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'Current', derivClassDue:'Oct 2026', insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'C', sereCompleted:'Jan 2022', opsec:'Current', opsecDue:'Oct 2026' },
  { soldier:'Reyes, Carlos',    rank:'MAJ', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'Current', derivClassDue:'Oct 2026', insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'C', sereCompleted:'Mar 2023', opsec:'Current', opsecDue:'Oct 2026' },
  { soldier:'Morrison, James',  rank:'CPT', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'Current', derivClassDue:'Oct 2026', insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'C', sereCompleted:'Aug 2024', opsec:'Current', opsecDue:'Oct 2026' },
  { soldier:'Walsh, Timothy',   rank:'CPT', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'Due',     derivClassDue:'Jun 2026', insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'B', sereCompleted:'Jun 2023', opsec:'Current', opsecDue:'Oct 2026' },
  { soldier:'Nakashima, Kenji', rank:'CW3', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'Current', derivClassDue:'Oct 2026', insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'C', sereCompleted:'Jan 2025', opsec:'Current', opsecDue:'Oct 2026' },
  { soldier:'Torres, Maria',    rank:'SSG', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'Current', derivClassDue:'Oct 2026', insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'B', sereCompleted:'Mar 2023', opsec:'Current', opsecDue:'Oct 2026' },
  { soldier:'Okonkwo, Chidi',   rank:'SGT', annualSec:'Due',     annualSecDue:'Jun 2026', derivClass:'Due',     derivClassDue:'Jun 2026', insiderThreat:'Due',     insiderThreatDue:'Jun 2026', sere:'B', sereCompleted:'Aug 2024', opsec:'Due',     opsecDue:'Jun 2026' },
  { soldier:'Patel, Riya',      rank:'SPC', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'Current', derivClassDue:'Oct 2026', insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'A', sereCompleted:'Nov 2024', opsec:'Current', opsecDue:'Oct 2026' },
  { soldier:'Rivera, Marco',    rank:'SSG', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'Current', derivClassDue:'Oct 2026', insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'B', sereCompleted:'Sep 2023', opsec:'Current', opsecDue:'Oct 2026' },
  { soldier:'Nguyen, Linh',     rank:'PFC', annualSec:'Current', annualSecDue:'Oct 2026', derivClass:'N/A',     derivClassDue:'—',        insiderThreat:'Current', insiderThreatDue:'Oct 2026', sere:'A', sereCompleted:'Mar 2025', opsec:'Current', opsecDue:'Oct 2026' },
]

// Physical security — access control log
export const ACCESS_LOG = [
  { id:'AC-001', date:'17 Jun 2026', person:'CPT Walsh, T.',     area:'SCIF',      action:'Entry',  authorized:true,  escort:'Self',           notes:'Valid badge — routine entry'                    },
  { id:'AC-002', date:'17 Jun 2026', person:'LN Interpreter',    area:'OPS Cell',  action:'Entry',  authorized:true,  escort:'SSG Torres, M.', notes:'Escorted access — logged per AR 380-5'          },
  { id:'AC-003', date:'15 Jun 2026', person:'Civilian Visitor',  area:'SCIF',      action:'Denied', authorized:false, escort:'None',           notes:'No clearance — turned away; incident documented' },
  { id:'AC-004', date:'14 Jun 2026', person:'SFC Dumas, K.',     area:'Arms Room', action:'Entry',  authorized:true,  escort:'Self',           notes:'Key issued SF-700; logged'                       },
  { id:'AC-005', date:'10 Jun 2026', person:'CW3 Nakashima, K.', area:'SCIF',      action:'Entry',  authorized:true,  escort:'Self',           notes:'Valid SCI badge — routine'                       },
]

// Classified document control log
export const CLASSIFIED_DOCS = [
  { id:'DOC-2026-001', classification:'SECRET',     title:'OPORD 26-005 Intelligence Annex', custodian:'CPT Morrison',  issued:'10 Jun 2026', due:'30 Jun 2026', returned:'—',           status:'Out'      },
  { id:'DOC-2026-002', classification:'SECRET//NF', title:'INTSUM #164',                     custodian:'SSG Torres',    issued:'16 Jun 2026', due:'17 Jun 2026', returned:'17 Jun 2026',  status:'Returned' },
  { id:'DOC-2026-003', classification:'TS/SCI',     title:'Collection Tasking Order',        custodian:'CW3 Nakashima', issued:'01 Jun 2026', due:'01 Jul 2026', returned:'—',           status:'Out'      },
  { id:'DOC-2026-004', classification:'SECRET',     title:'Risk Assessment — OBJ FALCON',    custodian:'CPT Morrison',  issued:'12 Jun 2026', due:'30 Jun 2026', returned:'—',           status:'Out'      },
]

// CI / Suspicious contact reports
export const CI_REPORTS = [
  { id:'CI-2026-001', date:'15 Jun 2026', soldier:'SSG Torres, M.',   type:'Suspicious Contact',       description:'Unknown individual asking about unit location and schedule at off-post gas station', action:'Reported to CW3 Nakashima; CI referral submitted to INSCOM', status:'Referred',     referredTo:'INSCOM CI'       },
  { id:'CI-2026-002', date:'12 Jun 2026', soldier:'CW3 Nakashima, K.',type:'Foreign Contact',          description:'Social contact with Thai national during approved leave — prior disclosure made',      action:'Foreign Contact Report filed; no adverse info',              status:'Documented',   referredTo:'S2 File'         },
  { id:'CI-2026-003', date:'08 Jun 2026', soldier:'SPC Patel, R.',    type:'Insider Threat Indicator', description:'Fellow soldier observed photographing installation access control point',             action:'Reported immediately; security incident report opened',      status:'Under Review', referredTo:'INSCOM/Unit CDR'  },
]

// Insider threat tracking
export const INSIDER_THREAT_LOG = [
  { id:'IT-001', date:'08 Jun 2026', category:'Unauthorized Photography',  reporter:'SPC Patel, R.',  subject:'SGT [Redacted]',        status:'Under Review',       referral:'CDR + INSCOM', notes:'Photo of gate access point; investigation ongoing'      },
  { id:'IT-002', date:'01 May 2026', category:'Data Exfiltration Concern', reporter:'SSG Torres, M.', subject:'Unknown — SIPR anomaly', status:'Closed — No Action', referral:'G6 / S2',      notes:'Anomalous SIPR file transfer; G6 confirmed authorized' },
]

// COMSEC account
export const COMSEC_ITEMS = [
  { sku:'KEK-001',  item:'Key Encryption Key (KEK)',   classification:'CCI',    custodian:'CW3 Nakashima', issued:'01 Apr 2026', expires:'01 Oct 2026', status:'Active',   sf700:'Filed', notes:'Semi-annual rotation due Oct 2026'    },
  { sku:'FILL-001', item:'AN/CYZ-10 FILL Device',      classification:'CCI',    custodian:'SGT Okonkwo',   issued:'15 Jan 2026', expires:'—',           status:'Active',   sf700:'Filed', notes:'Inventory complete; SF-700 current'   },
  { sku:'KYK-001',  item:'KYK-13 Electronic Transfer', classification:'CCI',    custodian:'SGT Okonkwo',   issued:'15 Jan 2026', expires:'—',           status:'Active',   sf700:'Filed', notes:'Semi-annual COMSEC inspection passed' },
  { sku:'CKSN-001', item:'COMSEC Keying Material',     classification:'CRYPTO', custodian:'CW3 Nakashima', issued:'01 Jun 2026', expires:'01 Jul 2026',  status:'Expiring', sf700:'Filed', notes:'Rotation required NLT 30 Jun 2026'    },
  { sku:'KG-175A',  item:'KG-175A TACLANE Encryptor',  classification:'CCI',    custodian:'CW3 Nakashima', issued:'01 Jan 2026', expires:'—',           status:'Active',   sf700:'Filed', notes:'Annual COMSEC account audit complete' },
]

// Security tasks / suspenses
export const S2_TASKS = [
  { id:'S2-T001', task:'Initiate PRR — LTC Hughes (overdue)',        category:'Clearances',    assignedTo:'CPT Morrison',  priority:'Critical', dueDate:'20 Jun 2026', status:'Open'        },
  { id:'S2-T002', task:'Initiate PRR — CPT Morrison (overdue)',      category:'Clearances',    assignedTo:'CW3 Nakashima', priority:'Critical', dueDate:'20 Jun 2026', status:'Open'        },
  { id:'S2-T003', task:'Initiate PRR — CW3 Nakashima (overdue)',     category:'Clearances',    assignedTo:'CW3 Nakashima', priority:'Critical', dueDate:'20 Jun 2026', status:'In Progress' },
  { id:'S2-T004', task:'Pre-travel brief — SSG Torres (Mexico)',     category:'Foreign Travel', assignedTo:'CPT Morrison',  priority:'High',     dueDate:'01 Jul 2026', status:'Open'        },
  { id:'S2-T005', task:'Pre-travel brief — SGT Okonkwo (Japan)',     category:'Foreign Travel', assignedTo:'CPT Morrison',  priority:'High',     dueDate:'10 Jul 2026', status:'Open'        },
  { id:'S2-T006', task:'Debrief — CW3 Nakashima (Thailand return)',  category:'Foreign Travel', assignedTo:'CPT Morrison',  priority:'High',     dueDate:'03 Jul 2026', status:'Upcoming'    },
  { id:'S2-T007', task:'Annual security training — SGT Okonkwo',    category:'Training',       assignedTo:'SSG Torres',    priority:'High',     dueDate:'30 Jun 2026', status:'Open'        },
  { id:'S2-T008', task:'Derivative classification — CPT Walsh',     category:'Training',       assignedTo:'SSG Torres',    priority:'High',     dueDate:'30 Jun 2026', status:'Open'        },
  { id:'S2-T009', task:'COMSEC key rotation — CKSN-001',            category:'COMSEC',         assignedTo:'CW3 Nakashima', priority:'High',     dueDate:'30 Jun 2026', status:'Open'        },
  { id:'S2-T010', task:'TS upgrade follow-up — SPC Patel (eApp)',   category:'Clearances',     assignedTo:'CW3 Nakashima', priority:'Medium',   dueDate:'01 Jul 2026', status:'In Progress' },
  { id:'S2-T011', task:'Insider threat review — SPC Patel report',  category:'CI Awareness',   assignedTo:'CPT Morrison',  priority:'High',     dueDate:'25 Jun 2026', status:'In Progress' },
  { id:'S2-T012', task:'SCIF annual inspection prep',               category:'Phys Security',  assignedTo:'SSG Torres',    priority:'Routine',  dueDate:'01 Aug 2026', status:'Open'        },
]

// Security battle rhythm
export const S2_BATTLE_RHYTHM = [
  { event:'Security Manager Morning Review', time:'0700 daily',   cadence:'Daily',     owner:'CPT Morrison',  notes:'Check DISS, foreign travel, incoming reports'         },
  { event:'S2 Shop Sync',                    time:'0730 daily',   cadence:'Daily',     owner:'CPT Morrison',  notes:'Task updates, suspense review'                        },
  { event:'PRR / Clearance Status Update',   time:'Every Mon',    cadence:'Weekly',    owner:'CW3 Nakashima', notes:'Update clearance tracker; action overdue PRRs'         },
  { event:'Foreign Travel Review',           time:'Every Mon',    cadence:'Weekly',    owner:'CPT Morrison',  notes:'Upcoming travel, pending briefs/debriefs'             },
  { event:'CDR Security Briefing',           time:'Every Fri',    cadence:'Weekly',    owner:'CPT Morrison',  notes:'Brief CDR on clearance status, travel, CI indicators' },
  { event:'Training Compliance Scrub',       time:'1st of month', cadence:'Monthly',   owner:'SSG Torres',    notes:'Update training tracker; generate delinquency list'   },
  { event:'COMSEC Account Review',           time:'1st of month', cadence:'Monthly',   owner:'CW3 Nakashima', notes:'Inventory, key status, expiration tracking'           },
  { event:'SCIF / Physical Security Insp',   time:'Quarterly',    cadence:'Quarterly', owner:'CPT Morrison',  notes:'AR 380-5 compliance check; access log review'         },
]

// Key contacts
export const S2_CONTACTS = [
  { org:'DISS (DoD CAF)',         poc:'Case Manager (CAC)', role:'Adjudication Authority',   phone:'1-888-282-7682', email:'diss.ncr@mail.mil',          notes:'PRR submissions; clearance status queries'     },
  { org:'INSCOM CI (3rd MI Bn)', poc:'SA Williams, B.',    role:'CI Special Agent',          phone:'DSN 555-7701',   email:'b.williams@inscom.army.mil',  notes:'CI referrals; suspicious contact reporting'    },
  { org:'BDE S2 (Security Mgr)', poc:'MAJ Fletcher, T.',   role:'Brigade Security Manager',  phone:'DSN 555-2001',   email:'t.fletcher@sfg.mil',          notes:'PRR coordination; policy guidance'              },
  { org:'SSO (Group SCIF)',       poc:'CW4 Davis, M.',      role:'Special Security Officer',  phone:'DSN 555-3301',   email:'m.davis@socom.mil',           notes:'SCI access management; SCIF derog reporting'   },
  { org:'COMSEC Custodian (G6)', poc:'SSG Park, J.',       role:'COMSEC Custodian',          phone:'DSN 555-5501',   email:'j.park@unit.mil',             notes:'Key material; COMSEC audit coordination'        },
  { org:'OPM / eApp Support',    poc:'Help Desk',           role:'Investigation Support',     phone:'1-888-795-8339', email:'opm.nbib@opm.gov',            notes:'SF-86 issues; eApp technical support'           },
]
