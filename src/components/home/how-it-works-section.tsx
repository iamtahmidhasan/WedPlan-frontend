"use client";

import { motion, type Variants } from "motion/react";
import { Search, CalendarCheck, Heart, Star, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Discover & Filter",
    description:
      "Browse hand-vetted wedding specialists. Filter by category, location, and price to find the perfect creative matches for your unique aesthetic.",
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Submit Booking Requests",
    description:
      "Send custom booking inquiries directly to vendors with your event date, location, and wedding vision with zero middleman friction.",
  },
  {
    step: "03",
    icon: Heart,
    title: "Celebrate Stress-Free",
    description:
      "Track accepted bookings in your personal dashboard, coordinate details directly with vendors, and celebrate your unforgettable day.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function HowItWorksSection() {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="mt-4 font-heading text-4xl leading-tight text-foreground sm:text-5xl">
            How WedPlan Works
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            From the first venue inspiration to the final dance, we make connecting with wedding vendors simple, transparent, and joyful.
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative"
        >
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                variants={stepVariants}
                className="relative flex flex-col rounded-xl border border-border bg-card p-8 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-heading text-4xl font-extrabold text-primary/30">
                    {item.step}
                  </span>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  {item.description}
                </p>

                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/30 font-bold text-xl">
                    →
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Customer Testimonial Highlight Card */}
        <div className="mt-16 rounded-2xl border border-border bg-secondary/50 p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="font-heading text-lg sm:text-xl text-foreground italic leading-relaxed">
                &ldquo;WedPlan completely changed how we organized our destination wedding. We found our photographer and florist in one afternoon, and managing all booking responses in the dashboard saved us countless hours.&rdquo;
              </blockquote>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                — Sophia &amp; Liam, Married in Napa Valley
              </p>
            </div>

            <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-8 text-center shrink-0">
              <div>
                <p className="font-heading text-3xl font-bold text-foreground">98%</p>
                <p className="text-xs text-muted-foreground">Couples Satisfied</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-heading text-3xl font-bold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground">Vetted Vendors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
