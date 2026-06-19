import shared from '../shared.module.css'
import styles from './ThreadsAI.module.css'

const TOOLS = [
  {
    category: 'READINESS & PERSONNEL',
    items: [
      { title: 'Readiness Q&A',               desc: 'Ask natural-language questions about unit readiness — "who is medically non-deployable?" or "list all soldiers with overdue DD93s."' },
      { title: 'Strength Report Generator',    desc: 'Auto-draft the daily/weekly strength report from current IPPSA data, formatted for submission to higher.' },
      { title: 'Personnel Status (PERSTAT)',   desc: 'Generate a formatted PERSTAT with current present-for-duty, absent, and non-effective counts pulled from live data.' },
      { title: 'Suspense Triage',             desc: 'Summarize and rank all outstanding readiness flags by severity — overdue documents, medical flags, ACFT failures — each morning.' },
      { title: 'Leave Conflict Checker',      desc: 'Identify scheduling conflicts in the current leave roster against battle rhythm events and training periods.' },
    ],
  },
  {
    category: 'REPORTING & WRITING',
    items: [
      { title: 'SITREP Drafting',             desc: 'Generate command SITREP narratives from the current battle rhythm and roster status, formatted per unit SOP.' },
      { title: 'Award Narrative Writer',       desc: 'Draft award citation narratives (ARCOM, AAM, MSM) from bullet inputs — S1 reviews and submits.' },
      { title: 'OER / NCOER Support',         desc: 'Suggest bullet language, check word counts, and flag common formatting errors in draft evaluation reports.' },
      { title: 'After-Action Report (AAR)',    desc: 'Structure AAR inputs into the standard Sustained-Improved-Recommended format with key lessons.' },
      { title: 'Commander\'s Summary Brief',   desc: 'Synthesize readiness data into a concise executive summary suitable for a commander\'s daily update.' },
    ],
  },
  {
    category: 'PLANNING & STAFF WORK',
    items: [
      { title: 'Action Routing',              desc: 'Determine which staff section owns an incoming action and auto-draft the tasking memo with suspense date.' },
      { title: 'Training Schedule Assistant', desc: 'Suggest training events to fill gaps in the battle rhythm based on upcoming requirements and resource availability.' },
      { title: 'Risk Assessment Draft',       desc: 'Generate a composite risk assessment for a training event from the mission description and environmental inputs.' },
      { title: 'CCIR / PIR Builder',          desc: 'Help commanders articulate Commander\'s Critical Information Requirements and Priority Intelligence Requirements.' },
      { title: 'FRAGORD / TASKORD Draft',     desc: 'Skeleton a fragmentary or tasking order from a mission description, filling standard paragraphs with available data.' },
    ],
  },
  {
    category: 'ANALYSIS & INTELLIGENCE SUPPORT',
    items: [
      { title: 'Threat Summary',              desc: 'Synthesize open-source threat information into a structured intelligence summary for the S2 to review and release.' },
      { title: 'Pattern-of-Life Analysis',    desc: 'Identify anomalies and trends across battle rhythm, personnel data, and readiness metrics over a selectable time range.' },
      { title: 'Medical Readiness Summary',   desc: 'Break down medical non-deployability by category, section, and trend — formatted for the command surgeon.' },
      { title: 'Training Trend Report',       desc: 'Surface ACFT, weapons qualification, and task proficiency trends across companies over the last 90 days.' },
    ],
  },
  {
    category: 'ADMINISTRATIVE & LOGISTICS',
    items: [
      { title: 'Supply Request Draft',        desc: 'Generate a memorandum for record or DA 2062 hand receipt from equipment inputs for S4 routing.' },
      { title: 'SOP Section Writer',         desc: 'Draft or update a unit SOP section from a brief description — returns structured text for review.' },
      { title: 'Meeting Agenda Builder',      desc: 'Generate a structured agenda for digital syncs, VTCs, or battle rhythm events from the topic list.' },
      { title: 'Policy Lookup',              desc: 'Ask questions about Army regulations (AR 600-8-1, AR 350-1, AR 670-1, etc.) and get cited plain-language answers.' },
    ],
  },
]

export default function ThreadsAI() {
  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <h2><i className="fas fa-robot" /> THREADS AI — Digital Staff Officer</h2>
        <span className={shared.sub}>Preview · AI service integration pending</span>
      </div>

      <div className={shared.card} style={{ marginBottom: 20 }}>
        <div className={shared.cardBody}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className={shared.select}
              style={{ flex: 1, padding: '9px 14px', fontSize: 13 }}
              placeholder="Ask the digital staff officer anything…  (AI service wiring pending)"
              disabled
            />
            <button className={shared.tab} disabled style={{ padding: '7px 18px', whiteSpace: 'nowrap' }}>
              <i className="fas fa-paper-plane" style={{ marginRight: 6 }} />Send
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#aaa' }}>
            <i className="fas fa-info-circle" style={{ marginRight: 6 }} />
            THREADS AI connects to the unit data store. All outputs require human review before submission or release.
          </div>
        </div>
      </div>

      {TOOLS.map(group => (
        <div key={group.category} className={shared.card} style={{ marginBottom: 14 }}>
          <div className={shared.cardHeader}>{group.category}</div>
          <div>
            {group.items.map((tool, i) => (
              <div key={tool.title} className={styles.toolRow} style={{ borderBottom: i < group.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className={styles.toolInfo}>
                  <div className={styles.toolTitle}>{tool.title}</div>
                  <div className={styles.toolDesc}>{tool.desc}</div>
                </div>
                <button className={styles.toolBtn} disabled>
                  Launch <i className="fas fa-chevron-right" style={{ fontSize: 9, marginLeft: 5 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
