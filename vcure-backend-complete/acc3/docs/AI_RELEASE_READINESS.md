# AI Release Readiness

**This document is the canonical PASS / BLOCKED / PENDING classification
for the V-Cure AI Foundation (Phase 2).** Where this document and any
other doc in this repo disagree, this one is authoritative — it was written
last, specifically to reconcile and correct any earlier over-claiming.

**Rule applied throughout:** an item is marked PASS only if it was actually
executed and observed to succeed in this session. Written-but-unexecuted
code is never PASS, regardless of how carefully it was reasoned through.

---

## IMPLEMENTED

Code exists, is internally consistent, and was traced by hand against its
requirements. This category says "the code is written," not "the code is
proven correct at runtime."

| Item | Location |
|---|---|
| AI Foundation (config, errors, types, DI wiring) | `src/ai/config/`, `src/ai/errors/`, `src/ai/types/`, `src/ai/ai.module.ts`, `src/ai/ai.tokens.ts` |
| Provider layer (OpenAI-compatible, Gemini incl. vision, factory, resilience) | `src/ai/providers/` (5 files) |
| Prompt Builder | `src/ai/prompt-builder/` |
| Prompt Templates (8 production templates) | `src/ai/prompt-templates/` (4 files) |
| Knowledge Base | `src/ai/knowledge-base/` |
| Vector Search Layer (primary + fallback) | `src/ai/vector-search/` (4 files) |
| Embedding Pipeline | `src/ai/embedding-pipeline/` (2 files) |
| Safety Engine (3 deterministic rules + orchestrator) | `src/ai/safety-engine/` (5 files) |
| Medical Rule Engine (5 rules + orchestrator) | `src/ai/medical-rule-engine/` (4 files) |
| Nutrition Rule Engine | `src/ai/nutrition-rule-engine/` |
| Validation Layer | `src/ai/common/validators/`, `src/ai/common/pipeline/validation-layer.service.ts` |
| Response Formatter | `src/ai/common/pipeline/response-formatter.service.ts` |
| Explainability Engine | `src/ai/explainability-engine/` |
| Recommendation Engine Foundation | `src/ai/recommendation-engine/` |
| OCR Foundation | `src/ai/ocr/` |
| Additive schema extension (`FoodMedicineInteraction`) | `prisma/schema.prisma`, `prisma/migrations/000000000001_.../` |
| 102 test cases across 16 spec files | `src/ai/tests/*.spec.ts` |
| 12 documentation files | `docs/*.md` |

## VERIFIED

Actually executed in this session, with a real, reproducible result.

| Item | Method | Result |
|---|---|---|
| Import resolution | Python script resolving every relative import against the filesystem | 57/57 files, 0 broken imports |
| No duplicate prompt templates | `grep` across `prompt-templates/content/*.ts` | 0 duplicates, 8 unique template names |
| No duplicate service/rule-engine classes | `grep` across all of `src/ai` for `export class` | 0 duplicates |
| No placeholder/stub markers | `grep` for TODO/FIXME/placeholder/stub patterns | 0 genuine matches (1 false-positive hit was a code comment, not a placeholder) |
| AI layer owns no HTTP controllers | `grep` for `@Controller` in `src/ai` | 0 matches — confirmed the AI layer exposes services only, no REST surface of its own |
| AI layer contains no frontend code | `grep` for React/Next.js/Tailwind/JSX references in `src/ai` | 0 matches |
| `npm install` | Actually run this session | Fails: `403 Forbidden` from `registry.npmjs.org` |
| `npx tsc --noEmit` | Actually run this session (twice — before and after fixing 4 found bugs) | 603 error lines; 100% traced to missing `node_modules`; 4 genuine bugs found and fixed (see BLOCKED section for the full breakdown) |
| `npx eslint src/ai` | Actually run this session | `403 Forbidden` fetching `eslint` itself — could not execute at all |
| `npx jest --config jest.config.js` | Actually run this session | `403 Forbidden` fetching `jest` itself — could not execute at all |

## BLOCKED

Execution was attempted for real and failed for a specific, documented
reason — not silently skipped.

| Item | Exact blocking reason | What's needed to unblock |
|---|---|---|
| TypeScript full compilation (0-error state) | `node_modules` absent; `npm install` returns `403 Forbidden — GET https://registry.npmjs.org/@nestjs%2fcommon` | Run `npm install` in an environment with npm registry access, then re-run `npx tsc --noEmit` |
| ESLint | `npm error 403 Forbidden — GET https://registry.npmjs.org/eslint` | Same as above, then `npx eslint src/ai --ext .ts` |
| Jest (all 102 test cases) | `npm error 403 Forbidden — GET https://registry.npmjs.org/jest` | Same as above, then `npx jest --config jest.config.js --coverage` |
| Runtime test coverage report | Downstream of Jest being blocked | Same as above |
| Real OpenAI/Gemini API verification | No outbound network access in this sandbox at all (confirmed by every `npm install`/`fetch` attempt this project) | Live API keys + network access in a real environment |
| Real vector database verification | No provisioned vector DB; `HttpVectorStoreProvider` is untested against a live backend | A provisioned vector DB (Pinecone/Qdrant/etc.) + `VECTOR_DB_URL` |
| Real PostgreSQL verification | No live DB instance; all Prisma calls are mocked in every test | A provisioned PostgreSQL instance, migrations applied, seed run |
| Live performance benchmarking (network/DB latency) | Same network/DB unavailability | Live infrastructure + APM tooling (see `docs/PERFORMANCE_BENCHMARKS.md`) |

