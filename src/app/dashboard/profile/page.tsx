import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  Store,
  User as UserIcon,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatPrice, type Service } from "@/components/services/service-card";
import { DeleteServiceButton } from "@/components/services/delete-service-button";
import { DeleteBookingButton } from "@/components/bookings/delete-booking-button";
import { UpdateBookingStatusButton } from "@/components/bookings/update-booking-status-button";
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row";
import { apiFetch } from "@/lib/core/server";
import { auth } from "@/lib/auth";

interface Booking {
  _id?: string;
  serviceId?: string;
  vendorId?: string;
  customerId?: string;
  eventDate?: string;
  eventLocation?: string;
  message?: string;
  status?: string;
  createdAt?: string;
}

interface DBUser {
  _id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  role?: string;
  businessName?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

const TABS = [
  { id: "personal", label: "Personal Information", icon: UserIcon },
  { id: "bookings", label: "My Bookings", icon: CalendarCheck },
  { id: "services", label: "My Services", icon: Sparkles },
  { id: "vendor", label: "Vendor Info", icon: Store },
] as const;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUser = session?.user;

  if (!sessionUser) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-sm text-muted-foreground">
          You must be logged in to view and edit your profile.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { tab } = await searchParams;

  const [usersRes, bookingsRes, servicesRes] = await Promise.all([
    apiFetch(`/users`, { cache: "no-store" }),
    apiFetch(`/bookings`, { cache: "no-store" }),
    apiFetch(`/services`, { cache: "no-store" }),
  ]);

  const allUsers: DBUser[] = usersRes.ok ? await usersRes.json() : [];
  const allBookings: Booking[] = bookingsRes.ok ? await bookingsRes.json() : [];
  const allServices: Service[] = servicesRes.ok ? await servicesRes.json() : [];

  const matched = allUsers.find((u) => u._id === sessionUser.id);
  const userId = matched?._id ?? sessionUser.id;

  const user = {
    _id: userId,
    name: matched?.name ?? sessionUser.name ?? "",
    email: matched?.email ?? sessionUser.email ?? "",
    image: matched?.image ?? sessionUser.image ?? "",
    role: matched?.role ?? (sessionUser as { role?: string }).role ?? "customer",
    businessName: matched?.businessName ?? "",
    emailVerified: matched?.emailVerified ?? false,
    createdAt: matched?.createdAt ?? "",
  };

  const isVendor = user.role === "vendor";
  const isCustomer = user.role === "customer";

  // Role-based tabs:
  // - Customer: Personal Information, My Bookings
  // - Vendor & Admin: All tabs (Personal, Bookings, Services, Vendor Info)
  const customerTabIds = ["personal", "bookings"];
  const visibleTabs = isCustomer
    ? TABS.filter((t) => customerTabIds.includes(t.id))
    : TABS;

  const isTabAllowed = visibleTabs.some((t) => t.id === tab);
  const activeTab = isTabAllowed ? (tab ?? "personal") : "personal";

  const userServices = allServices.filter((s) => s.vendorId === userId);
  const userBookings = isVendor
    ? allBookings.filter((b) => b.vendorId === userId)
    : allBookings.filter((b) => b.customerId === userId);

