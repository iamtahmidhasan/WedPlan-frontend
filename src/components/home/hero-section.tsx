"use client";

import Link from "next/link";
import { ArrowRight, Compass, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PixelBlast } from "@/components/pixel-blast";

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/services");
    }
  };

  return (
    <section className="border-b border-border bg-background">
      <div className="grid lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(18rem,0.85fr)_minmax(30rem,1.15fr)]">
        {/* Left Editorial Aside Banner with PixelBlast */}
        <aside className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between overflow-hidden bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-12 lg:min-h-full lg:p-14">
          <PixelBlast
            className="absolute inset-0 size-full pointer-events-auto"
            color="rgba(255, 255, 255, 0.45)"
            dotSize={2.5}
            gap={6}
            shape="square"
            density={1.1}
            coverage={1}
            showFloor={true}
          />

          <div className="relative z-10 pointer-events-none">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/75">
              <Sparkles className="size-3.5" />
              WedPlan Celebration Guide
            </span>
          </div>

          <div className="relative z-10 my-8 max-w-md lg:my-0 pointer-events-none">
            <p className="font-heading text-4xl leading-none tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-8xl">
              WedPlan
            </p>
            <p className="mt-3 font-heading text-2xl leading-snug sm:text-3xl lg:text-4xl text-primary-foreground/95">
              The good part starts right here.
            </p>
            <p className="mt-3 max-w-[36ch] text-xs leading-relaxed sm:text-sm text-primary-foreground/80">
              A quieter, calmer way to connect with trusted venues, photographers,
              florists, and catering artisans.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs tracking-wider uppercase text-primary-foreground/70 pointer-events-none">
            <span>Venues</span>
            <span className="size-1 rounded-full bg-primary-foreground/40" />
            <span>Photography</span>
            <span className="size-1 rounded-full bg-primary-foreground/40" />
            <span>Catering</span>
            <span className="size-1 rounded-full bg-primary-foreground/40" />
            <span>Florals</span>
          </div>

          {/* Signature Circular Geometric Motifs */}
          <div
            className="pointer-events-none absolute -bottom-24 -right-16 size-64 sm:size-80 rounded-full border border-primary-foreground/20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-12 -right-6 size-44 sm:size-56 rounded-full border border-primary-foreground/15"
            aria-hidden="true"
          />
        </aside>

        {/* Right Content Section */}
        <section className="flex items-center justify-center border-t border-border px-6 py-10 sm:px-10 sm:py-14 lg:border-t-0 lg:px-16 xl:px-24">
          <div className="w-full max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Curated Wedding Directory
            </p>

            <h1 className="font-heading text-3xl leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              Everything your day needs, in one calm place.
            </h1>

            <p className="mt-3 sm:mt-5 max-w-[46ch] text-sm sm:text-base leading-relaxed text-muted-foreground">
              WedPlan gathers the people and places that make your day feel like
              yours. Discover vetted vendors, explore transparent pricing, and
              start effortless conversations.
            </p>

            {/* Responsive Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mt-6 sm:mt-8 flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-xs sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search venues, photographers, florals..."
                  className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                className="h-10 sm:h-11 gap-2 rounded-lg px-5 text-xs sm:text-sm sm:w-auto"
              >
                <span>Find Services</span>
                <ArrowRight className="size-3.5 sm:size-4" />
              </Button>
            </form>

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button
                render={<Link href="/services" />}
                className="h-11 sm:h-12 w-full gap-2 rounded-md px-5 text-xs sm:text-sm sm:w-auto"
              >
                <Compass aria-hidden="true" />
                Explore All Services
              </Button>
              <Button
                variant="outline"
                render={<Link href="/vendors" />}
                className="h-11 sm:h-12 w-full gap-2 rounded-md border-border bg-background px-5 text-xs sm:text-sm hover:bg-secondary sm:w-auto"
              >
                Browse Vendors
              </Button>
            </div>

            {/* Category Quick Links */}
            <div className="mt-8 sm:mt-10 border-t border-border pt-5 sm:pt-6">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 sm:mb-3">
                Popular Collections
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                {[
                  {
                    name: "Photography",
                    href: "/services?category=photography",
                  },
                  {
                    name: "Venues",
                    href: "/services?category=venue",
                  },
                  {
                    name: "Catering",
                    href: "/services?category=catering",
                  },
                  {
                    name: "Bridal Styling",
                    href: "/services?category=bridal",
                  },
                  {
                    name: "Florals & Decor",
                    href: "/services?category=decoration",
                  },
                ].map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-muted-foreground transition hover:border-primary/50 hover:bg-secondary hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
