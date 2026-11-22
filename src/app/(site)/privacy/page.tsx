import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  Mail,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | WedPlan",
  description:
    "Learn how WedPlan collects, protects, and uses your personal data, reservation details, and vendor information.",
};

export default function PrivacyPage() {
  const lastUpdated = "November 22, 2026";

  const highlights = [
    {
      icon: EyeOff,
      title: "Zero Data Selling",
      description:
        "We never sell, rent, or monetize your personal details, celebration timelines, or vendor inquiries to data brokers or advertisers.",
    },
    {
      icon: Lock,
      title: "Bank-Grade Encryption",
      description:
        "All data transmissions are protected via TLS/SSL encryption, with secure session management and tokenized payment processing through Stripe.",
    },
    {
      icon: UserCheck,
      title: "You Own Your Data",
      description:
        "You maintain full ownership of your profile, booking records, and reviews. You can update or delete your information at any time.",
    },
    {
      icon: ShieldCheck,
      title: "Targeted Sharing Only",
      description:
        "Your event details are only shared with the specific wedding professionals you intentionally contact or book through WedPlan.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/40 via-background to-background py-16 sm:py-24">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-80 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px] dark:bg-primary/5"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" />
            <span>Privacy & Transparency</span>
          </div>

          <h1 className="mt-6 font-heading text-4xl font-medium tracking-tight text-foreground sm:text-6xl">
            WedPlan Privacy Policy
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We believe your wedding celebration deserves peace of mind. Here is a clear,
            transparent breakdown of how we collect, safeguard, and respect your personal information.
          </p>

          <p className="mt-6 text-xs text-muted-foreground">
            Last Updated: <span className="font-semibold text-foreground">{lastUpdated}</span> • Effective Date: November 2026
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:py-16">
        {/* Core Commitments Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <h.icon className="size-5" />
              </div>
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  {h.title}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {h.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 divide-y divide-border/60">
          {/* Section 1 */}
          <div className="pt-8 first:pt-0">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              1. Information We Collect
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We collect information that you directly provide when registering on WedPlan,
              browsing vendor catalogs, creating reservation requests, and sharing celebration reviews.
            </p>
            <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Account & Profile Data:</span> Name, email address, password hash, profile avatar, and account role (Couple, Vendor, or Admin).
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Wedding & Booking Details:</span> Desired ceremony dates, venue locations, estimated guest counts, notes, and direct correspondence with vendors.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Vendor Business Information:</span> Business name, contact email, discipline category, pricing tiers, service descriptions, and portfolio photography.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Reviews & Feedback:</span> 1–5 star ratings, feedback commentary, and public couple endorsements.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Payment Records:</span> Subscription payments and transaction references are processed securely through Stripe. WedPlan does not store full credit card numbers or banking secrets.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="pt-8">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              2. How We Use Your Information
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The data we collect is utilized strictly to provide, improve, and protect your wedding planning experience:
            </p>
            <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Service Delivery:</span> Connecting couples directly with verified wedding vendors and processing reservation requests.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Booking Status & Communications:</span> Sending real-time notifications regarding confirmations, completed services, and reminder alerts.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Quality Assurance & Moderation:</span> Verifying legitimate vendor portfolios, preventing fraudulent listings, and maintaining authentic couple reviews.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• AI Planning Assistant:</span> Assisting couples in finding matching wedding categories and services through contextual AI queries (never sharing personal identifiable data).
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="pt-8">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              3. Information Sharing & Disclosure
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your celebration data is treated with confidentiality. We only share information under the following limited circumstances:
            </p>
            <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• With Selected Vendors:</span> When you submit a booking inquiry, your name, requested dates, event location, and message are forwarded to that specific vendor.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Public Reviews:</span> Star ratings and testimonials you submit on completed services are publicly displayed on service listings and vendor profile cards.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Infrastructure Providers:</span> Trusted third-party partners (such as Stripe for payments and MongoDB Atlas for database hosting) who are legally bound by strict confidentiality agreements.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Legal Compliance:</span> When required by applicable law, court order, or official governmental regulatory authority.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="pt-8">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              4. Data Retention & Security Measures
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We employ strict industry-standard technical, operational, and organizational security protocols to protect your personal information against unauthorized access, loss, or misuse:
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Session tokens are cryptographically secured using salted hashing. All network requests are routed over HTTPS. We retain your booking records, reviews, and profile data for as long as your account remains active or as necessary to satisfy accounting and legal obligations.
            </p>
          </div>

          {/* Section 5 */}
          <div className="pt-8">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              5. Your Rights & Choices
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Regardless of your location, WedPlan provides you with straightforward control over your data:
            </p>
            <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Review Editing:</span> You can edit or revise your submitted service reviews at any time from your completed booking details page.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Access & Export:</span> You may request a copy of your personal data and booking history by contacting our support team.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">• Deletion & Erasure:</span> You can request the permanent removal of your account, vendor profile, or customer data at any time.
              </li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="pt-8">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              6. Contact Our Privacy Team
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please reach out to us directly:
            </p>
            <div className="mt-5 rounded-xl border border-border bg-card p-5 sm:p-6 text-xs space-y-2">
              <p className="font-bold text-foreground flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <span>privacy@wedplan.com</span>
              </p>
              <p className="text-muted-foreground">
                WedPlan Inc., 120 Broadway, Suite 1400, New York, NY 10271
              </p>
              <p className="text-muted-foreground">
                Response turnaround: typically within 24–48 business hours.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation CTA */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/80 bg-secondary/30 p-6 sm:p-8">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Have questions about booking vendors?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Explore our vetted wedding partners and find the perfect team for your celebration.
            </p>
          </div>
          <Link
            href="/vendors"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer shrink-0"
          >
            <span>Explore Vendors</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
