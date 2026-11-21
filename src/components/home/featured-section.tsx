import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { connection } from "next/server";
import { type Service } from "@/components/services/service-card";
import { FeaturedGridClient } from "@/components/home/featured-grid-client";
import { apiFetch } from "@/lib/core/server";

const FEATURED_COUNT = 6;

interface UserSummary {
  _id?: string;
  id?: string;
  name?: string;
  businessName?: string;
}

export async function FeaturedSection() {
  await connection();

  let services: Service[] = [];
  let users: UserSummary[] = [];

  try {
    const [response, usersRes] = await Promise.all([
      apiFetch("/services", { cache: "no-store" }),
      apiFetch("/users", { cache: "no-store" }).catch(() => null),
    ]);

    if (!response.ok) return null;

    const allServices = (await response.json()) as Service[];
    // Display only approved and active services
    services = allServices.filter((s) => !s.status || s.status === "approved");

    if (usersRes && usersRes.ok) {
      users = (await usersRes.json()) as UserSummary[];
    }
  } catch {
    return null;
  }

  const featuredServices = services.slice(0, FEATURED_COUNT);

  if (featuredServices.length === 0) return null;

  return (
    <section className="border-b border-border bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-primary" aria-hidden="true" />
              <p className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">
                Curated Selection
              </p>
            </div>
            <h2 className="mt-2 font-heading text-4xl text-foreground sm:text-5xl">
              Featured Wedding Services
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Top-rated venues, photographers, florists, and catering specialists ready for your wedding.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            <span>View all {services.length} services</span>
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>

        <FeaturedGridClient services={featuredServices} users={users} />
      </div>
    </section>
  );
}
