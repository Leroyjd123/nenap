// nenap/app.jsx — controller, router, device frames, scene sync, tweaks
const { useState: useS, useEffect: useE, useRef: useR, useImperativeHandle, forwardRef } = React;

const SCREENS = {
  auth: AuthScreen, dashboard: DashboardScreen, editor: EditorScreen,
  record: RecordScreen, note: NoteScreen, folders: FoldersScreen, search: SearchScreen,
};

/* ---------------- one self-contained Nenap instance ---------------- */
const NenapApp = forwardRef(function NenapApp({ platform, start }, ref) {
  const [s, setS] = useS({
    screen: start || "dashboard", folder: "all", noteId: "cellbio4", noteTab: "enhanced",
    editorRec: false, recElapsed: 0, modal: null, enhancing: false, improvedAt: 0, toast: null,
  });
  const set = (patch) => setS(p => ({ ...p, ...patch }));
  const tRef = useR(null), eRef = useR(null);

  const app = {
    s, set, platform,
    nav: (screen, patch = {}) => set({ screen, modal: null, ...patch }),
    openModal: (modal) => set({ modal }),
    openNote: (noteId, noteTab = "enhanced") => set({ screen: "note", noteId, noteTab, modal: null }),
    note: () => window.NenapData.NOTES.find(n => n.id === s.noteId) || window.NenapData.NOTES[0],
    startRec: () => set({ editorRec: true, recElapsed: 0 }),
    toast: (msg) => { set({ toast: msg }); clearTimeout(tRef.current); tRef.current = setTimeout(() => setS(p => ({ ...p, toast: null })), 2200); },
    improve: () => {
      set({ enhancing: true, noteTab: "enhanced" });
      clearTimeout(eRef.current);
      eRef.current = setTimeout(() => setS(p => ({ ...p, enhancing: false, improvedAt: Date.now() })), 2700);
      setTimeout(() => app.toast("Enhanced note updated"), 2750);
    },
    completeSave: (isRec) => {
      const hadRec = isRec || s.editorRec;
      set({ modal: null, editorRec: false, recElapsed: 0, screen: "note", noteId: "cellbio4", noteTab: "enhanced" });
      if (hadRec) {
        set({ enhancing: true });
        clearTimeout(eRef.current);
        eRef.current = setTimeout(() => setS(p => ({ ...p, enhancing: false, improvedAt: Date.now() })), 2700);
        setTimeout(() => app.toast("Saved — enhanced note ready"), 2750);
      } else {
        setTimeout(() => app.toast("Note saved"), 60);
      }
    },
  };

  useImperativeHandle(ref, () => ({
    goScene: (id) => {
      const base = { modal: null, enhancing: false, editorRec: false, recElapsed: 0 };
      if (id === "note") setS(p => ({ ...p, ...base, screen: "note", noteId: "cellbio4", noteTab: "enhanced", improvedAt: 0 }));
      else if (id === "dashboard") setS(p => ({ ...p, ...base, screen: "dashboard", folder: "all" }));
      else setS(p => ({ ...p, ...base, screen: id }));
    },
  }));

  // recording timer
  useE(() => {
    const ticking = s.screen === "record" || s.editorRec;
    if (!ticking) return;
    const iv = setInterval(() => setS(p => ({ ...p, recElapsed: p.recElapsed + 1 })), 1000);
    return () => clearInterval(iv);
  }, [s.screen, s.editorRec]);

  const Screen = SCREENS[s.screen] || DashboardScreen;
  return (
    <div className="app">
      <Screen app={app} platform={platform} />
      <ModalHost app={app} />
      {s.toast && <div className="toast"><span className="t-dot"><Icon name="check" size={16} /></span> {s.toast}</div>}
    </div>
  );
});

