"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation criteria
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Missing reset token. Please request a new link.");
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase) {
      toast.error("Please meet all password strength requirements.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    authClient
      .resetPassword({
        newPassword: password,
        token,
      })
      .then((res: { error?: { message?: string } | null }) => {
        setIsSubmitting(false);
        if (res?.error) {
          toast.error(res.error.message || "Failed to reset password");
          return;
        }
        setIsSuccess(true);
        toast.success("Password reset successfully!");
      })
      .catch(() => {
        setIsSubmitting(false);
        toast.error("Failed to reset password. The link may have expired.");
      });
  };

  // If no token or error passed in URL
  if (errorParam || !token) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Invalid or expired link
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {errorParam
              ? decodeURIComponent(errorParam)
              : "This password reset link is invalid or has already expired. Please request a new one."}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  // Success view
  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Password reset complete
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your password has been securely updated. You can now sign in with your new password.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to sign in</span>
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Create new password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Please enter and confirm your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-xs font-semibold text-foreground"
          >
            New password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="new-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="space-y-1.5 rounded-lg border border-border/60 bg-secondary/30 p-3 text-[11px] text-muted-foreground">
          <p className="font-semibold text-foreground">Password requirements:</p>
          <ul className="space-y-1">
            <li className={hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
              • At least 6 characters
            </li>
            <li className={hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
              • At least one uppercase letter (A-Z)
            </li>
            <li className={hasLowercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
              • At least one lowercase letter (a-z)
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-xs font-semibold text-foreground"
          >
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          <span>Reset Password</span>
        </button>
      </form>
    </div>
  );
}
