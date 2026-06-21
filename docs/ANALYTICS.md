# Analytics (PostHog)

Nenap uses [PostHog](https://posthog.com) for product analytics — who is using the
app and which core actions they take. PostHog is open-source, has a generous free
tier, and supports self-hosting if we ever want to own the data outright.

Analytics is **entirely optional**. With no key configured, every tracking call is a
safe no-op — the app behaves identically. This keeps local dev and tests clean and
means analytics can never break a user flow.

## Setup

1. Create a project at [app.posthog.com](https://app.posthog.com) (or self-host).
2. Copy the **Project API key** (starts with `phc_`) and note your region's host
   (`https://us.i.posthog.com` or `https://eu.i.posthog.com`).
3. Set the keys in both apps:

   **`frontend/.env.local`**
   ```
   NEXT_PUBLIC_POSTHOG_KEY="phc_..."
   NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
   ```

   **`backend/.env`** (same project key + host)
   ```
   POSTHOG_KEY="phc_..."
   POSTHOG_HOST="https://us.i.posthog.com"
   ```

4. Restart both dev servers. That's it — pageviews, identified users, and the events
   below start flowing.

## Architecture

The frontend and backend each talk to PostHog through a thin facade so the rest of
the codebase never imports the SDK directly (keeps it swappable and the no-op
guarantee in one place).

| Concern | Frontend | Backend |
| --- | --- | --- |
| SDK | `posthog-js` | `posthog-node` |
| Facade | [`frontend/src/lib/analytics.ts`](../frontend/src/lib/analytics.ts) | [`backend/src/analytics/analytics.service.ts`](../backend/src/analytics/analytics.service.ts) |
| Boots in | [`AnalyticsProvider`](../frontend/src/components/analytics-provider.tsx) (wraps the app) | `AnalyticsModule` (global) |
| Config flag | `isAnalyticsConfigured` in `lib/env.ts` | `POSTHOG_KEY` present in `config/env.ts` |

**Why both?** The frontend captures user behaviour (clicks, navigation, intent). The
backend captures async lifecycle outcomes the browser can't observe — a note finishes
(or fails) enhancement minutes later, in the background. Together they give a complete
funnel from "tapped record" to "enhanced note delivered".

### User identity

`AnalyticsProvider` watches the Supabase session: on sign-in it calls
`identify(user.id, { email })`; on sign-out it calls `reset()` so events aren't
attributed to the wrong person on shared devices. The backend uses the same
`user.id` as `distinctId`, so client and server events stitch to one person.

### Pageviews

Client-side navigation in the Next App Router doesn't trigger PostHog's automatic
pageview, so `AnalyticsProvider` sends `$pageview` manually on every route change.
`autocapture` is on for incidental clicks; `capture_pageview` is off to avoid doubles.

## Events

### Frontend (user actions) — `AnalyticsEvent` in `lib/analytics.ts`

| Event | Fired when | Properties |
| --- | --- | --- |
| `note_created` | A new note is saved | `withRecording`, `autoOrganise` |
| `note_saved` | An existing note is saved | `withRecording`, `autoOrganise` |
| `recording_added` | A voice clip is attached to a note | — |
| `note_improved` | "Improve again" is tapped | `noteId` |
| `attachment_added` | A photo or file is uploaded | `kind` (`image`/`file`) |
| `plan_viewed` | The Plans page is opened | — |

### Backend (async outcomes) — `ServerEvent` in `analytics.service.ts`

| Event | Fired when | Properties |
| --- | --- | --- |
| `note_processed` | A processing job completes | `type` (`transcribe`/`enhance`), `noteId` |
| `note_processing_failed` | A job exhausts its retries | `type`, `noteId` |
| `plan_changed` | A user's plan changes | `plan` |
| `booster_activated` | A booster pass is granted | `days`, `level` |

## Adding an event

1. Add the name to the `AnalyticsEvent` (frontend) or `ServerEvent` (backend) union —
   the type guards every call site.
2. Call `capture('your_event', { ...props })` at the action.
3. Keep the list small and intentional. Prefer a few meaningful funnel events over
   tracking everything.

## Privacy notes

- We identify by Supabase user id and attach email as a trait. Revisit before adding
  PII-heavy properties; never send note content or transcripts to PostHog.
- `person_profiles: 'identified_only'` — anonymous visitors don't create person
  profiles, only identified (signed-in) users do.
- To disable analytics in any environment, simply unset the PostHog key.
