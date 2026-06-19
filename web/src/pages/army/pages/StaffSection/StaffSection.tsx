import { useState } from 'react'
import { useArmyData } from '../../ArmyDataContext'
import { STATUS_COLOR } from '../util'
import shared from '../shared.module.css'
import styles from './StaffSection.module.css'
import {
  computePmcsSchedule,
  WORK_ORDERS,
  MAINT_CONTACTS,
  getMaintStats,
} from '../shared/pmcsSeedData'
import { GCSS_EQUIPMENT } from '../S1/s1SeedData'
import MaintenanceView from '../shared/MaintenanceView'

const SECTION_NAMES: Record<string, string> = {
  S1: 'Personnel', S2: 'Intelligence', S3: 'Operations',
  S4: 'Logistics', S5: 'Plans', S6: 'Communications',
  S7: 'Training', S8: 'Finance', S9: 'Civil Affairs',
  HQ: 'Headquarters',
}

const SECTION_ICONS: Record<string, string> = {
  S2: 'fa-eye',
  S3: 'fa-chess-knight',
  S4: 'fa-boxes',
  S5: 'fa-drafting-compass',
  S6: 'fa-satellite-dish',
  S7: 'fa-graduation-cap',
  S8: 'fa-dollar-sign',
  S9: 'fa-handshake',
}

const SUB_PAGE_LABELS: Record<string, string> = {
  overview: 'Overview', dashboard: 'Dashboard', reports: 'Reports',
  tracker: 'Tracker', requests: 'Requests', resources: 'Resources',
  admin: 'Admin', operations: 'Operations', security: 'Security (PERSEC)',
  training: 'Training', comms: 'Comms & Equipment', budget: 'Budget',
  interagency: 'Interagency', maintenance: 'Maintenance',
  'adm-sustainment': 'A-4 Sustainment', 'adm-maintenance': 'Maintenance',
}

const EXTERNAL_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
  { key: 'reports',   label: 'Reports',   icon: 'fa-file-alt'       },
  { key: 'tracker',   label: 'Tracker',   icon: 'fa-tasks'          },
  { key: 'requests',  label: 'Requests',  icon: 'fa-inbox'          },
  { key: 'resources', label: 'Resources', icon: 'fa-folder-open'    },
]

type ConnStatus = 'connected' | 'pending' | 'disconnected'

interface Responsibility { id: string; icon: string; title: string; desc: string }
interface SysConn { label: string; status: ConnStatus; note?: string }
interface Position { position: string; mos: string }

interface SectionConfig {
  icon: string
  charter: string
  responsibilities: Responsibility[]
  systems: SysConn[]
  positions: Position[]
}

const SECTION_CONFIG: Record<string, SectionConfig> = {
  S2: {
    icon: 'fa-eye',
    charter: `The S2 section is the primary staff element responsible for all-source intelligence production
      and intelligence support to the commander. The S2 synchronizes collection, produces actionable intelligence
      products, and advises the commander on threat forces, terrain, weather, and civil considerations to ensure
      intelligence drives operations.`,
    responsibilities: [
      { id: 'all-source',   icon: 'fa-layer-group',     title: 'All-Source Analysis',     desc: 'Fuse multi-source intelligence to produce assessments, PIRs, and threat products supporting command decisions.' },
      { id: 'ci-humint',    icon: 'fa-user-secret',     title: 'CI / HUMINT Operations',  desc: 'Coordinate CI screening, HUMINT collection management, and reporting in support of force protection and operational objectives.' },
      { id: 'geoint',       icon: 'fa-map',             title: 'GEOINT / Imagery',         desc: 'Process and exploit imagery and geospatial intelligence; maintain terrain analysis and SITMAP products.' },
      { id: 'sigint',       icon: 'fa-broadcast-tower', title: 'SIGINT Coordination',      desc: 'Coordinate SIGINT taskings, deconflict collection, and integrate SIGINT into all-source products.' },
      { id: 'collection',   icon: 'fa-project-diagram', title: 'Collection Management',    desc: 'Develop the collection plan, task organic collectors, and manage RFI/IIR reporting cycles.' },
      { id: 'products',     icon: 'fa-file-alt',        title: 'Intelligence Products',    desc: 'Produce and disseminate INTSUM, IIR, IPB, and WARNORD annexes on required cycles.' },
    ],
    systems: [
      { label: 'DCGS-A',     status: 'pending', note: 'All-source fusion' },
      { label: 'M3 / HOT-R', status: 'pending', note: 'HUMINT reporting'  },
      { label: 'MIDB',       status: 'pending', note: 'Intel database'    },
      { label: 'SIPRNET',    status: 'pending', note: 'Classified network' },
      { label: 'TAK / ATAK', status: 'pending', note: 'Situational awareness' },
    ],
    positions: [
      { position: 'S2 / Senior Intel Officer',  mos: '350F / MI 35D'  },
      { position: 'S2X — CI Warrant',           mos: '351L / 180A'    },
      { position: 'All-Source Analyst',         mos: '35F'            },
      { position: 'SIGINT NCO',                 mos: '35N'            },
      { position: 'Collection Manager',         mos: '35G'            },
      { position: 'GEOINT / Imagery Analyst',   mos: '35G'            },
    ],
  },

  S3: {
    icon: 'fa-chess-knight',
    charter: `The S3 section is responsible for operational planning, rehearsals, synchronization, and execution management.
      The S3 advises the commander on all matters related to operations and training, integrates the efforts of all staff
      elements, and ensures continuous current operations are executed per the commander's intent.`,
    responsibilities: [
      { id: 'orders',       icon: 'fa-file-signature',    title: 'Plans & Orders',           desc: 'Develop and publish OPORDs, FRAGOs, WARNORDs, and operational graphics for deliberate and time-sensitive planning.' },
      { id: 'readiness',    icon: 'fa-shield-alt',        title: 'Operational Readiness',    desc: 'Track and report unit readiness through FORSTAT, CUSR, and readiness products; coordinate FMC/NMC status.' },
      { id: 'battle-staff', icon: 'fa-users',             title: 'Battle Staff Integration', desc: 'Facilitate the MDMP, synchronization matrices, and battle rhythm events across all staff sections.' },
      { id: 'risk',         icon: 'fa-exclamation-triangle', title: 'Risk Management',      desc: 'Develop risk assessments, ROE, and safety plans; coordinate with Safety NCO and JAG for operational compliance.' },
      { id: 'opord',        icon: 'fa-sitemap',           title: 'OPORD Development',        desc: 'Lead MDMP process, develop COAs, and facilitate wargaming and synchronization conferences.' },
      { id: 'fires',        icon: 'fa-crosshairs',        title: 'Fire Support Coordination',desc: 'Coordinate indirect fires, CAS, and non-lethal effects integration in support of operational objectives.' },
    ],
    systems: [
      { label: 'CPOF',     status: 'pending', note: 'Command post'     },
      { label: 'AOPS',     status: 'pending', note: 'Operations'       },
      { label: 'TIGR',     status: 'pending', note: 'Ground reporting' },
      { label: 'AFATDS',   status: 'pending', note: 'Fire support'     },
      { label: 'JBC-P',    status: 'pending', note: 'Blue force track'  },
      { label: 'GCCS-A',   status: 'pending', note: 'Common operational picture' },
    ],
    positions: [
      { position: 'S3 / Operations Officer',    mos: '18A / FA'    },
      { position: 'S3 NCOIC',                  mos: '18Z / 11Z'   },
      { position: 'Current Operations Officer', mos: '18A'         },
      { position: 'Plans Officer',              mos: '18A'         },
      { position: 'Fire Support Officer (FSO)', mos: '13A'         },
      { position: 'Operations NCO',             mos: '18Z'         },
    ],
  },

  S4: {
    icon: 'fa-boxes',
    charter: `The S4 section is responsible for all aspects of sustainment planning and execution. The S4 advises
      the commander on logistics, maintenance, transportation, property accountability, and all classes of supply
      to ensure the unit is materially ready for operations.`,
    responsibilities: [
      { id: 'supply',       icon: 'fa-warehouse',       title: 'Supply Operations',         desc: 'Manage requisition, receipt, storage, and issue of all classes of supply; coordinate emergency resupply during operations.' },
      { id: 'maintenance',  icon: 'fa-wrench',          title: 'Maintenance Management',    desc: 'Supervise unit-level PMCS, coordinate DS-level maintenance support, and manage equipment readiness rates.' },
      { id: 'transport',    icon: 'fa-truck-moving',    title: 'Transportation',             desc: 'Plan and coordinate organic lift, contracted transport, and convoy operations; manage MTOE vehicle fleet.' },
      { id: 'property',     icon: 'fa-clipboard-list',  title: 'Property Book',             desc: 'Maintain accurate property accountability per AR 710-2; conduct sensitive item inventories and reconcile GCSS-A records.' },
      { id: 'class-req',    icon: 'fa-file-invoice',    title: 'Class Requests',             desc: 'Process DA 2062s, SB 700-20 substitution requests, and special class (IV/VIII) coordination.' },
      { id: 'fuel-water',   icon: 'fa-gas-pump',        title: 'Bulk Fuel & Water',          desc: 'Manage bulk POL operations, water distribution planning, and forward area refuel point coordination.' },
    ],
    systems: [
      { label: 'GCSS-Army', status: 'pending', note: 'Supply & property'  },
      { label: 'SAMS-E',    status: 'pending', note: 'Maintenance'        },
      { label: 'LIW',       status: 'pending', note: 'Logistics info'     },
      { label: 'FMS-Web',   status: 'pending', note: 'Fleet management'   },
      { label: 'FEDLOG',    status: 'pending', note: 'Parts catalog'      },
    ],
    positions: [
      { position: 'S4 / Logistics Officer',     mos: '92A / 180B'  },
      { position: 'S4 NCOIC',                  mos: '92A / 91Z'   },
      { position: 'Supply Sergeant',            mos: '92A'         },
      { position: 'Property Book NCO',          mos: '92A'         },
      { position: 'Maintenance NCO',            mos: '91Z'         },
      { position: 'Motor Sergeant',             mos: '91B'         },
    ],
  },

  S5: {
    icon: 'fa-drafting-compass',
    charter: `The S5 section leads long-range and deliberate planning to synchronize current operations with
      future objectives. The S5 translates command guidance into executable plans, integrates interagency
      coordination, and ensures campaign continuity through connected planning cycles.`,
    responsibilities: [
      { id: 'campaign',     icon: 'fa-map-marked-alt',  title: 'Campaign Planning',          desc: 'Develop and maintain the Campaign Plan, OPLAN, and associated annexes in support of theater objectives.' },
      { id: 'conplan',      icon: 'fa-project-diagram', title: 'CONPLAN Development',        desc: 'Draft contingency plans and branches/sequels to support adaptive planning requirements.' },
      { id: 'mdmp',         icon: 'fa-sitemap',         title: 'MDMP Facilitation',          desc: 'Facilitate the Military Decision-Making Process for major planning efforts; produce synchronization matrices.' },
      { id: 'lr-cal',       icon: 'fa-calendar-alt',    title: 'Long-Range Calendar',        desc: 'Develop and maintain the Long-Range Calendar, master training schedule, and CTC rotation coordination.' },
      { id: 'interagency',  icon: 'fa-network-wired',   title: 'Interagency Coordination',   desc: 'Liaise with interagency partners, USG agencies, and multinational forces for whole-of-government integration.' },
      { id: 'future-ops',   icon: 'fa-forward',         title: 'Future Operations',          desc: 'Bridge the gap between current operations (S3) and long-range plans; maintain the operational planning timeline.' },
    ],
    systems: [
      { label: 'JOPES',    status: 'pending', note: 'Joint planning'    },
      { label: 'GKO',      status: 'pending', note: 'Knowledge portal'  },
      { label: 'SIPRNET',  status: 'pending', note: 'Classified network' },
      { label: 'GCCS-J',   status: 'pending', note: 'Common picture'    },
      { label: 'DCGS-A',   status: 'pending', note: 'PIR tracking'      },
    ],
    positions: [
      { position: 'S5 / Plans Officer',           mos: '18A / PSYOP 37A' },
      { position: 'Future Operations Officer',     mos: '18A'             },
      { position: 'Interagency Coordinator',       mos: '18A / CIV'       },
      { position: 'Plans NCO',                     mos: '18Z'             },
      { position: 'MDMP Facilitator',              mos: '18A'             },
    ],
  },

  S6: {
    icon: 'fa-satellite-dish',
    charter: `The S6 section is responsible for all aspects of signal, network operations, and information
      management. The S6 ensures robust, secure, and reliable communications across all mission sets and
      advises the commander on communications architecture, COMSEC, and information system capabilities.`,
    responsibilities: [
      { id: 'netops',    icon: 'fa-network-wired',    title: 'Network Operations',         desc: "Plan, install, operate, and maintain the unit's tactical and garrison communications infrastructure (NIPR/SIPR/SAP)." },
      { id: 'comsec',   icon: 'fa-lock',              title: 'COMSEC / Crypto',            desc: 'Manage all COMSEC equipment, key management, and EKMS accounts per CMS policies and AR 380-40.' },
      { id: 'systems',  icon: 'fa-server',            title: 'Systems Management',         desc: 'Administer servers, workstations, radios, and satellite systems; troubleshoot system outages and degraded operations.' },
      { id: 'equip',    icon: 'fa-hdd',               title: 'Equipment Accountability',   desc: 'Maintain property accountability for all signal equipment; coordinate maintenance with supporting signal units.' },
      { id: 'help',     icon: 'fa-headset',           title: 'Help Desk',                  desc: 'Provide first-line user support for hardware, software, accounts, and network access across the unit.' },
      { id: 'spectrum', icon: 'fa-wifi',              title: 'Spectrum Management',        desc: 'Manage frequency assignments, JCEOI, and SOI to prevent RF fratricide and deconflict EM spectrum.' },
    ],
    systems: [
      { label: 'WIN-T / JNN', status: 'pending', note: 'Tactical network'  },
      { label: 'EKMS / KIV-7',status: 'pending', note: 'Key management'   },
      { label: 'SIPR / NIPR', status: 'pending', note: 'Network access'   },
      { label: 'SATCOM',      status: 'pending', note: 'Satellite comms'  },
      { label: 'VOIP',        status: 'pending', note: 'Voice over IP'     },
    ],
    positions: [
      { position: 'S6 / Signal Officer',     mos: '255A / 25U'  },
      { position: 'S6 NCOIC',               mos: '25U'         },
      { position: 'Network Admin NCO',       mos: '25N'         },
      { position: 'COMSEC Custodian',        mos: '25U'         },
      { position: 'Systems NCO',             mos: '25D'         },
      { position: 'Radio / Comms NCO',       mos: '25U'         },
    ],
  },

  S7: {
    icon: 'fa-graduation-cap',
    charter: `The S7 section coordinates and integrates all training activities to maintain unit readiness and
      individual proficiency. The S7 advises the commander on METL-based training priorities, manages the
      training calendar, and ensures all soldiers meet mandatory individual and collective training requirements.`,
    responsibilities: [
      { id: 'metl',       icon: 'fa-crosshairs',          title: 'METL Assessment',        desc: 'Track and assess unit proficiency against the Mission Essential Task List; coordinate METL review with CDR and XO.' },
      { id: 'schedule',   icon: 'fa-calendar-week',       title: 'Training Schedule',      desc: 'Develop and publish the weekly training schedule; deconflict training events across sections and sub-units.' },
      { id: 'aar',        icon: 'fa-clipboard-check',     title: 'After Action Reviews',   desc: 'Facilitate AARs for all major training events; capture lessons learned and integrate into future planning.' },
      { id: 'collective', icon: 'fa-users-cog',           title: 'Collective Training',    desc: 'Plan and resource collective task training, crew qualifications, and live-fire exercises.' },
      { id: 'individual', icon: 'fa-user-check',          title: 'Individual Training',    desc: 'Track mandatory individual training completion (weapons quals, ACFT, medical, cultural, language) via DTMS.' },
      { id: 'schools',    icon: 'fa-school',              title: 'Schools & Courses',      desc: 'Manage school quotas, ATRRS requests, and leader development school submissions.' },
    ],
    systems: [
      { label: 'DTMS',     status: 'pending', note: 'Training mgmt'    },
      { label: 'ATRRS',    status: 'pending', note: 'School enrollment' },
      { label: 'ATIS',     status: 'pending', note: 'Training info'     },
      { label: 'CATS',     status: 'pending', note: 'Collective task'   },
      { label: 'MEDPROS',  status: 'pending', note: 'Med readiness ref' },
    ],
    positions: [
      { position: 'S7 / Training Officer',    mos: '18A'         },
      { position: 'Training NCO',             mos: '18Z'         },
      { position: 'METL / Readiness NCO',     mos: '18Z'         },
      { position: 'Schools / Quotas NCO',     mos: '18Z'         },
    ],
  },

  S8: {
    icon: 'fa-dollar-sign',
    charter: `The S8 section advises the commander on all financial management matters. The S8 coordinates
      resource management, budget execution, travel finance, and pay actions to ensure the unit's fiscal
      operations comply with applicable laws, regulations, and Army financial policy.`,
    responsibilities: [
      { id: 'budget',      icon: 'fa-chart-bar',        title: 'Budget Execution',          desc: 'Manage and track obligation of unit budget across all lines of accounting; coordinate with G8 for fund allocation.' },
      { id: 'pay',         icon: 'fa-money-check-alt',  title: 'Pay Actions',               desc: 'Initiate and track pay adjustments, special pays, and entitlement changes through IPPS-A and Finance units.' },
      { id: 'travel',      icon: 'fa-plane',            title: 'Travel (DTS)',              desc: 'Process DTS authorizations, vouchers, and government travel card reconciliations; monitor outstanding DTS items.' },
      { id: 'audit',       icon: 'fa-search-dollar',    title: 'Audit / Reconciliation',    desc: 'Conduct monthly reconciliation of all accounts; prepare audit packages and coordinate with Finance Command.' },
      { id: 'contracts',   icon: 'fa-file-contract',    title: 'Contracts & Procurement',   desc: 'Coordinate local purchase procedures, imprest fund actions, and micro-purchase requirements.' },
      { id: 'entitlement', icon: 'fa-hand-holding-usd', title: 'Entitlements Management',   desc: 'Track and verify BAH, BAS, COLA, HDP, FLPP, and special entitlement eligibility for all assigned personnel.' },
    ],
    systems: [
      { label: 'GFEBS',      status: 'pending', note: 'General fund'     },
      { label: 'STANFINS',   status: 'pending', note: 'Finance system'   },
      { label: 'DTS',        status: 'pending', note: 'Travel system'    },
      { label: 'IPPS-A',     status: 'pending', note: 'Pay / HR'         },
      { label: 'JLV',        status: 'pending', note: 'Budget tracking'  },
    ],
    positions: [
      { position: 'Resource Manager (RM)',      mos: '51C / FA50'  },
      { position: 'Finance NCO',                mos: '36B'         },
      { position: 'DTS Administrator',          mos: '36B / CIV'   },
      { position: 'Budget Analyst',             mos: '36B / CIV'   },
      { position: 'Pay Clerk',                  mos: '36B'         },
    ],
  },

  S9: {
    icon: 'fa-handshake',
    charter: `The S9 section integrates civil affairs activities to minimize friction between military operations
      and the civil environment. The S9 advises the commander on Civil-Military Operations (CMO), coordinates
      with interagency and host-nation partners, and manages the CMOC to facilitate unity of effort in the
      operational area.`,
    responsibilities: [
      { id: 'ca-ops',     icon: 'fa-globe-americas',    title: 'CA Operations',              desc: "Plan and execute Civil Affairs operations in support of the commander's civil-military objectives and campaign plan." },
      { id: 'cmoc',       icon: 'fa-building',          title: 'CMOC',                       desc: 'Operate the Civil-Military Operations Center as the primary interface between military and civilian organizations.' },
      { id: 'ngo',        icon: 'fa-hands-helping',     title: 'NGO / IO Coordination',     desc: 'Establish and maintain relationships with Non-Governmental Organizations and International Organizations.' },
      { id: 'kle',        icon: 'fa-user-tie',          title: 'Key Leader Engagement',      desc: 'Identify, develop, and maintain KLE plans to shape the civil environment and support host-nation capacity.' },
      { id: 'assessment', icon: 'fa-binoculars',        title: 'CMO Assessment',             desc: 'Assess and report ASCOPE/PMESII factors affecting military operations in the AO.' },
      { id: 'governance', icon: 'fa-balance-scale',     title: 'Governance & Rule of Law',   desc: 'Support host-nation governance capacity-building efforts and rule-of-law initiatives per the campaign plan.' },
    ],
    systems: [
      { label: 'CAT-MDSS', status: 'pending', note: 'Civil affairs'    },
      { label: 'SIPRNET',  status: 'pending', note: 'Classified net'   },
      { label: 'JCRM',     status: 'pending', note: 'Coord reporting'  },
      { label: 'MIST',     status: 'pending', note: 'ORB / reporting'  },
    ],
    positions: [
      { position: 'S9 / CA Officer',            mos: '38A / 18A'   },
      { position: 'CMO NCO',                    mos: '38B'         },
      { position: 'CMOC Chief',                 mos: '38B'         },
      { position: 'KLE NCO',                    mos: '38B'         },
      { position: 'CA Planner',                 mos: '38A'         },
    ],
  },
}

