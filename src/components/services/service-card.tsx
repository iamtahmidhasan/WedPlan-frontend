import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

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

export function ServiceCard({ service, vendorName }: ServiceCardProps) {
  const image = service.images?.[0];

  return (
    <Link
      href={`/services/${service._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-foreground/30 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Clean Cover Image */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={service.serviceName}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            No image available
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-background/85 px-2.5 py-0.5 font-mono text-[11px] font-medium text-foreground backdrop-blur-md">
            {service.category}
          </span>
        </div>
      </div>

      {/* Minimal Content */}
      <div className="flex flex-1 flex-col p-6">
        {vendorName && (
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {vendorName}
          </p>
        )}

        <h3 className="mt-1 font-heading text-2xl text-foreground transition-colors group-hover:text-primary">
          {service.serviceName}
        </h3>

        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {service.description}
        </p>

        {service.location && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 text-muted-foreground shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="font-heading text-lg font-semibold text-foreground">
              {formatPrice(service.price)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            <span>View</span>
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
