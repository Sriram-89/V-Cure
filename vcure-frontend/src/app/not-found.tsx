import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
      <p className="mt-2 text-sm text-gray-600">Page not found</p>
      <Link
        href={ROUTES.DASHBOARD}
        className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
