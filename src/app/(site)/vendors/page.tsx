import type { Metadata } from "next";
import { Sparkles, ShieldCheck, Store, Star } from "lucide-react";
import { apiFetch } from "@/lib/core/server";
import {
  VendorsDirectory,
  type VendorUser,
  type ServiceSummary,
  type ReviewSummary,
} from "@/components/vendors/vendors-directory";

export const metadata: Metadata = {
  title: "Wedding Vendors | WedPlan",
  description:
    "Discover trusted wedding photographers, venues, caterers, florists, and stylists. Connect directly with verified wedding professionals.",
};

export default async function VendorsPage() {
  const [vendorsRes, servicesRes, reviewsRes] = await Promise.all([
    apiFetch("/vendors", { cache: "no-store" }),
    apiFetch("/services", { cache: "no-store" }),
    apiFetch("/reviews", { cache: "no-store" }),
  ]);

  const vendors: VendorUser[] = vendorsRes.ok ? await vendorsRes.json() : [];
  const services: ServiceSummary[] = servicesRes.ok ? await servicesRes.json() : [];
  const reviews: ReviewSummary[] = reviewsRes.ok ? await reviewsRes.json() : [];

  const premiumVendorsCount = vendors.filter((v) => v.isPremium).length;
  const totalReviewsCount = reviews.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Centered Editorial Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/35 via-background to-background py-16 sm:py-24">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-80 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px] dark:bg-primary/5"
          aria-hidden="true"
        />

        <div className="mx-auto w-full max-w-4xl px-6 text-center sm:px-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Curated Creative Partners</span>
          </div>

          {/* Centered Large Display Headline */}
          <h1 className="mt-6 font-heading text-4xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Meet the people who make your celebration{" "}
            <span className="relative inline-block text-primary italic font-serif">
              unforgettable.
              <svg
                className="absolute -bottom-1 left-0 w-full text-primary/30"
                viewBox="0 0 220 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 7C50 2 170 2 218 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Editorial Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Browse hand-vetted photographers, venue hosts, florists, and catering specialists.
            Explore verified portfolios, compare packages, and reach out directly with zero commission markups.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Store className="size-3.5 text-primary" />
              <span className="font-bold text-foreground">{vendors.length}</span> Verified Vendors
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-amber-500" />
              <span className="font-bold text-foreground">{premiumVendorsCount}</span> Featured Partners
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              <span className="font-bold text-foreground">{totalReviewsCount}</span> Verified Reviews
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Booking</span>
            </span>
          </div>
        </div>
      </section>

      {/* Directory & Profile Cards Section */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:py-16">
        <VendorsDirectory vendors={vendors} services={services} reviews={reviews} />
      </div>
    </div>
  );
}
