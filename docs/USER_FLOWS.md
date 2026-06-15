# Nenap — User Flows

> Derived from the founder's flow spec + the Hi-Fi design. Authoritative for behaviour.

## Note states

```text
draft ──▶ processing ──▶ completed
                  └────▶ failed ──▶ (retry) ──▶ processing
```

Notes-only (no recording) go straight `draft → completed` on save.

---

## 1. Authentication
1. User opens Nenap.
2. Chooses **Continue with email** (active) or **Continue with Google** (dormant for now).
3. New user → account created. Existing user → logged in.
4. Lands **directly on the Dashboard** — no onboarding wall.

## 2. Dashboard
- Top: search field; Create Note and Record entry points.
- Filters: folder, "with recording", tags, date.
- Body: reverse-chronological note cards.
- Each card: title · excerpt (2-line clamp) · date · folder · tags · clay recording dot (if audio).
- Sidebar (desktop) / tab bar + FAB (mobile) for navigation.

## 3. Folder management
- Folders act as categories (College, Work, Personal, Ideas…).
- Create / rename / delete folder; move notes between folders.
- A note belongs to exactly **one** folder.

## 4. Create-note flow
1. Tap **Create Note** → editor opens immediately (no naming gate).
2. Layout: title field (top), markdown editor (center), Record action (side/rail), Save.
3. Optional recording: tap Record → recording starts → live transcript appears in the Transcript tab →
   user keeps typing → user can switch Notes ⇄ Transcript.
4. Tap **Save** → modal: choose Folder + add Tags.
5. Save. If a recording exists → background processing starts → enhanced notes generated.

## 5. Record-first flow (from dashboard)
1. Tap **Record** → recording starts immediately.
2. Live transcript appears; user can drop inline comments that become note content.
3. Stop recording → **Save** → prompt for Title + Folder + Tags.
4. Recording + transcript saved → status `processing` → transcript + enhanced notes generated.

## 6. Processing flow
1. Triggered when a recording exists on save.
2. Transcript finalized by Gemini.
3. Gemini receives transcript + user notes/comments → generates **Enhanced Notes**.
4. Persist: transcript, original notes, enhanced notes. Status → `completed`.
5. On failure → status `failed`, retryable (auto-retry with backoff + manual retry).

## 7. Note view
- Tabs: **Enhanced Notes** (editable) · **Original Notes** (editable) · **Transcript** (read-only).
- Actions: Edit enhanced · Edit original · **Improve Again** · Move Folder · Update Tags · Delete.

## 8. Improve again
1. User taps **Improve Again**.
2. Gemini receives latest notes + transcript → produces a **new** enhanced version.
3. Enhanced Notes updated; **Original Notes unchanged**.

## 9. Search
- Global search field.
- Scoped across **titles, tags, transcripts**; filter by folder and date.
- Results show matching note cards.

## 10. Tags
- Add tags on save; edit later.
- Examples: Exam, Important, Ideas, Meeting.
- Drive filtering and search.

## 11. Save flow (summary)
- **Notes only:** Save → pick Folder + Tags → status `completed`.
- **Notes + recording:** Save → pick Folder + Tags → status `processing` → enhanced notes generated.
- **Recording only:** Save → enter Title + Folder + Tags → status `processing` → transcript + enhanced generated.

## 12. Autosave
- While editing, every few seconds a draft saves to the server (debounced).
- A local backup (browser storage) holds unsaved changes.
- If the browser closes unexpectedly → offer draft restoration on return.
- Captured: title, notes, transcript progress, recording metadata.

## 13. Delete
1. User taps Delete → confirmation dialog.
2. On confirm, delete: enhanced notes, original notes, transcript, recording, metadata.
3. Return to Dashboard with a toast confirmation.
