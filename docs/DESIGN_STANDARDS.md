# Nenap — Design Standards

> Source of truth: `design/Nenap Hi-Fi.html` (+ `.standalone.html`, `nenap/*.jsx`, `design/README.md`).
> Canonical tokens: `design-system/nenap-tokens.css`. This doc summarises the rules; the Hi-Fi files win on any detail.

## Brand

Calm, thoughtful, warm, quietly intelligent. Editorial minimalism + tactile softness — "digital slow-living."
Avoid: corporate-productivity aesthetics, futuristic-AI themes, technical jargon, emoji in UI.

> Tagline: *"Focus on the moment. Nenap remembers the rest."* · Mark: firefly (memory).

## Color tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#faf8f2` | app background |
| `--surface` | `#fffdf8` | cards, inputs, bars |
| `--surface-2` | `#f2efe5` | sidebar, rails, segmented track |
| `--surface-3` | `#ece8db` | plain chip/tag fill |
| `--ink` | `#2a2823` | primary text |
| `--ink-2` | `#6e695b` | secondary text |
| `--ink-3` | `#9b9484` | tertiary / meta |
| `--line` / `--line-2` | charcoal @ 10% / 17% | hairline borders |
| `--accent` | `#6f7d57` (sage) | **action / selection** |
| `--rec` | `#b3705a` (clay) | **recording state ONLY** |

Derived accents use `color-mix`: `--accent-tint/soft/line/deep`, `--rec-tint/line`.

> **Hard rule:** sage = any action or selection. Clay = anything recording-related (dots, pills, live transcript).
> **Never** use clay for a generic CTA. Keep the ivory background dominant; apply color at low density.

## Typography

- **Display / prose:** **Newsreader** (serif) — titles, note content, quotes. Weights 500/600; italic for warm asides.
- **UI:** **Hanken Grotesk** — controls, body, nav. 400/500/600/700.
- **Mono:** **Spline Sans Mono** — metadata, tags, transcript, eyebrows. Letter-spacing `.02–.16em`.
- Min body 14–16px (density-dependent). Headings tight line-height; body relaxed (~1.5–1.62).
- Tweakable pairings exist (Editorial/Modern/Humanist); **Editorial (Newsreader) is default.**

## Shape, depth, motion

- Radius `--r` = **14px** (derived `--r-sm` .62×, `--r-xs` .42×). Pills use `99px`.
- Shadows: `--shadow-1` (resting), `--shadow-2` (hover/modal/float) — soft, low-contrast, warm.
- Motion: **120–300 ms**, `cubic-bezier(.2,.7,.3,1)`. Fade, slide, 1–2px lift. No bounce, no spring.
- Buttons lift 1px on hover; press returns to rest.

## Density

`data-density` = `compact | regular | roomy` drives `--sp` (gap), `--fs` (body), `--pad`. Default regular.

## Components (Hi-Fi class names)

- **Buttons** `.btn` + `.btn-primary` (sage), `.btn-soft`, `.btn-ghost`, `.btn-rec` (clay tint). Sizes `.btn-sm/lg/icon/block`.
- **Inputs** `.input` (focus = accent border + 3px tint ring), `.search-field` (pill).
- **Chips** `.chip`/`.chip.on` (filters). **Tags** `.tag` (mono, accent tint) / `.tag.plain`.
- **Segmented** `.seg` (Enhanced/Original/Transcript; Notes/Transcript); `.seg.block` stretches.
- **Note card** `.note-card` — Newsreader title, 2-line excerpt clamp, mono footer; clay `.rec-dot` if it has audio.
- **Avatar** `.av`, **eyebrow** `.eyebrow`, **meta** `.meta`.
- **Recording** `.rec-pill` (pulsing live dot), `.wave`/`.wave.live`, `.comment-chip`.
- **Modal** `.scrim`/`.modal`; mobile bottom `.sheet`. **Toast** `.toast` (ink pill, check icon).
- **AI moment** `.enhancing` overlay: breathing orb (`.enh-orb`), "Improving your note", rotating steps, progress bar (~2.7s) → content reveals with staggered `.reveal` blur-up.

## Layout & shells

- **Desktop** `.d-shell`: 220px `.d-side` sidebar (brand, folders w/ counts, Folders & Tags, user) + `.d-main` (`.d-top` bar + scroll content). 2-column note grid.
- **Mobile** `.m-top` header + scroll body + `.m-tabbar` (Home/Search/Folders) + `.m-fab` (Record + New). Modals slide up as sheets.
- Mobile-first, single-column; generous whitespace; let typography define boundaries for long-form (avoid heavy boxing).

## Content & voice

- Calm, human, encouraging. Empty states never blank — illustrative prompt + gentle microcopy
  (e.g. *"The space is yours when you're ready."*).
- No emoji, no chatbot persona, no "AI" labels. The enhancement just makes the note quietly clearer.

## Implementation notes

- All three fonts are Google Fonts (free) — load via `next/font`.
- `color-mix`/oklab is used throughout — fine for evergreen browsers (our audience leans Chrome/Edge).
- shadcn/ui components must be **re-themed to these tokens**, not left at defaults.
- Accessibility: semantic HTML, visible focus states, sufficient contrast, keyboard-navigable.
