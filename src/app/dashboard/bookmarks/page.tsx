import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Bookmark, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, type Service } from "@/components/services/service-card";
import { DeleteBookmarkButton } from "@/components/bookmarks/delete-bookmark-button";
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row";
import { auth } from "@/lib/auth";
import { API_URL } from "@/lib/config";

interface BookmarkItem {
  _id?: string;
  serviceId?: string;
  userId?: string;
  userEmail?: string;
  serviceName?: string;
  category?: string;
  price?: number;
  location?: string;
  image?: string;
  createdAt?: string;
}

export default async function DashboardBookmarksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUser = session?.user;

  let bookmarks: BookmarkItem[] = [];
  let services: Service[] = [];

  try {
    const [bookmarksRes, servicesRes] = await Promise.all([
      fetch(`${API_URL}/bookmarks`, { cache: "no-store" }),
      fetch(`${API_URL}/services`, { cache: "no-store" }).catch(
        () => null
      ),
    ]);

    if (bookmarksRes.ok) {
      const allBookmarks: BookmarkItem[] = await bookmarksRes.json();
      // If session user exists, show bookmarks for this user or all if not set
      if (sessionUser) {
        const userBookmarks = allBookmarks.filter(
          (b) =>
            !b.userId ||
            b.userId === sessionUser.id ||
            (b.userEmail &&
              b.userEmail.toLowerCase() === sessionUser.email?.toLowerCase())
        );
        bookmarks = userBookmarks.length > 0 ? userBookmarks : allBookmarks;
      } else {
        bookmarks = allBookmarks;
      }
    }

    if (servicesRes && servicesRes.ok) {
      services = await servicesRes.json();
    }
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="size-6 text-primary" />
            <span>Saved Bookmarks</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Wedding vendors, venues, and packages you have saved to your wishlist.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary w-fit"
        >
          <span>Explore More Services</span>
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Saved On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookmarks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground space-y-2"
                >
                  <p>No bookmarked services yet.</p>
                  <Link
                    href="/services"
                    className="inline-flex text-xs font-medium text-primary hover:underline"
                  >
                    Browse wedding services catalog →
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              bookmarks.map((bookmark, index) => {
                const bookmarkId = bookmark._id || String(index);
                const service = services.find(
                  (s) => s._id === bookmark.serviceId
                );
                const coverImage = service?.images?.[0] || bookmark.image;
                const serviceTitle =
                  service?.serviceName ||
                  bookmark.serviceName ||
                  bookmark.serviceId ||
                  "Wedding Service";
                const category =
                  service?.category || bookmark.category || "General";
                const location =
                  service?.location || bookmark.location || "N/A";
                const priceValue =
                  service?.price ?? bookmark.price;
                const targetHref = bookmark.serviceId
                  ? `/services/${bookmark.serviceId}`
                  : "/services";

                return (
                  <ClickableTableRow key={bookmarkId} href={targetHref}>
                    {/* Service Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-secondary">
                          {coverImage ? (
                            <Image
                              src={coverImage}
                              alt={serviceTitle}
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
                        <Link
                          href={targetHref}
                          className="font-medium text-foreground hover:underline"
                        >
                          {serviceTitle}
                        </Link>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                        {category}
                      </span>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="text-muted-foreground">
                      {location}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-medium">
                      {typeof priceValue === "number"
                        ? formatPrice(priceValue)
                        : "—"}
                    </TableCell>

                    {/* Saved Date */}
                    <TableCell className="text-muted-foreground text-xs">
                      {bookmark.createdAt
                        ? new Date(bookmark.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={targetHref}
                          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <span>View</span>
                          <ExternalLink className="size-3" />
                        </Link>
                        {bookmark._id && (
                          <DeleteBookmarkButton id={bookmark._id} />
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
