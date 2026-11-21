"use client";

import {
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

const BENEFITS = [
  {
    number: "01",
    icon: ShieldCheck,
    title: "Hand-Vetted Vendors",
    description:
      "Every photographer, venue, and artisan is personally reviewed to ensure reliable communication and verified artistry.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Transparent Pricing",
    description:
      "Honest starting prices with zero hidden markups or commission surprises. What you see is what you plan for.",
  },
  {
    number: "03",
    icon: HeartHandshake,
    title: "Calm Coordination",
    description:
      "Manage booking inquiries, review accepted contracts, and save your favorite services in one unified space.",
  },
  {
    number: "04",
    icon: Clock,
    title: "Swift Confirmations",
    description:
      "Send custom event dates and requirements directly to vendors and receive prompt responses without endless email chains.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="border-b border-border bg-background py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Minimal Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              The WedPlan Promise
            </p>
            <h2 className="mt-2 font-heading text-4xl tracking-tight text-foreground sm:text-5xl">
              Why Choose WedPlan?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Planning your wedding should feel like a celebration, not a
              spreadsheet.
            </p>
          </div>

          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground shrink-0"
          >
            <span>Start Planning</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Minimal Architectural Grid */}
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x  sm:border-border lg:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative flex flex-col justify-between p-8 transition-colors hover:bg-secondary/40 sm:border-b sm:border-border"
              >
                <div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-mono text-xs">{benefit.number}</span>
                    <Icon className="size-4.5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>

                  <h3 className="mt-8 font-heading text-2xl text-foreground transition-colors group-hover:text-primary">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border/60">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80">
                    Guaranteed standard
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
