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
import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { VendorBookingActions } from "@/components/bookings/vendor-booking-actions";
import { apiFetch } from "@/lib/core/server";
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
      apiFetch(`/bookings`, { cache: "no-store" }),
      apiFetch(`/services`, { cache: "no-store" }).catch(() => null),
      apiFetch(`/users`, { cache: "no-store" }).catch(() => null),
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

  const isCustomer = role === "customer";
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";

  const showCustomerColumn = !isCustomer;
  const canDelete = isAdmin;

  // Role-based filtering of bookings
  let visibleBookings = bookings;

  if (isCustomer) {
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
  } else if (isVendor) {
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
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {isCustomer ? "My Bookings" : isVendor ? "Booking Requests" : "Platform Bookings"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isCustomer
            ? "Track your wedding event inquiries, vendor responses, and reservations."
            : isVendor
            ? "Review, accept, or reject incoming customer booking inquiries."
            : "All wedding event booking requests across the platform."}
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
                  className="h-28 text-center text-muted-foreground"
                >
                  {isCustomer
                    ? "You haven't submitted any booking requests yet. Browse services to request reservations."
                    : isVendor
                    ? "No booking requests received yet for your services."
                    : "No bookings found on the platform."}
                </TableCell>
              </TableRow>
            ) : (
              visibleBookings.map((booking) => {
                const bookingId = booking._id;
                const service = services.find((s) => s._id === booking.serviceId);
                const coverImage = service?.images?.[0];
                const customer = users.find(
                  (u) => u._id === booking.customerId || u.id === booking.customerId,
                );
                const customerDisplay =
                  customer?.name ||
                  customer?.email ||
                  booking.customerEmail ||
                  "Customer";

                const rawStatus = (booking.status || "pending").toLowerCase();
                const status = rawStatus === "confirmed" ? "accepted" : rawStatus;
                const isPending = status === "pending";

                return (
                  <ClickableTableRow
                    key={bookingId}
                    href={booking._id ? `/dashboard/bookings/${booking._id}` : "#"}
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
                            href={booking._id ? `/dashboard/bookings/${booking._id}` : "#"}
                            className="font-medium text-foreground hover:underline"
                          >
                            {service?.serviceName || booking.serviceId || "Wedding Service"}
                          </Link>
                          {service?.category && (
                            <span className="text-[11px] capitalize text-muted-foreground">
                              {service.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Customer Info (Hidden for customer view) */}
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
                      {booking.eventDate || "TBD"}
                    </TableCell>

                    {/* Location */}
                    <TableCell className="text-muted-foreground">
                      {booking.eventLocation || "TBD"}
                    </TableCell>

                    {/* Message */}
                    <TableCell className="max-w-[180px]">
                      <p
                        className="truncate text-xs text-muted-foreground"
                        title={booking.message || "No message provided"}
                      >
                        {booking.message || "—"}
                      </p>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {booking._id && (
                        <UpdateBookingStatusButton
                          id={booking._id}
                          currentStatus={status}
                          variant="badge"
                          role={role}
                        />
                      )}
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Customer Cancel Button (Only if pending) */}
                        {isCustomer && booking._id && isPending && (
                          <CancelBookingButton
                            id={booking._id}
                            serviceName={service?.serviceName}
                          />
                        )}

                        {/* Vendor Accept / Reject Buttons (Only if pending) */}
                        {isVendor && booking._id && isPending && (
                          <VendorBookingActions
                            id={booking._id}
                            serviceName={service?.serviceName}
                            customerName={customerDisplay}
                          />
                        )}

                        {/* Admin Delete Action */}
                        {canDelete && booking._id && (
                          <DeleteBookingButton id={booking._id} />
                        )}

                        {/* Details Link */}
                        {booking._id && (
                          <Link
                            href={`/dashboard/bookings/${booking._id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                          >
                            Details
                          </Link>
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
