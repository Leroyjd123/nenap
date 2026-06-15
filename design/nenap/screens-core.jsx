// nenap/screens-core.jsx — Auth, Dashboard, Editor, Record + shared shells
const { useState, useRef, useEffect } = React;

const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

/* ---------- shared bits ---------- */
function WaveBars({ live, n = 34, h = 46, seed = 1 }) {
  const bars = [];
  for (let i = 0; i < n; i++) {
    const v = 0.22 + 0.78 * Math.abs(Math.sin(i * 0.9 + seed) * Math.cos(i * 0.37 + seed * 2));
    bars.push(
      <i key={i} style={{ height: Math.round(v * h) + "px",
        animationDelay: live ? (-(i % 7) * 0.13) + "s" : undefined,
        animationDuration: live ? (0.7 + (i % 5) * 0.12) + "s" : undefined }} />
    );
  }
  return <div className={"wave" + (live ? " live" : "")} style={{ height: h + "px" }}>{bars}</div>;
}

function NoteCard({ note, onClick, compact }) {
  const F = window.NenapData.FOLDERS.find(f => f.id === note.folder);
  return (
    <div className="note-card" onClick={onClick}>
      {note.rec && <span className="rec-dot" title="has a recording" style={{ position: "absolute", top: "var(--pad)", right: "var(--pad)" }} />}
      <h3 className="nc-title" style={{ paddingRight: note.rec ? 16 : 0, ...(compact ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } : {}) }}>{note.title}</h3>
      {!compact && <p className="nc-ex">{note.excerpt}</p>}
      <div className="nc-foot">
        <span className="meta">{note.when}</span>
        {note.status === "processing"
          ? <span className="tag" style={{ color: "var(--rec)", background: "var(--rec-tint)" }}>enhancing…</span>
          : note.tags.slice(0, compact ? 1 : 2).map(t => <span key={t} className="tag">{t}</span>)}
        <span className="grow" />
        {note.rec && <span className="nc-rec"><Icon name="wave" size={13} /> {note.dur}</span>}
        {F && !F.system && <span className="meta">{F.name}</span>}
      </div>
    </div>
  );
}

/* ---------- shells ---------- */
function DesktopShell({ app, active, children, scroll = true }) {
  const { FOLDERS } = window.NenapData;
  return (
    <div className="d-shell">
      <aside className="d-side">
        <div className="brand" onClick={() => app.nav("dashboard")} style={{ cursor: "pointer" }}>Nenap<span className="dot">.</span></div>
        <div className="side-lab">Folders</div>
        {FOLDERS.map(f => (
          <div key={f.id} className={"nav-item" + (app.s.folder === f.id && active === "dashboard" ? " on" : "")}
               onClick={() => app.nav("dashboard", { folder: f.id })}>
            <Icon name={f.system ? "home" : "folder"} size={17} />
            <span className="grow">{f.name}</span>
            <span className="ct">{f.count}</span>
          </div>
        ))}
        <div className="nav-item nav-add" onClick={() => app.nav("folders")}><Icon name="plus" size={16} /> New folder</div>
        <div className="grow" />
        <div className={"nav-item" + (active === "folders" ? " on" : "")} onClick={() => app.nav("folders")}>
          <Icon name="tag" size={17} /> <span className="grow">Folders &amp; Tags</span>
        </div>
        <hr className="hr" style={{ margin: "8px 4px" }} />
        <div className="row" style={{ padding: "4px 6px", gap: 9 }}>
          <span className="av">L</span>
          <div className="col" style={{ lineHeight: 1.2 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Lena Diaz</span>
            <span className="meta">Free plan</span>
          </div>
        </div>
      </aside>
      <div className="d-main">{children}</div>
    </div>
  );
}

function MobileShell({ app, active, children }) {
  const tabs = [
    { id: "dashboard", ic: "home", lab: "Home" },
    { id: "search", ic: "search", lab: "Search" },
    { id: "folders", ic: "folder", lab: "Folders" },
  ];
  return (
    <>
      <div className="grow scrollable">{children}</div>
      <nav className="m-tabbar">
        {tabs.map(t => (
          <div key={t.id} className={"m-tab" + (active === t.id ? " on" : "")} onClick={() => app.nav(t.id)}>
            <Icon name={t.ic} size={21} /> {t.lab}
          </div>
        ))}
      </nav>
    </>
  );
}

/* ============================================================ AUTH */
function AuthScreen({ app, platform }) {
  const desktop = platform === "desktop";
  const card = (
    <div className="col center" style={{ gap: 15, width: "100%", maxWidth: 320, margin: "0 auto" }}>
      <div className="brand" style={{ fontSize: 38, marginBottom: 2 }}>Nenap<span className="dot">.</span></div>
      <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 17, margin: "0 0 14px" }}>
        stay present, keep what matters
      </p>
      <button className="btn btn-soft btn-block btn-lg" onClick={() => app.nav("dashboard")}>
        <Icon name="google" size={19} /> Continue with Google
      </button>
      <div className="row" style={{ width: "100%", gap: 12, color: "var(--ink-3)" }}>
        <hr className="hr grow" /><span className="meta">or</span><hr className="hr grow" />
      </div>
      <input className="input" placeholder="you@email.com" defaultValue="lena@nenap.app" />
      <input className="input" type="password" placeholder="Password" defaultValue="········" />
      <button className="btn btn-primary btn-block btn-lg" onClick={() => app.nav("dashboard")}>Sign in</button>
      <p style={{ color: "var(--ink-2)", fontSize: 13.5, margin: "4px 0 0" }}>
        No account? <span style={{ color: "var(--accent-deep)", fontWeight: 600, cursor: "pointer" }} onClick={() => app.nav("dashboard")}>Create one</span>
      </p>
    </div>
  );
  return (
    <div className="screen col center" style={{ height: "100%", padding: desktop ? "40px" : "30px 26px",
      background: "radial-gradient(900px 500px at 50% -10%, var(--accent-tint), transparent 60%), var(--bg)" }}>
      {card}
      {desktop && <p className="meta" style={{ position: "absolute", bottom: 22, opacity: .7 }}>new &amp; existing accounts land straight on the dashboard — no onboarding wall</p>}
    </div>
  );
}

