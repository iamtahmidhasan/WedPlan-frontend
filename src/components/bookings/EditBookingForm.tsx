"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, User, Sparkles, Store, CheckCircle2, Clock, XCircle, Ban, AlertCircle } from "lucide-react";
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
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
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
  const rawStatus = (initialBooking.status || "pending").toLowerCase();
  const normalizedInitialStatus = rawStatus === "confirmed" ? "accepted" : rawStatus;

  const [booking, setBooking] = useState({
    ...initialBooking,
    status: normalizedInitialStatus,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingVendorAction, setIsProcessingVendorAction] = useState(false);

  const isCustomer = role.toLowerCase() === "customer";
  const isVendor = role.toLowerCase() === "vendor";
  const isAdmin = role.toLowerCase() === "admin";
  const isPending = normalizedInitialStatus === "pending";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isVendor) return;
    if (isCustomer && !isPending) {
      toast.error("Accepted, rejected, or cancelled requests cannot be edited.");
      return;
    }
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update booking");
      }

      toast.success("Booking details updated successfully");
      router.push("/dashboard/bookings");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCustomerCancel() {
    setIsCancelling(true);
    try {
      const res = await apiFetch(`/bookings?id=${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to cancel booking request");
      }

      toast.success("Booking Request Cancelled", {
        description: "Your booking request has been successfully cancelled.",
      });
      router.push("/dashboard/bookings");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleVendorAction(action: "accepted" | "rejected" | "completed") {
    setIsProcessingVendorAction(true);
    try {
      const res = await apiFetch(`/bookings?id=${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update booking to ${action}`);
      }

      toast.success(
        `Booking Request ${
          action === "accepted" ? "Accepted" : action === "completed" ? "Completed" : "Rejected"
        }`,
        {
          description: `This booking request is now marked as ${action}.`,
        }
      );
      router.push("/dashboard/bookings");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update booking status");
    } finally {
      setIsProcessingVendorAction(false);
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
      {/* Informational Status Notice */}
      {!isPending && isCustomer && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 flex items-center gap-3 text-xs text-muted-foreground">
          <AlertCircle className="size-4 shrink-0 text-primary" />
          <span>
            This booking request has been <strong>{normalizedInitialStatus}</strong>. Accepted, rejected, or cancelled requests are finalized and cannot be modified or cancelled.
          </span>
        </div>
      )}

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
              {service?.serviceName || "N/A"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {service?.location || "No location"}
            </p>
          </div>
        </div>

        <div className="rounded-md border bg-card p-4 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-secondary text-primary">
            <Store className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Vendor</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {vendor?.businessName || vendor?.name || "WedPlan Vendor"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {vendor?.email || "No email available"}
            </p>
          </div>
        </div>

        <div className="rounded-md border bg-card p-4 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-secondary text-primary">
            <User className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {customer?.name || "Client"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {customer?.email || "No email available"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Details Form */}
      <form onSubmit={handleSubmit} className="rounded-md border bg-card p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Event Date */}
          <div className="space-y-1">
            <label htmlFor="eventDate" className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Event Date</span>
            </label>
            <input
              id="eventDate"
              type="date"
              required
              disabled={isVendor || (isCustomer && !isPending)}
              value={booking.eventDate}
              onChange={(e) => setBooking({ ...booking, eventDate: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:bg-muted/40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Status Display / Selection */}
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium">
              Booking Status
            </label>
            {isAdmin ? (
              <select
                id="status"
                value={booking.status}
                onChange={(e) => setBooking({ ...booking, status: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/40 px-3 text-sm capitalize text-foreground">
                <span className="flex items-center gap-1.5">
                  {normalizedInitialStatus === "accepted" && <CheckCircle2 className="size-4 text-emerald-600" />}
                  {normalizedInitialStatus === "pending" && <Clock className="size-4 text-amber-600" />}
                  {normalizedInitialStatus === "rejected" && <XCircle className="size-4 text-rose-600" />}
                  {normalizedInitialStatus === "cancelled" && <Ban className="size-4 text-muted-foreground" />}
                  <span className="font-semibold">{normalizedInitialStatus}</span>
                </span>
              </div>
            )}
          </div>

          {/* Event Location */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="eventLocation" className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground" />
              <span>Event Location / Venue</span>
            </label>
            <input
              id="eventLocation"
              type="text"
              required
              disabled={isVendor || (isCustomer && !isPending)}
              value={booking.eventLocation}
              onChange={(e) => setBooking({ ...booking, eventLocation: e.target.value })}
              placeholder="e.g. Grand Garden Hotel, Napa Valley"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:bg-muted/40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Special Requests */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="message" className="text-sm font-medium">
              Special Requests / Notes
            </label>
            <textarea
              id="message"
              rows={4}
              disabled={isVendor || (isCustomer && !isPending)}
              value={booking.message}
              onChange={(e) => setBooking({ ...booking, message: e.target.value })}
              placeholder="Guest counts, preferred timeline, specific requirements..."
              className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:bg-muted/40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Service & Vendor Readonly Info */}
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Sparkles className="size-3.5" />
              <span>Service Name</span>
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={service?.serviceName || "N/A"}
              className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground outline-none cursor-default"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Store className="size-3.5" />
              <span>Vendor Name</span>
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={vendor?.businessName || vendor?.name || "N/A"}
              className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground outline-none cursor-default"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-4">
          <div>
            {isAdmin && (
              <ConfirmDialog
                title="Delete Booking"
                description="Are you sure you want to delete this booking? This action cannot be undone."
                confirmLabel="Delete Booking"
                variant="destructive"
                onConfirm={handleDelete}
                trigger={
                  <Button type="button" variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Booking"}
                  </Button>
                }
              />
            )}

            {/* Customer Cancel Button (Only if pending) */}
            {isCustomer && isPending && (
              <ConfirmDialog
                title="Cancel Booking Request"
                description="Are you sure you want to cancel this pending booking request? This action cannot be undone."
                confirmLabel="Cancel Request"
                variant="destructive"
                onConfirm={handleCustomerCancel}
                trigger={
                  <Button type="button" variant="destructive" size="sm" disabled={isCancelling}>
                    {isCancelling ? "Cancelling..." : "Cancel Booking Request"}
                  </Button>
                }
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/bookings"
              className="rounded-md border border-input bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Back to Bookings
            </Link>

            {/* Vendor Mark as Completed button if accepted */}
            {isVendor && normalizedInitialStatus === "accepted" && (
              <ConfirmDialog
                title="Mark Booking as Completed"
                description="Are you sure you want to mark this wedding booking as completed? This confirms that the service has been successfully delivered."
                confirmLabel="Mark as Completed"
                onConfirm={() => handleVendorAction("completed")}
                trigger={
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={isProcessingVendorAction}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Mark as Completed
                  </Button>
                }
              />
            )}

            {/* Vendor Accept / Reject buttons if pending */}
            {isVendor && isPending && (
              <>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={isProcessingVendorAction}
                  onClick={() => handleVendorAction("accepted")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Accept Booking
                </Button>
                <ConfirmDialog
                  title="Reject Booking Request"
                  description="Are you sure you want to reject this booking request? Once rejected, it cannot be processed again."
                  confirmLabel="Reject Request"
                  variant="destructive"
                  onConfirm={() => handleVendorAction("rejected")}
                  trigger={
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isProcessingVendorAction}
                    >
                      Reject Booking
                    </Button>
                  }
                />
              </>
            )}

            {/* Customer or Admin Save changes if pending */}
            {(isAdmin || (isCustomer && isPending)) && (
              <Button type="submit" size="sm" disabled={isSaving || isCancelling}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
