"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85",
    alt: "An open-air wedding venue framed by trees",
  },
  {
    src: "https://images.unsplash.com/photo-1507504031083-bacf6a72d966?auto=format&fit=crop&w=900&q=85",
    alt: "A considered wedding reception table setting",
  },
];

export function HeroSection() {
  const [venueImage, receptionImage] = heroImages;

  return (
    <section className="relative overflow-hidden border-b border-border bg-secondary/50">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:px-10 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-20 lg:py-24">
        {/* Left Column Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary" aria-hidden="true" />
            <p className="text-xs uppercase tracking-[0.24em] text-primary font-semibold flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              <span>Wedding planning, softly done</span>
            </p>
          </div>

          <h1 className="mt-7 font-heading text-6xl leading-[0.9] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-8xl">
            The good part
            <br />
            starts <span className="text-primary">here.</span>
          </h1>

          <p className="mt-7 max-w-[46ch] text-base leading-7 text-muted-foreground">
            WedPlan gathers the people and places that make your day feel like
            yours — venues, photographers, florists, and more, in one calm
            space.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground outline-none transition-all hover:bg-primary/90 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore Wedding Services
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start Planning
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span>Venues</span>
            <span className="size-1 rounded-full bg-border" />
            <span>Photography</span>
            <span className="size-1 rounded-full bg-border" />
            <span>Catering</span>
            <span className="size-1 rounded-full bg-border" />
            <span>Florals</span>
            <span className="size-1 rounded-full bg-border" />
            <span>Fashion</span>
          </div>
        </motion.div>

        {/* Right Column Visual Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mt-4 h-80 sm:mt-0 sm:h-[30rem] lg:h-[34rem]"
        >
          <div
            className="absolute right-0 top-0 size-48 rounded-full border border-primary/30 sm:right-6 sm:size-64 lg:size-80"
            aria-hidden="true"
          />
          <div className="absolute left-0 top-2 h-[80%] w-[68%] overflow-hidden border border-border bg-background shadow-sm rounded-lg sm:top-6 sm:h-[78%] sm:w-[66%]">
            <Image
              src={venueImage.src}
              alt={venueImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 70vw"
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 h-[66%] w-[62%] overflow-hidden border border-border bg-background shadow-md rounded-lg">
            <Image
              src={receptionImage.src}
              alt={receptionImage.alt}
              fill
              sizes="(min-width: 1024px) 30vw, 55vw"
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
