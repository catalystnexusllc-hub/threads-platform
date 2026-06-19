# THREADS — Coordinating Staff Data Pipeline
# 5th Special Forces Group (Airborne) · Fort Campbell, KY
# Document Type: ETL / Data Input Pipeline Reference
# Last Updated: 18 Jun 2026

================================================================================
PIPELINE ARCHITECTURE OVERVIEW
================================================================================

Layer 1 — EXTERNAL SOR (seed/datasets/external-sor/)
  Real Army systems of record. In production, these are live API pulls.
  In demo/dev, they are static JSON extracts simulating those feeds.
  Location: seed/datasets/external-sor/

Layer 2 — INTERNAL SEED (seed/datasets/internal/)
  THREADS-native data with no external SOR equivalent.
  Covers workflow tracking, battle rhythm, operational content,
  command decisions, and nomination pipelines.
  Location: seed/datasets/internal/

Layer 3 — APP DATA ADAPTER (web/src/pages/army/pages/S*/s*SeedData.ts)
  TypeScript adapter layer that imports from seed files, applies
  computed fields (daysUntil, tigFromPEBD, etsFlag, etc.), and
  exports typed arrays consumed by each page component.

Layer 4 — THREADS UI (web/src/pages/army/pages/S*/S*Page.tsx)
  React page components that render the data into tables, dashboards,
  trackers, and report views. Each table cell maps to a typed field
  from the adapter layer.

Data Flow:
  [SOR / Internal Dataset]
      → seed/datasets/external-sor/ or internal/
      → s*SeedData.ts (import + type mapping + derived fields)
      → S*Page.tsx (rendered tables, stats, trackers)


================================================================================
S1 — PERSONNEL
================================================================================

SECTION PURPOSE: Personnel management, administrative readiness, pay, leave,
awards, promotions, in/out-processing, retention, casualty operations.

--------------------------------------------------------------------------------
TABLE: Personnel Roster / Dashboard
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A (Integrated Personnel & Pay System — Army)
Adapter         : s1SeedData.ts → IPPSA_SOLDIERS (IppsaRow[])
UI Location     : S1Page → Dashboard tab → Personnel Summary table
                  S1Page → Trackers tab → ETS/DEROS table

Fields Mapped:
  edipi            → row key / detail modal trigger
  rank             → Rank column
  lastName         → Name column (lastName, firstName initial)
  firstName        → Name column
  gradeCode        → grade badge
  mos              → MOS column
  positionTitle    → Position column
  section          → Section column / filter
  pebd             → TIG calculation (tigFromPEBD helper)
  ets              → ETS Date column; daysUntil() → Days Out; etsFlag() → color
  bah              → Pay detail modal
  bas              → Pay detail modal
  sdap             → Pay detail modal (Special Duty Assignment Pay)
  sglv             → Admin suspense flag input
  tspPct           → Pay detail modal
  allotments[]     → Pay detail modal allotment table
  payIssues[]      → Source for ADMIN_SUSPENSES entries (DD93/SGLV/PRR flags)

Computed Fields:
  daysOut          → daysUntil(ets) — drives 30/60/90-day ETS flag colors
  tigDisplay       → tigFromPEBD(pebd) — time in grade display string

--------------------------------------------------------------------------------
TABLE: Medical Readiness
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - MEDPROS.json
Source System   : MEDPROS (Medical Protection System)
Adapter         : s1SeedData.ts → MEDPROS_SOLDIERS (MedprosRow[])
                  getMedStatus(dodid) lookup function
UI Location     : S1Page → Dashboard → Med column (status dot)
                  S1Page → Dashboard → stats bar (Med Ready / Med Flags counts)
                  S1Page → detail modal → Medical section

Fields Mapped:
  dodid            → join key to IPPSA_SOLDIERS on edipi
  medStatus        → Green/Amber/Red dot; drives dashStats counts
  mrcClass         → detail modal
  dental           → detail modal
  dentalDate       → detail modal
  immunizations    → detail modal
  lastPHA          → detail modal
  phaDue           → detail modal
  pulhes           → detail modal
  deployable       → deployability flag
  deployRestriction → restriction note in detail modal

