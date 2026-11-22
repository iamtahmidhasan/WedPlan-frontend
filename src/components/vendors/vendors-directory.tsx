"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ShieldCheck,
  Store,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface VendorUser {
  _id: string;
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  role?: string;
  businessName?: string;
  isPremium?: boolean;
  isBlocked?: boolean;
  subscriptionPlan?: string;
  createdAt?: string;
}

export interface ServiceSummary {
  _id: string;
  serviceName: string;
  category?: string;
  price?: number;
  location?: string;
  vendorId?: string;
  status?: string;
  images?: string[];
}

export interface ReviewSummary {
  _id: string;
  serviceId: string;
  rating: number;
  review: string;
  user?: string;
  userName?: string;
  date?: string;
}

interface VendorsDirectoryProps {
  vendors: VendorUser[];
  services: ServiceSummary[];
  reviews?: ReviewSummary[];
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

export function VendorsDirectory({
  vendors,
  services,
  reviews = [],
}: VendorsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);

  // Group services by vendorId
  const vendorServicesMap = useMemo(() => {
    const map = new Map<string, ServiceSummary[]>();
    for (const service of services) {
      if (!service.vendorId) continue;
      const existing = map.get(service.vendorId) || [];
      existing.push(service);
      map.set(service.vendorId, existing);
    }
    return map;
  }, [services]);

  // Group reviews by serviceId
  const serviceReviewsMap = useMemo(() => {
    const map = new Map<string, ReviewSummary[]>();
    for (const r of reviews) {
      if (!r.serviceId) continue;
      const existing = map.get(r.serviceId) || [];
      existing.push(r);
      map.set(r.serviceId, existing);
    }
    return map;
  }, [reviews]);

  // Filter vendors based on search, premium, and top-rated toggle
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      if (vendor.isBlocked) return false;
      if (premiumOnly && !vendor.isPremium) return false;

      const vendorId = vendor._id || vendor.id || "";
      const vendorServices = vendorServicesMap.get(vendorId) || [];

      if (topRatedOnly) {
        const vReviews = vendorServices.flatMap((s) => serviceReviewsMap.get(s._id) || []);
        const avg =
          vReviews.length > 0
            ? vReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / vReviews.length
            : 0;
        if (avg < 4.5) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = vendor.name?.toLowerCase().includes(q);
        const matchesBusiness = vendor.businessName?.toLowerCase().includes(q);
        const matchesEmail = vendor.email?.toLowerCase().includes(q);

        const matchesService = vendorServices.some(
          (s) =>
            s.serviceName?.toLowerCase().includes(q) ||
            s.category?.toLowerCase().includes(q) ||
            s.location?.toLowerCase().includes(q)
        );

        return Boolean(matchesName || matchesBusiness || matchesEmail || matchesService);
      }

