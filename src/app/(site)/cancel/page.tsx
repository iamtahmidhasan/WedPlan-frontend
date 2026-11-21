import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, ArrowRight, LayoutDashboard, RefreshCcw, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Cancelled | WedPlan",
  description: "Your WedPlan subscription payment was cancelled. No charges were made.",
};

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center shadow-xs sm:p-10">
        {/* Cancelled Icon */}
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <XCircle className="size-8" />
        </div>

        {/* Header */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          Transaction Cancelled
        </span>

        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Checkout was not completed
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          No charges were made to your account. Your current subscription tier and service listings remain unchanged.
        </p>

        {/* Information Callout */}
        <div className="mt-8 rounded-xl border border-border/80 bg-secondary/30 p-5 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Why upgrade to Premium?</p>
              <p className="mt-1 leading-relaxed">
                Unlock unlimited wedding service listings, priority placement across search & categories, verified vendor trust badge, and zero monthly fees.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/subscription"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            <RefreshCcw className="size-4" />
            <span>Try Again</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <LayoutDashboard className="size-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <div className="mt-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <span>Browse Wedding Services</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
