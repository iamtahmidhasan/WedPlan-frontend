"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, User, Sparkles, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { type Service } from "@/components/services/service-card";
import { apiFetch } from "@/lib/core/client";

export interface UserSummary {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
  role?: string;
}

export interface BookingFormData {
  id: string;
  serviceId: string;
  vendorId: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function EditBookingForm({
  initialBooking,
  service,
  vendor,
  customer,
  role = "admin",
}: {
  initialBooking: BookingFormData;
  service: Service | null;
  vendor: UserSummary | null;
  customer: UserSummary | null;
  role?: string;
}) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCustomer = role.toLowerCase() === "customer";
  const isVendor = role.toLowerCase() === "vendor";
  const canDelete = role.toLowerCase() === "admin";
  const isPending = initialBooking.status.toLowerCase() === "pending";

  const availableStatusOptions = isCustomer
    ? STATUS_OPTIONS.filter(
        (opt) => opt.value === "pending" || opt.value === "cancelled"
      )
    : STATUS_OPTIONS;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isVendor) return;
    setIsSaving(true);

    const payload = {
      eventDate: booking.eventDate.trim(),
      eventLocation: booking.eventLocation.trim(),
      status: booking.status,
      message: booking.message.trim(),
      serviceId: booking.serviceId.trim(),
      vendorId: booking.vendorId.trim(),
      customerId: booking.customerId.trim(),
    };

    try {
      const res = await apiFetch(`/bookings?id=${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update booking");

      toast.success("Booking details updated successfully");
      router.push("/dashboard/bookings");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const res = await apiFetch(`/bookings?id=${booking.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete booking");

      toast.success("Booking deleted successfully");
      router.push("/dashboard/bookings");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete booking");
    } finally {
      setIsDeleting(false);
    }
  }

  const coverImage = service?.images?.[0];

  return (
    <div className="space-y-6">
      {/* Service, Vendor & Customer Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border bg-card p-4 flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-secondary">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={service?.serviceName || "Service"}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                <Sparkles className="size-5 opacity-40" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Service</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {service?.serviceName || booking.serviceId || "Unknown Service"}
            </p>
            {service?.category && (
              <p className="text-[11px] text-muted-foreground capitalize truncate">
                {service.category} · {service.location}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-md border bg-card p-4 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-secondary">
            <Store className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Vendor (Business)</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {vendor?.businessName ||
                vendor?.name ||
                booking.vendorId ||
                "N/A"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {vendor?.email || `ID: ${booking.vendorId}`}
            </p>
          </div>
        </div>

        <div className="rounded-md border bg-card p-4 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-secondary">
            <User className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {customer?.name || booking.customerId || "N/A"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {customer?.email || `ID: ${booking.customerId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-md border bg-card p-6 space-y-6"
      >
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-semibold">
            Event & Reservation Information
          </h2>
          <p className="text-xs text-muted-foreground">
            {isVendor
              ? "Read-only view: vendor accounts cannot modify customer reservation details."
              : "Update date, venue address, customer notes, and current booking status."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="eventDate"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Event Date</span>
            </label>
            <input
              id="eventDate"
              type="date"
              required
              disabled={isVendor}
              value={booking.eventDate}
              onChange={(e) =>
                setBooking({ ...booking, eventDate: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:bg-muted/40 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium">
              Booking Status
            </label>
            <select
              id="status"
              value={booking.status}
              disabled={isVendor || (isCustomer && !isPending)}
              onChange={(e) =>
                setBooking({ ...booking, status: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:bg-muted/40 disabled:cursor-not-allowed"
            >
              {availableStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label
              htmlFor="eventLocation"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <MapPin className="size-3.5 text-muted-foreground" />
              <span>Event Location / Venue</span>
            </label>
            <input
              id="eventLocation"
              type="text"
              required
              disabled={isVendor}
              value={booking.eventLocation}
              onChange={(e) =>
                setBooking({ ...booking, eventLocation: e.target.value })
              }
              placeholder="e.g. Grand Garden Hotel, Napa Valley"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:bg-muted/40 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="message" className="text-sm font-medium">
              Special Requests / Notes
            </label>
            <textarea
              id="message"
              rows={4}
              disabled={isVendor}
              value={booking.message}
              onChange={(e) =>
                setBooking({ ...booking, message: e.target.value })
              }
              placeholder="Guest counts, preferred timeline, specific requirements..."
              className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:bg-muted/40 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="serviceName"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5 text-muted-foreground" />
              <span>Service Name</span>
            </label>
            <input
              id="serviceName"
              type="text"
              readOnly
              disabled
              value={service?.serviceName || "N/A"}
              className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground outline-none cursor-default"
            />
            {booking.serviceId && (
              <p className="text-[11px] text-muted-foreground font-mono">
                Service ID: {booking.serviceId}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="vendorName"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Store className="size-3.5 text-muted-foreground" />
              <span>Vendor Name (Business Name)</span>
            </label>
            <input
              id="vendorName"
              type="text"
              readOnly
              disabled
              value={vendor?.businessName || "N/A"}
              className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground outline-none cursor-default"
            />
            {booking.vendorId && (
              <p className="text-[11px] text-muted-foreground font-mono">
                Vendor ID: {booking.vendorId}
              </p>
            )}
          </div>

          {booking.createdAt && (
            <div className="sm:col-span-2 text-xs text-muted-foreground pt-1">
              Created on: {new Date(booking.createdAt).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          {canDelete ? (
            <ConfirmDialog
              title="Delete Booking"
              description="Are you sure you want to delete this booking? This action cannot be undone."
              confirmLabel="Delete Booking"
              onConfirm={handleDelete}
              trigger={
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting || isSaving}
                >
                  {isDeleting ? "Deleting..." : "Delete Booking"}
                </Button>
              }
            />
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/bookings"
              className="rounded-md border px-4 py-2 text-sm hover:bg-secondary"
            >
              {isVendor ? "Back to Bookings" : "Cancel"}
            </Link>
            {!isVendor && (
              <Button type="submit" disabled={isSaving || isDeleting}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
