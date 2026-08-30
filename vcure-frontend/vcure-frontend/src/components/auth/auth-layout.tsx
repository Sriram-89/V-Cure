import Link from "next/link";
import { Leaf } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function AuthLayout({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Green Header Section with Leaf Logo */}
      <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-emerald-800 via-emerald-600 to-emerald-700 py-14 px-4 text-center text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30">
          <Leaf className="h-8 w-8 text-white fill-white/20" />
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-wide">V-Cure</h1>
        <p className="mt-1 text-xs font-medium text-emerald-100/90 tracking-wider">
          Smarter Nutrition, Healthier Life
        </p>
      </div>

      {/* Floating White Card Container */}
      <div className="relative -mt-6 flex-1 rounded-t-[36px] bg-white px-6 py-8 shadow-2xl sm:mx-auto sm:w-full sm:max-w-md sm:rounded-[32px] sm:shadow-xl">
        <div className="mx-auto w-full">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-xs font-medium text-gray-500">{subtitle}</p>
          ) : null}

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
