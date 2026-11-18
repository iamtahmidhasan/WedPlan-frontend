import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { connection } from "next/server";
import { ServiceCard, type Service } from "@/components/services/service-card";
import { API_URL } from "@/lib/config";

const SERVICES_API = `${API_URL}/services`;
const FEATURED_COUNT = 6;

export async function FeaturedSection() {
  await connection();

  let services: Service[] = [];

  try {
    const response = await fetch(SERVICES_API);

    if (!response.ok) return null;

    services = (await response.json()) as Service[];
  } catch {
    return null;
  }

  const featuredServices = services.slice(0, FEATURED_COUNT);

  if (featuredServices.length === 0) return null;

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              A considered selection
            </p>
            <h2 className="mt-2 font-heading text-4xl text-foreground sm:text-5xl">
              Featured for your day
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all services
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featuredServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
