import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  Store,
  ArrowRight,
  Zap,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { apiFetch } from "@/lib/core/server";
import { getPremiumById } from "@/lib/actions/getPremiumById";
import PaymentButton from "@/components/PaymentButton";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Subscription Plans | WedPlan Vendor Portal",
  description: "Manage your WedPlan vendor subscription plan, limits, and unlimited publishing benefits.",
};

const FREE_FEATURES = [
  "Publish up to 3 wedding service listings",
  "Standard catalog and search visibility",
  "Receive and respond to customer booking inquiries",
  "Basic vendor profile with portfolio images",
  "Standard email notifications for new bookings",
];

const PREMIUM_FEATURES = [
  "Publish unlimited wedding services (no 3-service limit)",
  "Top priority placement in Browse Services and Homepage",
  "Verified Vendor Trust Badge on all listings & profile",
  "Advanced booking request management & priority alerts",
  "Promotional vendor highlights in seasonal wedding edits",
  "Lifetime access with zero recurring monthly subscription fees",
  "Dedicated support for vendor onboarding and catalog reviews",
];

export default async function VendorSubscriptionPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const sessionUser = session?.user;
  if (!sessionUser) {
    redirect("/sign-in?redirect=/dashboard/subscription");
  }

  const role = (sessionUser as { role?: string })?.role ?? "customer";
  if (role === "customer") {
    redirect("/premium");
  }

  let vendorServicesCount = 0;
  try {
    const servicesRes = await apiFetch(`/services`, { cache: "no-store" }).catch(() => null);
    if (servicesRes?.ok) {
      const allServices: { vendorId?: string }[] = await servicesRes.json();
      vendorServicesCount = allServices.filter(
        (s) => s.vendorId === sessionUser.id
      ).length;
    }
  } catch (err) {
    console.error("Error fetching vendor service count:", err);
  }

  const premiumData = await getPremiumById({ userId: sessionUser.id }).catch(() => null);
  const isPremium = Boolean(premiumData?.isPremium);

  const usagePercent = Math.min(Math.round((vendorServicesCount / 3) * 100), 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Store className="size-3.5" />
            Vendor Portal
          </span>
          {isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3.5" />
              Verified Premium
            </span>
          )}
        </div>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Manage Subscription Plan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your current publishing tier, service usage, and unlock unlimited vendor capabilities.
        </p>
      </div>

      {/* Current Plan Overview Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Active Tier
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
                {isPremium ? (
                  <>
                    <ShieldCheck className="size-7 text-primary" />
                    <span>Lifetime Premium Plan</span>
                  </>
                ) : (
                  <>
                    <Store className="size-7 text-muted-foreground" />
                    <span>Free Vendor Plan</span>
                  </>
                )}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {isPremium
                ? "Your account has full unlimited service publishing privileges with lifetime validity."
                : "Free vendor accounts are limited to a maximum of 3 published wedding services."}
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 text-left sm:text-right min-w-[220px]">
            <span className="text-xs text-muted-foreground">Service Publishing Quota</span>
            <div className="mt-1 text-xl font-bold text-foreground">
              {isPremium ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex sm:justify-end items-center gap-1.5">
                  <Sparkles className="size-4" />
                  Unlimited
                </span>
              ) : (
                <span>{vendorServicesCount} / 3 Used</span>
              )}
            </div>
            {!isPremium && (
              <div className="mt-2 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    vendorServicesCount >= 3 ? "bg-amber-500" : "bg-primary"
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Warning if at or exceeding limit on free plan */}
        {!isPremium && vendorServicesCount >= 3 && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Free Publishing Limit Reached (3 of 3 services used)</p>
              <p className="mt-0.5 leading-relaxed">
                You cannot add more services until you upgrade to Premium or delete an existing service. Upgrade below to publish unlimited services without restrictions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Free Plan Card */}
        <div
          className={cn(
            "flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs sm:p-8",
            !isPremium ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
          )}
        >
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Free Plan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Standard tier for emerging wedding vendors
                </p>
              </div>
              {!isPremium && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Current Plan
                </span>
              )}
            </div>

            <div className="mt-6 flex items-baseline gap-1 border-b border-border pb-6">
              <span className="font-heading text-4xl font-bold text-foreground">$0</span>
              <span className="text-xs text-muted-foreground">/ Free Forever</span>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Plan Inclusions
              </h4>
              <ul className="mt-4 space-y-3">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-xs text-muted-foreground">
                    <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/dashboard/services"
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              View My Services ({vendorServicesCount}/3)
            </Link>
          </div>
        </div>

        {/* Premium Plan Card */}
        <div
          className={cn(
            "relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs sm:p-8",
            isPremium
              ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
              : "border-primary shadow-sm"
          )}
        >
          {/* Badge */}
          <div className="absolute -top-3 right-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow-xs">
              <Sparkles className="size-3" />
              Recommended for Vendors
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Lifetime Premium</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unlimited listings, priority visibility, and verified status
                </p>
              </div>
              {isPremium && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Active
                </span>
              )}
            </div>

            <div className="mt-6 flex items-baseline gap-1 border-b border-border pb-6">
              <span className="font-heading text-4xl font-bold text-foreground">$20</span>
              <span className="text-xs text-muted-foreground">USD / One-Time Payment</span>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Everything in Free, plus:
              </h4>
              <ul className="mt-4 space-y-3">
                {PREMIUM_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-xs text-foreground font-medium">
                    <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border space-y-3">
            {isPremium ? (
              <div className="flex items-center justify-center gap-2 rounded-md bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4" />
                <span>Premium Lifetime Activated</span>
              </div>
            ) : (
              <>
                <PaymentButton />
                <p className="text-center text-[11px] text-muted-foreground">
                  Secure checkout via Stripe • Instant activation • No recurring fees
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Overview Callout */}
      <div className="rounded-xl border border-border/80 bg-secondary/20 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Zap className="size-5 text-amber-500" />
          <span>Vendor Upgrade Guarantee</span>
        </h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-3 text-xs text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground">Zero Monthly Commitments</h4>
            <p className="mt-1 leading-relaxed">
              Pay once and never worry about renewing. No hidden subscription charges or cancellation fees.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Direct Customer Reach</h4>
            <p className="mt-1 leading-relaxed">
              Gain top positioning on search, category filters, and curated wedding destination collections.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Verified Vendor Trust</h4>
            <p className="mt-1 leading-relaxed">
              Build immediate confidence with couples through the verified vendor badge displayed on your storefront.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs">
          <Link
            href="/dashboard/services/add"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <span>Ready to publish? Add a new wedding service</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/services"
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Explore Live Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