--------------------------------------------------------------------------------
TABLE: Army Fitness Test (AFT) Scores
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - DTMS.json
                  external-sor/5sfg-j4-dtms-acft-bulk-etl.json (batch ETL)
Source System   : DTMS (Digital Training Management System)
Adapter         : s1SeedData.ts → DTMS_SOLDIERS (DtmsRow[])
                  getDtmsRecord(dodid) lookup function
UI Location     : S1Page → Dashboard → AFT column
                  S1Page → detail modal → Training section

Fields Mapped:
  dodid            → join key to IPPSA_SOLDIERS on edipi
  aftDate          → AFT Date in detail modal
  aftStatus        → Pass/Fail/Exempt — color-coded in AFT column
  aftScore         → numeric score in AFT column
  cftDate          → CFT Date in detail modal
  cftGrade         → GO/NO-GO in detail modal

--------------------------------------------------------------------------------
TABLE: Security Clearances
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - DISS.json
Source System   : DISS (Defense Information System for Security)
Adapter         : s1SeedData.ts → DISS_SUBJECTS (DissRow[])
UI Location     : S1Page → adm-security tab → Clearances sub-tab

Fields Mapped:
  edipi              → join key
  eligibilityLevel   → TS/SCI / SECRET / CONFIDENTIAL badge
  eligibilityStatus  → Eligible / Suspended / Revoked
  investigationType  → Tier 5 PR / Initial etc.
  adjudicationDate   → last adjudication date
  prDueDate          → Periodic Reinvestigation due date
  prStatus           → Current / OVERDUE / EXPIRING SOON — flag color
  polygraph          → polygraph type and date
  indocDate          → indoctrination date
  derogInfo          → derogatory flag (true/false)

--------------------------------------------------------------------------------
TABLE: Admin Suspenses Tracker (DD93 / SGLV / PRR)
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j1-admin-bulk-seed.json
                  (flags derived from IPPS-A payIssues[] and DISS prStatus)
Source System   : THREADS internal (aggregates flags from IPPS-A + DISS)
Adapter         : s1SeedData.ts → ADMIN_SUSPENSES (AdminSuspenseRow[])
UI Location     : S1Page → Trackers tab → Admin Suspenses Tracker table

Fields Mapped:
  soldier          → Soldier column
  rank             → Rank column
  section          → Section column
  item             → DD93 / SGLV / PRR badge
  dueDate          → Due Date column
  status           → Current / Overdue / Pending — color badge
  poc              → POC column
  notes            → Notes column (free text)

Note: DD93 and SGLV overdue flags originate from IPPS-A payIssues[].
      PRR overdue flags originate from DISS prStatus.
      The tracking workflow (POC assignment, resolution notes) is
      THREADS-native with no SOR equivalent.

--------------------------------------------------------------------------------
TABLE: Awards & Decorations Pipeline
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j8-awards-bulk-seed.json (nominations)
                  external-sor/5th SFG - iPERMS.json (approved/submitted)
Source System   : iPERMS (submitted record) + THREADS internal (nominations)
Adapter         : s1SeedData.ts → AWARDS_PIPELINE (AwardRow[])
UI Location     : S1Page → Awards page (all sub-tabs: PCS, ETS, Merit, etc.)

Fields Mapped:
  soldier        → Soldier column
  rank           → Rank column
  section        → Section column
  award          → Award type badge (AAM, ARCOM, MSM, BSM, LOM etc.)
  type           → 'submitted' (iPERMS) or 'nominated' (THREADS) source tag
  category       → PCS / ETS / Retirement / Deployment / Training / Merit
  actionPeriod   → Period of service covered
  submitted      → Submission date (drives SLA clock)
  dueDate        → Required completion date
  status         → Submitted / Under Review / OVERDUE / Nomination Pending
  actionOfficer  → Assigned S1 clerk

Computed Fields:
  daysSince(submitted) → days elapsed since submission
  getSla(award)        → SLA threshold in days per award tier
  slaClass()           → ok / warn / over — drives SLA color badge

