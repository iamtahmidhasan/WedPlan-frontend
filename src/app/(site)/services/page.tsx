import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Service } from "@/components/services/service-card";
import { BrowseServicesCatalog } from "@/components/services/browse-services-catalog";
import { apiFetch } from "@/lib/core/server";

export const metadata: Metadata = {
  title: "Browse Wedding Services | WedPlan",
  description:
    "Explore wedding venues, photographers, florists, caterers, makeup artists, and wedding fashion vendors across the country.",
};

interface UserSummary {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
}

interface ServicesPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    location?: string;
    sort?: string;
  }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { search = "", category = "all", location = "all", sort = "featured" } =
    await searchParams;

  // Build query parameters for the backend API
  const queryParams = new URLSearchParams();
  if (search && search.trim()) queryParams.set("search", search.trim());
  if (category && category !== "all") queryParams.set("category", category);
  if (location && location !== "all") queryParams.set("location", location);
  if (sort && sort !== "featured") queryParams.set("sort", sort);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/services?${queryString}` : "/services";

  let services: Service[] = [];
  let availableLocations: string[] = [];
  let availableCategories: string[] = [];
  let users: UserSummary[] = [];

  try {
    const [servicesRes, allServicesRes, categoriesRes, usersRes] = await Promise.all([
      apiFetch(endpoint, { cache: "no-store" }),
      apiFetch("/services", { cache: "no-store" }).catch(() => null),
      apiFetch("/categories", { cache: "no-store" }).catch(() => null),
      apiFetch("/users", { cache: "no-store" }).catch(() => null),
    ]);

    if (!servicesRes.ok) throw new Error("Request failed");

    const rawFilteredServices = (await servicesRes.json()) as Service[];
    services = rawFilteredServices.filter((s) => !s.status || s.status === "approved");

    if (allServicesRes && allServicesRes.ok) {
      const allServices = (await allServicesRes.json()) as Service[];
      const activeServices = allServices.filter((s) => !s.status || s.status === "approved");
      availableLocations = [...new Set(activeServices.map((s) => s.location?.trim()).filter(Boolean))].sort() as string[];
      availableCategories = [...new Set(activeServices.map((s) => s.category?.trim()).filter(Boolean))].sort() as string[];
    }

    if (categoriesRes && categoriesRes.ok) {
      const categoryDocs = (await categoriesRes.json()) as { name: string }[];
      if (Array.isArray(categoryDocs) && categoryDocs.length > 0) {
        availableCategories = categoryDocs.map((c) => c.name).filter(Boolean);
      }
    }

    if (usersRes && usersRes.ok) {
      users = (await usersRes.json()) as UserSummary[];
    }
  } catch {
    // Graceful fallback
  }

  const CATEGORY_TICKERS = [
    { label: "All", query: "all" },
    { label: "Photography", query: "photography" },
    { label: "Venues", query: "venue" },
    { label: "Decoration", query: "decoration" },
    { label: "Catering", query: "catering" },
    { label: "Makeup", query: "makeup" },
    { label: "Fashion", query: "fashion" },
  ];

  return (
    <main className="bg-background min-h-screen">
      {/* Ultra Minimal Editorial Header */}
      <section className="border-b border-border bg-background pt-14 pb-12 sm:pt-20 sm:pb-16">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
          <div className="flex flex-col justify-between gap-8 border-b border-border pb-10 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Directory Catalog
              </p>
              <h1 className="mt-3 font-heading text-5xl tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Services
              </h1>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-[52ch]">
                Hand-vetted venues, photographers, florists, and catering specialists.
                Filter by discipline, location, and transparent pricing.
              </p>
            </div>

            {/* Clean mono metrics */}
            <div className="flex items-center gap-8 border-t border-border/80 pt-6 md:border-t-0 md:pt-0 shrink-0">
              <div>
                <p className="font-heading text-3xl font-bold text-foreground">
                  {services.length}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Approved Listings
                </p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-heading text-3xl font-bold text-foreground">
                  {availableCategories.length || 6}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Disciplines
                </p>
              </div>
            </div>
          </div>

          {/* Minimalist Horizontal Discipline Nav */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono uppercase tracking-wider">
            <span className="text-muted-foreground">Filter:</span>
            {CATEGORY_TICKERS.map((cat) => {
              const isActive =
                category === cat.query ||
                (cat.query === "all" && category === "all");
              return (
                <Link
                  key={cat.label}
                  href={
                    cat.query === "all"
                      ? "/services"
                      : `/services?category=${cat.query}`
                  }
                  className={`transition-colors flex items-center gap-1 ${
                    isActive
                      ? "text-primary font-bold underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{cat.label}</span>
                  {isActive && <ArrowUpRight className="size-3" />}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Browse Catalog Section */}
      <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:py-14">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-secondary/50" />}>
          <BrowseServicesCatalog
            services={services}
            availableLocations={availableLocations}
            availableCategories={availableCategories}
            users={users}
            currentSearch={search}
            currentCategory={category}
            currentLocation={location}
            currentSort={sort}
          />
        </Suspense>
      </section>
    </main>
  );
}
