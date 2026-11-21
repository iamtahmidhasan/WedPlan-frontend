import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Store,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  HeartHandshake,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCard, type Service } from "@/components/services/service-card";
import { auth } from "@/lib/auth";
import { apiFetch } from "@/lib/core/server";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

function getInitials(name?: string, email?: string): string {
  const source = name || email || "V";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await apiFetch(`/vendors/${id}`, { cache: "no-store" });
    if (res.ok) {
      const vendor: VendorUser = await res.json();
      const displayName = vendor.businessName || vendor.name || "Wedding Vendor";
      return {
        title: `${displayName} | WedPlan Vendor Profile`,
        description: `Explore wedding services and request bookings with ${displayName} on WedPlan.`,
      };
    }
  } catch {
    // fallback
  }

  return {
    title: "Vendor Profile | WedPlan",
    description: "Explore wedding services and request bookings with verified vendors on WedPlan.",
  };
}

export default async function VendorDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Authentication Protection: unauthenticated users are redirected to sign-in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/sign-in?redirect=/vendors/${id}`);
  }

  if (session.user.isBlocked) {
    redirect("/unauthorized");
  }

  // 2. Fetch vendor details and published services
  let vendor: VendorUser | null = null;
  let services: Service[] = [];

  try {
    const [vendorRes, servicesRes] = await Promise.all([
      apiFetch(`/vendors/${id}`, { cache: "no-store" }).catch(() => null),
      apiFetch(`/services`, { cache: "no-store" }).catch(() => null),
    ]);

    if (!vendorRes || !vendorRes.ok) {
      notFound();
    }

    vendor = await vendorRes.json();

    if (servicesRes?.ok) {
      const allServices: Service[] = await servicesRes.json();
      services = allServices.filter(
        (s) =>
          (s.vendorId === vendor?._id || s.vendorId === vendor?.id) &&
          (s.status === "approved" || !s.status)
      );
    }
  } catch (err) {
    console.error("Error fetching vendor profile:", err);
    notFound();
  }

  if (!vendor || !vendor._id) {
    notFound();
  }

  const displayName = vendor.businessName || vendor.name || "Wedding Vendor";
  const joinedDate = vendor.createdAt
    ? new Date(vendor.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Member";

  // Distinct categories from vendor's services
  const categories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Banner Navigation */}
      <div className="border-b border-border/80 bg-card/60">
        <div className="mx-auto max-w-7xl px-6 py-4 sm:px-10 lg:px-12">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to All Vendors</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-6 sm:px-10 lg:px-12 space-y-10">
        {/* Vendor Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          {/* Cover Header */}
          <div className="relative h-44 sm:h-56 bg-gradient-to-r from-primary/15 via-secondary to-amber-500/15 p-6 flex items-start justify-end">
            {vendor.isPremium && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 shadow-xs border border-amber-500/30">
                <ShieldCheck className="size-4 text-amber-500" />
                Verified Premium Vendor
              </span>
            )}
          </div>

          {/* Profile Header Details */}
          <div className="relative px-6 pb-8 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 -mt-16 sm:-mt-20">
              {/* Avatar */}
              <Avatar
                className={cn(
                  "size-28 sm:size-32 rounded-full border-4 border-card shadow-lg bg-card",
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
                <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                  {getInitials(vendor.name, vendor.email)}
                </AvatarFallback>
              </Avatar>

              {/* Status and Action */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Store className="size-3.5" />
                  Wedding Professional
                </span>
                {services.length > 0 && (
                  <a
                    href="#services"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                  >
                    View Services ({services.length})
                  </a>
                )}
              </div>
            </div>

            {/* Vendor Titles */}
            <div className="mt-5 space-y-1">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {displayName}
              </h1>
              {vendor.businessName && vendor.name && (
                <p className="text-sm text-muted-foreground">
                  Represented by <span className="font-medium text-foreground">{vendor.name}</span>
                </p>
              )}
            </div>

            {/* Category Tags */}
            {categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground capitalize"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Vendor Meta Information Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border/80 bg-secondary/20 p-4 text-xs">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="size-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                    Contact Email
                  </span>
                  <span className="truncate font-medium text-foreground block">
                    {vendor.email || "Protected on platform"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Layers className="size-4 text-primary shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                    Active Portfolio
                  </span>
                  <span className="font-medium text-foreground">
                    {services.length} {services.length === 1 ? "Service" : "Services"} Listed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="size-4 text-primary shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                    WedPlan Member Since
                  </span>
                  <span className="font-medium text-foreground">{joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Services Section */}
        <div id="services" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Wedding Services by {displayName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse available packages, pricing, and submit booking inquiries directly.
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {services.length} {services.length === 1 ? "service available" : "services available"}
            </span>
          </div>

          {services.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
              <div className="rounded-full bg-secondary p-3 text-muted-foreground">
                <Sparkles className="size-6" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                No active services published yet
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                This vendor hasn&apos;t listed approved wedding services yet. Check back soon or explore other wedding professionals.
              </p>
              <Link
                href="/services"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-xs font-medium transition-colors hover:bg-secondary"
              >
                Browse All Services
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  vendorName={displayName}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust & Direct Booking Callout */}
        <div className="rounded-2xl border border-border/80 bg-secondary/30 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <HeartHandshake className="size-5 text-primary" />
                <span>Ready to book {displayName} for your wedding?</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed sm:text-sm">
                Select any of the services listed above to view full package descriptions, view sample event galleries, and submit your reservation request.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-input bg-background px-5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Explore Other Vendors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
