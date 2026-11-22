import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Star, MessageSquareQuote, Calendar, ArrowUpRight } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { apiFetch } from "@/lib/core/server";
import { DeleteReviewButton } from "@/components/reviews/delete-review-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Reviews Management | WedPlan Dashboard",
  description: "View and manage wedding service customer reviews.",
};

interface ReviewDoc {
  _id: string;
  serviceId: string;
  rating: number;
  review: string;
  user: string;
  userName?: string;
  date: string;
}

interface ServiceDoc {
  _id: string;
  serviceName: string;
  category?: string;
  vendorId?: string;
}

interface UserDoc {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
  role?: string;
}

export default async function DashboardReviewsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?redirect=/dashboard/reviews");
  }

  const role = (session.user as { role?: string })?.role?.toLowerCase() || "customer";
  const userId = session.user.id || "";
  const userEmail = session.user.email?.toLowerCase() || "";

  const [reviewsRes, servicesRes, usersRes] = await Promise.all([
    apiFetch("/reviews", { cache: "no-store" }).catch(() => null),
    apiFetch("/services", { cache: "no-store" }).catch(() => null),
    apiFetch("/users", { cache: "no-store" }).catch(() => null),
  ]);

  const allReviews: ReviewDoc[] = reviewsRes?.ok ? await reviewsRes.json() : [];
  const services: ServiceDoc[] = servicesRes?.ok ? await servicesRes.json() : [];
  const users: UserDoc[] = usersRes?.ok ? await usersRes.json() : [];

  const matchedUser = users.find(
    (u) =>
      (userId && (u._id === userId || u.id === userId)) ||
      (userEmail && u.email?.toLowerCase() === userEmail)
  );

  const isAdmin = role === "admin";
  const isVendor = role === "vendor";

  // Filter reviews based on user role
  let visibleReviews: ReviewDoc[] = [];

  if (isAdmin) {
    visibleReviews = allReviews;
  } else if (isVendor) {
    // Collect service IDs owned by this vendor
    const vendorServiceIds = new Set(
      services
        .filter(
          (s) =>
            (userId && s.vendorId === userId) ||
            (matchedUser?._id && s.vendorId === matchedUser._id) ||
            (matchedUser?.businessName && s.vendorId === matchedUser.businessName)
        )
        .map((s) => s._id)
    );

    visibleReviews = allReviews.filter((r) => vendorServiceIds.has(r.serviceId));
  } else {
    // Customers see reviews they have written
    visibleReviews = allReviews.filter(
      (r) => r.user?.toLowerCase() === userEmail
    );
  }

  // Map service lookup
  const serviceMap = new Map<string, ServiceDoc>();
  for (const s of services) {
    serviceMap.set(s._id, s);
  }

  // Calculate average rating
  const avgRating =
    visibleReviews.length > 0
      ? (
          visibleReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
          visibleReviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {isAdmin ? "Manage Customer Reviews" : isVendor ? "Customer Feedback" : "My Reviews"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {isAdmin
              ? "All client testimonials across wedding services with moderation authority."
              : isVendor
              ? "Verified feedback from couples who celebrated with your services."
              : "Feedback you have provided for services you completed."}
          </p>
        </div>

        {avgRating && (
          <div className="flex items-center gap-3 border border-border bg-card px-3.5 py-2 rounded-lg shrink-0">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="size-4 fill-amber-500" />
              <span className="font-heading text-lg font-bold text-foreground">{avgRating}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Average across {visibleReviews.length} {visibleReviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="max-w-xs">Feedback</TableHead>
              <TableHead>Date</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleReviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <MessageSquareQuote className="size-6 text-muted-foreground/60" />
                    <p className="text-sm font-medium">No reviews found</p>
                    <p className="text-xs text-muted-foreground">
                      {isVendor
                        ? "When couples complete their events with you, their verified feedback will appear here."
                        : "There are no customer reviews logged yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visibleReviews.map((item) => {
                const service = serviceMap.get(item.serviceId);
                const reviewerName = item.userName || item.user || "Customer";
                const ratingNum = Math.max(1, Math.min(5, Number(item.rating) || 5));
                const formattedDate = item.date
                  ? new Date(item.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Recent";

                return (
                  <TableRow key={item._id}>
                    {/* Service Column */}
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/services/${item.serviceId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                        >
                          <span className="truncate max-w-[220px]">
                            {service?.serviceName || "Wedding Service"}
                          </span>
                          <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-primary" />
                        </Link>
                        {service?.category && (
                          <span className="text-[11px] text-muted-foreground capitalize">
                            {service.category}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Client Column */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-foreground truncate max-w-[150px]">
                          {reviewerName}
                        </span>
                        {item.user && item.userName && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                            {item.user}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Star Rating */}
                    <TableCell>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i < ratingNum ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>

                    {/* Review Commentary */}
                    <TableCell className="max-w-xs">
                      <p className="text-xs text-foreground/90 leading-relaxed line-clamp-3 whitespace-pre-line">
                        {item.review}
                      </p>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground/70" />
                        <span>{formattedDate}</span>
                      </div>
                    </TableCell>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <TableCell className="text-right">
                        <DeleteReviewButton id={item._id} reviewerName={reviewerName} />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
