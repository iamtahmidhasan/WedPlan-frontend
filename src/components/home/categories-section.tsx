"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Camera,
  Home,
  Flower2,
  Utensils,
  Sparkles,
  Shirt,
} from "lucide-react";

// Curated list of categories with iconic symbols, high-res editorial imagery, and descriptions
const ALL_CATEGORIES = [
  {
    name: "Photography & Videography",
    query: "photography",
    description: "Candid portraits, drone visuals & cinematic films.",
    image:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80",
    icon: Camera,
  },
  {
    name: "Wedding Venues",
    query: "venue",
    description: "Historic estates, gardens, coastal terraces & ballrooms.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    icon: Home,
  },
  {
    name: "Decoration & Florist",
    query: "decoration",
    description: "Floral arches, bespoke tablescapes & ambient installations.",
    image:
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80",
    icon: Flower2,
  },
  {
    name: "Catering Services",
    query: "catering",
    description: "Multi-course dining, cocktail bars & artisan bakeries.",
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
    icon: Utensils,
  },
  {
    name: "Makeup & Styling",
    query: "makeup",
    description: "Bridal hair artistry, timeless glam & wellness styling.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    icon: Sparkles,
  },
  {
    name: "Wedding Fashion",
    query: "fashion",
    description: "Couture gowns, modern tuxedos, veil designs & jewelry.",
    image:
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80",
    icon: Shirt,
  },
];

interface CategoriesSectionProps {
  categories?: string[];
}

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const matched = ALL_CATEGORIES.filter((item) =>
    categories.some(
      (c) =>
        c.toLowerCase() === item.name.toLowerCase() ||
        item.name.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(item.name.toLowerCase()),
    ),
  );

  const custom = categories
    .filter(
      (catName) =>
        !matched.some(
          (m) =>
            m.name.toLowerCase() === catName.toLowerCase() ||
            catName.toLowerCase().includes(m.name.toLowerCase()),
        ),
    )
    .map((name) => ({
      name,
      query: name.toLowerCase(),
      description: `Bespoke ${name} specialists and packages.`,
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      icon: Sparkles,
    }));

  const activeCategories =
    categories.length > 0 ? [...matched, ...custom] : ALL_CATEGORIES;

  return (
    <section className="border-b border-border bg-background py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Minimal Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Specializations
            </p>
            <h2 className="mt-2 font-heading text-4xl tracking-tight text-foreground sm:text-5xl">
              Categories
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every detail of your celebration, organized into dedicated
              disciplines.
            </p>
          </div>

          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground shrink-0"
          >
            <span>All Services</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Minimal Grid with Hover Background Image Reveal */}
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x sm:border-border lg:grid-cols-3">
          {activeCategories.map((category, index) => {
            const Icon = category.icon;
            const number = String(index + 1).padStart(2, "0");
            const isHovered = activeCategory === category.name;

            return (
              <Link
                key={category.name}
                href={`/services?category=${encodeURIComponent(category.query)}`}
                onMouseEnter={() => setActiveCategory(category.name)}
                onMouseLeave={() => setActiveCategory(null)}
                onFocus={() => setActiveCategory(category.name)}
                onBlur={() => setActiveCategory(null)}
                className="group relative flex flex-col justify-between overflow-hidden p-8 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:border-b sm:border-border"
              >
                {/* Background Image Reveal on Hover / Active */}
                <div
                  className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                >
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="scale-105 object-cover transition-transform duration-700 ease-out group-hover:scale-100"
                  />
                  {/* Gentle gradient overlay to keep images vibrant and bright while ensuring readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-background/50 dark:from-background/85 dark:via-background/50 dark:to-background/60" />
                </div>

                {/* Card Content (z-10 relative) */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-mono text-xs transition-colors group-hover:text-foreground font-semibold">
                      {number}
                    </span>
                    <span className="rounded-full bg-background/60 p-1.5 backdrop-blur-xs transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-4" />
                    </span>
                  </div>

                  <h3 className="mt-8 font-heading text-2xl text-foreground transition-colors group-hover:text-primary drop-shadow-2xs">
                    {category.name}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground font-medium drop-shadow-2xs">
                    {category.description}
                  </p>
                </div>

                <div className="relative z-10 mt-8 flex items-center gap-1.5 text-xs font-semibold text-foreground/80 transition-colors group-hover:text-primary">
                  <span>Explore</span>
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