// ── S2 SOR connections ────────────────────────────────────────────────────────
const S2_SOR = [
  { label: 'DCGS-A',     status: 'connected' as const },
  { label: 'SIPRNET',    status: 'connected' as const },
  { label: 'CPOF',       status: 'pending'   as const },
  { label: 'NGA Portal', status: 'pending'   as const },
  { label: 'DISS',       status: 'connected' as const },
]

const STATUS_CONN: Record<string, string> = {
  connected: styles.sorConnected,
  pending:   styles.sorPending,
  error:     styles.sorDisconnect,
}

// ── S2 admin tab actions ──────────────────────────────────────────────────────
const S2_ADM_TAB_ACTIONS: Record<string, Array<{ key: string; icon: string; label: string }>> = {
  'adm-people': [
    { key: 'roster',     icon: 'fa-address-book',    label: 'Roster'         },
    { key: 'counseling', icon: 'fa-file-alt',        label: 'Counseling'     },
    { key: 'in-proc',    icon: 'fa-sign-in-alt',     label: 'In-Processing'  },
    { key: 'out-proc',   icon: 'fa-sign-out-alt',    label: 'Out-Processing' },
    { key: 'awards',     icon: 'fa-medal',           label: 'Awards'         },
    { key: 'promotions', icon: 'fa-arrow-circle-up', label: 'Promotions'     },
    { key: 'leave',      icon: 'fa-calendar-check',  label: 'Leave'          },
  ],
  'adm-tasks': [
    { key: 'new-task',  icon: 'fa-plus',                 label: 'New Task'  },
    { key: 'my-tasks',  icon: 'fa-user-check',           label: 'My Tasks'  },
    { key: 'all-tasks', icon: 'fa-list',                 label: 'All Tasks' },
    { key: 'priority',  icon: 'fa-exclamation-triangle', label: 'Priority'  },
    { key: 'completed', icon: 'fa-check-double',         label: 'Completed' },
  ],
  'adm-security': [
    { key: 'clearances',      icon: 'fa-id-badge',      label: 'Clearances'      },
    { key: 'ci-referrals',    icon: 'fa-user-secret',   label: 'CI Referrals'    },
    { key: 'foreign-contact', icon: 'fa-globe',         label: 'Foreign Contact' },
    { key: 'access-log',      icon: 'fa-file-contract', label: 'Access Log'      },
  ],
  'adm-operations': [
    { key: 'battle-rhythm', icon: 'fa-drum',            label: 'Battle Rhythm'   },
    { key: 'pirs',          icon: 'fa-question-circle', label: 'PIRs'            },
    { key: 'suspenses',     icon: 'fa-bell',            label: 'Suspenses'       },
    { key: 'collection',    icon: 'fa-crosshairs',      label: 'Collection Plan' },
  ],
  'adm-sustainment': [
    { key: 'dts-travel', icon: 'fa-plane',          label: 'DTS / Travel' },
    { key: 'gtcc',       icon: 'fa-credit-card',    label: 'GTCC'         },
    { key: 'equipment',  icon: 'fa-server',         label: 'Equipment'    },
    { key: 'da-2062',    icon: 'fa-clipboard-list', label: 'DA 2062'      },
  ],
  'adm-plans': [
    { key: 'lr-calendar', icon: 'fa-calendar-alt',    label: 'LR Calendar'     },
    { key: 'annual-susp', icon: 'fa-redo',            label: 'Annual Susp.'    },
    { key: 'collection',  icon: 'fa-crosshairs',      label: 'Collection Plan' },
    { key: 'intel-annex', icon: 'fa-file-alt',        label: 'Intel Annex'     },
  ],
  'adm-comms': [
    { key: 'contact-roster', icon: 'fa-address-book', label: 'Contact Roster' },
    { key: 'ext-contacts',   icon: 'fa-phone-alt',    label: 'Ext Contacts'   },
    { key: 'message-log',    icon: 'fa-envelope',     label: 'Message Log'    },
    { key: 'dcgs-links',     icon: 'fa-link',         label: 'DCGS-A / CPOF'  },
  ],
  'adm-training': [
    { key: 'requirements',  icon: 'fa-chalkboard-teacher', label: 'Requirements'  },
    { key: 'metl',          icon: 'fa-crosshairs',         label: 'METL'          },
    { key: 'certs',         icon: 'fa-certificate',        label: 'Certs'         },
    { key: 'intel-courses', icon: 'fa-graduation-cap',     label: 'Intel Courses' },
  ],
  'adm-resources': [
    { key: 'budget',   icon: 'fa-dollar-sign',  label: 'Budget'   },
    { key: 'property', icon: 'fa-boxes',        label: 'Property' },
    { key: 'requests', icon: 'fa-file-invoice', label: 'Requests' },
  ],
  'adm-coord': [
    { key: 'coord-tracker', icon: 'fa-project-diagram', label: 'Coord Tracker' },
    { key: 'key-contacts',  icon: 'fa-users',           label: 'Key Contacts'  },
    { key: 'deconflict',    icon: 'fa-handshake',       label: 'Deconfliction' },
    { key: 'sync-log',      icon: 'fa-comments',        label: 'Sync Log'      },
  ],
}

// ── S2 seed data ──────────────────────────────────────────────────────────────
const S2_PERSONNEL = [
  { id: '1', rank: 'CPT', name: 'Martinez, J.',  mos: '35D',  position: 'S2 OIC',             clearance: 'TS/SCI',    medStatus: 'Green', ets: '2027-05-31' },
  { id: '2', rank: 'SFC', name: 'Thompson, K.',  mos: '35F',  position: 'S2 NCOIC',           clearance: 'TS/SCI',    medStatus: 'Green', ets: '2026-11-30' },
  { id: '3', rank: 'SSG', name: 'Rodriguez, M.', mos: '35F',  position: 'All-Source Analyst', clearance: 'TS/SCI',    medStatus: 'Amber', ets: '2028-02-28' },
  { id: '4', rank: 'SPC', name: 'Chen, L.',      mos: '35G',  position: 'GEOINT Analyst',     clearance: 'TS/SCI',    medStatus: 'Green', ets: '2027-08-31' },
  { id: '5', rank: 'SGT', name: 'Williams, D.',  mos: '35L',  position: 'CI Agent',           clearance: 'TS/SCI/CI', medStatus: 'Green', ets: '2026-09-30' },
]

const S2_PIRS = [
  { id: 'PIR-1', requirement: 'Disposition and intent of identified threat forces within AO',     indicatorsCount: 4, status: 'Active',     priority: 'Critical', owner: 'SSG Rodriguez', lastUpdate: '18 Jun 2026' },
  { id: 'PIR-2', requirement: 'HASC / ACM network nodes and key facilitators in area',            indicatorsCount: 3, status: 'Active',     priority: 'High',     owner: 'SSG Rodriguez', lastUpdate: '17 Jun 2026' },
  { id: 'PIR-3', requirement: 'Key Leader location and availability for KLE engagement',          indicatorsCount: 2, status: 'Active',     priority: 'High',     owner: 'CPT Martinez',  lastUpdate: '16 Jun 2026' },
  { id: 'PIR-4', requirement: 'Infrastructure status affecting force movement in AO',             indicatorsCount: 2, status: 'Monitoring', priority: 'Routine',  owner: 'SPC Chen',      lastUpdate: '14 Jun 2026' },
]

const S2_TASKS = [
  { id: 'S2-T001', task: 'Compile daily SITREP / Intel Summary',               priority: 'Critical', assignedTo: 'SFC Thompson', due: '18 Jun 2026', status: 'Completed',  category: 'Daily'      },
  { id: 'S2-T002', task: 'Update IPB terrain overlay for AO-3',                priority: 'High',     assignedTo: 'SPC Chen',     due: '20 Jun 2026', status: 'In Progress', category: 'Products'   },
  { id: 'S2-T003', task: 'Submit GEOINT product request to NGA',               priority: 'High',     assignedTo: 'SPC Chen',     due: '22 Jun 2026', status: 'Open',       category: 'Collection' },
  { id: 'S2-T004', task: 'CI referral — foreign contact report (SGT Williams)', priority: 'High',    assignedTo: 'SGT Williams', due: '25 Jun 2026', status: 'In Progress', category: 'Security'   },
  { id: 'S2-T005', task: 'Prepare threat brief for Bn CDR update',             priority: 'High',     assignedTo: 'CPT Martinez', due: '19 Jun 2026', status: 'Open',       category: 'Briefings'  },
  { id: 'S2-T006', task: 'Review collection plan — cycle 2 adjustment',        priority: 'Medium',   assignedTo: 'SFC Thompson', due: '01 Jul 2026', status: 'Open',       category: 'Collection' },
  { id: 'S2-T007', task: 'DCGS-A user account renewal — SPC Chen',            priority: 'Routine',  assignedTo: 'CPT Martinez', due: '30 Jun 2026', status: 'Pending',    category: 'Admin'      },
]

const S2_CLEARANCES = [
  { name: 'Martinez, J.',  rank: 'CPT', clearance: 'TS/SCI',    pr_date: '15 Mar 2022', pr_due: '15 Mar 2027', status: 'Current',    flags: 'None'        },
  { name: 'Thompson, K.',  rank: 'SFC', clearance: 'TS/SCI',    pr_date: '01 Aug 2020', pr_due: '01 Aug 2025', status: 'PR Overdue', flags: 'Initiate PR' },
  { name: 'Rodriguez, M.', rank: 'SSG', clearance: 'TS/SCI',    pr_date: '10 Jan 2023', pr_due: '10 Jan 2028', status: 'Current',    flags: 'None'        },
  { name: 'Chen, L.',      rank: 'SPC', clearance: 'TS/SCI',    pr_date: '05 Jun 2024', pr_due: '05 Jun 2029', status: 'Current',    flags: 'None'        },
  { name: 'Williams, D.',  rank: 'SGT', clearance: 'TS/SCI/CI', pr_date: '12 Nov 2021', pr_due: '12 Nov 2026', status: 'PR Due 90d', flags: 'Initiate PR' },
]

const S2_ACCESS_LOG = [
  { date: '18 Jun 2026', soldier: 'CPT Martinez, J.', rank: 'CPT', action: 'DCGS-A threat dataset pull',               system: 'DCGS-A',        classification: 'TS/SCI', authorized: 'Yes' },
  { date: '17 Jun 2026', soldier: 'SFC Thompson, K.', rank: 'SFC', action: 'SIPRNET intel report review',              system: 'SIPRNET',       classification: 'SECRET', authorized: 'Yes' },
  { date: '16 Jun 2026', soldier: 'SGT Williams, D.', rank: 'SGT', action: 'CI referral submission — foreign contact', system: 'DISS / CI',     classification: 'SECRET', authorized: 'Yes' },
  { date: '15 Jun 2026', soldier: 'SPC Chen, L.',     rank: 'SPC', action: 'NGA product access — route analysis',      system: 'NGA Portal',    classification: 'TS/SCI', authorized: 'Yes' },
  { date: '14 Jun 2026', soldier: 'SSG Rodriguez, M.',rank: 'SSG', action: 'IPB overlay update — AO-3 terrain',        system: 'CPOF',          classification: 'SECRET', authorized: 'Yes' },
]

const S2_KEY_CONTACTS = [
  { org: 'Group G2 / Higher S2',     poc: 'MAJ Osei, T.',     role: 'Group S2',         phone: 'DSN 555-2001', lastContact: '17 Jun 2026' },
  { org: 'DIA / DIAC',               poc: 'SFC Harmon, P.',   role: 'Intel Liaison',    phone: 'DSN 555-8800', lastContact: '15 Jun 2026' },
  { org: 'NSA CSS Army',             poc: 'GS-12 Nguyen, Q.', role: 'SIGINT Support',   phone: 'DSN 555-6100', lastContact: '10 Jun 2026' },
  { org: 'INSCOM Theater Intel',     poc: 'MSG Calhoun, R.',  role: 'Theater S2 Coord', phone: 'DSN 555-4400', lastContact: '12 Jun 2026' },
  { org: 'Interagency Partner (OGA)',poc: 'CLASSIFIED',        role: 'Intel Sharing',    phone: 'CLASSIFIED',   lastContact: '05 Jun 2026' },
]

const S2_COORD_TRACKER = [
  { date: '16 Jun 2026', request: 'PIR-3 update — KLE window brief',               requestingUnit: 'ODA-5211 / S3', poc: 'CPT Martinez', status: 'In Progress', due: '25 Jun 2026', notes: 'Key leader location confirmed; engagement window brief in work'  },
  { date: '10 Jun 2026', request: 'GEOINT product for route clearance op',          requestingUnit: 'S3 OPS',        poc: 'SPC Chen',     status: 'In Progress', due: '22 Jun 2026', notes: 'NGA request submitted 18 Jun; 5-day SLA'                        },
  { date: '05 Jun 2026', request: 'Threat brief for BDE CDR visit',                 requestingUnit: 'BDE S2',        poc: 'CPT Martinez', status: 'Completed',   due: '10 Jun 2026', notes: 'Brief delivered; CDR approved PIR update'                       },
  { date: '28 May 2026', request: 'CI referral coordination — foreign contact rpt', requestingUnit: 'CID / SSO',     poc: 'SGT Williams', status: 'In Progress', due: '25 Jun 2026', notes: 'Foreign contact travel report pending CID review'                },
]

const S2_SYNC_LOG = [
  { date: '17 Jun 2026', meeting: 'CDR Intel Brief',         attendees: 'CPT Martinez',                              keyItems: 'PIR-1 update; threat forces moving NE; GEOINT product pending NGA',     actionItems: 'SPC Chen expedite NGA request; update overlays by 20 Jun'  },
  { date: '16 Jun 2026', meeting: 'S2/S3 Sync',              attendees: 'CPT Martinez, SFC Thompson',                keyItems: 'Collection gap analysis; ODA-level PIR tasking',                         actionItems: 'Revise collection plan cycle 2; SFC Thompson lead'          },
  { date: '14 Jun 2026', meeting: 'Interagency Coordination', attendees: 'CPT Martinez',                              keyItems: 'Intel sharing on KLE targets; CI referral follow-up',                    actionItems: 'SGT Williams submit CI report NLT 25 Jun'                   },
  { date: '10 Jun 2026', meeting: 'S2 Shop Sync',             attendees: 'CPT Martinez, SFC Thompson, SSG Rodriguez', keyItems: 'IPB update; DCGS-A account renewal; SFC Thompson PR review',             actionItems: 'Initiate PR for Thompson and Williams; renew DCGS-A accounts'},
]

const S2_LR_CALENDAR = [
  { month: 'Jul 2026', event: 'CPT Martinez TDY — JIDA course (DIA)',      type: 'TDY/Training', prepDue: '01 Jul 2026', owner: 'SFC Thompson (acting OIC)' },
  { month: 'Aug 2026', event: 'GEOINT re-certification — SPC Chen',        type: 'Training',     prepDue: '15 Jul 2026', owner: 'SPC Chen'                  },
  { month: 'Sep 2026', event: 'SFC Thompson PR initiation (12-month lead)', type: 'Security',    prepDue: '01 Jul 2026', owner: 'CPT Martinez'              },
  { month: 'Oct 2026', event: 'Semi-annual collection plan review',         type: 'Intel Ops',   prepDue: '01 Sep 2026', owner: 'SFC Thompson'              },
  { month: 'Nov 2026', event: 'SGT Williams PR initiation (90-day window)', type: 'Security',    prepDue: '15 Aug 2026', owner: 'CPT Martinez'              },
]

const S2_BUDGET = [
  { program: 'TDY / Collection Travel (DTS)', authorization: 14000, obligated: 8500, expended: 4200, fy: 'FY26 Q3' },
  { program: 'Training / Intel Courses',      authorization:  6000, obligated: 3200, expended: 2800, fy: 'FY26 Q3' },
  { program: 'Office / Classified Supplies',  authorization:  2500, obligated: 1800, expended: 1500, fy: 'FY26 Q3' },
  { program: 'NGA / Geospatial Products',     authorization:  4000, obligated: 1200, expended:  800, fy: 'FY26 Q3' },
]

const S2_TRAINING_REQS = [
  { soldier: 'CPT Martinez, J.', rank: 'CPT', requirement: 'JIDA / Advanced Integration Course',  dueDate: '30 Sep 2026', status: 'In Progress', notes: 'Enrolled Jul 2026 TDY'                       },
  { soldier: 'SFC Thompson, K.', rank: 'SFC', requirement: '35F Senior Leaders Course (SLC)',      dueDate: '31 Dec 2026', status: 'Pending',     notes: 'Nomination submitted; school seat pending'   },
  { soldier: 'SSG Rodriguez, M.',rank: 'SSG', requirement: 'DCGS-A Advanced Operator (online)',    dueDate: '31 Aug 2026', status: 'Pending',     notes: 'Online — ATSC portal'                        },
  { soldier: 'SPC Chen, L.',     rank: 'SPC', requirement: 'NGA GEOINT Certification',             dueDate: '15 Aug 2026', status: 'In Progress', notes: 'CBT package 60% complete'                    },
  { soldier: 'SGT Williams, D.', rank: 'SGT', requirement: 'CI Agent Re-certification',            dueDate: '01 Nov 2026', status: 'Pending',     notes: 'Linked to PR completion and course enrollment'},
]

const S2_SUSPENSES = [
  { soldier: 'SFC Thompson, K.', rank: 'SFC', item: 'Periodic Review (PR) Initiation', dueDate: '01 Jul 2026', status: 'Overdue', poc: 'CPT Martinez', notes: 'PR window expired Aug 2025 — initiate immediately'    },
  { soldier: 'SGT Williams, D.', rank: 'SGT', item: 'CI Agent Re-cert Packet',         dueDate: '15 Jul 2026', status: 'Pending', poc: 'SFC Thompson', notes: 'Linked to PR completion and course enrollment'         },
  { soldier: 'SPC Chen, L.',     rank: 'SPC', item: 'DCGS-A Account Annual Renewal',   dueDate: '30 Jun 2026', status: 'Pending', poc: 'CPT Martinez', notes: 'Annual renewal — system account expires 30 Jun'        },
  { soldier: 'CPT Martinez, J.', rank: 'CPT', item: 'JIDA TDY Orders Finalization',    dueDate: '01 Jul 2026', status: 'Pending', poc: 'S1 Phillips',  notes: 'Orders in S1 processing — depart 08 Jul'              },
]

