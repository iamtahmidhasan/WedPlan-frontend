import Link from "next/link";
import { headers } from "next/headers";
import {
  Users,
  Store,
  UserCheck,
  Sparkles,
  Clock,
  CircleDollarSign,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { apiFetch } from "@/lib/core/server";
import { getPremiumById } from "@/lib/actions/getPremiumById";

export const metadata = {
  title: "Dashboard Overview | WedPlan",
  description: "WedPlan platform administration and role-based overview.",
};

type Service = {
  _id: string;
  vendorId?: string;
  status?: string;
};

type UserSummary = {
  _id?: string;
  role?: string;
};

type Booking = {
  _id?: string;
  customerId?: string;
  vendorId?: string;
  status?: string;
};

type Transaction = {
  _id?: string;
  amount?: number;
  status?: string;
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUser = session?.user;
  const role = (sessionUser as { role?: string } | undefined)?.role ?? "customer";

  const isAdmin = role === "admin";
  const isVendor = role === "vendor";

  // Data fetching based on role
  let users: UserSummary[] = [];
  let services: Service[] = [];
  let transactions: Transaction[] = [];
  let bookings: Booking[] = [];

  try {
    if (isAdmin) {
      const [usersRes, servicesRes, txRes] = await Promise.all([
        apiFetch("/users", { cache: "no-store" }).catch(() => null),
        apiFetch("/services", { cache: "no-store" }).catch(() => null),
        apiFetch("/transactions", { cache: "no-store" }).catch(() => null),
      ]);
      if (usersRes?.ok) users = await usersRes.json();
      if (servicesRes?.ok) services = await servicesRes.json();
      if (txRes?.ok) transactions = await txRes.json();
    } else if (isVendor) {
      const [servicesRes, bookingsRes] = await Promise.all([
        apiFetch("/services", { cache: "no-store" }).catch(() => null),
        apiFetch("/bookings", { cache: "no-store" }).catch(() => null),
      ]);
      if (servicesRes?.ok) {
        const allServices: Service[] = await servicesRes.json();
        services = allServices.filter((s) => s.vendorId === sessionUser?.id);
      }
      if (bookingsRes?.ok) bookings = await bookingsRes.json();
    } else {
      const bookingsRes = await apiFetch("/bookings", { cache: "no-store" }).catch(() => null);
      if (bookingsRes?.ok) bookings = await bookingsRes.json();
    }
  } catch (err) {
    console.error("Dashboard overview data fetch error:", err);
  }

  // Admin calculations
  const totalUsers = users.length;
  const totalVendors = users.filter((u) => u.role === "vendor").length;
  const totalCustomers = users.filter((u) => u.role === "customer" || !u.role).length;
  const totalServices = services.length;
  const pendingServices = services.filter((s) => (s.status ?? "pending") === "pending").length;
  const totalTransactions = transactions.length;

  // Vendor calculations
  const vendorPremium = isVendor
    ? await getPremiumById({ userId: sessionUser?.id ?? "" }).catch(() => null)
    : null;
  const activeServices = services.filter((s) => s.status === "approved").length;
  const vendorPendingBookings = bookings.filter((b) => (b.status ?? "pending") === "pending").length;
  const vendorAcceptedBookings = bookings.filter((b) => b.status === "accepted").length;

  // Customer calculations
  const customerTotalRequests = bookings.length;
  const customerPendingBookings = bookings.filter((b) => (b.status ?? "pending") === "pending").length;
  const customerAcceptedBookings = bookings.filter((b) => b.status === "accepted").length;
  const customerRejectedBookings = bookings.filter(
    (b) => b.status === "rejected" || b.status === "cancelled",
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {isAdmin
            ? "Admin Dashboard Overview"
            : isVendor
              ? "Vendor Dashboard Overview"
              : "Customer Dashboard Overview"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Platform management metrics, user directory, and service approvals."
            : isVendor
              ? "Manage your wedding service portfolio, booking requests, and tier."
              : "Review your wedding service booking requests and reservations."}
        </p>
      </div>

      {/* ADMIN OVERVIEW (6 Metrics as specified in Assignment 9) */}
      {isAdmin && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Total Users */}
            <div className="rounded-lg border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Registered Users</span>
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {totalUsers}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">Platform accounts</p>
              </div>
            </div>

            {/* 2. Total Vendors */}
            <div className="rounded-lg border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Vendors</span>
                <div className="rounded-md bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  <Store className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {totalVendors}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">Registered vendor businesses</p>
              </div>
            </div>

            {/* 3. Total Customers */}
            <div className="rounded-lg border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Customers</span>
                <div className="rounded-md bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                  <UserCheck className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {totalCustomers}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">Planning couples & clients</p>
              </div>
            </div>

            {/* 4. Total Services */}
            <div className="rounded-lg border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Services</span>
                <div className="rounded-md bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
                  <Sparkles className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {totalServices}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">Submitted platform services</p>
              </div>
            </div>

            {/* 5. Pending Services */}
            <div className="rounded-lg border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Pending Services</span>
                <div className="rounded-md bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  <Clock className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {pendingServices}
                </span>
                {pendingServices > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Needs Review
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Awaiting admin approval</p>
            </div>

            {/* 6. Total Transactions */}
            <div className="rounded-lg border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Transactions</span>
                <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  <CircleDollarSign className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {totalTransactions}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">Completed subscription upgrades</p>
              </div>
            </div>
          </div>

          {/* Admin Management Shortcuts */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/dashboard/users"
              className="group relative rounded-lg border border-border bg-card p-6 shadow-xs transition-colors hover:border-primary/50 hover:bg-secondary/40"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-md bg-primary/10 p-2.5 text-primary">
                  <Users className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground">Manage Users</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                View registered vendors and customers, block accounts, and toggle roles.
              </p>
            </Link>

            <Link
              href="/dashboard/services"
              className="group relative rounded-lg border border-border bg-card p-6 shadow-xs transition-colors hover:border-primary/50 hover:bg-secondary/40"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-md bg-primary/10 p-2.5 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground flex items-center gap-2">
                <span>Manage Services</span>
                {pendingServices > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {pendingServices}
                  </span>
                )}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Review submitted services, approve listings, and delete inappropriate content.
              </p>
            </Link>

            <Link
              href="/dashboard/transactions"
              className="group relative rounded-lg border border-border bg-card p-6 shadow-xs transition-colors hover:border-primary/50 hover:bg-secondary/40"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-md bg-primary/10 p-2.5 text-primary">
                  <CircleDollarSign className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground">Platform Transactions</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Track subscription upgrades, revenue records, and Stripe sessions.
              </p>
            </Link>
          </div>
        </>
      )}

      {/* VENDOR OVERVIEW */}
      {isVendor && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Total Services</span>
            <div className="mt-3 text-3xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Published listings</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Active Services</span>
            <div className="mt-3 text-3xl font-bold text-emerald-600">{activeServices}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Approved & visible to clients</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Pending Requests</span>
            <div className="mt-3 text-3xl font-bold text-amber-600">{vendorPendingBookings}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Awaiting your response</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Accepted Bookings</span>
            <div className="mt-3 text-3xl font-bold text-blue-600">{vendorAcceptedBookings}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Confirmed wedding events</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-xs sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Current Subscription Plan</span>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  {vendorPremium?.isPremium ? "Premium Plan (Active)" : "Free Plan (3 Services Limit)"}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {vendorPremium?.isPremium
                    ? "Unlimited service listings & priority customer placement."
                    : "Upgrade to Premium ($20 one-time) for unlimited service listings."}
                </p>
              </div>
              {!vendorPremium?.isPremium && (
                <Link
                  href="/premium"
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER OVERVIEW */}
      {!isAdmin && !isVendor && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Total Booking Requests</span>
            <div className="mt-3 text-3xl font-bold">{customerTotalRequests}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Submitted inquiries</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Pending Requests</span>
            <div className="mt-3 text-3xl font-bold text-amber-600">{customerPendingBookings}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Awaiting vendor review</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Accepted Bookings</span>
            <div className="mt-3 text-3xl font-bold text-emerald-600">{customerAcceptedBookings}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Confirmed reservations</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Rejected / Cancelled</span>
            <div className="mt-3 text-3xl font-bold text-muted-foreground">{customerRejectedBookings}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Inactive requests</p>
          </div>
        </div>
      )}
    </div>
  );
}
