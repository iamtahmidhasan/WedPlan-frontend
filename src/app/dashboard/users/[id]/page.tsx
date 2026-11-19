"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  Sparkles,
  Store,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { formatPrice, type Service } from "@/components/services/service-card";
import { DeleteServiceButton } from "@/components/services/delete-service-button";
import { DeleteBookingButton } from "@/components/bookings/delete-booking-button";
import { UpdateBookingStatusButton } from "@/components/bookings/update-booking-status-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { API_URL } from "@/lib/config";

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

const TABS = [
  { id: "personal", label: "Personal Information", icon: UserIcon },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "services", label: "Services", icon: Sparkles },
  { id: "vendor", label: "Vendor Info", icon: Store },
] as const;

type TabType = (typeof TABS)[number]["id"];

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("personal");

  const [user, setUser] = useState({
    name: "",
    email: "",
    image: "",
    role: "customer",
    businessName: "",
    isBlocked: false,
    emailVerified: false,
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const isSessionUser = Boolean(
    (session?.user?.id && session.user.id === id) ||
    (session?.user?.email && session.user.email === user.email),
  );

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/users/${id}`).then((res) =>
        res.ok ? res.json() : null,
      ),
      fetch(`${API_URL}/bookings`).then((res) =>
        res.ok ? res.json() : [],
      ),
      fetch(`${API_URL}/services`).then((res) =>
        res.ok ? res.json() : [],
      ),
    ])
      .then(([userData, bookingsData, servicesData]) => {
        if (userData) {
          setUser({
            name: userData.name || "",
            email: userData.email || "",
            image: userData.image || "",
            role: userData.role || "customer",
            businessName: userData.businessName || "",
            isBlocked: Boolean(userData.isBlocked),
            emailVerified: Boolean(userData.emailVerified),
          });
        }

        const allServs: Service[] = Array.isArray(servicesData)
          ? servicesData
          : [];
        setAllServices(allServs);

        // Filter services owned by this user (if vendor)
        const userServices = allServs.filter(
          (s) =>
            s.vendorId === id || (userData?._id && s.vendorId === userData._id),
        );
        setServices(userServices);

        // Filter bookings where this user is customer or vendor
        const allBooks: Booking[] = Array.isArray(bookingsData)
          ? bookingsData
          : [];
        const userBookings = allBooks.filter(
          (b) =>
            b.customerId === id ||
            b.vendorId === id ||
            (userData?._id &&
              (b.customerId === userData._id || b.vendorId === userData._id)) ||
            (userData?.email && b.customerId === userData.email),
        );
        setBookings(userBookings);
      })
      .catch((err) => console.error("Error loading user data:", err))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSaveUser(e: FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!res.ok) throw new Error("Failed to update user");

      toast.success("User information updated successfully");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  }

  async function handleDeleteUser() {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      router.push("/dashboard/users");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Users</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {user.name || "User Details"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage personal credentials, user bookings, vendor services, and
              business information.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border overflow-x-auto gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count =
            tab.id === "bookings"
              ? bookings.length
              : tab.id === "services"
                ? services.length
                : null;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
              {typeof count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Personal Information */}
      {activeTab === "personal" && (
        <form
          onSubmit={handleSaveUser}
          className="rounded-md border bg-card p-6 space-y-6"
        >
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <p className="text-xs text-muted-foreground">
              Update user contact details, authentication credentials, and
              permissions.
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
                type="text"
                required
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                readOnly={isSessionUser}
                disabled={isSessionUser}
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className={cn(
                  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring",
                  isSessionUser && "bg-muted/50 cursor-not-allowed opacity-75",
                )}
              />
            </div>

            {/* Profile Image URL */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="image" className="text-sm font-medium">
                Profile Image URL
              </label>
              <input
                id="image"
                type="url"
                value={user.image}
                onChange={(e) => setUser({ ...user, image: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Account Role */}
            <div className="space-y-1">
              <label htmlFor="role" className="text-sm font-medium">
                User Role
              </label>
              <select
                id="role"
                value={user.role}
                disabled={isSessionUser}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <option value="customer">customer</option>
                <option value="vendor">vendor</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>

          {/* Status Checkboxes */}
          {!isSessionUser && (
            <div className="flex items-center gap-6 border-t pt-4">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.isBlocked}
                  onChange={(e) =>
                    setUser({ ...user, isBlocked: e.target.checked })
                  }
                  className="size-4 rounded border-input"
                />
                Blocked
              </label>

              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.emailVerified}
                  onChange={(e) =>
                    setUser({ ...user, emailVerified: e.target.checked })
                  }
                  className="size-4 rounded border-input"
                />
                Email Verified
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              {!isSessionUser && (
                <ConfirmDialog
                  title="Delete User"
                  description="Are you sure you want to delete this user? All their associated data may be permanently removed."
                  confirmLabel="Delete User"
                  onConfirm={handleDeleteUser}
                  trigger={
                    <Button type="button" variant="destructive">
                      Delete User
                    </Button>
                  }
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/users"
                className="rounded-md border px-4 py-2 text-sm hover:bg-secondary"
              >
                Cancel
              </Link>
              <Button type="submit">Save Personal Info</Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Bookings */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">User Bookings</h2>
              <p className="text-xs text-muted-foreground">
                All wedding event bookings and reservations connected with this
                user.
              </p>
            </div>
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading bookings…
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No bookings found for this user.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking, index) => {
                    const bookingId = booking._id || String(index);
                    const service = allServices.find(
                      (s) => s._id === booking.serviceId,
                    );
                    const coverImage = service?.images?.[0];

                    return (
                      <ClickableTableRow
                        key={bookingId}
                        href={
                          booking._id
                            ? `/dashboard/bookings/${booking._id}`
                            : "#"
                        }
                      >
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
                            <Link
                              href={
                                booking._id
                                  ? `/dashboard/bookings/${booking._id}`
                                  : "#"
                              }
                              className="font-medium text-foreground hover:underline"
                            >
                              {service?.serviceName ||
                                booking.serviceId ||
                                "Unknown Service"}
                            </Link>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          {booking.eventDate || "N/A"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {booking.eventLocation || "N/A"}
                        </TableCell>

                        <TableCell className="max-w-[180px]">
                          <p
                            className="truncate text-xs text-muted-foreground"
                            title={booking.message || "No notes"}
                          >
                            {booking.message || "—"}
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
                              {booking.status || "pending"}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {booking._id && (
                              <>
                                <UpdateBookingStatusButton
                                  id={booking._id}
                                  currentStatus={booking.status}
                                  variant="button"
                                />
                                <DeleteBookingButton id={booking._id} />
                              </>
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
              <h2 className="text-lg font-semibold">Vendor Services</h2>
              <p className="text-xs text-muted-foreground">
                All services listed by this user in the WedPlan catalog.
              </p>
            </div>
            {user.role === "vendor" && (
              <span className="text-xs text-muted-foreground">
                Total: {services.length} services
              </span>
            )}
          </div>

          {user.role !== "vendor" && services.length === 0 ? (
            <div className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Customer Account</p>
              <p>
                This user is currently registered as a{" "}
                <span className="font-semibold text-primary">{user.role}</span>.
                Change role to &quot;vendor&quot; in the Personal Information or
                Vendor Info tab to manage vendor services.
              </p>
            </div>
          ) : (
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
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No services listed by this vendor yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => {
                      const coverImage = service.images?.[0];

                      return (
                        <ClickableTableRow
                          key={service._id}
                          href={`/dashboard/services/${service._id}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-secondary">
                                {coverImage ? (
                                  <Image
                                    src={coverImage}
                                    alt={service.serviceName}
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
                                href={`/dashboard/services/${service._id}`}
                                className="font-medium text-foreground hover:underline"
                              >
                                {service.serviceName}
                              </Link>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                              {service.category}
                            </span>
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {service.location || "N/A"}
                          </TableCell>

                          <TableCell className="font-medium">
                            {formatPrice(service.price)}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <DeleteServiceButton id={service._id} />
                            </div>
                          </TableCell>
                        </ClickableTableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Vendor Info */}
      {activeTab === "vendor" && (
        <form
          onSubmit={handleSaveUser}
          className="rounded-md border bg-card p-6 space-y-6"
        >
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-semibold">Vendor Information</h2>
            <p className="text-xs text-muted-foreground">
              Configure business identity, vendor details, and trade name.
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
                type="text"
                placeholder="e.g. Royal Wedding Decor & Events"
                value={user.businessName}
                onChange={(e) =>
                  setUser({ ...user, businessName: e.target.value })
                }
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
                value={user.role}
                disabled={isSessionUser}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <option value="customer">customer</option>
                <option value="vendor">vendor</option>
                <option value="admin">admin</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Set to &quot;vendor&quot; to allow this user to list services
                and receive bookings.
              </p>
            </div>

            {/* Total Listed Services Overview */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Active Services</label>
              <div className="h-10 rounded-md border border-input bg-muted/30 px-3 flex items-center justify-between text-sm">
                <span>{services.length} service(s) registered</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("services")}
                  className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                  View all →
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Link
              href="/dashboard/users"
              className="rounded-md border px-4 py-2 text-sm hover:bg-secondary"
            >
              Cancel
            </Link>
            <Button type="submit">Save Vendor Info</Button>
          </div>
        </form>
      )}
    </div>
  );
}
