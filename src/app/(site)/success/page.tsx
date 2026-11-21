import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  CalendarCheck,
} from "lucide-react";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { transactionVerify } from "@/lib/actions/transactions";

export const metadata: Metadata = {
  title: "Payment Successful | WedPlan",
  description:
    "Your payment was processed successfully. Welcome to WedPlan Premium!",
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id)
    throw new Error("Please provide a valid session_id (`cs_test_...`)");

  const { status } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });
  if (status === "open") {
    return redirect("/");
  }
  // transaction verify

  const res = await transactionVerify(session_id);
  console.log(res);
  if (res.success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center shadow-xs sm:p-10">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-8" />
          </div>

          {/* Header */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Payment Confirmed
          </span>

          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Thank you for your purchase!
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your payment was processed successfully. You now have unlimited
            service bookings and lifetime access to WedPlan Premium.
          </p>

          {/* Order Details Summary */}
          <div className="mt-8 rounded-xl border border-border/80 bg-secondary/30 p-5 text-left">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-medium text-muted-foreground">
                Plan
              </span>
              <span className="text-sm font-semibold text-foreground">
                WedPlan Lifetime Premium
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 py-3">
              <span className="text-xs font-medium text-muted-foreground">
                Payment Status
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Completed
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-xs font-medium text-muted-foreground">
                Booking Access
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <CalendarCheck className="size-3.5" />
                Unlimited Services
              </span>
            </div>

            {session_id && (
              <p className="mt-3 truncate border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                Reference: <span className="font-mono">{session_id}</span>
              </p>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/services"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>Book Services</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            A confirmation and receipt have been registered with your order.
          </p>
        </div>
      </div>
    );
  }
}
