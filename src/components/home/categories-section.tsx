"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Home, Flower2, Utensils, Sparkles, Shirt } from "lucide-react";
import { motion, type Variants } from "motion/react";

const CATEGORIES = [
  {
    name: "Photography & Videography",
    slug: "Photography & Videography",
    description: "Candid emotional portraits, drone visuals & cinematic wedding films.",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
    icon: Camera,
  },
  {
    name: "Wedding Venues",
    slug: "Wedding Venues",
    description: "Historic estates, rustic barns, seaside villas & luxury ballrooms.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    icon: Home,
  },
  {
    name: "Decoration & Florist",
    slug: "Decoration & Florist",
    description: "Bespoke floral arches, candlelit tablescapes & ambient installations.",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
    icon: Flower2,
  },
  {
    name: "Catering Services",
    slug: "Catering Services",
    description: "Artisanal multi-course dining, custom cocktails & wedding bakeries.",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    icon: Utensils,
  },
  {
    name: "Makeup & Styling",
    slug: "Makeup & Styling",
    description: "Bridal hair artistry, luminous glam & wedding morning wellness.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    icon: Sparkles,
  },
  {
    name: "Wedding Fashion",
    slug: "Wedding Fashion",
    description: "Couture gowns, modern tailored suits, veil designs & bridal jewelry.",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
    icon: Shirt,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function CategoriesSection() {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-primary" aria-hidden="true" />
              <p className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">
                Explore by Specialization
              </p>
            </div>
            <h2 className="mt-3 font-heading text-4xl text-foreground sm:text-5xl">
              Wedding Service Categories
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-[50ch]">
              Discover curated wedding professionals across all key specialties for your celebration.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors shrink-0 group"
          >
            <span>Explore all services</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div key={category.name} variants={cardVariants}>
                <Link
                  href={`/services?category=${encodeURIComponent(category.slug)}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                >
                  {/* Category Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute top-3 left-3 rounded-full bg-background/90 p-2 text-primary shadow-xs backdrop-blur-xs">
                      <Icon className="size-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                      {category.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">
                      {category.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-semibold text-primary">
                      <span>Browse {category.name.split(" ")[0]}</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
