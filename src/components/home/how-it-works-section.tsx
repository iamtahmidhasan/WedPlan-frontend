"use client";

import { Search, CalendarCheck, Heart, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    step: "01",
    icon: Search,
    phase: "First Step",
    title: "Discover & Filter",
    description:
      "Browse hand-vetted wedding specialists. Filter by category, location, and transparent pricing to find the perfect creative matches.",
  },
  {
    step: "02",
    icon: CalendarCheck,
    phase: "Direct Connection",
    title: "Submit Inquiries",
    description:
      "Send custom booking requests directly to vendors with your event date, venue details, and vision without third-party friction.",
  },
  {
    step: "03",
    icon: Heart,
    phase: "Your Celebration",
    title: "Plan Stress-Free",
    description:
      "Track accepted bookings in your personal dashboard, review service details, and celebrate your unforgettable day with confidence.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-b border-border bg-background py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Minimal Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              The Journey
            </p>
            <h2 className="mt-2 font-heading text-4xl tracking-tight text-foreground sm:text-5xl">
              How WedPlan Works
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A clear, three-part path from first inspiration to your
              celebration.
            </p>
          </div>

          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground shrink-0"
          >
            <span>Create Account</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Minimal Architectural 3-Column Grid */}
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x sm:border-border lg:grid-cols-3">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between p-8 transition-colors hover:bg-secondary/40 sm:border-b sm:border-border"
              >
                <div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-mono text-xs">{item.step}</span>
                    <Icon className="size-4.5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>

                  <p className="mt-6 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    {item.phase}
                  </p>

                  <h3 className="mt-1 font-heading text-2xl text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border/60">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80">
                    Step {item.step} of 03
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Editorial Quote */}
        <div className="mt-12 flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-center">
          <blockquote className="font-heading text-xl text-foreground/90 italic max-w-2xl">
            &ldquo;We found our photographer and florist in one afternoon.
            Keeping all booking responses in the dashboard saved us countless
            hours.&rdquo;
          </blockquote>

          <div className="flex items-center gap-8 shrink-0 text-xs">
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">
                98%
              </p>
              <p className="text-muted-foreground">Couple Satisfaction</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">
                500+
              </p>
              <p className="text-muted-foreground">Verified Vendors</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
