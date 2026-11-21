"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Home, Flower2, Utensils, Sparkles, Shirt } from "lucide-react";

// Predefined categories with pictures and icons
const ALL_CATEGORIES = [
  {
    name: "Photography & Videography",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
    description: "Candid emotional portraits, drone visuals & cinematic wedding films.",
    icon: Camera,
  },
  {
    name: "Wedding Venues",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    description: "Historic estates, rustic barns, seaside villas & luxury ballrooms.",
    icon: Home,
  },
  {
    name: "Decoration & Florist",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
    description: "Bespoke floral arches, candlelit tablescapes & ambient installations.",
    icon: Flower2,
  },
  {
    name: "Catering Services",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    description: "Artisanal multi-course dining, custom cocktails & wedding bakeries.",
    icon: Utensils,
  },
  {
    name: "Makeup & Styling",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    description: "Bridal hair artistry, luminous glam & wedding morning wellness.",
    icon: Sparkles,
  },
  {
    name: "Wedding Fashion",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
    description: "Couture gowns, modern tailored suits, veil designs & bridal jewelry.",
    icon: Shirt,
  },
];

interface CategoriesSectionProps {
  categories?: string[];
}

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
  // Only show categories that exist in the database
  const matched = ALL_CATEGORIES.filter((item) =>
    categories.some(
      (c) =>
        c.toLowerCase() === item.name.toLowerCase() ||
        item.name.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(item.name.toLowerCase())
    )
  );

  // Also include any newly created categories from admin
  const custom = categories
    .filter(
      (catName) =>
        !matched.some(
          (m) =>
            m.name.toLowerCase() === catName.toLowerCase() ||
            catName.toLowerCase().includes(m.name.toLowerCase())
        )
    )
    .map((name) => ({
      name,
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      description: `Bespoke ${name} specialists and packages.`,
      icon: Sparkles,
    }));

  const activeCategories =
    categories.length > 0 ? [...matched, ...custom] : ALL_CATEGORIES;

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/services?category=${encodeURIComponent(category.name)}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-md"
              >
                {/* Image */}
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
                    <span>Explore {category.name.split(" ")[0]}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
