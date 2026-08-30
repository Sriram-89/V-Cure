import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { loadAIConfig } from './config/ai.config';
import { AI_ENV, PRIMARY_VECTOR_STORE, FALLBACK_VECTOR_STORE, OPENAI_BASE_URL, GEMINI_BASE_URL } from './ai.tokens';

import { OpenAICompatibleProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AIProviderFactory } from './providers/provider.factory';

import { PromptTemplateService } from './prompt-templates/prompt-template.service';
import { PromptBuilderService } from './prompt-builder/prompt-builder.service';

import { HttpVectorStoreProvider } from './vector-search/providers/http-vector-store.provider';
import { InMemoryVectorStoreProvider } from './vector-search/providers/in-memory-vector-store.provider';
import { VectorSearchService } from './vector-search/vector-search.service';
import { EmbeddingPipelineService } from './embedding-pipeline/embedding.service';
import { KnowledgeBaseService } from './knowledge-base/knowledge-base.service';

import { AllergyRule } from './safety-engine/rules/allergy.rule';
import { MedicalConditionRule } from './safety-engine/rules/medical-condition.rule';
import { MedicineInteractionRule } from './safety-engine/rules/medicine-interaction.rule';
import { SafetyEngineService } from './safety-engine/safety-engine.service';

import { DiabetesRule, HypertensionRule } from './medical-rule-engine/rules/metabolic-cardio.rule';
import { RenalRule, HepaticRule, PregnancyRule } from './medical-rule-engine/rules/renal-hepatic-pregnancy.rule';
import { MedicalRuleEngineService } from './medical-rule-engine/medical-rule-engine.service';

import { NutritionRuleEngineService } from './nutrition-rule-engine/nutrition-rule-engine.service';

import { ValidationLayerService } from './common/pipeline/validation-layer.service';
import { ResponseFormatterService } from './common/pipeline/response-formatter.service';

import { ExplainabilityEngineService } from './explainability-engine/explainability-engine.service';
import { RecommendationEngineFoundationService } from './recommendation-engine/recommendation-engine-foundation.service';
import { OCRFoundationService } from './ocr/ocr.service';

/**
 * AI FOUNDATION MODULE
 *
 * Wires every AI-layer service built in Phase 2 into NestJS's DI container.
 * `@Global()` because nearly every other backend module (once built) will
 * need at least one AI service (Recommendation, Health Assessment, Chat);
 * re-importing this module everywhere would be needless boilerplate given
 * the AI layer has no per-request state.
 *
 * Config resolution happens once, at module load (`loadAIConfig()` throws
 * immediately on invalid/missing env vars — fail fast, per Sec. Security).
 */
@Global()
@Module({
  providers: [
    { provide: AI_ENV, useFactory: () => loadAIConfig() },
    { provide: PrismaClient, useFactory: () => new PrismaClient() },
    { provide: OPENAI_BASE_URL, useValue: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1' },
    { provide: GEMINI_BASE_URL, useValue: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta' },

    OpenAICompatibleProvider,
    GeminiProvider,
    AIProviderFactory,

    PromptTemplateService,
    PromptBuilderService,

    HttpVectorStoreProvider,
    InMemoryVectorStoreProvider,
    {
      provide: PRIMARY_VECTOR_STORE,
      useFactory: (env: ReturnType<typeof loadAIConfig>, http: HttpVectorStoreProvider, mem: InMemoryVectorStoreProvider) =>
        env.VECTOR_DB_URL ? http : mem,
      inject: [AI_ENV, HttpVectorStoreProvider, InMemoryVectorStoreProvider],
    },
    {
      provide: FALLBACK_VECTOR_STORE,
      useExisting: InMemoryVectorStoreProvider,
    },
    VectorSearchService,
    EmbeddingPipelineService,
    KnowledgeBaseService,

    AllergyRule,
    MedicalConditionRule,
    MedicineInteractionRule,
    SafetyEngineService,

    DiabetesRule,
    HypertensionRule,
    RenalRule,
    HepaticRule,
    PregnancyRule,
    MedicalRuleEngineService,

    NutritionRuleEngineService,

    ValidationLayerService,
    ResponseFormatterService,

    ExplainabilityEngineService,
    RecommendationEngineFoundationService,
    OCRFoundationService,
  ],
  exports: [
    PrismaClient,
    AIProviderFactory,
    PromptBuilderService,
    PromptTemplateService,
    VectorSearchService,
    EmbeddingPipelineService,
    KnowledgeBaseService,
    SafetyEngineService,
    MedicalRuleEngineService,
    NutritionRuleEngineService,
    ValidationLayerService,
    ResponseFormatterService,
    ExplainabilityEngineService,
    RecommendationEngineFoundationService,
    OCRFoundationService,
  ],
})
export class AIFoundationModule {}
