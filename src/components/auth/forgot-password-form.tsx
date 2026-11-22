"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    authClient
      .requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      })
      .then((res: { error?: { message?: string } | null }) => {
        setIsSubmitting(false);
        if (res?.error) {
          toast.error(res.error.message || "Failed to send reset link");
          return;
        }
        setIsSubmitted(true);
        toast.success("Password reset link sent to your email!");
      })
      .catch(() => {
        setIsSubmitting(false);
        toast.error("Failed to send reset link. Please try again.");
      });
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Check your inbox
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We have sent a secure password reset link to{" "}
            <span className="font-semibold text-foreground">{email}</span>. Click
            the link in the email to choose a new password.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Back to sign in
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
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Enter the email address registered with your WedPlan account and we
          will send you a secure link to reset it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="reset-email"
            className="text-xs font-semibold text-foreground"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
          <span>Send Reset Link</span>
        </button>
      </form>
    </div>
  );
}
