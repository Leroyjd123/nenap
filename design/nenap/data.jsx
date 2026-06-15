// nenap/data.jsx — sample content + icon set for the Nenap hi-fi prototype
// Exports to window: NenapData, Icon

/* ---------- Icon set (simple stroked UI glyphs) ---------- */
function Icon({ name, size = 20, stroke = 1.7, style, className }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round",
    strokeLinejoin: "round", style, className,
  };
  switch (name) {
    case "search": return (<svg {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg>);
    case "plus": return (<svg {...p}><path d="M12 5v14M5 12h14"/></svg>);
    case "mic": return (<svg {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>);
    case "stop": return (<svg {...p}><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>);
    case "play": return (<svg {...p}><path d="M8 5.5v13l11-6.5z"/></svg>);
    case "folder": return (<svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>);
    case "tag": return (<svg {...p}><path d="M4 4h7l9 9-7 7-9-9z"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none"/></svg>);
    case "spark": return (<svg {...p}><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></svg>);
    case "back": return (<svg {...p}><path d="M15 5l-7 7 7 7"/></svg>);
    case "chevR": return (<svg {...p}><path d="M9 5l7 7-7 7"/></svg>);
    case "chevD": return (<svg {...p}><path d="M5 9l7 7 7-7"/></svg>);
    case "more": return (<svg {...p}><circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>);
    case "moreV": return (<svg {...p}><circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none"/></svg>);
    case "check": return (<svg {...p}><path d="M5 12.5l4.5 4.5L19 6.5"/></svg>);
    case "x": return (<svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case "trash": return (<svg {...p}><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/></svg>);
    case "edit": return (<svg {...p}><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17z"/><path d="M14 7l3 3"/></svg>);
    case "home": return (<svg {...p}><path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/></svg>);
    case "doc": return (<svg {...p}><path d="M7 3h7l5 5v13H7z" fill="none"/><path d="M14 3v5h5M9.5 13h5M9.5 16.5h5"/></svg>);
    case "clock": return (<svg {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>);
    case "filter": return (<svg {...p}><path d="M4 6h16M7 12h10M10 18h4"/></svg>);
    case "grid": return (<svg {...p}><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>);
    case "list": return (<svg {...p}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>);
    case "google": return (<svg width={size} height={size} viewBox="0 0 24 24" style={style}><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.36-.18-2H12v3.79h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.31z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A9.99 9.99 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.41 13.9a6 6 0 0 1 0-3.8V7.51H3.07a10 10 0 0 0 0 8.98z"/><path fill="#EA4335" d="M12 6.58c1.47 0 2.78.5 3.82 1.5l2.85-2.85C16.96 3.6 14.7 2.7 12 2.7A9.99 9.99 0 0 0 3.07 7.5l3.34 2.6C7.2 8.34 9.4 6.58 12 6.58z"/></svg>);
    case "move": return (<svg {...p}><path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>);
    case "wave": return (<svg {...p}><path d="M4 12h2M9 7v10M14 4v16M19 9v6M21 11v2"/></svg>);
    default: return (<svg {...p}><circle cx="12" cy="12" r="8"/></svg>);
  }
}

/* ---------- Sample content ---------- */
const FOLDERS = [
  { id: "all", name: "All Notes", count: 51, system: true },
  { id: "college", name: "College", count: 24 },
  { id: "work", name: "Work", count: 11 },
  { id: "personal", name: "Personal", count: 7 },
  { id: "ideas", name: "Ideas", count: 9 },
];

const ALL_TAGS = ["Exam", "Important", "Meeting", "Lecture", "Research", "To-do", "Draft"];

const NOTES = [
  {
    id: "cellbio4",
    title: "Cell Biology — Lecture 4",
    folder: "college", tags: ["Lecture", "Exam"],
    when: "2 hours ago", rec: true, dur: "41:08", status: "completed",
    excerpt: "Mitosis vs meiosis, the cell cycle checkpoints, and why cancer is fundamentally a failure of regulation…",
    enhanced: [
      { h: "The cell cycle, in one frame", b: "Interphase (G1 → S → G2) is where the cell does almost everything — grows, copies DNA, prepares. Mitosis is the short, dramatic part. The checkpoints are the whole point of the lecture." },
      { h: "Three checkpoints worth memorising", list: ["G1/S — “should I divide at all?” Checks size, nutrients, DNA damage.", "G2/M — “did I copy everything correctly?” Verifies DNA replication.", "Spindle (M) — “is every chromosome attached?” before anaphase pulls them apart."] },
      { h: "The exam framing", b: "Cancer = checkpoints fail, so damaged cells divide anyway. Tie every mechanism back to a checkpoint and you can answer almost any question on this unit." },
    ],
    original: "ok so lecture 4 — cell cycle. interphase is g1 s g2 then mitosis. checkpoints are the important bit she kept repeating. g1/s checkpoint = decide to divide. g2/m = check dna copied right. spindle checkpoint during M before anaphase. cancer = these break. exam will ask about regulation prob.",
    transcript: "…so if we look at the cell cycle as a whole, the part everyone remembers is mitosis, but honestly the interesting biology is happening during interphase. That's G1, S, and G2. Now — the checkpoints. I cannot stress this enough, the checkpoints are what I want you to walk out of here understanding…",
  },
  {
    id: "q3plan",
    title: "Q3 Planning — Leadership sync",
    folder: "work", tags: ["Meeting", "Important"],
    when: "Yesterday", rec: false, status: "completed",
    excerpt: "Three priorities locked for Q3: retention, the billing rebuild, and hiring two senior engineers…",
    enhanced: [
      { h: "Decisions made", list: ["Q3 has exactly three priorities — no fourth.", "Billing rebuild is greenlit; starts week 2.", "Two senior eng hires approved, backfilling growth pod."] },
      { h: "Owners & dates", b: "Retention work owned by Priya, review at mid-quarter. Billing owned by the platform team with a hard cutover target before the holiday freeze." },
    ],
    original: "q3 priorities: 1 retention 2 billing rebuild 3 hiring. agreed no 4th thing. priya owns retention. billing starts wk2, cutover before freeze. 2 senior eng approved.",
    transcript: "…let's not pretend we can do five things. Three. Retention, billing, hiring. If it's not one of those three this quarter, it waits…",
  },
  {
    id: "voiceapp",
    title: "App idea — voice-first capture",
    folder: "ideas", tags: ["Draft"],
    when: "Monday", rec: true, dur: "06:22", status: "completed",
    excerpt: "What if the recording was never the point — it just quietly becomes a clean note you'd actually re-read…",
    enhanced: [
      { h: "The core bet", b: "People don't want “a recording app.” They want to stay present in the room and trust that something readable shows up afterward. Recording is plumbing; the note is the product." },
      { h: "What makes it feel calm", list: ["Capture first, organise later — never block on naming things.", "AI is a quiet helper, not a co-author with a personality.", "One place everything lands: the note."] },
    ],
    original: "idea: voice app where recording isnt the hero. you just talk / type, and a clean note appears. dont make people name stuff up front. ai should be invisible-ish. everything lands in one note view w/ tabs.",
    transcript: "…I keep coming back to this — the recording is not the thing people want. They want to not have to take notes and still have notes…",
  },
  {
    id: "groceries",
    title: "Grocery + week plan",
    folder: "personal", tags: ["To-do"],
    when: "Monday", rec: false, status: "completed",
    excerpt: "Meals for the week, the shortlist for Saturday's shop, and the two things I keep forgetting…",
    enhanced: [
      { h: "This week", list: ["Mon–Wed: pantry meals, use up the lentils.", "Thu: friends over — keep it simple.", "Weekend shop: produce, coffee, the good bread."] },
    ],
    original: "meals: mon-wed lentils etc. thu friends, easy. sat shop: produce coffee bread. dont forget dish soap + stamps AGAIN.",
    transcript: "",
  },
  {
    id: "mitosis",
    title: "Mitosis revision sheet",
    folder: "college", tags: ["Exam"],
    when: "Last week", rec: false, status: "completed",
    excerpt: "Prophase, metaphase, anaphase, telophase — the four-frame story plus the spindle checkpoint…",
    enhanced: [{ h: "PMAT", list: ["Prophase — chromosomes condense.", "Metaphase — line up at the middle.", "Anaphase — sisters pulled apart.", "Telophase — two nuclei reform."] }],
    original: "PMAT. prophase condense, metaphase line up, anaphase pull apart, telophase reform. spindle checkpoint before anaphase.",
    transcript: "",
  },
  {
    id: "interview",
    title: "Design interview — debrief",
    folder: "work", tags: ["Meeting"],
    when: "Last week", rec: true, dur: "28:40", status: "processing",
    excerpt: "Strong portfolio, clear systems thinking. Some hesitation on the metrics question worth probing…",
    enhanced: [], original: "", transcript: "…walked through the checkout redesign really clearly, owned the tradeoffs…",
  },
];

const SCENES = [
  { id: "auth", label: "Auth" },
  { id: "dashboard", label: "Dashboard" },
  { id: "editor", label: "Editor" },
  { id: "record", label: "Record" },
  { id: "note", label: "Note View" },
  { id: "folders", label: "Folders" },
  { id: "search", label: "Search" },
];

window.NenapData = { FOLDERS, ALL_TAGS, NOTES, SCENES };
window.Icon = Icon;