--------------------------------------------------------------------------------
TABLE: DTS Travel Authorizations
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - DTS.json
Source System   : DTS (Defense Travel System)
Adapter         : s1SeedData.ts → DTS_TRAVEL (DtsRow[])
UI Location     : S1Page → adm-sustainment → DTS Travel sub-tab

Fields Mapped:
  authNumber       → Authorization number
  travelerName     → Traveler column
  rank             → Rank column
  section          → Section column
  purpose          → Purpose column
  departure        → Departure date
  returnDate       → Return date
  destination      → Destination column
  estimatedCost    → Est. Cost column
  voucherStatus    → Voucher Status badge

--------------------------------------------------------------------------------
TABLE: GTCC (Government Travel Charge Card)
--------------------------------------------------------------------------------
Source System   : GTCC / APC (Agency Program Coordinator) system
Adapter         : s1SeedData.ts (inline in SustainmentPage component)
UI Location     : S1Page → adm-sustainment → GTCC Admin + GTCC Travel sub-tabs

Fields Mapped:
  soldier          → Cardholder
  last4            → Card last 4 digits
  status           → Active / Suspended / Cancelled
  missionCritical  → Mission-critical designation flag
  creditLimit      → Credit limit
  balance          → Current balance
  ao               → Authorizing Official
  apc              → Agency Program Coordinator
  trainingDate     → GTCC training completion date
  trainingExpiry   → Training expiry date
  souDate          → Statement of Understanding date
  delinquent       → Delinquency flag (true/false)

--------------------------------------------------------------------------------
TABLE: Property Book / OCIE
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - GCSS-Army.json
Source System   : GCSS-Army (Global Combat Support System — Army)
Adapter         : s1SeedData.ts → GCSS_EQUIPMENT (GcssRow[])
UI Location     : S1Page → adm-sustainment → Property Book sub-tab
                  S1Page → adm-sustainment → OCIE sub-tab

Fields Mapped (GCSS-Army):
  lineId           → Line ID
  lin              → LIN (Line Item Number)
  nsn              → NSN (National Stock Number)
  nomenclature     → Equipment name
  qtyAuthorized    → Auth qty
  qtyOnHand        → On-hand qty
  qtyShortfall     → Computed: Auth − On-Hand
  condition        → FMC / NMC / Mixed condition string
  lastInventory    → Last inventory date
  readinessFlag    → Green / Amber / Red
  notes            → Requisition notes / EDD

--------------------------------------------------------------------------------
TABLE: Unit Manning Report (UMR)
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - FMSWeb MTOE.json
Source System   : FMSWeb (Force Management System Web)
Adapter         : not yet wired — pending implementation
UI Location     : S1Page → Reports tab → Unit Manning Report

Fields Required:
  paraLine         → Position identifier from MTOE
  grade            → Required grade
  mos              → Required MOS
  title            → Position title
  filled           → True/False — joined against IPPSA_SOLDIERS by paraLine
  assignedName     → From IPPS-A Full Roster (firstName + lastName)
  fillStatus       → Filled / Vacant / Over-grade (computed)

Note: This is a JOIN between FMSWeb (authorized positions) and IPPS-A
      (assigned soldiers). Neither file alone produces the UMR — both
      sources must be resolved together per paraLine.

--------------------------------------------------------------------------------
TABLE: Leave Tracker
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A (DA Form 31 digital leave processing)
Adapter         : not yet wired — pending implementation
UI Location     : S1Page → Trackers tab → Leave Tracker table

Fields Required (from soldier.leave in Full Roster):
  soldier.lastName + firstName   → Soldier column
  soldier.rank                   → Rank column
  leave.approvedLeave[].type     → Annual / Emergency / PTDY / R&R
  leave.approvedLeave[].startDate → Start Date column
  leave.approvedLeave[].endDate   → End Date column
  leave.approvedLeave[].days      → Days column
  leave.approvedLeave[].status    → Approved / Pending / In Progress
  leave.approvedLeave[].approvedBy → Approver column
  leave.balance                   → Balance sidebar / stat card
  leave.useOrLose                 → Use-or-Lose flag
  leave.useOrLoseDays             → Days at risk
  leave.useOrLoseDate             → Cutoff date

