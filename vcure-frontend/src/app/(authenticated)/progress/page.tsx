"use client";

import { useState } from "react";
import { Plus, Flame, CheckCircle2, TrendingUp, Calendar, Scale } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useProgressStore } from "@/store/progress-store";
import { calculateHealthScore } from "@/lib/health-score";

export default function ProgressPage() {
  const draft = useOnboardingStore((state) => state.draft);
  const updateHealthProfile = useOnboardingStore((state) => state.updateHealthProfile);
  const updatePersonalInfo = useOnboardingStore((state) => state.updatePersonalInfo);

  const eatenMealIds = useProgressStore((state) => state.eatenMealIds);
  const streakDays = useProgressStore((state) => state.streakDays);
  const weightLogs = useProgressStore((state) => state.weightLogs);
  const logWeight = useProgressStore((state) => state.logWeight);

  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState("");

  // Dynamic calculations based on user profile
  const healthScore = calculateHealthScore(draft);
  const heightCm = draft.personalInfo?.heightCm || draft.healthProfile?.heightCm || 170;
  const currentWeightKg = draft.personalInfo?.weightKg || draft.healthProfile?.weightKg || 70;
  const heightMeters = heightCm / 100;
  const bmi = (currentWeightKg / (heightMeters * heightMeters)).toFixed(1);

  const handleSaveWeight = () => {
    const parsedWeight = parseFloat(newWeightInput);
    if (!isNaN(parsedWeight) && parsedWeight > 20 && parsedWeight < 300) {
      logWeight(parsedWeight);
      updateHealthProfile({ gender: (draft.personalInfo?.gender as any) || "MALE", heightCm, weightKg: parsedWeight });
      updatePersonalInfo({ gender: "MALE", heightCm, ...draft.personalInfo, weightKg: parsedWeight });
      setIsLoggingWeight(false);
      setNewWeightInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Container className="max-w-md px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Progress</h1>
            <p className="mt-0.5 text-xs font-medium text-gray-500">
              Your personalized wellness tracking
            </p>
          </div>
          <a
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white shrink-0 shadow-xs hover:bg-slate-700 transition-all"
            aria-label="Profile"
          >
            S
          </a>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center gap-2 rounded-2xl bg-gray-200/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "weekly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
        </div>

        {/* DYNAMIC HEALTH SCORE CARD */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            PERSONALIZED HEALTH SCORE
          </span>
          <div className="mt-2 text-6xl font-black text-emerald-600">{healthScore}</div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-700">
            <div>
              <div className="text-[10px] font-bold text-gray-400">BMI</div>
              <div className="text-sm font-extrabold text-gray-900">{bmi}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400">Streak</div>
              <div className="flex items-center gap-1 text-sm font-extrabold text-gray-900">
                {streakDays} <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400">Weight</div>
              <div className="text-sm font-extrabold text-gray-900">{currentWeightKg} kg</div>
            </div>
          </div>
        </div>

        {/* WEIGHT TREND CARD */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-600" />
                Weight trend
              </h3>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                Current: {currentWeightKg} kg
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLoggingWeight(!isLoggingWeight)}
              className="flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Weight
            </button>
          </div>

          {isLoggingWeight ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
              <label className="text-xs font-bold text-emerald-900 block">
                Enter new weight (kg):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  placeholder={`${currentWeightKg}`}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveWeight}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : null}

          {weightLogs.length > 0 ? (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-gray-700">Recent Logs:</p>
              {weightLogs.slice(-3).map((log, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl font-semibold text-gray-800">
                  <span>{log.date}</span>
                  <span className="font-extrabold text-emerald-700">{log.weightKg} kg</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center p-3">
              <span className="text-xs font-semibold text-gray-400">
                Log your weight periodically to track progress trends
              </span>
            </div>
          )}
        </div>

        {/* MEALS COMPLETED LOG CARD */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Meals completed ({activeTab === "weekly" ? "7d" : "30d"})
            </h3>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">
              {eatenMealIds.length} Total
            </span>
          </div>

          {eatenMealIds.length > 0 ? (
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4 space-y-2">
              <p className="text-xs font-bold text-emerald-900">
                ✓ You have completed {eatenMealIds.length} meal{eatenMealIds.length > 1 ? "s" : ""} today!
              </p>
              <p className="text-[11px] font-medium text-emerald-700 leading-relaxed">
                Consistency with low-glycemic meals directly supports metabolic balance.
              </p>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center p-3">
              <span className="text-xs font-semibold text-gray-400">
                Tap "Mark as eaten" on meal details to track completed meals
              </span>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
