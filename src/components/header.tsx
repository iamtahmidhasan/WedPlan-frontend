"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
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
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export type HeaderMode = "solid" | "overlay";

const navigation = [
  { label: "Discover", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Vendors", href: "/#vendors" },
  { label: "Bookings", href: "/#bookings" },
  { label: "Saved", href: "/#saved" },
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-full p-1 text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring",
          isTransparent &&
            "max-lg:text-white max-lg:hover:bg-white/10 max-lg:focus-visible:ring-white"
        )}
        aria-label={`Open account menu for ${displayName}`}
      >
        <Avatar>
          {user.image && (
            <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-0.5">
            <span className="block truncate text-foreground">{displayName}</span>
            {user.name && (
              <span className="block truncate font-normal">{user.email}</span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onClick={onSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut aria-hidden="true" />
          {isSigningOut ? "Signing out…" : "Sign out"}
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
        isTransparent ? "bg-white/30" : "bg-muted"
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

function DesktopNavigation() {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {navigation.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary">
      <ul className="space-y-1">
        {navigation.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="block rounded-md px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          </li>
        ))}
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

  const isTransparent = mode === "overlay" && !isScrolled && !isMenuOpen;
  const user = session?.user;

  async function handleSignOut() {
    setSignOutError("");
    setIsSigningOut(true);

    const result = await signOut();

    if (result.error) {
      setSignOutError(
        result.error.message || "We couldn’t sign you out. Please try again."
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
            : "border-border bg-background"
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-6 sm:px-10 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            aria-label="WedPlan home"
            className={cn(
              "font-heading text-3xl tracking-[-0.04em] outline-none focus-visible:ring-2 lg:justify-self-start",
              isTransparent
                ? "text-white focus-visible:ring-white"
                : "text-foreground focus-visible:ring-ring"
            )}
          >
            WedPlan
          </Link>

          <DesktopNavigation />

          <div className="flex items-center gap-2 lg:justify-self-end">
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
                    "max-lg:text-white max-lg:hover:bg-white/10 max-lg:focus-visible:ring-white"
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
              <SheetContent
                side="top"
                overlayClassName="top-16"
                showCloseButton={false}
                className="!top-16 !bottom-0 !left-0 !right-0 !h-[calc(100dvh-4rem)] w-full max-w-none border-b-0 p-0 lg:hidden"
              >
                <SheetHeader className="border-b border-border px-6 py-5 text-left">
                  <SheetTitle className="font-heading text-2xl">WedPlan</SheetTitle>
                  <SheetDescription>
                    Make room for the good part.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 px-6 py-8">
                  <NavigationLinks onNavigate={() => setIsMenuOpen(false)} />
                </div>
                {!isPending && !user && (
                  <div className="border-t border-border px-6 py-6">
                    <AuthActions
                      className="grid sm:flex"
                      onNavigate={() => setIsMenuOpen(false)}
                    />
                  </div>
                )}
              </SheetContent>
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
