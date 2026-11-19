import type { ReactNode } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { checkIsUserBlocked } from "@/lib/user-status";
import { Header } from "@/components/header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export const metadata = {
  title: "Dashboard | WedPlan",
  description: "WedPlan administration dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isBlocked = await checkIsUserBlocked(session?.user);

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Header mode="solid" />
        <div className="pt-16">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg flex-col items-center justify-center p-6 text-center">
            <div className="w-full rounded-2xl border border-destructive/20 bg-card p-8 shadow-sm">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="size-7" />
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Account Suspended
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Your account has been blocked by an administrator. You do not have permission to view or perform any actions on the dashboard.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-5 text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header mode="solid" />
      <div className="pt-16">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start lg:p-8">
          <DashboardSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
