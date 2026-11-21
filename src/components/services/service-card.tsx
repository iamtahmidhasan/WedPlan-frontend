import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type Service = {
  _id: string;
  vendorId: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt?: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number) {
  return currency.format(price);
}

type ServiceCardProps = {
  service: Service;
  featured?: boolean;
};

export function ServiceCard({ service, featured = false }: ServiceCardProps) {
  const image = service.images[0];

  return (
    <Link
      href={`/services/${service._id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-border bg-background outline-none transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring",
        featured && "sm:col-span-2 xl:flex-row"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-secondary",
          featured ? "aspect-[16/9] xl:aspect-auto xl:w-1/2" : "aspect-[4/3]"
        )}
      >
        {image ? (
          <Image
            src={image}
            alt={service.serviceName}
            fill
            sizes={
              featured
                ? "(min-width: 1280px) 50vw, 100vw"
                : "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <p className="flex size-full items-center justify-center text-sm text-muted-foreground">
            Image coming soon
          </p>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col p-5 sm:p-6",
          featured && "xl:justify-center xl:p-10"
        )}
      >
        <p
          className={cn(
            "text-xs uppercase tracking-[0.16em] text-primary",
            featured && "text-sm"
          )}
        >
          {service.category}
        </p>
        <h2
          className={cn(
            "mt-3 font-heading leading-tight text-foreground transition-colors group-hover:text-primary",
            featured ? "text-4xl sm:text-5xl" : "text-2xl"
          )}
        >
          {service.serviceName}
        </h2>
        <p
          className={cn(
            "mt-3 flex-1 leading-6 text-muted-foreground",
            featured ? "max-w-[48ch] text-base" : "text-sm"
          )}
        >
          {service.description}
        </p>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p
              className={cn(
                "font-heading text-foreground",
                featured ? "text-3xl" : "text-2xl"
              )}
            >
              {formatPrice(service.price)}
            </p>
          </div>
          <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span>{service.location}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
