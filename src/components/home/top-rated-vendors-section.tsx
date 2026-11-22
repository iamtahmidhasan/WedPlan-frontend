import Link from "next/link";
import { ArrowUpRight, Star, ShieldCheck, ArrowRight, Layers } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/core/server";

interface VendorUser {
  _id: string;
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  role?: string;
  businessName?: string;
  isPremium?: boolean;
  isBlocked?: boolean;
}

interface ServiceSummary {
  _id: string;
  serviceName: string;
  category?: string;
  price?: number;
  vendorId?: string;
  status?: string;
}

interface ReviewSummary {
  _id: string;
  serviceId: string;
  rating: number;
  review: string;
  user?: string;
  userName?: string;
  date?: string;
}

function getInitials(name?: string, email?: string): string {
  const source = name || email || "V";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export async function TopRatedVendorsSection() {
  const [vendorsRes, servicesRes, reviewsRes] = await Promise.all([
    apiFetch("/vendors", { cache: "no-store" }),
    apiFetch("/services", { cache: "no-store" }),
    apiFetch("/reviews", { cache: "no-store" }),
  ]);

  const allVendors: VendorUser[] = vendorsRes.ok ? await vendorsRes.json() : [];
  const allServices: ServiceSummary[] = servicesRes.ok ? await servicesRes.json() : [];
  const allReviews: ReviewSummary[] = reviewsRes.ok ? await reviewsRes.json() : [];

  // Group services and reviews
  const servicesByVendor = new Map<string, ServiceSummary[]>();
  for (const s of allServices) {
    if (!s.vendorId) continue;
    const list = servicesByVendor.get(s.vendorId) || [];
    list.push(s);
    servicesByVendor.set(s.vendorId, list);
  }

  const reviewsByService = new Map<string, ReviewSummary[]>();
  for (const r of allReviews) {
    if (!r.serviceId) continue;
    const list = reviewsByService.get(r.serviceId) || [];
    list.push(r);
    reviewsByService.set(r.serviceId, list);
  }

  // Calculate vendor stats and rank
  const vendorCards = allVendors
    .filter((v) => !v.isBlocked)
    .map((vendor) => {
      const vendorId = vendor._id || vendor.id || "";
      const services = servicesByVendor.get(vendorId) || [];
      const reviews = services.flatMap((s) => reviewsByService.get(s._id) || []);

      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviewCount
          : 0;

      const categories = Array.from(
        new Set(services.map((s) => s.category).filter(Boolean))
      ) as string[];

      const prices = services
        .map((s) => s.price)
        .filter((p): p is number => typeof p === "number" && p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;

      // Most recent or positive review
      const latestReview = reviews.length > 0 ? reviews[0] : null;

      return {
        vendor,
        vendorId,
        servicesCount: services.length,
        reviewCount,
        avgRating,
        categories,
        minPrice,
        latestReview,
      };
    })
    .sort((a, b) => {
      // Prioritize vendors with reviews and higher ratings
      if (b.avgRating !== a.avgRating) {
        return b.avgRating - a.avgRating;
      }
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }
      return (b.vendor.isPremium ? 1 : 0) - (a.vendor.isPremium ? 1 : 0);
    })
    .slice(0, 3);

  if (vendorCards.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-border bg-card/40 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Section Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Top Rated Artisans
            </p>
            <h2 className="mt-2 font-heading text-4xl tracking-tight text-foreground sm:text-5xl">
              Celebrated Wedding Vendors
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Handpicked professionals praised by couples for exceptional artistry, punctuality, and unforgettable wedding experiences.
            </p>
          </div>

          <Link
            href="/vendors"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground shrink-0"
          >
            <span>Explore All Vendors ({allVendors.length})</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Top Vendors Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendorCards.map((item) => {
            const displayName =
              item.vendor.businessName || item.vendor.name || "Wedding Vendor";

            return (
              <div
                key={item.vendorId}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              >
                <div>
                  {/* Top Card Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <Avatar className="size-16 rounded-2xl border border-border bg-secondary shrink-0 transition-transform group-hover:scale-105 shadow-xs">
                      {item.vendor.image && (
                        <AvatarImage
                          src={item.vendor.image}
                          alt={displayName}
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="font-heading text-lg font-bold text-primary">
                        {getInitials(item.vendor.name, item.vendor.email)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-end gap-1.5">
                      {item.vendor.isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <ShieldCheck className="size-3 text-amber-500" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          Partner
                        </span>
                      )}

                      {item.avgRating > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <Star className="size-3 fill-amber-500 text-amber-500" />
                          <span>{item.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Name */}
                  <div className="mt-4">
                    <Link
                      href={`/vendors/${item.vendorId}`}
                      className="font-heading text-2xl font-bold text-foreground transition-colors group-hover:text-primary block truncate"
                    >
                      {displayName}
                    </Link>
                    {item.vendor.businessName && item.vendor.name && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        Contact: {item.vendor.name}
                      </p>
                    )}
                  </div>

                  {/* Rating & Review Counter */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < Math.round(item.avgRating || 5)
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {item.reviewCount > 0 ? (
                      <span className="font-medium text-foreground">
                        {item.avgRating.toFixed(1)}{" "}
                        <span className="text-muted-foreground">
                          ({item.reviewCount} {item.reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">New Wedding Partner</span>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {item.categories.length > 0 ? (
                      item.categories.slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className="rounded-lg bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground capitalize"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Wedding Services Provider
                      </span>
                    )}
                  </div>

                  {/* Testimonial Quote */}
                  {item.latestReview && (
                    <div className="mt-4 rounded-xl border border-border/60 bg-secondary/30 p-3.5 text-xs">
                      <p className="line-clamp-2 italic text-foreground/90">
                        &ldquo;{item.latestReview.review}&rdquo;
                      </p>
                      <p className="mt-1.5 text-[11px] font-semibold text-primary truncate">
                        — {item.latestReview.userName || item.latestReview.user || "Verified Couple"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Meta & Action */}
                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Layers className="size-3" />
                        <span>
                          {item.servicesCount}{" "}
                          {item.servicesCount === 1 ? "Service" : "Services"}
                        </span>
                      </div>
                      {item.minPrice && (
                        <p className="font-heading text-base font-semibold text-foreground">
                          From ${item.minPrice}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/vendors/${item.vendorId}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
