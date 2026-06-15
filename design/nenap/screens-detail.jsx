// nenap/screens-detail.jsx — Note View (+ AI moment), Folders/Tags, Search, Modals
const { useState: useStateD, useEffect: useEffectD } = React;

/* ---------- the gentle AI enhancement moment ---------- */
function EnhancingOverlay() {
  const steps = ["Reading your notes & comments", "Listening back through the transcript", "Tidying the structure", "Almost there…"];
  const [i, setI] = useStateD(0);
  const [pct, setPct] = useStateD(8);
  useEffectD(() => {
    const a = setInterval(() => setI(x => Math.min(x + 1, steps.length - 1)), 620);
    const b = setInterval(() => setPct(p => Math.min(p + 6 + Math.random() * 9, 96)), 240);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  return (
    <div className="enhancing">
      <div className="enh-orb">
        <div className="ring" /><div className="ring r2" /><div className="ring r3" />
        <div className="core"><Icon name="spark" size={26} /></div>
      </div>
      <div className="enh-label">Improving your note</div>
      <div className="enh-steps">{steps[i]}</div>
      <div className="enh-bar"><i style={{ width: pct + "%" }} /></div>
    </div>
  );
}

function NoteBody({ note, tab }) {
  if (tab === "enhanced") {
    return (
      <div className="prose">
        {note.enhanced.map((s, k) => (
          <div key={k} className={"reveal reveal-" + Math.min(k + 1, 3)}>
            <h3>{s.h}</h3>
            {s.b && <p>{s.b}</p>}
            {s.list && <ul>{s.list.map((li, j) => <li key={j}>{li}</li>)}</ul>}
          </div>
        ))}
      </div>
    );
  }
  if (tab === "original") {
    return <div className="prose mono"><span className="eyebrow">What you wrote / dictated</span><p style={{ marginTop: 10 }}>{note.original || "—"}</p></div>;
  }
  return (
    <div className="prose mono">
      <span className="eyebrow">Full transcript</span>
      <p style={{ marginTop: 10 }}>{note.transcript || "No recording attached to this note."}</p>
    </div>
  );
}

/* ============================================================ NOTE VIEW */
function NoteScreen({ app, platform }) {
  const note = app.note();
  const tab = app.s.noteTab;
  const desktop = platform === "desktop";
  const F = window.NenapData.FOLDERS.find(f => f.id === note.folder);
  const tabs = [["enhanced", "Enhanced"], ["original", "Original"], ["transcript", "Transcript"]];

  const head = (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-.015em",
        fontSize: desktop ? 30 : 23, margin: desktop ? "16px 0 8px" : "10px 0 8px", lineHeight: 1.12 }}>{note.title}</h1>
      <div className="row wrap" style={{ gap: 8 }}>
        {note.tags.map(t => <span key={t} className="tag">{t}</span>)}
        <span className="meta">· {F && !F.system ? F.name + " · " : ""}edited {note.when}</span>
        {note.rec && <span className="nc-rec">· <Icon name="wave" size={13} /> {note.dur}</span>}
      </div>
    </>
  );

  const controls = (
    <div className="row between" style={{ marginTop: 16, gap: 10 }}>
      <div className="seg">
        {tabs.map(([k, l]) => <span key={k} className={tab === k ? "on" : ""} onClick={() => app.set({ noteTab: k })}>{l}</span>)}
      </div>
      {tab === "enhanced" &&
        <button className="btn btn-primary btn-sm" onClick={() => app.improve()}><Icon name="spark" size={16} /> Improve again</button>}
    </div>
  );

  if (desktop) {
    return (
      <div className="screen col" style={{ height: "100%", position: "relative" }}>
        {app.s.enhancing && <EnhancingOverlay />}
        <div className="d-top">
          <button className="btn btn-ghost btn-sm" onClick={() => app.nav("dashboard")}><Icon name="back" size={18} /> All notes</button>
          <span className="grow" />
          <button className="btn btn-ghost btn-sm" onClick={() => app.openModal("move")}><Icon name="move" size={16} /> Move</button>
          <button className="btn btn-ghost btn-sm" onClick={() => app.openModal("tags")}><Icon name="tag" size={16} /> Tags</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--rec)" }} onClick={() => app.openModal("delete")}><Icon name="trash" size={16} /> Delete</button>
        </div>
        <div className="scrollable grow" style={{ padding: "8px 0 50px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "12px 30px" }}>
            {head}
            {controls}
            <hr className="hr" style={{ margin: "20px 0 22px" }} />
            <div key={tab + (app.s.improvedAt || 0)}><NoteBody note={note} tab={tab} /></div>
            {tab === "enhanced" &&
              <div style={{ marginTop: 26 }}><button className="btn btn-soft btn-sm" onClick={() => app.openNote(note.id, "original")}>Compare with original</button></div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen col" style={{ height: "100%", position: "relative" }}>
      {app.s.enhancing && <EnhancingOverlay />}
      <div className="row between" style={{ padding: "6px var(--pad) 4px" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => app.nav("dashboard")}><Icon name="back" size={17} /> Notes</button>
        <button className="btn btn-ghost btn-icon" onClick={() => app.openModal("more")}><Icon name="moreV" size={19} /></button>
      </div>
      <div className="grow scrollable" style={{ padding: "0 var(--pad) 30px" }}>
        {head}
        <div className="seg block" style={{ marginTop: 14 }}>
          {tabs.map(([k, l]) => <span key={k} className={tab === k ? "on" : ""} onClick={() => app.set({ noteTab: k })}>{l}</span>)}
        </div>
        <hr className="hr" style={{ margin: "16px 0 18px" }} />
        <div key={tab + (app.s.improvedAt || 0)}><NoteBody note={note} tab={tab} /></div>
        {tab === "enhanced" &&
          <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={() => app.improve()}><Icon name="spark" size={17} /> Improve again</button>}
      </div>
    </div>
  );
}

/* ============================================================ FOLDERS & TAGS */
function FoldersScreen({ app, platform }) {
  const { FOLDERS, ALL_TAGS } = window.NenapData;
  const desktop = platform === "desktop";
  const inner = (
    <div style={{ maxWidth: desktop ? 760 : "none", margin: desktop ? "0 auto" : 0, padding: desktop ? "24px 30px 50px" : "0 var(--pad) 30px" }}>
      <div className="row between" style={{ marginBottom: 16 }}>
        <div className="col" style={{ gap: 2 }}><span className="eyebrow">Organise</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: desktop ? 26 : 22, fontWeight: 600, margin: 0 }}>Folders &amp; Tags</h2></div>
      </div>

      <div className="row between" style={{ marginBottom: 10 }}>
        <span className="eyebrow">Folders · one per note</span>
        <button className="btn btn-soft btn-sm" onClick={() => app.toast("New folder created")}><Icon name="plus" size={15} /> New</button>
      </div>
      <div className="col" style={{ gap: 8 }}>
        {FOLDERS.filter(f => !f.system).map(f => (
          <div key={f.id} className="row between" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "11px 14px" }}>
            <div className="row" style={{ gap: 10 }}><Icon name="folder" size={18} style={{ color: "var(--accent)" }} />
              <span style={{ fontWeight: 600 }}>{f.name}</span><span className="meta">{f.count} notes</span></div>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn btn-ghost btn-icon" onClick={() => app.toast("Rename folder")}><Icon name="edit" size={16} /></button>
              <button className="btn btn-ghost btn-icon" style={{ color: "var(--rec)" }} onClick={() => app.toast("Folder deleted")}><Icon name="trash" size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <span className="eyebrow" style={{ display: "block", margin: "26px 0 10px" }}>Tags · cut across everything, power search</span>
      <div className="row wrap" style={{ gap: 8 }}>
        {ALL_TAGS.map(t => <span key={t} className="chip on">{t} <Icon name="x" size={13} /></span>)}
        <span className="chip" style={{ borderStyle: "dashed", color: "var(--accent-deep)" }} onClick={() => app.toast("Add a tag")}><Icon name="plus" size={13} /> Add tag</span>
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 15, marginTop: 18 }}>
        Tags attach when you save a note and can be edited any time — they feed both Search and the dashboard filters.
      </p>
    </div>
  );

  if (desktop) return <DesktopShell app={app} active="folders"><div className="d-top"><span className="eyebrow">Settings</span><span className="grow" /><button className="btn btn-ghost btn-sm" onClick={() => app.nav("dashboard")}><Icon name="back" size={17} /> Back to notes</button></div><div className="scrollable grow">{inner}</div></DesktopShell>;
  return (<><div className="m-top"><button className="btn btn-ghost btn-sm" onClick={() => app.nav("dashboard")}><Icon name="back" size={17} /></button><span style={{ fontWeight: 600 }}>Organise</span><span style={{ width: 28 }} /></div><MobileShell app={app} active="folders">{inner}</MobileShell></>);
}

/* ============================================================ SEARCH */
function SearchScreen({ app, platform }) {
  const { NOTES } = window.NenapData;
  const [q, setQ] = useStateD("mitosis");
  const [scope, setScope] = useStateD("all");
  const desktop = platform === "desktop";
  const ql = q.trim().toLowerCase();
  const results = !ql ? [] : NOTES.filter(n =>
    n.title.toLowerCase().includes(ql) || n.tags.join(" ").toLowerCase().includes(ql) ||
    n.excerpt.toLowerCase().includes(ql) || (n.transcript || "").toLowerCase().includes(ql));

  const inner = (
    <div style={{ maxWidth: desktop ? 720 : "none", margin: desktop ? "0 auto" : 0, padding: desktop ? "22px 30px 50px" : "0 var(--pad) 30px" }}>
      <div className="search-field" style={{ padding: "11px 16px" }}>
        <Icon name="search" size={19} />
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search notes, transcripts, tags…" />
        {q && <Icon name="x" size={16} style={{ cursor: "pointer", color: "var(--ink-3)" }} onClick={() => setQ("")} />}
      </div>
      <div className="row wrap" style={{ gap: 7, margin: "14px 0 18px" }}>
        <span className="meta" style={{ marginRight: 2 }}>in</span>
        {[["all", "Everything"], ["title", "Titles"], ["tags", "Tags"], ["script", "Transcripts"]].map(([k, l]) =>
          <span key={k} className={"chip" + (scope === k ? " on" : "")} onClick={() => setScope(k)}>{l}</span>)}
      </div>
      {ql
        ? <><span className="eyebrow">{results.length} result{results.length !== 1 ? "s" : ""} for “{q}”</span>
            <div className="col" style={{ gap: 12, marginTop: 12 }}>
              {results.map(n => <NoteCard key={n.id} note={n} compact={!desktop} onClick={() => app.openNote(n.id)} />)}
              {!results.length && <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--ink-2)" }}>Nothing yet — try a different word.</p>}
            </div></>
        : <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--ink-2)", textAlign: "center", marginTop: 30 }}>Start typing to search across everything.</p>}
    </div>
  );

  if (desktop) return <DesktopShell app={app} active="dashboard"><div className="d-top"><span className="eyebrow">Search</span><span className="grow" /><button className="btn btn-ghost btn-sm" onClick={() => app.nav("dashboard")}><Icon name="back" size={17} /> Back</button></div><div className="scrollable grow">{inner}</div></DesktopShell>;
  return (<><div className="m-top"><span style={{ fontWeight: 600 }}>Search</span><button className="btn btn-ghost btn-sm" onClick={() => app.nav("dashboard")}>Done</button></div><MobileShell app={app} active="search">{inner}</MobileShell></>);
}

/* ============================================================ MODALS */
function FolderPicker({ value, onPick }) {
  return (
    <div>
      {window.NenapData.FOLDERS.filter(f => !f.system).map(f => (
        <div key={f.id} className={"opt-row" + (value === f.id ? " on" : "")} onClick={() => onPick(f.id)}>
          <Icon name="folder" size={17} style={{ color: "var(--accent)" }} /> <span style={{ fontWeight: 500 }}>{f.name}</span>
          <span className="rad" />
        </div>
      ))}
    </div>
  );
}

function ModalHost({ app }) {
  const m = app.s.modal;
  const [folder, setFolder] = useStateD("college");
  const [tags, setTags] = useStateD(["Lecture"]);
  if (!m) return null;
  const close = () => app.set({ modal: null });
  const toggleTag = (t) => setTags(x => x.includes(t) ? x.filter(y => y !== t) : [...x, t]);

  let content, sheet = false;
  if (m === "save-note" || m === "save-rec") {
    const isRec = m === "save-rec";
    content = (
      <>
        <h4>{isRec ? "Save recording" : "Save note"}</h4>
        <p className="sub">{isRec ? "Give it a title — then a clean note generates in the background." : (app.s.editorRec ? "We’ll quietly enhance this once it’s saved." : "No recording attached — this saves instantly.")}</p>
        {isRec && <><label className="field-lab">Title</label><input className="input" placeholder="Q3 Planning — Leadership sync" /></>}
        <label className="field-lab">Folder</label>
        <FolderPicker value={folder} onPick={setFolder} />
        <label className="field-lab">Tags</label>
        <div className="row wrap" style={{ gap: 7 }}>
          {window.NenapData.ALL_TAGS.map(t => <span key={t} className={"chip" + (tags.includes(t) ? " on" : "")} onClick={() => toggleTag(t)}>{t}</span>)}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={close}>{isRec ? "Discard" : "Cancel"}</button>
          <button className="btn btn-primary" onClick={() => app.completeSave(isRec)}>Save</button>
        </div>
      </>
    );
  } else if (m === "delete") {
    content = (
      <>
        <h4>Delete this note?</h4>
        <p className="sub">“{app.note().title}” and its recording will be removed. This can’t be undone.</p>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={close}>Keep</button>
          <button className="btn btn-primary" style={{ background: "var(--rec)", boxShadow: "none" }} onClick={() => { close(); app.nav("dashboard"); app.toast("Note deleted"); }}>Delete</button>
        </div>
      </>
    );
  } else if (m === "move") {
    content = (<><h4>Move to folder</h4><p className="sub">A note lives in exactly one folder.</p><FolderPicker value={folder} onPick={setFolder} /><div className="modal-foot"><button className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={() => { close(); app.toast("Moved to " + window.NenapData.FOLDERS.find(f => f.id === folder).name); }}>Move</button></div></>);
  } else if (m === "tags") {
    content = (<><h4>Edit tags</h4><div className="row wrap" style={{ gap: 7, marginTop: 6 }}>{window.NenapData.ALL_TAGS.map(t => <span key={t} className={"chip" + (tags.includes(t) ? " on" : "")} onClick={() => toggleTag(t)}>{t}</span>)}</div><div className="modal-foot"><button className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={() => { close(); app.toast("Tags updated"); }}>Save tags</button></div></>);
  } else if (m === "more") {
    sheet = true;
    const item = (ic, label, fn, danger) => <div className="opt-row" style={{ marginBottom: 8, color: danger ? "var(--rec)" : undefined }} onClick={fn}><Icon name={ic} size={18} /> <span style={{ fontWeight: 500 }}>{label}</span></div>;
    content = (<><h4 style={{ marginBottom: 14 }}>{app.note().title}</h4>{item("move", "Move to folder", () => app.openModal("move"))}{item("tag", "Edit tags", () => app.openModal("tags"))}{item("spark", "Improve again", () => { close(); app.improve(); })}{item("trash", "Delete note", () => app.openModal("delete"), true)}<button className="btn btn-ghost btn-block" style={{ marginTop: 6 }} onClick={close}>Cancel</button></>);
  } else if (m === "restore") {
    content = (<><h4>Restore unsaved draft?</h4><p className="sub">We kept your title, notes, transcript progress and recording from before.</p><div className="modal-foot"><button className="btn btn-ghost" onClick={() => { close(); app.toast("Draft discarded"); }}>Discard</button><button className="btn btn-primary" onClick={() => { close(); app.nav("editor"); }}>Restore draft</button></div></>);
  }

  return (
    <div className={"scrim" + (sheet ? " sheet-scrim" : "")} onClick={close}>
      <div className={"modal" + (sheet ? " sheet" : "")} onClick={e => e.stopPropagation()}>{content}</div>
    </div>
  );
}

Object.assign(window, { EnhancingOverlay, NoteBody, NoteScreen, FoldersScreen, SearchScreen, ModalHost });
