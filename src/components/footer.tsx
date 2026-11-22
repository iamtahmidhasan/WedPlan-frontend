import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Heart } from "lucide-react";

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 4l11.733 16h4.267l-11.733-16z" />
      <path d="M4 20l6.768-6.768m3.456-3.456L20 4" />
    </svg>
  );
}

function LinkedinIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Footer({ categories = [] }: { categories?: string[] }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 text-card-foreground">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Description */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-block font-heading text-3xl font-bold tracking-[-0.03em] text-foreground transition-colors hover:text-primary"
            >
              WedPlan
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              A calmer, considered way to plan your wedding. Discover top-rated
              vendors, request reservations, and bring your celebration together
              in one seamless platform.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Follow Our Journey
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WedPlan on Instagram"
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <InstagramIcon className="size-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WedPlan on Facebook"
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FacebookIcon className="size-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WedPlan on X (Twitter)"
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <TwitterIcon className="size-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WedPlan on LinkedIn"
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LinkedinIcon className="size-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Vendors Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/premium"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Premium Upgrade
                </Link>
              </li>
            </ul>
          </div>

          {/* Dynamic Service Categories (Only existing categories) */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Service Categories
            </p>
            <ul className="space-y-2.5 text-sm">
              {categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/services?category=${encodeURIComponent(cat)}`}
                      className="text-muted-foreground transition-colors hover:text-foreground capitalize"
                    >
                      {cat}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href="/services"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      All Wedding Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/vendors"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Verified Vendors
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Contact & Support
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <a
                  href="mailto:support@wedplan.com"
                  className="transition-colors hover:text-foreground"
                >
                  support@wedplan.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                <a
                  href="tel:+15558902345"
                  className="transition-colors hover:text-foreground"
                >
                  +1 (555) 890-2345
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>120 Broadway, Suite 1400, New York, NY</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Mon – Fri, 9:00 AM – 6:00 PM EST</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Terms */}
      <div className="border-t border-border/80 bg-background/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row sm:px-10 lg:px-12">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>&copy; {currentYear} WedPlan Inc. All rights reserved. Crafted with</span>
            <Heart className="size-3.5 fill-primary text-primary" />
            <span>for your special day.</span>
          </p>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