// ── S3 SOR connections ────────────────────────────────────────────────────────
const S3_SOR = [
  { label: 'CPOF',   status: 'connected' as const },
  { label: 'AOPS',   status: 'connected' as const },
  { label: 'JBC-P',  status: 'pending'   as const },
  { label: 'AFATDS', status: 'pending'   as const },
  { label: 'TIGR',   status: 'pending'   as const },
]

const S3_ADM_TAB_ACTIONS: Record<string, Array<{ key: string; icon: string; label: string }>> = {
  'adm-people': [
    { key: 'roster',     icon: 'fa-address-book',    label: 'Roster'         },
    { key: 'counseling', icon: 'fa-file-alt',        label: 'Counseling'     },
    { key: 'in-proc',    icon: 'fa-sign-in-alt',     label: 'In-Processing'  },
    { key: 'out-proc',   icon: 'fa-sign-out-alt',    label: 'Out-Processing' },
    { key: 'awards',     icon: 'fa-medal',           label: 'Awards'         },
    { key: 'promotions', icon: 'fa-arrow-circle-up', label: 'Promotions'     },
    { key: 'leave',      icon: 'fa-calendar-check',  label: 'Leave'          },
  ],
  'adm-tasks': [
    { key: 'new-task',      icon: 'fa-plus',                 label: 'New Task'      },
    { key: 'battle-rhythm', icon: 'fa-drum',                 label: 'Battle Rhythm' },
    { key: 'oporders',      icon: 'fa-file-signature',       label: 'OPORDs/FRAGOs' },
    { key: 'priority',      icon: 'fa-exclamation-triangle', label: 'Priority'      },
    { key: 'completed',     icon: 'fa-check-double',         label: 'Completed'     },
  ],
  'adm-security': [
    { key: 'clearances', icon: 'fa-id-badge',      label: 'Clearances'  },
    { key: 'opsec',      icon: 'fa-eye-slash',     label: 'OPSEC'       },
    { key: 'force-prot', icon: 'fa-shield-alt',    label: 'Force Prot'  },
    { key: 'access-log', icon: 'fa-file-contract', label: 'Access Log'  },
  ],
  'adm-operations': [
    { key: 'battle-rhythm', icon: 'fa-drum',               label: 'Battle Rhythm' },
    { key: 'oporders',      icon: 'fa-file-signature',     label: 'Orders'        },
    { key: 'risk',          icon: 'fa-exclamation-circle', label: 'Risk Mgmt'     },
    { key: 'readiness',     icon: 'fa-shield-alt',         label: 'Readiness'     },
  ],
  'adm-sustainment': [
    { key: 'dts-travel', icon: 'fa-plane',          label: 'DTS / Travel' },
    { key: 'gtcc',       icon: 'fa-credit-card',    label: 'GTCC'         },
    { key: 'equipment',  icon: 'fa-server',         label: 'Equipment'    },
    { key: 'da-2062',    icon: 'fa-clipboard-list', label: 'DA 2062'      },
  ],
  'adm-plans': [
    { key: 'lr-calendar', icon: 'fa-calendar-alt',    label: 'LR Calendar'  },
    { key: 'oplan',       icon: 'fa-drafting-compass', label: 'OPLAN'        },
    { key: 'branches',    icon: 'fa-sitemap',          label: 'Branches/Seq' },
    { key: 'annual-susp', icon: 'fa-redo',             label: 'Annual Susp.' },
  ],
  'adm-comms': [
    { key: 'contact-roster', icon: 'fa-address-book', label: 'Contact Roster' },
    { key: 'ext-contacts',   icon: 'fa-phone-alt',    label: 'Ext Contacts'   },
    { key: 'sync-log',       icon: 'fa-comments',     label: 'Sync Log'       },
  ],
  'adm-training': [
    { key: 'requirements', icon: 'fa-chalkboard-teacher', label: 'Requirements' },
    { key: 'metl',         icon: 'fa-crosshairs',         label: 'METL'         },
    { key: 'ranges',       icon: 'fa-bullseye',           label: 'Range Sched'  },
    { key: 'live-fire',    icon: 'fa-fire',               label: 'Live Fire'    },
  ],
  'adm-resources': [
    { key: 'budget',    icon: 'fa-dollar-sign',  label: 'Budget'    },
    { key: 'equipment', icon: 'fa-boxes',        label: 'Equipment' },
    { key: 'requests',  icon: 'fa-file-invoice', label: 'Requests'  },
  ],
  'adm-coord': [
    { key: 'coord-tracker', icon: 'fa-project-diagram', label: 'Coord Tracker' },
    { key: 'key-contacts',  icon: 'fa-users',           label: 'Key Contacts'  },
    { key: 'deconflict',    icon: 'fa-handshake',       label: 'Deconfliction' },
    { key: 'sync-log',      icon: 'fa-comments',        label: 'Sync Log'      },
  ],
}

const S3_PERSONNEL = [
  { id: '1', rank: 'MAJ', name: 'Okafor, C.',   mos: '18A', position: 'S3 / Operations Officer',    clearance: 'TS/SCI', medStatus: 'Green', ets: '2027-03-31' },
  { id: '2', rank: 'SFC', name: 'Bell, R.',      mos: '18Z', position: 'S3 NCOIC',                  clearance: 'TS/SCI', medStatus: 'Green', ets: '2026-08-31' },
  { id: '3', rank: 'CPT', name: 'Reeves, A.',    mos: '18A', position: 'Current Operations Officer', clearance: 'TS/SCI', medStatus: 'Green', ets: '2027-11-30' },
  { id: '4', rank: 'CPT', name: 'Nakamura, T.',  mos: '18A', position: 'Plans Officer',              clearance: 'TS/SCI', medStatus: 'Amber', ets: '2028-06-30' },
  { id: '5', rank: 'CPT', name: 'Alvarez, M.',   mos: '13A', position: 'Fire Support Officer (FSO)', clearance: 'SECRET', medStatus: 'Green', ets: '2026-12-31' },
  { id: '6', rank: 'SFC', name: 'Dunbar, W.',    mos: '18Z', position: 'Operations NCO',             clearance: 'TS/SCI', medStatus: 'Green', ets: '2027-07-31' },
]

const S3_TASKS = [
  { id: 'S3-T001', task: 'Publish weekly training schedule (FRI 1600)',          priority: 'Critical', assignedTo: 'SFC Bell',      due: '20 Jun 2026', status: 'Open',       category: 'Schedule'  },
  { id: 'S3-T002', task: 'Draft FRAGOS 07 — change to convoy route AO-2',       priority: 'High',     assignedTo: 'CPT Reeves',    due: '19 Jun 2026', status: 'In Progress', category: 'Orders'    },
  { id: 'S3-T003', task: 'CUSR / FORSTAT submission to Higher S3',              priority: 'Critical', assignedTo: 'SFC Bell',      due: '22 Jun 2026', status: 'Open',       category: 'Readiness' },
  { id: 'S3-T004', task: 'MDMP facilitation — ODA mission brief prep',          priority: 'High',     assignedTo: 'CPT Nakamura',  due: '25 Jun 2026', status: 'Open',       category: 'Planning'  },
  { id: 'S3-T005', task: 'Risk assessment — live-fire range 14 Jul',            priority: 'High',     assignedTo: 'CPT Alvarez',   due: '01 Jul 2026', status: 'Open',       category: 'Risk'      },
  { id: 'S3-T006', task: 'Battle rhythm sync meeting minutes — CDR update',     priority: 'Medium',   assignedTo: 'SFC Dunbar',    due: '18 Jun 2026', status: 'Completed',  category: 'Rhythm'    },
  { id: 'S3-T007', task: 'JBC-P user account review — SFC Dunbar / CPT Reeves',priority: 'Routine',  assignedTo: 'MAJ Okafor',    due: '30 Jun 2026', status: 'Pending',    category: 'Admin'     },
]

const S3_CLEARANCES = [
  { name: 'Okafor, C.',   rank: 'MAJ', clearance: 'TS/SCI', pr_date: '12 Jan 2023', pr_due: '12 Jan 2028', status: 'Current',     flags: 'None'        },
  { name: 'Bell, R.',     rank: 'SFC', clearance: 'TS/SCI', pr_date: '03 May 2021', pr_due: '03 May 2026', status: 'PR Due 30d',  flags: 'Initiate PR' },
  { name: 'Reeves, A.',   rank: 'CPT', clearance: 'TS/SCI', pr_date: '20 Sep 2022', pr_due: '20 Sep 2027', status: 'Current',     flags: 'None'        },
  { name: 'Nakamura, T.', rank: 'CPT', clearance: 'TS/SCI', pr_date: '15 Apr 2024', pr_due: '15 Apr 2029', status: 'Current',     flags: 'None'        },
  { name: 'Alvarez, M.',  rank: 'CPT', clearance: 'SECRET', pr_date: '08 Aug 2022', pr_due: '08 Aug 2032', status: 'Current',     flags: 'None'        },
  { name: 'Dunbar, W.',   rank: 'SFC', clearance: 'TS/SCI', pr_date: '01 Nov 2021', pr_due: '01 Nov 2026', status: 'PR Due 135d', flags: 'Monitor'     },
]

const S3_BATTLE_RHYTHM = [
  { event: 'CDR Update Brief',         freq: 'Daily 0800',   poc: 'MAJ Okafor',  location: 'SCIF / TOC',    format: 'Briefing' },
  { event: 'Battle Staff Sync',        freq: 'Daily 1700',   poc: 'SFC Bell',    location: 'TOC',           format: 'Sync'     },
  { event: 'Weekly Training Schedule', freq: 'Friday 1600',  poc: 'SFC Dunbar',  location: 'S3 Shop',       format: 'Publish'  },
  { event: 'BN / Higher S3 VTC',       freq: 'Mon/Thu 0900', poc: 'MAJ Okafor',  location: 'VTC Suite',     format: 'VTC'      },
  { event: 'ODA Mission Brief Cycle',  freq: 'As Required',  poc: 'CPT Reeves',  location: 'SCIF',          format: 'Briefing' },
  { event: 'FSO Fires Sync',           freq: 'Weekly Thu',   poc: 'CPT Alvarez', location: 'S3 / Fire Cell', format: 'Sync'    },
]

const S3_SUSPENSES = [
  { soldier: 'SFC Bell, R.',     rank: 'SFC', item: 'Periodic Review (PR) Initiation',    dueDate: '03 Jun 2026', status: 'Overdue', poc: 'MAJ Okafor',  notes: 'PR window passed — initiate immediately'         },
  { soldier: 'SFC Bell, R.',     rank: 'SFC', item: 'CUSR / FORSTAT — Weekly Submission', dueDate: '22 Jun 2026', status: 'Pending', poc: 'MAJ Okafor',  notes: 'Due to Higher S3 by 1200 Monday'                 },
  { soldier: 'CPT Nakamura, T.', rank: 'CPT', item: 'OPLAN Annex C (Operations) Draft',  dueDate: '01 Jul 2026', status: 'Pending', poc: 'MAJ Okafor',  notes: 'Annex C narrative due for Group review'          },
  { soldier: 'CPT Alvarez, M.',  rank: 'CPT', item: 'Risk Assessment — Live-Fire 14 Jul', dueDate: '01 Jul 2026', status: 'Pending', poc: 'MAJ Okafor',  notes: 'Risk matrix + DA 7566 required 14 days prior'   },
]

const S3_LR_CALENDAR = [
  { month: 'Jul 2026', event: 'Live-fire exercise — Range 12 (14 Jul)',     type: 'Training',   prepDue: '01 Jul 2026', owner: 'CPT Alvarez'  },
  { month: 'Aug 2026', event: 'JRTC rotation — mission planning window',    type: 'Operations', prepDue: '15 Jul 2026', owner: 'MAJ Okafor'   },
  { month: 'Sep 2026', event: 'SFC Bell PR initiation',                     type: 'Security',   prepDue: '03 Jun 2026', owner: 'MAJ Okafor'   },
  { month: 'Oct 2026', event: 'CUSR / readiness review — Higher HQ',        type: 'Readiness',  prepDue: '01 Sep 2026', owner: 'SFC Bell'      },
  { month: 'Nov 2026', event: 'Annual OPLAN review cycle',                  type: 'Planning',   prepDue: '01 Oct 2026', owner: 'CPT Nakamura'  },
]

const S3_BUDGET = [
  { program: 'Range / Training Ammunition', authorization: 28000, obligated: 14000, expended:  8500, fy: 'FY26 Q3' },
  { program: 'TDY / Operational Travel',    authorization: 12000, obligated:  7500, expended:  4200, fy: 'FY26 Q3' },
  { program: 'Office / Ops Supplies',       authorization:  3000, obligated:  1800, expended:  1400, fy: 'FY26 Q3' },
  { program: 'Rehearsal / Planning Spt',    authorization:  5000, obligated:  2000, expended:   800, fy: 'FY26 Q3' },
]

const S3_TRAINING_REQS = [
  { soldier: 'MAJ Okafor, C.',   rank: 'MAJ', requirement: 'SAMS-2 / Joint Operational Planning',  dueDate: '30 Sep 2026', status: 'Pending',     notes: 'Nomination submitted to Group G3'         },
  { soldier: 'SFC Bell, R.',     rank: 'SFC', requirement: '18Z SLC (Senior Leaders Course)',       dueDate: '31 Dec 2026', status: 'Pending',     notes: 'School seat request pending'              },
  { soldier: 'CPT Reeves, A.',   rank: 'CPT', requirement: 'Current Operations Officer Course',     dueDate: '31 Aug 2026', status: 'In Progress', notes: 'DL packet submitted; 50% complete'        },
  { soldier: 'CPT Nakamura, T.', rank: 'CPT', requirement: 'MDMP Advanced Application (CGSC DL)',  dueDate: '30 Sep 2026', status: 'Pending',     notes: 'Online — AKO / ATRRS enrollment needed'  },
  { soldier: 'CPT Alvarez, M.',  rank: 'CPT', requirement: 'Joint Fires Observer (JFO) Re-cert',   dueDate: '01 Nov 2026', status: 'Pending',     notes: 'Ranges course; coordinate with BDE FSE'  },
]

const S3_KEY_CONTACTS = [
  { org: 'Higher S3 / Group G3', poc: 'LTC Ferraro, D.',  role: 'Group S3',  phone: 'DSN 555-3001', lastContact: '17 Jun 2026' },
  { org: 'BDE FSE / Fires Cell', poc: 'MAJ Patel, S.',    role: 'BDE FSO',   phone: 'DSN 555-7200', lastContact: '15 Jun 2026' },
  { org: 'JRTC OC/T Cell',       poc: 'CW3 Freeman, B.',  role: 'OC/T Lead', phone: 'DSN 555-5500', lastContact: '10 Jun 2026' },
  { org: 'BDE S2 (Intel sync)',   poc: 'CPT Martinez, J.', role: 'S2 OIC',    phone: 'Org 401',      lastContact: '18 Jun 2026' },
]

const S3_SYNC_LOG = [
  { date: '17 Jun 2026', meeting: 'CDR Update Brief',       attendees: 'MAJ Okafor, CPT Reeves',   keyItems: 'FRAGOS 07 route change; ODA mission brief window',                  actionItems: 'CPT Reeves finalize FRAGOS 07 NLT 19 Jun'      },
  { date: '16 Jun 2026', meeting: 'Battle Staff Sync',      attendees: 'All Staff',                keyItems: 'Readiness — 1 NMC vehicle; range request approved for 14 Jul',      actionItems: 'CPT Alvarez risk assessment due 01 Jul'         },
  { date: '12 Jun 2026', meeting: 'Higher S3 VTC',          attendees: 'MAJ Okafor',              keyItems: 'JRTC rotation confirmed Aug 2026; planning window opens 15 Jul',     actionItems: 'MAJ Okafor initiate OPLAN synchronization mtg'  },
  { date: '10 Jun 2026', meeting: 'Fires Sync',             attendees: 'CPT Alvarez, MAJ Okafor', keyItems: 'JFO certification schedule; AFATDS network status pending',          actionItems: 'CPT Alvarez coordinate JFO course NLT 01 Nov'  },
]

// ── S4 SOR connections ────────────────────────────────────────────────────────
const S4_SOR = [
  { label: 'GCSS-Army', status: 'connected' as const },
  { label: 'SAMS-E',    status: 'connected' as const },
  { label: 'LIW',       status: 'pending'   as const },
  { label: 'FMS-Web',   status: 'pending'   as const },
  { label: 'FEDLOG',    status: 'connected' as const },
]

const S4_ADM_TAB_ACTIONS: Record<string, Array<{ key: string; icon: string; label: string }>> = {
  'adm-people': [
    { key: 'roster',     icon: 'fa-address-book',    label: 'Roster'         },
    { key: 'counseling', icon: 'fa-file-alt',        label: 'Counseling'     },
    { key: 'in-proc',    icon: 'fa-sign-in-alt',     label: 'In-Processing'  },
    { key: 'out-proc',   icon: 'fa-sign-out-alt',    label: 'Out-Processing' },
    { key: 'awards',     icon: 'fa-medal',           label: 'Awards'         },
    { key: 'promotions', icon: 'fa-arrow-circle-up', label: 'Promotions'     },
    { key: 'leave',      icon: 'fa-calendar-check',  label: 'Leave'          },
  ],
  'adm-tasks': [
    { key: 'new-task',   icon: 'fa-plus',                 label: 'New Task'    },
    { key: 'da-2062',    icon: 'fa-clipboard-list',       label: 'DA 2062'     },
    { key: 'supply-req', icon: 'fa-warehouse',            label: 'Supply Reqs' },
    { key: 'maint-req',  icon: 'fa-wrench',               label: 'Maint Reqs'  },
    { key: 'priority',   icon: 'fa-exclamation-triangle', label: 'Priority'    },
    { key: 'completed',  icon: 'fa-check-double',         label: 'Completed'   },
  ],
  'adm-security': [
    { key: 'clearances', icon: 'fa-id-badge',      label: 'Clearances'      },
    { key: 'sens-items', icon: 'fa-lock',          label: 'Sensitive Items' },
    { key: 'opsec',      icon: 'fa-eye-slash',     label: 'OPSEC'           },
    { key: 'access-log', icon: 'fa-file-contract', label: 'Access Log'      },
  ],
  'adm-operations': [
    { key: 'supply-sched', icon: 'fa-calendar-alt', label: 'Supply Sched'   },
    { key: 'class-req',    icon: 'fa-boxes',        label: 'Class Requests' },
    { key: 'convoy-req',   icon: 'fa-truck-moving', label: 'Convoy Reqs'    },
    { key: 'fuel-water',   icon: 'fa-gas-pump',     label: 'Fuel & Water'   },
  ],
  'adm-plans': [
    { key: 'lr-calendar', icon: 'fa-calendar-alt', label: 'LR Calendar'  },
    { key: 'class-iv',    icon: 'fa-cubes',        label: 'Class IV Plan' },
    { key: 'maint-plan',  icon: 'fa-tools',        label: 'Maint Plan'    },
    { key: 'annual-susp', icon: 'fa-redo',         label: 'Annual Susp.' },
  ],
  'adm-comms': [
    { key: 'contact-roster', icon: 'fa-address-book', label: 'Contact Roster' },
    { key: 'unit-contacts',  icon: 'fa-phone-alt',    label: 'Unit Contacts'  },
    { key: 'sync-log',       icon: 'fa-comments',     label: 'Sync Log'       },
  ],
  'adm-training': [
    { key: 'requirements', icon: 'fa-chalkboard-teacher', label: 'Requirements'    },
    { key: 'supply-trng',  icon: 'fa-warehouse',          label: 'Supply Trng'     },
    { key: 'motorpool',    icon: 'fa-car',                label: 'Motorpool Safety' },
    { key: 'completed',    icon: 'fa-check-double',       label: 'Completed'       },
  ],
  'adm-resources': [
    { key: 'budget',        icon: 'fa-dollar-sign',   label: 'Budget'        },
    { key: 'property-book', icon: 'fa-clipboard-list', label: 'Property Book' },
    { key: 'equip-status',  icon: 'fa-tachometer-alt', label: 'Equip Status'  },
  ],
  'adm-coord': [
    { key: 'coord-tracker', icon: 'fa-project-diagram', label: 'Coord Tracker' },
    { key: 'key-contacts',  icon: 'fa-users',           label: 'Key Contacts'  },
    { key: 'deconflict',    icon: 'fa-handshake',       label: 'Deconfliction' },
    { key: 'sync-log',      icon: 'fa-comments',        label: 'Sync Log'      },
  ],
}

