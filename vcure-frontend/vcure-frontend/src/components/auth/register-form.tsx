"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";
import { useRegister, getRegisterErrorMessage } from "@/hooks/use-register";
import { useLogin } from "@/hooks/use-login";
import { ROUTES } from "@/constants/routes";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const registerMutation = useRegister();
  const loginMutation = useLogin();

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      fullName: values.fullName,
      email: values.email,
      password: values.password
    });
  };

  const handleDemoLogin = () => {
    loginMutation.mutate({
      email: "demo@vcure.com",
      password: "Password123!"
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Quick Google & Demo Options */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-border py-2.5 font-medium text-text-primary hover:bg-surface-hover"
          onClick={handleDemoLogin}
          isLoading={loginMutation.isPending}
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
          Continue with Google
        </Button>

        <Button
          type="button"
          className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-700"
          onClick={handleDemoLogin}
          isLoading={loginMutation.isPending}
        >
          🚀 Instant Demo Login (demo@vcure.com)
        </Button>
      </div>

      <div className="relative my-1 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-surface px-3 text-xs uppercase tracking-wider text-text-tertiary">
          Or register with email
        </span>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {registerMutation.isError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-danger/20 bg-red-50 p-3 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {getRegisterErrorMessage(registerMutation.error)}
          </div>
        ) : null}

        <InputField
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <InputField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with one uppercase letter and one number."
          error={errors.password?.message}
          {...register("password")}
        />

        <InputField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>
          Create account
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:text-primary-700">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
