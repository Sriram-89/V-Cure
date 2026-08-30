"use client";

import { useState } from "react";
import { Plus, Flame } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Container className="max-w-md px-4 py-6 space-y-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Progress</h1>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Your wellness at a glance
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-1">
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

        {/* HEALTH SCORE Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            HEALTH SCORE
          </span>
          <div className="mt-2 text-6xl font-black text-emerald-600">59</div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-700">
            <div>
              <div className="text-[10px] font-bold text-gray-400">BMI</div>
              <div className="text-sm font-extrabold text-gray-900">33.1</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400">Streak</div>
              <div className="flex items-center gap-1 text-sm font-extrabold text-gray-900">
                0 <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400">Weight</div>
              <div className="text-sm font-extrabold text-gray-900">105 kg</div>
            </div>
          </div>
        </div>

        {/* Weight Trend Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Weight trend</h3>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Log
            </button>
          </div>

          <div className="flex h-36 items-center justify-center rounded-2xl bg-gray-50 border border-dashed border-gray-200">
            <span className="text-xs font-semibold text-gray-400">Weight tracking graph ready</span>
          </div>
        </div>

        {/* Meals Completed (7d) Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-gray-900">Meals completed (7d)</h3>
          <div className="flex h-28 items-center justify-center rounded-2xl bg-gray-50 border border-dashed border-gray-200">
            <span className="text-xs font-semibold text-gray-400">7-day meal log summary ready</span>
          </div>
        </div>
      </Container>
    </div>
  );
}