Note: Leave data is embedded in the IPPSA Full Roster per soldier. The
      leave.approvedLeave[] array contains DA Form 31 records. No separate
      leave system dataset is needed — IPPS-A is the system of record.


================================================================================
S2 — INTELLIGENCE
================================================================================

SECTION PURPOSE: Intelligence analysis, collection management, counterintelligence,
security management, threat products, HUMINT coordination.

--------------------------------------------------------------------------------
TABLE: S2 Staff Roster
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A
Adapter         : filter IPPSA_SOLDIERS where section === 'S2'
UI Location     : StaffSection → S2 overview → Section Roster table

Fields Mapped: (same as S1 Personnel Roster — filtered by section)
  name, rank, position, mos, medical.status, acft.score

--------------------------------------------------------------------------------
TABLE: Security Clearance Tracker
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - DISS.json
Source System   : DISS
Adapter         : DISS_SUBJECTS filtered to S2 section
UI Location     : S2 page → Security sub-page

Fields Mapped: (same as S1 security clearances above)
  eligibilityLevel, prDueDate, prStatus, polygraph, derogInfo

--------------------------------------------------------------------------------
TABLE: Security Training Certifications
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - STEPP.json
Source System   : STEPP (Security Training, Education, Professionalization Portal)
Adapter         : pending implementation
UI Location     : S2 page → Training sub-page

Fields Required:
  dodid              → join key
  courseTitle        → Course name
  completionDate     → Completion date
  expirationDate     → Expiration / renewal date
  certificationLevel → CI Awareness / OPSEC / SERE Level
  status             → Current / Expiring / Overdue

--------------------------------------------------------------------------------
TABLE: S2 Operational Content (intel products, collection)
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j2-intel-staff-seed.json
Source System   : THREADS internal (classified S2 systems out of scope)
Adapter         : pending implementation
UI Location     : S2 page → operational sub-pages

Note: Threat products, collection requirements, and PIR/CCIR content are
      THREADS-native. No unclassified SOR owns this data.


================================================================================
S3 — OPERATIONS
================================================================================

SECTION PURPOSE: Operations planning, training management, battle rhythm,
task organization, METL development, exercise coordination.

--------------------------------------------------------------------------------
TABLE: S3 Staff Roster
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A
Adapter         : filter where section === 'S3'
UI Location     : StaffSection → S3 overview

Fields Mapped: name, rank, position, mos, med status, AFT score

--------------------------------------------------------------------------------
TABLE: Battle Rhythm
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j3-battle-rhythm.json
Source System   : THREADS internal (Army 365/Outlook as optional calendar sync)
Adapter         : pending implementation
UI Location     : S3 page → Battle Rhythm sub-page / Home → Battle Rhythm tile

Fields Required:
  eventName        → Meeting / event title
  frequency        → Daily / Weekly / Monthly / As Required
  dayOfWeek        → Day (Mon, Tue, etc.)
  time             → Start time (local / Zulu)
  location         → Room / VTC / SCIF
  chairperson      → Lead / OPR
  participants     → Attendees by section
  purpose          → Brief description
  products         → Required inputs / outputs

Note: THREADS owns the battle rhythm schedule. Army 365 (Outlook) can sync
      calendar events in but is not the system of record.

--------------------------------------------------------------------------------
TABLE: Unit Training Schedule / METL
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - DTMS.json
                  external-sor/5sfg-j7-dtms-acft-full-etl.json
Source System   : DTMS (Digital Training Management System)
Adapter         : pending implementation
UI Location     : S1Page → adm-training → Requirements / METL sub-tabs
                  S3 page → Training sub-page

Fields Required:
  unitName         → Training unit
  taskNumber       → METL task number (e.g. SH-TGF-01)
  taskTitle        → Task title
  proficiencyLevel → T / P / U — Trained / Practiced / Untrained
  lastTrainedDate  → Date last evaluated
  nextTrainingDate → Scheduled training date
  resourcesRequired → Range / ammo / equipment needed

