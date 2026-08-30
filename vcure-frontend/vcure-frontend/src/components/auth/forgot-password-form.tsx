"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, MailCheck } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues
} from "@/lib/validation/auth";
import {
  useForgotPassword,
  getForgotPasswordErrorMessage
} from "@/hooks/use-forgot-password";
import { ROUTES } from "@/constants/routes";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const forgotPasswordMutation = useForgotPassword();

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values.email);
  };

  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className="flex flex-col items-start gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary">
          <MailCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-text-primary">
          If an account exists for <strong>{getValues("email")}</strong>, we&apos;ve
          sent a link to reset the password.
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="text-sm font-medium text-primary hover:text-primary-700"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {forgotPasswordMutation.isError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-danger/20 bg-red-50 p-3 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {getForgotPasswordErrorMessage(forgotPasswordMutation.error)}
        </div>
      ) : null}

      <InputField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Button type="submit" className="w-full" isLoading={forgotPasswordMutation.isPending}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Remembered your password?{" "}
        <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:text-primary-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
