# Demo Seed Data

All data in this directory is **completely synthetic and fictional**. It was procedurally generated to demonstrate the platform's data model and ETL pipeline.

- No real personnel records, unit rosters, or sensitive information is included.
- EDIPI/DODID values (10-digit identifiers) are randomly generated and do not correspond to any real DoD personnel.
- Unit names, locations, and operational details are fictional.
- All data is safe to commit, share, and use for development or demonstration purposes.

## Structure

```
datasets/
├── external-sor/     # Simulates SOR API drops (dlt reads these at ETL runtime)
│   ├── demo-unit-IPPSA Full Roster.json   # Master personnel roster (318 records)
│   ├── demo-unit-MEDPROS.json             # Medical readiness
│   ├── demo-unit-DTMS.json                # Training management / AFT
│   ├── demo-unit-DISS.json                # Security clearances
│   ├── demo-unit-JKO.json                 # Online training completions
│   ├── demo-unit-STEPP.json               # Security training certs
│   ├── demo-unit-GCSS-Army.json           # Equipment property book
│   ├── demo-unit-DTS.json                 # Travel authorizations
│   ├── demo-unit-ATTARS.json              # ATTARS training events
│   ├── demo-unit-iPERMS.json              # Personnel records completeness
│   ├── demo-unit-TMT.json                 # Task management
│   ├── demo-unit-FMSWeb MTOE.json         # Authorized positions
│   └── *-bulk-etl.json                    # Batch ETL extracts
└── internal/         # THREADS-native data (no external SOR equivalent)
    ├── demo-unit-j3-battle-rhythm.json    # Recurring meeting cadence
    ├── demo-unit-j3-ops-staff-seed.json   # Operations orders / task status
    └── ...
```
