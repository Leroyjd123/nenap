# Nenap — Hi-Fi Design Reference

Calm, notes-first capture app. Recording is **supportive**, not the hero. AI hands back a cleaner
note — present but gentle (a soft "Improving your note" moment, never a chatbot). Both **desktop web**
and **iOS mobile** are designed.

## How to read this folder
- **`Nenap Hi-Fi.html`** — open in a browser. It mounts a React (Babel-in-browser) prototype showing
  desktop + mobile frames side by side, a scene switcher, and a live Tweaks panel.
- **`Nenap Hi-Fi.standalone.html`** — same thing, fully self-contained (all JSX + CSS inlined). Read
  this one if you want every token and component in a single file.
- **`nenap/*.jsx`** — source: `data.jsx` (content + icon set), `screens-core.jsx`
  (Auth, Dashboard, Editor, Record + shells), `screens-detail.jsx` (Note View + AI moment, Folders,
  Search, Modals), `app.jsx` (controller/router/frames/tweaks).
- All design tokens live in the `.np-root` block of `Nenap Hi-Fi.html` `<style>`.

---

## Design tokens

### Color (warm, calm, paper-toned)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#faf8f2` | app background |
| `--surface` | `#fffdf8` | cards, inputs, bars |
| `--surface-2` | `#f2efe5` | sidebar, rails, segmented track |
| `--surface-3` | `#ece8db` | chips/tag plain fill |
| `--ink` | `#2a2823` | primary text |
| `--ink-2` | `#6e695b` | secondary text |
| `--ink-3` | `#9b9484` | tertiary / meta |
| `--line` | `rgba(42,40,35,.10)` | hairline borders |
| `--accent` | `#6f7d57` (sage) | primary action, selection — **tweakable** |
| `--rec` | `#b3705a` (clay) | recording state ONLY |

Derived accents use `color-mix`: `--accent-tint` (13%), `--accent-soft` (22%), `--accent-line` (34%),
`--accent-deep` (78% toward ink, for text on tint). Same pattern for `--rec-tint` / `--rec-line`.

> **Rule:** sage = action/selection. Clay = anything recording-related (dots, pills, live transcript).
> Never use clay for generic CTAs.

### Type
- **Display** (titles, note prose): `Newsreader` serif — editorial, reading-first. Weights 500/600, italic for warm asides.
- **UI** (controls, body, nav): `Hanken Grotesk` — warm humanist sans. 400/500/600/700.
- **Mono** (metadata, tags, transcript, eyebrows): `Spline Sans Mono`. Letter-spacing `.02–.16em`.
- Tweakable pairings: **Editorial** (Newsreader display), **Modern** (Space Grotesk display), **Humanist** (Hanken everywhere).
- Min sizes: body 14–16px (density-dependent), slide/large titles 22–30px.

### Shape & depth
- Radius `--r` default **13px** (tweakable Sharp 4 / Soft 13 / Round 22). Derived `--r-sm` (.62×), `--r-xs` (.42×).
- Shadows: `--shadow-1` (resting card), `--shadow-2` (hover/modal/float). Soft, low-contrast, warm.

### Density (tweakable: compact / regular / roomy)
Drives `--sp` (gap 5/7/10px), `--fs` (body 14/15/16px), `--pad` (13/18/24px).

---

## Components (class names in the HTML)
- **Buttons** `.btn` + `.btn-primary` (sage), `.btn-soft` (surface+border), `.btn-ghost`, `.btn-rec` (clay tint). Sizes `.btn-sm/.btn-lg/.btn-icon/.btn-block`. Hover lifts 1px.
- **Inputs** `.input`, `.search-field` (pill). Focus = accent border + 3px tint ring.
- **Chips** `.chip` / `.chip.on` (filters, tag pickers). **Tags** `.tag` (mono, accent tint) / `.tag.plain`.
- **Segmented control** `.seg` (Enhanced/Original/Transcript; Notes/Transcript). `.seg.block` stretches.
- **Note card** `.note-card` — Newsreader title, 2-line excerpt clamp, mono footer (when · tags · folder · rec duration). Clay `.rec-dot` top-right if it has a recording.
- **Avatar** `.av`, **eyebrow** `.eyebrow` (mono uppercase label), **meta** `.meta`.
- **Recording** `.rec-pill` (clay, pulsing live dot), `.wave`/`.wave.live` (animated bars), `.comment-chip` (drop-a-comment-on-transcript).
- **Modal** `.scrim`/`.modal`; bottom `.sheet` on mobile. **Toast** `.toast` (ink pill, check icon).
- **AI moment** `.enhancing` overlay: breathing orb (`.enh-orb` rings + spinning core), "Improving your note", rotating step text, progress bar. ~2.7s, then content reveals with staggered `.reveal` (blur-up).

## Screens & shells
- **Desktop** = `.d-shell` (220px `.d-side` sidebar: brand, folders w/ counts, Folders & Tags, user) + `.d-main` (`.d-top` bar + scrollable content). 2-col note grid.
- **Mobile** = `.m-top` header + scroll body + `.m-tabbar` (Home/Search/Folders) + `.m-fab` (Record + New note). Modals slide up as sheets.
- Screens: **Auth** (Google + email, lands straight on dashboard — no onboarding wall), **Dashboard** (folder filter + "with recording" filter), **Editor** (notes pane + live recording rail/tab), **Record** (record-first, full transcript + comment-to-note), **Note View** (Enhanced/Original/Transcript tabs, Improve again), **Folders & Tags** (folders = one per note; tags cross-cut + power search), **Search** (scoped: titles/tags/transcripts).

## Product principles to preserve
1. **Notes-first.** The note is the product; recording is plumbing.
2. **Capture first, organise later.** Never block on naming/foldering up front.
3. **AI present but gentle.** A quiet helper — the "Improving" moment is the only flourish; no persona, no chat.
4. **One folder per note; tags cross-cut.** Tags feed search + dashboard filters.
5. **Calm.** Warm paper palette, generous space, serif reading surface.
