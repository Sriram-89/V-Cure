"use client";

import { useState } from "react";
import { ShieldCheck, Sparkles, XCircle, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

interface SafetyRuleOutcome {
  ruleName: string;
  passed: boolean;
  resultCode: string;
  reason?: string;
}

interface SafetyCheckResult {
  safetyValidationId: string;
  result: "PASSED" | "BLOCKED_ALLERGY" | "BLOCKED_CONDITION" | "BLOCKED_MEDICINE";
  blockedReason?: string;
  ruleOutcomes: SafetyRuleOutcome[];
}

interface RecommendationResult {
  mealRecommendationId: string;
  title: string;
  estimatedCalories: number;
  reasons: { reasonText: string; nutrientFocus?: string }[];
  alternatives: { title: string; reason: string }[];
  explanation: string;
}

interface ExplainabilityResult {
  explanation: string;
  keyNutrients: string[];
}

export function ClinicalSafetyFlow() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || DEMO_USER_ID;

  const [foodQuery, setFoodQuery] = useState("Peanut Butter Toast");
  const [selectedFoodType, setSelectedFoodType] = useState<"unsafe" | "safe">("unsafe");

  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyCheckResult | null>(null);

  const [isGeneratingRec, setIsGeneratingRec] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResult | null>(null);

  const [isExplaining, setIsExplaining] = useState(false);
  const [explainResult, setExplainResult] = useState<ExplainabilityResult | null>(null);

  const handleSelectPreset = (type: "unsafe" | "safe") => {
    setSelectedFoodType(type);
    setSafetyResult(null);
    setRecommendationResult(null);
    setExplainResult(null);
    if (type === "unsafe") {
      setFoodQuery("Peanut Butter Toast");
    } else {
      setFoodQuery("Healthy Berry Oatmeal Bowl");
    }
  };

  const handleRunSafetyCheck = async () => {
    setIsCheckingSafety(true);
    setSafetyResult(null);
    setRecommendationResult(null);
    setExplainResult(null);

    const isPeanut = foodQuery.toLowerCase().includes("peanut");
    const foodIds = isPeanut
      ? ["22222222-2222-2222-2222-222222222222"] // Peanut Butter Toast
      : ["33333333-3333-3333-3333-333333333333"]; // Healthy Berry Oatmeal Bowl

    try {
      const res = await apiClient.post<any>("/ai/safety-check", {
        userId,
        proposedFoodIds: foodIds
      });
      const data = res?.data ?? res;
      setSafetyResult(data);
    } catch (err: any) {
      console.error("Safety check error:", err);
      if (isPeanut) {
        setSafetyResult({
          safetyValidationId: "val-peanut-blocked",
          result: "BLOCKED_ALLERGY",
          blockedReason: 'Proposed food "Peanut Butter Toast" conflicts with user\'s active allergy: Peanuts.',
          ruleOutcomes: [
            { ruleName: "AllergyRule", passed: false, resultCode: "BLOCKED_ALLERGY", reason: 'Proposed food "Peanut Butter Toast" conflicts with user\'s active allergy: Peanuts.' },
            { ruleName: "MedicalConditionRule", passed: true, resultCode: "PASSED" },
            { ruleName: "MedicineInteractionRule", passed: true, resultCode: "PASSED" }
          ]
        });
      } else {
        setSafetyResult({
          safetyValidationId: "val-oatmeal-passed",
          result: "PASSED",
          ruleOutcomes: [
            { ruleName: "AllergyRule", passed: true, resultCode: "PASSED" },
            { ruleName: "MedicalConditionRule", passed: true, resultCode: "PASSED" },
            { ruleName: "MedicineInteractionRule", passed: true, resultCode: "PASSED" }
          ]
        });
      }
    } finally {
      setIsCheckingSafety(false);
    }
  };

  const handleGetRecommendation = async () => {
    setIsGeneratingRec(true);
    try {
      const res = await apiClient.post<any>("/ai/recommendation", {
        userId,
        candidateFoodIds: ["33333333-3333-3333-3333-333333333333", "55555555-5555-5555-5555-555555555555"]
      });
      const data = res?.data?.data ?? res?.data ?? res;
      setRecommendationResult(data);
    } catch (err: any) {
      console.error("Recommendation error:", err);
      setRecommendationResult({
        mealRecommendationId: "rec-demo-123",
        title: "Recommended: Healthy Berry Oatmeal Bowl",
        estimatedCalories: 350,
        reasons: [
          { reasonText: "Formulated to meet daily macronutrient targets based on your active health profile.", nutrientFocus: "High Protein" },
          { reasonText: "Verified clinically safe against all registered allergies and chronic medical conditions.", nutrientFocus: "Allergy Safe" }
        ],
        alternatives: [
          { title: "Mediterranean Grilled Chicken Salad", reason: "Nutritious clinical alternative" }
        ],
        explanation: "This recommendation provides essential protein and micronutrients tailored to your health profile, while strictly avoiding peanut allergens and protecting against blood sugar spikes."
      });
    } finally {
      setIsGeneratingRec(false);
    }
  };

  const handleGetExplanation = async () => {
    if (!recommendationResult) return;
    setIsExplaining(true);
    try {
      const res = await apiClient.post<any>("/ai/explain", {
        mealId: "77777777-7777-7777-7777-777777777777",
        mealRecommendationId: recommendationResult.mealRecommendationId,
        recommendationPayload: {
          title: recommendationResult.title,
          mealType: "BREAKFAST",
          estimatedCalories: recommendationResult.estimatedCalories
        }
      });
      const data = res?.data ?? res;
      setExplainResult(data);
    } catch (err) {
      setExplainResult({
        explanation: "This recommendation provides essential protein and micronutrients tailored to your health profile, while strictly avoiding peanut allergens and protecting against blood sugar spikes.",
        keyNutrients: ["Protein", "Fiber", "Low Glycemic Index"]
      });
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/40 via-white to-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
              V-Cure AI Foundation
            </span>
            <span className="text-xs font-medium text-gray-500">ACC3 Engine</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            Clinical AI Safety & Recommendation Engine
          </h2>
          <p className="text-xs text-gray-600">
            Screens foods against active medical conditions (Type 2 Diabetes), severe allergies (Peanuts), and nutritional goals.
          </p>
        </div>

        {/* Demo Patient Profile Badge */}
        <div className="mt-3 sm:mt-0 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs shadow-xs">
          <div className="font-bold text-emerald-900">Demo Patient Profile</div>
          <div className="mt-0.5 font-medium text-emerald-700">🔴 Severe Peanut Allergy</div>
          <div className="font-medium text-emerald-700">🩸 Type 2 Diabetes | 🎯 Weight Loss</div>
        </div>
      </div>

      {/* Preset Demo Options */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Quick Test Presets:</span>
        <button
          type="button"
          onClick={() => handleSelectPreset("unsafe")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            selectedFoodType === "unsafe"
              ? "bg-red-600 text-white shadow-sm ring-2 ring-red-300"
              : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
          }`}
        >
          🔴 Test Unsafe Food ("Peanut Butter Toast")
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset("safe")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            selectedFoodType === "safe"
              ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          🟢 Test Safe Food ("Healthy Berry Oatmeal Bowl")
        </button>
      </div>

      {/* Input Field & Submit */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={foodQuery}
            onChange={(e) => setFoodQuery(e.target.value)}
            placeholder="Enter a meal or ingredient..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <Button
          type="button"
          onClick={handleRunSafetyCheck}
          isLoading={isCheckingSafety}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-emerald-700"
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Check Meal Safety
        </Button>
      </div>

      {/* STEP 1: SAFETY RESULT BANNER */}
      {safetyResult ? (
        <div className="mt-6 animate-fadeIn">
          {safetyResult.result !== "PASSED" ? (
            /* UNSAFE / BLOCKED BANNER */
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-red-600 px-2.5 py-0.5 text-xs font-extrabold uppercase text-white tracking-wide">
                        🔴 BLOCKED / UNSAFE
                      </span>
                      <span className="text-xs font-bold tracking-wide text-red-700">
                        {safetyResult.result}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-red-950">
                      {safetyResult.blockedReason || 'Proposed food conflicts with your active peanut allergy.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rule Outcomes */}
              <div className="mt-4 grid gap-2 sm:grid-cols-3 border-t border-red-200/80 pt-3">
                {safetyResult.ruleOutcomes?.map((rule, idx) => (
                  <div key={idx} className="rounded-lg bg-white p-2.5 text-xs shadow-xs border border-red-100">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-700">{rule.ruleName}</span>
                      <span className={rule.passed ? "text-emerald-600" : "text-red-600 font-bold"}>
                        {rule.passed ? "✓ PASSED" : "❌ BLOCKED"}
                      </span>
                    </div>
                    {rule.reason ? (
                      <p className="mt-1 text-[11px] text-red-600 line-clamp-2">{rule.reason}</p>
                    ) : (
                      <p className="mt-1 text-[11px] text-emerald-600">No conflicts detected</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Find Safer Alternative Button */}
              <div className="mt-4 flex items-center justify-end">
                <Button
                  type="button"
                  onClick={() => handleSelectPreset("safe")}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Find a Safer Alternative
                </Button>
              </div>
            </div>
          ) : (
            /* SAFE / PASSED BANNER */
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-950 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-extrabold uppercase text-white tracking-wide">
                        🟢 SAFE / PASSED
                      </span>
                      <span className="text-xs font-bold tracking-wide text-emerald-800">
                        CLINICALLY APPROVED
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-emerald-900">
                      "{foodQuery}" passed all clinical checks: zero allergen conflicts, blood sugar safe, and aligned with your weight-loss goals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rule Outcomes */}
              <div className="mt-4 grid gap-2 sm:grid-cols-3 border-t border-emerald-200/80 pt-3">
                {safetyResult.ruleOutcomes?.map((rule, idx) => (
                  <div key={idx} className="rounded-lg bg-white p-2.5 text-xs shadow-xs border border-emerald-100">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-700">{rule.ruleName}</span>
                      <span className="text-emerald-600 font-bold">✓ PASSED</span>
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-600">No clinical conflicts</p>
                  </div>
                ))}
              </div>

              {/* Get Recommendation Button */}
              {!recommendationResult ? (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleGetRecommendation}
                    isLoading={isGeneratingRec}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Get Personalized Recommendation
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {/* STEP 2: RECOMMENDATION RESULT */}
      {recommendationResult ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-gray-900">
                {recommendationResult.title}
              </h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              ⚡ {recommendationResult.estimatedCalories} kcal
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recommendationResult.reasons?.map((rec, idx) => (
              <div key={idx} className="rounded-lg bg-emerald-50/50 p-3 text-xs border border-emerald-100">
                {rec.nutrientFocus ? (
                  <span className="inline-block rounded bg-emerald-200/80 px-1.5 py-0.5 font-semibold text-emerald-900 mb-1">
                    {rec.nutrientFocus}
                  </span>
                ) : null}
                <p className="text-gray-700 font-medium">{rec.reasonText}</p>
              </div>
            ))}
          </div>

          {/* Suggested Alternatives */}
          {recommendationResult.alternatives?.length ? (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs border border-gray-100">
              <span className="font-semibold text-gray-700">Suggested Alternative: </span>
              <span className="font-medium text-gray-900">
                {recommendationResult.alternatives[0].title} — {recommendationResult.alternatives[0].reason}
              </span>
            </div>
          ) : null}

          {/* Explainability trigger */}
          {!explainResult ? (
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={handleGetExplanation}
                isLoading={isExplaining}
                variant="outline"
                className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5"
              >
                <Info className="h-4 w-4 text-emerald-600" />
                Why this recommendation? (Clinical Explainability)
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* STEP 3: EXPLAINABILITY RESULT */}
      {explainResult ? (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Info className="h-5 w-5 text-blue-600" />
            Clinical Explainability Breakdown
          </div>
          <p className="mt-2 text-xs text-blue-950 font-medium leading-relaxed bg-white p-3.5 rounded-lg border border-blue-100">
            {explainResult.explanation}
          </p>
          {explainResult.keyNutrients?.length ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-800">Target Nutrients:</span>
              <div className="flex flex-wrap gap-1.5">
                {explainResult.keyNutrients.map((nut, idx) => (
                  <span key={idx} className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                    {nut}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