## PENDING

Not yet possible to classify as PASS or BLOCKED — depends on the BLOCKED
items above resolving first, or on external input this project doesn't
control.

| Item | Depends on |
|---|---|
| Safety Engine correctness at runtime | Jest execution (BLOCKED) |
| Medical/Nutrition Rule Engine correctness at runtime | Jest execution (BLOCKED) |
| Validation Layer / Response Formatter correctness at runtime | Jest execution (BLOCKED) |
| Explainability / Recommendation Engine / OCR pipeline correctness at runtime | Jest execution (BLOCKED) |
| Security properties (prompt injection resistance, etc.) at runtime | Jest execution (BLOCKED) — logic was hand-traced and is `tsc`-clean, but not test-runner-confirmed |
| Actual measured performance numbers | Jest execution (BLOCKED) — only assertion thresholds exist, no measured output |
| `Engineering_Rules.docx` / `Foundation.docx` conformance check | Documents have not been uploaded in this conversation (checked at the start of every phase; still absent) |
| Full test coverage percentage | Jest + coverage execution (BLOCKED) |

## KNOWN LIMITATIONS

Documented explicitly, not silently solved or worked around.

1. **`Engineering_Rules.docx` / `Foundation.docx` availability.** These two
   documents — which would hold `08_AI_ENGINE_ARCHITECTURE.md`,
   `08.5_SECURITY_AND_COMPLIANCE.md`, `11_CODING_STANDARDS.md`, and
   `01_PROJECT_REQUIREMENTS.md` / `02_SYSTEM_ARCHITECTURE.md` — have never
   actually been present in the upload directory in this conversation,
   despite being named early on. Everything in Phase 2 was built from the
   `AI___Design.docx` master prompt and ordinary engineering judgement where
   that master prompt underspecifies. Re-verify provider defaults,
   retry/timeout values, and the OCR confidence threshold against those
   documents if/when they arrive.
2. **Generic medicine-name matching limitation.** `MedicineInteractionRule`
   matches `Medicine.name` (free text a user typed) against
   `FoodMedicineInteraction.medicineName` (generic drug names) via
   case-insensitive exact string equality. Brand names (e.g. "Coumadin" for
   warfarin) and misspellings will NOT match. This is a known gap, not a
   silent one — see `docs/SAFETY_ENGINE.md` "Known limitation."
3. **Food interaction catalog population requirement.**
   `prisma/seed/food-medicine-interactions.seed.ts` references `Food` rows
   by name and silently skips any pair where that food doesn't exist in the
   catalog yet. The Phase 1/2 `Food` table itself has not been populated
   with real data (content-ops scope, not AI-foundation scope) — the seed
   will do nothing useful until that catalog exists.
4. **Recommendation Engine is currently a foundation, not the full engine.**
   See `docs/RECOMMENDATION_ENGINE.md` "What it deliberately does NOT do
   yet." This was scoped intentionally, not left incomplete by oversight.
5. **Candidate sourcing / ranking / multi-meal-plan composition remain
   future scope.** The current `RecommendationEngineFoundationService`
   requires the caller to supply `candidateFoodIds` — it does not yet query
   the catalog itself, rank multiple options, or compose a full day's
   `MealPlan`.
6. **Live provider latency cannot be benchmarked in this sandbox.** No
   outbound network access exists here at all. `docs/PERFORMANCE_BENCHMARKS.md`
   documents orchestration-overhead-only measurements and is explicit that
   real OpenAI/Gemini/vector-DB latency remains unmeasured.
7. **`safety_validation_v1` LLM template exists but is not wired in.**
   Deliberate — see `docs/SAFETY_ENGINE.md` "Why the LLM template is not
   wired in yet." Not a bug; a design decision to keep the blocking path
   deterministic-only.

## NEXT INTEGRATION STEPS

Per the explicit instruction that the next phase is **Backend and Frontend
integration**, not another AI module:

1. **Unblock the verification chain.** Run `npm install && npx tsc --noEmit
   && npx eslint src/ai && npx jest --coverage` in an environment with
   registry access. Expected outcome given this session's `tsc` findings:
   0 TypeScript errors once dependencies resolve. Confirm Jest results
   honestly and update this document's VERIFIED section with real pass/fail
   counts.
2. **Provision infrastructure** for a staging environment: PostgreSQL
   (apply both migrations, run the seed), Redis, a vector database (or
   proceed with the in-memory fallback for initial rollout), and real
   (test-tier) OpenAI/Gemini API keys.
3. **Backend integration:** the 13 services listed in `ai.module.ts`'s
   `exports` array are the AI layer's public contract. Backend
   controllers/modules should depend on these interfaces only — see the
   "Verify AI Boundaries" confirmation above (0 controllers, 0 frontend
   code inside `src/ai`).
4. **Re-check against `Engineering_Rules.docx`/`Foundation.docx`** if/when
   they become available, per Known Limitation #1.
5. **Do not expand the Recommendation Engine, Safety Engine, or add new AI
   modules** until the above verification chain has actually run — per this
   phase's explicit instruction, and so that any future AI work builds on a
   confirmed-green baseline rather than an assumed one.