const S4_PERSONNEL = [
  { id: '1', rank: 'CPT', name: 'Osei, B.',    mos: '92A', position: 'S4 / Logistics Officer', clearance: 'SECRET', medStatus: 'Green', ets: '2027-08-31' },
  { id: '2', rank: 'SFC', name: 'Larkin, J.',  mos: '92A', position: 'S4 NCOIC',              clearance: 'SECRET', medStatus: 'Green', ets: '2026-10-31' },
  { id: '3', rank: 'SSG', name: 'Porter, D.',  mos: '92A', position: 'Supply Sergeant',        clearance: 'SECRET', medStatus: 'Amber', ets: '2028-01-31' },
  { id: '4', rank: 'SSG', name: 'Vasquez, L.', mos: '92A', position: 'Property Book NCO',      clearance: 'SECRET', medStatus: 'Green', ets: '2027-04-30' },
  { id: '5', rank: 'SGT', name: 'Grant, T.',   mos: '91Z', position: 'Maintenance NCO',        clearance: 'SECRET', medStatus: 'Green', ets: '2026-07-31' },
  { id: '6', rank: 'SPC', name: 'Moore, A.',   mos: '91B', position: 'Motor Pool Specialist',  clearance: 'SECRET', medStatus: 'Green', ets: '2027-12-31' },
]

const S4_TASKS = [
  { id: 'S4-T001', task: 'DA 2062 — hand receipt reconciliation (annual)',         priority: 'Critical', assignedTo: 'SSG Vasquez', due: '30 Jun 2026', status: 'In Progress', category: 'Property'    },
  { id: 'S4-T002', task: 'Class III(B) request — bulk fuel for Aug exercise',      priority: 'High',     assignedTo: 'SFC Larkin',  due: '01 Jul 2026', status: 'Open',       category: 'Supply'      },
  { id: 'S4-T003', task: 'GCSS-A equipment status reconciliation — monthly',      priority: 'High',     assignedTo: 'SGT Grant',   due: '25 Jun 2026', status: 'Open',       category: 'Maintenance' },
  { id: 'S4-T004', task: 'DTS travel voucher closeout — MAJ Okafor TDY May',     priority: 'High',     assignedTo: 'CPT Osei',    due: '22 Jun 2026', status: 'Pending',    category: 'Travel'      },
  { id: 'S4-T005', task: 'Sensitive item inventory — 30-day cycle',               priority: 'Critical', assignedTo: 'SFC Larkin',  due: '28 Jun 2026', status: 'Open',       category: 'Security'    },
  { id: 'S4-T006', task: 'Convoy request — range support 14 Jul live fire',       priority: 'Medium',   assignedTo: 'SPC Moore',   due: '30 Jun 2026', status: 'Open',       category: 'Transport'   },
  { id: 'S4-T007', task: 'LIW access account renewal — SSG Porter',              priority: 'Routine',  assignedTo: 'CPT Osei',    due: '30 Jun 2026', status: 'Pending',    category: 'Admin'       },
]

const S4_CLEARANCES = [
  { name: 'Osei, B.',    rank: 'CPT', clearance: 'SECRET', pr_date: '10 Feb 2022', pr_due: '10 Feb 2032', status: 'Current', flags: 'None' },
  { name: 'Larkin, J.',  rank: 'SFC', clearance: 'SECRET', pr_date: '15 Jul 2020', pr_due: '15 Jul 2030', status: 'Current', flags: 'None' },
  { name: 'Porter, D.',  rank: 'SSG', clearance: 'SECRET', pr_date: '22 Mar 2019', pr_due: '22 Mar 2029', status: 'Current', flags: 'None' },
  { name: 'Vasquez, L.', rank: 'SSG', clearance: 'SECRET', pr_date: '08 Nov 2023', pr_due: '08 Nov 2033', status: 'Current', flags: 'None' },
  { name: 'Grant, T.',   rank: 'SGT', clearance: 'SECRET', pr_date: '01 Apr 2021', pr_due: '01 Apr 2031', status: 'Current', flags: 'None' },
  { name: 'Moore, A.',   rank: 'SPC', clearance: 'SECRET', pr_date: '14 Aug 2024', pr_due: '14 Aug 2034', status: 'Current', flags: 'None' },
]

const S4_SENSITIVE_ITEMS = [
  { item: 'M4A1 Carbine',      nsn: '1005-01-231-0973', qty: 6, last_inv: '28 May 2026', status: 'Verified' },
  { item: 'M9 Pistol',         nsn: '1005-01-118-2640', qty: 3, last_inv: '28 May 2026', status: 'Verified' },
  { item: 'PRC-117G Radio',    nsn: '5820-01-443-7556', qty: 2, last_inv: '28 May 2026', status: 'Verified' },
  { item: 'AN/PVS-14 NVG',     nsn: '5855-01-432-0524', qty: 4, last_inv: '28 May 2026', status: 'Verified' },
  { item: 'SINCGARS Radio Set', nsn: '5820-01-267-9482', qty: 2, last_inv: '28 May 2026', status: 'Verified' },
]

const S4_BUDGET = [
  { program: 'Class I (Rations / Food)',  authorization: 18000, obligated: 12000, expended:  9000, fy: 'FY26 Q3' },
  { program: 'Class III(B) (Bulk POL)',   authorization: 22000, obligated:  8000, expended:  4000, fy: 'FY26 Q3' },
  { program: 'Class IV (Construction)',   authorization:  8000, obligated:  3500, expended:  2000, fy: 'FY26 Q3' },
  { program: 'Class IX (Repair Parts)',   authorization: 15000, obligated: 11000, expended:  8500, fy: 'FY26 Q3' },
  { program: 'TDY / Supply Travel (DTS)', authorization:  6000, obligated:  4200, expended:  2800, fy: 'FY26 Q3' },
]

const S4_TRAINING_REQS = [
  { soldier: 'CPT Osei, B.',    rank: 'CPT', requirement: 'Logistics CCC',                       dueDate: '31 Dec 2026', status: 'Pending',     notes: 'Nomination submitted to BN S3'              },
  { soldier: 'SFC Larkin, J.',  rank: 'SFC', requirement: '92A SLC',                             dueDate: '31 Dec 2026', status: 'Pending',     notes: 'School seat requested; pending allocation'   },
  { soldier: 'SSG Porter, D.',  rank: 'SSG', requirement: 'GCSS-Army Advanced Operator',         dueDate: '31 Aug 2026', status: 'In Progress', notes: 'Online CBT 40% complete — GCSS-A portal'     },
  { soldier: 'SSG Vasquez, L.', rank: 'SSG', requirement: 'Property Book Officer Course (DL)',   dueDate: '30 Sep 2026', status: 'Pending',     notes: 'Online — ALMS enrollment needed'             },
  { soldier: 'SGT Grant, T.',   rank: 'SGT', requirement: 'SAMS-E Operator Course',              dueDate: '01 Oct 2026', status: 'Pending',     notes: 'Coordinate with supporting unit for seat'    },
]

const S4_SUSPENSES = [
  { soldier: 'SSG Vasquez, L.', rank: 'SSG', item: 'Annual Hand Receipt Reconciliation (DA 2062)', dueDate: '30 Jun 2026', status: 'In Progress', poc: 'CPT Osei',  notes: 'Sub-hand receipt holders must sign NLT 28 Jun'  },
  { soldier: 'SFC Larkin, J.',  rank: 'SFC', item: '30-Day Sensitive Item Inventory',             dueDate: '28 Jun 2026', status: 'Pending',     poc: 'CPT Osei',  notes: 'Commander witness required; schedule ASAP'      },
  { soldier: 'SSG Porter, D.',  rank: 'SSG', item: 'Class III(B) Fuel Request — Aug Exercise',   dueDate: '01 Jul 2026', status: 'Pending',     poc: 'SFC Larkin',notes: 'Submit to BSB S4 NLT 01 Jul for Aug resupply'  },
  { soldier: 'CPT Osei, B.',    rank: 'CPT', item: 'DTS Voucher Closeout — MAJ Okafor May TDY', dueDate: '22 Jun 2026', status: 'Pending',     poc: 'SFC Larkin',notes: 'Authorization expired — voucher past due'       },
]

const S4_LR_CALENDAR = [
  { month: 'Jul 2026', event: 'Range support logistics — live-fire 14 Jul',  type: 'Operations', prepDue: '01 Jul 2026', owner: 'SFC Larkin'  },
  { month: 'Jul 2026', event: 'Annual property inventory cycle start',        type: 'Property',   prepDue: '01 Jul 2026', owner: 'SSG Vasquez' },
  { month: 'Aug 2026', event: 'JRTC rotation resupply planning',             type: 'Operations', prepDue: '15 Jul 2026', owner: 'CPT Osei'    },
  { month: 'Sep 2026', event: 'FY26 closeout — obligate remaining funds',    type: 'Budget',     prepDue: '01 Sep 2026', owner: 'CPT Osei'    },
  { month: 'Oct 2026', event: 'FY27 budget submission to higher',            type: 'Budget',     prepDue: '01 Sep 2026', owner: 'CPT Osei'    },
]

const S4_KEY_CONTACTS = [
  { org: 'BSB S4 / Forward Spt Co', poc: 'CPT Torres, R.',  role: 'FSC CDR',      phone: 'DSN 555-4001', lastContact: '16 Jun 2026' },
  { org: 'GCSS-Army Help Desk',     poc: 'GS-9 Murphy, K.', role: 'GCSS-A Admin', phone: 'DSN 555-8200', lastContact: '12 Jun 2026' },
  { org: 'LIW / FEDLOG Support',    poc: 'GS-7 Clark, P.',  role: 'LIW POC',      phone: 'DSN 555-6300', lastContact: '05 Jun 2026' },
  { org: 'Group G4 / Higher S4',    poc: 'MAJ Steele, H.',  role: 'Group S4',     phone: 'DSN 555-4500', lastContact: '15 Jun 2026' },
]

const S4_SYNC_LOG = [
  { date: '16 Jun 2026', meeting: 'S4 Shop Sync',        attendees: 'CPT Osei, SFC Larkin, SSG Vasquez', keyItems: 'Hand receipt reconciliation 85% done; SI inv due 28 Jun',    actionItems: 'SFC Larkin schedule CDR witness for SI inv NLT 20 Jun' },
  { date: '14 Jun 2026', meeting: 'Battle Staff Sync',   attendees: 'CPT Osei',                          keyItems: 'Live-fire logistics support confirmed; fuel request needed',  actionItems: 'SSG Porter draft fuel request to BSB NLT 01 Jul'       },
  { date: '10 Jun 2026', meeting: 'Higher S4 Sync (BSB)',attendees: 'CPT Osei, SFC Larkin',              keyItems: 'JRTC sustainment plan kick-off; FY26 Q4 budget update',       actionItems: 'CPT Osei draft JRTC sustainment plan NLT 15 Jul'       },
]

// ── S6 SOR connections ────────────────────────────────────────────────────────
const S6_SOR = [
  { label: 'WIN-T / JNN',  status: 'connected' as const },
  { label: 'SIPR / NIPR',  status: 'connected' as const },
  { label: 'EKMS / KIV-7', status: 'connected' as const },
  { label: 'SATCOM',       status: 'pending'   as const },
  { label: 'VOIP',         status: 'connected' as const },
]

const S6_ADM_TAB_ACTIONS: Record<string, Array<{ key: string; icon: string; label: string }>> = {
  'adm-people': [
    { key: 'roster',     icon: 'fa-address-book',    label: 'Roster'         },
    { key: 'counseling', icon: 'fa-file-alt',        label: 'Counseling'     },
    { key: 'in-proc',    icon: 'fa-sign-in-alt',     label: 'In-Processing'  },
    { key: 'out-proc',   icon: 'fa-sign-out-alt',    label: 'Out-Processing' },
    { key: 'awards',     icon: 'fa-medal',           label: 'Awards'         },
    { key: 'promotions', icon: 'fa-arrow-circle-up', label: 'Promotions'     },
    { key: 'leave',      icon: 'fa-calendar-check',  label: 'Leave'          },
  ],
  'adm-tasks': [
    { key: 'new-task',    icon: 'fa-plus',                 label: 'New Task'       },
    { key: 'help-desk',   icon: 'fa-headset',              label: 'Help Desk'      },
    { key: 'net-ticket',  icon: 'fa-network-wired',        label: 'Network Ticket' },
    { key: 'comsec-actn', icon: 'fa-lock',                 label: 'COMSEC Action'  },
    { key: 'priority',    icon: 'fa-exclamation-triangle', label: 'Priority'       },
    { key: 'completed',   icon: 'fa-check-double',         label: 'Completed'      },
  ],
  'adm-security': [
    { key: 'clearances', icon: 'fa-id-badge',      label: 'Clearances'   },
    { key: 'comsec-inv', icon: 'fa-lock',          label: 'COMSEC Inv.'  },
    { key: 'opsec',      icon: 'fa-eye-slash',     label: 'OPSEC'        },
    { key: 'access-log', icon: 'fa-file-contract', label: 'Access Log'   },
  ],
  'adm-operations': [
    { key: 'net-status', icon: 'fa-tachometer-alt',    label: 'Network Status' },
    { key: 'outage-log', icon: 'fa-exclamation-circle',label: 'Outage Log'     },
    { key: 'maintenance',icon: 'fa-wrench',             label: 'Maintenance'    },
    { key: 'freq-mgmt',  icon: 'fa-wifi',               label: 'Freq Mgmt'      },
  ],
  'adm-sustainment': [
    { key: 'dts-travel',  icon: 'fa-plane',          label: 'DTS / Travel'  },
    { key: 'gtcc',        icon: 'fa-credit-card',    label: 'GTCC'          },
    { key: 'comsec-equip',icon: 'fa-hdd',            label: 'COMSEC Equip'  },
    { key: 'signal-equip',icon: 'fa-server',         label: 'Signal Equip'  },
  ],
  'adm-plans': [
    { key: 'lr-calendar', icon: 'fa-calendar-alt',  label: 'LR Calendar'  },
    { key: 'comsec-plan', icon: 'fa-lock',          label: 'COMSEC Plan'  },
    { key: 'net-plan',    icon: 'fa-network-wired', label: 'Network Plan' },
    { key: 'annual-susp', icon: 'fa-redo',          label: 'Annual Susp.' },
  ],
  'adm-comms': [
    { key: 'contact-roster', icon: 'fa-address-book', label: 'Contact Roster' },
    { key: 'ext-contacts',   icon: 'fa-phone-alt',    label: 'Ext Contacts'   },
    { key: 'message-log',    icon: 'fa-envelope',     label: 'Message Log'    },
  ],
  'adm-training': [
    { key: 'requirements', icon: 'fa-chalkboard-teacher', label: 'Requirements'  },
    { key: 'comsec-trng',  icon: 'fa-lock',               label: 'COMSEC Trng'   },
    { key: 'net-certs',    icon: 'fa-certificate',        label: 'Network Certs' },
    { key: 'completed',    icon: 'fa-check-double',       label: 'Completed'     },
  ],
  'adm-resources': [
    { key: 'budget',      icon: 'fa-dollar-sign', label: 'Budget'          },
    { key: 'comsec-prop', icon: 'fa-lock',        label: 'COMSEC Property' },
    { key: 'net-equip',   icon: 'fa-server',      label: 'Network Equip'   },
  ],
  'adm-coord': [
    { key: 'coord-tracker', icon: 'fa-project-diagram', label: 'Coord Tracker' },
    { key: 'higher-s6',     icon: 'fa-level-up-alt',    label: 'Higher S6'     },
    { key: 'deconflict',    icon: 'fa-handshake',       label: 'Deconfliction' },
    { key: 'sync-log',      icon: 'fa-comments',        label: 'Sync Log'      },
  ],
}

const S6_PERSONNEL = [
  { id: '1', rank: 'CPT', name: 'Henson, E.',  mos: '255A', position: 'S6 / Signal Officer',  clearance: 'SECRET', medStatus: 'Green', ets: '2027-06-30' },
  { id: '2', rank: 'SFC', name: 'Marsh, K.',   mos: '25U',  position: 'S6 NCOIC',             clearance: 'SECRET', medStatus: 'Green', ets: '2026-09-30' },
  { id: '3', rank: 'SSG', name: 'Coleman, P.', mos: '25U',  position: 'COMSEC Custodian',     clearance: 'SECRET', medStatus: 'Amber', ets: '2028-03-31' },
  { id: '4', rank: 'SPC', name: 'Yoon, J.',    mos: '25N',  position: 'Network Admin NCO',    clearance: 'SECRET', medStatus: 'Green', ets: '2027-10-31' },
  { id: '5', rank: 'SGT', name: 'Bishop, R.',  mos: '25D',  position: 'Systems NCO',          clearance: 'SECRET', medStatus: 'Green', ets: '2026-12-31' },
]

const S6_TASKS = [
  { id: 'S6-T001', task: 'COMSEC semi-annual inventory — all CCI/keying material', priority: 'Critical', assignedTo: 'SSG Coleman', due: '30 Jun 2026', status: 'In Progress', category: 'COMSEC'    },
  { id: 'S6-T002', task: 'SATCOM modem firmware update — TROJAN Spirit II',        priority: 'High',     assignedTo: 'SPC Yoon',    due: '25 Jun 2026', status: 'Open',       category: 'Network'   },
  { id: 'S6-T003', task: 'Help desk — SIPR token renewal 8 users',                priority: 'High',     assignedTo: 'SGT Bishop',  due: '20 Jun 2026', status: 'In Progress', category: 'Help Desk' },
  { id: 'S6-T004', task: 'WIN-T equipment readiness report — monthly to S6',       priority: 'High',     assignedTo: 'SFC Marsh',   due: '25 Jun 2026', status: 'Open',       category: 'Readiness' },
  { id: 'S6-T005', task: 'Frequency assignment request — JRTC rotation Aug',       priority: 'Medium',   assignedTo: 'CPT Henson',  due: '15 Jul 2026', status: 'Open',       category: 'Spectrum'  },
  { id: 'S6-T006', task: 'New user NIPR accounts — 3 in-processing soldiers',      priority: 'Medium',   assignedTo: 'SPC Yoon',    due: '22 Jun 2026', status: 'Open',       category: 'Admin'     },
  { id: 'S6-T007', task: 'EKMS annual account audit — COMSEC custodian',          priority: 'Critical', assignedTo: 'SSG Coleman', due: '01 Jul 2026', status: 'Pending',    category: 'COMSEC'    },
]

const S6_CLEARANCES = [
  { name: 'Henson, E.',  rank: 'CPT', clearance: 'SECRET', pr_date: '02 Jun 2023', pr_due: '02 Jun 2033', status: 'Current', flags: 'None' },
  { name: 'Marsh, K.',   rank: 'SFC', clearance: 'SECRET', pr_date: '14 Jan 2021', pr_due: '14 Jan 2031', status: 'Current', flags: 'None' },
  { name: 'Coleman, P.', rank: 'SSG', clearance: 'SECRET', pr_date: '09 Apr 2022', pr_due: '09 Apr 2032', status: 'Current', flags: 'None' },
  { name: 'Yoon, J.',    rank: 'SPC', clearance: 'SECRET', pr_date: '25 Aug 2024', pr_due: '25 Aug 2034', status: 'Current', flags: 'None' },
  { name: 'Bishop, R.',  rank: 'SGT', clearance: 'SECRET', pr_date: '17 Mar 2020', pr_due: '17 Mar 2030', status: 'Current', flags: 'None' },
]

