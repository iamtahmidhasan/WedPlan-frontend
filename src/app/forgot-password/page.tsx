import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | WedPlan",
  description: "Request a password reset link for your WedPlan account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="w-full max-w-md animate-pulse py-12" />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
