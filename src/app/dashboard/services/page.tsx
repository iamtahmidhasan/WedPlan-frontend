import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Sparkles, Store, Clock, CheckCircle2, XCircle } from "lucide-react";
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
import { ServiceStatusActions } from "@/components/services/service-status-actions";
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row";
import { apiFetch } from "@/lib/core/server";
import { auth } from "@/lib/auth";
import { getPremiumById } from "@/lib/actions/getPremiumById";
import { cn } from "@/lib/utils";

interface UserSummary {
  _id?: string;
  name?: string;
  email?: string;
  businessName?: string;
}

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function DashboardServicesPage({ searchParams }: PageProps) {
  const { status: statusFilter } = await searchParams;
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
  const userServices = isVendor
    ? services.filter((service) => service.vendorId === sessionUser?.id)
    : services;

  // Filter by status if tab is active
  const filteredServices = statusFilter && statusFilter !== "all"
    ? userServices.filter((s) => (s.status ?? "pending") === statusFilter)
    : userServices;

  const vendorPremium = isVendor
    ? await getPremiumById({ userId: sessionUser?.id ?? "" }).catch(() => null)
    : null;
  const atServiceLimit =
    isVendor && userServices.length >= 3 && !vendorPremium?.isPremium;

  // Status counts
  const totalCount = userServices.length;
  const pendingCount = userServices.filter((s) => (s.status ?? "pending") === "pending").length;
  const approvedCount = userServices.filter((s) => s.status === "approved").length;
  const rejectedCount = userServices.filter((s) => s.status === "rejected").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            {isVendor
              ? "Your published services and approval status."
              : isAdmin
                ? "Review, approve, or reject vendor wedding services."
                : "All vendor services from the database."}
          </p>
        </div>
        {isVendor && (
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
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b text-xs">
        <Link
          href="/dashboard/services"
          className={cn(
            "rounded-md px-3 py-1.5 font-medium transition-colors",
            !statusFilter || statusFilter === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          All ({totalCount})
        </Link>
        <Link
          href="/dashboard/services?status=pending"
          className={cn(
            "rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5",
            statusFilter === "pending"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Clock className="size-3" />
          <span>Pending ({pendingCount})</span>
        </Link>
        <Link
          href="/dashboard/services?status=approved"
          className={cn(
            "rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5",
            statusFilter === "approved"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <CheckCircle2 className="size-3" />
          <span>Approved ({approvedCount})</span>
        </Link>
        <Link
          href="/dashboard/services?status=rejected"
          className={cn(
            "rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5",
            statusFilter === "rejected"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <XCircle className="size-3" />
          <span>Rejected ({rejectedCount})</span>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              {isAdmin && <TableHead>Vendor</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="h-28 text-center text-muted-foreground"
                >
                  {isVendor
                    ? "No services found in this category. Click 'Add Service' to create one."
                    : "No services found matching current filter."}
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => {
                const coverImage = service.images?.[0];

                const vendorUser = isAdmin
                  ? users.find((user) => user._id === service.vendorId)
                  : null;

                const vendorDisplay =
                  vendorUser?.businessName ?? vendorUser?.name ?? "Vendor";

                const currentStatus = service.status ?? "pending";

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
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/services/${service._id}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {service.serviceName}
                          </Link>
                          {service.location && (
                            <span className="text-[11px] text-muted-foreground">
                              {service.location}
                            </span>
                          )}
                        </div>
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

                    {/* Status Badge */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium capitalize w-fit",
                            currentStatus === "approved" &&
                              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                            currentStatus === "pending" &&
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                            currentStatus === "rejected" &&
                              "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                          )}
                        >
                          {currentStatus === "approved" && <CheckCircle2 className="size-3" />}
                          {currentStatus === "pending" && <Clock className="size-3" />}
                          {currentStatus === "rejected" && <XCircle className="size-3" />}
                          <span>{currentStatus}</span>
                        </span>
                        {currentStatus === "rejected" && service.rejectionReason && (
                          <span className="text-[10px] text-muted-foreground max-w-[150px] truncate" title={service.rejectionReason}>
                            Reason: {service.rejectionReason}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-medium">
                      {formatPrice(service.price)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && (
                          <ServiceStatusActions
                            id={service._id}
                            serviceName={service.serviceName}
                            currentStatus={currentStatus}
                          />
                        )}
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