--------------------------------------------------------------------------------
TABLE: Operations Staff Content
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j3-ops-staff-seed.json
Source System   : THREADS internal
Adapter         : pending implementation
UI Location     : S3 page → operational sub-pages

Note: Orders, frag orders, task status, and operational tracking are
      THREADS-native. No unclassified SOR maps to this content.

--------------------------------------------------------------------------------
TABLE: Transportation Requests
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - TMT.json
Source System   : TMT (Transportation Motor Transport system)
Adapter         : pending implementation
UI Location     : S3 page → Resources sub-page / S4 coordination

Fields Required:
  requestNumber    → TMT request number
  requester        → Requesting unit / person
  missionDate      → Date of movement
  origin           → Pickup location
  destination      → Drop-off location
  vehicleType      → Type of vehicle required
  paxCount         → Number of personnel
  cargoDescription → Cargo description
  status           → Requested / Approved / Complete


================================================================================
S4 — LOGISTICS
================================================================================

SECTION PURPOSE: Supply, maintenance, property accountability, transportation
coordination, logistics planning, GCSS-Army management.

--------------------------------------------------------------------------------
TABLE: Equipment Readiness / Property Book
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - GCSS-Army.json
Source System   : GCSS-Army
Adapter         : s1SeedData.ts → GCSS_EQUIPMENT (also used in S1 sustainment)
UI Location     : S4 page → Maintenance & Property Book
                  StaffSection → S4 → Maintenance & Property link

Fields Mapped: (same as S1 Property Book above)
  lin, nsn, nomenclature, qtyAuthorized, qtyOnHand, condition,
  lastInventory, readinessFlag, notes

--------------------------------------------------------------------------------
TABLE: PMCS Maintenance Schedule
--------------------------------------------------------------------------------
Source File     : Computed from GCSS-Army NSNs against shared TM interval table
Source System   : SAMS-E / GCSS-Army (DA Pam 750-8 intervals)
Adapter         : shared/pmcsSeedData.ts → computePmcsSchedule(nsns)
UI Location     : StaffSection → S4 → adm-sustainment → Maintenance sub-tab
                  S1Page → adm-sustainment → Maintenance sub-tab

Fields Mapped:
  nsn              → Equipment NSN (join key)
  nomenclature     → Equipment name
  tmRef            → TM reference (e.g. TM 9-1005-319-10)
  interval         → PMCS interval (Daily / Weekly / Monthly / Semi-Annual / Annual)
  lastCompleted    → Date last PMCS performed
  nextDue          → Computed next due date
  status           → Current / Due Soon / Overdue
  assignedOperator → Operator / crew chief responsible

--------------------------------------------------------------------------------
TABLE: MTOE Authorizations
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - FMSWeb MTOE.json
Source System   : FMSWeb
Adapter         : pending implementation
UI Location     : S4 page → Resources sub-page / UMR in S1

Fields Required: (same as S1 UMR above)
  paraLine, grade, mos, title, filled, equipmentLin, equipmentNsn,
  qtyAuthorized, qtyOnHand, shortfall

--------------------------------------------------------------------------------
TABLE: TDY / Travel
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - DTS.json
Source System   : DTS
Adapter         : s1SeedData.ts → DTS_TRAVEL
UI Location     : S4 page → Logistics coordination / S1 adm-sustainment


================================================================================
S5 — PLANS
================================================================================

SECTION PURPOSE: Long-range planning, campaign planning, foreign disclosure,
civil-military operations planning, concept development.

--------------------------------------------------------------------------------
TABLE: S5 Staff Roster
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A
Adapter         : filter where section === 'S5'
UI Location     : StaffSection → S5 overview

Fields Mapped: name, rank, position, mos, med status, AFT score

--------------------------------------------------------------------------------
TABLE: Plans Content / Long-Range Calendar
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j5-plans-staff-seed.json
Source System   : THREADS internal
Adapter         : pending implementation
UI Location     : S5 page → Plans sub-pages

