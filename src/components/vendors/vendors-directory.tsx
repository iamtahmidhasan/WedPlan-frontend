"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ShieldCheck,
  Store,
  Sparkles,
  Mail,
  ArrowRight,
  Layers,
  Tag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

interface VendorsDirectoryProps {
  vendors: VendorUser[];
  services: ServiceSummary[];
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
}: VendorsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);

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

  // Filter vendors based on search and premium toggle
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      // Exclude blocked accounts
      if (vendor.isBlocked) return false;

      // Filter by premium status if toggled
      if (premiumOnly && !vendor.isPremium) return false;

      // Search matching
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = vendor.name?.toLowerCase().includes(q);
      const businessMatch = vendor.businessName?.toLowerCase().includes(q);
      const emailMatch = vendor.email?.toLowerCase().includes(q);

      // Also search through categories of their services
      const vendorId = vendor._id || vendor.id || "";
      const vendorServices = vendorServicesMap.get(vendorId) || [];
      const categoryMatch = vendorServices.some((s) =>
        s.category?.toLowerCase().includes(q)
      );

      return Boolean(nameMatch || businessMatch || emailMatch || categoryMatch);
    });
  }, [vendors, searchQuery, premiumOnly, vendorServicesMap]);

  return (
    <div className="space-y-8">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors by name, business, or category..."
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPremiumOnly(!premiumOnly)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-3.5 text-xs font-semibold transition-colors cursor-pointer border",
              premiumOnly
                ? "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "border-input bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <ShieldCheck className="size-3.5 text-amber-500" />
            <span>Verified Premium</span>
          </button>

          {(searchQuery || premiumOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setPremiumOnly(false);
              }}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Result Counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <span className="font-semibold text-foreground">{filteredVendors.length}</span>{" "}
          wedding vendors
        </span>
        {premiumOnly && (
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <Sparkles className="size-3" />
            Showing verified vendors only
          </span>
        )}
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center bg-card/50">
          <div className="rounded-full bg-secondary p-3 text-muted-foreground">
            <Store className="size-6" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">No vendors found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery || premiumOnly
              ? "We couldn't find any wedding vendors matching your criteria. Try adjusting your search."
              : "No vendor profiles are currently available."}
          </p>
          {(searchQuery || premiumOnly) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setPremiumOnly(false);
              }}
              className="mt-4 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => {
            const vendorId = vendor._id || vendor.id || "";
            const vendorServices = vendorServicesMap.get(vendorId) || [];
            const serviceCount = vendorServices.length;
            const displayName = vendor.businessName || vendor.name || "Wedding Vendor";

            // Extract unique categories
            const categories = Array.from(
              new Set(
                vendorServices
                  .map((s) => s.category)
                  .filter((cat): cat is string => Boolean(cat))
              )
            );

            // Starting price
            const prices = vendorServices
              .map((s) => s.price)
              .filter((p): p is number => typeof p === "number" && p > 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : null;

            return (
              <div
                key={vendorId}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
                {/* Card Header Background */}
                <div className="relative h-24 bg-gradient-to-r from-primary/10 via-secondary to-amber-500/10 p-4">
                  {/* Premium Badge */}
                  {vendor.isPremium && (
                    <div className="absolute right-3 top-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 shadow-xs backdrop-blur-xs dark:text-amber-400 border border-amber-500/20">
                        <ShieldCheck className="size-3 text-amber-500" />
                        Verified Vendor
                      </span>
                    </div>
                  )}
                </div>

                {/* Avatar overlapping banner */}
                <div className="relative -mt-12 px-6">
                  <Avatar
                    className={cn(
                      "size-20 rounded-full border-4 border-card shadow-md transition-transform group-hover:scale-105",
                      vendor.isPremium ? "ring-2 ring-amber-400" : ""
                    )}
                  >
                    {vendor.image && (
                      <AvatarImage
                        src={vendor.image}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                      {getInitials(vendor.name, vendor.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Content Body */}
                <div className="flex-1 p-6 pt-3 space-y-4">
                  <div>
                    <Link
                      href={`/vendors/${vendorId}`}
                      className="font-heading text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary group-hover:text-primary"
                    >
                      {displayName}
                    </Link>
                    {vendor.businessName && vendor.name && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Contact: {vendor.name}
                      </p>
                    )}
                  </div>

                  {/* Categories Tags */}
                  {categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {categories.slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground capitalize"
                        >
                          <Tag className="size-2.5 text-muted-foreground" />
                          <span>{category}</span>
                        </span>
                      ))}
                      {categories.length > 3 && (
                        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          +{categories.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      Wedding vendor services portfolio
                    </p>
                  )}

                  {/* Highlights / Stats */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Layers className="size-3" />
                        Services
                      </span>
                      <p className="font-semibold text-foreground">
                        {serviceCount} {serviceCount === 1 ? "Listing" : "Listings"}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles className="size-3" />
                        Pricing
                      </span>
                      <p className="font-semibold text-foreground">
                        {minPrice ? `From $${minPrice}` : "Inquire"}
                      </p>
                    </div>
                  </div>

                  {/* Email contact display */}
                  {vendor.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      <Mail className="size-3.5 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="border-t border-border p-4 bg-card/60 flex items-center gap-2">
                  <Link
                    href={`/vendors/${vendorId}`}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href={`/services?search=${encodeURIComponent(displayName)}`}
                    className="flex h-10 items-center justify-center rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    title="Browse vendor services directly"
                  >
                    Services
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
