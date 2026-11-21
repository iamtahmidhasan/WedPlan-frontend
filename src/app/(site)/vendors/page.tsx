import type { Metadata } from "next";
import { Store } from "lucide-react";
import { apiFetch } from "@/lib/core/server";
import {
  VendorsDirectory,
  type VendorUser,
  type ServiceSummary,
} from "@/components/vendors/vendors-directory";

export const metadata: Metadata = {
  title: "Wedding Vendors | WedPlan",
  description:
    "Discover trusted wedding photographers, venues, caterers, florists, and stylists. Connect directly with verified wedding professionals.",
};

export default async function VendorsPage() {
  let vendors: VendorUser[] = [];
  let services: ServiceSummary[] = [];

  try {
    const [vendorsRes, servicesRes] = await Promise.all([
      apiFetch("/vendors", { cache: "no-store" }).catch(() => null),
      apiFetch("/services", { cache: "no-store" }).catch(() => null),
    ]);

    if (vendorsRes?.ok) {
      vendors = await vendorsRes.json();
    }
    if (servicesRes?.ok) {
      services = await servicesRes.json();
    }
  } catch (err) {
    console.error("Error fetching vendors directory data:", err);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Store className="size-3.5" />
            Wedding Professionals
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Featured Wedding Vendors
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Explore trusted wedding specialists across all categories. Connect with verified
            professionals to request quotes and reserve services for your celebration.
          </p>
        </div>

        {/* Vendors Directory Component */}
        <VendorsDirectory vendors={vendors} services={services} />
      </div>
    </div>
  );
}
