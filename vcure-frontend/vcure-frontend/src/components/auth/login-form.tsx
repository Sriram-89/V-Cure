"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useLogin, getLoginErrorMessage } from "@/hooks/use-login";
import { ROUTES } from "@/constants/routes";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@vcure.com",
      password: "Password123!"
    }
  });

  const loginMutation = useLogin();

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const handleInstantDemoLogin = () => {
    loginMutation.mutate({
      email: "demo@vcure.com",
      password: "Password123!"
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Quick Demo Instant Buttons */}
      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
          onClick={handleInstantDemoLogin}
          isLoading={loginMutation.isPending}
        >
          🚀 Instant Demo Login (demo@vcure.com)
        </Button>
      </div>

      <div className="relative my-0.5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Or sign in with email
        </span>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {loginMutation.isError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {getLoginErrorMessage(loginMutation.error)}
          </div>
        ) : null}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            EMAIL
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
            PASSWORD
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
          Sign In
        </Button>

        <p className="text-center text-xs font-semibold text-emerald-700 mt-2">
          <Link href={ROUTES.REGISTER} className="hover:underline">
            New here? Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
