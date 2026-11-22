import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

export const metadata: Metadata = {
  title: "Verify Email | WedPlan",
  description: "Verify your email address to access your WedPlan account.",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="w-full max-w-md animate-pulse py-12" />}>
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
