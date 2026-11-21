import Image from "next/image";
import Link from "next/link";
import { MapPin, Store, ArrowRight, Sparkles } from "lucide-react";

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
  const image = service.images?.[0];

  return (
    <Link
      href={`/services/${service._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card outline-none transition-all duration-300 hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Service Cover Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={service.serviceName}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            No image available
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-background/90 backdrop-blur-xs px-2.5 py-1 text-xs font-medium text-foreground shadow-xs">
            {service.category}
          </span>
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-xs">
              <Sparkles className="size-3" />
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Vendor Information */}
        {vendorName && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Store className="size-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground truncate">{vendorName}</span>
          </div>
        )}

        <h3 className="font-heading text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
          {service.serviceName}
        </h3>

        <p className="mt-2 flex-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {service.description}
        </p>

        {/* Location Row */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-primary/80" aria-hidden="true" />
          <span className="truncate">{service.location || "Location on inquiry"}</span>
        </div>

        {/* Footer with Price and View Details CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Starting at</p>
            <p className="font-heading text-lg font-bold text-foreground">
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