/* ============================================================ DASHBOARD */
function DashboardScreen({ app, platform }) {
  const { NOTES, FOLDERS } = window.NenapData;
  const [filter, setFilter] = useState("all");
  const folder = app.s.folder || "all";
  let notes = NOTES.filter(n => folder === "all" || n.folder === folder);
  if (filter === "rec") notes = notes.filter(n => n.rec);
  const F = FOLDERS.find(f => f.id === folder);

  if (platform === "desktop") {
    return (
      <DesktopShell app={app} active="dashboard">
        <div className="d-top">
          <div className="search-field grow" style={{ maxWidth: 340 }} onClick={() => app.nav("search")}>
            <Icon name="search" size={17} /> Search notes, transcripts, tags…
          </div>
          <span className="grow" />
          <button className="btn btn-rec" onClick={() => app.nav("record")}><Icon name="mic" size={17} /> Record</button>
          <button className="btn btn-primary" onClick={() => app.nav("editor")}><Icon name="plus" size={17} /> New note</button>
        </div>
        <div className="d-content scrollable" style={{ padding: "20px var(--pad) 40px" }}>
          <div className="row between" style={{ marginBottom: 16, gap: 12 }}>
            <div className="col grow" style={{ gap: 2, minWidth: 0 }}>
              <span className="eyebrow">{F && !F.system ? "Folder" : "Your notes"}</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, margin: "2px 0 0", letterSpacing: "-.01em", whiteSpace: "nowrap" }}>{F ? F.name : "All Notes"}</h2>
            </div>
            <div className="row" style={{ gap: 7, flex: "none" }}>
              {["all", "rec"].map(k => (
                <span key={k} className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>
                  {k === "all" ? "Everything" : <><Icon name="wave" size={13} /> With recording</>}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {notes.map(n => <NoteCard key={n.id} note={n} onClick={() => app.openNote(n.id)} />)}
          </div>
        </div>
      </DesktopShell>
    );
  }

  // mobile
  return (
    <>
      <div className="m-top">
        <div className="brand">Nenap<span className="dot">.</span></div>
        <span className="av">L</span>
      </div>
      <MobileShell app={app} active="dashboard">
        <div className="search-field" style={{ marginBottom: 14 }} onClick={() => app.nav("search")}>
          <Icon name="search" size={17} /> Search notes…
        </div>
        <div className="row hscroll" style={{ gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
          {FOLDERS.map(f => (
            <span key={f.id} className={"chip" + (folder === f.id ? " on" : "")} onClick={() => app.nav("dashboard", { folder: f.id })}>
              {f.system ? "All" : f.name}
            </span>
          ))}
        </div>
        <span className="eyebrow">Recent</span>
        <div className="col" style={{ gap: 12, marginTop: 10 }}>
          {notes.map(n => <NoteCard key={n.id} note={n} compact onClick={() => app.openNote(n.id)} />)}
        </div>
        <div style={{ height: 70 }} />
      </MobileShell>
      <div className="m-fab">
        <button className="btn btn-rec btn-sm" onClick={() => app.nav("record")} style={{ boxShadow: "var(--shadow-2)" }}><Icon name="mic" size={16} /> Record</button>
        <button className="btn btn-primary" onClick={() => app.nav("editor")} style={{ boxShadow: "var(--shadow-2)", borderRadius: 99, padding: "13px 20px" }}><Icon name="plus" size={18} /> New note</button>
      </div>
    </>
  );
}

/* ============================================================ EDITOR */
function EditorScreen({ app, platform }) {
  const rec = app.s.editorRec;
  const [tab, setTab] = useState("notes");
  const desktop = platform === "desktop";

  const notesPane = (
    <div className="col" style={{ height: "100%", padding: desktop ? "22px 30px" : "14px 0 0" }}>
      <textarea className="np-editor" defaultValue={
`# Cell Biology — Lecture 4

The whole lecture is really about the **checkpoints**.

- G1/S — decide whether to divide at all
- G2/M — confirm DNA copied correctly
- Spindle — every chromosome attached before anaphase

> tie cancer back to a checkpoint failure for the exam`}
        style={{ flex: 1, width: "100%", border: "none", outline: "none", resize: "none", background: "none",
          fontFamily: "var(--font-display)", fontSize: 16.5, lineHeight: 1.7, color: "#3c3a32" }} />
    </div>
  );

  const recRail = (
    <div className="col" style={{ height: "100%", background: "var(--surface-2)", padding: "20px 18px", gap: 14 }}>
      {!rec ? (
        <div className="col center" style={{ gap: 14, margin: "auto 0", textAlign: "center" }}>
          <button className="btn btn-rec" style={{ width: 64, height: 64, borderRadius: 99, padding: 0 }} onClick={() => app.startRec()}>
            <Icon name="mic" size={26} />
          </button>
          <button className="btn btn-primary btn-block" onClick={() => app.startRec()}>Start recording</button>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 15, margin: 0, maxWidth: 180, lineHeight: 1.5 }}>
            Capture the room — the transcript fills in here while you keep typing.
          </p>
        </div>
      ) : (
        <>
          <div className="row between">
            <span className="rec-pill"><span className="live" /> {fmt(app.s.recElapsed)}</span>
            <button className="btn btn-soft btn-sm" onClick={() => app.openModal("save-note")}><Icon name="stop" size={15} /> Stop</button>
          </div>
          <WaveBars live n={26} h={42} />
          <span className="eyebrow">Live transcript</span>
          <div className="prose mono grow scrollable" style={{ fontSize: 13 }}>
            <p>…the part everyone remembers is mitosis, but the interesting biology happens during interphase — G1, S, and G2.</p>
            <p>Now, the checkpoints. I cannot stress this enough<span className="shimmer" style={{ padding: "0 2px", borderRadius: 3 }}>&nbsp;</span></p>
          </div>
        </>
      )}
    </div>
  );

  if (desktop) {
    return (
      <div className="screen col" style={{ height: "100%" }}>
        <div className="d-top">
          <button className="btn btn-ghost btn-icon" onClick={() => app.nav("dashboard")}><Icon name="back" size={19} /></button>
          <input className="ed-title" defaultValue="Cell Biology — Lecture 4"
            style={{ border: "none", outline: "none", background: "none", fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: "var(--ink)", flex: 1, minWidth: 0 }} />
          <span className="meta">{rec ? "autosaving…" : "draft · saved just now"}</span>
          <button className="btn btn-primary" onClick={() => app.openModal("save-note")}>Save note</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 296px", flex: 1, minHeight: 0 }}>
          <div className="scrollable">{notesPane}</div>
          {recRail}
        </div>
      </div>
    );
  }

  // mobile
  return (
    <div className="screen col" style={{ height: "100%" }}>
      <div className="row between" style={{ padding: "4px var(--pad) 10px" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => app.nav("dashboard")}><Icon name="back" size={17} /> Back</button>
        <button className="btn btn-primary btn-sm" onClick={() => app.openModal("save-note")}>Save</button>
      </div>
      <div style={{ padding: "0 var(--pad)" }}>
        <input className="ed-title" defaultValue="Cell Biology — Lecture 4"
          style={{ border: "none", outline: "none", background: "none", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--ink)", width: "100%" }} />
        <div className="seg block" style={{ marginTop: 10 }}>
          <span className={tab === "notes" ? "on" : ""} onClick={() => setTab("notes")}>Notes</span>
          <span className={tab === "transcript" ? "on" : ""} onClick={() => setTab("transcript")}>Transcript {rec && "●"}</span>
        </div>
      </div>
      <div className="grow scrollable" style={{ padding: "0 var(--pad) 16px" }}>
        {tab === "notes" ? notesPane : (
          <div className="col" style={{ gap: 12, paddingTop: 14 }}>
            {rec
              ? <><div className="row between"><span className="rec-pill"><span className="live" /> {fmt(app.s.recElapsed)}</span><button className="btn btn-soft btn-sm" onClick={() => app.openModal("save-note")}><Icon name="stop" size={14} /> Stop</button></div>
                  <WaveBars live n={22} h={40} />
                  <span className="eyebrow">Live transcript</span>
                  <div className="prose mono"><p>…the interesting biology happens during interphase. Now, the checkpoints — I cannot stress this enough<span className="shimmer">&nbsp;&nbsp;</span></p></div></>
              : <div className="col center" style={{ gap: 13, padding: "30px 0", textAlign: "center" }}>
                  <button className="btn btn-rec" style={{ width: 60, height: 60, borderRadius: 99, padding: 0 }} onClick={() => app.startRec()}><Icon name="mic" size={24} /></button>
                  <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--ink-2)" }}>tap to start — transcript fills here</span>
                </div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================ RECORD (record-first) */
function RecordScreen({ app, platform }) {
  const desktop = platform === "desktop";
  const transcript = (
    <div className="prose mono" style={{ fontSize: desktop ? 14 : 13 }}>
      <p>So if we frame Q3 honestly — we cannot do five things. Three priorities. Retention, the billing rebuild, and the two senior hires.</p>
      <div className="comment-chip"><Icon name="plus" size={13} /> Add comment — saved as its own note</div>
      <p>If it is not one of those three this quarter, it waits until Q4<span className="shimmer">&nbsp;&nbsp;</span></p>
    </div>
  );

  if (desktop) {
    return (
      <div className="screen col center" style={{ height: "100%", padding: 40,
        background: "radial-gradient(800px 500px at 50% 0%, var(--rec-tint), transparent 65%), var(--bg)" }}>
        <div style={{ width: 560, maxWidth: "100%" }}>
          <div className="row between" style={{ marginBottom: 22 }}>
            <span className="rec-pill" style={{ fontSize: 15, padding: "8px 16px" }}><span className="live" /> Recording · {fmt(app.s.recElapsed)}</span>
            <button className="btn btn-soft" onClick={() => app.openModal("save-rec")}><Icon name="stop" size={17} /> Stop &amp; save</button>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 24, boxShadow: "var(--shadow-1)" }}>
            <WaveBars live n={48} h={64} seed={3} />
            <hr className="hr" style={{ margin: "18px 0" }} />
            <span className="eyebrow">Live transcript</span>
            <div style={{ marginTop: 10 }}>{transcript}</div>
          </div>
          <p style={{ textAlign: "center", fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--ink-2)", marginTop: 18 }}>
            Capture first, name it later — drop comments on the transcript and each becomes a note.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen col" style={{ height: "100%", padding: "8px var(--pad) 0",
      background: "radial-gradient(600px 400px at 50% 0%, var(--rec-tint), transparent 70%), var(--bg)" }}>
      <div className="row between">
        <button className="btn btn-ghost btn-sm" onClick={() => app.nav("dashboard")}><Icon name="x" size={17} /> Close</button>
        <span className="rec-pill"><span className="live" /> {fmt(app.s.recElapsed)}</span>
      </div>
      <div className="grow col" style={{ paddingTop: 18 }}>
        <WaveBars live n={30} h={56} seed={3} />
        <span className="eyebrow" style={{ marginTop: 20 }}>Live transcript</span>
        <div className="grow scrollable" style={{ marginTop: 10 }}>{transcript}</div>
      </div>
      <div className="col center" style={{ gap: 11, padding: "16px 0 24px" }}>
        <button className="btn btn-rec" style={{ width: 70, height: 70, borderRadius: 99, padding: 0, borderWidth: 2 }} onClick={() => app.openModal("save-rec")}>
          <Icon name="stop" size={26} />
        </button>
        <span className="meta">tap to stop &amp; save</span>
      </div>
    </div>
  );
}

Object.assign(window, { WaveBars, NoteCard, DesktopShell, MobileShell, AuthScreen, DashboardScreen, EditorScreen, RecordScreen, fmtTime: fmt });
