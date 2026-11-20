import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Sparkles, Store } from "lucide-react";
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
import { apiFetch } from "@/lib/core/server";
import { auth } from "@/lib/auth";
import { getPremiumById } from "@/lib/actions/getPremiumById";

interface UserSummary {
  _id?: string;
  name?: string;
  email?: string;
  businessName?: string;
}

export default async function DashboardServicesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUser = session?.user;

  let services: Service[] = [];
  let users: UserSummary[] = [];

  try {
    const [servicesRes, usersRes] = await Promise.all([
      apiFetch(`/services`, { cache: "no-store" }),
      apiFetch(`/users`, { cache: "no-store" }).catch(() => null),
    ]);

    if (servicesRes.ok && sessionUser?.role !== "customer") {
      services = await servicesRes.json();
    }
    if (usersRes && usersRes.ok) {
      users = await usersRes.json();
    }
  } catch (err) {
    console.error("Error fetching services:", err);
  }

  const role =
    (sessionUser as { role?: string } | undefined)?.role ?? "customer";
  const isAdmin = role === "admin";
  const isVendor = role === "vendor";

  // Vendor sees their own services, Admin sees all services
  const visibleServices = isVendor
    ? services.filter((service) => service.vendorId === sessionUser?.id)
    : services;

  const vendorPremium = isVendor
    ? await getPremiumById({ userId: sessionUser?.id ?? "" }).catch(() => null)
    : null;
  const atServiceLimit =
    isVendor && visibleServices.length >= 3 && !vendorPremium?.isPremium;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            {isVendor
              ? "Your published services in the catalog."
              : isAdmin
                ? "All vendor services in the catalog with vendor details."
                : "All vendor services from the database."}
          </p>
        </div>
        <Link
          href={atServiceLimit ? "/premium" : "/dashboard/services/add"}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 w-fit"
        >
          {atServiceLimit ? (
            <Sparkles className="size-3.5" />
          ) : (
            <Plus className="size-3.5" />
          )}
          <span>{atServiceLimit ? "Upgrade to Premium" : "Add Service"}</span>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              {isAdmin && <TableHead>Vendor</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleServices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {isVendor
                    ? "You haven't added any services yet. Click 'Add Service' to create one."
                    : "No services found."}
                </TableCell>
              </TableRow>
            ) : (
              visibleServices.map((service) => {
                const coverImage = service.images?.[0];

                const vendorUser = isAdmin
                  ? users.find((user) => user._id === service.vendorId)
                  : null;

                const vendorDisplay =
                  vendorUser?.businessName ?? vendorUser?.name ?? "Vendor";

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

                    {/* Vendor Info (Shown for admin) */}
                    {isAdmin && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground flex items-center gap-1.5">
                            <Store className="size-3.5 text-muted-foreground shrink-0" />
                            <span>{vendorDisplay}</span>
                          </span>
                          {vendorUser?.email && (
                            <span className="text-[11px] text-muted-foreground">
                              {vendorUser.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {/* Category */}
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                        {service.category}
                      </span>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="text-muted-foreground">
                      {service.location ?? "N/A"}
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
