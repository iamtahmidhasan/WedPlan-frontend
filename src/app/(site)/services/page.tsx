import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
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
  let users: UserSummary[] = [];
  let hasError = false;

  try {
    const [servicesRes, allServicesRes, usersRes] = await Promise.all([
      apiFetch(endpoint, { cache: "no-store" }),
      apiFetch("/services", { cache: "no-store" }).catch(() => null),
      apiFetch("/users", { cache: "no-store" }).catch(() => null),
    ]);

    if (!servicesRes.ok) throw new Error("Request failed");

    const rawFilteredServices = (await servicesRes.json()) as Service[];
    // Public directory only displays active and approved services
    services = rawFilteredServices.filter((s) => !s.status || s.status === "approved");

    if (allServicesRes && allServicesRes.ok) {
      const allServices = (await allServicesRes.json()) as Service[];
      const locSet = new Set<string>();
      for (const s of allServices) {
        if (s.location && s.location.trim()) {
          locSet.add(s.location.trim());
        }
      }
      availableLocations = Array.from(locSet).sort();
    }

    if (usersRes && usersRes.ok) {
      users = (await usersRes.json()) as UserSummary[];
    }
  } catch {
    hasError = true;
  }

  const heroImages = services
    .slice(0, 2)
    .map((service) => service.images?.[0])
    .filter((image): image is string => Boolean(image));

  return (
    <main className="bg-background min-h-screen">
      {/* Hero Directory Header */}
      <section className="relative overflow-hidden border-b border-border bg-secondary/50">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-14 sm:px-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center lg:gap-16 lg:py-20">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">
              The WedPlan Directory
            </p>
            <h1 className="mt-4 font-heading text-5xl leading-[0.94] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Find the people
              <br />
              who make the <span className="text-primary">day yours.</span>
            </h1>
            <p className="mt-6 max-w-[48ch] text-base leading-7 text-muted-foreground">
              Vetted venues, photographers, florists, caterers, and wedding specialists — gathered in
              one calm place so you can discover, filter, and plan with confidence.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <span className="font-heading text-4xl font-bold leading-none text-foreground sm:text-5xl">
                {services.length}
              </span>
              <span className="text-xs sm:text-sm leading-5 text-muted-foreground">
                approved services,
                <br />
                matching your filters.
              </span>
            </div>
          </div>

          <div className="relative hidden h-72 sm:block lg:h-96">
            <div
              className="absolute right-6 top-0 size-52 rounded-full border border-primary/30 lg:size-72"
              aria-hidden="true"
            />
            {heroImages[0] && (
              <div className="absolute left-0 top-4 h-[85%] w-[68%] overflow-hidden border border-border bg-background shadow-sm rounded-lg">
                <Image
                  src={heroImages[0]}
                  alt="Featured wedding venue"
                  fill
                  priority
                  sizes="(min-width: 1024px) 35vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            {heroImages[1] && (
              <div className="absolute bottom-0 right-0 h-[72%] w-[58%] overflow-hidden border border-border bg-background shadow-md rounded-lg">
                <Image
                  src={heroImages[1]}
                  alt="Featured wedding floral and decoration"
                  fill
                  sizes="(min-width: 1024px) 30vw, 45vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Browse Catalog Section */}
      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Browse & Filter
            </p>
            <h2 className="mt-1 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Explore Wedding Services
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {hasError ? "Directory unavailable" : `${services.length} approved listings`}
          </p>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mb-8 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            We couldn’t load the services right now. Please try again in a
            moment.
          </p>
        )}

        <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-xl bg-muted/40" />}>
          <BrowseServicesCatalog
            services={services}
            availableLocations={availableLocations}
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
