"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Sparkles,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type Service } from "@/components/services/service-card";
import { API_URL } from "@/lib/config";

interface UserSummary {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
  role?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export default function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState({
    serviceId: "",
    vendorId: "",
    customerId: "",
    eventDate: "",
    eventLocation: "",
    message: "",
    status: "pending",
    createdAt: "",
  });

  const [service, setService] = useState<Service | null>(null);
  const [customer, setCustomer] = useState<UserSummary | null>(null);
  const [vendor, setVendor] = useState<UserSummary | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/bookings/${id}`).then((res) =>
        res.ok ? res.json() : null,
      ),
      fetch(`${API_URL}/services`).then((res) =>
        res.ok ? res.json() : [],
      ),
      fetch(`${API_URL}/users`).then((res) =>
        res.ok ? res.json() : [],
      ),
    ])
      .then(([bookingData, servicesData, usersData]) => {
        if (bookingData) {
          setBooking({
            serviceId: bookingData.serviceId || "",
            vendorId: bookingData.vendorId || "",
            customerId: bookingData.customerId || "",
            eventDate: bookingData.eventDate || "",
            eventLocation: bookingData.eventLocation || "",
            message: bookingData.message || "",
            status: (bookingData.status || "pending").toLowerCase(),
            createdAt: bookingData.createdAt || "",
          });

          const servs: Service[] = Array.isArray(servicesData)
            ? servicesData
            : [];
          const matchedService = servs.find(
            (s) => s._id === bookingData.serviceId,
          );
          if (matchedService) setService(matchedService);

          const usrs: UserSummary[] = Array.isArray(usersData) ? usersData : [];

          const vId = bookingData.vendorId || matchedService?.vendorId;
          const matchedVendor = usrs.find(
            (u) => u._id === vId || u.id === vId || u.email === vId,
          );
          if (matchedVendor) setVendor(matchedVendor);

          const cId = bookingData.customerId;
          const matchedCustomer = usrs.find(
            (u) => u._id === cId || u.id === cId || u.email === cId,
          );
          if (matchedCustomer) setCustomer(matchedCustomer);
        }
      })
      .catch((err) => console.error("Error fetching booking details:", err));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

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
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update booking");

      toast.success("Booking details updated successfully");
      router.push("/dashboard/bookings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete booking");

      toast.success("Booking deleted successfully");
      router.push("/dashboard/bookings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete booking");
    }
  }

  const coverImage = service?.images?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Bookings</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <p className="text-sm text-muted-foreground">
              Review and update reservation schedule, event location, and
              booking status.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
            Status: {booking.status}
          </span>
        </div>
      </div>

      {/* Service, Vendor & Customer Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Service Card */}
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

        {/* Vendor Card */}
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

        {/* Customer Card */}
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
            Update date, venue address, customer notes, and current booking
            status.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Event Date */}
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
              value={booking.eventDate}
              onChange={(e) =>
                setBooking({ ...booking, eventDate: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Booking Status */}
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium">
              Booking Status
            </label>
            <select
              id="status"
              value={booking.status}
              onChange={(e) =>
                setBooking({ ...booking, status: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Event Location */}
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
              value={booking.eventLocation}
              onChange={(e) =>
                setBooking({ ...booking, eventLocation: e.target.value })
              }
              placeholder="e.g. Grand Garden Hotel, Napa Valley"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Message / Special Notes */}
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="message" className="text-sm font-medium">
              Special Requests / Notes
            </label>
            <textarea
              id="message"
              rows={4}
              value={booking.message}
              onChange={(e) =>
                setBooking({ ...booking, message: e.target.value })
              }
              placeholder="Guest counts, preferred timeline, specific requirements..."
              className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Service Name */}
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
              className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring cursor-default"
            />
            {booking.serviceId && (
              <p className="text-[11px] text-muted-foreground font-mono">
                Service ID: {booking.serviceId}
              </p>
            )}
          </div>

          {/* Vendor Name (as businessName) */}
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
              className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring cursor-default"
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

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete Booking
          </Button>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/bookings"
              className="rounded-md border px-4 py-2 text-sm hover:bg-secondary"
            >
              Cancel
            </Link>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
