"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  CalendarCheck,
  Bookmark,
  User,
  Menu,
  ArrowUpRight,
  ShieldCheck,
  Store,
  HeartHandshake,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export const commonNavigationItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarCheck,
    exact: false,
  },
  {
    name: "Bookmarks",
    href: "/dashboard/bookmarks",
    icon: Bookmark,
    exact: false,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
    exact: false,
  },
];

export const menuItemByRole = {
  admin: [
    {
      name: "Users",
      href: "/dashboard/users",
      icon: Users,
      exact: false,
    },
    {
      name: "Services",
      href: "/dashboard/services",
      icon: Sparkles,
      exact: false,
    },
  ],
  customer: [],
  vendor: [
    {
      name: "Services",
      href: "/dashboard/services",
      icon: Sparkles,
      exact: false,
    },
  ],
};

function getInitials(name?: string, email?: string): string {
  const source = name || email || "U";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface NavContentProps {
  onItemClick?: () => void;
  variant?: "card" | "sheet";
}

function NavigationContent({ onItemClick, variant = "card" }: NavContentProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role as
    | keyof typeof menuItemByRole
    | undefined;

  const roleItems =
    role && role in menuItemByRole
      ? menuItemByRole[role]
      : menuItemByRole.admin;

  const navigationItems = [
    commonNavigationItems[0],
    ...roleItems,
    ...commonNavigationItems.slice(1),
  ];

  const roleBadgeConfig = {
    admin: { label: "Admin Portal", icon: ShieldCheck },
    vendor: { label: "Vendor Portal", icon: Store },
    customer: { label: "Customer Portal", icon: HeartHandshake },
  };

  const currentRoleConfig =
    role && role in roleBadgeConfig
      ? roleBadgeConfig[role]
      : { label: "Dashboard", icon: LayoutDashboard };

  const RoleIcon = currentRoleConfig.icon;

  const isSheet = variant === "sheet";

  return (
    <div
      className={cn(
        "flex flex-col text-foreground",
        isSheet
          ? "h-full justify-between bg-card text-foreground"
          : "h-fit rounded-2xl border border-border/80 bg-card p-4 shadow-xs",
      )}
    >
      {/* Header Section */}
      <div
        className={cn(
          isSheet
            ? "border-b border-border p-5 pr-12"
            : "mb-4 border-b border-border/60 px-2 pb-4",
        )}
      >
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="group block space-y-1"
        >
          <div className="flex items-center gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              WedPlan
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <RoleIcon className="size-3.5" />
            <span>{currentRoleConfig.label}</span>
          </div>
        </Link>
      </div>

      {/* Main Menu Links */}
      <div
        className={cn(
          "space-y-1",
          isSheet && "flex-1 overflow-y-auto px-4 py-5",
        )}
      >
        <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-transform group-hover:scale-105",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Back to Website Link */}
        <div
          className={cn(
            isSheet ? "pt-4" : "mt-4 border-t border-border/60 pt-3",
          )}
        >
          <Link
            href="/"
            onClick={onItemClick}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <span>Back to Website</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* User Account Section */}
      {user && (
        <div
          className={cn(
            isSheet
              ? "border-t border-border bg-secondary/20 p-4"
              : "mt-3 border-t border-border/60 pt-3",
          )}
        >
          <Link
            href="/dashboard/profile"
            onClick={onItemClick}
            className="flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-secondary/60"
          >
            <Avatar className="size-8 ring-1 ring-border/50">
              {user.image && (
                <AvatarImage
                  src={user.image}
                  alt={user.name || "User"}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {user.name || "User"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header with Off-Canvas Trigger */}
      <header className="flex h-14 w-full items-center justify-between rounded-2xl border border-border/80 bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold">WedPlan</span>
          <span className="text-xs text-muted-foreground">Dashboard</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            aria-label="Open off-canvas navigation menu"
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-4" />
          </SheetTrigger>
          {/* Off-Canvas Sheet Drawer */}
          <SheetContent
            side="left"
            className="w-[300px] border-r border-border bg-card p-0 sm:max-w-xs"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Off-Canvas Dashboard Navigation</SheetTitle>
            </SheetHeader>
            <NavigationContent
              variant="sheet"
              onItemClick={() => setIsOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Floating Card Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block lg:sticky lg:top-8">
        <NavigationContent variant="card" />
      </aside>
    </>
  );
}
