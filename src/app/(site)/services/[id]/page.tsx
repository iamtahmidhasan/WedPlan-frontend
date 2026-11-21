import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  formatPrice,
  type Service,
} from "@/components/services/service-card";
import { BookingHandle } from "@/components/services/booking-handle";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { apiFetch } from "@/lib/core/server";
import { checkIsUserBlocked } from "@/lib/user-status";
import getBookingCount from "@/lib/getBookingCount";

export const metadata: Metadata = {
  title: "Service details | WedPlan",
  description: "Explore the details of a WedPlan service.",
};


export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const [{ id }, session] = await Promise.all([
    params,
    auth.api.getSession({
      headers: await headers(),
    }),
  ]);

  if (!session) {
    redirect(`/sign-in?redirect=/services/${id}`);
  }

  const [response, bookingsRes] = await Promise.all([
    apiFetch(`/services?id=${id}`),
    apiFetch(`/bookings`, { cache: "no-store" }).catch(() => null),
  ]);

  if (!response.ok) notFound();

  const service = (await response.json()) as Service;
  const [cover, second, third] = service.images;

  const role = (
    session?.user as { role?: string } | undefined
  )?.role?.toLowerCase();
  const isVendor = role === "vendor";

  const [bookingCount, isBlocked] = await Promise.all([
    getBookingCount(),
    checkIsUserBlocked(session?.user),
  ]);

  let isPremium = Boolean(
    (session?.user as { isPremium?: boolean } | undefined)?.isPremium
  );

  if (session?.user && !isPremium) {
    try {
      const usersRes = await apiFetch(`/users`, { cache: "no-store" });
      if (usersRes.ok) {
        const users = await usersRes.json();
        if (Array.isArray(users)) {
          let matched = null;
          if (session.user.id) {
            matched = users.find(
              (u: { _id?: string; id?: string }) => u._id === session.user.id
            );
            if (!matched) {
              matched = users.find(
                (u: { _id?: string; id?: string }) => u.id === session.user.id
              );
            }
          }
          if (!matched && session.user.email) {
            const email = session.user.email.toLowerCase();
            matched = users.find(
              (u: { email?: string }) => u.email?.toLowerCase() === email
            );
          }
          if (matched?.isPremium) {
            isPremium = true;
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  let initialBooked = false;
  if (session?.user && bookingsRes && bookingsRes.ok) {
    const allBookings = await bookingsRes.json();
    if (Array.isArray(allBookings)) {
      initialBooked = allBookings.some((b) => {
        if (b.serviceId !== service._id) return false;
        if (b.status && b.status.toLowerCase() === "cancelled") return false;

        if (session.user.id) {
          if (b.customerId === session.user.id) return true;
          if (b.userId === session.user.id) return true;
        }

        if (session.user.email) {
          const userEmail = session.user.email.toLowerCase();
          if (b.customerEmail?.toLowerCase() === userEmail) return true;
          if (b.userEmail?.toLowerCase() === userEmail) return true;
        }

        return false;
      });
    }
  }

  return (
    <main className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 pt-10 sm:px-10">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All services
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              {service.category}
            </p>
            <h1 className="mt-6 max-w-[16ch] font-heading text-6xl leading-[0.92] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-8xl">
              {service.serviceName}
            </h1>
            <p className="mt-8 max-w-[50ch] text-base leading-7 text-muted-foreground">
              {service.description}
            </p>

            <div className="mt-12 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Starting at</p>
                <p className="mt-2 font-heading text-5xl text-primary">
                  {formatPrice(service.price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="mt-3 flex items-center gap-2 text-foreground">
                  <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {service.location}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Vendor · {service.vendorId}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!isVendor && (
                <BookingHandle
                  serviceId={service._id}
                  vendorId={service.vendorId}
                  serviceName={service.serviceName}
                  defaultLocation={service.location}
                  price={service.price}
                  initialBooked={initialBooked}
                  isBlocked={isBlocked}
                  bookingCount={bookingCount}
                  isPremium={isPremium}
                />
              )}
              <BookmarkButton
                serviceId={service._id}
                serviceName={service.serviceName}
                category={service.category}
                price={service.price}
                location={service.location}
                image={cover}
                isBlocked={isBlocked}
              />
            </div>

            <div className="mt-12 flex items-center gap-4">
              <span className="h-px w-12 bg-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Every detail, considered.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {cover && (
              <div className="group relative col-span-6 aspect-[5/4] overflow-hidden border border-border bg-secondary">
                <Image
                  src={cover}
                  alt={`${service.serviceName} photo 1`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
            )}
            {second && (
              <div
                className={`group relative ${
                  third ? "col-span-4" : "col-span-6"
                } aspect-[5/4] overflow-hidden border border-border bg-secondary`}
              >
                <Image
                  src={second}
                  alt={`${service.serviceName} photo 2`}
                  fill
                  sizes="(min-width: 1024px) 35vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
            )}
            {third && (
              <div className="group relative col-span-2 aspect-[5/4] overflow-hidden border border-border bg-secondary">
                <Image
                  src={third}
                  alt={`${service.serviceName} photo 3`}
                  fill
                  sizes="(min-width: 1024px) 15vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-20 bg-primary py-16 text-primary-foreground">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div>
            <p className="text-sm text-primary-foreground/70">Keep planning</p>
            <p className="mt-3 font-heading text-4xl leading-tight sm:text-5xl">
              Make room for the good part.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex h-12 w-fit items-center justify-center border border-primary-foreground/50 px-5 text-sm font-medium transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            Back to all services
          </Link>
        </div>
      </section>
    </main>
  );
}
