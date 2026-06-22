# AI Monitoring (Langfuse)

Nenap uses [Langfuse](https://langfuse.com) to observe its LLM calls — the Gemini
requests that transcribe recordings, enhance notes, and suggest folders/tags. It
captures the prompt, the output, latency, token usage, and cost for every call, so we
can debug quality, watch spend, and (later) run evals and version prompts.

Like the other integrations, Langfuse is **entirely optional**. With no keys set, the
SDK never initialises and every tracing call is a safe no-op — dev, CI, and tests are
unaffected.

## Setup

1. Create a project at [cloud.langfuse.com](https://cloud.langfuse.com) (EU) or
   [us.cloud.langfuse.com](https://us.cloud.langfuse.com) (US), or self-host.
2. In **Project Settings → API Keys**, create a key pair (public `pk-lf-…` + secret `sk-lf-…`).
3. Set them in **`backend/.env`**:
   ```
   LANGFUSE_PUBLIC_KEY="pk-lf-..."
   LANGFUSE_SECRET_KEY="sk-lf-..."
   LANGFUSE_BASEURL="https://cloud.langfuse.com"   # must match your project's region
   ```
4. Restart the backend. Process a note (record or "Improve") and the trace appears in
   Langfuse within a few seconds.

## Architecture

Langfuse is a **backend-only** concern — all LLM calls live in `GeminiService`.

| Piece | File | Role |
| --- | --- | --- |
| Client | [`langfuse.service.ts`](../backend/src/langfuse/langfuse.service.ts) | Wraps the Langfuse client; env-gated; `trace()` returns `undefined` when disabled. Global module. |
| Trace | [`processing.service.ts`](../backend/src/processing/processing.service.ts) | Opens **one trace per processing job** (`note-processing`), tagged with `userId` + `noteId`. |
| Generations | [`gemini.service.ts`](../backend/src/gemini/gemini.service.ts) | Each Gemini call (`transcribe`, `enhance`, `organise`) logs a generation under that trace. |

### Trace shape

Processing one note produces a single trace with up to three child generations:

```
note-processing                (trace · userId, noteId)
├── transcribe                 (generation · model, mimeType → transcript, tokens)
├── enhance                    (generation · model, prompt → enhanced HTML, tokens)
└── organise                   (generation · model, prompt → {folder, tags}, tokens)  [if auto-organise on]
```

Each generation records the model, input, output, **token usage** (`input`/`output`/
`total`, mapped from Gemini's `usageMetadata`), and latency. Langfuse uses the model
name + tokens to compute **cost** automatically. Failed calls end with `level: ERROR`
and the error message; unparseable `organise` output ends with `level: WARNING`.

The Gemini methods take an **optional** `trace` argument — passing nothing (or running
with Langfuse disabled) skips all tracing, so the AI path is unchanged when it's off.

## Notes & privacy

- LLM observability inherently records prompts and outputs — that's the point (you need
  to see what the model did to debug and improve it). This means **note content and
  transcripts are sent to your Langfuse project.** Keep that in mind for data residency;
  pick the region accordingly. To redact, add a `mask` function in `langfuse.service.ts`.
- This is distinct from PostHog (see [ANALYTICS.md](./ANALYTICS.md)), where we
  deliberately **never** send note content. Langfuse is the one place model I/O lives.
- Flushing is handled automatically (batched, and flushed on shutdown via
  `onModuleDestroy`). No manual flush needed.

## Roadmap (from the observability brief)

Langfuse is the foundation for the next two steps:
- **AI evals** — score traces (faithfulness to the original note, structure quality)
  using Langfuse scores, manually or via an LLM-as-judge.
- **Prompt versioning** — move the transcribe/enhance/organise prompts into Langfuse
  Prompt Management so they can be edited and versioned without a deploy.
