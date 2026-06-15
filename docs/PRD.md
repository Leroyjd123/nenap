# Nenap — Product Requirements Document (PRD)

> Status: MVP definition · Owner: Leroy (founder) · Last updated: 2026-06-15

## 1. Vision

Nenap is a **calm knowledge-capture app**. It helps people stay present in conversations,
lectures, and meetings without the anxiety of documenting everything. Users write notes naturally;
Nenap can listen alongside them and quietly hand back a cleaner version — **never replacing their
original words**.

> *"Focus on the moment. Nenap remembers the rest."*

The name derives from the Kannada word *Nenapu* — **memory**. The mark is a firefly: small moments
worth remembering.

## 2. What Nenap is — and is not

| Nenap **is** | Nenap is **not** |
|---|---|
| A notebook that remembers alongside you | A transcription app |
| Notes-first, recording-supportive | A meeting assistant |
| A quiet AI helper | A chatbot |
| Calm, editorial, human | A voice recorder |

## 3. Target user

The first user is anyone who takes notes while listening — **students, professionals in meetings,
journalers, thinkers**. They value presence over productivity-theatre. They are not power users
hungry for features; they want calm and trust.

**The magic moment:** finishing a session, tapping *Improve*, and watching a cleaner, well-structured
note gently appear — while their own words remain exactly as written.

## 4. Core principles (non-negotiable)

1. **Notes are primary.** The note is the product; recording is plumbing.
2. **Capture first, organise later.** Never block on naming/foldering up front.
3. **AI is present but gentle.** One quiet "Improving your note" moment. No persona, no chat.
4. **Original intent is sacred.** Enhanced notes are a *separate* version; originals are never overwritten.
5. **One folder per note; tags cross-cut.** Tags power search and dashboard filters.
6. **Calm.** Warm paper palette, generous space, serif reading surface, subtle motion.

## 5. MVP feature set

### 5.1 Authentication
- Email + password (**active for MVP**).
- Google sign-in (UI wired, dormant until Google OAuth credentials are added).
- No onboarding wall — land straight on the dashboard.

### 5.2 Notes
- Create, read, update, delete.
- Title + rich-text body (markdown-based: headings, lists, bold/italic).
- Belongs to exactly one folder; carries zero or more tags.
- Autosaves while editing; offers draft restoration after an unexpected close.

### 5.3 Folders & Tags
- Folders are categories (College, Work, Personal, Ideas…). One folder per note.
- Create / rename / delete folders; move notes between them.
- Tags are free-form, cross-cutting, reusable; added on save or edited later.

### 5.4 Recording
- Record in-browser (WebM/Opus) from within a note **or** record-first from the dashboard.
- Live transcript feedback while recording (best-effort, browser-based).
- Optional: drop inline comments on the transcript that become note content.
- Upload an existing recording for processing.

### 5.5 Processing (AI)
- On save of a note that has a recording → background processing begins.
- Gemini produces: the **canonical transcript** and the **enhanced notes**.
- Stored separately: original notes, transcript, enhanced note version(s).
- States: `draft → processing → completed | failed`. Failed is retryable.

### 5.6 Note view
- Three tabs: **Enhanced** (editable) · **Original** (editable) · **Transcript** (read-only).
- Actions: Improve again, move folder, edit tags, delete.

### 5.7 Improve again (regeneration)
- Re-runs enhancement on the latest notes + transcript → a **new** enhanced version.
- Original notes remain unchanged.

### 5.8 Dashboard & Search
- Reverse-chronological note cards: title, excerpt, date, folder, tags, recording indicator.
- Filters: folder, "has recording", tags, date.
- Search scoped across titles, tags, and transcripts.

## 6. Out of scope for MVP

Real-time collaboration · sharing/export · mobile native apps (responsive web only) · offline-first sync ·
multiple recordings per note (session model) · paid streaming transcription · teams/orgs ·
monetization & billing.

## 7. Success criteria

- A user can sign up, write a note, record, and receive an enhanced note that they find genuinely
  cleaner — within one calm, uninterrupted flow.
- Original notes are *never* altered by AI.
- The app feels calm and polished on both mobile web and desktop, matching the Hi-Fi design.
- The backend is stable: processing failures are recoverable, never silent.

## 8. Business assumptions (MVP)

- Free during MVP; low/no-cost tooling (Supabase free tier, Gemini Flash).
- Soft usage caps to protect cost: ~60 min per recording; a tunable monthly processing limit.
- Monetization, pricing, and free-tier restrictions are **deferred** and require founder decision later.

## 9. Open questions (to revisit)

- Final monthly processing cap value.
- Whether to keep DESIGN.md (superseded by Hi-Fi) or delete it.
- Logo asset weight (current `logo.svg` is 2 MB — confirm crispness at small sizes).
