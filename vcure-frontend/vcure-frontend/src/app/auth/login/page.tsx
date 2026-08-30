import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see today's plan.">
      <LoginForm />
    </AuthLayout>
  );
}
