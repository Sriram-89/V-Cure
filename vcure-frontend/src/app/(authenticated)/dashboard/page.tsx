"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, BookOpen, ShoppingBag, BarChart3, Plus, Minus, Flame, Droplets, ShieldCheck, ChevronRight, Menu, X, LogOut, UtensilsCrossed, FileText, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useMealPlannerStore } from "@/store/meal-planner-store";
import { useAuthStore } from "@/store/auth-store";
import { useTranslation } from "@/hooks/use-translation";
import {
  getSafeMealsForUser,
  ALL_CATALOG_MEALS,
  type MealRecommendationItem
} from "@/lib/meal-adapter/personalized-recommendation-engine";
import { calculateHealthScore } from "@/lib/health-score";
import { UserAvatar } from "@/components/ui/user-avatar";
import { VCureWordmarkLogo } from "@/components/ui/vcure-logo";
import { ROUTES } from "@/constants/routes";
import type { MealSlot } from "@/types/meals";

export default function DashboardPage() {
  const { data } = useDashboardSummary();
  const draft = useOnboardingStore((state) => state.draft);
  const selectedPrimaryMeals = useMealPlannerStore((state) => state.selectedPrimaryMeals);
  const authUser = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [waterCount, setWaterCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const rawUserName = draft.personalInfo?.fullName
    ? draft.personalInfo.fullName.split(" ")[0]
    : authUser?.fullName && authUser.fullName.trim() !== ""
    ? authUser.fullName.split(" ")[0]
    : data?.fullName && data.fullName.trim() !== ""
    ? data.fullName.split(" ")[0]
    : "User";

  const userName = rawUserName || "User";
  const userAvatar = authUser?.avatarUrl || (draft.personalInfo as any)?.avatarUrl || null;

  // Calculate dynamic personalized wellness health score
  const healthScore = calculateHealthScore(draft);

  // Generate personalized active meals for the 4 slots
  const safeMeals = getSafeMealsForUser(draft);
  const slots: MealSlot[] = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

  const activeDailyMeals: MealRecommendationItem[] = slots.map((slot) => {
    const savedId = selectedPrimaryMeals[slot];
    const matchSaved = safeMeals.find((m) => m.type === slot && m.id === savedId);
    if (matchSaved) return matchSaved;

    const matchSafeFirst = safeMeals.find((m) => m.type === slot);
    if (matchSafeFirst) return matchSafeFirst;

    return ALL_CATALOG_MEALS.find((m) => m.type === slot)!;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-28 relative">
      {/* Top Green Hero Banner & Health Score Display */}
      <div className="relative rounded-b-[36px] bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-700 px-6 pt-5 pb-6 text-white shadow-md">
        {/* Top Row: 3-Column Grid (Menu | V-Cure Logo | Profile Avatar) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: Hamburger Menu Button */}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/15 shadow-xs cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Center: Official V-Cure Wordmark Logo */}
          <div className="flex items-center justify-center">
            <VCureWordmarkLogo variant="light" className="h-7 w-auto" />
          </div>

          {/* Right: Circular Profile Picture / Avatar */}
          <div className="flex items-center justify-end">
            <Link
              href="/profile"
              className="flex items-center justify-center rounded-full shadow-md transition-all shrink-0 hover:scale-105"
              aria-label="Profile"
            >
              <UserAvatar src={userAvatar} name={userName} size="sm" />
            </Link>
          </div>
        </div>

        {/* Greeting Row Below Top Bar */}
        <div className="mt-4">
          <p className="text-xs font-medium text-emerald-200">{t.welcomeBack},</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
            {userName}
          </h1>
        </div>

        {/* Dynamic Centered Health Score Ring */}
        <div className="mt-5 flex flex-col items-center justify-center text-center">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-400/40 bg-emerald-800/60 shadow-[0_0_20px_rgba(52,211,153,0.2)] backdrop-blur-xs">
            <div className="text-center">
              <span className="text-3xl font-black tracking-tight text-white">{healthScore}</span>
              <p className="text-[9px] font-extrabold text-emerald-200 uppercase tracking-wider mt-0.5">
                {t.healthScoreLabel}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] font-medium text-emerald-100/80 tracking-wide">
            {t.healthScoreSubtitle}
          </p>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-4/5 max-w-xs bg-white h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <VCureWordmarkLogo variant="dark" className="h-6 w-auto" />
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2 mb-2">
                  {t.appName} Navigation
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50"
                >
                  <BarChart3 className="h-4 w-4" />
                  {t.navDashboard}
                </Link>
                <Link
                  href="/meals"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
                  {t.todaysMealPlanTitle}
                </Link>
                <Link
                  href="/ai"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  {t.navCoach}
                </Link>
                <Link
                  href="/education"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  {t.educationTitle}
                </Link>
                <Link
                  href="/shopping"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <ShoppingBag className="h-4 w-4 text-emerald-600" />
                  {t.groceryListTitle}
                </Link>
                <Link
                  href="/progress"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  {t.progressTitle}
                </Link>
                <Link
                  href="/reports"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4 text-emerald-600" />
                  {t.medicalReports}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <UserIcon className="h-4 w-4 text-emerald-600" />
                  {t.profileTitle}
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  <SettingsIcon className="h-4 w-4 text-emerald-600" />
                  {t.navSettings}
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  clearSession();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-all"
              >
                <LogOut className="h-4 w-4" />
                {t.logoutButton}
              </button>
              <p className="text-[10px] font-semibold text-gray-400 text-center">V-Cure Healthcare v1.0</p>
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
        </div>
      ) : null}

      <Container className="max-w-md px-4 mt-5 space-y-6">
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
            <p className="text-[11px] font-medium text-gray-500 mt-0.5">{t.waterLabel}</p>
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
            <p className="text-[11px] font-medium text-gray-500 mt-0.5">{t.caloriesLabel}</p>
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
            <span className="mt-2 text-[11px] font-bold text-gray-800">{t.actionAskCoach}</span>
          </Link>
          <Link href="/education" className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-3.5 text-center shadow-xs border border-emerald-100 hover:bg-emerald-100/80 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="mt-2 text-[11px] font-bold text-gray-800">{t.navEducation}</span>
          </Link>
          <Link href="/shopping" className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-3.5 text-center shadow-xs border border-emerald-100 hover:bg-emerald-100/80 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="mt-2 text-[11px] font-bold text-gray-800">{t.groceryListTitle}</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-3.5 text-center shadow-xs border border-emerald-100 hover:bg-emerald-100/80 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="mt-2 text-[11px] font-bold text-gray-800">{t.navProgress}</span>
          </Link>
        </div>

        {/* Personalized Health Profile Badge */}
        {draft.diabetesCategory?.category ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{t.onboardingTitle}: {draft.diabetesCategory.category.replace("_", " ")}</span>
            </div>
            <Link href="/onboarding" className="text-[11px] font-bold text-emerald-700 hover:underline">
              {t.edit}
            </Link>
          </div>
        ) : null}

        {/* Today's Meals Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t.todaysMealPlanTitle}</h2>
            <Link href={ROUTES.MEALS} className="text-xs font-bold text-emerald-600 hover:underline">
              {t.selectAlternative}
            </Link>
          </div>

          <div className="space-y-3">
            {activeDailyMeals.map((meal, idx) => (
              <Link
                key={idx}
                href={`/meals/${meal.id}`}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-xs hover:border-emerald-200 transition-all block"
              >
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
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">{meal.giTag}</span>
                    </div>
                  </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}