Note: Campaign planning, concept development, and foreign disclosure
      content are THREADS-native. No unclassified SOR covers this.


================================================================================
S6 — COMMUNICATIONS
================================================================================

SECTION PURPOSE: Network operations, signal equipment management, comms
security (COMSEC), Army 365 administration, AUP compliance, cyber hygiene.

--------------------------------------------------------------------------------
TABLE: S6 Staff Roster
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A
Adapter         : filter where section === 'S6'
UI Location     : StaffSection → S6 overview

Fields Mapped: name, rank, position, mos, med status, AFT score

--------------------------------------------------------------------------------
TABLE: AUP / Cyber Training Compliance
--------------------------------------------------------------------------------
Source File     : external-sor/5sfg-j6-aup-cyber-bulk-etl.json
Source System   : ATCTS (Army Training Certification Tracking System) / JKO
Adapter         : pending implementation
UI Location     : S6 page → Security / Training sub-page

Fields Required:
  dodid              → join key
  courseTitle        → Course name (e.g. "Cyber Awareness Challenge 2026")
  completionDate     → Completion date
  expirationDate     → Annual renewal due date
  status             → Current / Expiring / OVERDUE
  certificationLevel → IAT Level I / II / III (DoD 8570/8140)

--------------------------------------------------------------------------------
TABLE: Signal Equipment / Comms Gear
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - GCSS-Army.json
Source System   : GCSS-Army (property book for comms equipment)
Adapter         : filter GCSS_EQUIPMENT where category === 'communications'
UI Location     : S6 page → Comms & Equipment sub-page

Fields Mapped: lin, nsn, nomenclature, qtyAuthorized, qtyOnHand,
               readinessFlag, condition, notes

--------------------------------------------------------------------------------
TABLE: Network Status / Army 365
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j6-signal-staff-seed.json
Source System   : THREADS internal (Army 365 as optional data source)
Adapter         : pending implementation
UI Location     : S6 page → Dashboard sub-page

Note: Network uptime, VPN tunnel status, and COMSEC inventory are
      THREADS-native operational data. Army 365 (Outlook/Teams) can
      provide directory and calendar data as an optional sync source.


================================================================================
S7 — TRAINING
================================================================================

SECTION PURPOSE: Training management, DTMS administration, course scheduling,
AFT/CFT coordination, METL assessment, school quota management.

--------------------------------------------------------------------------------
TABLE: S7 Staff Roster
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A
Adapter         : filter where section === 'S7'
UI Location     : StaffSection → S7 overview

Fields Mapped: name, rank, position, mos, med status, AFT score

--------------------------------------------------------------------------------
TABLE: Unit-Wide AFT / CFT Results
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - DTMS.json
                  external-sor/5sfg-j7-dtms-acft-full-etl.json
Source System   : DTMS
Adapter         : s1SeedData.ts → DTMS_SOLDIERS (currently 13 BN Staff soldiers)
                  Pending: expand to full 318-soldier roster from Full ETL file
UI Location     : S1Page → Dashboard → AFT column
                  S7 page → Training Dashboard

Fields Mapped: dodid, aftDate, aftStatus, aftScore, cftDate, cftGrade

--------------------------------------------------------------------------------
TABLE: JKO Course Completions
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - JKO.json
Source System   : JKO (Joint Knowledge Online)
Adapter         : pending implementation
UI Location     : S7 page → Training sub-page → Online Courses tab

Fields Required:
  dodid              → join key
  courseTitle        → JKO course name
  courseNumber       → JKO course number (e.g. J3OP-US1329)
  completionDate     → Completion date
  expirationDate     → Renewal required date
  creditHours        → Credit hours awarded
  status             → Complete / Incomplete / Expired

--------------------------------------------------------------------------------
TABLE: ATRRS School Seats / Course Registration
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - ATTARS.json
Source System   : ATTARS / ATRRS
Adapter         : pending implementation
UI Location     : S7 page → Training sub-page → School Seats tab

