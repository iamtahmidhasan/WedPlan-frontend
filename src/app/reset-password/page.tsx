import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | WedPlan",
  description: "Set a new password for your WedPlan account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="w-full max-w-md animate-pulse py-12" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
