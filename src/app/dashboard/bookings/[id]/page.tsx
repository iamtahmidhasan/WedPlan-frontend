import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { type Service } from "@/components/services/service-card";
import { apiFetch } from "@/lib/core/server";
import { auth } from "@/lib/auth";
import {
  EditBookingForm,
  type UserSummary,
} from "@/components/bookings/EditBookingForm";
import { CustomerReviewForm } from "@/components/reviews/customer-review-form";

async function getBookingPageData(id: string) {
  const [bookingRes, servicesRes, usersRes, reviewsRes] = await Promise.all([
    apiFetch(`/bookings?id=${id}`, { cache: "no-store" }),
    apiFetch(`/services`, { cache: "no-store" }),
    apiFetch(`/users`, { cache: "no-store" }),
    apiFetch(`/reviews`, { cache: "no-store" }),
  ]);

  if (!bookingRes.ok) {
    return null;
  }

  const bookingData = await bookingRes.json();
  const servicesData = await servicesRes.json();
  const usersData = await usersRes.json();
  const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];

  const services: Service[] = servicesData;
  const users: UserSummary[] = usersData;

  const matchedService =
    services.find((s) => s._id === bookingData.serviceId) ?? null;

  const vendorId = bookingData.vendorId;
  const matchedVendor = users.find((u) => u._id === vendorId) ?? null;

  const customerId = bookingData.customerId;
  const matchedCustomer = users.find((u) => u._id === customerId) ?? null;

  return {
    booking: {
      id,
      serviceId: bookingData.serviceId || "",
      vendorId: bookingData.vendorId || "",
      customerId: bookingData.customerId || "",
      eventDate: bookingData.eventDate || "",
      eventLocation: bookingData.eventLocation || "",
      message: bookingData.message || "",
      status: (bookingData.status || "pending").toLowerCase(),
      createdAt: bookingData.createdAt || "",
    },
    service: matchedService,
    vendor: matchedVendor,
    customer: matchedCustomer,
    users,
    reviews: reviewsData,
  };
}

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, session] = await Promise.all([
    getBookingPageData(id),
    auth.api.getSession({
      headers: await headers(),
    }),
  ]);

  if (!data) {
    notFound();
  }

  const sessionUser = session?.user;
  const matchedUser = sessionUser
    ? data.users.find(
        (u) =>
          (sessionUser.id && (u._id === sessionUser.id || u.id === sessionUser.id)) ||
          (sessionUser.email &&
            u.email?.toLowerCase() === sessionUser.email.toLowerCase())
      )
    : null;

  const role = (
    matchedUser?.role ||
    (sessionUser as { role?: string })?.role ||
    "customer"
  ).toLowerCase();

  return (
    <div className="space-y-6">
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
              {role === "vendor"
                ? "Review customer reservation schedule, event location, and booking status."
                : "Review and update reservation schedule, event location, and booking status."}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
            Status: {data.booking.status}
          </span>
        </div>
      </div>

      <EditBookingForm
        initialBooking={data.booking}
        service={data.service}
        vendor={data.vendor}
        customer={data.customer}
        role={role}
      />

      {/* If completed, Customer can leave or edit their review */}
      {role === "customer" && (data.booking.status || "").toLowerCase() === "completed" && (() => {
        const customerEmail = data.customer?.email || sessionUser?.email;
        const initialReview =
          (data.reviews as Array<{
            _id: string;
            serviceId: string;
            rating: number;
            review: string;
            user?: string;
            userName?: string;
            date?: string;
          }>).find(
            (r) =>
              r.serviceId === data.booking.serviceId &&
              (r.user?.toLowerCase() === customerEmail?.toLowerCase() ||
                r.user?.toLowerCase() === sessionUser?.email?.toLowerCase())
          ) || null;

        return (
          <div className="pt-2">
            <CustomerReviewForm
              serviceId={data.booking.serviceId}
              serviceName={data.service?.serviceName}
              initialReview={initialReview}
            />
          </div>
        );
      })()}
    </div>
  );
}