/* ---------------- device frames ---------------- */
function BrowserFrame({ children }) {
  return (
    <div className="frame-wrap">
      <div className="frame-lab">Desktop · web</div>
      <div className="browser">
        <div className="browser-bar">
          <div className="tl"><i /><i /><i /></div>
          <div className="browser-addr"><Icon name="search" size={12} /> nenap.app</div>
          <div style={{ width: 52 }} />
        </div>
        <div className="browser-body">{children}</div>
      </div>
    </div>
  );
}
function PhoneFrame({ children }) {
  return (
    <div className="frame-wrap">
      <div className="frame-lab">Mobile · iOS</div>
      <div className="phone">
        <div className="phone-screen">
          <div className="statusbar"><span>9:41</span><div className="dyn" /><div className="si"><Icon name="wave" size={14} /><i /></div></div>
          <div className="phone-app">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- tweak config ---------------- */
const PAIRINGS = {
  Editorial: { display: "'Newsreader', Georgia, serif", ui: "'Hanken Grotesk', system-ui, sans-serif", mono: "'Spline Sans Mono', ui-monospace, monospace" },
  Modern: { display: "'Space Grotesk', system-ui, sans-serif", ui: "'Hanken Grotesk', system-ui, sans-serif", mono: "'Spline Sans Mono', ui-monospace, monospace" },
  Humanist: { display: "'Hanken Grotesk', system-ui, sans-serif", ui: "'Hanken Grotesk', system-ui, sans-serif", mono: "'Spline Sans Mono', ui-monospace, monospace" },
};
const RADII = { Sharp: 4, Soft: 13, Round: 22 };
const ACCENTS = ["#6f7d57", "#b3705a", "#2f6f6a", "#5b5bd2"];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "pairing": "Editorial",
  "density": "regular",
  "radius": "Soft",
  "accent": "#6f7d57"
}/*EDITMODE-END*/;

/* ---------------- top-level canvas ---------------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const deskRef = useR(null), mobRef = useR(null);
  const [scene, setScene] = useS("dashboard");
  const { SCENES } = window.NenapData;

  const go = (id) => { setScene(id); deskRef.current && deskRef.current.goScene(id); mobRef.current && mobRef.current.goScene(id); };

  const p = PAIRINGS[t.pairing] || PAIRINGS.Editorial;
  const rootStyle = {
    "--font-display": p.display, "--font-ui": p.ui, "--font-mono": p.mono,
    "--accent": t.accent, "--r": (RADII[t.radius] || 13) + "px",
  };

  return (
    <div className="np-root" data-density={t.density === "regular" ? "regular" : t.density} style={rootStyle}>
      <div className="cv-head">
        <div>
          <h1 className="cv-title">Nenap<b>.</b> — hi-fi prototype</h1>
          <p className="cv-sub">Calm, notes-first capture. Recording is supportive; the AI hands back a cleaner note. Both frames are live — click around independently, or jump both with the scene buttons.</p>
        </div>
        <div className="cv-scenes">
          <span className="lab">Scenes</span>
          {SCENES.map(sc => <button key={sc.id} className={"scene-chip" + (scene === sc.id ? " on" : "")} onClick={() => go(sc.id)}>{sc.label}</button>)}
        </div>
      </div>

      <div className="cv-stage">
        <BrowserFrame><NenapApp ref={deskRef} platform="desktop" start="dashboard" /></BrowserFrame>
        <PhoneFrame><NenapApp ref={mobRef} platform="mobile" start="dashboard" /></PhoneFrame>
      </div>

      <TweaksPanel>
        <TweakSection label="Typography" />
        <TweakRadio label="Font pairing" value={t.pairing} options={["Editorial", "Modern", "Humanist"]} onChange={v => setTweak("pairing", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular", "roomy"]} onChange={v => setTweak("density", v)} />
        <TweakRadio label="Corners" value={t.radius} options={["Sharp", "Soft", "Round"]} onChange={v => setTweak("radius", v)} />
        <TweakSection label="Color" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS} onChange={v => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
