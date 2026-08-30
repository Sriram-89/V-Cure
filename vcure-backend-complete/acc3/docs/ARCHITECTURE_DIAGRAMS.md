# AI Foundation — Architecture Diagrams

## 1. Module dependency graph

```mermaid
graph TD
    ENV[AI_ENV config] --> PF[AIProviderFactory]
    OAI[OpenAICompatibleProvider] --> PF
    GEM[GeminiProvider] --> PF

    PF --> PB[PromptBuilderService]
    PTS[PromptTemplateService] --> PB
    DB[(PostgreSQL / Prisma)] --> PTS
    BUNDLED[bundled template content] -.fallback.-> PTS

    PB --> EXP[ExplainabilityEngineService]
    PF --> EXP
    VL[ValidationLayerService] --> EXP
    DB --> EXP

    ALLERGY[AllergyRule] --> SAFETY[SafetyEngineService]
    MEDCOND[MedicalConditionRule] --> SAFETY
    MEDINT[MedicineInteractionRule] --> SAFETY
    DB --> ALLERGY & MEDCOND & MEDINT

    DIAB[DiabetesRule] --> MRE[MedicalRuleEngineService]
    HTN[HypertensionRule] --> MRE
    RENAL[RenalRule] --> MRE
    HEP[HepaticRule] --> MRE
    PREG[PregnancyRule] --> MRE
    DB --> DIAB & HTN & RENAL & HEP & PREG

    DB --> NRE[NutritionRuleEngineService]

    SAFETY --> RE[RecommendationEngineFoundationService]
    MRE --> RE
    NRE --> RE
    VL --> RE
    FMT[ResponseFormatterService] --> RE
    PB --> RE
    PF --> RE
    EXP --> RE
    DB --> RE

    GEM -->|vision| OCR[OCRFoundationService]
    PB --> OCR
    PF --> OCR
    VL --> OCR
    DB --> OCR

    VS[VectorSearchService] --> KB[KnowledgeBaseService]
    EP[EmbeddingPipelineService] --> KB
    DB --> KB
    PF --> VS & EP
    PVS[PRIMARY_VECTOR_STORE] --> VS & EP
    FVS[FALLBACK_VECTOR_STORE] --> VS
```

## 2. The mandatory recommendation pipeline (sequence)

```mermaid
sequenceDiagram
    participant Caller
    participant RE as RecommendationEngineFoundation
    participant SE as SafetyEngine
    participant MRE as MedicalRuleEngine
    participant NRE as NutritionRuleEngine
    participant AI as AIProvider
    participant VL as ValidationLayer
    participant EE as ExplainabilityEngine
    participant FMT as ResponseFormatter
    participant DB as RecommendationLog

    Caller->>RE: generate(userId, mealId, mealType, candidateFoodIds)
    RE->>SE: check(userId, candidateFoodIds)
    SE-->>RE: SafetyValidation (PASSED | BLOCKED_*)
    alt blocked
        RE->>DB: log (safety=false)
        RE-->>Caller: failure(SAFETY_BLOCKED)
    else passed
        par
            RE->>MRE: evaluate(userId, candidateFoodIds)
            MRE-->>RE: findings[] (WARNING/INFO)
        and
            RE->>NRE: evaluate(userId, candidateFoodIds, mealType)
            NRE-->>RE: findings[] (WARNING/INFO)
        end
        RE->>AI: complete(meal_recommendation_v1 prompt)
        AI-->>RE: raw JSON text
        RE->>VL: validate(meal_recommendation_v1, raw)
        alt invalid
            RE->>DB: log (validation=false)
            RE-->>Caller: failure(OUTPUT_VALIDATION_FAILED)
        else valid
            RE->>RE: persist MealRecommendation + MealReason
            RE->>EE: explain(payload)
            EE-->>RE: explanation (best-effort)
            RE->>FMT: success(payload, trace)
            RE->>DB: log (success=true)
            RE-->>Caller: PipelineResult(success=true, data)
        end
    end
```

## 3. OCR pipeline (sequence)

```mermaid
sequenceDiagram
    participant Caller
    participant OCR as OCRFoundationService
    participant Gemini as GeminiProvider (vision)
    participant PB as PromptBuilder
    participant AI as AIProvider (structuring)
    participant VL as ValidationLayer
    participant DB as OCRResult/LabResult

    Caller->>OCR: run(medicalReportId, base64Image, mimeType)
    OCR->>DB: create OCRResult(status=PROCESSING)
    OCR->>Gemini: extractText(image)
    alt vision fails
        Gemini-->>OCR: throws
        OCR->>DB: update(status=FAILED)
        OCR-->>Caller: { status: FAILED, requiresManualReview: true }
    else vision succeeds
        Gemini-->>OCR: rawText
        OCR->>DB: update(rawExtractedText)
        OCR->>PB: build(ocr_extraction_v1, {ocrRawText})
        OCR->>AI: complete(prompt)
        AI-->>OCR: raw JSON
        OCR->>VL: validate(ocr_extraction_v1, raw)
        alt invalid
            OCR->>DB: update(status=MANUAL_REVIEW_REQUIRED)
            OCR-->>Caller: { status: MANUAL_REVIEW_REQUIRED }
        else valid
            OCR->>DB: update(status), create LabResult × N
            OCR-->>Caller: { status: COMPLETED | MANUAL_REVIEW_REQUIRED, resultsCount }
        end
    end
```

## 4. Entity-relationship additions this phase

Only one table was added (additive-only, per the completion gate). See
`docs/SCHEMA_CHANGELOG.md` for the full write-up.

```mermaid
erDiagram
    Food ||--o{ FoodMedicineInteraction : "has interactions"
    FoodMedicineInteraction {
        uuid id PK
        uuid foodId FK
        string medicineName
        enum interactionSeverity
        text description
        datetime deletedAt
    }
```
