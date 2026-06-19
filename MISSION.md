# Why THREADS Exists

---

## The Problem Has a Name

In 2015, Dr. Leonard Wong and Dr. Stephen Gerras published *Lying to Ourselves: Dishonesty in the Army Profession* through the U.S. Army War College Strategic Studies Institute. The study wasn't a condemnation of individual character. It was a systems diagnosis — an examination of what happens to an institution's relationship with truth when it demands more compliance than compliance is humanly possible.

Their finding was precise: when requirements exceed available time and organizational capacity, and when acknowledging that gap is professionally unsafe, leaders learn to manage the appearance of compliance rather than compliance itself. Signatures stop representing "this was done to standard" and start representing "this is the correct answer to put here." The junior leader who says "we didn't do that training" is more dangerous to their career than the one who finds a creative interpretation of what "done" means. The readiness data that flows up the chain of command becomes a measure of institutional pressure, not operational reality.

Every unit leader in the American military already knows this. The study named it.

---

## The Machine That Produces the Distortion

The Army formally requires units to operate across more than **2,300 authoritative systems**. Not guidelines. Not recommendations. Systems that commanders are legally, professionally, and administratively required to use. IPPS-A for personnel. MEDPROS for medical readiness. DTMS for training management. GCSS-Army for equipment. DISS for clearances. DTS for travel. TMT for task management. JKO for online training. STEPP for security certifications. iPERMS for personnel records. FMSWeb for the MTOE. And hundreds more.

None of them natively talk to each other.

The individual who needs a current picture of their unit's readiness — the commander, the XO, the S1, the readiness NCO — cannot get that picture from any of those systems. Not because the data doesn't exist. It does. It lives across those systems, updated continuously by the authoritative sources. But extracting it, consolidating it, and presenting it in a form that supports decisions requires manual transfer work. Someone has to log into IPPS-A, copy the roster, cross-reference it against the MEDPROS export, check the DTMS training records, compare it against the equipment accountability tracker in GCSS-Army, and synthesize all of it into something a commander can read.

Nobody has time to do that correctly. So it doesn't get done correctly.

What fills the gap is a shadow infrastructure that the Army didn't design, doesn't sanction, and doesn't support — but absolutely depends on to function: **Microsoft Office**. SharePoint trackers. Teams channels. Excel rosters. Outlook suspense chains. Word forms. PowerPoint briefings assembled from data copied from six different systems into a slide that is already out of date by the time it's shown to the commander.

This shadow infrastructure runs day-to-day operations at every echelon from squad to COCOM. Every unit has it. Every unit knows it. No one designed it. Everyone maintains it — at enormous cost in time, attention, and accuracy.

The S1 shop runs a separate tracker for leaves, for flags, for evaluations, for awards — each one maintained manually, none of them connected to IPPS-A, all of them diverging from the authoritative source the moment something changes in the system. The S4 has a maintenance tracker that supplements GCSS-Army because GCSS-Army doesn't surface the information the way the XO needs it. The commander gets a readiness brief assembled by four people pulling data from six systems into a PowerPoint — a document that consumed a half-day of labor and is accurate to a point in time that no longer exists by the time it's briefed.

Every hour spent maintaining that shadow infrastructure is an hour not spent on the mission. Every data entry that lives in two places — one authoritative, one manual — is a divergence point where the tracker says one thing and the system says another and a leader has to decide which one to believe. And every time a leader decides to brief the tracker number instead of the system number because the tracker number is what the chain wants to see — that is a data point on a gradient that ends where the Wong-Gerras study begins.

---

## What THREADS Is

THREADS is a **purpose-built integration layer** for military unit management.

It doesn't replace the authoritative systems. IPPS-A owns personnel data. MEDPROS owns medical readiness. DTMS owns training records. Those systems stay. Their ownership stays. THREADS connects to them — reading from each system on a defined schedule, normalizing the data they produce, and consolidating it into a single operational picture that updates automatically.

