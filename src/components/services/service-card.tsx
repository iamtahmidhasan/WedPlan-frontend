import Image from "next/image";
import Link from "next/link";
import { MapPin, Store, ArrowRight } from "lucide-react";
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
  vendorName?: string;
};

export function ServiceCard({ service, featured = false, vendorName }: ServiceCardProps) {
  const image = service.images[0];

  return (
    <Link
      href={`/services/${service._id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-border bg-background outline-none transition-all hover:border-primary/50 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring",
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
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-md bg-background/90 backdrop-blur-xs px-2.5 py-1 text-xs font-medium text-foreground shadow-xs">
            {service.category}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col p-5 sm:p-6",
          featured && "xl:justify-center xl:p-10"
        )}
      >
        {/* Vendor Information */}
        {vendorName && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Store className="size-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground">{vendorName}</span>
          </div>
        )}

        <h2
          className={cn(
            "font-heading leading-tight text-foreground transition-colors group-hover:text-primary",
            featured ? "text-4xl sm:text-5xl" : "text-xl font-bold"
          )}
        >
          {service.serviceName}
        </h2>
        <p
          className={cn(
            "mt-2 flex-1 leading-6 text-muted-foreground line-clamp-2",
            featured ? "max-w-[48ch] text-base" : "text-sm"
          )}
        >
          {service.description}
        </p>

        {/* Location & Details row */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-primary/80" aria-hidden="true" />
          <span className="truncate">{service.location || "Location on inquiry"}</span>
        </div>

        {/* Footer with Price and View Details CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Starting at</p>
            <p
              className={cn(
                "font-heading text-foreground font-semibold",
                featured ? "text-3xl" : "text-xl"
              )}
            >
              {formatPrice(service.price)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            View Details <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
