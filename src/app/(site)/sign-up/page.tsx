import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create an account | WedPlan",
  description: "Create your WedPlan account and start planning with confidence.",
};

export default function SignUpPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="w-full max-w-md animate-pulse py-12" />}>
        <AuthForm mode="sign-up" />
      </Suspense>
    </AuthShell>
  );
}
