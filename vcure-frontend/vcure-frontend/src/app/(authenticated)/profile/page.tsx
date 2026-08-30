"use client";

import Link from "next/link";
import { BookOpen, ShoppingBag, UserCheck, ShieldCheck, LogOut, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useAuthStore } from "@/store/auth-store";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const userName = user?.fullName && user.fullName.trim() !== "" ? user.fullName : "Sriram";
  const userEmail = user?.email || "demo@vcure.com";
  const userInitial = userName.charAt(0).toUpperCase() || "S";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Container className="max-w-md px-4 py-6 space-y-6">
        {/* User Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white shadow-md">
            {userInitial}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{userName}</h1>
            <p className="text-xs font-medium text-gray-400 truncate max-w-[220px]">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Stats Summary Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-md grid grid-cols-3 text-center divide-x divide-gray-100">
          <div>
            <div className="text-xl font-extrabold text-emerald-600">59</div>
            <div className="text-[10px] font-bold text-gray-400">Health Score</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-600">33.1</div>
            <div className="text-[10px] font-bold text-gray-400">BMI</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-600">0</div>
            <div className="text-[10px] font-bold text-gray-400">Conditions</div>
          </div>
        </div>

        {/* LEARN & SHOP SECTION */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
            LEARN & SHOP
          </span>
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md divide-y divide-gray-100">
            <Link href="/education" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Health Education</h3>
                  <p className="text-[11px] font-medium text-gray-400">Diabetes, BP, PCOS, myths</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>

            <Link href="/shopping" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Grocery List</h3>
                  <p className="text-[11px] font-medium text-gray-400">Blinkit, Zepto, BigBasket</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* HEALTH PROFILE SECTION */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
            HEALTH PROFILE
          </span>
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md">
            <Link href="/onboarding" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Edit health profile</h3>
                  <p className="text-[11px] font-medium text-gray-400">Update conditions, goals & preferences</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* APP SECTION */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
            APP
          </span>
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md divide-y divide-gray-100">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">About V-Cure</h3>
                  <p className="text-[11px] font-medium text-gray-400">Educational, not medical</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            <button
              type="button"
              onClick={() => clearSession()}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50/50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-600">Sign out</h3>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
