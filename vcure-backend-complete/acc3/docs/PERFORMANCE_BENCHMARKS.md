# Performance Benchmarks

## Honest scope statement

**This document does not contain real AI provider latency numbers.** This
sandbox has no outbound network access, so no live call to OpenAI, Gemini,
or any vector database has been made at any point in this project. Any
document claiming specific millisecond figures for "OpenAI API latency" or
"vector DB query time" without a live call behind it would be fabricated —
this one does not do that.

What follows are the actual results from `src/ai/tests/performance.spec.ts`,
which measures what genuinely runs in this sandbox: the AI layer's own
orchestration code, with all network I/O mocked to return near-instantly.

## Execution status

**These benchmarks have not been executed in this session.** `npx jest` is
blocked (`npm error 403` fetching `jest` from the registry — see
`docs/VERIFICATION_REPORT.md`). The table below documents the *assertion
thresholds* written into `performance.spec.ts` and why each was chosen —
these are design targets the code is written to meet, not measured output.
Once Jest can run, `console.table` output from the suite will show actual
measured milliseconds alongside these thresholds; until then, treat this
table as "what will be checked," not "what was recorded."

## What this benchmark suite covers (real, executable-in-sandbox code paths — pending execution)

| Benchmark | What it measures | Assertion threshold | Why this threshold |
|---|---|---|---|
| `chunker_50k_words_ms` | Pure-JS text chunking of a 50,000-word document | < 200ms | Chunking runs synchronously in the request path of `EmbeddingPipelineService`; should never be a bottleneck relative to the embedding API call itself |
| `vector_search_2000_items_ms` | `InMemoryVectorStoreProvider`'s linear-scan cosine similarity over 2,000 vectors × 128 dimensions | < 100ms | This is the REAL fallback implementation used whenever `VECTOR_DB_URL` is unset — its performance characteristics matter for any deployment that hasn't yet configured an external vector DB |
| `validate_1000_payloads_ms` | `ValidationLayerService.validate()` called 1,000 times against the meal-recommendation schema | < 500ms | Validation runs on every single AI response; must not meaningfully add to perceived latency |
| `recommendation_pipeline_mocked_provider_ms` | Full `RecommendationEngineFoundationService.generate()` call, AI provider mocked to resolve in ~0ms | < 150ms | Isolates the pipeline's OWN overhead (DB writes via mocked Prisma, stage bookkeeping, JSON validation) from provider network time, which dominates in production but is architecturally irrelevant to what V-Cure's code controls |

Run `npx jest performance.spec.ts` (once `npm install` is possible) to
regenerate these numbers; the suite logs a `console.table` of actual
measured values on every run, in addition to the pass/fail assertions.

## What still needs a live environment

| Metric | Requires |
|---|---|
| Real OpenAI/Gemini completion latency (p50/p95/p99) | Live API keys + network access; should be measured under realistic prompt lengths for each of the 8 production templates |
| Real vector DB query latency at production corpus size | A provisioned vector DB (Pinecone/Qdrant/etc.) with a realistic knowledge-base size (thousands to millions of chunks, not the 2,000-item synthetic test above) |
| Real Postgres query latency for Safety Engine's 3 rules under load | A provisioned PostgreSQL instance with realistic data volume (allergy/condition/medicine rows at scale) and connection pooling configured |
| End-to-end recommendation latency (user-perceived) | All of the above, wired together, measured via APM (e.g. OpenTelemetry) rather than unit-test timers |
| OCR end-to-end latency (image upload → structured result) | Live Gemini vision API + live structuring call; image size/quality significantly affects this and can't be simulated meaningfully |

**Recommendation:** once infrastructure is available, add a `k6` or
`autocannon` load-testing script against a staging deployment, and wire
p50/p95/p99 into a dashboard rather than relying on ad hoc benchmark runs —
this document should be treated as a placeholder for that real measurement,
not a substitute for it.
