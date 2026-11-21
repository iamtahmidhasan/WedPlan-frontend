"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavigationContent } from "@/components/dashboard/dashboard-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export type HeaderMode = "solid" | "overlay";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "Vendors", href: "/vendors" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

type User = NonNullable<ReturnType<typeof useSession>["data"]>["user"];

type AccountMenuProps = {
  user: User;
  isSigningOut: boolean;
  isTransparent: boolean;
  onSignOut: () => void;
};

function AccountMenu({
  user,
  isSigningOut,
  isTransparent,
  onSignOut,
}: AccountMenuProps) {
  const displayName = user?.name || user?.email || "Your account";
  const initials = getInitials(user?.name || user?.email || "U");
  const role = (user as { role?: string })?.role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-full p-1 text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
          isTransparent &&
            "max-lg:text-white max-lg:hover:bg-white/10 max-lg:focus-visible:ring-white",
        )}
        aria-label={`Open account menu for ${displayName}`}
      >
        <Avatar
          className={cn(
            "size-9 transition-transform hover:scale-105",
            (user as { isPremium?: boolean }).isPremium
              ? "ring-2 ring-amber-400"
              : "ring-1 ring-border",
          )}
        >
          {user.image && (
            <AvatarImage
              src={user.image}
              alt={displayName}
              referrerPolicy="no-referrer"
            />
          )}
          <AvatarFallback className="text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-0.5 px-2 py-1.5 font-normal">
            <div className="flex items-center justify-between gap-2">
              <span className="block truncate font-semibold text-foreground text-sm">
                {displayName}
              </span>
              {role && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary capitalize shrink-0">
                  {role}
                </span>
              )}
            </div>
            {user.name && user.email && (
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuItem>
          <Link href="/dashboard" className="flex w-full items-center gap-2.5">
            <LayoutDashboard className="size-4 text-muted-foreground" />
            <span className="text-sm">Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href="/dashboard/profile"
            className="flex w-full items-center gap-2.5"
          >
            <UserIcon className="size-4 text-muted-foreground" />
            <span className="text-sm">Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuItem
          disabled={isSigningOut}
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 px-2 py-1.5 text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="text-sm">
            {isSigningOut ? "Logging out…" : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LoadingAccount({ isTransparent }: { isTransparent: boolean }) {
  return (
    <div
      className={cn(
        "size-9 rounded-full motion-safe:animate-pulse motion-reduce:animate-none",
        isTransparent ? "bg-white/30" : "bg-muted",
      )}
      aria-label="Loading account"
      role="status"
    />
  );
}

type AuthActionsProps = {
  onNavigate?: () => void;
  className?: string;
};

function AuthActions({ onNavigate, className }: AuthActionsProps) {
  return (
    <div className={cn("gap-2", className)}>
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className="flex h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-border px-4 text-sm font-medium text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring lg:flex-none"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        onClick={onNavigate}
        className="flex h-9 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring lg:flex-none"
      >
        Sign up
      </Link>
    </div>
  );
}

function DesktopNavigation({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {navigation.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function NavigationLinks({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav aria-label="Primary">
      <ul className="space-y-1">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Header({ mode = "solid" }: { mode?: HeaderMode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setIsScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  const isTransparent = mode === "overlay" && !isScrolled && !isMenuOpen;
  const user = session?.user;

  async function handleSignOut() {
    setSignOutError("");
    setIsSigningOut(true);

    const result = await signOut();

    if (result.error) {
      setSignOutError(
        result.error.message || "We couldn’t sign you out. Please try again.",
      );
      setIsSigningOut(false);
      return;
    }

    router.replace("/sign-in");
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-16 border-b transition-colors duration-300",
          isTransparent
            ? "border-transparent bg-transparent"
            : "border-border bg-background",
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-6 sm:px-10 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-2 lg:justify-self-start">
            <Link
              href="/"
              aria-label="WedPlan home"
              className={cn(
                "font-heading text-3xl tracking-[-0.04em] outline-none focus-visible:ring-2",
                isTransparent
                  ? "text-white focus-visible:ring-white"
                  : "text-foreground focus-visible:ring-ring",
              )}
            >
              WedPlan
            </Link>
            {isDashboard && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Dashboard
              </span>
            )}
          </div>

          <DesktopNavigation pathname={pathname} />

          <div className="flex items-center gap-2 lg:justify-self-end">
            <ThemeToggle isTransparent={isTransparent} />

            {isPending ? (
              <LoadingAccount isTransparent={isTransparent} />
            ) : user ? (
              <AccountMenu
                user={user}
                isSigningOut={isSigningOut}
                isTransparent={isTransparent}
                onSignOut={handleSignOut}
              />
            ) : (
              <AuthActions className="hidden items-center lg:flex" />
            )}

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger
                className={cn(
                  "flex size-10 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring lg:hidden",
                  isTransparent &&
                    "max-lg:text-white max-lg:hover:bg-white/10 max-lg:focus-visible:ring-white",
                )}
                aria-label={
                  isMenuOpen ? "Close navigation menu" : "Open navigation menu"
                }
              >
                {isMenuOpen ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <Menu className="size-5" aria-hidden="true" />
                )}
              </SheetTrigger>
              {isDashboard ? (
                <SheetContent
                  side="left"
                  className="w-[300px] border-r border-border bg-card p-0 sm:max-w-xs lg:hidden"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Off-Canvas Dashboard Navigation</SheetTitle>
                  </SheetHeader>
                  <NavigationContent
                    variant="sheet"
                    onItemClick={() => setIsMenuOpen(false)}
                  />
                </SheetContent>
              ) : (
                <SheetContent
                  side="top"
                  overlayClassName="top-16"
                  showCloseButton={false}
                  className="!top-16 !bottom-0 !left-0 !right-0 !h-[calc(100dvh-4rem)] w-full max-w-none border-b-0 p-0 lg:hidden flex flex-col justify-between"
                >
                  <div>
                    <SheetHeader className="border-b border-border px-6 py-5 text-left">
                      <SheetTitle className="font-heading text-2xl">
                        WedPlan
                      </SheetTitle>
                      <SheetDescription>
                        A calmer way to plan your celebration.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="px-6 py-6">
                      <NavigationLinks
                        pathname={pathname}
                        onNavigate={() => setIsMenuOpen(false)}
                      />
                    </div>
                  </div>

                  {!isPending && user && (
                    <div className="border-t border-border px-6 py-5 space-y-3 bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 ring-1 ring-border">
                          {user.image && (
                            <AvatarImage
                              src={user.image}
                              alt={user.name || "User"}
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <AvatarFallback className="text-xs font-semibold">
                            {getInitials(user.name || user.email || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-sm text-foreground">
                            {user.name || user.email}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-1 pt-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                        >
                          <LayoutDashboard className="size-4 text-muted-foreground" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                        >
                          <UserIcon className="size-4 text-muted-foreground" />
                          <span>Profile Settings</span>
                        </Link>
                        <button
                          type="button"
                          disabled={isSigningOut}
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleSignOut();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <LogOut className="size-4" />
                          <span>
                            {isSigningOut ? "Logging out…" : "Logout"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!isPending && !user && (
                    <div className="border-t border-border px-6 py-6">
                      <AuthActions
                        className="grid sm:flex"
                        onNavigate={() => setIsMenuOpen(false)}
                      />
                    </div>
                  )}
                </SheetContent>
              )}
            </Sheet>
          </div>
        </div>
      </header>

      {signOutError && (
        <p className="sr-only" role="alert">
          {signOutError}
        </p>
      )}
    </>
  );
}
