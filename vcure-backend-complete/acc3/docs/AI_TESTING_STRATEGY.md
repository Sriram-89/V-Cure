# AI Foundation — Testing Strategy

## Why every test mocks Prisma and network calls

This sandbox has no outbound network access and no live PostgreSQL/Redis/
vector-DB instance (see `docs/AI_FOUNDATION.md` §7 and the Phase 1 README's
"Environment constraint" section for the same limitation at the DB layer).
Every test in `src/ai/tests/` is therefore a **unit or integration test
against hand-written mocks**, not an end-to-end test against real
infrastructure. This is stated plainly rather than glossed over — see
`docs/VERIFICATION_REPORT.md` for exactly what remains to be run once a real
environment (network + DB + API keys) is available.

## Test file inventory

| File | Layer | What it verifies |
|---|---|---|
| `safety-engine.spec.ts` | Unit | Each of the 3 deterministic rules individually + the orchestrator's aggregation/persistence behavior |
| `medical-rule-engine.spec.ts` | Unit | Each of the 5 condition-specific rules + orchestrator combination |
| `nutrition-rule-engine.spec.ts` | Unit | Calorie budget + macro balance logic, WARNING-only guarantee |
| `validation-layer.spec.ts` | Unit | JSON parsing, code-fence stripping, schema enforcement, field-level errors |
| `response-formatter.spec.ts` | Unit | Success/failure envelope shape, trace sanitization (no internal data leakage) |
| `prompt-builder.spec.ts` | Unit | Template loading (DB + fallback), variable interpolation, missing/unexpected variable rejection |
| `explainability-engine.spec.ts` | Unit | Explanation generation + persistence, empty-explanation rejection |
| `ocr-foundation.spec.ts` | Unit | Full OCR service with a mocked `VisionProvider` — every status outcome (COMPLETED/MANUAL_REVIEW_REQUIRED/FAILED) |
| `ocr-end-to-end.spec.ts` | Integration | Same pipeline but through the REAL `GeminiProvider.extractText()` code path, with only `fetch` mocked |
| `recommendation-engine.spec.ts` | Unit | Full pipeline orchestration with every dependency mocked — verifies stage order and short-circuit behavior |
| `ai-integration.spec.ts` | Integration | Full pipeline with REAL Safety/Medical/Nutrition engine classes wired together — only Prisma and the AI provider's HTTP layer are mocked |
| `knowledge-base.spec.ts` | Unit | CRUD, RAG context assembly, soft-delete cleanup |
| `vector-search.spec.ts` | Unit | Primary/fallback vector store selection logic |
| `embedding-pipeline.spec.ts` | Unit | Chunking correctness + re-embedding idempotency (stale chunk cleanup) |
| `performance.spec.ts` | Performance | Orchestration overhead only — see `docs/PERFORMANCE_BENCHMARKS.md` |
| `security.spec.ts` | Security | Prompt injection resistance, malformed-JSON handling, OCR input validation, sensitive-data leakage prevention |

## Mock strategy (`tests/mocks.ts`)

One shared mock-builder file (`createMockPrisma`, `createMockAIProvider`,
`createMockVisionProvider`, `createMockVectorStore`, `createMockAIEnv`) is
imported by every spec file — this is the CODE QUALITY "reusable" principle
applied to test code: mock shapes are defined once and reused, so a
constructor-signature change to a real service only requires updating one
mock builder, not N spec files.

Every Prisma mock method is a `jest.fn()` with a sensible default return
value (usually an empty result), overridden per-test via
`.mockResolvedValue(...)` — this means a test that doesn't care about a
particular Prisma call doesn't need to configure it.

## Unit vs. integration distinction in this suite

- **Unit tests** instantiate the service under test directly with every
  constructor dependency mocked (even other real AI-layer services).
- **Integration tests** (`ai-integration.spec.ts`, `ocr-end-to-end.spec.ts`)
  instantiate the REAL classes for every internal collaborator, and mock
  only the two things that genuinely require live infrastructure: Prisma
  (database) and `fetch`/HTTP (AI provider network calls). This is the
  maximum realism achievable without actual network/DB access.

## Running the suite (once `npm install` is possible)

```bash
npm install
npx jest --config jest.config.js
npx jest --config jest.config.js --coverage   # coverage report
```

## What is NOT covered by this suite

- Real vendor API response shapes/edge cases (rate limit headers, streaming,
  vendor-specific error bodies beyond HTTP status code).
- Real PostgreSQL constraint enforcement (FK violations, unique constraint
  behavior) — Prisma is fully mocked, so a query that would fail against a
  real DB due to a constraint isn't caught here.
- Load/concurrency behavior under real traffic.
- Real embedding model output quality / retrieval relevance (vectors in
  tests are placeholder arrays, not real semantic embeddings).

These require the live environment described in
`docs/VERIFICATION_REPORT.md` §"Not run: requires infrastructure."
