import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign in | WedPlan",
  description: "Sign in to continue planning your wedding with WedPlan.",
};

export default function SignInPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="w-full max-w-md animate-pulse py-12" />}>
        <AuthForm mode="sign-in" />
      </Suspense>
    </AuthShell>
  );
}
