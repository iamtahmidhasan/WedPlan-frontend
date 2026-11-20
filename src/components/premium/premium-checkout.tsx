import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentButton from "../PaymentButton";

const PREMIUM_BENEFITS = [
  "Unlimited wedding service bookings (no 3-booking cap)",
  "Direct vendor communication & priority booking confirmation",
  "Free lifetime access with a single one-time payment",
  "No recurring monthly subscriptions or hidden charges",
  "Dedicated support for wedding reservations",
];

const VENDOR_PREMIUM_BENEFITS = [
  "Publish unlimited services (no 3-service cap)",
  "Keep your full vendor storefront live in the catalog",
  "Lifetime access with a single one-time payment",
  "No recurring monthly subscriptions or hidden charges",
  "Dedicated support for vendor accounts",
];

export function PremiumCheckout({ isVendor = false }: { isVendor?: boolean }) {
  const benefits = isVendor ? VENDOR_PREMIUM_BENEFITS : PREMIUM_BENEFITS;

  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <Sparkles className="size-3.5" />
          One-Time Upgrade
        </span>
        <h1 className="mt-4 font-heading text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          {isVendor ? "Unlock Unlimited Services" : "Unlock Unlimited Bookings"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {isVendor
            ? "Vendors can publish 3 services for free. Upgrade to Premium with a single one-time payment of $20 to publish unlimited wedding services."
            : "Customers can book 3 services for free. Upgrade to Premium with a single one-time payment of $20 to book unlimited wedding services."}
        </p>
      </div>

      {/* Pricing Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-baseline justify-between border-b border-border pb-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              WedPlan Lifetime Premium
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
                $20
              </span>
              <span className="text-xs text-muted-foreground">
                USD / one-time
              </span>
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            Pay Once, Keep Forever
          </span>
        </div>

        <ul className="mt-5 space-y-3">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2.5 text-xs text-muted-foreground"
            >
              <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Action */}
      <div className="mt-6 space-y-3">
        <PaymentButton />

        <p className="text-center text-xs text-muted-foreground">
          Secure payment • Instant activation • No recurring fees
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/services"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to Services
        </Link>
      </div>
    </div>
  );
}
