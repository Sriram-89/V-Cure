"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, BookOpen, ShoppingBag, BarChart3, Plus, Minus, Flame, Droplets } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { ROUTES } from "@/constants/routes";

const TODAY_MEALS_SEED = [
  {
    type: "BREAKFAST",
    name: "Moong Dal Cheela",
    calories: "250 kcal",
    protein: "14g P",
    fiber: "7g fiber",
    img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80"
  },
  {
    type: "LUNCH",
    name: "Dal Tadka with Multigrain Roti",
    calories: "420 kcal",
    protein: "18g P",
    fiber: "9g fiber",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80"
  },
  {
    type: "SNACK",
    name: "Sprouts Salad",
    calories: "180 kcal",
    protein: "12g P",
    fiber: "7g fiber",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"
  },
  {
    type: "DINNER",
    name: "Grilled Paneer with Veggies",
    calories: "380 kcal",
    protein: "24g P",
    fiber: "6g fiber",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80"
  }
];

export default function DashboardPage() {
  const { data } = useDashboardSummary();
  const [waterCount, setWaterCount] = useState(0);

  const userName = data?.fullName && data.fullName.trim() !== "" ? data.fullName.split(" ")[0] : "Demo";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Green Banner & Health Score Ring */}
      <div className="relative rounded-b-[36px] bg-gradient-to-b from-emerald-800 via-emerald-600 to-emerald-700 px-6 pt-10 pb-16 text-white shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Hello,</p>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          {userName} 👋
        </h1>

        {/* Circular Health Score Ring */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-white/20 bg-emerald-700/40 shadow-inner">
            <div className="text-center">
              <span className="text-5xl font-black tracking-tight text-white">59</span>
              <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider mt-0.5">
                Health Score
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-emerald-100/90 tracking-wide">
            Keep the streak going
          </p>
        </div>
      </div>

      <Container className="max-w-md px-4 -mt-8 space-y-6">
        {/* Floating Macro Cards Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Water Card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-md">
            <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
              <Droplets className="h-5 w-5 fill-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-gray-900">{waterCount}</span>
              <span className="text-xs font-bold text-gray-400">/8</span>
            </div>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5">Water (glasses)</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWaterCount(Math.max(0, waterCount - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setWaterCount(waterCount + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calories Card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-md">
            <div className="flex items-center gap-2 text-orange-500 font-bold text-xs">
              <Flame className="h-5 w-5 fill-orange-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-gray-900">1230</span>
            </div>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5">Calories today</p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">P 68g</span>
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">C 128g</span>
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">F 41g</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons (Ask AI, Learn, Grocery, Progress) */}
        <div className="grid grid-cols-4 gap-2">
          <Link href="/ai" className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-3.5 text-center shadow-xs border border-emerald-100 hover:bg-emerald-100/80 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="mt-2 text-[11px] font-bold text-gray-800">Ask AI</span>
          </Link>
          <Link href="/education" className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-3.5 text-center shadow-xs border border-emerald-100 hover:bg-emerald-100/80 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="mt-2 text-[11px] font-bold text-gray-800">Learn</span>
          </Link>
          <Link href="/shopping" className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-3.5 text-center shadow-xs border border-emerald-100 hover:bg-emerald-100/80 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="mt-2 text-[11px] font-bold text-gray-800">Grocery</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-3.5 text-center shadow-xs border border-emerald-100 hover:bg-emerald-100/80 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="mt-2 text-[11px] font-bold text-gray-800">Progress</span>
          </Link>
        </div>

        {/* Today's Meals Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Today's meals</h2>
            <Link href={ROUTES.MEALS} className="text-xs font-bold text-emerald-600 hover:underline">
              See all
            </Link>
          </div>

          <div className="space-y-3">
            {TODAY_MEALS_SEED.map((meal, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={meal.img}
                    alt={meal.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      {meal.type}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">{meal.name}</h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">{meal.calories}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">{meal.protein}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">{meal.fiber}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