      return true;
    });
  }, [vendors, premiumOnly, topRatedOnly, searchQuery, vendorServicesMap, serviceReviewsMap]);

  return (
    <div className="space-y-10">
      {/* Centered Search & Filter Bar */}
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5">
          {/* Search Input */}
          <div className="relative flex flex-1 items-center w-full px-3 py-1.5">
            <Search className="size-4.5 text-muted-foreground shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vendor name, studio, or discipline..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto px-2 pb-1 sm:pb-0 shrink-0">
            <button
              type="button"
              onClick={() => setTopRatedOnly(!topRatedOnly)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all cursor-pointer border",
                topRatedOnly
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Star className={cn("size-3.5", topRatedOnly ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
              <span>Top Rated</span>
            </button>

            <button
              type="button"
              onClick={() => setPremiumOnly(!premiumOnly)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all cursor-pointer border",
                premiumOnly
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <ShieldCheck className={cn("size-3.5", premiumOnly ? "text-amber-500" : "text-muted-foreground")} />
              <span>Verified Only</span>
            </button>

            {(searchQuery || premiumOnly || topRatedOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPremiumOnly(false);
                  setTopRatedOnly(false);
                }}
                className="inline-flex h-9 items-center gap-1 rounded-xl px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-3 flex items-center justify-between px-2 text-xs text-muted-foreground">
          <span>
            Showing <span className="font-semibold text-foreground">{filteredVendors.length}</span>{" "}
            wedding {filteredVendors.length === 1 ? "vendor" : "vendors"}
          </span>
          <div className="flex items-center gap-3">
            {topRatedOnly && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Star className="size-3 fill-amber-500 text-amber-500" />
                Top rated (4.5★+)
              </span>
            )}
            {premiumOnly && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Sparkles className="size-3" />
                Verified partners only
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center sm:p-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Store className="size-5" />
          </div>
          <h3 className="mt-4 font-heading text-2xl text-foreground">
            No matching vendors found
          </h3>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
            We couldn’t find any wedding vendors matching your query. Try broadening your terms or resetting your filters.
          </p>
          {(searchQuery || premiumOnly || topRatedOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPremiumOnly(false);
                setTopRatedOnly(false);
              }}
              className="mt-6 inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      ) : (
        /* Clean Profile Cards Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => {
            const vendorId = vendor._id || vendor.id || "";
            const vendorServices = vendorServicesMap.get(vendorId) || [];
            const serviceCount = vendorServices.length;
            const displayName = vendor.businessName || vendor.name || "Wedding Vendor";

            // Reviews for this vendor's services
            const vendorReviews = vendorServices.flatMap((s) => serviceReviewsMap.get(s._id) || []);
            const reviewCount = vendorReviews.length;
            const avgRating = reviewCount > 0
              ? (vendorReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1)
              : null;

            // Extract unique categories
            const categories = Array.from(
              new Set(
                vendorServices
                  .map((s) => s.category)
                  .filter((cat): cat is string => Boolean(cat))
              )
            );

            // Starting price calculation
            const prices = vendorServices
              .map((s) => s.price)
              .filter((p): p is number => typeof p === "number" && p > 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : null;

            return (
              <div
                key={vendorId}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-4">
                    <Avatar className="size-16 rounded-2xl border border-border bg-secondary shrink-0 transition-transform group-hover:scale-105 shadow-xs">
                      {vendor.image && (
                        <AvatarImage
                          src={vendor.image}
                          alt={displayName}
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="font-heading text-lg font-bold text-primary">
                        {getInitials(vendor.name, vendor.email)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-end gap-1.5">
                      {vendor.isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <ShieldCheck className="size-3 text-amber-500" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          Partner
                        </span>
                      )}

                      {avgRating && (
                        <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <Star className="size-3 fill-amber-500 text-amber-500" />
                          <span>{avgRating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Name */}
                  <div className="mt-4">
                    <Link
                      href={`/vendors/${vendorId}`}
                      className="font-heading text-2xl font-bold text-foreground transition-colors group-hover:text-primary block truncate"
                    >
                      {displayName}
                    </Link>
                    {vendor.businessName && vendor.name && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        Contact: {vendor.name}
                      </p>
                    )}
                  </div>

                  {/* Rating & Reviews */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            avgRating && i < Math.round(Number(avgRating))
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {avgRating ? (
                      <span className="font-medium text-foreground">
                        {avgRating}{" "}
                        <span className="text-muted-foreground">
                          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">New Partner (No reviews yet)</span>
                    )}
                  </div>

                  {/* Categories Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {categories.length > 0 ? (
                      categories.slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className="rounded-lg bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Wedding Services Provider
                      </span>
                    )}
                    {categories.length > 3 && (
                      <span className="rounded-lg bg-secondary/70 px-2 py-1 text-[10px] text-muted-foreground">
                        +{categories.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Meta & Action */}
                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Layers className="size-3" />
                        <span>{serviceCount} {serviceCount === 1 ? "Service" : "Services"}</span>
                      </div>
                      {minPrice && (
                        <p className="font-heading text-base font-semibold text-foreground">
                          From ${minPrice}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/vendors/${vendorId}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <span>Profile</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