const S6_COMSEC = [
  { item: 'KIV-7HS (HAIPE encryptor)', account: 'EKMS-01', qty: 4, classification: 'CCI', last_inv: '15 Jan 2026', status: 'Current',   next_inv: '15 Jul 2026' },
  { item: 'KY-100M (tactical crypto)', account: 'EKMS-01', qty: 2, classification: 'CCI', last_inv: '15 Jan 2026', status: 'Current',   next_inv: '15 Jul 2026' },
  { item: 'KGV-72 fill device',        account: 'EKMS-01', qty: 6, classification: 'CCI', last_inv: '15 Jan 2026', status: 'Current',   next_inv: '15 Jul 2026' },
  { item: 'SINCGARS key fill — OOA',   account: 'EKMS-01', qty: 8, classification: 'CPI', last_inv: '15 Jan 2026', status: 'Audit Due', next_inv: '01 Jul 2026' },
]

const S6_BUDGET = [
  { program: 'Network / IT Infrastructure',   authorization: 18000, obligated: 12000, expended: 8000, fy: 'FY26 Q3' },
  { program: 'COMSEC Equipment Maintenance',  authorization:  6000, obligated:  4500, expended: 3200, fy: 'FY26 Q3' },
  { program: 'TDY / Training Travel (DTS)',   authorization:  5000, obligated:  2800, expended: 1900, fy: 'FY26 Q3' },
  { program: 'Consumables / Cabling / Parts', authorization:  3000, obligated:  1600, expended: 1200, fy: 'FY26 Q3' },
]

const S6_TRAINING_REQS = [
  { soldier: 'CPT Henson, E.',  rank: 'CPT', requirement: 'Signal CCC (Captains Career Course)',  dueDate: '31 Dec 2026', status: 'Pending',     notes: 'Nomination submitted; seat pending'           },
  { soldier: 'SFC Marsh, K.',   rank: 'SFC', requirement: '25U SLC',                              dueDate: '31 Dec 2026', status: 'Pending',     notes: 'Request submitted to BN S3'                   },
  { soldier: 'SSG Coleman, P.', rank: 'SSG', requirement: 'EKMS Custodian Recertification',       dueDate: '01 Aug 2026', status: 'In Progress', notes: 'Online module 70% complete — NSA portal'      },
  { soldier: 'SPC Yoon, J.',    rank: 'SPC', requirement: 'CompTIA Security+ / IAT Level II',     dueDate: '30 Sep 2026', status: 'In Progress', notes: 'Study materials issued; exam scheduled Aug'   },
  { soldier: 'SGT Bishop, R.',  rank: 'SGT', requirement: 'CCNA (Cisco Network Admin)',           dueDate: '01 Nov 2026', status: 'Pending',     notes: 'Coordinate with S6 NCOIC for exam voucher'   },
]

const S6_SUSPENSES = [
  { soldier: 'SSG Coleman, P.', rank: 'SSG', item: 'COMSEC Semi-Annual Inventory',              dueDate: '30 Jun 2026', status: 'In Progress', poc: 'CPT Henson', notes: 'CCI + CPI; CDR witness required'                   },
  { soldier: 'SSG Coleman, P.', rank: 'SSG', item: 'EKMS Annual Account Audit',                 dueDate: '01 Jul 2026', status: 'Pending',     poc: 'CPT Henson', notes: 'NSA/CSS Army audit package; submit to higher EKMS' },
  { soldier: 'SPC Yoon, J.',    rank: 'SPC', item: 'SATCOM Firmware Update — TROJAN Spirit II', dueDate: '25 Jun 2026', status: 'Open',        poc: 'SFC Marsh',  notes: 'Vendor patch; coordinate maintenance window'       },
  { soldier: 'CPT Henson, E.',  rank: 'CPT', item: 'JRTC Frequency Assignment Request',         dueDate: '15 Jul 2026', status: 'Pending',     poc: 'SFC Marsh',  notes: 'Submit to BDE S6 / J6 NLT 15 Jul for Aug rotation'},
]

const S6_LR_CALENDAR = [
  { month: 'Jul 2026', event: 'Frequency assignment request — JRTC rotation',      type: 'Spectrum',   prepDue: '15 Jul 2026', owner: 'CPT Henson'  },
  { month: 'Aug 2026', event: 'JRTC rotation — WIN-T / SATCOM deployment setup',  type: 'Operations', prepDue: '15 Jul 2026', owner: 'SFC Marsh'   },
  { month: 'Sep 2026', event: 'SPC Yoon Security+ exam',                           type: 'Training',   prepDue: '01 Aug 2026', owner: 'SPC Yoon'    },
  { month: 'Oct 2026', event: 'Annual COMSEC SOI / JCEOI renewal',                type: 'COMSEC',     prepDue: '01 Sep 2026', owner: 'SSG Coleman' },
  { month: 'Nov 2026', event: 'SGT Bishop CCNA certification target',              type: 'Training',   prepDue: '01 Oct 2026', owner: 'SGT Bishop'  },
]

const S6_KEY_CONTACTS = [
  { org: 'Higher S6 / Group G6', poc: 'MAJ Tran, L.',      role: 'Group S6',     phone: 'DSN 555-6001', lastContact: '16 Jun 2026' },
  { org: 'NSA/CSS Army (EKMS)', poc: 'GS-12 Holt, B.',     role: 'EKMS Manager', phone: 'DSN 555-9900', lastContact: '12 Jun 2026' },
  { org: 'BDE J6 / Spectrum Mgr',poc: 'CW3 Espinoza, R.', role: 'Spectrum Mgr', phone: 'DSN 555-6600', lastContact: '10 Jun 2026' },
  { org: 'CECOM Help Desk',       poc: 'Contractor Team',   role: 'Network Spt',  phone: 'DSN 555-8080', lastContact: '08 Jun 2026' },
]

const S6_SYNC_LOG = [
  { date: '17 Jun 2026', meeting: 'S6 Shop Sync',      attendees: 'CPT Henson, SFC Marsh, SSG Coleman', keyItems: 'COMSEC inv 60% done; SIPR tokens 5/8 complete; SATCOM patch pending', actionItems: 'SPC Yoon complete SATCOM update NLT 25 Jun'           },
  { date: '14 Jun 2026', meeting: 'Battle Staff Sync', attendees: 'CPT Henson',                         keyItems: 'Network status GREEN; VOIP 1 handset degraded; JRTC freq request due', actionItems: 'CPT Henson submit freq request to BDE J6 NLT 15 Jul' },
  { date: '10 Jun 2026', meeting: 'Higher S6 VTC',     attendees: 'CPT Henson, SFC Marsh',              keyItems: 'IAT Level II compliance — SPC Yoon 60 days; EKMS audit due 01 Jul',    actionItems: 'SSG Coleman finalize EKMS audit package NLT 25 Jun'  },
]

const S6_COORD_TRACKER = [
  { date: '15 Jun 2026', request: 'JRTC frequency assignment request',       requestingUnit: 'S3 OPS', poc: 'CPT Henson', status: 'In Progress', due: '15 Jul 2026', notes: 'Coord with BDE J6 / Spectrum; submit via AFCO'       },
  { date: '10 Jun 2026', request: 'SIPR token renewal — 8 users',           requestingUnit: 'S6 Self',poc: 'SGT Bishop',  status: 'In Progress', due: '20 Jun 2026', notes: '5 of 8 complete; 3 soldiers pending ID card update'  },
  { date: '05 Jun 2026', request: 'SATCOM firmware patch coordination',      requestingUnit: 'S6 Self',poc: 'SPC Yoon',    status: 'Open',        due: '25 Jun 2026', notes: 'Vendor patch released; maintenance window needed'     },
  { date: '01 Jun 2026', request: 'New NIPR accounts — 3 in-proc soldiers', requestingUnit: 'S1',    poc: 'SPC Yoon',    status: 'Completed',   due: '10 Jun 2026', notes: 'Accounts created and credentials issued'              },
]

// S4-specific sub-pages that have real content
const S4_BUILT_PAGES = new Set(['adm-sustainment', 'adm-maintenance', 'maintenance'])

// Precompute once at module level (static data, no render-time cost)
const ALL_NSNS = GCSS_EQUIPMENT.map(e => e.nsn)
const S4_PMCS  = computePmcsSchedule(ALL_NSNS)
const S4_STATS = getMaintStats(S4_PMCS, WORK_ORDERS)

const STATUS_PILL: Record<ConnStatus, { bg: string; border: string; color: string }> = {
  connected:    { bg: 'rgba(39,174,96,0.1)',  border: 'rgba(39,174,96,0.25)',  color: '#27ae60' },
  pending:      { bg: 'rgba(230,156,60,0.1)', border: 'rgba(230,156,60,0.25)', color: '#e69c3c' },
  disconnected: { bg: 'rgba(231,76,60,0.1)',  border: 'rgba(231,76,60,0.25)',  color: '#e74c3c' },
}

interface Props {
  section: string
  subPage?: string
  sectionKey?: string
  onNavigate?: (page: string) => void
}

