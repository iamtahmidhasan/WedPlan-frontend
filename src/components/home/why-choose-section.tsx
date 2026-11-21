"use client";

import { ShieldCheck, HeartHandshake, Sparkles, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Hand-Vetted Wedding Vendors",
    description:
      "Every photographer, venue, and florist is personally reviewed and verified to guarantee exceptional artistry and reliable communication.",
  },
  {
    icon: Sparkles,
    title: "Direct & Transparent Pricing",
    description:
      "Explore honest, starting-price transparency with zero surprise commission fees or hidden middleman markups.",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Coordination Hub",
    description:
      "Track all your booking requests, review accepted vendor contracts, and bookmark inspiring services in one calm dashboard.",
  },
  {
    icon: Clock,
    title: "Swift Confirmations & Peace of Mind",
    description:
      "Send custom event dates and details directly to vendors and receive prompt acceptances with full booking history tracking.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function WhyChooseSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-secondary/40 py-16 sm:py-24">
      {/* Decorative ambient background blur */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/3 size-72 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-3.5" />
            <span>The WedPlan Promise</span>
          </div>
          <h2 className="mt-4 font-heading text-4xl leading-tight text-foreground sm:text-5xl">
            Why Choose WedPlan?
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Planning your wedding should feel like a celebration, not a spreadsheet. We designed WedPlan to take the noise out of wedding coordination.
          </p>
        </div>

        {/* 4 Benefits Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                className="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-md"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 rounded-xl border border-primary/20 bg-background/80 p-6 sm:p-8 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground">
              Ready to create your dream wedding team?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Explore hundreds of verified vendors and submit booking inquiries today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/services"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>Explore Services</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
