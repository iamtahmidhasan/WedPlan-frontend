"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, LoaderCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const verifiedParam = searchParams.get("verified");
  const errorParam = searchParams.get("error");

  const [emailInput, setEmailInput] = useState(emailParam);
  const [isResending, setIsResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleResend = () => {
    const targetEmail = (emailInput || emailParam).trim();
    if (!targetEmail) {
      toast.error("Please enter your email address to resend the verification link");
      return;
    }

    setIsResending(true);
    authClient
      .sendVerificationEmail({
        email: targetEmail,
        callbackURL: "/verify-email?verified=true",
      })
      .then((res: { error?: { message?: string } | null }) => {
        setIsResending(false);
        if (res?.error) {
          toast.error(res.error.message || "Failed to resend verification email");
          return;
        }
        setResendSent(true);
        toast.success("Verification email resent! Please check your inbox.");
      })
      .catch(() => {
        setIsResending(false);
        toast.error("Failed to resend verification email. Please try again.");
      });
  };

  // Case 1: Successfully Verified
  if (verifiedParam === "true") {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Email verified!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you for verifying your email address. Your WedPlan account is now active and ready to use.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className="inline-flex h-10 w-full sm:w-auto items-center justify-center rounded-md bg-primary px-6 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in to continue
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 w-full sm:w-auto items-center justify-center rounded-md border border-input bg-background px-6 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Verification Error or Expired Token
  if (errorParam) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Verification link expired
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {decodeURIComponent(errorParam) ||
              "This verification link is invalid or has expired. You can request a fresh verification link below."}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 text-left space-y-3">
          <label htmlFor="resend-email" className="text-xs font-semibold text-foreground">
            Your email address
          </label>
          <input
            id="resend-email"
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 cursor-pointer disabled:opacity-50"
          >
            {isResending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            <span>Resend verification email</span>
          </button>
        </div>

        <div>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    );
  }

  // Case 3: Standard Check Inbox Notice (After Sign-up)
  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
        <Mail className="size-8" />
      </div>

      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We have sent an activation link to{" "}
          <span className="font-semibold text-foreground">
            {emailParam || "your email address"}
          </span>
          . Please check your inbox and click the verification link to activate your account.
        </p>
      </div>

      {resendSent ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            A new verification email has been sent!
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Please allow a few moments and check your spam folder if it doesn&apos;t arrive soon.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5 text-left space-y-3">
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or request a new link:
          </p>
          {!emailParam && (
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          )}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-xs font-semibold text-foreground transition-all hover:bg-secondary cursor-pointer disabled:opacity-50"
          >
            {isResending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            <span>Resend verification email</span>
          </button>
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}