export default function StaffSection({ section, subPage = 'overview', sectionKey, onNavigate }: Props) {
  const { data, loading, error } = useArmyData()
  const code = section.toUpperCase()
  const subLabel = SUB_PAGE_LABELS[subPage] ?? subPage

  // ── Admin sub-tab state (used by S2 admin pages) ──────────────────────────
  const [adminSubTab, setAdminSubTab] = useState('summary')
  const [prevSubPage, setPrevSubPage] = useState(subPage)
  if (prevSubPage !== subPage) {
    setPrevSubPage(subPage)
    setAdminSubTab('summary')
  }

  // ── S4: maintenance / sustainment sub-pages ────────────────────────────────
  if (code === 'S4' && S4_BUILT_PAGES.has(subPage)) {
    return (
      <div className={shared.page}>
        <div className={shared.header}>
          <h2><i className="fas fa-tools" /> S4 — Logistics · Maintenance &amp; Property</h2>
          <span className={shared.sub}>Source: GCSS-Army · APD TM Intervals · SAMS-E</span>
        </div>
        <MaintenanceView
          schedule={S4_PMCS}
          workOrders={WORK_ORDERS}
          stats={S4_STATS}
          contacts={MAINT_CONTACTS}
          showTmRef
        />
      </div>
    )
  }

  // ── S2: admin sub-pages ───────────────────────────────────────────────────
  if (code === 'S2' && subPage.startsWith('adm-')) {
    const s2Header = (
      <>
        <div className={shared.header}>
          <h2><i className="fas fa-binoculars" /> S2 — Intelligence</h2>
          <span className={shared.sub}>All-source analysis · collection management · CI/HUMINT support</span>
        </div>
        <div className={styles.sorBar}>
          <span className={styles.sorBarLabel}>Systems</span>
          {S2_SOR.map(c => (
            <div key={c.label} className={`${styles.sorPill} ${STATUS_CONN[c.status] ?? styles.sorPending}`}>
              <span className={styles.sorDot} />
              {c.label}
            </div>
          ))}
        </div>
      </>
    )

    const tabActions = S2_ADM_TAB_ACTIONS[subPage] ?? []

    const adminNav = (
      <div className={styles.adminNav}>
        <button
          className={`${styles.tabActionBtn} ${adminSubTab === 'summary' ? styles.tabActionActive : ''}`}
          onClick={() => setAdminSubTab('summary')}
        >
          <i className="fas fa-tachometer-alt" /> Summary
        </button>
        {tabActions.map(btn => (
          <button
            key={btn.key}
            className={`${styles.tabActionBtn} ${adminSubTab === btn.key ? styles.tabActionActive : ''}`}
            onClick={() => setAdminSubTab(btn.key)}
          >
            <i className={`fas ${btn.icon}`} /> {btn.label}
          </button>
        ))}
      </div>
    )

    const currentLabel = tabActions.find(t => t.key === adminSubTab)?.label ?? adminSubTab
    const subTabStub = (
      <div className={shared.card}>
        <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
          <i className="fas fa-tools" style={{ fontSize: 28, display: 'block', marginBottom: 12, color: '#333' }} />
          <strong style={{ color: '#ccc', display: 'block', marginBottom: 6 }}>{currentLabel}</strong>
          <span style={{ color: '#555', fontSize: 11 }}>Section under construction</span>
        </div>
      </div>
    )

    // ── A-0 People ──────────────────────────────────────────────────────────
    if (subPage === 'adm-people') {
      const prFlags = S2_CLEARANCES.filter(c => c.status !== 'Current').length
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {[
                  { label: 'Assigned',      value: String(S2_PERSONNEL.length), bg: '#2d2d2d'                                    },
                  { label: 'Gains 30-Day',  value: '—',                         bg: '#0e1e13'                                    },
                  { label: 'Losses 30-Day', value: '—',                         bg: '#1e0e0e'                                    },
                  { label: 'PR / Sec Flags',value: String(prFlags),             bg: prFlags > 0 ? STATUS_COLOR.Red : '#2d2d2d'  },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-address-book" /> S2 Section Roster (Source: THREADS · DISS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Rank</th><th>Name</th><th>MOS</th><th>Position</th><th>Clearance</th><th>Med</th><th>ETS</th></tr></thead>
                    <tbody>
                      {S2_PERSONNEL.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700 }}>{p.rank}</td>
                          <td>{p.name}</td>
                          <td style={{ fontSize: 10, color: '#666' }}>{p.mos}</td>
                          <td style={{ fontSize: 11 }}>{p.position}</td>
                          <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{p.clearance}</td>
                          <td>
                            <span className={shared.dot} style={{ background: STATUS_COLOR[p.medStatus] ?? '#555' }} />
                            {p.medStatus}
                          </td>
                          <td style={{ fontSize: 10, color: '#888' }}>{p.ets}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-1 Tasks ───────────────────────────────────────────────────────────
    if (subPage === 'adm-tasks') {
      const open      = S2_TASKS.filter(t => t.status === 'Open' || t.status === 'In Progress').length
      const critical  = S2_TASKS.filter(t => t.priority === 'Critical').length
      const inProg    = S2_TASKS.filter(t => t.status === 'In Progress').length
      const completed = S2_TASKS.filter(t => t.status === 'Completed').length
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {[
                  { label: 'Open',        value: String(open),      bg: '#2d2d2d'                                       },
                  { label: 'Critical',    value: String(critical),  bg: critical  > 0 ? STATUS_COLOR.Red   : '#2d2d2d' },
                  { label: 'In Progress', value: String(inProg),    bg: inProg    > 0 ? STATUS_COLOR.Amber : '#2d2d2d' },
                  { label: 'Completed',   value: String(completed), bg: completed > 0 ? STATUS_COLOR.Green : '#2d2d2d' },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-tasks" /> S2 Shop Task Board (Source: THREADS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>ID</th><th>Task</th><th>Category</th><th>Assigned</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead>
                    <tbody>
                      {S2_TASKS.map(t => {
                        const pColor = t.priority === 'Critical' ? '#e74c3c' : t.priority === 'High' ? '#e67e22' : '#888'
                        const sColor = t.status === 'Completed' ? '#27ae60' : t.status === 'In Progress' ? '#5a9adc' : t.status === 'Open' ? '#c9a227' : '#555'
                        return (
                          <tr key={t.id}>
                            <td style={{ fontSize: 10, color: '#444', fontFamily: 'monospace' }}>{t.id}</td>
                            <td style={{ fontSize: 11, maxWidth: 280 }}>{t.task}</td>
                            <td style={{ fontSize: 10, color: '#666' }}>{t.category}</td>
                            <td style={{ fontSize: 11, color: '#888' }}>{t.assignedTo}</td>
                            <td style={{ fontSize: 10, color: '#888' }}>{t.due}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: pColor + '22', color: pColor }}>{t.priority}</span></td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sColor + '22', color: sColor }}>{t.status}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-2 Security ────────────────────────────────────────────────────────
    if (subPage === 'adm-security') {
      const prIssues = S2_CLEARANCES.filter(c => c.status !== 'Current').length
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div style={{ padding: '7px 14px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 4, fontSize: 11, color: '#555', marginBottom: 12 }}>
                <i className="fas fa-info-circle" style={{ marginRight: 6, color: '#333' }} />
                <strong style={{ color: '#444' }}>Source: DISS · CI Referral Portal · OPSEC Standing Orders</strong>
                {' '}— Clearance data reflects DISS query as of 18 Jun 2026
              </div>
              <div className={shared.stats}>
                {[
                  { label: 'TS/SCI Cleared',     value: String(S2_CLEARANCES.length), bg: '#0e1e13'                                    },
                  { label: 'PR Issues',           value: String(prIssues),             bg: prIssues > 0 ? STATUS_COLOR.Red  : '#2d2d2d' },
                  { label: 'CI Referrals Active', value: '1',                          bg: STATUS_COLOR.Amber                            },
                  { label: 'Foreign Contacts',    value: '1',                          bg: '#2d2d2d'                                     },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card} style={{ marginBottom: 14 }}>
                <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Security Clearance Status (Source: DISS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Name</th><th>Rank</th><th>Clearance</th><th>PR Date</th><th>PR Due</th><th>Status</th><th>Action Required</th></tr></thead>
                    <tbody>
                      {S2_CLEARANCES.map((c, i) => {
                        const isOk   = c.status === 'Current'
                        const sColor = isOk ? '#27ae60' : c.status.includes('Overdue') ? '#e74c3c' : '#e67e22'
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{c.name}</td>
                            <td>{c.rank}</td>
                            <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{c.clearance}</td>
                            <td style={{ fontSize: 10, color: '#666' }}>{c.pr_date}</td>
                            <td style={{ fontSize: 10, color: isOk ? '#888' : sColor }}>{c.pr_due}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sColor + '22', color: sColor }}>{c.status}</span></td>
                            <td style={{ fontSize: 11, color: isOk ? '#555' : '#e74c3c' }}>{c.flags}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-file-contract" /> Recent Access Log (Source: DCGS-A · DISS · SIPRNET)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Date</th><th>Soldier</th><th>Rank</th><th>Action</th><th>System</th><th>Classification</th><th>Auth</th></tr></thead>
                    <tbody>
                      {S2_ACCESS_LOG.map((a, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 10, color: '#666' }}>{a.date}</td>
                          <td style={{ fontWeight: 600 }}>{a.soldier}</td>
                          <td>{a.rank}</td>
                          <td style={{ fontSize: 11, maxWidth: 240 }}>{a.action}</td>
                          <td style={{ fontSize: 10, color: '#888' }}>{a.system}</td>
                          <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{a.classification}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, color: '#27ae60' }}>{a.authorized}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-3 Operations ──────────────────────────────────────────────────────
    if (subPage === 'adm-operations') {
      const activePIRs  = S2_PIRS.filter(p => p.status === 'Active').length
      const overdueSusp = S2_SUSPENSES.filter(s => s.status === 'Overdue').length
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {[
                  { label: 'Active PIRs',       value: String(activePIRs),  bg: '#0e1e2e'                                         },
                  { label: 'Suspenses Overdue', value: String(overdueSusp), bg: overdueSusp > 0 ? STATUS_COLOR.Red : '#2d2d2d'    },
                  { label: 'Collection Gaps',   value: '1',                 bg: STATUS_COLOR.Amber                                 },
                  { label: 'Intel Products MTD',value: '4',                 bg: '#2d2d2d'                                          },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card} style={{ marginBottom: 14 }}>
                <div className={shared.cardHeader}><i className="fas fa-question-circle" /> Priority Intelligence Requirements (PIRs)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>ID</th><th>Requirement</th><th>Priority</th><th>Indicators</th><th>Status</th><th>Owner</th><th>Last Update</th></tr></thead>
                    <tbody>
                      {S2_PIRS.map((p, i) => {
                        const pColor = p.priority === 'Critical' ? '#e74c3c' : p.priority === 'High' ? '#e67e22' : '#888'
                        const sColor = p.status === 'Active' ? '#27ae60' : '#c9a227'
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 700, color: '#c9a227', fontSize: 11 }}>{p.id}</td>
                            <td style={{ fontSize: 11, maxWidth: 320 }}>{p.requirement}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: pColor + '22', color: pColor }}>{p.priority}</span></td>
                            <td style={{ textAlign: 'center', color: '#888', fontSize: 11 }}>{p.indicatorsCount}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sColor + '22', color: sColor }}>{p.status}</span></td>
                            <td style={{ fontSize: 11, color: '#666' }}>{p.owner}</td>
                            <td style={{ fontSize: 10, color: '#555' }}>{p.lastUpdate}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-bell" /> Admin Suspenses</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Soldier</th><th>Rank</th><th>Item</th><th>Due Date</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
                    <tbody>
                      {S2_SUSPENSES.map((s, i) => {
                        const sColor = s.status === 'Overdue' ? '#e74c3c' : s.status === 'Pending' ? '#c9a227' : '#27ae60'
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{s.soldier}</td>
                            <td>{s.rank}</td>
                            <td style={{ fontWeight: 700 }}>{s.item}</td>
                            <td style={{ fontSize: 10, color: '#888' }}>{s.dueDate}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sColor + '22', color: sColor }}>{s.status}</span></td>
                            <td style={{ fontSize: 11, color: '#666' }}>{s.poc}</td>
                            <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{s.notes}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-4 Sustainment ─────────────────────────────────────────────────────
    if (subPage === 'adm-sustainment') {
      const totalAuth = S2_BUDGET.reduce((sum, b) => sum + b.authorization, 0)
      const totalObl  = S2_BUDGET.reduce((sum, b) => sum + b.obligated,     0)
      const pctObl    = Math.round((totalObl / totalAuth) * 100)
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {[
                  { label: 'Budget Authorized', value: `$${(totalAuth / 1000).toFixed(0)}K`, bg: '#2d2d2d'                                      },
                  { label: 'Obligated',          value: `$${(totalObl  / 1000).toFixed(0)}K`, bg: '#2d2d2d'                                      },
                  { label: '% Obligated',        value: `${pctObl}%`,                          bg: pctObl > 80 ? STATUS_COLOR.Amber : '#2d2d2d'  },
                  { label: 'TDY Actions Open',   value: '1',                                   bg: '#2d2d2d'                                      },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Execution (Source: DTS · GCSS-Army)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Program</th><th>Authorized</th><th>Obligated</th><th>Expended</th><th>Remaining</th><th>FY</th></tr></thead>
                    <tbody>
                      {S2_BUDGET.map((b, i) => {
                        const remaining = b.authorization - b.obligated
                        const pct       = Math.round((b.obligated / b.authorization) * 100)
                        const pColor    = pct > 90 ? '#e74c3c' : pct > 70 ? '#e67e22' : '#27ae60'
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{b.program}</td>
                            <td style={{ color: '#888', fontSize: 11 }}>${b.authorization.toLocaleString()}</td>
                            <td style={{ color: pColor, fontWeight: 700 }}>${b.obligated.toLocaleString()} <span style={{ fontSize: 9 }}>({pct}%)</span></td>
                            <td style={{ color: '#888', fontSize: 11 }}>${b.expended.toLocaleString()}</td>
                            <td style={{ color: remaining < 500 ? '#e74c3c' : '#27ae60', fontWeight: 600 }}>${remaining.toLocaleString()}</td>
                            <td style={{ fontSize: 10, color: '#555' }}>{b.fy}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-5 Plans ───────────────────────────────────────────────────────────
    if (subPage === 'adm-plans') {
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {[
                  { label: 'LR Events',       value: String(S2_LR_CALENDAR.length),                                          bg: '#2d2d2d'        },
                  { label: 'Security Events', value: String(S2_LR_CALENDAR.filter(e => e.type === 'Security').length),       bg: STATUS_COLOR.Red },
                  { label: 'Training Events', value: String(S2_LR_CALENDAR.filter(e => e.type.includes('Training')).length), bg: '#2d2d2d'        },
                  { label: 'Intel Ops',       value: String(S2_LR_CALENDAR.filter(e => e.type === 'Intel Ops').length),      bg: '#0e1e2e'        },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Long-Range Calendar (Source: THREADS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Prep Due</th><th>Owner</th></tr></thead>
                    <tbody>
                      {S2_LR_CALENDAR.map((e, i) => {
                        const tColor = e.type === 'Security' ? '#e74c3c' : e.type === 'Intel Ops' ? '#5a9adc' : '#888'
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 700, color: '#c9a227' }}>{e.month}</td>
                            <td style={{ fontSize: 11 }}>{e.event}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: tColor + '22', color: tColor }}>{e.type}</span></td>
                            <td style={{ fontSize: 10, color: '#888' }}>{e.prepDue}</td>
                            <td style={{ fontSize: 11, color: '#666' }}>{e.owner}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-6 Comms ───────────────────────────────────────────────────────────
    if (subPage === 'adm-comms') {
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.card} style={{ marginBottom: 14 }}>
                <div className={shared.cardHeader}><i className="fas fa-users" /> Key Contacts (Source: THREADS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Org</th><th>POC</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
                    <tbody>
                      {S2_KEY_CONTACTS.map((c, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: '#ccc' }}>{c.org}</td>
                          <td>{c.poc}</td>
                          <td style={{ fontSize: 11, color: '#888' }}>{c.role}</td>
                          <td style={{ fontSize: 10, color: '#666' }}>{c.phone}</td>
                          <td style={{ fontSize: 10, color: '#555' }}>{c.lastContact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                    <tbody>
                      {S2_SYNC_LOG.map((s, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 10, color: '#666' }}>{s.date}</td>
                          <td style={{ fontWeight: 600 }}>{s.meeting}</td>
                          <td style={{ fontSize: 11, color: '#888' }}>{s.attendees}</td>
                          <td style={{ fontSize: 11, color: '#aaa', maxWidth: 240 }}>{s.keyItems}</td>
                          <td style={{ fontSize: 11, color: '#c9a227', maxWidth: 220 }}>{s.actionItems}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-7 Training ────────────────────────────────────────────────────────
    if (subPage === 'adm-training') {
      const inProg  = S2_TRAINING_REQS.filter(r => r.status === 'In Progress').length
      const pending = S2_TRAINING_REQS.filter(r => r.status === 'Pending').length
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {[
                  { label: 'Requirements', value: String(S2_TRAINING_REQS.length), bg: '#2d2d2d'                                      },
                  { label: 'In Progress',  value: String(inProg),                  bg: inProg  > 0 ? STATUS_COLOR.Amber : '#2d2d2d'  },
                  { label: 'Pending',      value: String(pending),                 bg: '#2d2d2d'                                      },
                  { label: 'Completed',    value: '0',                             bg: '#2d2d2d'                                      },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Training Requirements (Source: DTMS · THREADS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Soldier</th><th>Rank</th><th>Requirement</th><th>Due Date</th><th>Status</th><th>Notes</th></tr></thead>
                    <tbody>
                      {S2_TRAINING_REQS.map((r, i) => {
                        const sColor = r.status === 'Completed' ? '#27ae60' : r.status === 'In Progress' ? '#5a9adc' : '#c9a227'
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{r.soldier}</td>
                            <td>{r.rank}</td>
                            <td style={{ fontSize: 11 }}>{r.requirement}</td>
                            <td style={{ fontSize: 10, color: '#888' }}>{r.dueDate}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sColor + '22', color: sColor }}>{r.status}</span></td>
                            <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{r.notes}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-8 Resources ───────────────────────────────────────────────────────
    if (subPage === 'adm-resources') {
      const totalAuth2 = S2_BUDGET.reduce((sum, b) => sum + b.authorization, 0)
      const totalExp   = S2_BUDGET.reduce((sum, b) => sum + b.expended,     0)
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {[
                  { label: 'Total Authorized', value: `$${(totalAuth2 / 1000).toFixed(0)}K`, bg: '#2d2d2d'        },
                  { label: 'Expended',          value: `$${(totalExp   / 1000).toFixed(0)}K`, bg: '#2d2d2d'        },
                  { label: 'Budget Lines',      value: String(S2_BUDGET.length),               bg: '#2d2d2d'        },
                  { label: 'Open Requests',     value: '2',                                    bg: STATUS_COLOR.Amber },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card} style={{ marginBottom: 14 }}>
                <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Summary (Source: DTS · GCSS-Army)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Program</th><th>Authorized</th><th>Obligated</th><th>Expended</th><th>Remaining</th></tr></thead>
                    <tbody>
                      {S2_BUDGET.map((b, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{b.program}</td>
                          <td style={{ color: '#888', fontSize: 11 }}>${b.authorization.toLocaleString()}</td>
                          <td style={{ color: '#c9a227', fontWeight: 600 }}>${b.obligated.toLocaleString()}</td>
                          <td style={{ color: '#888', fontSize: 11 }}>${b.expended.toLocaleString()}</td>
                          <td style={{ color: '#27ae60', fontWeight: 600 }}>${(b.authorization - b.obligated).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-file-invoice" /> Resource Requests</div>
                <div className={shared.cardBody} style={{ padding: '32px 20px', textAlign: 'center', color: '#555', fontSize: 12 }}>
                  <i className="fas fa-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, color: '#333' }} />
                  No open resource requests at this time.
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── A-9 Coordinations ───────────────────────────────────────────────────
    if (subPage === 'adm-coord') {
      const openCoord = S2_COORD_TRACKER.filter(c => c.status !== 'Completed').length
      return (
        <div className={shared.page}>
          {s2Header}
          {adminNav}
          {adminSubTab === 'summary' && (
            <>
              <div className={shared.stats}>
                {[
                  { label: 'Open Coordinations', value: String(openCoord),                                                      bg: '#2d2d2d'        },
                  { label: 'Completed',           value: String(S2_COORD_TRACKER.filter(c => c.status === 'Completed').length), bg: STATUS_COLOR.Green },
                  { label: 'Key Contacts',        value: String(S2_KEY_CONTACTS.length),                                       bg: '#2d2d2d'         },
                  { label: 'Sync Meetings MTD',   value: String(S2_SYNC_LOG.length),                                           bg: '#2d2d2d'         },
                ].map(s => (
                  <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
                    <div className={shared.statValue}>{s.value}</div>
                    <div className={shared.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={shared.card} style={{ marginBottom: 14 }}>
                <div className={shared.cardHeader}><i className="fas fa-project-diagram" /> Coordination Tracker (Source: THREADS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Date</th><th>Request</th><th>Requesting Unit</th><th>POC</th><th>Status</th><th>Due</th><th>Notes</th></tr></thead>
                    <tbody>
                      {S2_COORD_TRACKER.map((c, i) => {
                        const sColor = c.status === 'Completed' ? '#27ae60' : c.status === 'In Progress' ? '#5a9adc' : '#c9a227'
                        return (
                          <tr key={i}>
                            <td style={{ fontSize: 10, color: '#666' }}>{c.date}</td>
                            <td style={{ fontSize: 11, maxWidth: 240 }}>{c.request}</td>
                            <td style={{ fontSize: 11, color: '#888' }}>{c.requestingUnit}</td>
                            <td style={{ fontSize: 11, color: '#666' }}>{c.poc}</td>
                            <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sColor + '22', color: sColor }}>{c.status}</span></td>
                            <td style={{ fontSize: 10, color: '#888' }}>{c.due}</td>
                            <td style={{ fontSize: 11, color: '#555', maxWidth: 200 }}>{c.notes}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={shared.card}>
                <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
                <div className={shared.tableWrap}>
                  <table className={shared.table}>
                    <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                    <tbody>
                      {S2_SYNC_LOG.map((s, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 10, color: '#666' }}>{s.date}</td>
                          <td style={{ fontWeight: 600 }}>{s.meeting}</td>
                          <td style={{ fontSize: 11, color: '#888' }}>{s.attendees}</td>
                          <td style={{ fontSize: 11, color: '#aaa', maxWidth: 240 }}>{s.keyItems}</td>
                          <td style={{ fontSize: 11, color: '#c9a227', maxWidth: 220 }}>{s.actionItems}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {adminSubTab !== 'summary' && subTabStub}
        </div>
      )
    }

    // ── Generic S2 adm-* fallthrough ─────────────────────────────────────────
    return (
      <div className={shared.page}>
        {s2Header}
        {adminNav}
        {adminSubTab === 'summary' && (
          <div className={shared.card}>
            <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
              <i className="fas fa-tools" style={{ fontSize: 28, display: 'block', marginBottom: 12, color: '#333' }} />
              <strong style={{ color: '#ccc', display: 'block', marginBottom: 6 }}>{subLabel}</strong>
              <span style={{ color: '#555', fontSize: 11 }}>Section under construction</span>
            </div>
          </div>
        )}
        {adminSubTab !== 'summary' && subTabStub}
      </div>
    )
  }

  // ── Shared admin page builder (S3 / S4 / S6) ─────────────────────────────
  const makeAdmHeader = (
    icon: string, title: string, sub: string,
    sor: Array<{ label: string; status: string }>,
  ) => (
    <>
      <div className={shared.header}>
        <h2><i className={`fas ${icon}`} /> {title}</h2>
        <span className={shared.sub}>{sub}</span>
      </div>
      <div className={styles.sorBar}>
        <span className={styles.sorBarLabel}>Systems</span>
        {sor.map(c => (
          <div key={c.label} className={`${styles.sorPill} ${STATUS_CONN[c.status] ?? styles.sorPending}`}>
            <span className={styles.sorDot} />{c.label}
          </div>
        ))}
      </div>
    </>
  )

  const makeAdmNav = (tabActions: Array<{ key: string; icon: string; label: string }>) => (
    <div className={styles.adminNav}>
      <button
        className={`${styles.tabActionBtn} ${adminSubTab === 'summary' ? styles.tabActionActive : ''}`}
        onClick={() => setAdminSubTab('summary')}
      ><i className="fas fa-tachometer-alt" /> Summary</button>
      {tabActions.map(btn => (
        <button key={btn.key}
          className={`${styles.tabActionBtn} ${adminSubTab === btn.key ? styles.tabActionActive : ''}`}
          onClick={() => setAdminSubTab(btn.key)}
        ><i className={`fas ${btn.icon}`} /> {btn.label}</button>
      ))}
    </div>
  )

  const makeStub = (label: string) => (
    <div className={shared.card}>
      <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
        <i className="fas fa-tools" style={{ fontSize: 28, display: 'block', marginBottom: 12, color: '#333' }} />
        <strong style={{ color: '#ccc', display: 'block', marginBottom: 6 }}>{label}</strong>
        <span style={{ color: '#555', fontSize: 11 }}>Section under construction</span>
      </div>
    </div>
  )

  const makeStats = (items: Array<{ label: string; value: string; bg: string }>) => (
    <div className={shared.stats}>
      {items.map(s => (
        <div key={s.label} className={shared.stat} style={{ background: s.bg }}>
          <div className={shared.statValue}>{s.value}</div>
          <div className={shared.statLabel}>{s.label}</div>
        </div>
      ))}
    </div>
  )

  // ── S3: admin sub-pages ───────────────────────────────────────────────────
  if (code === 'S3' && subPage.startsWith('adm-')) {
    const s3Hdr  = makeAdmHeader('fa-chess-knight', 'S3 — Operations', 'Operational planning · synchronization · battle rhythm · fires coordination', S3_SOR)
    const tabActs = S3_ADM_TAB_ACTIONS[subPage] ?? []
    const s3Nav  = makeAdmNav(tabActs)
    const s3Stub = makeStub(tabActs.find(t => t.key === adminSubTab)?.label ?? adminSubTab)

    if (subPage === 'adm-people') {
      const prFlags = S3_CLEARANCES.filter(c => c.status !== 'Current').length
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Assigned',       value: String(S3_PERSONNEL.length), bg: '#2d2d2d' },
              { label: 'Gains 30-Day',   value: '—',                         bg: '#0e1e13' },
              { label: 'Losses 30-Day',  value: '—',                         bg: '#1e0e0e' },
              { label: 'PR / Sec Flags', value: String(prFlags),             bg: prFlags > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-address-book" /> S3 Section Roster (Source: THREADS · DISS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Rank</th><th>Name</th><th>MOS</th><th>Position</th><th>Clearance</th><th>Med</th><th>ETS</th></tr></thead>
                <tbody>{S3_PERSONNEL.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.rank}</td><td>{p.name}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{p.mos}</td>
                    <td style={{ fontSize: 11 }}>{p.position}</td>
                    <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{p.clearance}</td>
                    <td><span className={shared.dot} style={{ background: STATUS_COLOR[p.medStatus] ?? '#555' }} />{p.medStatus}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{p.ets}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-tasks') {
      const open = S3_TASKS.filter(t => t.status === 'Open' || t.status === 'In Progress').length
      const crit = S3_TASKS.filter(t => t.priority === 'Critical').length
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Open',        value: String(open), bg: '#2d2d2d' },
              { label: 'Critical',    value: String(crit), bg: crit > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              { label: 'In Progress', value: String(S3_TASKS.filter(t => t.status === 'In Progress').length), bg: STATUS_COLOR.Amber },
              { label: 'Completed',   value: String(S3_TASKS.filter(t => t.status === 'Completed').length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-tasks" /> S3 Shop Task Board (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>ID</th><th>Task</th><th>Category</th><th>Assigned</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>{S3_TASKS.map(t => {
                  const pc = t.priority === 'Critical' ? '#e74c3c' : t.priority === 'High' ? '#e67e22' : '#888'
                  const sc = t.status === 'Completed' ? '#27ae60' : t.status === 'In Progress' ? '#5a9adc' : t.status === 'Open' ? '#c9a227' : '#555'
                  return (<tr key={t.id}>
                    <td style={{ fontSize: 10, color: '#444', fontFamily: 'monospace' }}>{t.id}</td>
                    <td style={{ fontSize: 11, maxWidth: 260 }}>{t.task}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{t.category}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{t.assignedTo}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{t.due}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: pc + '22', color: pc }}>{t.priority}</span></td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{t.status}</span></td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-security') {
      const prIssues = S3_CLEARANCES.filter(c => c.status !== 'Current').length
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'TS/SCI Cleared', value: String(S3_CLEARANCES.filter(c => c.clearance.includes('TS')).length), bg: '#0e1e13' },
              { label: 'PR Issues',      value: String(prIssues), bg: prIssues > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              { label: 'SECRET',         value: String(S3_CLEARANCES.filter(c => c.clearance === 'SECRET').length), bg: '#2d2d2d' },
              { label: 'OPSEC Reviews',  value: 'Current', bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Security Clearance Status (Source: DISS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Name</th><th>Rank</th><th>Clearance</th><th>PR Date</th><th>PR Due</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{S3_CLEARANCES.map((c, i) => {
                  const ok = c.status === 'Current'
                  const sc = ok ? '#27ae60' : c.status.includes('Due') ? '#e67e22' : '#e74c3c'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.rank}</td>
                    <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{c.clearance}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.pr_date}</td>
                    <td style={{ fontSize: 10, color: ok ? '#888' : sc }}>{c.pr_due}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{c.status}</span></td>
                    <td style={{ fontSize: 11, color: ok ? '#555' : '#e74c3c' }}>{c.flags}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-operations') {
      const overdue = S3_SUSPENSES.filter(s => s.status === 'Overdue').length
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Battle Rhythm Events', value: String(S3_BATTLE_RHYTHM.length), bg: '#2d2d2d' },
              { label: 'Suspenses Overdue',    value: String(overdue), bg: overdue > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              { label: 'Active OPORDs',        value: '1', bg: '#2d2d2d' },
              { label: 'Active FRAGOs',        value: '1', bg: STATUS_COLOR.Amber },
            ])}
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-drum" /> Battle Rhythm (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Event</th><th>Frequency</th><th>POC</th><th>Location</th><th>Format</th></tr></thead>
                <tbody>{S3_BATTLE_RHYTHM.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.event}</td>
                    <td style={{ fontSize: 10, color: '#c9a227' }}>{b.freq}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{b.poc}</td>
                    <td style={{ fontSize: 11, color: '#666' }}>{b.location}</td>
                    <td style={{ fontSize: 10, color: '#555' }}>{b.format}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-bell" /> Admin Suspenses</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Item</th><th>Due</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
                <tbody>{S3_SUSPENSES.map((s, i) => {
                  const sc = s.status === 'Overdue' ? '#e74c3c' : s.status === 'Pending' ? '#c9a227' : '#27ae60'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.soldier}</td>
                    <td style={{ fontWeight: 700 }}>{s.item}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{s.dueDate}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{s.status}</span></td>
                    <td style={{ fontSize: 11, color: '#666' }}>{s.poc}</td>
                    <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{s.notes}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-sustainment') {
      const tAuth = S3_BUDGET.reduce((s, b) => s + b.authorization, 0)
      const tObl  = S3_BUDGET.reduce((s, b) => s + b.obligated,     0)
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Authorized', value: `$${(tAuth/1000).toFixed(0)}K`, bg: '#2d2d2d' },
              { label: 'Obligated',  value: `$${(tObl/1000).toFixed(0)}K`,  bg: '#2d2d2d' },
              { label: '% Obligated',value: `${Math.round(tObl/tAuth*100)}%`, bg: '#2d2d2d' },
              { label: 'TDY Open',   value: '1', bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Execution (Source: DTS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Program</th><th>Authorized</th><th>Obligated</th><th>Expended</th><th>Remaining</th></tr></thead>
                <tbody>{S3_BUDGET.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.program}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.authorization.toLocaleString()}</td>
                    <td style={{ color: '#c9a227', fontWeight: 600 }}>${b.obligated.toLocaleString()}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.expended.toLocaleString()}</td>
                    <td style={{ color: '#27ae60', fontWeight: 600 }}>${(b.authorization - b.obligated).toLocaleString()}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-plans') {
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'LR Events',       value: String(S3_LR_CALENDAR.length), bg: '#2d2d2d' },
              { label: 'Security Events', value: String(S3_LR_CALENDAR.filter(e => e.type === 'Security').length), bg: STATUS_COLOR.Red },
              { label: 'Operations',      value: String(S3_LR_CALENDAR.filter(e => e.type === 'Operations').length), bg: '#0e1e2e' },
              { label: 'Training',        value: String(S3_LR_CALENDAR.filter(e => e.type === 'Training').length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Long-Range Calendar (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Prep Due</th><th>Owner</th></tr></thead>
                <tbody>{S3_LR_CALENDAR.map((e, i) => {
                  const tc = e.type === 'Security' ? '#e74c3c' : e.type === 'Operations' ? '#5a9adc' : '#888'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 700, color: '#c9a227' }}>{e.month}</td>
                    <td style={{ fontSize: 11 }}>{e.event}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: tc + '22', color: tc }}>{e.type}</span></td>
                    <td style={{ fontSize: 10, color: '#888' }}>{e.prepDue}</td>
                    <td style={{ fontSize: 11, color: '#666' }}>{e.owner}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-comms') {
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-users" /> Key Contacts (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Org</th><th>POC</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
                <tbody>{S3_KEY_CONTACTS.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#ccc' }}>{c.org}</td><td>{c.poc}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{c.role}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.phone}</td>
                    <td style={{ fontSize: 10, color: '#555' }}>{c.lastContact}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                <tbody>{S3_SYNC_LOG.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 10, color: '#666' }}>{s.date}</td>
                    <td style={{ fontWeight: 600 }}>{s.meeting}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{s.attendees}</td>
                    <td style={{ fontSize: 11, color: '#aaa', maxWidth: 240 }}>{s.keyItems}</td>
                    <td style={{ fontSize: 11, color: '#c9a227', maxWidth: 220 }}>{s.actionItems}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-training') {
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Requirements', value: String(S3_TRAINING_REQS.length), bg: '#2d2d2d' },
              { label: 'In Progress',  value: String(S3_TRAINING_REQS.filter(r => r.status === 'In Progress').length), bg: STATUS_COLOR.Amber },
              { label: 'Pending',      value: String(S3_TRAINING_REQS.filter(r => r.status === 'Pending').length), bg: '#2d2d2d' },
              { label: 'Completed',    value: '0', bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Training Requirements (Source: DTMS · THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Requirement</th><th>Due</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>{S3_TRAINING_REQS.map((r, i) => {
                  const sc = r.status === 'Completed' ? '#27ae60' : r.status === 'In Progress' ? '#5a9adc' : '#c9a227'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.soldier}</td><td>{r.rank}</td>
                    <td style={{ fontSize: 11 }}>{r.requirement}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{r.dueDate}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{r.status}</span></td>
                    <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{r.notes}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-resources') {
      const tAuth = S3_BUDGET.reduce((s, b) => s + b.authorization, 0)
      const tExp  = S3_BUDGET.reduce((s, b) => s + b.expended, 0)
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Total Authorized', value: `$${(tAuth/1000).toFixed(0)}K`, bg: '#2d2d2d' },
              { label: 'Expended',         value: `$${(tExp/1000).toFixed(0)}K`,  bg: '#2d2d2d' },
              { label: 'Budget Lines',     value: String(S3_BUDGET.length), bg: '#2d2d2d' },
              { label: 'Open Requests',    value: '1', bg: STATUS_COLOR.Amber },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Summary (Source: DTS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Program</th><th>Authorized</th><th>Obligated</th><th>Expended</th><th>Remaining</th></tr></thead>
                <tbody>{S3_BUDGET.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.program}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.authorization.toLocaleString()}</td>
                    <td style={{ color: '#c9a227', fontWeight: 600 }}>${b.obligated.toLocaleString()}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.expended.toLocaleString()}</td>
                    <td style={{ color: '#27ae60', fontWeight: 600 }}>${(b.authorization - b.obligated).toLocaleString()}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    if (subPage === 'adm-coord') {
      return (
        <div className={shared.page}>{s3Hdr}{s3Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Key Contacts',      value: String(S3_KEY_CONTACTS.length), bg: '#2d2d2d' },
              { label: 'Sync Meetings MTD', value: String(S3_SYNC_LOG.length),     bg: '#2d2d2d' },
              { label: 'Overdue Suspenses', value: String(S3_SUSPENSES.filter(s => s.status === 'Overdue').length), bg: STATUS_COLOR.Red },
              { label: 'Open Suspenses',    value: String(S3_SUSPENSES.filter(s => s.status === 'Pending').length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-users" /> Key Contacts (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Org</th><th>POC</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
                <tbody>{S3_KEY_CONTACTS.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#ccc' }}>{c.org}</td><td>{c.poc}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{c.role}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.phone}</td>
                    <td style={{ fontSize: 10, color: '#555' }}>{c.lastContact}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                <tbody>{S3_SYNC_LOG.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 10, color: '#666' }}>{s.date}</td>
                    <td style={{ fontWeight: 600 }}>{s.meeting}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{s.attendees}</td>
                    <td style={{ fontSize: 11, color: '#aaa', maxWidth: 240 }}>{s.keyItems}</td>
                    <td style={{ fontSize: 11, color: '#c9a227', maxWidth: 220 }}>{s.actionItems}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s3Stub}
        </div>
      )
    }

    // Generic S3 adm-* fallthrough
    return (
      <div className={shared.page}>{s3Hdr}{s3Nav}
        {adminSubTab === 'summary' && makeStub(subLabel)}
        {adminSubTab !== 'summary' && s3Stub}
      </div>
    )
  }

  // ── S4: admin sub-pages (non-maintenance) ─────────────────────────────────
  if (code === 'S4' && subPage.startsWith('adm-') && !S4_BUILT_PAGES.has(subPage)) {
    const s4Hdr  = makeAdmHeader('fa-boxes', 'S4 — Logistics', 'Supply operations · property accountability · transportation · maintenance management', S4_SOR)
    const tabActs = S4_ADM_TAB_ACTIONS[subPage] ?? []
    const s4Nav  = makeAdmNav(tabActs)
    const s4Stub = makeStub(tabActs.find(t => t.key === adminSubTab)?.label ?? adminSubTab)

    if (subPage === 'adm-people') {
      const prFlags = S4_CLEARANCES.filter(c => c.status !== 'Current').length
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Assigned',       value: String(S4_PERSONNEL.length), bg: '#2d2d2d' },
              { label: 'Gains 30-Day',   value: '—', bg: '#0e1e13' },
              { label: 'Losses 30-Day',  value: '—', bg: '#1e0e0e' },
              { label: 'PR / Sec Flags', value: String(prFlags), bg: prFlags > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-address-book" /> S4 Section Roster (Source: THREADS · DISS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Rank</th><th>Name</th><th>MOS</th><th>Position</th><th>Clearance</th><th>Med</th><th>ETS</th></tr></thead>
                <tbody>{S4_PERSONNEL.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.rank}</td><td>{p.name}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{p.mos}</td>
                    <td style={{ fontSize: 11 }}>{p.position}</td>
                    <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{p.clearance}</td>
                    <td><span className={shared.dot} style={{ background: STATUS_COLOR[p.medStatus] ?? '#555' }} />{p.medStatus}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{p.ets}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    if (subPage === 'adm-tasks') {
      const open = S4_TASKS.filter(t => t.status === 'Open' || t.status === 'In Progress').length
      const crit = S4_TASKS.filter(t => t.priority === 'Critical').length
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Open',        value: String(open), bg: '#2d2d2d' },
              { label: 'Critical',    value: String(crit), bg: crit > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              { label: 'In Progress', value: String(S4_TASKS.filter(t => t.status === 'In Progress').length), bg: STATUS_COLOR.Amber },
              { label: 'Completed',   value: String(S4_TASKS.filter(t => t.status === 'Completed').length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-tasks" /> S4 Shop Task Board (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>ID</th><th>Task</th><th>Category</th><th>Assigned</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>{S4_TASKS.map(t => {
                  const pc = t.priority === 'Critical' ? '#e74c3c' : t.priority === 'High' ? '#e67e22' : '#888'
                  const sc = t.status === 'Completed' ? '#27ae60' : t.status === 'In Progress' ? '#5a9adc' : t.status === 'Open' ? '#c9a227' : '#555'
                  return (<tr key={t.id}>
                    <td style={{ fontSize: 10, color: '#444', fontFamily: 'monospace' }}>{t.id}</td>
                    <td style={{ fontSize: 11, maxWidth: 260 }}>{t.task}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{t.category}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{t.assignedTo}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{t.due}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: pc + '22', color: pc }}>{t.priority}</span></td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{t.status}</span></td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    if (subPage === 'adm-security') {
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Cleared',         value: String(S4_CLEARANCES.length), bg: '#0e1e13' },
              { label: 'PR Issues',        value: '0', bg: '#2d2d2d' },
              { label: 'Sensitive Items',  value: String(S4_SENSITIVE_ITEMS.reduce((s, i) => s + i.qty, 0)), bg: '#2d2d2d' },
              { label: 'Last SI Inv',      value: '28 May 26', bg: '#2d2d2d' },
            ])}
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Security Clearance Status (Source: DISS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Name</th><th>Rank</th><th>Clearance</th><th>PR Date</th><th>PR Due</th><th>Status</th></tr></thead>
                <tbody>{S4_CLEARANCES.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.rank}</td>
                    <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{c.clearance}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.pr_date}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{c.pr_due}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#27ae6022', color: '#27ae60' }}>{c.status}</span></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-lock" /> Sensitive Item Register (Source: GCSS-Army · Hand Receipt)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Item</th><th>NSN</th><th>Qty</th><th>Last Inv</th><th>Status</th></tr></thead>
                <tbody>{S4_SENSITIVE_ITEMS.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.item}</td>
                    <td style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{s.nsn}</td>
                    <td style={{ textAlign: 'center', color: '#ccc' }}>{s.qty}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{s.last_inv}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#27ae6022', color: '#27ae60' }}>{s.status}</span></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    if (subPage === 'adm-operations') {
      const overdue = S4_SUSPENSES.filter(s => s.status === 'Overdue').length
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Suspenses Overdue', value: String(overdue), bg: overdue > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              { label: 'Open Suspenses',    value: String(S4_SUSPENSES.filter(s => s.status === 'Pending').length), bg: '#2d2d2d' },
              { label: 'Class Requests',    value: '1 Open', bg: STATUS_COLOR.Amber },
              { label: 'Convoy Reqs',       value: '1 Open', bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-bell" /> Logistics Suspenses (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Item</th><th>Due</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
                <tbody>{S4_SUSPENSES.map((s, i) => {
                  const sc = s.status === 'Overdue' ? '#e74c3c' : s.status === 'In Progress' ? '#5a9adc' : '#c9a227'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.soldier}</td>
                    <td style={{ fontWeight: 700 }}>{s.item}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{s.dueDate}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{s.status}</span></td>
                    <td style={{ fontSize: 11, color: '#666' }}>{s.poc}</td>
                    <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{s.notes}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    if (subPage === 'adm-plans') {
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'LR Events',     value: String(S4_LR_CALENDAR.length), bg: '#2d2d2d' },
              { label: 'Budget Events', value: String(S4_LR_CALENDAR.filter(e => e.type === 'Budget').length), bg: '#2d2d2d' },
              { label: 'Ops Events',    value: String(S4_LR_CALENDAR.filter(e => e.type === 'Operations').length), bg: '#0e1e2e' },
              { label: 'Property',      value: String(S4_LR_CALENDAR.filter(e => e.type === 'Property').length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Long-Range Calendar (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Prep Due</th><th>Owner</th></tr></thead>
                <tbody>{S4_LR_CALENDAR.map((e, i) => {
                  const tc = e.type === 'Budget' ? '#c9a227' : e.type === 'Operations' ? '#5a9adc' : '#888'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 700, color: '#c9a227' }}>{e.month}</td>
                    <td style={{ fontSize: 11 }}>{e.event}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: tc + '22', color: tc }}>{e.type}</span></td>
                    <td style={{ fontSize: 10, color: '#888' }}>{e.prepDue}</td>
                    <td style={{ fontSize: 11, color: '#666' }}>{e.owner}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    if (subPage === 'adm-comms') {
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-users" /> Key Contacts (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Org</th><th>POC</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
                <tbody>{S4_KEY_CONTACTS.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#ccc' }}>{c.org}</td><td>{c.poc}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{c.role}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.phone}</td>
                    <td style={{ fontSize: 10, color: '#555' }}>{c.lastContact}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                <tbody>{S4_SYNC_LOG.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 10, color: '#666' }}>{s.date}</td>
                    <td style={{ fontWeight: 600 }}>{s.meeting}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{s.attendees}</td>
                    <td style={{ fontSize: 11, color: '#aaa', maxWidth: 240 }}>{s.keyItems}</td>
                    <td style={{ fontSize: 11, color: '#c9a227', maxWidth: 220 }}>{s.actionItems}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    if (subPage === 'adm-training') {
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Requirements', value: String(S4_TRAINING_REQS.length), bg: '#2d2d2d' },
              { label: 'In Progress',  value: String(S4_TRAINING_REQS.filter(r => r.status === 'In Progress').length), bg: STATUS_COLOR.Amber },
              { label: 'Pending',      value: String(S4_TRAINING_REQS.filter(r => r.status === 'Pending').length), bg: '#2d2d2d' },
              { label: 'Completed',    value: '0', bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Training Requirements (Source: DTMS · THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Requirement</th><th>Due</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>{S4_TRAINING_REQS.map((r, i) => {
                  const sc = r.status === 'Completed' ? '#27ae60' : r.status === 'In Progress' ? '#5a9adc' : '#c9a227'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.soldier}</td><td>{r.rank}</td>
                    <td style={{ fontSize: 11 }}>{r.requirement}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{r.dueDate}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{r.status}</span></td>
                    <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{r.notes}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    if (subPage === 'adm-resources') {
      const tAuth = S4_BUDGET.reduce((s, b) => s + b.authorization, 0)
      const tExp  = S4_BUDGET.reduce((s, b) => s + b.expended, 0)
      const tObl  = S4_BUDGET.reduce((s, b) => s + b.obligated, 0)
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Total Authorized', value: `$${(tAuth/1000).toFixed(0)}K`, bg: '#2d2d2d' },
              { label: 'Obligated',        value: `$${(tObl/1000).toFixed(0)}K`,  bg: '#2d2d2d' },
              { label: 'Expended',         value: `$${(tExp/1000).toFixed(0)}K`,  bg: '#2d2d2d' },
              { label: 'Budget Lines',     value: String(S4_BUDGET.length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget by Class of Supply (Source: GCSS-Army · DTS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Program</th><th>Authorized</th><th>Obligated</th><th>Expended</th><th>Remaining</th></tr></thead>
                <tbody>{S4_BUDGET.map((b, i) => {
                  const pct = Math.round(b.obligated / b.authorization * 100)
                  const pc  = pct > 90 ? '#e74c3c' : pct > 70 ? '#e67e22' : '#27ae60'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.program}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.authorization.toLocaleString()}</td>
                    <td style={{ color: pc, fontWeight: 700 }}>${b.obligated.toLocaleString()} <span style={{ fontSize: 9 }}>({pct}%)</span></td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.expended.toLocaleString()}</td>
                    <td style={{ color: '#27ae60', fontWeight: 600 }}>${(b.authorization - b.obligated).toLocaleString()}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    if (subPage === 'adm-coord') {
      return (
        <div className={shared.page}>{s4Hdr}{s4Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Key Contacts',      value: String(S4_KEY_CONTACTS.length), bg: '#2d2d2d' },
              { label: 'Sync Meetings MTD', value: String(S4_SYNC_LOG.length), bg: '#2d2d2d' },
              { label: 'Susp. In Progress', value: String(S4_SUSPENSES.filter(s => s.status === 'In Progress').length), bg: STATUS_COLOR.Amber },
              { label: 'Susp. Pending',     value: String(S4_SUSPENSES.filter(s => s.status === 'Pending').length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-users" /> Key Contacts (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Org</th><th>POC</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
                <tbody>{S4_KEY_CONTACTS.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#ccc' }}>{c.org}</td><td>{c.poc}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{c.role}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.phone}</td>
                    <td style={{ fontSize: 10, color: '#555' }}>{c.lastContact}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                <tbody>{S4_SYNC_LOG.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 10, color: '#666' }}>{s.date}</td>
                    <td style={{ fontWeight: 600 }}>{s.meeting}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{s.attendees}</td>
                    <td style={{ fontSize: 11, color: '#aaa', maxWidth: 240 }}>{s.keyItems}</td>
                    <td style={{ fontSize: 11, color: '#c9a227', maxWidth: 220 }}>{s.actionItems}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s4Stub}
        </div>
      )
    }

    return (
      <div className={shared.page}>{s4Hdr}{s4Nav}
        {adminSubTab === 'summary' && makeStub(subLabel)}
        {adminSubTab !== 'summary' && s4Stub}
      </div>
    )
  }

  // ── S6: admin sub-pages ───────────────────────────────────────────────────
  if (code === 'S6' && subPage.startsWith('adm-')) {
    const s6Hdr  = makeAdmHeader('fa-satellite-dish', 'S6 — Communications', 'Network operations · COMSEC · systems management · spectrum management', S6_SOR)
    const tabActs = S6_ADM_TAB_ACTIONS[subPage] ?? []
    const s6Nav  = makeAdmNav(tabActs)
    const s6Stub = makeStub(tabActs.find(t => t.key === adminSubTab)?.label ?? adminSubTab)

    if (subPage === 'adm-people') {
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Assigned',       value: String(S6_PERSONNEL.length), bg: '#2d2d2d' },
              { label: 'Gains 30-Day',   value: '—', bg: '#0e1e13' },
              { label: 'Losses 30-Day',  value: '—', bg: '#1e0e0e' },
              { label: 'PR / Sec Flags', value: '0', bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-address-book" /> S6 Section Roster (Source: THREADS · DISS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Rank</th><th>Name</th><th>MOS</th><th>Position</th><th>Clearance</th><th>Med</th><th>ETS</th></tr></thead>
                <tbody>{S6_PERSONNEL.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.rank}</td><td>{p.name}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{p.mos}</td>
                    <td style={{ fontSize: 11 }}>{p.position}</td>
                    <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{p.clearance}</td>
                    <td><span className={shared.dot} style={{ background: STATUS_COLOR[p.medStatus] ?? '#555' }} />{p.medStatus}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{p.ets}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-tasks') {
      const open = S6_TASKS.filter(t => t.status === 'Open' || t.status === 'In Progress').length
      const crit = S6_TASKS.filter(t => t.priority === 'Critical').length
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Open',        value: String(open), bg: '#2d2d2d' },
              { label: 'Critical',    value: String(crit), bg: crit > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              { label: 'In Progress', value: String(S6_TASKS.filter(t => t.status === 'In Progress').length), bg: STATUS_COLOR.Amber },
              { label: 'Completed',   value: '0', bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-tasks" /> S6 Shop Task Board (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>ID</th><th>Task</th><th>Category</th><th>Assigned</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>{S6_TASKS.map(t => {
                  const pc = t.priority === 'Critical' ? '#e74c3c' : t.priority === 'High' ? '#e67e22' : '#888'
                  const sc = t.status === 'Completed' ? '#27ae60' : t.status === 'In Progress' ? '#5a9adc' : t.status === 'Open' ? '#c9a227' : '#555'
                  return (<tr key={t.id}>
                    <td style={{ fontSize: 10, color: '#444', fontFamily: 'monospace' }}>{t.id}</td>
                    <td style={{ fontSize: 11, maxWidth: 260 }}>{t.task}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{t.category}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{t.assignedTo}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{t.due}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: pc + '22', color: pc }}>{t.priority}</span></td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{t.status}</span></td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-security') {
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Cleared',           value: String(S6_CLEARANCES.length), bg: '#0e1e13' },
              { label: 'PR Issues',          value: '0', bg: '#2d2d2d' },
              { label: 'COMSEC Items',       value: String(S6_COMSEC.reduce((s, c) => s + c.qty, 0)), bg: '#2d2d2d' },
              { label: 'EKMS Audit Status',  value: 'Due 01 Jul', bg: STATUS_COLOR.Amber },
            ])}
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> Security Clearance Status (Source: DISS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Name</th><th>Rank</th><th>Clearance</th><th>PR Date</th><th>PR Due</th><th>Status</th></tr></thead>
                <tbody>{S6_CLEARANCES.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.rank}</td>
                    <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{c.clearance}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.pr_date}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{c.pr_due}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#27ae6022', color: '#27ae60' }}>{c.status}</span></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-lock" /> COMSEC / CCI Register (Source: EKMS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Item</th><th>EKMS Account</th><th>Qty</th><th>Class</th><th>Last Inv</th><th>Status</th><th>Next Inv</th></tr></thead>
                <tbody>{S6_COMSEC.map((c, i) => {
                  const sc = c.status === 'Audit Due' ? '#e67e22' : '#27ae60'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.item}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.account}</td>
                    <td style={{ textAlign: 'center', color: '#ccc' }}>{c.qty}</td>
                    <td style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{c.classification}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{c.last_inv}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{c.status}</span></td>
                    <td style={{ fontSize: 10, color: sc }}>{c.next_inv}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-operations') {
      const overdue = S6_SUSPENSES.filter(s => s.status === 'Overdue').length
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Network Status',    value: 'GREEN', bg: STATUS_COLOR.Green },
              { label: 'SATCOM Status',     value: 'Patch Pending', bg: STATUS_COLOR.Amber },
              { label: 'Suspenses Overdue', value: String(overdue), bg: overdue > 0 ? STATUS_COLOR.Red : '#2d2d2d' },
              { label: 'Open Tickets',      value: String(S6_TASKS.filter(t => t.status === 'Open' || t.status === 'In Progress').length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-bell" /> Network / Comms Suspenses (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Item</th><th>Due</th><th>Status</th><th>POC</th><th>Notes</th></tr></thead>
                <tbody>{S6_SUSPENSES.map((s, i) => {
                  const sc = s.status === 'Overdue' ? '#e74c3c' : s.status === 'In Progress' ? '#5a9adc' : '#c9a227'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.soldier}</td>
                    <td style={{ fontWeight: 700 }}>{s.item}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{s.dueDate}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{s.status}</span></td>
                    <td style={{ fontSize: 11, color: '#666' }}>{s.poc}</td>
                    <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{s.notes}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-sustainment') {
      const tAuth = S6_BUDGET.reduce((s, b) => s + b.authorization, 0)
      const tObl  = S6_BUDGET.reduce((s, b) => s + b.obligated, 0)
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Authorized', value: `$${(tAuth/1000).toFixed(0)}K`, bg: '#2d2d2d' },
              { label: 'Obligated',  value: `$${(tObl/1000).toFixed(0)}K`,  bg: '#2d2d2d' },
              { label: '% Obligated',value: `${Math.round(tObl/tAuth*100)}%`, bg: '#2d2d2d' },
              { label: 'COMSEC Equip Items', value: String(S6_COMSEC.reduce((s, c) => s + c.qty, 0)), bg: '#2d2d2d' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Execution (Source: DTS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Program</th><th>Authorized</th><th>Obligated</th><th>Expended</th><th>Remaining</th></tr></thead>
                <tbody>{S6_BUDGET.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.program}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.authorization.toLocaleString()}</td>
                    <td style={{ color: '#c9a227', fontWeight: 600 }}>${b.obligated.toLocaleString()}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.expended.toLocaleString()}</td>
                    <td style={{ color: '#27ae60', fontWeight: 600 }}>${(b.authorization - b.obligated).toLocaleString()}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-plans') {
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'LR Events',     value: String(S6_LR_CALENDAR.length), bg: '#2d2d2d' },
              { label: 'COMSEC Events', value: String(S6_LR_CALENDAR.filter(e => e.type === 'COMSEC').length), bg: STATUS_COLOR.Amber },
              { label: 'Training',      value: String(S6_LR_CALENDAR.filter(e => e.type === 'Training').length), bg: '#2d2d2d' },
              { label: 'Operations',    value: String(S6_LR_CALENDAR.filter(e => e.type === 'Operations').length), bg: '#0e1e2e' },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-calendar-alt" /> Long-Range Calendar (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Month</th><th>Event</th><th>Type</th><th>Prep Due</th><th>Owner</th></tr></thead>
                <tbody>{S6_LR_CALENDAR.map((e, i) => {
                  const tc = e.type === 'COMSEC' ? '#e67e22' : e.type === 'Operations' ? '#5a9adc' : '#888'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 700, color: '#c9a227' }}>{e.month}</td>
                    <td style={{ fontSize: 11 }}>{e.event}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: tc + '22', color: tc }}>{e.type}</span></td>
                    <td style={{ fontSize: 10, color: '#888' }}>{e.prepDue}</td>
                    <td style={{ fontSize: 11, color: '#666' }}>{e.owner}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-comms') {
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-users" /> Key Contacts (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Org</th><th>POC</th><th>Role</th><th>Phone</th><th>Last Contact</th></tr></thead>
                <tbody>{S6_KEY_CONTACTS.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#ccc' }}>{c.org}</td><td>{c.poc}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{c.role}</td>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.phone}</td>
                    <td style={{ fontSize: 10, color: '#555' }}>{c.lastContact}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                <tbody>{S6_SYNC_LOG.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 10, color: '#666' }}>{s.date}</td>
                    <td style={{ fontWeight: 600 }}>{s.meeting}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{s.attendees}</td>
                    <td style={{ fontSize: 11, color: '#aaa', maxWidth: 240 }}>{s.keyItems}</td>
                    <td style={{ fontSize: 11, color: '#c9a227', maxWidth: 220 }}>{s.actionItems}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-training') {
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Requirements', value: String(S6_TRAINING_REQS.length), bg: '#2d2d2d' },
              { label: 'In Progress',  value: String(S6_TRAINING_REQS.filter(r => r.status === 'In Progress').length), bg: STATUS_COLOR.Amber },
              { label: 'Pending',      value: String(S6_TRAINING_REQS.filter(r => r.status === 'Pending').length), bg: '#2d2d2d' },
              { label: 'IAT Compliance',value: 'SPC Yoon 90d', bg: STATUS_COLOR.Amber },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-chalkboard-teacher" /> Training Requirements (Source: DTMS · THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Soldier</th><th>Rank</th><th>Requirement</th><th>Due</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>{S6_TRAINING_REQS.map((r, i) => {
                  const sc = r.status === 'Completed' ? '#27ae60' : r.status === 'In Progress' ? '#5a9adc' : '#c9a227'
                  return (<tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.soldier}</td><td>{r.rank}</td>
                    <td style={{ fontSize: 11 }}>{r.requirement}</td>
                    <td style={{ fontSize: 10, color: '#888' }}>{r.dueDate}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{r.status}</span></td>
                    <td style={{ fontSize: 11, color: '#555', maxWidth: 220 }}>{r.notes}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-resources') {
      const tAuth = S6_BUDGET.reduce((s, b) => s + b.authorization, 0)
      const tExp  = S6_BUDGET.reduce((s, b) => s + b.expended, 0)
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Total Authorized', value: `$${(tAuth/1000).toFixed(0)}K`, bg: '#2d2d2d' },
              { label: 'Expended',         value: `$${(tExp/1000).toFixed(0)}K`,  bg: '#2d2d2d' },
              { label: 'Budget Lines',     value: String(S6_BUDGET.length), bg: '#2d2d2d' },
              { label: 'Open Requests',    value: '1', bg: STATUS_COLOR.Amber },
            ])}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-dollar-sign" /> Budget Summary (Source: DTS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Program</th><th>Authorized</th><th>Obligated</th><th>Expended</th><th>Remaining</th></tr></thead>
                <tbody>{S6_BUDGET.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.program}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.authorization.toLocaleString()}</td>
                    <td style={{ color: '#c9a227', fontWeight: 600 }}>${b.obligated.toLocaleString()}</td>
                    <td style={{ color: '#888', fontSize: 11 }}>${b.expended.toLocaleString()}</td>
                    <td style={{ color: '#27ae60', fontWeight: 600 }}>${(b.authorization - b.obligated).toLocaleString()}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    if (subPage === 'adm-coord') {
      return (
        <div className={shared.page}>{s6Hdr}{s6Nav}
          {adminSubTab === 'summary' && (<>
            {makeStats([
              { label: 'Open Coordinations', value: String(S6_COORD_TRACKER.filter(c => c.status !== 'Completed').length), bg: '#2d2d2d' },
              { label: 'Completed',           value: String(S6_COORD_TRACKER.filter(c => c.status === 'Completed').length), bg: STATUS_COLOR.Green },
              { label: 'Key Contacts',        value: String(S6_KEY_CONTACTS.length), bg: '#2d2d2d' },
              { label: 'Sync Meetings MTD',   value: String(S6_SYNC_LOG.length), bg: '#2d2d2d' },
            ])}
            <div className={shared.card} style={{ marginBottom: 14 }}>
              <div className={shared.cardHeader}><i className="fas fa-project-diagram" /> Coordination Tracker (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Date</th><th>Request</th><th>Requesting Unit</th><th>POC</th><th>Status</th><th>Due</th><th>Notes</th></tr></thead>
                <tbody>{S6_COORD_TRACKER.map((c, i) => {
                  const sc = c.status === 'Completed' ? '#27ae60' : c.status === 'In Progress' ? '#5a9adc' : '#c9a227'
                  return (<tr key={i}>
                    <td style={{ fontSize: 10, color: '#666' }}>{c.date}</td>
                    <td style={{ fontSize: 11, maxWidth: 200 }}>{c.request}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{c.requestingUnit}</td>
                    <td style={{ fontSize: 11, color: '#666' }}>{c.poc}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: sc + '22', color: sc }}>{c.status}</span></td>
                    <td style={{ fontSize: 10, color: '#888' }}>{c.due}</td>
                    <td style={{ fontSize: 11, color: '#555', maxWidth: 200 }}>{c.notes}</td>
                  </tr>)
                })}</tbody>
              </table></div>
            </div>
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-comments" /> Sync Log (Source: THREADS)</div>
              <div className={shared.tableWrap}><table className={shared.table}>
                <thead><tr><th>Date</th><th>Meeting</th><th>Attendees</th><th>Key Items</th><th>Action Items</th></tr></thead>
                <tbody>{S6_SYNC_LOG.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 10, color: '#666' }}>{s.date}</td>
                    <td style={{ fontWeight: 600 }}>{s.meeting}</td>
                    <td style={{ fontSize: 11, color: '#888' }}>{s.attendees}</td>
                    <td style={{ fontSize: 11, color: '#aaa', maxWidth: 240 }}>{s.keyItems}</td>
                    <td style={{ fontSize: 11, color: '#c9a227', maxWidth: 220 }}>{s.actionItems}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </>)}
          {adminSubTab !== 'summary' && s6Stub}
        </div>
      )
    }

    return (
      <div className={shared.page}>{s6Hdr}{s6Nav}
        {adminSubTab === 'summary' && makeStub(subLabel)}
        {adminSubTab !== 'summary' && s6Stub}
      </div>
    )
  }

  // ── Non-overview placeholder ───────────────────────────────────────────────
  if (subPage !== 'overview') {
    const assignedCount = data ? Object.entries(data.soldiers).filter(([, s]) => String(s.section).toUpperCase() === code).length : 0
    return (
      <div className={shared.page}>
        <div className={shared.header}>
          <h2><i className={`fas ${SECTION_ICONS[code] ?? 'fa-folder-open'}`} /> {code} — {SECTION_NAMES[code] ?? 'Staff Section'} · {subLabel}</h2>
          <span className={shared.sub}>{assignedCount} assigned</span>
        </div>
        <div className={shared.card}>
          <div className={shared.cardBody} style={{ padding: '48px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
            <i className="fas fa-tools" style={{ fontSize: 28, display: 'block', marginBottom: 12, color: '#ddd' }} />
            <strong style={{ color: '#1a1a1a', display: 'block', marginBottom: 6 }}>{subLabel}</strong>
            Page under construction — {code} {subLabel}
          </div>
        </div>
      </div>
    )
  }

  // ── Rich overview if config exists ─────────────────────────────────────────
  const cfg = SECTION_CONFIG[code]
  if (cfg) {
    return (
      <div className={shared.page}>
        {/* Header */}
        <div className={shared.header}>
          <h2><i className={`fas ${cfg.icon}`} /> {code} — {SECTION_NAMES[code]}</h2>
          <span className={shared.sub}>{code} Section · Coordinating Staff</span>
        </div>

        {/* System connections bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 5,
          padding: '10px 14px', marginBottom: 14,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#444', marginRight: 4 }}>
            Data Sources
          </span>
          {cfg.systems.map(s => {
            const pill = STATUS_PILL[s.status]
            return (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: 3,
                background: pill.bg, border: `1px solid ${pill.border}`, color: pill.color,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0, display: 'inline-block' }} />
                {s.label}
              </div>
            )
          })}
          <span style={{ marginLeft: 'auto', fontSize: 9, color: '#2a2a2a', fontStyle: 'italic' }}>
            Pending SOR integration
          </span>
        </div>

        {/* Nav cards */}
        {sectionKey && onNavigate && (
          <div className={shared.navCards} style={{ marginBottom: 20 }}>
            {EXTERNAL_NAV.map(item => (
              <button
                key={item.key}
                className={shared.navCard}
                onClick={() => onNavigate(`${sectionKey}-${item.key}`)}
              >
                <i className={`fas ${item.icon}`} />
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Charter */}
        <div className={shared.card} style={{ marginBottom: 14 }}>
          <div className={shared.cardHeader}><i className="fas fa-info-circle" /> {code} Section Charter</div>
          <div className={shared.cardBody}>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.65, margin: 0 }}>{cfg.charter}</p>
          </div>
        </div>

        {/* Two-column: responsibilities + positions/connections */}
        <div className={shared.grid2}>
          {/* Key Responsibilities */}
          <div className={shared.card}>
            <div className={shared.cardHeader}><i className="fas fa-clipboard-list" /> Key Responsibilities</div>
            <div className={shared.cardBody}>
              {cfg.responsibilities.map((r, i) => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0',
                  borderBottom: i < cfg.responsibilities.length - 1 ? '1px solid #1a1a1a' : 'none',
                }}>
                  <i className={`fas ${r.icon}`} style={{ color: '#555', fontSize: 12, marginTop: 2, width: 14, textAlign: 'center', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Typical Positions */}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-id-badge" /> {code} Section Positions</div>
              <div className={shared.cardBody}>
                {cfg.positions.map(p => (
                  <div key={p.position} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 0', borderBottom: '1px solid #1a1a1a',
                  }}>
                    <span style={{ fontSize: 11, color: '#555' }}>{p.position}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.5px',
                      padding: '2px 6px', borderRadius: 3, fontFamily: 'monospace',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid #1e1e1e', color: '#444',
                    }}>{p.mos}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Connections */}
            <div className={shared.card}>
              <div className={shared.cardHeader}><i className="fas fa-link" /> System Connections</div>
              <div className={shared.cardBody}>
                {cfg.systems.map(s => {
                  const pill = STATUS_PILL[s.status]
                  return (
                    <div key={s.label} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 0', borderBottom: '1px solid #1a1a1a',
                    }}>
                      <span style={{ fontSize: 11, color: '#555' }}>
                        {s.label}
                        {s.note && <span style={{ fontSize: 10, color: '#2a2a2a', marginLeft: 6 }}>— {s.note}</span>}
                      </span>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: 3,
                        background: pill.bg, border: `1px solid ${pill.border}`, color: pill.color,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {s.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Fallback overview (for section codes without config) ──────────────────
  const list = data ? Object.entries(data.soldiers).filter(([, s]) => String(s.section).toUpperCase() === code) : []
  const medReady = list.filter(([, s]) => s.medical?.status === 'Green').length

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <h2><i className="fas fa-users" /> {code} — {SECTION_NAMES[code] ?? 'Staff Section'}</h2>
        {data && <span className={shared.sub}>{list.length} assigned · {medReady} medically ready</span>}
        {code === 'S4' && sectionKey && onNavigate && (
          <button
            onClick={() => onNavigate(`${sectionKey}-adm-sustainment`)}
            style={{ marginLeft:'auto', padding:'5px 14px', fontSize:11, fontWeight:700, borderRadius:3, cursor:'pointer',
              background:'rgba(201,162,39,0.1)', border:'1px solid rgba(201,162,39,0.3)', color:'#c9a227' }}
          >
            <i className="fas fa-tools" style={{ marginRight:6 }} />Maintenance &amp; Property Book
          </button>
        )}
      </div>

      {sectionKey && onNavigate && (
        <div className={shared.navCards}>
          {EXTERNAL_NAV.map(item => (
            <button
              key={item.key}
              className={shared.navCard}
              onClick={() => onNavigate(`${sectionKey}-${item.key}`)}
            >
              <i className={`fas ${item.icon}`} />
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className={shared.card}>
        <div className={shared.cardHeader}><i className="fas fa-list" /> Section Roster</div>
        {loading && <div className={shared.empty}>Loading…</div>}
        {error && <div className={shared.empty} style={{ color: '#e74c3c' }}>No live data — connect backend to populate roster.</div>}
        {data && list.length === 0 && <div className={shared.empty}>No soldiers currently assigned to {code}.</div>}
        {data && list.length > 0 && (
          <table className={shared.table}>
            <thead>
              <tr><th>Name</th><th>Rank</th><th>Position</th><th>MOS</th><th>Med</th><th>ACFT</th></tr>
            </thead>
            <tbody>
              {list.map(([slug, s]) => (
                <tr key={slug}>
                  <td>{s.name}</td>
                  <td>{s.rank}</td>
                  <td>{s.position}</td>
                  <td>{s.mos}</td>
                  <td><span className={shared.dot} style={{ background: STATUS_COLOR[String(s.medical?.status)] ?? '#555' }} />{String(s.medical?.status ?? '—')}</td>
                  <td>{String(s.acft?.score ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
