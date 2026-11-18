import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { ServiceCard, type Service } from "@/components/services/service-card";
import { API_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Services | WedPlan",
  description:
    "Explore venues, photographers, catering, and the people who make your day yours.",
};

const SERVICES_API = `${API_URL}/services`;

export default async function ServicesPage() {
  await connection();

  let services: Service[] = [];
  let hasError = false;

  try {
    const response = await fetch(SERVICES_API);

    if (!response.ok) throw new Error("Request failed");

    services = (await response.json()) as Service[];
  } catch {
    hasError = true;
  }

  const heroImages = services
    .slice(0, 2)
    .map((service) => service.images[0])
    .filter((image): image is string => Boolean(image));

  return (
    <main className="bg-background">
      <section className="relative overflow-hidden border-b border-border bg-secondary">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:py-24">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              The WedPlan directory
            </p>
            <h1 className="mt-6 font-heading text-6xl leading-[0.92] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-8xl">
              Find the people
              <br />
              who make the{" "}
              <span className="text-primary">day yours.</span>
            </h1>
            <p className="mt-8 max-w-[46ch] text-base leading-7 text-muted-foreground">
              Considered venues, photographers, florists, and more — gathered in
              one calm place so you can plan with confidence.
            </p>
            <div className="mt-10 flex items-center gap-5">
              <span className="font-heading text-5xl leading-none text-foreground">
                {services.length}
              </span>
              <span className="text-sm leading-6 text-muted-foreground">
                services,
                <br />
                one considered collection.
              </span>
            </div>
          </div>

          <div className="relative hidden h-80 sm:block lg:h-[26rem]">
            <div
              className="absolute right-6 top-0 size-52 rounded-full border border-primary/30 lg:size-72"
              aria-hidden="true"
            />
            {heroImages[0] && (
              <div className="absolute left-0 top-4 h-[85%] w-[68%] overflow-hidden border border-border bg-background">
                <Image
                  src={heroImages[0]}
                  alt="A wedding venue from the WedPlan directory"
                  fill
                  priority
                  sizes="(min-width: 1024px) 35vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            {heroImages[1] && (
              <div className="absolute bottom-0 right-0 h-[72%] w-[58%] overflow-hidden border border-border bg-background">
                <Image
                  src={heroImages[1]}
                  alt="A wedding service from the WedPlan directory"
                  fill
                  sizes="(min-width: 1024px) 30vw, 45vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Browse the collection
            </p>
            <h2 className="mt-2 font-heading text-4xl text-foreground sm:text-5xl">
              All services
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {hasError ? "Directory unavailable" : `${services.length} listings`}
          </p>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mb-8 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            We couldn’t load the services right now. Please try again in a moment.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service._id}
              service={service}
              featured={index === 0}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
