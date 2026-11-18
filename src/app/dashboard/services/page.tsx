import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, type Service } from "@/components/services/service-card";
import { DeleteServiceButton } from "@/components/services/delete-service-button";
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row";
import { API_URL } from "@/lib/config";

export default async function DashboardServicesPage() {
  let services: Service[] = [];

  try {
    const res = await fetch(`${API_URL}/services`, {
      cache: "no-store",
    });
    if (res.ok) {
      services = await res.json();
    }
  } catch (err) {
    console.error("Error fetching services:", err);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            All vendor services from the database.
          </p>
        </div>
        <Link
          href="/dashboard/services/add"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 w-fit"
        >
          <Plus className="size-3.5" />
          <span>Add Service</span>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No services found.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => {
                const coverImage = service.images?.[0];

                return (
                  <ClickableTableRow
                    key={service._id}
                    href={`/dashboard/services/${service._id}`}
                  >
                    {/* Service Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-secondary">
                          {coverImage ? (
                            <Image
                              src={coverImage}
                              alt={service.serviceName}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/dashboard/services/${service._id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {service.serviceName}
                        </Link>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                        {service.category}
                      </span>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="text-muted-foreground">
                      {service.location || "N/A"}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-medium">
                      {formatPrice(service.price)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <DeleteServiceButton id={service._id} />
                      </div>
                    </TableCell>
                  </ClickableTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