The readiness tracker is no longer a spreadsheet someone maintains. It's a live view of what the authoritative systems actually say. The leave tracker is populated from IPPS-A, not from a handwritten log. The training status comes from DTMS, not from an NCO who spent Tuesday morning manually entering last week's AFT results. The clearance PR due dates come from DISS, not from a calendar reminder someone set two years ago.

The shadow work doesn't get replaced with better shadow work. It gets replaced with a connection to truth.

---

## What This Means Operationally

**For the commander:** A single readiness picture across all staff sections, sourced from the systems that own the data, updated automatically. Not a picture of what the staff assembled last Monday. A picture of what exists right now.

**For the XO:** Suspense tracking that surfaces what's actually overdue, sourced from the systems that define the requirement — not from a tracker that reflects the last time someone had time to update it.

**For the S1:** The leave tracker is populated from IPPS-A. The flags tracker reflects what's in the system. The evaluations pipeline shows what's actually in the queue. The awards status is visible to anyone with access, without emailing each section officer to ask.

**For the staff NCOs:** The tracker is the system. Not a parallel record that has to be kept synchronized with the system. The system.

**For the commander at the next echelon:** The readiness data coming from subordinate units reflects what their systems say — not what someone decided was safe to report.

---

## Why This Matters Beyond Efficiency

The Wong-Gerras study established that the conditions for dishonesty aren't primarily character failures — they're system failures. An institution that demands more than it can receive, and punishes accurate reporting of that gap, trains leaders to misrepresent reality. Over time, that training erodes the professional culture that military effectiveness depends on.

The administrative environment that THREADS replaces is one of the specific machines that produces that erosion. When a leader knows that the readiness data they're about to brief was assembled manually, from six systems, by people who were also managing eight other requirements that week, and that the chain wants to see green — they are standing at the threshold of that gradient. The data might be right. But they have reason to wonder, and they may not have time or political safety to find out.

THREADS removes that uncertainty. The data is sourced from the authoritative systems. It's visible to everyone simultaneously. There is no separate tracker to decide whether to believe. The conversation about whether the unit is ready happens with the same data the system shows — because the view and the system are the same thing.

This isn't about better PowerPoint. This isn't another Microsoft Suite deployment patch duct-taped onto a broken process. THREADS is a reckoning with the actual cause of the problem — not the character of the people operating in a broken system, but the broken system itself.

---

## Technical Foundation

THREADS is built to operate in the environments where military units actually work — including environments with no internet connection, no commercial cloud access, and no dedicated IT staff.

It runs as a web application on a single server. It can be installed on a unit S6 rack server, a ruggedized laptop, or a classified network using the same package. It requires no ongoing cloud dependency.

The data pipeline reads from each system of record, normalizes what it finds, and loads it into a consolidated database. Every record is stamped with its source — what system it came from and when — so there's never ambiguity about where a number originated or how current it is. When an authoritative system updates, the next pipeline run reflects that update automatically.

Full technical documentation is available in [ARCHITECTURE.md](ARCHITECTURE.md) and [CONTRIBUTING.md](CONTRIBUTING.md) for developers, S6 staff, and technical decision makers.

---

## The Origin

THREADS was conceived by a former Army officer who lived this problem firsthand. The administrative burden that produced it, the shadow work that sustains it, the ethical gradient that results from it — these are not abstract concerns. They are the operational environment that unit leaders navigate every day.

The mission gap THREADS addresses is not unique to the Army. It is endemic across the entire Department of Defense. Every service, every echelon, every functional area is running some version of the same shadow infrastructure for the same reasons.

THREADS is what it looks like to take that problem seriously — not as an IT procurement question, but as a readiness and integrity question.

---

*Reference: Wong, L., & Gerras, S. (2015). Lying to Ourselves: Dishonesty in the Army Profession. Strategic Studies Institute, U.S. Army War College. https://press.armywarcollege.edu/monographs/673/*