Fields Required:
  requestNumber    → ATRRS request number
  soldier          → Student name
  courseTitle      → Course name
  courseNumber     → ATRRS course number
  startDate        → Class start date
  location         → Training location / installation
  status           → Quota Requested / Confirmed / Waitlisted / Cancelled
  prerequisiteMet  → Boolean

--------------------------------------------------------------------------------
TABLE: TraX — DTS & Distributed Learning Completions
--------------------------------------------------------------------------------
Source System   : TraX (Army Learning Management System)
Adapter         : Inline in S1Page → adm-sustainment → DTS Admin sub-tab
                  (TRAX_CERTS array: DTS role-based training records)
UI Location     : S1Page → adm-sustainment → DTS Admin → TraX Certifications table
                  S7 page → Training sub-page → Certifications tab

Fields Mapped:
  soldier          → Soldier name
  rank             → Rank
  role             → DTS role (Order Approver / Preparer / AO / DTA)
  course           → Course title
  completedDate    → Completion date
  expiryDate       → Expiry date (annual renewal per DoDFMR Vol 9)
  status           → Current / EXPIRED


================================================================================
S8 — FINANCE
================================================================================

SECTION PURPOSE: Pay management, finance coordination, travel finance,
SDAP/FLPP entitlements, awards coordination, budget management.

--------------------------------------------------------------------------------
TABLE: Pay Data / Entitlements
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A (integrated pay since Oct 2024)
Adapter         : s1SeedData.ts → IPPSA_SOLDIERS pay fields
UI Location     : S1Page → detail modal → Pay section
                  S8 page → Finance Dashboard

Fields Mapped:
  bah              → Basic Allowance for Housing
  bas              → Basic Allowance for Subsistence ($286.68 enlisted rate)
  sdap             → Special Duty Assignment Pay (Level 3: $450 / Level 4: $375)
  sglv             → SGLI premium deduction
  tspPct           → TSP contribution percentage
  allotments[]     → Voluntary allotments (type + amount)
  payIssues[]      → Pay action flags requiring S8 coordination

Note: myPay/DFAS is the self-service portal for LES retrieval. IPPS-A is
      the system of record for pay entitlements and deductions. A separate
      myPay dataset is not needed — all pay fields are embedded in the
      IPPSA Full Roster per soldier.

--------------------------------------------------------------------------------
TABLE: Awards Pipeline (Finance coordination)
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j8-awards-bulk-seed.json
                  external-sor/5th SFG - iPERMS.json
Source System   : THREADS internal (tracking) + iPERMS (official record)
Adapter         : s1SeedData.ts → AWARDS_PIPELINE
UI Location     : S1Page → Awards page (shared between S1 and S8)

Fields Mapped: (see S1 Awards section above)

--------------------------------------------------------------------------------
TABLE: S8 Staff Roster
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A
Adapter         : filter where section === 'S8'
UI Location     : StaffSection → S8 overview


================================================================================
S9 — CIVIL AFFAIRS
================================================================================

SECTION PURPOSE: Civil-military operations, key leader engagements (KLE),
interagency coordination, host nation relations, CA project management.

--------------------------------------------------------------------------------
TABLE: S9 Staff Roster
--------------------------------------------------------------------------------
Source File     : external-sor/5th SFG - IPPSA Full Roster.json
Source System   : IPPS-A
Adapter         : filter where section === 'S9'
UI Location     : StaffSection → S9 overview

Fields Mapped: name, rank, position, mos, med status, AFT score

--------------------------------------------------------------------------------
TABLE: KLE / CA Projects
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j9-ca-staff-seed.json
Source System   : THREADS internal (classified CA systems out of scope)
Adapter         : pending implementation
UI Location     : S9 page → Operations sub-page

Note: Key leader engagements, CA project tracking, and interagency
      coordination data are THREADS-native. No unclassified SOR
      provides this information.

--------------------------------------------------------------------------------
TABLE: Leader Syncs / Command Decisions
--------------------------------------------------------------------------------
Source File     : internal/5sfg-j9-leader-syncs.json
Source System   : THREADS internal (Army 365/Outlook for calendar events)
Adapter         : pending implementation
UI Location     : S9 page → Dashboard / Home → Leader Sync section

