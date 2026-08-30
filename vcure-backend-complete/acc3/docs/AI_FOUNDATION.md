# V-Cure — AI Foundation Documentation

**Phase:** 2 of the authorized implementation order
**Status:** AI Foundation, Prompt Builder, Prompt Templates, Knowledge Base,
Vector Search, Embedding Pipeline, Safety Engine, Medical Rule Engine,
Nutrition Rule Engine, Validation Layer, Response Formatter, Explainability
Engine, Recommendation Engine Foundation, OCR Foundation — all complete.

---

## 1. Source documents used this phase

Same gaps as reported at the end of Phase 1: **`Engineering_Rules.docx` and
`Foundation.docx` have still not been received** in this conversation (only
`AI___Design.docx`, `Data_Layer.docx`, `Development_Layer.docx` exist on
disk — verified at the start of every phase). Those two documents would hold
`08_AI_ENGINE_ARCHITECTURE.md` and `08.5_SECURITY_AND_COMPLIANCE.md`, which
are the named highest-priority sources for exactly this phase.

Everything in this phase was built from:
- The `AI___Design.docx` master prompt's "AI RESPONSIBILITIES", "AI RULES",
  "AI TECH STACK", and "WHEN IMPLEMENTING FEATURES" sections.
- The Prisma schema and its section-numbered comments from Phase 1 (which
  themselves trace to `04_BUSINESS_DOMAIN_MODEL.md` and
  `03_DATABASE_ARCHITECTURE.md`).
- Ordinary software-engineering judgement for anything the above two sources
  underspecify (e.g. exact retry/backoff numbers, chunk overlap size).

If `Engineering_Rules.docx` arrives later, re-check in particular: provider
model choices/defaults in `prisma/seed/ai-foundation.seed.ts`, the retry/
timeout defaults in `src/ai/config/ai.config.ts`, and anything this doc
marks below as "assumption, not spec."

## 2. Folder structure

```
src/ai/
├── ai.module.ts              # NestJS module wiring every provider/service
├── ai.tokens.ts               # DI tokens for config values & dual-instance providers
├── config/ai.config.ts        # zod-validated environment config
├── errors/ai.errors.ts        # AIError hierarchy (safe user messages, internal detail)
├── types/pipeline.types.ts    # Safety->Rule->Validation->Formatter shared contracts
├── interfaces/
│   ├── ai-provider.interface.ts    # AIProvider (complete/embed/healthCheck)
│   └── vision-provider.interface.ts # VisionProvider (extractText, for OCR)
├── providers/
│   ├── resilience.util.ts     # shared timeout+backoff wrapper
│   ├── openai.provider.ts     # real OpenAI-compatible HTTP client
│   ├── gemini.provider.ts     # real Gemini HTTP client + vision OCR
│   └── provider.factory.ts    # resolves provider+model by `purpose` via ModelConfiguration
├── prompt-templates/
│   ├── content/                # canonical, production template TEXT (source of truth)
│   └── prompt-template.service.ts # DB-first load, bundled-fallback on DB failure
├── prompt-builder/prompt-builder.service.ts  # template + variables -> ChatMessage[]
├── knowledge-base/knowledge-base.service.ts  # KnowledgeArticle CRUD + RAG retrieval
├── vector-search/
│   ├── vector-store.interface.ts
│   ├── providers/{http,in-memory}-vector-store.provider.ts
│   └── vector-search.service.ts
├── embedding-pipeline/{chunker.ts, embedding.service.ts}
├── safety-engine/
│   ├── safety-engine.types.ts
│   ├── rules/{allergy,medical-condition,medicine-interaction}.rule.ts
│   └── safety-engine.service.ts
├── medical-rule-engine/
│   ├── rules/{metabolic-cardio,renal-hepatic-pregnancy}.rule.ts
│   └── medical-rule-engine.service.ts
├── nutrition-rule-engine/nutrition-rule-engine.service.ts
├── common/
│   ├── validators/output-schemas.ts   # one zod schema per template category
│   └── pipeline/{validation-layer,response-formatter}.service.ts
├── explainability-engine/explainability-engine.service.ts
├── recommendation-engine/recommendation-engine-foundation.service.ts
├── ocr/ocr.service.ts
└── tests/                     # see docs/AI_TESTING_STRATEGY.md
```

## 3. The mandatory pipeline

Every AI-generated recommendation flows through, in this exact order
(enforced in code by `RecommendationEngineFoundationService.generate()`):

```
Input validation (zod, at the service boundary)
        │
        ▼
┌───────────────┐
│ SAFETY ENGINE │  deterministic, DB-relational — allergy / critical-condition /
└───────┬───────┘  medicine-interaction. BLOCKS the pipeline on any failure.
        │ PASSED
        ▼
┌───────────────────────────────┐
│ RULE ENGINE (parallel)        │  Medical Rule Engine (condition-specific
│  Medical ⟂ Nutrition          │  nutrient thresholds) + Nutrition Rule Engine
└───────┬────────────────────────┘  (calorie/macro fit). WARNING-only by design —
        │ passed                    does not block; SAFETY already gates hard cases.
        ▼
   AI provider call (Prompt Builder -> AIProviderFactory -> provider.complete())
        │ raw text
        ▼
┌────────────────┐
│ VALIDATION      │  zod-parses the raw text against the template's declared
│ LAYER           │  JSON schema. Rejects malformed/off-schema output outright.
└───────┬─────────┘
        │ validated data
        ▼
   Persist MealRecommendation + MealReason rows
        │
        ▼
┌────────────────────┐
│ EXPLAINABILITY      │  best-effort enhancement; failure here does NOT fail
│ ENGINE               │  the overall recommendation (Sec. 50 baseline is
└───────┬──────────────┘  already met by the reasons persisted above).
        │
        ▼
┌────────────────┐
│ RESPONSE        │  wraps final payload in PipelineResult<T>, strips any
│ FORMATTER       │  internal stage data from the trace.
└───────┬─────────┘
        │
        ▼
   RecommendationLog row written (audit trail, pass or fail, every time)
```

