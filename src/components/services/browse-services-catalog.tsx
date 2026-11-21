"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, RotateCcw, Loader2, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ServiceCard, type Service } from "@/components/services/service-card";
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
  availableCategories?: string[];
  users?: UserSummary[];
  currentSearch?: string;
  currentCategory?: string;
  currentLocation?: string;
  currentSort?: string;
}

export function BrowseServicesCatalog({
  services,
  availableLocations = [],
  availableCategories = [],
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

  const categoriesList = availableCategories.length > 0 ? availableCategories : WEDDING_CATEGORIES;

  return (
    <div className="space-y-8">
      {/* Minimal Architectural Filter Bar */}
      <div className="border border-border bg-card">
        {/* Top Controls Row */}
        <div className="grid divide-y divide-border sm:grid-cols-12 sm:divide-y-0 sm:divide-x">
          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center p-3 sm:col-span-6 lg:col-span-5"
          >
            <Search className="size-4 text-muted-foreground shrink-0 ml-1.5 mr-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters({ search: searchInput });
                }
              }}
              placeholder="Search by service or vendor name..."
              className="h-9 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </form>

          {/* Location Select */}
          <div className="relative flex items-center p-3 sm:col-span-3 lg:col-span-4">
            <span className="text-xs font-mono uppercase text-muted-foreground mr-2 shrink-0">
              Loc:
            </span>
            <select
              value={currentLocation}
              onChange={(e) => applyFilters({ location: e.target.value })}
              className="h-9 w-full appearance-none bg-transparent pr-7 text-xs sm:text-sm font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="all" className="bg-card text-foreground">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc} className="bg-card text-foreground">
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          </div>

          {/* Sort Select */}
          <div className="relative flex items-center p-3 sm:col-span-3 lg:col-span-3">
            <span className="text-xs font-mono uppercase text-muted-foreground mr-2 shrink-0">
              Sort:
            </span>
            <select
              value={currentSort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="h-9 w-full appearance-none bg-transparent pr-7 text-xs sm:text-sm font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="featured" className="bg-card text-foreground">Featured</option>
              <option value="lowest_price" className="bg-card text-foreground">Price: Low to High</option>
              <option value="highest_price" className="bg-card text-foreground">Price: High to Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Minimal Categories Bar */}
        <div className="border-t border-border px-4 py-2.5 overflow-x-auto no-scrollbar bg-secondary/15">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => applyFilters({ category: "all" })}
              className={cn(
                "px-3 py-1 font-mono uppercase tracking-wider text-[11px] transition-colors cursor-pointer shrink-0 rounded-xs",
                currentCategory === "all"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              All
            </button>
            {categoriesList.map((cat) => {
              const isActive =
                currentCategory.toLowerCase() === cat.toLowerCase() ||
                (currentCategory !== "all" && cat.toLowerCase().includes(currentCategory.toLowerCase()));
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => applyFilters({ category: cat })}
                  className={cn(
                    "px-3 py-1 transition-colors cursor-pointer shrink-0 text-xs rounded-xs",
                    isActive
                      ? "bg-foreground text-background font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Tags & Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground bg-background">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider">Filtered by:</span>
              {currentSearch && (
                <span className="inline-flex items-center gap-1 rounded-xs border border-border bg-secondary/40 px-2 py-0.5 text-xs text-foreground">
                  &quot;{currentSearch}&quot;
                  <button
                    type="button"
                    onClick={() => applyFilters({ search: "" })}
                    className="cursor-pointer hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {currentCategory !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-xs border border-border bg-secondary/40 px-2 py-0.5 text-xs text-foreground">
                  {currentCategory}
                  <button
                    type="button"
                    onClick={() => applyFilters({ category: "all" })}
                    className="cursor-pointer hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {currentLocation !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-xs border border-border bg-secondary/40 px-2 py-0.5 text-xs text-foreground">
                  {currentLocation}
                  <button
                    type="button"
                    onClick={() => applyFilters({ location: "all" })}
                    className="cursor-pointer hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {currentSort !== "featured" && (
                <span className="inline-flex items-center gap-1 rounded-xs border border-border bg-secondary/40 px-2 py-0.5 text-xs text-foreground">
                  {currentSort === "lowest_price" ? "Price ↑" : "Price ↓"}
                  <button
                    type="button"
                    onClick={() => applyFilters({ sort: "featured" })}
                    className="cursor-pointer hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading Transition Indicator */}
      {isPending && (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin text-primary" />
          <span>Updating directory...</span>
        </div>
      )}

      {/* Services Grid */}
      {!isPending && services.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div key={service._id} className="h-full">
              <ServiceCard
                service={service}
                featured={index === 0 && currentSort === "featured"}
                vendorName={vendorMap.get(service.vendorId)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isPending && services.length === 0 && (
        <div className="flex flex-col items-center justify-center border border-border bg-card p-12 text-center sm:p-16">
          <div className="flex size-12 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground">
            <SlidersHorizontal className="size-5" />
          </div>
          <h3 className="mt-4 font-heading text-2xl text-foreground">
            No matching services found
          </h3>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
            We couldn’t find any approved services matching your active filters. Try broadening your location or resetting filters.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAll}
              className="mt-6 inline-flex h-9 items-center gap-2 rounded-xs border border-border bg-background px-4 text-xs font-mono uppercase tracking-wider text-foreground hover:bg-secondary cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