Fields Required:
  date             → Sync date
  type             → Weekly Sync / Monthly Review / Campaign Review
  attendees        → Participating staff sections
  agenda[]         → Agenda items
  decisions[]      → Command decisions made
  actionItems[]    → Actions assigned (owner + due date)

Note: Calendar events may sync from Army 365 (Outlook). Decisions and
      action items are THREADS-native with no SOR equivalent.


================================================================================
IMPLEMENTATION PRIORITY ORDER
================================================================================

Priority 1 — CRITICAL (blocks S1 dashboard from showing full unit)
  [ ] Wire 5th SFG - IPPSA Full Roster.json → s1SeedData.ts IPPSA_SOLDIERS
      Replace 27-soldier BN Staff hardcode with all 318 soldiers
  [ ] Wire leave.approvedLeave[] from Full Roster → S1 Leave Tracker table
  [ ] Wire soldier.flags[] from Full Roster → ADMIN_SUSPENSES (DD93/SGLV/PRR)

Priority 2 — HIGH (completes S1 data picture)
  [ ] Join FMSWeb MTOE + IPPSA Full Roster → Unit Manning Report
  [ ] Expand DTMS_SOLDIERS from 13 → full unit using 5sfg-j7-dtms-acft-full-etl.json
  [ ] Expand MEDPROS_SOLDIERS from 12 → full unit using 5th SFG - MEDPROS.json
  [ ] Expand DISS_SUBJECTS from 8 → full unit using 5th SFG - DISS.json

Priority 3 — MEDIUM (fills remaining staff section tables)
  [ ] Wire 5th SFG - STEPP.json → S2 security training table
  [ ] Wire 5sfg-j6-aup-cyber-bulk-etl.json → S6 AUP compliance table
  [ ] Wire 5th SFG - JKO.json → S7 course completions table
  [ ] Wire 5th SFG - ATTARS.json → S7 school seat / ATRRS table
  [ ] Wire 5th SFG - iPERMS.json → Awards pipeline (submitted source)

Priority 4 — LOW (nice to have for full demo fidelity)
  [ ] Wire 5th SFG - TMT.json → S3 transportation requests table
  [ ] Wire internal battle rhythm → S3 Battle Rhythm page
  [ ] Wire internal leader syncs → S9 Leader Sync page
  [ ] Wire Army 365 (Outlook) as optional calendar sync for battle rhythm


================================================================================
JOIN KEYS REFERENCE
================================================================================

IPPSA Full Roster  ←→  MEDPROS         : soldier.edipi === medpros.dodid
IPPSA Full Roster  ←→  DTMS            : soldier.edipi === dtms.dodid
IPPSA Full Roster  ←→  DISS            : soldier.edipi === diss.edipi
IPPSA Full Roster  ←→  JKO             : soldier.edipi === jko.dodid
IPPSA Full Roster  ←→  STEPP           : soldier.edipi === stepp.dodid
IPPSA Full Roster  ←→  iPERMS          : soldier.edipi === iperms.edipi
IPPSA Full Roster  ←→  AUP/Cyber ETL   : soldier.edipi === aup.dodid
IPPSA Full Roster  ←→  DTMS Full ETL   : soldier.edipi === dtmsFull.dodid
FMSWeb MTOE        ←→  IPPSA Full Roster : position.paraLine === soldier.paraLine
GCSS-Army          ←→  FMSWeb MTOE     : equipment.lin === mtoe.equipmentLin
DTS Travel         ←→  IPPSA Full Roster : travel.edipi === soldier.edipi


================================================================================
FILE LOCATIONS REFERENCE
================================================================================

External SOR datasets  : seed/datasets/external-sor/
Internal seed datasets : seed/datasets/internal/
App data adapters      : web/src/pages/army/pages/S*/s*SeedData.ts
UI page components     : web/src/pages/army/pages/S*/S*Page.tsx
Shared components      : web/src/pages/army/pages/shared/
PMCS seed data         : web/src/pages/army/pages/shared/pmcsSeedData.ts
