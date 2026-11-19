import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row";
import { type Service } from "@/components/services/service-card";
import { DeleteBookingButton } from "@/components/bookings/delete-booking-button";
import { UpdateBookingStatusButton } from "@/components/bookings/update-booking-status-button";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/config";
import { auth } from "@/lib/auth";

interface Booking {
  _id?: string;
  serviceId?: string;
  vendorId?: string;
  customerId?: string;
  customerEmail?: string;
  eventDate?: string;
  eventLocation?: string;
  message?: string;
  status?: string;
  createdAt?: string;
}

interface UserSummary {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  businessName?: string;
}

export default async function DashboardBookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUser = session?.user;

  let bookings: Booking[] = [];
  let services: Service[] = [];
  let users: UserSummary[] = [];

  try {
    const [bookingsRes, servicesRes, usersRes] = await Promise.all([
      fetch(`${API_URL}/bookings`, { cache: "no-store" }),
      fetch(`${API_URL}/services`, { cache: "no-store" }).catch(
        () => null,
      ),
      fetch(`${API_URL}/users`, { cache: "no-store" }).catch(
        () => null,
      ),
    ]);

    if (bookingsRes.ok) {
      bookings = await bookingsRes.json();
    }
    if (servicesRes && servicesRes.ok) {
      services = await servicesRes.json();
    }
    if (usersRes && usersRes.ok) {
      users = await usersRes.json();
    }
  } catch (err) {
    console.error("Error fetching bookings:", err);
  }

  // Determine user role and ID
  const matchedUser = sessionUser
    ? users.find(
        (u) =>
          (sessionUser.id && (u._id === sessionUser.id || u.id === sessionUser.id)) ||
          (sessionUser.email &&
            u.email?.toLowerCase() === sessionUser.email.toLowerCase())
      )
    : null;

  const currentUserId =
    matchedUser?._id || matchedUser?.id || sessionUser?.id || "";
  const role = (
    matchedUser?.role ||
    (sessionUser as { role?: string })?.role ||
    "customer"
  ).toLowerCase();

  // Role-based permissions
  const showCustomerColumn = role !== "customer";
  const canDelete = role === "admin";

  // Role-based filtering of bookings:
  // - Customer: only see their own bookings
  // - Vendor: only see bookings for their services
  // - Admin: see all bookings
  let visibleBookings = bookings;

  if (role === "customer") {
    visibleBookings = bookings.filter((b) => {
      const isCustomerIdMatch =
        (currentUserId && b.customerId === currentUserId) ||
        (sessionUser?.id && b.customerId === sessionUser.id) ||
        (matchedUser?._id && b.customerId === matchedUser._id);

      const isCustomerEmailMatch =
        sessionUser?.email &&
        b.customerEmail?.toLowerCase() === sessionUser.email.toLowerCase();

      return isCustomerIdMatch || isCustomerEmailMatch;
    });
  } else if (role === "vendor") {
    const vendorServiceIdSet = new Set(
      services
        .filter(
          (s) =>
            (currentUserId && s.vendorId === currentUserId) ||
            (sessionUser?.id && s.vendorId === sessionUser.id) ||
            (matchedUser?._id && s.vendorId === matchedUser._id) ||
            (matchedUser?.businessName && s.vendorId === matchedUser.businessName)
        )
        .map((s) => s._id)
    );

    visibleBookings = bookings.filter((b) => {
      const matchesVendorId =
        (currentUserId && b.vendorId === currentUserId) ||
        (sessionUser?.id && b.vendorId === sessionUser.id) ||
        (matchedUser?._id && b.vendorId === matchedUser._id);

      const matchesService = b.serviceId
        ? vendorServiceIdSet.has(b.serviceId)
        : false;

      return matchesVendorId || matchesService;
    });
  } else if (role === "admin") {
    visibleBookings = bookings;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          {role === "customer"
            ? "Your wedding event booking requests and reservations."
            : role === "vendor"
            ? "Bookings and reservations for your services."
            : "All wedding event booking requests and customer reservations."}
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              {showCustomerColumn && <TableHead>Customer</TableHead>}
              <TableHead>Event Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleBookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showCustomerColumn ? 7 : 6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              visibleBookings.map((booking) => {
                const bookingId = booking._id;
                const service = services.find(
                  (s) => s._id === booking.serviceId,
                );
                const coverImage = service?.images?.[0];
                const customer = users.find(
                  (u) =>
                    u._id === booking.customerId || u.id === booking.customerId,
                );
                const customerDisplay =
                  customer?.name ||
                  customer?.email ||
                  booking.customerId ||
                  "N/A";

                const status = (booking.status || "pending").toLowerCase();

                return (
                  <ClickableTableRow
                    key={bookingId}
                    href={
                      booking._id ? `/dashboard/bookings/${booking._id}` : "#"
                    }
                  >
                    {/* Service Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-secondary">
                          {coverImage ? (
                            <Image
                              src={coverImage}
                              alt={service?.serviceName || "Service"}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <Link
                            href={
                              booking._id
                                ? `/dashboard/bookings/${booking._id}`
                                : "#"
                            }
                            className="font-medium text-foreground hover:underline"
                          >
                            {service?.serviceName ||
                              booking.serviceId ||
                              "Unknown"}
                          </Link>
                          {service?.category && (
                            <span className="text-[11px] capitalize text-muted-foreground">
                              {service.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Customer (Hidden for customer role) */}
                    {showCustomerColumn && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {customerDisplay}
                          </span>
                          {customer?.email && customer.name && (
                            <span className="text-[11px] text-muted-foreground">
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {/* Event Date */}
                    <TableCell className="font-medium">
                      {booking.eventDate || "N/A"}
                    </TableCell>

                    {/* Location */}
                    <TableCell className="text-muted-foreground">
                      {booking.eventLocation || "N/A"}
                    </TableCell>

                    {/* Message */}
                    <TableCell className="max-w-[180px]">
                      <p
                        className="truncate text-xs text-muted-foreground"
                        title={booking.message || "No notes"}
                      >
                        {booking.message || "—"}
                      </p>
                    </TableCell>

                    {/* Status Update Badge Button */}
                    <TableCell>
                      {booking._id ? (
                        <UpdateBookingStatusButton
                          id={booking._id}
                          currentStatus={booking.status}
                          variant="badge"
                          role={role}
                        />
                      ) : (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                            status === "confirmed" &&
                              "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                            status === "cancelled" &&
                              "bg-destructive/15 text-destructive",
                            status !== "confirmed" &&
                              status !== "cancelled" &&
                              "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                          )}
                        >
                          {status}
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canDelete && booking._id ? (
                          <DeleteBookingButton id={booking._id} />
                        ) : (
                          booking._id && (
                            <Link
                              href={`/dashboard/bookings/${booking._id}`}
                              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                            >
                              Details
                            </Link>
                          )
                        )}
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
