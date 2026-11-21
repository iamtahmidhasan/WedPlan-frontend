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
    <section className="border-b border-border bg-background py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        {/* Minimal Section Header matching Categories */}
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Curated Selection
            </p>
            <h2 className="mt-2 font-heading text-4xl tracking-tight text-foreground sm:text-5xl">
              Featured Services
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A careful edit of outstanding venues, photographers, and artisans.
            </p>
          </div>

          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground shrink-0"
          >
            <span>View All ({services.length})</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <FeaturedGridClient services={featuredServices} users={users} />
      </div>
    </section>
  );
}
