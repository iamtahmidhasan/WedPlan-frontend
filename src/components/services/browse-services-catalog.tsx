"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ArrowUpDown, MapPin, RotateCcw, Loader2 } from "lucide-react";
import { ServiceCard, type Service } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const WEDDING_CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
] as const;

interface UserSummary {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
}

interface BrowseServicesCatalogProps {
  services: Service[];
  availableLocations?: string[];
  users?: UserSummary[];
  currentSearch?: string;
  currentCategory?: string;
  currentLocation?: string;
  currentSort?: string;
}

export function BrowseServicesCatalog({
  services,
  availableLocations = [],
  users = [],
  currentSearch = "",
  currentCategory = "all",
  currentLocation = "all",
  currentSort = "featured",
}: BrowseServicesCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  // Sync search input when external URL changes
  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  // Map users for fast vendor name lookup
  const vendorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) {
      const id = u._id || u.id;
      if (id) {
        map.set(id, u.businessName || u.name || u.email || "WedPlan Vendor");
      }
    }
    return map;
  }, [users]);

  // Push updated filter params to URL
  function applyFilters(updates: {
    search?: string;
    category?: string;
    location?: string;
    sort?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if ("search" in updates) {
      const val = updates.search?.trim();
      if (val) {
        params.set("search", val);
      } else {
        params.delete("search");
      }
    }

    if ("category" in updates) {
      const cat = updates.category;
      if (cat && cat !== "all") {
        params.set("category", cat);
      } else {
        params.delete("category");
      }
    }

    if ("location" in updates) {
      const loc = updates.location;
      if (loc && loc !== "all") {
        params.set("location", loc);
      } else {
        params.delete("location");
      }
    }

    if ("sort" in updates) {
      const s = updates.sort;
      if (s && s !== "featured") {
        params.set("sort", s);
      } else {
        params.delete("sort");
      }
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/services?${query}` : "/services", { scroll: false });
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ search: searchInput });
  }

  function handleClearSearch() {
    setSearchInput("");
    applyFilters({ search: "" });
  }

  function handleResetAll() {
    setSearchInput("");
    startTransition(() => {
      router.replace("/services", { scroll: false });
    });
  }

  const hasActiveFilters =
    Boolean(currentSearch.trim()) ||
    currentCategory !== "all" ||
    currentLocation !== "all" ||
    currentSort !== "featured";

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        {/* Top row: Search input + Location dropdown + Price Sort */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {/* Search by Name */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative sm:col-span-2 lg:col-span-5"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters({ search: searchInput });
                }
              }}
              placeholder="Search services by name (press Enter)..."
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:bg-secondary/40 focus:border-ring focus:ring-1 focus:ring-ring"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </form>

          {/* Location Filter */}
          <div className="relative lg:col-span-4">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <select
              value={currentLocation}
              onChange={(e) => applyFilters({ location: e.target.value })}
              className="h-11 w-full appearance-none rounded-md border border-input bg-background pl-10 pr-8 text-sm outline-none transition-colors hover:bg-secondary/40 focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="all">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Price Sorting */}
          <div className="relative lg:col-span-3">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <select
              value={currentSort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="h-11 w-full appearance-none rounded-md border border-input bg-background pl-10 pr-8 text-sm outline-none transition-colors hover:bg-secondary/40 focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="featured">Featured / Default</option>
              <option value="lowest_price">Price: Low to High</option>
              <option value="highest_price">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Dynamic Section 2 / Categories filter) */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => applyFilters({ category: "all" })}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-medium transition-all shrink-0 cursor-pointer",
                currentCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              All Categories
            </button>
            {WEDDING_CATEGORIES.map((cat) => {
              const isActive =
                currentCategory.toLowerCase() === cat.toLowerCase() ||
                (currentCategory !== "all" && cat.toLowerCase().includes(currentCategory.toLowerCase()));
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => applyFilters({ category: cat })}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 font-medium transition-all shrink-0 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Summary & Reset Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-dashed border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">Active filters:</span>
              {currentSearch && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  Search: &quot;{currentSearch}&quot;
                  <button
                    type="button"
                    onClick={() => applyFilters({ search: "" })}
                    className="cursor-pointer hover:text-primary"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {currentCategory !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  Category: {currentCategory}
                  <button
                    type="button"
                    onClick={() => applyFilters({ category: "all" })}
                    className="cursor-pointer hover:text-primary"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {currentLocation !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  Location: {currentLocation}
                  <button
                    type="button"
                    onClick={() => applyFilters({ location: "all" })}
                    className="cursor-pointer hover:text-primary"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {currentSort !== "featured" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  Sort: {currentSort === "lowest_price" ? "Price Low-High" : "Price High-Low"}
                  <button
                    type="button"
                    onClick={() => applyFilters({ sort: "featured" })}
                    className="cursor-pointer hover:text-primary"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="h-7 text-xs text-primary hover:text-primary/80 gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="size-3" />
              Reset All
            </Button>
          </div>
        )}
      </div>

      {/* Result Count Header & Pending Indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          {isPending && <Loader2 className="size-3.5 animate-spin text-primary" />}
          <span>
            Showing <strong className="text-foreground">{services.length}</strong>{" "}
            {services.length === 1 ? "wedding service" : "wedding services"}
          </span>
        </span>
      </div>

      {/* Services Grid or Empty State */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center sm:p-16">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Search className="size-6" />
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
            No wedding services found
          </h3>
          <p className="mt-2 max-w-[42ch] text-sm text-muted-foreground leading-relaxed">
            We couldn&apos;t find any services matching your current search or filter criteria. Try adjusting your query or resetting all filters.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="gap-2 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              Reset All Filters
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6 sm:grid-cols-2 xl:grid-cols-3 transition-opacity duration-200",
            isPending && "opacity-60",
          )}
        >
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              vendorName={vendorMap.get(service.vendorId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
