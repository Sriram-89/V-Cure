"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useLogin, getLoginErrorMessage } from "@/hooks/use-login";
import { signInWithGoogleIdToken } from "@/lib/firebase-auth";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/hooks/use-translation";

export function LoginForm() {
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const loginMutation = useLogin();

  const onSubmit = (values: LoginFormValues) => {
    setGoogleError(null);
    loginMutation.mutate(values);
  };

  const handleGoogleLogin = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      const idToken = await signInWithGoogleIdToken();
      loginMutation.mutate({ idToken });
    } catch (err: any) {
      setGoogleError(err?.message || "Google sign in failed. Please check Firebase configuration.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Continue with Google Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || loginMutation.isPending}
        className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-3.5 px-4 text-sm font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:bg-gray-100 transition-all disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        {isGoogleLoading ? t.loading : t.continueWithGoogle}
      </button>

      <div className="relative my-0.5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {t.orSignInWithEmail}
        </span>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {loginMutation.isError || googleError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{googleError || getLoginErrorMessage(loginMutation.error)}</span>
          </div>
        ) : null}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            {t.emailLabel}
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            {t.passwordLabel}
          </label>
          <input
            type="password"
            placeholder="........"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="mt-2 w-full rounded-2xl bg-emerald-600 py-3.5 text-base font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
          isLoading={loginMutation.isPending}
        >
          {t.signInButton}
        </Button>

        <p className="text-center text-xs font-semibold text-emerald-700 mt-2">
          <Link href={ROUTES.REGISTER} className="hover:underline">
            {t.newHere}
          </Link>
        </p>
      </form>
    </div>
  );
}