This exact chain is what `src/ai/tests/ai-integration.spec.ts` exercises
with real (non-mocked) engine classes.

## 4. Provider abstraction

`AIProvider` (chat/embedding) and `VisionProvider` (OCR image input) are the
only two vendor-facing interfaces. `OpenAICompatibleProvider` and
`GeminiProvider` implement them with real `fetch()` calls — no mock/stub
logic inside the provider classes themselves. `AIProviderFactory` resolves
which provider+model to use per `purpose` string by querying the
`ModelConfiguration` table (never a hardcoded model name in a service).

**Untested against a live API** — see §7 "What could not be verified in this
sandbox."

## 5. Prompt template governance

- Template TEXT lives in exactly one place: `src/ai/prompt-templates/content/*.ts`.
- `prisma/seed/ai-foundation.seed.ts` projects that source into the
  `PromptTemplate` table — it does not define template text itself.
- `PromptTemplateService` reads the DB first (so templates can be updated
  without a redeploy) and falls back to the bundled content if the DB is
  unreachable.
- Any edit to a template's behavior means editing the `.ts` content file and
  bumping `version` — the seed script detects the diff and writes a
  `PromptHistory` row automatically rather than overwriting silently.
- Every template's system prompt includes the same non-negotiable safety
  footer (never diagnose, never prescribe, never contradict Safety
  Validation, never ignore allergies/conditions/medicines).

See `docs/PROMPT_CATALOG.md` for the full text of every production template.

## 6. Safety-critical design decisions

- **Safety Engine is deterministic first.** All three rules (Allergy,
  Medical Condition, Medicine Interaction) are direct relational database
  queries — no LLM call is in the blocking path. The `safety_validation_v1`
  LLM template exists as a supplementary pattern-matcher for a *future*
  second-opinion layer; it is not wired into `SafetyEngineService` in this
  foundation phase, specifically so a prompt-injected or hallucinated LLM
  response can never be the sole reason a recommendation passes.
- **All three safety rules always run**, even after one fails — so a
  `SafetyValidation` row captures the complete picture for audit/clinician
  review, not just the first failure found.
- **Medical/Nutrition Rule Engines never block.** Hard blocking is Safety
  Engine's job only. This keeps the "why was this blocked" question
  answerable from exactly one place (`SafetyValidation.blockedReason`).
- **`FoodMedicineInteraction` is a new, additive table** (Migration
  `000000000001`) — required because `FoodRestriction` has no medicine
  foreign key and `Medicine` is a per-user free-text table, not a drug
  catalog. See `docs/SCHEMA_CHANGELOG.md` for the full justification and
  backward-compatibility statement.

## 7. What could not be verified in this sandbox

This environment has no outbound network access (confirmed via a failed
`npm install` in Phase 1) and no live PostgreSQL/Redis/vector-DB instance.
As a direct consequence:

| Not verifiable here | What was done instead |
|---|---|
| Real OpenAI/Gemini API responses | Provider classes make real `fetch()` calls with correct request/response shapes per each vendor's public API docs (from training knowledge); every call site is covered by a mocked-`fetch` unit test asserting the request shape and response parsing, but the vendor's actual current API behavior was not exercised live. |
| Real vector database (Pinecone/Qdrant/etc.) | `HttpVectorStoreProvider` implements a generic REST contract; `InMemoryVectorStoreProvider` is a fully real, tested, in-process fallback used by default until `VECTOR_DB_URL` is set. |
| `npx tsc --noEmit` / real ESLint run | No node_modules (npm install fails — no registry access). Static checks instead: 39/39 AI-layer files have 0 broken relative imports (verified via a Python import-resolution script); DI token usage manually cross-checked file by file (see Phase 2, message 3). A real `tsc`/`eslint` run is required before merging — see `docs/VERIFICATION_REPORT.md` §"Not run: requires npm install." |
| Real Jest execution | `jest.config.js` + all spec files are written and internally consistent (mock shapes match real service constructor signatures), but `npx jest` itself could not be executed here (no `node_modules`). Test descriptions above document exactly what each spec asserts so a reviewer can read them as a specification even without running them. |
| Real network/DB latency | Performance tests measure in-process orchestration overhead only — see `docs/PERFORMANCE_BENCHMARKS.md` for the honest scope of what was and wasn't measured. |

**Action required before production use:** run `npm install`, `npx tsc
--noEmit`, `npx eslint src/ai`, and `npx jest` in an environment with
registry access, using real (test-tier) API keys against a scratch DB, and
treat this document's claims as "structurally verified, execution-pending"
until that happens.
