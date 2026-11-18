import Link from "next/link";
import { Users, Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Dashboard Overview | WedPlan",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to the WedPlan management portal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <h2 className="mt-4 font-semibold text-foreground">User Management</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            View registered users, status, emails, and credentials.
          </p>
        </Link>

        <Link
          href="/services"
          className="group relative rounded-lg border border-border bg-card p-6 shadow-xs transition-colors hover:border-primary/50 hover:bg-secondary/40"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-md bg-primary/10 p-2.5 text-primary">
              <Sparkles className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <h2 className="mt-4 font-semibold text-foreground">Service Catalog</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Browse wedding venues, florists, caterers, and vendors.
          </p>
        </Link>
      </div>
    </div>
  );
}
