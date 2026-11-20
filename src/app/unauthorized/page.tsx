import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized | WedPlan",
  description: "You don't have permission to access this page.",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="size-7" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Access denied
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You don&apos;t have permission to view this page. Use the links below
          to head back to a page available for your account.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/services"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </main>
  );
}
