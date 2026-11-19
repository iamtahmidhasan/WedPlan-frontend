"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarCheck,
  MapPin,
  Send,
  LoaderCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/components/services/service-card";
import { API_URL } from "@/lib/config";

export type Booking = {
  _id?: string;
  serviceId: string;
  vendorId: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

interface BookingHandleProps {
  serviceId: string;
  vendorId: string;
  serviceName?: string;
  defaultLocation?: string;
  price?: number;
  initialBooked?: boolean;
  isBlocked?: boolean;
  bookingCount?: number;
  isPremium?: boolean;
}

export function BookingHandle({
  serviceId,
  vendorId,
  serviceName,
  defaultLocation = "",
  price,
  initialBooked = false,
  isBlocked = false,
  bookingCount = 0,
  isPremium = false,
}: BookingHandleProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasBooked, setHasBooked] = useState(initialBooked);
  const [localBookingCount, setLocalBookingCount] = useState(bookingCount);

  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState(defaultLocation);
  const [message, setMessage] = useState("");

  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role ?? "customer";
  const customerId = user?.id ?? "";

  const sessionBlocked = Boolean(
    (user as { isBlocked?: boolean } | undefined)?.isBlocked
  );
  const userIsBlocked = isBlocked ? true : sessionBlocked;

  const sessionPremium = Boolean(
    (user as { isPremium?: boolean } | undefined)?.isPremium
  );
  const userIsPremium = isPremium ? true : sessionPremium;

  const currentCount = Math.max(bookingCount, localBookingCount);

  // Check if session user already booked this service
  useEffect(() => {
    if (!session?.user?.id && !session?.user?.email) return;

    fetch(`${API_URL}/bookings`)
      .then((res) => (res.ok ? res.json() : []))
      .then((bookings: Booking[]) => {
        if (Array.isArray(bookings)) {
          let count = 0;
          const booked = bookings.some((b) => {
            if (session.user.id) {
              if (b.customerId === session.user.id) {
                count += 1;
              } else if ((b as { userId?: string }).userId === session.user.id) {
                count += 1;
              }
            }

            if (b.serviceId !== serviceId) return false;
            if (b.status && b.status.toLowerCase() === "cancelled") return false;

            if (session.user.id) {
              if (b.customerId === session.user.id) return true;
              if ((b as { userId?: string }).userId === session.user.id) return true;
            }

            if (session.user.email) {
              const userEmail = session.user.email.toLowerCase();
              const custEmail = (
                b as { customerEmail?: string }
              ).customerEmail?.toLowerCase();
              const uEmail = (
                b as { userEmail?: string }
              ).userEmail?.toLowerCase();
              if (custEmail === userEmail) return true;
              if (uEmail === userEmail) return true;
            }

            return false;
          });
          setHasBooked(booked);
          if (count > 0) {
            setLocalBookingCount(count);
          }
        }
      })
      .catch((err) => console.error("Error checking booking status:", err));
  }, [serviceId, session?.user]);

  // If user is blocked, render disabled button
  if (userIsBlocked) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-8 text-base font-medium text-destructive cursor-not-allowed opacity-80"
        title="Your account is blocked. You cannot book services."
      >
        <AlertCircle className="size-4" />
        <span>Account Blocked</span>
      </button>
    );
  }

  // If user role is vendor, remove booking button
  if (role === "vendor") {
    return null;
  }

  // If already booked, render disabled button
  if (hasBooked) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-border bg-muted/60 px-8 text-base font-medium text-muted-foreground cursor-not-allowed opacity-80"
        title="You have already booked this service"
      >
        <CalendarCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span>Already Booked</span>
      </button>
    );
  }

  // Customer role check
  const isCustomer = role === "customer";
  const requiresPremium = isCustomer && !userIsPremium && currentCount >= 3;

  // If customer already booked 3 services and is not premium, 4th booking redirects to /premium
  if (requiresPremium) {
    return (
      <Link
        href="/premium"
        className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 px-8 text-base font-medium text-white shadow-xs transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Sparkles className="size-4" />
        <span>Book Service (Upgrade to Premium)</span>
      </Link>
    );
  }

  async function handleBookingSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to book this service.");
      return;
    }

    if (userIsBlocked) {
      toast.error("Your account has been blocked. You cannot book services.");
      return;
    }

    if (requiresPremium) {
      toast.info(
        "You have reached the 3 free bookings limit. Upgrade to Premium to book this service."
      );
      router.push("/premium");
      return;
    }

    if (!isCustomer) {
      toast.error("Only customer accounts can book services.");
      return;
    }

    try {
      const usersRes = await fetch(`${API_URL}/users`);
      if (usersRes.ok) {
        const users = await usersRes.json();
        if (Array.isArray(users)) {
          let matched = null;
          if (customerId) {
            matched = users.find(
              (u: { _id?: string; id?: string }) => u._id === customerId
            );
            if (!matched) {
              matched = users.find(
                (u: { _id?: string; id?: string }) => u.id === customerId
              );
            }
          }
          if (!matched && user.email) {
            const email = user.email.toLowerCase();
            matched = users.find(
              (u: { email?: string }) => u.email?.toLowerCase() === email
            );
          }
          if (matched?.isBlocked) {
            toast.error(
              "Your account has been blocked. You cannot book services."
            );
            return;
          }
        }
      }
    } catch {
      // Continue if network check fails
    }

    setLoading(true);

    const bookingPayload: Booking = {
      serviceId,
      vendorId,
      customerId,
      eventDate,
      eventLocation: eventLocation.trim(),
      message: message.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create booking: HTTP ${response.status}`);
      }

      toast.success("Booking request sent successfully!", {
        description: "The vendor will review your details and get in touch.",
      });

      setHasBooked(true);
      setMessage("");
      setEventDate("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Booking failed", { description: errorMsg });
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
        <Calendar className="size-4" />
        <span>Book this service</span>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col justify-between"
      >
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-heading text-2xl font-bold">
            Book Service
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {serviceName
              ? `Request a booking for "${serviceName}".`
              : "Fill out your wedding event details."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Service Snapshot Card */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
            {serviceName && (
              <h3 className="font-semibold text-sm text-foreground">
                {serviceName}
              </h3>
            )}
            {typeof price === "number" && (
              <p className="text-xs text-muted-foreground">
                Estimated rate:{" "}
                <span className="font-medium text-primary">
                  {formatPrice(price)}
                </span>
              </p>
            )}
            <p className="text-[11px] text-muted-foreground truncate">
              Vendor ID: <span className="font-mono">{vendorId}</span>
            </p>
          </div>

          {/* Role & Auth Validations */}
          {isPending ? (
            <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin mr-2" />
              <span>Checking account status…</span>
            </div>
          ) : !user ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Sign in required</p>
                  <p className="mt-1 text-muted-foreground">
                    You need a customer account to send booking requests to
                    vendors.
                  </p>
                </div>
              </div>
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign In to Book
              </Link>
            </div>
          ) : !isCustomer ? (
            <div className="rounded-xl border border-muted bg-muted/40 p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">
                Vendor / Admin Account
              </p>
              <p>
                You are currently logged in as a{" "}
                <span className="font-semibold capitalize text-primary">
                  {role}
                </span>
                . Bookings can only be submitted by customer accounts.
              </p>
            </div>
          ) : (
            /* Booking Form for Customer Role */
            <form
              id="booking-form"
              onSubmit={handleBookingSubmit}
              className="space-y-4"
            >
              {/* Customer Account Info */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Your Account
                </label>
                <div className="rounded-md border border-input bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex justify-between items-center">
                  <span className="truncate">{user.name || user.email}</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary capitalize">
                    {role}
                  </span>
                </div>
              </div>

              {/* Event Date */}
              <div className="space-y-1">
                <label
                  htmlFor="eventDate"
                  className="text-xs font-medium text-foreground"
                >
                  Event Date <span className="text-destructive">*</span>
                </label>
                <input
                  id="eventDate"
                  type="date"
                  required
                  min={today}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors hover:bg-secondary/40 focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Event Location */}
              <div className="space-y-1">
                <label
                  htmlFor="eventLocation"
                  className="text-xs font-medium text-foreground"
                >
                  Event Location <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <MapPin className="size-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    id="eventLocation"
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Napa Valley, California"
                    className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors hover:bg-secondary/40 focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label
                  htmlFor="message"
                  className="text-xs font-medium text-foreground"
                >
                  Message / Special Notes
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details like estimated guest count, preferred timing, or special requests..."
                  className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none transition-colors hover:bg-secondary/40 focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {user && isCustomer && (
          <div className="border-t border-border p-4 bg-card flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="booking-form"
              size="sm"
              disabled={loading}
              className="gap-1.5"
            >
              {loading ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Send Booking Request</span>
                </>
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