  async function updateProfile(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const image = String(formData.get("image") ?? "").trim();

    await apiFetch(`/users?id=${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image }),
    });

    revalidatePath("/dashboard/profile");
  }

  async function updateVendor(formData: FormData) {
    "use server";
    const businessName = String(formData.get("businessName") ?? "").trim();
    const role = String(formData.get("role") ?? "customer").trim();

    await apiFetch(`/users?id=${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, role }),
    });

    revalidatePath("/dashboard/profile");
  }

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-primary/20">
              {user.image && (
                <AvatarImage
                  src={user.image}
                  alt={user.name ?? "User"}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="text-base font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {user.name ?? "My Profile"}
                </h1>
                {user.emailVerified && (
                  <span title="Email Verified">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.businessName && (
                <p className="text-xs text-primary font-medium mt-0.5">
                  {user.businessName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
              <Shield className="size-3.5" />
              <span>{user.role}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border overflow-x-auto gap-2">
        {visibleTabs.map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = activeTab === tabItem.id;
          const count =
            tabItem.id === "bookings"
              ? userBookings.length
              : tabItem.id === "services"
              ? userServices.length
              : null;

          return (
            <Link
              key={tabItem.id}
              href={`/dashboard/profile?tab=${tabItem.id}`}
              scroll={false}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{tabItem.label}</span>
              {typeof count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* TAB 1: Personal Information */}
      {activeTab === "personal" && (
        <form
          action={updateProfile}
          className="rounded-md border bg-card p-6 space-y-6"
        >
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <p className="text-xs text-muted-foreground">
              Update your account display name, avatar image, and view credentials.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={user.name}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Email Address (Read-only) */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                readOnly
                disabled
                defaultValue={user.email}
                className="h-10 w-full rounded-md border border-input bg-muted/50 px-3 text-sm outline-none cursor-not-allowed opacity-75"
              />
              <p className="text-[11px] text-muted-foreground">
                Email address is linked to your authentication account.
              </p>
            </div>

            {/* Profile Image URL */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="image" className="text-sm font-medium">
                Profile Image URL
              </label>
              <input
                id="image"
                name="image"
                type="url"
                defaultValue={user.image}
                placeholder="https://example.com/avatar.jpg"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Account Role Overview */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Current Role</label>
              <div className="h-10 rounded-md border border-input bg-muted/30 px-3 flex items-center justify-between text-sm">
                <span className="capitalize font-medium text-foreground">
                  {user.role}
                </span>
                <span className="text-xs text-muted-foreground">
                  Managed by system permissions
                </span>
              </div>
            </div>

            {/* Email Verification Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Account Status</label>
              <div className="h-10 rounded-md border border-input bg-muted/30 px-3 flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    user.emailVerified ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
                <span className="text-xs font-medium">
                  {user.emailVerified ? "Verified Account" : "Standard Account"}
                </span>
              </div>
            </div>

            {user.createdAt && (
              <div className="sm:col-span-2 text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <Clock className="size-3.5" />
                <span>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button type="submit">Save Personal Info</Button>
          </div>
        </form>
      )}

      {/* TAB 2: Bookings */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">My Bookings</h2>
              <p className="text-xs text-muted-foreground">
                All wedding events and service reservations requested by or assigned to you.
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              Total: {userBookings.length} booking(s)
            </span>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-muted-foreground space-y-2"
                    >
                      <p>You have not made any bookings yet.</p>
                      <Link
                        href="/services"
                        className="inline-flex text-xs font-medium text-primary hover:underline"
                      >
                        Browse wedding services →
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  userBookings.map((booking) => {
                    const serviceItem = allServices.find(
                      (s) => s._id === booking.serviceId
                    );
                    const coverImage = serviceItem?.images?.[0];

                    return (
                      <ClickableTableRow
                        key={booking._id}
                        href={booking._id ? `/dashboard/bookings/${booking._id}` : "#"}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-secondary">
                              {coverImage ? (
                                <Image
                                  src={coverImage}
                                  alt={serviceItem?.serviceName ?? "Service"}
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
                              href={booking._id ? `/dashboard/bookings/${booking._id}` : "#"}
                              className="font-medium text-foreground hover:underline"
                            >
                              {serviceItem?.serviceName ?? "Service"}
                            </Link>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          {booking.eventDate ?? "N/A"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {booking.eventLocation ?? "N/A"}
                        </TableCell>

                        <TableCell className="max-w-[180px]">
                          <p
                            className="truncate text-xs text-muted-foreground"
                            title={booking.message ?? "No notes"}
                          >
                            {booking.message ?? "—"}
                          </p>
                        </TableCell>

                        <TableCell>
                          {booking._id ? (
                            <UpdateBookingStatusButton
                              id={booking._id}
                              currentStatus={booking.status}
                              variant="badge"
                            />
                          ) : (
                            <span className="capitalize text-xs font-medium">
                              {booking.status ?? "pending"}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {booking._id && (
                              <DeleteBookingButton id={booking._id} />
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
      )}

      {/* TAB 3: Services */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">My Services</h2>
              <p className="text-xs text-muted-foreground">
                All vendor services and wedding packages listed by you.
              </p>
            </div>
            {isVendor && (
              <span className="text-xs text-muted-foreground">
                Total: {userServices.length} services
              </span>
            )}
          </div>

          <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userServices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No services listed yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    userServices.map((serviceItem) => {
                      const coverImage = serviceItem.images?.[0];

                      return (
                        <ClickableTableRow
                          key={serviceItem._id}
                          href={`/dashboard/services/${serviceItem._id}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-secondary">
                                {coverImage ? (
                                  <Image
                                    src={coverImage}
                                    alt={serviceItem.serviceName}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                    No img
                                  </div>
                                )}
                              </div>
                              <Link
                                href={`/dashboard/services/${serviceItem._id}`}
                                className="font-medium text-foreground hover:underline"
                              >
                                {serviceItem.serviceName}
                              </Link>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                              {serviceItem.category}
                            </span>
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {serviceItem.location ?? "N/A"}
                          </TableCell>

                          <TableCell className="font-medium">
                            {formatPrice(serviceItem.price)}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <DeleteServiceButton id={serviceItem._id} />
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
      )}

      {/* TAB 4: Vendor Info */}
      {activeTab === "vendor" && (
        <form
          action={updateVendor}
          className="rounded-md border bg-card p-6 space-y-6"
        >
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-semibold">Vendor & Business Profile</h2>
            <p className="text-xs text-muted-foreground">
              Configure your public business identity and commercial trade name.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Business Name */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="businessName" className="text-sm font-medium">
                Business / Company Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="e.g. Dream Weddings Photography & Film"
                defaultValue={user.businessName}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Vendor Role Confirmation */}
            <div className="space-y-1">
              <label htmlFor="vendorRole" className="text-sm font-medium">
                Account Role
              </label>
              <select
                id="vendorRole"
                name="role"
                defaultValue={user.role}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="customer">customer</option>
                <option value="vendor">vendor</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Set to &quot;vendor&quot; to list your wedding services and accept bookings.
              </p>
            </div>

            {/* Active Services Summary */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Active Services</label>
              <div className="h-10 rounded-md border border-input bg-muted/30 px-3 flex items-center justify-between text-sm">
                <span>{userServices.length} service(s) listed</span>
                <Link
                  href="/dashboard/profile?tab=services"
                  scroll={false}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View all →
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button type="submit">Save Vendor Info</Button>
          </div>
        </form>
      )}
    </div>
  );
}
